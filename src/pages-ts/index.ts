class cryp{
    static encrypt(data: string, key: string): string{
        let k = CryptoJS.AES.encrypt(data, key).toString(CryptoJS.format.OpenSSL);
        return k;
    }
    static decrypt(data: string, key: string, retries = -1): string {
        try {
            // 先使用Latin1编码获取原始字节数据
            const bytes = CryptoJS.AES.decrypt(data, key);
            const UTF8String = bytes.toString(CryptoJS.enc.Utf8);
            return UTF8String;
        } catch {
            if (retries === 0) {
                throw "No retry times!!!";
            }
            return cryp.decrypt(data, key, retries - 1);
        }
    }
    static pbkdf2(data: string, salt: string): string{
        return CryptoJS.PBKDF2(data, salt, {
                    keySize: 256 / 32,
                    iterations: 10,
                    hasher: CryptoJS.algo.SHA256
                }).toString(CryptoJS.enc.Hex);
    }
}
function encrypt(data: Item | Task, key: string, index: number = 0): Item | Task{ // 加密
    let enc: Item | Task;
    if (data instanceof Password) enc = new Password(data);
    else if (data instanceof Folder) enc = new Folder(data);
    else enc = new Task(data);
    let keyList: Array<keyof (Item | Task)> = <Array<keyof (Item | Task)>>Object.keys(data);
    keyList.sort();
    for (let v of keyList){
        if (v === "type") continue;
        if (data[v] === null){
            (enc as any)[v] = null
        } else if (typeof data[v] === "string"){
            (enc as any)[v] = cryp.encrypt(data[v], key)
        } else if (typeof data[v] === "number"){
            (enc as any)[v] = cryp.encrypt((<number>data[v]).toString(), key)
        } else if (typeof data[v] === "object" && (<Folder>data[v]).type == Type.Folder){
            (enc as any)[v] = new Folder(<Folder>encrypt(data[v], key, index));
        } else {
            console.error("未知类型");
        }
    }
    return enc;
}
function decrypt(data:Item | Task, key: string, index: number = 0): Item | Task{ // 解密
    let dec: Item | Task;
    if (data instanceof Password) dec = new Password(data);
    else if (data instanceof Folder) dec = new Folder(data);
    else dec = new Task(data);
    let keyList: Array<keyof (Item | Task)> = <Array<keyof (Item | Task)>>Object.keys(data);
    keyList.sort();
    for (let v of keyList){
        if (v === "type") continue;
        if (data[v] === null){
            (dec as any)[v] = null
        } else if (typeof data[v] === "string"){
            (dec as any)[v] = cryp.decrypt(data[v], key)
        } else if (typeof data[v] === "number"){
            (dec as any)[v] = cryp.decrypt((<number>data[v]).toString(), key)
        } else if (typeof data[v] === "object" && (<Folder>data[v]).type == Type.Folder){
            (dec as any)[v] = new Folder(<Folder>decrypt(data[v], key, index));
        } else {
            console.error("未知类型");
        }
    }
    return dec;
}
    
let addBtn = document.querySelector("#addPwd"); // 添加密码按钮
const main = document.querySelector("#contentDiv"); // main界面
let pwdList : Array<Password> = []; // 密码列表
let binItem : Array<Item> = []; // 最近删除的密码列表
let folderList : Array<Folder> = []; // 文件夹列表
let mainPwd : string = ""; // 主密码
let isremember : boolean = false; // 是否记住密码
let folderIsEditing : boolean = false; // 是否正在编辑文件夹
let currentFolder : Folder = Folder.root();
let clipboard: Set<clipboardItem> = new Set();
let mainSetting: MainSetting = new MainSetting();
let score: number = 0;
let level: number = 1;
let TODOTasks: Array<TaskMap> = [];
let searchMemory: {
    txt: string, 
    isSearched: boolean, 
    lastSearchTxt: string,
    setting: {
        isReg: boolean,
        searchFrom: boolean,
        searchUname: boolean,
        searchPwd: boolean,
        searchPhone: boolean,
        searchEmail: boolean,
        searchNote: boolean,
        searchFolder: boolean,
    };
} = {
    txt: "", 
    isSearched: false, 
    lastSearchTxt: "",
    setting: {
        isReg: false,
        searchFrom: true,
        searchUname: true,
        searchPwd: true,
        searchPhone: true,
        searchEmail: true,
        searchNote: true,
        searchFolder: true,
    }
};
type PagePosition = {top: number, left: number};
let pagePos: {
    home: PagePosition,
    main: PagePosition,
    mainDir: Folder,
    setting: PagePosition,
    bin: PagePosition,
    search: PagePosition,
} = {
    home: {top: 0, left: 0},
    main: {top: 0, left: 0},
    mainDir: Folder.root(),
    setting: {top: 0, left: 0},
    bin: {top: 0, left: 0},
    search: {top: 0, left: 0},
};

