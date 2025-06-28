/**
 * 交互逻辑，提供对话框和Toast的功能
 */

type DialogArgs = Parameters<typeof _showDialog>
let toastIdCounter = 0;
let dialogActive = false;

const dialogQueue: Array<{
    args: DialogArgs;
    res: (v: any) => void;
    rej: (reason: any) => void;
}> = [];
/**
 * 在顶部显示一个对话框
 * @param title 标题
 * @param message 信息
 * @param option 选项，一个字符串列表，每一个字符串表示一个选项，默认为仅确定
 * @param flag 选项参数
 * @param flag.isStatic 是否是静态的（静态指无法通过点击其他区域来关闭对话框）默认为否
 * @param flag.otherHTML 额外附加的HTML文本
 * @param flag.otherAction 额外附加的行动，将在渲染完成后执行的回调函数
 * @param flag.defaultOption 默认选项的索引，-1（默认）表示没有默认选项，在用户按下回车后会自动被选择
 * @returns 如果用户点击了按钮，返回用户的选项在option中的索引，否则返回-1
 */
function mkDialog(...args: DialogArgs): Promise<number> {
    return new Promise((res, rej) => {
        dialogQueue.push({ args, res, rej });
        _processDialog();
    });
}
function _showDialog(
    title: string,
    message: string,
    option: Array<string> = ["确定"],
    flag: {
        isStatic?: boolean,
        defaultOption?: number,
        otherHTML?: string,
        otherAction?: () => void
    } = {}
): Promise<Number> {
    const { isStatic = false, otherHTML = "", otherAction = () => { }, defaultOption = -1 } = flag;
    const modalDiv = document.querySelector("#modal") as HTMLDivElement;
    let optionHTML = "";
    for (let i = 0; i < option.length; i++) {
        optionHTML += `<button type="button" class="btn btn-primary ${defaultOption === i ? "active" : ""}" data-bs-dismiss="modal" id="modalOption${i}">${option[i]}</button>`;
    }
    modalDiv.innerHTML = `
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">${title}</h5>
            </div>
            <div class="modal-body">
                <p>${message}</p>
                ${otherHTML}
            </div>
            <div class="modal-footer">
                ${optionHTML}
            </div>
        </div>
    </div>
    `
    let myModal: bootstrap.Modal;
    if (isStatic) myModal = new bootstrap.Modal(modalDiv, { backdrop: "static" });
    else myModal = new bootstrap.Modal(modalDiv);
    myModal.show();
    modalDiv.addEventListener("shown.bs.modal", otherAction);
    modalDiv.addEventListener("keydown", (e) => {
        if (e.key == "Enter" && !e.isComposing) {
            modalDiv.dispatchEvent(new Event("typeEnterKey"));
        }
    })
    return new Promise((resolve, reject) => {
        for (let i = 0; i < option.length; i++) {
            document.querySelector(`#modalOption${i}`)?.addEventListener("click", () => {
                resolve(i);
            });
            modalDiv.addEventListener("typeEnterKey", () => {
                if (defaultOption != -1 && defaultOption < option.length) {
                    resolve(defaultOption);
                }
            })
        }
        modalDiv.addEventListener("hidden.bs.modal", () => {
            resolve(-1);
        })
        modalDiv.addEventListener("hide.bs.modal", () => {
            // 解决可访问性问题
            if (document.activeElement && modalDiv.contains(document.activeElement)) {
                (document.activeElement as HTMLElement).blur();
            }
        });
    });
}

function _processDialog(): void {
    if (dialogQueue.length === 0) {
        dialogActive = false;
        return;
    }
    if (dialogActive) {
        return;
    }
    dialogActive = true;
    const { args, res, rej } = dialogQueue[0];
    _showDialog(...args)
        .then((result) => {
            res(result);
            dialogQueue.shift()
            dialogActive = false;
            return _processDialog();
        }, (err) => {
            rej(err);
            dialogQueue.shift()
            dialogActive = false;
            return _processDialog();
        })
}

/**
 * 在右下角显示一个Toast
 * @param title 标题
 * @param subtitle 副标题
 * @param message 信息
 * @param optionName 选项，一个字符串列表，每一个字符串表示一个选项
 * @returns  如果用户点击了按钮，返回用户的选项在option中的索引，否则promise将始终不会被兑现
 */
function mkToast(title: string, subtitle: string, message: string, optionName: Array<string> = []) {
    const id = toastIdCounter++;
    let optionHTML = "";
    for (let i = 0; i < optionName.length; i++) {
        optionHTML += `<button type="button" class="btn btn-primary" data-bs-dismiss="toast" id="toastOption${i}-${id}">${optionName[i]}</button>`;
    }
    const toastDiv = document.querySelector("div#toasts") as HTMLDivElement;
    const toast = document.createElement('div');
    toast.innerHTML = `
    <div class="toast" role="alert" aria-live="assertive" aria-atomic="true" id="taskToast-${id}" style="width: 25rem;">
        <div class="toast-header">
            <strong class="me-auto">${title}</strong>
            <small>${subtitle}</small>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            ${message}
            ${optionHTML}
        </div>
    </div>
    `;
    toastDiv.appendChild(toast);
    const tt = new bootstrap.Toast(document.querySelector(`#taskToast-${id}`)!);
    tt.show();
    return new Promise((resolve, reject) => {
        for (let i = 0; i < optionName.length; i++) {
            document.querySelector(`#toastOption${i}-${id}`)?.addEventListener("click", () => {
                tt.hide();
                resolve(i);
            });
        }
    });
}