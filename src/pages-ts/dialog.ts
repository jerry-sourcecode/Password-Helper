let toastIdCounter = 0;

function mkDialog(title: string, message: string, option: Array<string> = ["确定"], isStatic: boolean = false): Promise<Number>{
    const modalDiv = document.querySelector("#modal") as HTMLDivElement;
    let optionHTML = "";
    for(let i = 0; i < option.length; i++){
        optionHTML += `<button type="button" class="btn btn-primary" data-bs-dismiss="modal" id="modalOption${i}">${option[i]}</button>`;
    }
    modalDiv.innerHTML = `
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">${title}</h5>
            </div>
            <div class="modal-body">
                <p>${message}</p>
            </div>
            <div class="modal-footer">
                ${optionHTML}
            </div>
        </div>
    </div>
    `
    let myModal: bootstrap.Modal;
    if (isStatic) myModal = new bootstrap.Modal(modalDiv, {backdrop: "static"});
    else myModal = new bootstrap.Modal(modalDiv);
    myModal.show();
    return new Promise((resolve, reject) => {
        for(let i = 0; i < option.length; i++){
            document.querySelector(`#modalOption${i}`)?.addEventListener("click", () => {
                myModal.hide();
                resolve(i);
            });
        }
    });
}
function mkToast(title: string, subtitle: string, message: string, optionName: Array<string> = []){
    const id = toastIdCounter++;
    let optionHTML = "";
    for(let i = 0; i < optionName.length; i++){
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
        for(let i = 0; i < optionName.length; i++){
            document.querySelector(`#toastOption${i}-${id}`)?.addEventListener("click", () => {
                tt.hide();
                resolve(i);
            });
        }
    });
}