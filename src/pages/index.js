"use strict";
class cryp {
    static encrypt(data, key) {
        let k = CryptoJS.AES.encrypt(data, key).toString(CryptoJS.format.OpenSSL);
        return k;
    }
    static decrypt(data, key, retries = -1) {
        try {
            // 先使用Latin1编码获取原始字节数据
            const bytes = CryptoJS.AES.decrypt(data, key);
            const UTF8String = bytes.toString(CryptoJS.enc.Utf8);
            return UTF8String;
        }
        catch (_a) {
            if (retries === 0) {
                throw "No retry times!!!";
            }
            return cryp.decrypt(data, key, retries - 1);
        }
    }
    static pbkdf2(data, salt) {
        return CryptoJS.PBKDF2(data, salt, {
            keySize: 256 / 32,
            iterations: 10,
            hasher: CryptoJS.algo.SHA256
        }).toString(CryptoJS.enc.Hex);
    }
}
function encrypt(data, key, index = 0) {
    let enc;
    if (data instanceof Password)
        enc = new Password(data);
    else if (data instanceof Folder)
        enc = new Folder(data);
    else
        enc = new Task(data);
    let keyList = Object.keys(data);
    keyList.sort();
    for (let v of keyList) {
        if (v === "type")
            continue;
        if (data[v] === null) {
            enc[v] = null;
        }
        else if (typeof data[v] === "string") {
            enc[v] = cryp.encrypt(data[v], key);
        }
        else if (typeof data[v] === "number") {
            enc[v] = cryp.encrypt(data[v].toString(), key);
        }
        else if (typeof data[v] === "object" && data[v].type == Type.Folder) {
            enc[v] = new Folder(encrypt(data[v], key, index));
        }
        else {
            console.error("未知类型");
        }
    }
    return enc;
}
function decrypt(data, key, index = 0) {
    let dec;
    if (data instanceof Password)
        dec = new Password(data);
    else if (data instanceof Folder)
        dec = new Folder(data);
    else
        dec = new Task(data);
    let keyList = Object.keys(data);
    keyList.sort();
    for (let v of keyList) {
        if (v === "type")
            continue;
        if (data[v] === null) {
            dec[v] = null;
        }
        else if (typeof data[v] === "string") {
            dec[v] = cryp.decrypt(data[v], key);
        }
        else if (typeof data[v] === "number") {
            dec[v] = cryp.decrypt(data[v].toString(), key);
        }
        else if (typeof data[v] === "object" && data[v].type == Type.Folder) {
            dec[v] = new Folder(decrypt(data[v], key, index));
        }
        else {
            console.error("未知类型");
        }
    }
    return dec;
}
let addBtn = document.querySelector("#addPwd"); // 添加密码按钮
const main = document.querySelector("#contentDiv"); // main界面
let pwdList = []; // 密码列表
let recentItem = []; // 最近删除的密码列表
let folderList = []; // 文件夹列表
let mainPwd = ""; // 主密码
let isremember = false; // 是否记住密码
let folderIsEditing = false; // 是否正在编辑文件夹
let currentFolder = Folder.root();
let clipboard = new Set();
let mainSetting = new MainSetting();
let score = 0;
let level = 1;
let TODOTasks = [];
// 一些工具函数
function getReadableTime(time) {
    if (typeof time === "string")
        time = new Date(Number(time));
    let minite = time.getMinutes(), strminite = minite.toString();
    if (minite < 10)
        strminite = "0" + minite;
    let sec = time.getSeconds(), strsec = sec.toString();
    if (sec < 10)
        strsec = "0" + sec;
    return time.getFullYear() + "/" + (time.getMonth() + 1) + "/" + time.getDate() + " " + time.getHours() + ":" + strminite + ":" + strsec;
}
function hasDir(path, name, exceptIndex = []) {
    for (let i = 0; i < folderList.length; i++) {
        if (folderList[i].name == name && folderList[i].parent == path && exceptIndex.indexOf(i) == -1) {
            return true;
        }
    }
    return false;
}
function mkdir(dir) {
    let parent = Folder.fromString(dir.parent);
    if (folderList.findIndex(v => v.isSame(dir)) != -1 || dir.isSame(Folder.root())) {
        return; // 文件夹已存在
    }
    if (folderList.findIndex(v => v.isSame(parent)) == -1) {
        mkdir(parent);
    }
    folderList.push(dir);
    saveData();
}
function init(dir) {
    saveData();
    update(dir);
}
function moveItem(type, index, dir_to, isCopy = false) {
    if (type == Type.Password) {
        if (isCopy)
            pwdList[pwdList.push(new Password(pwdList[index])) - 1].dir = new Folder(dir_to);
        else
            pwdList[index].dir = dir_to;
    }
    else {
        if (hasDir(dir_to.stringify(), folderList[index].name)) {
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
        if (isCopy)
            folderList[folderList.push(new Folder(folderList[index])) - 1].parent = dir_to.stringify();
        else
            folderList[index].parent = dir_to.stringify();
    }
}
// 渲染编辑密码界面，并更改密码，isAppend表示是否是添加密码，为true时，取消将会删除该密码，会返回main界面
function changePwd(by, index, dir, isAppend = false) {
    var _a, _b;
    let inner = `
    <div class="title">编辑密码</div>
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
    `;
    main.innerHTML = inner;
    let require = ["#from", "#pwd", "#uname"];
    for (let i = 0; i < require.length; i++) {
        const it = document.querySelector(require[i]);
        it === null || it === void 0 ? void 0 : it.addEventListener("input", () => {
            if (it.value == "") {
                it.classList.add("invaild");
                it.classList.remove("vaild");
            }
            else {
                it.classList.add("vaild");
                it.classList.remove("invaild");
            }
        });
    }
    const rd = document.querySelector("#randpwd");
    rd === null || rd === void 0 ? void 0 : rd.addEventListener("click", () => {
        const pwd = document.querySelector("#pwd");
        pwd.value = randstr(16);
        pwd.dispatchEvent(new Event("input"));
    });
    (_a = document.querySelector("#submit")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
        let name = document.querySelector("#from").value;
        let uname = document.querySelector("#uname").value;
        let pwd = document.querySelector("#pwd").value;
        let email = document.querySelector("#email").value;
        let phone = document.querySelector("#phone").value;
        let note = document.querySelector("#note").value;
        if (name == "" || uname == "" || pwd == "") {
            mkDialog("提交失败！", "来源、用户名和密码不能为空。");
            return;
        }
        const dir = by[index].dir;
        by[index] = new Password(name, uname, pwd, note, email, phone, dir);
        if (isAppend) {
            Task.tryDone("初出茅庐");
            Task.tryDone("好事成双");
        }
        else {
            Task.tryDone("密码的产后护理");
        }
        if (checkSafety(index) == "")
            Task.tryDone("安全密码养成记");
        init(dir);
    });
    (_b = document.querySelector("#cancel")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
        if (isAppend) {
            by.splice(index, 1);
        }
        update(dir);
    });
}
// 删除密码，type为类型，index为索引，dir_from为来源文件夹，在外部的调用中，_save不应被填写
function deleteItem(type, index, dir_from, _save = true) {
    if (type == Type.Password) {
        Task.tryDone("密码清理，双倍给力！");
        clipboard.delete({ type: Type.Password, index: index });
        pwdList[index].dir = Folder.fromString(Folder.bin().stringify() + pwdList[index].dir.stringify().slice(2));
        pwdList[index].rmDate = Date.now().toString();
        recentItem.unshift(new Password(pwdList[index]));
        pwdList.splice(index, 1);
    }
    else {
        clipboard.delete({ type: Type.Folder, index: index });
        pwdList.forEach((item, i) => {
            if (folderList[index].isInclude(item)) {
                deleteItem(Type.Password, i, dir_from, false);
            }
        });
        folderList.forEach((item, i) => {
            if (folderList[index].isInclude(item)) {
                deleteItem(Type.Folder, i, dir_from, false);
            }
        });
        folderList[index] = Folder.fromString(Folder.bin().stringify() + folderList[index].stringify().slice(2), folderList[index].moDate);
        folderList[index].rmDate = Date.now().toString();
        recentItem.unshift(new Folder(folderList[index]));
        folderList.splice(index, 1);
    }
    if (_save) {
        init(dir_from);
    }
}
function deleterecentItem(index) {
    // 删除最近删除的密码
    if (Array.isArray(index)) {
        for (let i of index) {
            if (recentItem[i].type == Type.Password) {
                Task.tryDone("密码清除？不留痕迹！");
                break;
            }
        }
        recentItem = recentItem.filter((item, i) => {
            return !index.includes(i);
        });
    }
    else {
        if (recentItem[index].type == Type.Password)
            Task.tryDone("密码清除？不留痕迹！");
        recentItem.splice(index, 1);
    }
    saveData();
}
function recoverPwd(index) {
    // 恢复最近删除的密码
    recentItem[index].rmDate = null;
    if (recentItem[index] instanceof Password) {
        Task.tryDone("密码复活术");
        recentItem[index].dir = Folder.fromString(Folder.root().stringify() + recentItem[index].dir.stringify().slice(2));
        mkdir(recentItem[index].dir);
        pwdList.push(recentItem[index]);
    }
    else {
        let x = recentItem[index].moDate;
        recentItem[index] = Folder.fromString(Folder.root().stringify() + recentItem[index].stringify().slice(2));
        recentItem[index].moDate = x;
        mkdir(Folder.fromString(recentItem[index].parent));
        let has = false;
        folderList.forEach((item) => {
            if (item.isSame(recentItem[index])) {
                has = true;
            }
        });
        if (!has)
            mkdir(recentItem[index]);
    }
    recentItem.splice(index, 1);
    saveData();
}
function addPwd(dir) {
    // 添加密码
    let tgt = pwdList.length;
    pwdList.push(new Password("", "", "", "", "", "", dir));
    changePwd(pwdList, tgt, dir, true);
}
function checkSafety(index) {
    let list = [], safety = "";
    for (let i = 0; i < pwdList.length; i++) {
        if (pwdList[i].pwd == pwdList[index].pwd && i != index) {
            list.push(i);
        }
    }
    if (list.length == 1) {
        safety += `<p style="color: orange">此密码与${pwdList[list[0]].from}的密码是重复的。</p>`;
    }
    else if (list.length == 2) {
        safety += `<p style="color: orange">此密码与${pwdList[list[0]].from}和${pwdList[list[1]].from}的密码是重复的。</p>`;
    }
    else if (list.length > 2) {
        safety += `<p style="color: red">此密码与${pwdList[list[0]].from}、${pwdList[list[1]].from}等${list.length}个来源的密码是重复的。</p>`;
    }
    let isR = false;
    for (let i = 0; i < simplePwd.length; i++) {
        if (pwdList[index].pwd == simplePwd[i]) {
            safety += `<p style="color: red">此密码很容易暴露。</p>`;
            isR = true;
        }
    }
    if (!isR)
        for (let i = 0; i < lessSimplePwd.length; i++) {
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
// 显示密码， from表示从哪个页面跳转过来的，如果是从最近删除跳转过来的，返回时会返回到最近删除页面，否则返回到主页面，需要填写Page枚举
function showPwd(by, index, from) {
    var _a, _b, _c, _d, _e, _f, _g;
    let inner = `
    <div class="form">
    <div class="formItem_Copy"><label for="from">来源：</label><input type="text" id="from" class="vaild" value="${by[index].from}" readonly /><img class="icon" src="./resources/copy.png" id="fromCopy" title="复制"></div>
    <div class="formItem_Copy"><label for="uname">用户名：</label><input type="text" id="uname" class="vaild" value="${by[index].uname}" readonly /><img class="icon" src="./resources/copy.png" id="unameCopy" title="复制"></div>
    <div class="formItem_Copy"><label for="pwd">密码：</label><input type="password" id="pwd" class="vaild" value="${by[index].pwd}" readonly /><img class="icon" src="./resources/copy.png" id="pwdCopy" title="复制"></div>
    <div class="formItem" id="safety"></div>
    <div class="formItem_Copy"><label for="email">邮箱：</label><input type="text" id="email" class="vaild" value="${by[index].email}" readonly /><img class="icon" src="./resources/copy.png" id="emailCopy" title="复制"></div>
    <div class="formItem_Copy"><label for="phone">手机号：</label><input type="text" id="phone" class="vaild" value="${by[index].phone}" readonly /><img class="icon" src="./resources/copy.png" id="phoneCopy" title="复制"></div>
    <div class="formItem_Copy"><p>修改时间：${getReadableTime(by[index].moDate)}</p></div>
    ${from.isSame(Folder.bin()) ? `<div class="formItem_Copy"><p>删除时间：${getReadableTime(by[index].rmDate)}</p></div>` : ""}
    <div class="formItem"><label for="note">备注：</label><br><textarea id="note" readonly>${by[index].note}</textarea></div>
    </div>
    <div class="action" id="back"><p>返回</p></div>
    `;
    main.innerHTML = inner;
    const safety = document.querySelector("#safety");
    Task.tryDone("例行检查");
    if (from != Folder.bin()) {
        safety.innerHTML = checkSafety(index);
        if (safety.innerHTML == "")
            safety.style.display = "none";
    }
    (_a = document.querySelector("input#pwd")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", (e) => {
        if (e.target.type == "password")
            e.target.type = "text";
        else
            document.querySelector("input#pwd").type = "password";
    });
    (_b = document.querySelector("#fromCopy")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
        var _a, _b, _c;
        if (((_a = document.querySelector("#from")) === null || _a === void 0 ? void 0 : _a.getAttribute("copyed")) == "true") {
            return;
        }
        if (copyToClipboard(pwdList[index].from)) {
            (_b = document.querySelector("#fromCopy")) === null || _b === void 0 ? void 0 : _b.setAttribute("src", "./resources/copy_done.png");
            (_c = document.querySelector("#from")) === null || _c === void 0 ? void 0 : _c.setAttribute("copyed", "true");
            setTimeout(() => {
                var _a, _b;
                (_a = document.querySelector("#fromCopy")) === null || _a === void 0 ? void 0 : _a.setAttribute("src", "./resources/copy.png");
                (_b = document.querySelector("#from")) === null || _b === void 0 ? void 0 : _b.removeAttribute("copyed");
            }, 1000);
        }
    });
    (_c = document.querySelector("#unameCopy")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => {
        var _a, _b, _c;
        if (((_a = document.querySelector("#uname")) === null || _a === void 0 ? void 0 : _a.getAttribute("copyed")) == "true") {
            return;
        }
        if (copyToClipboard(pwdList[index].uname)) {
            (_b = document.querySelector("#unameCopy")) === null || _b === void 0 ? void 0 : _b.setAttribute("src", "./resources/copy_done.png");
            (_c = document.querySelector("#uname")) === null || _c === void 0 ? void 0 : _c.setAttribute("copyed", "true");
            setTimeout(() => {
                var _a, _b;
                (_a = document.querySelector("#unameCopy")) === null || _a === void 0 ? void 0 : _a.setAttribute("src", "./resources/copy.png");
                (_b = document.querySelector("#uname")) === null || _b === void 0 ? void 0 : _b.removeAttribute("copyed");
            }, 1000);
        }
    });
    (_d = document.querySelector("#pwdCopy")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", () => {
        var _a, _b, _c;
        if (((_a = document.querySelector("#pwd")) === null || _a === void 0 ? void 0 : _a.getAttribute("copyed")) == "true") {
            return;
        }
        if (copyToClipboard(pwdList[index].pwd)) {
            (_b = document.querySelector("#pwdCopy")) === null || _b === void 0 ? void 0 : _b.setAttribute("src", "./resources/copy_done.png");
            (_c = document.querySelector("#pwd")) === null || _c === void 0 ? void 0 : _c.setAttribute("copyed", "true");
            setTimeout(() => {
                var _a, _b;
                (_a = document.querySelector("#pwdCopy")) === null || _a === void 0 ? void 0 : _a.setAttribute("src", "./resources/copy.png");
                (_b = document.querySelector("#pwd")) === null || _b === void 0 ? void 0 : _b.removeAttribute("copyed");
            }, 1000);
        }
    });
    (_e = document.querySelector("#emailCopy")) === null || _e === void 0 ? void 0 : _e.addEventListener("click", () => {
        var _a, _b, _c;
        if (((_a = document.querySelector("#email")) === null || _a === void 0 ? void 0 : _a.getAttribute("copyed")) == "true") {
            return;
        }
        if (copyToClipboard(pwdList[index].email)) {
            (_b = document.querySelector("#emailCopy")) === null || _b === void 0 ? void 0 : _b.setAttribute("src", "./resources/copy_done.png");
            (_c = document.querySelector("#email")) === null || _c === void 0 ? void 0 : _c.setAttribute("copyed", "true");
            setTimeout(() => {
                var _a, _b;
                (_a = document.querySelector("#emailCopy")) === null || _a === void 0 ? void 0 : _a.setAttribute("src", "./resources/copy.png");
                (_b = document.querySelector("#email")) === null || _b === void 0 ? void 0 : _b.removeAttribute("copyed");
            }, 1000);
        }
    });
    (_f = document.querySelector("#phoneCopy")) === null || _f === void 0 ? void 0 : _f.addEventListener("click", () => {
        var _a, _b, _c;
        if (((_a = document.querySelector("#phone")) === null || _a === void 0 ? void 0 : _a.getAttribute("copyed")) == "true") {
            return;
        }
        if (copyToClipboard(pwdList[index].phone)) {
            (_b = document.querySelector("#phoneCopy")) === null || _b === void 0 ? void 0 : _b.setAttribute("src", "./resources/copy_done.png");
            (_c = document.querySelector("#phone")) === null || _c === void 0 ? void 0 : _c.setAttribute("copyed", "true");
            setTimeout(() => {
                var _a, _b;
                (_a = document.querySelector("#phoneCopy")) === null || _a === void 0 ? void 0 : _a.setAttribute("src", "./resources/copy.png");
                (_b = document.querySelector("#phone")) === null || _b === void 0 ? void 0 : _b.removeAttribute("copyed");
            }, 1000);
        }
    });
    (_g = document.querySelector("#back")) === null || _g === void 0 ? void 0 : _g.addEventListener("click", () => {
        if (from == Folder.bin()) {
            update(Folder.bin());
        }
        else {
            update(from);
        }
    });
}
function fmain() {
    document.querySelector("span#nav-mainPage").addEventListener("click", (e) => {
        e.target.classList.add("active");
        update(Folder.root());
    });
    document.querySelector("span#nav-setting").addEventListener("click", (e) => {
        e.target.classList.add("active");
        update(Folder.setting());
    });
    document.querySelector("span#nav-bin").addEventListener("click", (e) => {
        e.target.classList.add("active");
        update(Folder.bin());
    });
    document.querySelector("span#nav-home").addEventListener("click", (e) => {
        e.target.classList.add("active");
        update(Folder.home());
    });
    window.fs.read("./data").then((data) => {
        var _a;
        if (data == "")
            throw new Error("data is null");
        data = data.replace(/\s/g, '');
        let obj = JSON.parse(data);
        mainSetting = obj.mainSetting;
        const salt = obj.salt;
        if (obj.isPwdNull) {
            enc(cryp.pbkdf2("", salt));
        }
        else {
            if (obj.memory !== null && obj.memory !== undefined) {
                let m = obj.memory;
                let dpwd = cryp.pbkdf2(m, salt);
                if (cryp.pbkdf2(dpwd, salt) == obj.mainPwd) {
                    isremember = true;
                    mainPwd = m;
                    enc(dpwd);
                }
                else {
                    isremember = false;
                }
            }
            if (!isremember) {
                main.innerHTML = `
                <div class="title">请输入访问密钥</div>
                <div class="form">
                <div><label for="mainPwd">访问密钥：</label><input type="text" id="mainPwd" class="vaild"/></div>
                <div><input type="checkbox" id="rememberPwd"} style="margin-right: 10px;"/><label for="rememberPwd">记住密钥</label></div>
                </div>
                <div class="action" id="Yes"><p>确定</p></div>
                <div id="error"></div>
                `;
                document.querySelector("#navBar").style.display = "none";
                (_a = document.querySelector("#Yes")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
                    let m = document.querySelector("#mainPwd").value;
                    let dpwd = cryp.pbkdf2(m, salt);
                    if (cryp.pbkdf2(dpwd, salt) == obj.mainPwd) {
                        isremember = document.querySelector("#rememberPwd").checked;
                        mainPwd = m;
                        document.querySelector("#navBar").style.display = "flex";
                        enc(dpwd);
                        saveData();
                    }
                    else {
                        document.querySelector("#error").innerHTML = `
                        <div class="alert alert-danger alert-dismissible fade show" role="alert">
                            <strong>密钥错误！</strong>你需要检查你的密钥。
                        </div>`;
                        let alert = new bootstrap.Alert(document.querySelector(".alert"));
                        setTimeout(() => {
                            alert.close();
                        }, 1000);
                    }
                });
            }
        }
        function enc(key) {
            obj.pwd.forEach((element) => {
                pwdList.push(decrypt(new Password(element), key));
            });
            obj.folder.forEach((element) => {
                folderList.push(decrypt(new Folder(element), key));
            });
            obj.recent.forEach((element) => {
                if (element.type == Type.Password)
                    recentItem.push(decrypt(new Password(element), key));
                else
                    recentItem.push(decrypt(new Folder(element), key));
            });
            obj.TODOTasks.forEach((element) => {
                TODOTasks.push(TaskMap.dec(element, key));
            });
            for (let i = 0; i < obj.TODOTasks.length; i++) {
                TODOTasks.push(new TaskMap(obj.TODOTasks[i]));
            }
            score = Number(cryp.decrypt(obj.score, key));
            level = Number(cryp.decrypt(obj.level, key));
            document.querySelector("#nav-home").click();
        }
    }).catch((err) => {
        console.log(err);
        for (let i = 0; i < tasks.length; i++) {
            TODOTasks.push(new TaskMap(i, 0));
        }
        document.querySelector("#nav-home").click();
    });
}
fmain();