// 一些工具函数
function getReadableTime(time: Date | string): string{
    if (typeof time === "string") time = new Date(Number(time));
    let minite = time.getMinutes(), strminite: string = minite.toString();
    if (minite < 10) strminite = "0" + minite;
    let sec = time.getSeconds(), strsec: string = sec.toString();
    if (sec < 10) strsec = "0" + sec;
    return time.getFullYear() + "/" + (time.getMonth() + 1) + "/" + time.getDate() + " " + time.getHours() + ":" + strminite + ":" + strsec;
}
function hasDir(path: string, name: string, exceptIndex: Array<number> = []): boolean{
    for(let i = 0; i < folderList.length; i++){
        if (folderList[i].name == name && folderList[i].parent == path && exceptIndex.indexOf(i) == -1){
            return true;
        }
    }
    return false;
}
function mkdir(dir: Folder): void{ // 创建文件夹
    let parent = Folder.fromString(dir.parent);
    if (folderList.findIndex(v => v.isSame(dir)) != -1 || dir.isSame(Folder.root())){
        return; // 文件夹已存在
    }
    if (folderList.findIndex(v => v.isSame(parent)) == -1){
        mkdir(parent);
    }
    folderList.push(dir);
    saveData();
}
function updatePos(): void{
    if (currentFolder.isSame(Folder.bin())){
        pagePos.bin = getScroll();
    } else if (currentFolder.isSame(Folder.home())){
        pagePos.home = getScroll();
    } else if (currentFolder.isSame(Folder.setting())){
        pagePos.setting = getScroll();
    } else if (currentFolder.isSame(Folder.search())){
        pagePos.search = getScroll();
    } else if (currentFolder.isin(Folder.root())){
        pagePos.main = getScroll();
    }
}

