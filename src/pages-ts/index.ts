/**
 * 一些操作函数和变量
 * 主函数定义在此
 */

/**
 * @class 加密函数静态库
 */
class Cryp {
    /**
     * AES加密函数
     * @param data 加密的文字
     * @param key 密钥
     * @returns 加密结果
     * @memberof Cryp
     */
    static encrypt(data: string, key: string): string {
        let k = CryptoJS.AES.encrypt(data, key).toString(CryptoJS.format.OpenSSL);
        return k;
    }
    /**
     * AES解密函数
     * @param data 被加密的文字
     * @param key 密钥
     * @returns 解密结果
     * @memberof Cryp
     */
    static decrypt(data: string, key: string): string {
        if (!data) throw new Error("数据不能为空");
        const bytes = CryptoJS.AES.decrypt(data, key);
        const UTF8String = bytes.toString(CryptoJS.enc.Utf8);
        return UTF8String;
    }
    /**
     * pbkdf2加密函数
     * @param data 数据
     * @param salt 盐值
     * @returns 加密后的数据
     * @memberof Cryp
     */
    static pbkdf2(data: string, salt: string = ""): string {
        return CryptoJS.PBKDF2(data, salt, {
            keySize: 256 / 32,
            iterations: 10,
            hasher: CryptoJS.algo.SHA256
        }).toString(CryptoJS.enc.Hex);
    }
}

const whitelistAttributes = ["type", "cachePwd"];

function encrypt(data: Item | Task, key: string, except: string[] = []): Item | Task { // 加密
    let enc: Item | Task;
    if (data.type == Type.Password) enc = new Password(data as Password);
    else if (data.type == Type.Folder) {
        enc = new Folder(data as Folder);
        enc.cachePwd = null;
    }
    else enc = new Task(data as Task);
    let keyList: Array<keyof (Item | Task)> = <Array<keyof (Item | Task)>>Object.keys(data);
    keyList.sort();
    for (let v of keyList) {
        if (whitelistAttributes.indexOf(v) !== -1 || except.indexOf(v) !== -1) continue;
        if (data[v] === null) {
            (enc as any)[v] = null
        } else if (typeof data[v] === "string") {
            (enc as any)[v] = Cryp.encrypt(data[v], key)
        } else if (typeof data[v] === "number") {
            (enc as any)[v] = Cryp.encrypt((<number>data[v]).toString(), key)
        } else if (typeof data[v] === "object" && (<Folder>data[v]).type == Type.Folder) {
            (enc as any)[v] = new Folder(<Folder>encrypt(data[v], key, except));
        } else {
            console.error("未知类型");
        }
    }
    return enc;
}
function decrypt(data: Item | Task, key: string, except: string[] = []): Item | Task { // 解密
    let dec: Item | Task;
    if (data.type == Type.Password) dec = new Password(data as Password);
    else if (data.type == Type.Folder) dec = new Folder(data as Folder);
    else dec = new Task(data as Task);
    let keyList: Array<keyof (Item | Task)> = <Array<keyof (Item | Task)>>Object.keys(data);
    keyList.sort();
    for (let v of keyList) {
        if (whitelistAttributes.indexOf(v) !== -1 || except.indexOf(v) !== -1) continue;
        if (data[v] === null) {
            (dec as any)[v] = null
        } else if (typeof data[v] === "string") {
            (dec as any)[v] = Cryp.decrypt(data[v], key)
        } else if (typeof data[v] === "number") {
            (dec as any)[v] = Cryp.decrypt((<number>data[v]).toString(), key)
        } else if (typeof data[v] === "object" && (<Folder>data[v]).type == Type.Folder) {
            (dec as any)[v] = new Folder(<Folder>decrypt(data[v], key, except));
        } else {
            console.error("未知类型");
        }
    }
    return dec;
}

