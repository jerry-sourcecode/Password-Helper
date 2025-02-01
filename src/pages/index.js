"use strict";
const showNoteMaxLength = 152; // 在main页面显示备注的最大长度
const showOtherMaxLength = 60; // 在main页面显示来源、用户名、密码的最大长度
var Page;
(function (Page) {
    Page[Page["Main"] = 0] = "Main";
    Page[Page["Change"] = 1] = "Change";
    Page[Page["Show"] = 2] = "Show";
    Page[Page["Recent"] = 3] = "Recent";
})(Page || (Page = {}));
var Type;
(function (Type) {
    Type[Type["Folder"] = 0] = "Folder";
    Type[Type["Password"] = 1] = "Password";
})(Type || (Type = {}));
class Password {
    constructor(fromOrdata = "", uname = "", pwd = "", note = "", email = "", phone = "", dir = new Folder("")) {
        this.type = Type.Password; // 类型
        this.type = Type.Password;
        if (typeof fromOrdata === "string") {
            this.from = fromOrdata;
            this.uname = uname;
            this.pwd = pwd;
            this.note = note;
            this.email = email;
            this.phone = phone;
            this.dir = new Folder(dir.name, dir.parent);
        }
        else {
            this.from = fromOrdata.from;
            this.uname = fromOrdata.uname;
            this.pwd = fromOrdata.pwd;
            this.note = fromOrdata.note;
            this.email = fromOrdata.email;
            this.phone = fromOrdata.phone;
            this.dir = new Folder(fromOrdata.dir.name, fromOrdata.dir.parent);
        }
    }
    getHtml(id) {
        return `
        <div class="info" id="pwd${id}" draggable="true">
            ${this.getBaseHtml()}
            <div class="tool">
                <img class="icon" id="pwd${id}-edit" style="margin-right: 8px;" src="./resources/edit.png" title="编辑">
                <img class="icon" id="pwd${id}-delete" src="./resources/delete.png" title="删除">
            </div>
        </div>
        `;
    }
    getHtmlRecent(id) {
        return `
        <div class="info" id="recent${id}" draggable="true">
            ${this.getBaseHtml()}
            <div class="tool">
                <img class="icon" id="recent${id}-recover" style="margin-right: 8px;" src="./resources/recovery.png" title="恢复">
                <img class="icon" id="recent${id}-delete" src="./resources/delete.png" title="删除">
            </div>
        </div>
        `;
    }
    getBaseHtml() {
        function format(str, max = showOtherMaxLength) {
            if (str.length == 0) {
                return "暂无";
            }
            let left = max;
            for (let i = 0; i < str.length; i++) {
                left -= isFullWidthChar(str[i]) ? 2 : 1;
                if (left < 0) {
                    return str.slice(0, i) + "...";
                }
            }
            return str;
        }
        return `<p>来源：${format(this.from)}</p>
            <p>用户名：${format(this.uname)}</p>
            <p>密码：${format(this.pwd)}</p>
            ${this.email == "" ? "" : `<p>邮箱：${format(this.email)}</p>`}
            ${this.phone == "" ? "" : `<p>电话：${format(this.phone)}</p>`}
            ${this.note == "" ? "" : `<p>备注：${format(this.note, showNoteMaxLength)}</p>`}`;
    }
    ;
}
class Folder {
    /*
    name: 文件夹名称
    parent: 文件夹路径
    parent的格式如下：
    ":/a/"表示在主文件夹下的a文件夹内
    ":/"表示在主文件夹下
    */
    constructor(nameOrClass, parent = ":/") {
        this.type = Type.Folder;
        this.type = Type.Folder;
        if (typeof nameOrClass === "string") {
            this.name = nameOrClass;
            this.parent = parent;
        }
        else {
            this.name = nameOrClass.name;
            this.parent = nameOrClass.parent;
        }
    }
    stringify() {
        return this.parent + this.name;
    }
    isMain() {
        return this.stringify() == ":/";
    }
    static root() {
        return new Folder("", ":/");
    }
    isSame(folder) {
        return this.stringify() == folder.stringify();
    }
    getHtml(id) {
        return `
        <div class="info" id="folder${id}" draggable="true">
            <p>${this.name}</p>
            <div class="tool">
                <img class="icon" id="folder${id}-edit" style="margin-right: 8px;" src="./resources/edit.png" title="重命名">
                <img class="icon" id="folder${id}-delete" src="./resources/delete.png" title="删除">
            </div>
        </div>
        `;
    }
    getHtmlRecent(id) {
        return `
        <div class="info" id="recent${id}" draggable="true">
            <p>${this.name}</p>
            <div class="tool">
                <img class="icon" id="recent${id}-recover" style="margin-right: 8px;" src="./resources/recovery.png" title="恢复">
                <img class="icon" id="recent${id}-delete" src="./resources/delete.png" title="删除">
            </div>
        </div>
        `;
    }
}
function encrypt(data, key) {
    let enc;
    if (data instanceof Password)
        enc = new Password(data);
    else
        enc = new Folder(data);
    let index = 0;
    function getKey() {
        let dkey = key + key; // 重复主密码
        let res = dkey.slice(index, index + key.length); // 取出主密码
        index++;
        if (index >= key.length)
            index = 0;
        return res;
    }
    for (let v of Object.keys(data)) {
        if (typeof data[v] === "string") {
            enc[v] = window.cryp.encrypt(data[v], getKey());
        }
    }
    return enc;
}
function decrypt(data, key) {
    let dec;
    if (data instanceof Password)
        dec = new Password(data);
    else
        dec = new Folder(data);
    let index = 0;
    function getKey() {
        let dkey = key + key; // 重复主密码
        let res = dkey.slice(index, index + key.length); // 取出主密码
        index++;
        if (index >= key.length)
            index = 0;
        return res;
    }
    for (let v of Object.keys(data)) {
        if (typeof data[v] == "string") {
            dec[v] = window.cryp.decrypt(data[v], getKey());
        }
    }
    return dec;
}
let addBtn = document.querySelector("#addPwd"); // 添加密码按钮
const main = document.querySelector("#mainDiv"); // main界面
let pwdList = []; // 密码列表
let recentItem = []; // 最近删除的密码列表
let folderList = []; // 文件夹列表
let mainPwd = ""; // 主密码
let isremember = false; // 是否记住密码
// 一些工具函数
function random(a, b) {
    return Math.floor(Math.random() * (b - a) + a);
}
function randstr(length) {
    let res = "";
    let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_+-=[]{}|;':,.<>/?";
    for (let i = 0; i < length; i++) {
        res += chars[random(0, chars.length)];
    }
    return res;
}
function isFullWidthChar(c) {
    return c.charCodeAt(0) > 255;
}
function copyToClipboard(str) {
    let success = true;
    navigator.clipboard.writeText(str)
        .then(() => {
        success = true;
    }).catch((err) => {
        console.error("can't copy to clipboard: " + err);
        success = false;
    });
    return success;
}
function saveData() {
    let salt = randstr(16);
    let enc = window.cryp.pbkdf2(mainPwd, salt);
    let pwdListUpdated = [];
    let folderListUpdated = [];
    let recentItemUpdated = [];
    for (let index = 0; index < pwdList.length; index++) {
        pwdListUpdated.push(encrypt(pwdList[index], enc));
    }
    for (let index = 0; index < folderList.length; index++) {
        folderListUpdated.push(encrypt(folderList[index], enc));
    }
    for (let index = 0; index < recentItem.length; index++) {
        recentItemUpdated.push(encrypt(recentItem[index], enc));
    }
    // 数据保存
    let data = JSON.stringify({
        version: "1.0",
        pwd: pwdListUpdated,
        folder: folderListUpdated,
        recent: recentItemUpdated,
        mainPwd: window.cryp.pbkdf2(enc, salt),
        salt: salt,
        memory: isremember ? mainPwd : null,
        isPwdNull: mainPwd === "",
    });
    window.fs.save("./data", data);
}
// 渲染main界面
function update(by = pwdList, by_dirList = folderList, dir = Folder.root()) {
    var _a, _b, _c;
    let inner = `<div class="title">密码列表</div>
    <div style="position: absolute; top: 15px; right: 45px;" id="MainToolBar">
        <img src="../pages/resources/setting.png" title="设置" class="icon" style="width: 25px;height: 25px;" id="setting">
        <img src="../pages/resources/newFolder.png" title="新建文件夹" class="icon" style="width: 25px;height: 25px;" id="newFolder">
    </div>
    `;
    let has = false;
    for (let i = 0; i < folderList.length; i++) {
        if (folderList[i].parent == dir.parent)
            inner += folderList[i].getHtml(i);
        has = true;
    }
    for (let i = 0; i < by.length; i++) {
        if (by[i].dir.isSame(dir))
            inner += by[i].getHtml(i);
        has = true;
    }
    if (!has) {
        inner += `<p>暂无密码</p>`;
    }
    inner += `
    <div class="info" id="recent">
        <p>最近删除</p>
    </div>
    <div class="action" id="addPwd"><p>添加密码</p></div>
    `;
    main.innerHTML = inner;
    (_a = document.querySelector("#setting")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
        setting();
    });
    (_b = document.querySelector("#newFolder")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
        let k = new Set();
        for (let i = 0; i < folderList.length; i++) {
            if (folderList[i].parent == dir.parent) {
                if (folderList[i].name == "新建文件夹")
                    k.add(0);
                if (folderList[i].name.length >= 5 && folderList[i].name.slice(0, 5) == "新建文件夹") {
                    let can = true;
                    for (let j = 5; j < folderList[i].name.length; j++) {
                        if (isNaN(Number(folderList[i].name[j]))) {
                            can = false;
                            break;
                        }
                    }
                    if (can) {
                        k.add(Number(folderList[i].name.slice(5)));
                    }
                }
            }
        }
        let lowerBound = 0;
        while (true) {
            if (!k.has(lowerBound)) {
                break;
            }
            lowerBound++;
        }
        folderList.push(new Folder(`新建文件夹${lowerBound == 0 ? "" : lowerBound}`, ":/"));
        update();
    });
    addBtn = document.querySelector("#addPwd");
    addBtn === null || addBtn === void 0 ? void 0 : addBtn.addEventListener("click", () => {
        addPwd();
    });
    for (let i = 0; i < pwdList.length; i++) {
        const editBtn = document.querySelector(`#pwd${i}-edit`);
        editBtn.addEventListener("click", (e) => {
            e === null || e === void 0 ? void 0 : e.stopPropagation();
            changePwd(by, i);
        });
    }
    for (let i = 0; i < pwdList.length; i++) {
        const deleteBtn = document.querySelector(`#pwd${i}-delete`);
        deleteBtn.addEventListener("click", (e) => {
            e === null || e === void 0 ? void 0 : e.stopPropagation();
            deletePwd(i);
        });
    }
    for (let i = 0; i < folderList.length; i++) {
        const feditBtn = document.querySelector(`#folder${i}-edit`);
        feditBtn.addEventListener("click", (e) => {
            e === null || e === void 0 ? void 0 : e.stopPropagation();
            const div = document.querySelector(`#folder${i}`);
            div.innerHTML = `<input type="text" value="${folderList[i].name}" id="folder${i}-input">`;
            const input = document.querySelector(`#folder${i}-input`);
            input.focus();
            input.select();
            input.addEventListener("blur", () => {
                folderList[i].name = input.value;
                div.outerHTML = folderList[i].getHtml(i);
                update();
            });
        });
    }
    for (let i = 0; i < folderList.length; i++) {
        const fdeleteBtn = document.querySelector(`#folder${i}-delete`);
        fdeleteBtn.addEventListener("click", (e) => {
            e === null || e === void 0 ? void 0 : e.stopPropagation();
            recentItem.push(folderList[i]);
            folderList.splice(i, 1);
            update();
        });
    }
    for (let i = 0; i < pwdList.length; i++) {
        const info = document.querySelector(`#pwd${i}`);
        info.addEventListener("click", () => {
            showPwd(pwdList, i);
        });
    }
    (_c = document.querySelector("#recent")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => {
        showRecent();
    });
}
// 渲染编辑密码界面，并更改密码，isAppend表示是否是添加密码，为true时，取消将会删除该密码，会返回main界面
function changePwd(by, index, isAppend = false) {
    var _a, _b;
    let inner = `
    <div class="title">编辑密码</div>
    <div class="form">
    <div class="formItem"><label for="from">来源<span style="color:red;">*</span>：</label><input type="text" id="from" class="${by[index].from == "" ? "invaild" : "vaild"}" value="${by[index].from}" /><span class="check"></span></div>
    <div class="formItem"><label for="uname">用户名<span style="color:red;">*</span>：</label><input type="text" id="uname" class="${by[index].uname == "" ? "invaild" : "vaild"}" value="${by[index].uname}" /><span class="check"></span></div>
    <div class="formItem"><label for="pwd">密码<span style="color:red;">*</span>：</label><input type="text" id="pwd" class="${by[index].pwd == "" ? "invaild" : "vaild"}" value="${by[index].pwd}" /><span class="check"></span></div>
    <div class="formItem"><label for="email">邮箱：</label><input type="text" id="email" value="${by[index].email}"></div>
    <div class="formItem"><label for="phone">手机号：</label><input type="text" id="phone" value="${by[index].phone}"></div>
    <div class="formItem"><label for="note">备注：</label><br><textarea id="note" placeholder="可以在这里输入一些想说的话。">${by[index].note}</textarea></div>
    </div>
    <div class="action" style="background-color: #fc5531" id="random"><p>随机生成一个高强度的密码</p></div>
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
    const rd = document.querySelector("#random");
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
            alert("请填写完整信息");
            return;
        }
        by[index] = new Password(name, uname, pwd, note, email, phone, new Folder(""));
        saveData();
        update();
    });
    (_b = document.querySelector("#cancel")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
        if (isAppend) {
            by.splice(index, 1);
        }
        update();
    });
}
function deletePwd(index) {
    // 删除密码
    recentItem.unshift(new Password(pwdList[index]));
    pwdList.splice(index, 1);
    saveData();
    update();
}
function deleterecentItem(index) {
    // 删除最近删除的密码
    recentItem.splice(index, 1);
    saveData();
}
function recoverPwd(index) {
    // 恢复最近删除的密码
    if (recentItem[index] instanceof Password)
        pwdList.push(recentItem[index]);
    else
        folderList.push(recentItem[index]);
    recentItem.splice(index, 1);
    saveData();
    update();
}
function addPwd() {
    // 添加密码
    let tgt = pwdList.length;
    pwdList.push(new Password("", "", "", "", "", "", new Folder("")));
    changePwd(pwdList, tgt, true);
}
// 显示密码， from表示从哪个页面跳转过来的，如果是从最近删除跳转过来的，返回时会返回到最近删除页面，否则返回到主页面，需要填写Page枚举
function showPwd(by, index, from = Page.Main) {
    var _a, _b, _c, _d, _e, _f;
    let inner = `
    <div class="form">
    <div class="formItem_Copy"><label for="from">来源：</label><input type="text" id="from" class="vaild" value="${by[index].from}" readonly /><img class="icon" src="./resources/copy.png" id="fromCopy" title="复制"></div>
    <div class="formItem_Copy"><label for="uname">用户名：</label><input type="text" id="uname" class="vaild" value="${by[index].uname}" readonly /><img class="icon" src="./resources/copy.png" id="unameCopy" title="复制"></div>
    <div class="formItem_Copy"><label for="pwd">密码：</label><input type="text" id="pwd" class="vaild" value="${by[index].pwd}" readonly /><img class="icon" src="./resources/copy.png" id="pwdCopy" title="复制"></div>
    <div class="formItem_Copy"><label for="email">邮箱：</label><input type="text" id="email" class="vaild" value="${by[index].email}" readonly /><img class="icon" src="./resources/copy.png" id="emailCopy" title="复制"></div>
    <div class="formItem_Copy"><label for="phone">手机号：</label><input type="text" id="phone" class="vaild" value="${by[index].phone}" readonly /><img class="icon" src="./resources/copy.png" id="phoneCopy" title="复制"></div>
    <div class="formItem"><label for="note">备注：</label><br><textarea id="note" readonly>${by[index].note}</textarea></div>
    </div>
    <div class="action" id="back"><p>返回</p></div>
    `;
    main.innerHTML = inner;
    (_a = document.querySelector("#fromCopy")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
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
    (_b = document.querySelector("#unameCopy")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
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
    (_c = document.querySelector("#pwdCopy")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => {
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
    (_d = document.querySelector("#emailCopy")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", () => {
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
    (_e = document.querySelector("#phoneCopy")) === null || _e === void 0 ? void 0 : _e.addEventListener("click", () => {
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
    (_f = document.querySelector("#back")) === null || _f === void 0 ? void 0 : _f.addEventListener("click", () => {
        if (from == Page.Main) {
            update();
        }
        else if (from == Page.Recent) {
            showRecent();
        }
    });
}
function showRecent() {
    var _a;
    // 显示最近删除的密码
    let inner = `<div class="title">最近删除</div>`;
    for (let i = 0; i < recentItem.length; i++) {
        inner += recentItem[i].getHtmlRecent(i);
    }
    if (recentItem.length == 0) {
        inner += `<p>暂无删除密码</p>`;
    }
    inner += `
    <div class="action" id="back"><p>返回</p></div>
    `;
    main.innerHTML = inner;
    for (let i = 0; i < recentItem.length; i++) {
        const recoverBtn = document.querySelector(`#recent${i}-recover`);
        recoverBtn.addEventListener("click", (e) => {
            e === null || e === void 0 ? void 0 : e.stopPropagation();
            recoverPwd(i);
            showRecent();
        });
    }
    for (let i = 0; i < recentItem.length; i++) {
        const deleteBtn = document.querySelector(`#recent${i}-delete`);
        deleteBtn.addEventListener("click", (e) => {
            e === null || e === void 0 ? void 0 : e.stopPropagation();
            let result = window.msg.warning("警告", "此操作不可撤销，你确定要永久删除吗？", ["确定", "取消"]);
            result.then((res) => {
                if (res == 0) {
                    deleterecentItem(i);
                    showRecent();
                }
            });
        });
    }
    for (let i = 0; i < recentItem.length; i++) {
        const info = document.querySelector(`#recent${i}`);
        info.addEventListener("click", () => {
            if (recentItem[i] instanceof Password)
                showPwd(recentItem, i, Page.Recent);
        });
    }
    (_a = document.querySelector("#back")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
        update();
    });
}
function setting() {
    var _a, _b;
    // 显示设置页面
    main.innerHTML = `
    <div class="title">设置</div>
    <div class="form">
    <div><label for="mainPwd">访问密钥：</label><input type="text" id="mainPwd" class="vaild" value="${mainPwd}"/></div>
    <div><input type="checkbox" id="rememberPwd" ${isremember ? "checked" : ""} style="margin-right: 10px;"/><label for="rememberPwd">记住密钥</label></div>
    </div>
    <div class="action" id="save"><p>保存</p></div>
    <div class="action" id="cancel"><p>取消</p></div>
    `;
    (_a = document.querySelector("#save")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
        mainPwd = document.querySelector("#mainPwd").value;
        isremember = document.querySelector("#rememberPwd").checked;
        saveData();
        update();
    });
    (_b = document.querySelector("#cancel")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
        update();
    });
}
window.fs.read("./data").then((data) => {
    var _a;
    let obj = JSON.parse(data);
    const salt = obj.salt;
    if (obj.isPwdNull) {
        enc(window.cryp.pbkdf2("", salt));
    }
    else {
        if (obj.memory !== null && obj.memory !== undefined) {
            let m = obj.memory;
            let dpwd = window.cryp.pbkdf2(m, salt);
            if (window.cryp.pbkdf2(dpwd, salt) == obj.mainPwd) {
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
            `;
            (_a = document.querySelector("#Yes")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
                let m = document.querySelector("#mainPwd").value;
                let dpwd = window.cryp.pbkdf2(m, salt);
                if (window.cryp.pbkdf2(dpwd, salt) == obj.mainPwd) {
                    isremember = document.querySelector("#rememberPwd").checked;
                    mainPwd = m;
                    enc(dpwd);
                }
                ;
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
        update();
    }
}).catch((err) => {
    console.log(err);
    pwdList = [];
    recentItem = [];
    update();
});