function init(dir: Folder, checkable: boolean = false): void{
    saveData();
    update(dir, checkable);
}
function moveItem(type: Type, index: number, dir_to: Folder, isCopy: boolean = false) : void {
    if (type == Type.Password) {
        if (isCopy) pwdList[pwdList.push(new Password(pwdList[index])) - 1].dir = new Folder(dir_to);
        else pwdList[index].dir = dir_to;
    } else {
        if (hasDir(dir_to.stringify(), folderList[index].name)){
            mkDialog("移动失败！", `“${folderList[index].name}”已存在。`);
            return;
        }
        let newFolder = new Folder(folderList[index]);
        newFolder.parent = dir_to.stringify();
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
        if (isCopy) folderList[folderList.push(new Folder(folderList[index])) - 1].parent = dir_to.stringify();
        else folderList[index].parent = dir_to.stringify();
    }
}
function doneMkPwd(isAppend: boolean = false, index: number = -1): void{
    if (isAppend){
        Task.tryDone("初出茅庐");
        Task.tryDone("好事成双");
    } else {
        Task.tryDone("密码的产后护理");
    }
    if (checkSafety(index) == "")
        Task.tryDone("安全密码养成记");
}
// 渲染编辑密码界面，并更改密码，isAppend表示是否是添加密码，为true时，取消将会删除该密码，会返回main界面
function changePwd(by: Array<Password>, index: number, dir: Folder, isAppend : boolean = false) : void{
    if(!isAppend){
        updatePos();
        currentFolder = Folder.change();
    }
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(tooltip => {bootstrap.Tooltip.getInstance(tooltip)?.dispose();});
    let inner : string = `
    <div class="title">${isAppend?`添加密码`:`编辑密码`}</div>
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
    main!.innerHTML = inner;
    let require : Array<string> = ["#from", "#pwd", "#uname"];
    for (let i = 0; i < require.length; i++){
        const it = document.querySelector(require[i]) as HTMLInputElement;
        it?.addEventListener("input", () =>{
            if (it.value == ""){
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
        if (name == "" || uname == "" || pwd == ""){
            mkDialog("提交失败！", "来源、用户名和密码不能为空。");
            return;
        }
        const dir = by[index].dir;
        by[index] = new Password(name, uname, pwd, note, email, phone, dir);
        doneMkPwd(isAppend, index);
        init(dir);
    });
    document.querySelector("#cancel")?.addEventListener("click", () => {
        if (isAppend){
            by.splice(index, 1);
        }
        update(dir);
    });
}
// 删除密码，type为类型，index为索引，dir_from为来源文件夹，在外部的调用中，_save不应被填写
function deleteItem(type: Type, index: number, dir_from: Folder, _save: boolean = true) : void{
    if (type == Type.Password) {
        Task.tryDone("密码清理，双倍给力！");
        clipboard.delete({type: Type.Password, index: index});
        pwdList[index].dir = Folder.fromString(Folder.bin().stringify() + pwdList[index].dir.stringify().slice(2));
        pwdList[index].rmDate = Date.now().toString();
        binItem.unshift(new Password(pwdList[index]));
        pwdList.splice(index, 1);
    } else {
        clipboard.delete({type: Type.Folder, index: index});
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
    if (_save){
        init(dir_from)
    }
}
function deletebinItem(index: number | Array<number>) : void{
    // 删除最近删除的密码
    if (Array.isArray(index)){
        for(let i of index){
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
function recoverPwd(index: number) : void{
    // 恢复最近删除的密码
    binItem[index].rmDate = null;
    if (binItem[index] instanceof Password) {
        Task.tryDone("密码复活术");
        binItem[index].dir = Folder.fromString(Folder.root().stringify() + binItem[index].dir.stringify().slice(2));
        mkdir((<Password>binItem[index]).dir);
        pwdList.push(binItem[index]);
    }
    else {
        let x: string = binItem[index].moDate;
        binItem[index] = Folder.fromString(Folder.root().stringify() + binItem[index].stringify().slice(2)); 
        binItem[index].moDate = x;
        mkdir(Folder.fromString(binItem[index].parent));
        let has: boolean = false;
        folderList.forEach((item) => {
            if (item.isSame(<Folder>binItem[index])) {
                has = true;
            }
        });
        if (!has) mkdir(binItem[index]);
    }
    binItem.splice(index, 1);
    saveData();
}
function addPwd(dir: Folder, step: number = 0, result: Password = new Password("", "", "", "", "", "", dir)) : void{
    updatePos();
    currentFolder = Folder.append();
    if (mainSetting.easyAppend){
        pwdList.push(new Password("", "", "", "", "", "", dir));
        changePwd(pwdList, pwdList.length - 1, dir, true);
        return;
    }
    // 添加密码
    if (step == 0) {
        main!.innerHTML = `
        <div class="title">添加密码</div>
        <div class="form">
        <div class="formItem"><label for="input">来源<span style="color:red;">*</span>：</label><input type="text" id="input" class="invaild" value="${result.from}" /><span class="check"></span></div>
        </div>
        <div class="formItem"><p>你可以填写此密码的来源，如网站网址、应用程序的名称等。请注意，此项必填。</p></div>
        </div>
        <div class="action" id="nxt"><p>下一步</p></div>
        <div class="action" id="cancel"><p>取消</p></div>`
    }
    else if (step == 1) {
        main!.innerHTML = `
        <div class="title">添加密码</div>
        <div class="form">
        <div class="formItem"><label for="input">用户名<span style="color:red;">*</span>：</label><input type="text" id="input" class="invaild" value="${result.uname}"/><span class="check"></span></div>
        </div>
        <div class="formItem"><p>你可以填写此密码对应的用户名。请注意，此项必填。</p></div>
        </div>
        <div class="action" id="pre"><p>上一步</p></div>
        <div class="action" id="nxt"><p>下一步</p></div>
        <div class="action" id="cancel"><p>取消</p></div>`
    }
    else if (step == 2) {
        main!.innerHTML = `
        <div class="title">添加密码</div>
        <div class="form">
        <div class="formItem"><label for="input">密码<span style="color:red;">*</span>：</label><input type="text" id="input" class="invaild" value="${result.pwd}"/><span class="check"></span></div>
        <div class="formItem"><p class="icon" style="margin-left: 0;" id="randpwd">随机生成一个高强度的密码</p></div>
        </div>
        <div class="formItem"><p>你可以填写密码。请注意，此项必填。</p></div>
        </div>
        <div class="action" id="pre"><p>上一步</p></div>
        <div class="action" id="nxt"><p>下一步</p></div>
        <div class="action" id="cancel"><p>取消</p></div>`
        document.querySelector("#randpwd")!.addEventListener("click", () => {
            result.pwd = randstr(16);
            (document.getElementById("input") as HTMLInputElement)!.value = result.pwd;
            (document.querySelector("input") as HTMLInputElement)!.dispatchEvent(new Event("input"));
        })
    } else if (step == 3) {
        main!.innerHTML = `
        <div class="title">添加密码</div>
        <div class="form">
        <div class="formItem"><label for="input_email">邮箱：</label><input type="text" id="input_email" value="${result.email}"></div>
        <div class="formItem"><label for="input_phone">手机号：</label><input type="text" id="input_phone" value="${result.phone}"></div>
        <div class="formItem"><p>你可以填写辅助信息。请注意，以上内容为选填。</p></div>
        </div>
        <div class="action" id="pre"><p>上一步</p></div>
        <div class="action" id="nxt"><p>下一步</p></div>
        <div class="action" id="cancel"><p>取消</p></div>
        `
    }
    else if (step == 4) {
        main!.innerHTML = `
        <div class="title">添加密码</div>
        <div class="form">
        <div class="formItem"><label for="input">备注：</label><br><textarea id="input" placeholder="可以在这里输入一些想说的话。">${result.note}</textarea></div>
        <div class="formItem"><p>你可以填写一些备注。请注意，以上内容为选填。</p></div>
        </div>
        <div class="action" id="pre"><p>上一步</p></div>
        <div class="action" id="nxt"><p>完成</p></div>
        <div class="action" id="cancel"><p>取消</p></div>
        `
    }
    if (step != 3 && step != 4){
        document.getElementById("input")!.addEventListener("input", (e) => {
            if (step == 0) {
                result.from = (document.getElementById("input") as HTMLInputElement)!.value;
            }
            else if (step == 1) {
                result.uname = (document.getElementById("input") as HTMLInputElement)!.value;
            }
            else if (step == 2) {
                result.pwd = (document.getElementById("input") as HTMLInputElement)!.value;
            }
            let tgt: HTMLInputElement = e.target as HTMLInputElement;
            if (tgt.value == ""){
                tgt.classList.add("invaild");
                tgt.classList.remove("vaild");
            } else {
                tgt.classList.add("vaild");
                tgt.classList.remove("invaild");
            }
        });
        (document.querySelector("input") as HTMLInputElement)!.dispatchEvent(new Event("input"));
    }
    if (step == 4) document.querySelector("#input")?.addEventListener("input", () => {
        result.note = (document.getElementById("input") as HTMLTextAreaElement)!.value;
    })
    if (step == 3){
        document.getElementById("input_email")!.addEventListener("input", () => {
            result.email = (document.getElementById("input_email") as HTMLInputElement)!.value;
        })
        document.getElementById("input_phone")!.addEventListener("input", () => {
            result.phone = (document.getElementById("input_phone") as HTMLInputElement)!.value;
        })
    }
    document.getElementById("nxt")!.addEventListener("click", () => {
        if (step == 0) {
            if ((document.getElementById("input") as HTMLInputElement)!.value == "") return mkDialog("提交错误！", "来源不能为空！");
        }
        else if (step == 1) {
            if ((document.getElementById("input") as HTMLInputElement)!.value == "") return mkDialog("提交错误！", "用户名不能为空！");
        }
        else if (step == 2) {
            if ((document.getElementById("input") as HTMLInputElement)!.value == "") return mkDialog("提交错误！", "密码不能为空！");
        }
        if (step == 4) {
            pwdList.push(new Password(result.from, result.uname, result.pwd, result.note, result.email, result.phone, dir));
            doneMkPwd(true, pwdList.length - 1);
            init(dir);
            return;
        }
        addPwd(dir, step + 1, result);
    });
    if (step != 0) document.getElementById("pre")!.addEventListener("click", () => {
        addPwd(dir, step - 1, result);
    });
    document.getElementById("cancel")!.addEventListener("click", () => {
        update(dir);
    })
}
function checkSafety(index: number) : string{
    let list : Array<number> = [], safety: string = "";
    for(let i = 0; i < pwdList.length; i++){
        if (pwdList[i].pwd == pwdList[index].pwd && i != index){
            list.push(i);
        }
    }
    if (list.length == 1){
        safety += `<p style="color: orange">此密码与${pwdList[list[0]].from}的密码是重复的。</p>`;
    } else if (list.length == 2){
        safety += `<p style="color: orange">此密码与${pwdList[list[0]].from}和${pwdList[list[1]].from}的密码是重复的。</p>`;
    } else if (list.length > 2){
        safety += `<p style="color: red">此密码与${pwdList[list[0]].from}、${pwdList[list[1]].from}等${list.length}个来源的密码是重复的。</p>`;
    }
    let isR : boolean = false;
    for(let i = 0; i < simplePwd.length; i++){
        if (pwdList[index].pwd == simplePwd[i]){
            safety += `<p style="color: red">此密码很容易暴露。</p>`;
            isR = true;
        }
    }
    if (!isR) for(let i = 0; i < lessSimplePwd.length; i++){
        if (pwdList[index].pwd == lessSimplePwd[i]){
            safety += `<p style="color: orange">此密码比较容易暴露。</p>`;
            isR = true;
        }
    }
    if (!isR){
        if (!isNaN(Number(pwdList[index].pwd)))
            safety += `<p style="color: orange">此密码只包含数字，比较容易暴露。</p>`;
        if (pwdList[index].pwd.length <= 3)
            safety += `<p style="color: orange">此密码太短，比较容易暴露。</p>`;
    }
    return safety;
}
// 显示密码， from表示从哪个页面跳转过来的，如果是从最近删除跳转过来的，返回时会返回到最近删除页面，否则返回到主页面，需要填写Page枚举
function showPwd(by: Array<Password>, index: number, from : Folder) : void{
    let inner : string = `
    <div class="form">
    <div class="formItem_Copy"><label for="from">来源：</label><input type="text" id="from" class="vaild" value="${by[index].from}" readonly /><img class="icon" src="./resources/copy.png" id="fromCopy" title="复制" data-bs-toggle="tooltip" data-bs-placement="top"></div>
    <div class="formItem_Copy"><label for="uname">用户名：</label><input type="text" id="uname" class="vaild" value="${by[index].uname}" readonly /><img class="icon" src="./resources/copy.png" id="unameCopy" title="复制" data-bs-toggle="tooltip" data-bs-placement="top"></div>
    <div class="formItem_Copy"><label for="pwd">密码：</label><input type="password" id="pwd" class="vaild" value="${by[index].pwd}" readonly /><img class="icon" src="./resources/copy.png" id="pwdCopy" title="复制" data-bs-toggle="tooltip" data-bs-placement="top"></div>
    <div class="formItem"><p class="action" id="showHidePwd">显示密码</p></div>
    <div class="formItem" id="safety"></div>
    <div class="formItem_Copy"><label for="email">邮箱：</label><input type="text" id="email" class="vaild" value="${by[index].email}" readonly /><img class="icon" src="./resources/copy.png" id="emailCopy" title="复制" data-bs-toggle="tooltip" data-bs-placement="top"></div>
    <div class="formItem_Copy"><label for="phone">手机号：</label><input type="text" id="phone" class="vaild" value="${by[index].phone}" readonly /><img class="icon" src="./resources/copy.png" id="phoneCopy" title="复制" data-bs-toggle="tooltip" data-bs-placement="top"></div>
    <div class="formItem_Copy"><p>修改时间：${getReadableTime(by[index].moDate)}</p></div>
    ${from.isSame(Folder.bin())? `<div class="formItem_Copy"><p>删除时间：${getReadableTime(by[index].rmDate!)}</p></div>` : ""}
    <div class="formItem"><label for="note">备注：</label><br><textarea id="note" readonly>${by[index].note}</textarea></div>
    </div>
    <div class="action" id="back"><p>返回</p></div>
    `
    main!.innerHTML = inner;
    [...document.querySelectorAll('[data-bs-toggle="tooltip"]')].forEach(t => new bootstrap.Tooltip(t));
    const safety : HTMLDivElement = document.querySelector("#safety")!;
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
        if (document.querySelector("#from")?.getAttribute("copyed") == "true"){
            return;
        }
        if (copyToClipboard(pwdList[index].from)){
            document.querySelector("#fromCopy")?.setAttribute("src", "./resources/copy_done.png");
            document.querySelector("#from")?.setAttribute("copyed", "true");
            setTimeout(() => {
                document.querySelector("#fromCopy")?.setAttribute("src", "./resources/copy.png");
                document.querySelector("#from")?.removeAttribute("copyed");
            }, 1000);
        }
    });
    document.querySelector("#unameCopy")?.addEventListener("click", () => {
        if (document.querySelector("#uname")?.getAttribute("copyed") == "true"){
            return;
        }
        if (copyToClipboard(pwdList[index].uname)){
            document.querySelector("#unameCopy")?.setAttribute("src", "./resources/copy_done.png");
            document.querySelector("#uname")?.setAttribute("copyed", "true");
            setTimeout(() => {
                document.querySelector("#unameCopy")?.setAttribute("src", "./resources/copy.png");
                document.querySelector("#uname")?.removeAttribute("copyed");
            }, 1000);
        }
    });
    document.querySelector("#pwdCopy")?.addEventListener("click", () => {
        if (document.querySelector("#pwd")?.getAttribute("copyed") == "true"){
            return;
        }
        if (copyToClipboard(pwdList[index].pwd)){
            document.querySelector("#pwdCopy")?.setAttribute("src", "./resources/copy_done.png");
            document.querySelector("#pwd")?.setAttribute("copyed", "true");
            setTimeout(() => {
                document.querySelector("#pwdCopy")?.setAttribute("src", "./resources/copy.png");
                document.querySelector("#pwd")?.removeAttribute("copyed");
            }, 1000);
        }
    });
    document.querySelector("#emailCopy")?.addEventListener("click", () => {
        if (document.querySelector("#email")?.getAttribute("copyed") == "true"){
            return;
        }
        if (copyToClipboard(pwdList[index].email)){
            document.querySelector("#emailCopy")?.setAttribute("src", "./resources/copy_done.png");
            document.querySelector("#email")?.setAttribute("copyed", "true");
            setTimeout(() => {
                document.querySelector("#emailCopy")?.setAttribute("src", "./resources/copy.png");
                document.querySelector("#email")?.removeAttribute("copyed");
            }, 1000);
        }
    })
    document.querySelector("#phoneCopy")?.addEventListener("click", () => {
        if (document.querySelector("#phone")?.getAttribute("copyed") == "true"){
            return;
        }
        if (copyToClipboard(pwdList[index].phone)){
            document.querySelector("#phoneCopy")?.setAttribute("src", "./resources/copy_done.png");
            document.querySelector("#phone")?.setAttribute("copyed", "true");
            setTimeout(() => {
                document.querySelector("#phoneCopy")?.setAttribute("src", "./resources/copy.png");
                document.querySelector("#phone")?.removeAttribute("copyed");
            }, 1000);
        }
    })
    document.querySelector("#back")?.addEventListener("click", () => {
        if (from == Folder.bin()){
            update(Folder.bin());
        } else {
            update(from);
        }
    });
}


function fmain(){
    document.querySelector("span#nav-mainPage")!.addEventListener("click", () => {
        update(pagePos.mainDir);
    });
    document.querySelector("span#nav-setting")!.addEventListener("click", () => {
        update(Folder.setting());
    });
    document.querySelector("span#nav-bin")!.addEventListener("click", () => {
        update(Folder.bin());
    });
    document.querySelector("span#nav-home")!.addEventListener("click", () => {
        update(Folder.home());
    });
    document.querySelector("span#nav-search")!.addEventListener("click", () => {
        update(Folder.search());
    })
    
    window.fs.read("./data").then((data) => {
        if (data == "") throw new Error("data is null");
        data = data.replace(/\s/g,'')
        let obj = JSON.parse(data);

        mainSetting = obj.mainSetting;
        const salt = obj.salt;
        if (obj.isPwdNull){
            enc(cryp.pbkdf2("", salt));
        } else {
            if (obj.memory !== null && obj.memory !== undefined){
                let m = obj.memory;
                let dpwd = cryp.pbkdf2(m, salt);
                if (cryp.pbkdf2(dpwd, salt) == obj.mainPwd){
                    isremember = true;
                    mainPwd = m;
                    enc(dpwd);
                } else {
                    isremember = false;
                }
            }
            if (!isremember) {
                main!.innerHTML = `
                <div class="title">请输入访问密钥</div>
                <div class="form">
                <div><label for="mainPwd">访问密钥：</label><input type="text" id="mainPwd" class="vaild"/></div>
                <div><input type="checkbox" id="rememberPwd"} style="margin-right: 10px;"/><label for="rememberPwd">记住密钥</label></div>
                </div>
                <div class="action" id="Yes"><p>确定</p></div>
                <div id="error"></div>
                `;
                (<HTMLDivElement>document.querySelector("#navBar")).style.display = "none";
                document.querySelector("#Yes")?.addEventListener("click", () => {
                    let m = (document.querySelector("#mainPwd") as HTMLInputElement).value;
                    let dpwd = cryp.pbkdf2(m, salt);
                    if (cryp.pbkdf2(dpwd, salt) == obj.mainPwd){
                        isremember = (document.querySelector("#rememberPwd") as HTMLInputElement).checked;
                        mainPwd = m;
                        (<HTMLDivElement>document.querySelector("#navBar")).style.display = "flex";
                        enc(dpwd);
                        saveData();
                    } else {
                        document.querySelector("#error")!.innerHTML = `
                        <div class="alert alert-danger alert-dismissible fade show" role="alert">
                            <strong>密钥错误！</strong>你需要检查你的密钥。
                        </div>`;
                        let alert = new bootstrap.Alert(document.querySelector(".alert") as HTMLDivElement);
                        setTimeout(() => {
                            alert.close();
                        }, 1000);
                    }
                });
            }
        }
        function enc(key: string) : void{
            obj.pwd.forEach((element: any) => {
                pwdList.push(<Password>decrypt(new Password(element), key));
            });
            obj.folder.forEach((element: any) => {
                folderList.push(<Folder>decrypt(new Folder(element), key));
            })
            obj.recent.forEach((element: any) => {
                if (element.type == Type.Password) binItem.push(<Item>decrypt(new Password(element), key));
                else binItem.push(<Item>decrypt(new Folder(element), key));
            });
            obj.TODOTasks.forEach((element: any) => {
                TODOTasks.push(TaskMap.dec(element, key));
            })
            score = Number(cryp.decrypt(obj.score, key));
            level = Number(cryp.decrypt(obj.level, key));
            (document.querySelector("#nav-home") as HTMLSpanElement).click();
        }
    }).catch((err) => {
        console.log(err);
        for(let i = 0; i < tasks.length; i++){
            TODOTasks.push(new TaskMap(i, 0));
        }
        (document.querySelector("#nav-home") as HTMLSpanElement).click();
    });
}

fmain();