/** 添加密码按钮 */
let addBtn = document.querySelector("#addPwd");
/** main界面 */
const content = document.querySelector("#contentDiv");
const main = document.querySelector("#mainDiv");
/** 密码列表 */
let pwdList: Array<Password> = [];
/**密码库名称 */
let repoName = "untitled";
/** 回收站的密码列表 */
let binItem: Array<Item> = [];
/** 文件夹列表 */
let folderList: Array<Folder> = [];
/** 主密码 */
let mainPwd: string = "";
/** 是否记住密码 */
let isremember: boolean = false;
/** 是否正在编辑文件夹 */
let folderIsEditing: boolean = false;
/** 当前所处路径 */
let currentFolder: Folder = Folder.root();
/** 当前复制的密码/文件夹 */
let clipboard: Set<clipboardItem> = new Set();
/** 设置对象 */
let mainSetting: MainSetting = new MainSetting();
/** 获得的经验 */
let score: number = 0;
/** 目前等级 */
let level: number = 1;
/** 待完成的任务 */
let DONETasks: Array<TaskMap> = [];
/** 需要完成的任务 */
let NEEDTODO: Array<TaskMap> = [];
/** 搜索设置的记忆 */
let searchMemory: {
    /** 当前搜索框中的文本内容，随着用户的输入实时更新 */
    txt: string,
    /** 上一次搜索的文字，如果没有上一次则为null */
    lastSearchTxt: string | null,
    /** 搜索设置 */
    setting: {
        isReg: boolean,
        isCaseSensitive: boolean,
        searchFrom: boolean,
        searchUname: boolean,
        searchPwd: boolean,
        searchPhone: boolean,
        searchEmail: boolean,
        searchNote: boolean,
        searchFolder: boolean,
        startDate: number | null, // 搜索开始时间
        endDate: number | null, // 搜索结束时间
    };
} = {
    txt: "",
    lastSearchTxt: null,
    setting: {
        isReg: false,
        isCaseSensitive: true,
        searchFrom: true,
        searchUname: true,
        searchPwd: true,
        searchPhone: true,
        searchEmail: true,
        searchNote: true,
        searchFolder: true,
        startDate: null, // 搜索开始时间
        endDate: null, // 搜索结束时间
    }
};
/** 页面滚动位置的记忆 */
type PagePosition = { top: number, left: number };
let pagePos: {
    home: PagePosition,
    main: PagePosition,
    mainDir: Folder,
    setting: PagePosition,
    bin: PagePosition,
    search: PagePosition,
} = {
    home: { top: 0, left: 0 },
    main: { top: 0, left: 0 },
    mainDir: Folder.root(),
    setting: { top: 0, left: 0 },
    bin: { top: 0, left: 0 },
    search: { top: 0, left: 0 },
};
/** 注册时间 */
let signUpTime: string = Date.now().toString();
/**被记录的UMC文件地址 */
let umcFilePaths: Array<string> = [];
/**当前UMC文件地址 */
let curPath: string = "";

type RepoMap = { name: string, path: string }

// 一些工具函数
/**
 * 得到可读的时间格式
 * @param time 时间
 * @returns 可读的时间格式
 */
function getReadableTime(time: Date | string): string {
    if (typeof time === "string") time = new Date(Number(time));
    let minite = time.getMinutes(), strminite: string = minite.toString();
    if (minite < 10) strminite = "0" + minite;
    let sec = time.getSeconds(), strsec: string = sec.toString();
    if (sec < 10) strsec = "0" + sec;
    return time.getFullYear() + "/" + (time.getMonth() + 1) + "/" + time.getDate() + " " + time.getHours() + ":" + strminite + ":" + strsec;
}
/**
 * 检查文件夹是否存在
 * @param path 文件夹路径
 * @param name 文件夹名称
 * @param exceptIndex 排除的索引
 * @returns 是否存在
 */
function hasDir(path: string, name: string, exceptIndex: Array<number> = []): boolean {
    for (let i = 0; i < folderList.length; i++) {
        if (folderList[i].name == name && folderList[i].getParent().stringify() == path && exceptIndex.indexOf(i) == -1) {
            return true;
        }
    }
    return false;
}
/**
 * 递归创建文件夹
 * @param dir 文件夹路径
 * @param noCheck 是否检查用户组
 */
function mkdir(dir: Folder, noCheck: boolean = false): boolean { // 创建文件夹
    if (dir.isSystemFolder()) return true;
    let parent = dir.getParent();
    if (folderList.findIndex(v => v.isSame(dir)) != -1 || dir.isSame(Folder.root())) {
        return true; // 文件夹已存在
    }
    // 检查用户组
    if (!getCurrentUserGroup().permission.canAddFolder(folderList.length) && !noCheck) {
        mkDialog("权限不足", "你没有权限添加更多文件夹。当前允许添加的文件夹数量为" + getCurrentUserGroup().permission.folderNum + "。");
        return false;
    }
    if (folderList.findIndex(v => v.isSame(parent)) == -1 && !parent.isSystemFolder()) {
        mkdir(parent);
    }
    folderList.push(dir);
    saveData();
    return true;
}
/**
 * 获取当前页面的滚动位置
 */
function updatePos(): void {
    if (currentFolder.isSame(Folder.bin())) {
        pagePos.bin = getScroll();
    } else if (currentFolder.isSame(Folder.home())) {
        pagePos.home = getScroll();
    } else if (currentFolder.isSame(Folder.setting())) {
        pagePos.setting = getScroll();
    } else if (currentFolder.isSame(Folder.search())) {
        pagePos.search = getScroll();
    } else if (currentFolder.isin(Folder.root())) {
        pagePos.main = getScroll();
    }
}

function init(dir: Folder, checkable: boolean = false): void {
    saveData();
    update(dir, checkable);
}
/**
 * 移动一个密码/文件夹到另一个文件夹
 * @param type 类型
 * @param index 在对应列表的索引
 * @param dir_to 目标文件夹
 * @param isCopy 是否保留源文件
 */
function moveItem(type: Type, index: number, dir_to: Folder, isCopy: boolean = false): void {
    // 判断用户组
    if (!getCurrentUserGroup().permission.canMove) {
        mkDialog("权限不足", "你没有权限移动文件。");
        return;
    }
    if (type == Type.Password) {
        if (isCopy) {
            // 判断用户组
            if (!getCurrentUserGroup().permission.canAddPwd(pwdList.length)) {
                mkDialog("权限不足", "你没有权限添加更多密码。当前允许添加的密码数量为" + getCurrentUserGroup().permission.pwdNum + "。");
                return;
            }
            pwdList[pwdList.push(new Password(pwdList[index])) - 1].setParent(new Folder(dir_to));
        }
        else pwdList[index].setParent(dir_to);
    } else {
        // 检查权限
        if (dir_to.lock !== null && dir_to.cachePwd === null) {
            mkDialog("移动失败！", `目标文件夹“${dir_to.name}”已加密，请解密后重试。`);
            return;
        }
        if (hasDir(dir_to.stringify(), folderList[index].name)) {
            mkDialog("移动失败！", `“${folderList[index].name}”已存在。`);
            return;
        }
        let newFolder = new Folder(folderList[index]);
        newFolder.setParent(dir_to);
        if (newFolder.isin(folderList[index])) {
            mkDialog("移动失败！", `目标文件夹“${folderList[index].name}”是源文件夹的子文件夹。`);
            return;
        }
        folderList.forEach((item, idx) => {
            if (folderList[index].isInclude(item)) {
                moveItem(Type.Folder, idx, Folder.fromString(dir_to.stringify() + folderList[index].name), isCopy);
            }
        });
        pwdList.forEach((item, idx) => {
            if (folderList[index].isInclude(item)) {
                moveItem(Type.Password, idx, Folder.fromString(dir_to.stringify() + folderList[index].name), isCopy);
            }
        });
        if (isCopy) {
            const newFolder = new Folder(folderList[index]);
            newFolder.setParent(dir_to);
            mkdir(newFolder);
        } else {
            folderList[index].setParent(dir_to);
            mkdir(folderList[index]);
        }
    }
}
/**
 * 尝试完成一些任务
 * @param isAppend 是否是添加密码
 * @param index 被修改的密码的索引
 */
function doneMkPwd(isAppend: boolean = false, index: number = -1): void {
    if (isAppend) {
        Task.tryDone("初出茅庐");
        Task.tryDone("好事成双");
    } else {
        Task.tryDone("密码的产后护理");
    }
    if (checkSafety(index) == "")
        Task.tryDone("安全密码养成记");
}
/**
 * 读取主进程提供的参数
 * @returns 参数对象
 */
function getInitDataSync(): { path?: string } {
    const arg = window.electronAPI.getArgs().find(arg => arg.startsWith('--repoPath='));
    if (arg) {
        return { path: arg.replace('--repoPath=', '') };
    }
    return {};
}
/**
 * 渲染编辑密码界面，并更改密码
 * @param by 密码列表
 * @param index 密码列表中目标项的索引
 * @param dir 从什么文件夹来到的这个页面
 * @param isAppend 表示是否是添加密码，为true时，取消将会删除该密码，并返回main界面
 */
function changePwd(by: Array<Password>, index: number, dir: Folder, isAppend: boolean = false): void {
    if (!isAppend) {
        updatePos();
        currentFolder = Folder.change();
    }
    removeTips();
    let inner: string = `
    <div class="title">${isAppend ? `添加密码` : `编辑密码`}</div>
    <div class="form">
    <div class="formItem"><label for="from">来源<span style="color:red;">*</span>：</label><input type="text" id="from" class="${by[index].from == "" ? "invaild" : "vaild"}" value="${by[index].from}" /><span class="check"></span></div>
    <div class="formItem"><label for="uname">用户名<span style="color:red;">*</span>：</label><input type="text" id="uname" class="${by[index].uname == "" ? "invaild" : "vaild"}" value="${by[index].uname}" /><span class="check"></span></div>
    <div class="formItem"><label for="pwd">密码<span style="color:red;">*</span>：</label><input type="text" id="pwd" class="${by[index].pwd == "" ? "invaild" : "vaild"}" value="${by[index].pwd}" /><span class="check"></span></div>
    <div class="formItem"><p class="icon" style="margin-left: 0;" id="randpwd">随机生成一个高强度的密码</p></div>
    <div class="formItem"><label for="email">邮箱：</label><input type="text" id="email" value="${by[index].email}"></div>
    <div class="formItem"><label for="phone">手机号：</label><input type="text" id="phone" value="${by[index].phone}"></div>
    <div class="formItem_Copy"><p>修改时间：${getReadableTime(by[index].moDate)}</p></div>
    <div class="formItem"><label for="note">备注：</label><br><textarea id="note" placeholder="可以在这里输入一些想说的话。">${by[index].note}</textarea></div>
    </div>
    <div class="action" id="submit"><p>提交</p></div>
    <div class="action" id="cancel"><p>取消</p></div>
    `
    content!.innerHTML = inner;
    let require: Array<string> = ["#from", "#pwd", "#uname"];
    for (let i = 0; i < require.length; i++) {
        const it = document.querySelector(require[i]) as HTMLInputElement;
        it?.addEventListener("input", () => {
            if (it.value == "") {
                it.classList.add("invaild");
                it.classList.remove("vaild");
            } else {
                it.classList.add("vaild");
                it.classList.remove("invaild");
            }
        });
    }
    const rd = document.querySelector("#randpwd");
    rd?.addEventListener("click", () => {
        const pwd = document.querySelector("#pwd") as HTMLInputElement;
        pwd.value = randstr(16);
        pwd.dispatchEvent(new Event("input"));
    });
    document.querySelector("#submit")?.addEventListener("click", () => {
        let name = (document.querySelector("#from") as HTMLInputElement).value;
        let uname = (document.querySelector("#uname") as HTMLInputElement).value;
        let pwd = (document.querySelector("#pwd") as HTMLInputElement).value;
        let email = (document.querySelector("#email") as HTMLInputElement).value;
        let phone = (document.querySelector("#phone") as HTMLInputElement).value;
        let note = (document.querySelector("#note") as HTMLTextAreaElement).value;
        if (name == "" || uname == "" || pwd == "") {
            mkDialog("提交失败！", "来源、用户名和密码不能为空。");
            return;
        }
        const dir = by[index].getParent();
        by[index] = new Password(name, uname, pwd, note, email, phone, dir);
        doneMkPwd(isAppend, index);
        init(dir);
    });
    document.querySelector("#cancel")?.addEventListener("click", () => {
        if (isAppend) {
            by.splice(index, 1);
        }
        update(dir);
    });
}
/**
 * 删除一个密码/文件夹
 * @param type 类型
 * @param index 目标在对应列表的索引
 * @param dir_from 来源文件夹
 * @param _save 此选项请保持默认，不应被填写
 * @error 可能会因为权限问题而导致报错
 */
function deleteItem(type: Type, index: number, dir_from: Folder, _save: boolean = true): void {
    if ((type == Type.Folder && folderList[index].isLocked()) || (type == Type.Password && pwdList[index].isLocked())) {
        throw new Error("Can't delete item. The item is locked.");
    }
    if (type == Type.Password) {
        Task.tryDone("密码清理，双倍给力！");
        clipboard.delete({ type: Type.Password, index: index });
        pwdList[index].setParent(Folder.fromString(Folder.bin().stringify() + pwdList[index].getParent().stringify().slice(2)));
        pwdList[index].rmDate = Date.now().toString();
        binItem.unshift(new Password(pwdList[index]));
        pwdList.splice(index, 1);
    } else {
        clipboard.delete({ type: Type.Folder, index: index });
        pwdList.forEach((item, i) => {
            if (folderList[index].isInclude(item)) {
                deleteItem(Type.Password, i, dir_from, false);
            }
        })
        folderList.forEach((item, i) => {
            if (folderList[index].isInclude(item)) {
                deleteItem(Type.Folder, i, dir_from, false);
            }
        })
        folderList[index] = Folder.fromString(Folder.bin().stringify() + folderList[index].stringify().slice(2), folderList[index].moDate);
        folderList[index].rmDate = Date.now().toString();
        binItem.unshift(new Folder(folderList[index]));
        folderList.splice(index, 1);
    }
    if (_save) {
        init(dir_from)
    }
}
/**
 * 彻底删除回收站的密码
 * @param index 密码在列表中的索引
 */
function deletebinItem(index: number | Array<number>): void {
    if (Array.isArray(index)) {
        for (let i of index) {
            if (binItem[i].type == Type.Password) {
                Task.tryDone("密码清除？不留痕迹！");
                break;
            }
        }
        binItem = binItem.filter((item, i) => {
            return !index.includes(i);
        });
    }
    else {
        if (binItem[index].type == Type.Password) Task.tryDone("密码清除？不留痕迹！");
        binItem.splice(index, 1);
    }
    saveData();
}
/**
 * 恢复回收站的密码
 * @param index 密码在列表中的索引
 */
function recoverPwd(index: number): void {
    let binItemCopy = [];
    for (let i = 0; i < binItem.length; i++) {
        if (binItem[i].type == Type.Password) binItemCopy.push(new Password(binItem[i] as Password));
        else binItemCopy.push(new Folder(binItem[i] as Folder));
    }
    let pwdListCopy = [];
    for (let i = 0; i < pwdList.length; i++) {
        pwdListCopy.push(new Password(pwdList[i] as Password));
    }
    let folderListCopy = [];
    for (let i = 0; i < folderList.length; i++) {
        folderListCopy.push(new Folder(folderList[i] as Folder));
    }
    if (binItem[index].type == Type.Password) {
        // 检查用户组
        binItem[index].rmDate = null;
        binItem[index].setParent(Folder.fromString(Folder.root().stringify() + binItem[index].getParent().stringify().slice(2)));
        mkdir((<Password>binItem[index]).getParent(), true);
        pwdList.push(binItem[index] as Password);
        if (!getCurrentUserGroup().permission.canAddPwd(pwdList.length - 1)) {
            mkDialog("权限不足", "你没有权限添加更多密码。当前允许添加的密码数量为" + getCurrentUserGroup().permission.pwdNum + "。");
            binItem = binItemCopy;
            pwdList = pwdListCopy;
            folderList = folderListCopy;
            return;
        }
        if (!getCurrentUserGroup().permission.canAddFolder(folderList.length - 1)) {
            mkDialog("权限不足", "你没有权限添加更多文件夹。当前允许添加的文件夹数量为" + getCurrentUserGroup().permission.folderNum + "。");
            binItem = binItemCopy;
            pwdList = pwdListCopy;
            folderList = folderListCopy;
            return;
        }
        Task.tryDone("密码复活术");
    }
    else {
        let x: string = binItem[index].moDate;
        binItem[index].rmDate = null;
        binItem[index] = Folder.fromString(Folder.root().stringify() + (binItem[index] as Folder).stringify().slice(2));
        binItem[index].moDate = x;
        mkdir(binItem[index].getParent(), true);
        let has: boolean = false;
        folderList.forEach((item) => {
            if (item.isSame(<Folder>binItem[index])) {
                has = true;
            }
        });
        if (!has) mkdir(binItem[index], true);
        if (!getCurrentUserGroup().permission.canAddFolder(folderList.length - 1)) {
            mkDialog("权限不足", "你没有权限添加更多文件夹。当前允许添加的文件夹数量为" + getCurrentUserGroup().permission.folderNum + "。");
            folderList = folderListCopy;
            binItem = binItemCopy;
            return;
        }
    }
    binItem.splice(index, 1);
    saveData();
}
/**
 * 添加一个密码
 * @param dir 添加到的文件夹
 * @param _step 当前步骤，在外部调用下不应被填写
 * @param _result 当前密码对象，在外部调用下不应被填写
 */
function addPwd(dir: Folder, _step: number = 0, _result: Password = new Password("", "", "", "", "", "", dir)): void {
    if (!getCurrentUserGroup().permission.canAddPwd(pwdList.length)) {
        mkDialog("权限不足", "你没有权限添加更多密码。当前允许添加的密码数量为" + getCurrentUserGroup().permission.pwdNum + "。");
        return;
    }
    updatePos();
    currentFolder = Folder.append();
    if (mainSetting.easyAppend) {
        pwdList.push(new Password("", "", "", "", "", "", dir));
        changePwd(pwdList, pwdList.length - 1, dir, true);
        return;
    }
    // 添加密码
    if (_step == 0) {
        content!.innerHTML = `
        <div class="title">添加密码</div>
        <div class="form">
        <div class="formItem"><label for="input">来源<span style="color:red;">*</span>：</label><input type="text" id="input" class="invaild" value="${_result.from}" /><span class="check"></span></div>
        </div>
        <div class="formItem"><p>你可以填写此密码的来源，如网站网址、应用程序的名称等。请注意，此项必填。</p></div>
        </div>
        <div class="action" id="nxt"><p>下一步</p></div>
        <div class="action" id="cancel"><p>取消</p></div>`
    }
    else if (_step == 1) {
        content!.innerHTML = `
        <div class="title">添加密码</div>
        <div class="form">
        <div class="formItem"><label for="input">用户名<span style="color:red;">*</span>：</label><input type="text" id="input" class="invaild" value="${_result.uname}"/><span class="check"></span></div>
        </div>
        <div class="formItem"><p>你可以填写此密码对应的用户名。请注意，此项必填。</p></div>
        </div>
        <div class="action" id="pre"><p>上一步</p></div>
        <div class="action" id="nxt"><p>下一步</p></div>
        <div class="action" id="cancel"><p>取消</p></div>`
    }
    else if (_step == 2) {
        content!.innerHTML = `
        <div class="title">添加密码</div>
        <div class="form">
        <div class="formItem"><label for="input">密码<span style="color:red;">*</span>：</label><input type="text" id="input" class="invaild" value="${_result.pwd}"/><span class="check"></span></div>
        <div class="formItem"><p class="icon" style="margin-left: 0;" id="randpwd">随机生成一个高强度的密码</p></div>
        </div>
        <div class="formItem"><p>你可以填写密码。请注意，此项必填。</p></div>
        </div>
        <div class="action" id="pre"><p>上一步</p></div>
        <div class="action" id="nxt"><p>下一步</p></div>
        <div class="action" id="cancel"><p>取消</p></div>`
        document.querySelector("#randpwd")!.addEventListener("click", () => {
            _result.pwd = randstr(16);
            (document.getElementById("input") as HTMLInputElement)!.value = _result.pwd;
            (document.querySelector("input") as HTMLInputElement)!.dispatchEvent(new Event("input"));
        })
    } else if (_step == 3) {
        content!.innerHTML = `
        <div class="title">添加密码</div>
        <div class="form">
        <div class="formItem"><label for="input_email">邮箱：</label><input type="text" id="input_email" value="${_result.email}"></div>
        <div class="formItem"><label for="input_phone">手机号：</label><input type="text" id="input_phone" value="${_result.phone}"></div>
        <div class="formItem"><p>你可以填写辅助信息。请注意，以上内容为选填。</p></div>
        </div>
        <div class="action" id="pre"><p>上一步</p></div>
        <div class="action" id="nxt"><p>下一步</p></div>
        <div class="action" id="cancel"><p>取消</p></div>
        `
    }
    else if (_step == 4) {
        content!.innerHTML = `
        <div class="title">添加密码</div>
        <div class="form">
        <div class="formItem"><label for="input">备注：</label><br><textarea id="input" placeholder="可以在这里输入一些想说的话。">${_result.note}</textarea></div>
        <div class="formItem"><p>你可以填写一些备注。请注意，以上内容为选填。</p></div>
        </div>
        <div class="action" id="pre"><p>上一步</p></div>
        <div class="action" id="nxt"><p>完成</p></div>
        <div class="action" id="cancel"><p>取消</p></div>
        `
    }
    if (_step != 3 && _step != 4) {
        document.getElementById("input")!.addEventListener("input", (e) => {
            if (_step == 0) {
                _result.from = (document.getElementById("input") as HTMLInputElement)!.value;
            }
            else if (_step == 1) {
                _result.uname = (document.getElementById("input") as HTMLInputElement)!.value;
            }
            else if (_step == 2) {
                _result.pwd = (document.getElementById("input") as HTMLInputElement)!.value;
            }
            let tgt: HTMLInputElement = e.target as HTMLInputElement;
            if (tgt.value == "") {
                tgt.classList.add("invaild");
                tgt.classList.remove("vaild");
            } else {
                tgt.classList.add("vaild");
                tgt.classList.remove("invaild");
            }
        });
        (document.querySelector("input") as HTMLInputElement)!.dispatchEvent(new Event("input"));
    }
    if (_step == 4) document.querySelector("#input")?.addEventListener("input", () => {
        _result.note = (document.getElementById("input") as HTMLTextAreaElement)!.value;
    })
    if (_step == 3) {
        document.getElementById("input_email")!.addEventListener("input", () => {
            _result.email = (document.getElementById("input_email") as HTMLInputElement)!.value;
        })
        document.getElementById("input_phone")!.addEventListener("input", () => {
            _result.phone = (document.getElementById("input_phone") as HTMLInputElement)!.value;
        })
    }
    document.getElementById("nxt")!.addEventListener("click", () => {
        if (_step == 0) {
            if ((document.getElementById("input") as HTMLInputElement)!.value == "") return mkDialog("提交错误！", "来源不能为空！");
        }
        else if (_step == 1) {
            if ((document.getElementById("input") as HTMLInputElement)!.value == "") return mkDialog("提交错误！", "用户名不能为空！");
        }
        else if (_step == 2) {
            if ((document.getElementById("input") as HTMLInputElement)!.value == "") return mkDialog("提交错误！", "密码不能为空！");
        }
        if (_step == 4) {
            pwdList.push(new Password(_result.from, _result.uname, _result.pwd, _result.note, _result.email, _result.phone, dir));
            doneMkPwd(true, pwdList.length - 1);
            init(dir);
            return;
        }
        addPwd(dir, _step + 1, _result);
    });
    if (_step != 0) document.getElementById("pre")!.addEventListener("click", () => {
        addPwd(dir, _step - 1, _result);
    });
    document.getElementById("cancel")!.addEventListener("click", () => {
        update(dir);
    })
}
/**
 * 检查密码的安全性
 * @param index 密码的索引
 * @returns HTML代码，安全性提示，如果很安全则返回空字符串
 */
function checkSafety(index: number): string {
    let list: Array<number> = [], safety: string = "";
    for (let i = 0; i < pwdList.length; i++) {
        if (pwdList[i].pwd == pwdList[index].pwd && i != index) {
            list.push(i);
        }
    }
    if (list.length == 1) {
        safety += `<p style="color: orange">此密码与${pwdList[list[0]].from}的密码是重复的。</p>`;
    } else if (list.length == 2) {
        safety += `<p style="color: orange">此密码与${pwdList[list[0]].from}和${pwdList[list[1]].from}的密码是重复的。</p>`;
    } else if (list.length > 2) {
        safety += `<p style="color: red">此密码与${pwdList[list[0]].from}、${pwdList[list[1]].from}等${list.length}个来源的密码是重复的。</p>`;
    }
    let isR: boolean = false;
    for (let i = 0; i < simplePwd.length; i++) {
        if (pwdList[index].pwd == simplePwd[i]) {
            safety += `<p style="color: red">此密码很容易暴露。</p>`;
            isR = true;
        }
    }
    if (!isR) for (let i = 0; i < lessSimplePwd.length; i++) {
        if (pwdList[index].pwd == lessSimplePwd[i]) {
            safety += `<p style="color: orange">此密码比较容易暴露。</p>`;
            isR = true;
        }
    }
    if (!isR) {
        if (!isNaN(Number(pwdList[index].pwd)))
            safety += `<p style="color: orange">此密码只包含数字，比较容易暴露。</p>`;
        if (pwdList[index].pwd.length <= 3)
            safety += `<p style="color: orange">此密码太短，比较容易暴露。</p>`;
    }
    return safety;
}
/**
 * 展示密码
 * @param by 密码列表
 * @param index 目标密码在by中的索引
 * @param from 从哪个页面跳转过来的，如果是从回收站跳转过来的，返回时会返回到回收站页面，否则返回到主页面，需要填写Page枚举
 */
function showPwd(by: Array<Password>, index: number, from: Folder): void {
    updatePos();
    currentFolder = Folder.show();
    let inner: string = `
    <div class="form">
    <div class="formItem_Copy"><label for="from">来源：</label><input type="text" id="from" class="vaild" value="${by[index].from}" readonly /><img class="icon" src="./resources/copy.png" id="fromCopy" title="复制" data-bs-toggle="tooltip" data-bs-placement="top"></div>
    <div class="formItem_Copy"><label for="uname">用户名：</label><input type="text" id="uname" class="vaild" value="${by[index].uname}" readonly /><img class="icon" src="./resources/copy.png" id="unameCopy" title="复制" data-bs-toggle="tooltip" data-bs-placement="top"></div>
    <div class="formItem_Copy"><label for="pwd">密码：</label><input type="password" id="pwd" class="vaild" value="${by[index].pwd}" readonly /><img class="icon" src="./resources/copy.png" id="pwdCopy" title="复制" data-bs-toggle="tooltip" data-bs-placement="top"></div>
    <div class="formItem"><p class="action" id="showHidePwd">显示密码</p></div>
    <div class="formItem" id="safety"></div>
    <div class="formItem_Copy"><label for="email">邮箱：</label><input type="text" id="email" class="vaild" value="${by[index].email}" readonly /><img class="icon" src="./resources/copy.png" id="emailCopy" title="复制" data-bs-toggle="tooltip" data-bs-placement="top"></div>
    <div class="formItem_Copy"><label for="phone">手机号：</label><input type="text" id="phone" class="vaild" value="${by[index].phone}" readonly /><img class="icon" src="./resources/copy.png" id="phoneCopy" title="复制" data-bs-toggle="tooltip" data-bs-placement="top"></div>
    <div class="formItem_Copy"><p>修改时间：${getReadableTime(by[index].moDate)}</p></div>
    ${from.isSame(Folder.bin()) ? `<div class="formItem_Copy"><p>删除时间：${getReadableTime(by[index].rmDate!)}</p></div>` : ""}
    <div class="formItem"><label for="note">备注：</label><br><textarea id="note" readonly>${by[index].note}</textarea></div>
    </div>
    <div class="action" id="back"><p>返回</p></div>
    `
    content!.innerHTML = inner;
    updateTooltip();
    const safety: HTMLDivElement = document.querySelector("#safety")!;
    Task.tryDone("例行检查");
    if (from != Folder.bin()) {
        safety.innerHTML = checkSafety(index);
        if (safety.innerHTML == "") safety.style.display = "none";
    }
    document.querySelector("#showHidePwd")?.addEventListener("click", (e) => {
        const div = document.querySelector("input#pwd") as HTMLInputElement;
        if (div.type == "password") {
            div.type = "text";
            (<HTMLDivElement>e.target).innerHTML = "隐藏密码";
        }
        else {
            div.type = "password";
            (<HTMLDivElement>e.target).innerHTML = "显示密码";
        };
    });
    document.querySelector("#fromCopy")?.addEventListener("click", () => {
        if (document.querySelector("#from")?.getAttribute("copyed") == "true") {
            return;
        }
        if (copyToClipboard(pwdList[index].from)) {
            document.querySelector("#fromCopy")?.setAttribute("src", "./resources/copy_done.png");
            document.querySelector("#from")?.setAttribute("copyed", "true");
            setTimeout(() => {
                document.querySelector("#fromCopy")?.setAttribute("src", "./resources/copy.png");
                document.querySelector("#from")?.removeAttribute("copyed");
            }, 1000);
        }
    });
    document.querySelector("#unameCopy")?.addEventListener("click", () => {
        if (document.querySelector("#uname")?.getAttribute("copyed") == "true") {
            return;
        }
        if (copyToClipboard(pwdList[index].uname)) {
            document.querySelector("#unameCopy")?.setAttribute("src", "./resources/copy_done.png");
            document.querySelector("#uname")?.setAttribute("copyed", "true");
            setTimeout(() => {
                document.querySelector("#unameCopy")?.setAttribute("src", "./resources/copy.png");
                document.querySelector("#uname")?.removeAttribute("copyed");
            }, 1000);
        }
    });
    document.querySelector("#pwdCopy")?.addEventListener("click", () => {
        if (document.querySelector("#pwd")?.getAttribute("copyed") == "true") {
            return;
        }
        if (copyToClipboard(pwdList[index].pwd)) {
            document.querySelector("#pwdCopy")?.setAttribute("src", "./resources/copy_done.png");
            document.querySelector("#pwd")?.setAttribute("copyed", "true");
            setTimeout(() => {
                document.querySelector("#pwdCopy")?.setAttribute("src", "./resources/copy.png");
                document.querySelector("#pwd")?.removeAttribute("copyed");
            }, 1000);
        }
    });
    document.querySelector("#emailCopy")?.addEventListener("click", () => {
        if (document.querySelector("#email")?.getAttribute("copyed") == "true") {
            return;
        }
        if (copyToClipboard(pwdList[index].email)) {
            document.querySelector("#emailCopy")?.setAttribute("src", "./resources/copy_done.png");
            document.querySelector("#email")?.setAttribute("copyed", "true");
            setTimeout(() => {
                document.querySelector("#emailCopy")?.setAttribute("src", "./resources/copy.png");
                document.querySelector("#email")?.removeAttribute("copyed");
            }, 1000);
        }
    })
    document.querySelector("#phoneCopy")?.addEventListener("click", () => {
        if (document.querySelector("#phone")?.getAttribute("copyed") == "true") {
            return;
        }
        if (copyToClipboard(pwdList[index].phone)) {
            document.querySelector("#phoneCopy")?.setAttribute("src", "./resources/copy_done.png");
            document.querySelector("#phone")?.setAttribute("copyed", "true");
            setTimeout(() => {
                document.querySelector("#phoneCopy")?.setAttribute("src", "./resources/copy.png");
                document.querySelector("#phone")?.removeAttribute("copyed");
            }, 1000);
        }
    })
    document.querySelector("#back")?.addEventListener("click", () => {
        if (from == Folder.bin()) {
            update(Folder.bin());
        } else {
            update(from);
        }
    });
}

/**
 * 主函数
 */
function fmain() {
    document.querySelector("span#nav-mainPage")!.addEventListener("click", () => {
        update(pagePos.mainDir);
    });
    document.querySelector("span#nav-setting")!.addEventListener("click", () => {
        update(Folder.setting());
    });
    document.querySelector("span#nav-bin")!.addEventListener("click", () => {
        if (getCurrentUserGroup().permission.canUseBin) update(Folder.bin());
        else mkDialog("权限不足", "你没有权限使用回收站。");
    });
    document.querySelector("span#nav-home")!.addEventListener("click", () => {
        update(Folder.home());
    });
    document.querySelector("span#nav-search")!.addEventListener("click", () => {
        if (getCurrentUserGroup().permission.canSearch) update(Folder.search());
        else mkDialog("权限不足", "你没有权限使用搜索功能。");
    })

    window.fs.read("./editor")
        .then((data) => {
            if (data == "") throw new Error("editor is null");
            data = data.replace(/\s/g, '')
            let obj = JSON.parse(data);
            if (obj.version != "e1.0") console.log("编辑器数据版本已过期！");
            searchMemory = obj.search;
            searchMemory.lastSearchTxt = null;
            searchMemory.txt = "";

            umcFilePaths = obj.umcFilePaths;
            for (let i = umcFilePaths.length - 1; i >= 0; i--) {
                if (!window.fs.hasFile(umcFilePaths[i])) umcFilePaths.splice(i, 1);
            }
            if (umcFilePaths.length != 0) {
                let v: string = umcFilePaths[umcFilePaths.length - 1];
                const params = getInitDataSync();
                if ('path' in params) v = params.path as string;
                curPath = v;
                window.fs.read(v).then((data) => { UMC.parse(data) });
            } else {
                main!.innerHTML = `
                <div class="title" style="margin: 7px; margin-top: 40px">选择密码库</div>
                <p>在缓存中没有找到可用的密码库，它们可能被删除、移动或重命名了，你现在可以：</p>
                <div id="newUMC"><p class="action">点此新建一个密码库</p></div>
                <div id="importUMC"><p class="action">点此导入密码库</p></div>
                `
                document.querySelector("div#newUMC")?.addEventListener("click", () => {
                    let filepath: string | undefined = window.msg.showSaveDialogSync("选择保存地址", "选择保存新文件的地址", [{ name: "密码库文件", extensions: ['umc'] }]);
                    if (filepath !== undefined) {
                        umcFilePaths.push(filepath);
                        curPath = filepath;
                        saveData();
                        saveEditorData();
                        location.reload();
                    }
                })
                document.querySelector("div#importUMC")?.addEventListener("click", () => {
                    let filepath: string | undefined = window.msg.showOpenDialogSync("选择打开文件", "选择一个文件来打开", [{ name: "密码库文件", extensions: ['umc'] }]);
                    if (filepath !== undefined) {
                        umcFilePaths.push(filepath);
                        curPath = filepath;
                        saveEditorData();
                        location.reload();
                    }
                })
            }
        })
        .catch((err) => {
            console.error("No file .editor");
            saveEditorData();
            location.reload();
        })

}

fmain();