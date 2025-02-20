"use strict";
const simplePwd = [
    "12345",
    "123456",
    "123456789",
    "test1",
    "password",
    "12345678",
    "asdf",
    "qwerty",
    "1234567890",
    "1234567",
    "1234",
    "abc123",
    "111111",
    "123123",
    "password1",
    "987654321",
    "qwertyuiop",
    "mynoob",
    "123321",
    "666666",
    "18atcskd2w",
    "7777777",
    "1q2w3e4r",
    "654321",
    "555555",
    "3rjs1la7qe",
    "google",
    "1q2w3e4r5t",
    "123qwe",
    "zxcvbnm",
    "1q2w3e",
];
const lessSimplePwd = [
    "g_czechout",
    "zinch",
    "Aa123456.",
    "iloveyou",
    "dubsmash",
    "test",
    "princess",
    "sunshine",
    "BvtTest123",
    "11111",
    "ashley",
    "00000",
    "000000",
    "monkey",
    "livetest",
    "55555",
    "soccer",
    "charlie",
    "asdfghjkl",
    "family",
    "michael",
    "123321",
    "football",
    "baseball",
    "q1w2e3r4t5y6",
    "nicole",
    "jessica",
    "purple",
    "shadow",
    "hannah",
    "chocolate",
    "michelle",
    "daniel",
    "maggie",
    "qwerty123",
    "hello",
    "112233",
    "jordan",
    "tigger",
    "superman",
    "12345678910",
    "summer",
    "fitness",
    "bailey",
    "fuckyou",
    "121212",
    "buster",
    "butterfly",
    "dragon",
    "jennifer",
    "amanda",
    "justin",
    "cookie",
    "basketball",
    "shopping",
    "pepper",
    "joshua",
    "hunter",
    "ginger",
    "matthew",
    "abcd1234",
    "taylor",
    "samantha",
    "whatever",
    "andrew",
    "1qaz2wsx3edc",
    "thomas",
    "jasmine",
    "animoto",
    "madison",
    "0987654321",
    "54321",
    "flower",
    "Password",
    "maria",
    "babygirl",
    "lovely",
    "sophie",
    "Chegg123",
    "a123456",
    "a123456789",
    "woaini1314",
    "qq123456",
    "abc123456",
    "123456a",
    "123456789a",
    "147258369",
    "a12345678",
    "qq123456789",
    "123456789.",
    "7708801314520",
    "woaini",
    "5201314520",
    "q123456",
    "123456abc",
    "1233211234567",
    "123456.",
    "0123456789",
    "asd123456",
    "aa123456",
    "135792468",
    "q123456789",
    "abcd123456",
    "12345678900",
    "woaini520",
    "woaini123",
    "zxcvbnm123",
    "1111111111111111",
    "w123456",
    "aini1314",
    "abc123456789",
    "woaini521",
    "1314520520",
    "1234567891",
    "qwe123456",
    "asd123",
    "1472583690",
    "1357924680",
    "789456123",
    "123456789abc",
    "z123456",
    "1234567899",
    "aaa123456",
    "www123456",
    "123456789q",
    "123abc",
    "qwe123",
    "w123456789",
    "7894561230",
    "123456qq",
    "zxc123456",
    "123456789qq",
    "1111111111",
    "111111111",
    "0000000000000000",
    "1234567891234567",
    "qazwsxedc",
    "123456..",
    "zxc123",
    "1234554321",
    "123456q",
    "123456aa",
    "9876543210",
    "110120119",
    "qaz123456",
    "qq5201314",
    "123698745",
    "5201314",
    "as123456",
    "5841314520",
    "z123456789",
    "52013145201314",
    "a123123",
    "caonima",
    "a5201314",
    "wang123456",
    "abcd123",
    "woaini1314520",
    "123456asd",
    "aa123456789",
    "741852963",
    "a12345678"
];
const showNoteMaxLength = 152; // 在main页面显示备注的最大长度
const showOtherMaxLength = 60; // 在main页面显示来源、用户名、密码的最大长度
const showPathMaxLength = 65; // 在main页面显示路径的最大长度
var Type;
(function (Type) {
    Type[Type["Folder"] = 0] = "Folder";
    Type[Type["Password"] = 1] = "Password";
})(Type || (Type = {}));
class Password {
    constructor(fromOrdata = "", uname = "", pwd = "", note = "", email = "", phone = "", dir = Folder.root()) {
        this.type = Type.Password; // 类型
        this.rmDate = null; // 删除日期
        this.type = Type.Password;
        if (typeof fromOrdata === "string") {
            this.moDate = Date.now().toString();
            this.rmDate = null;
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
            this.rmDate = fromOrdata.rmDate;
            this.moDate = fromOrdata.moDate;
        }
    }
    getHtml(id, checkable = false) {
        let tool = `<div class="tool" style="width: ${checkable ? "39vw" : "43vw"};">
            <img class="icon" id="pwd${id}-edit" style="margin-right: 8px;" src="./resources/edit.png" title="编辑">
            <img class="icon" id="pwd${id}-delete" src="./resources/delete.png" title="删除">
        </div>`;
        if (checkable)
            return `<div class="info" style="flex-direction: row;" id="pwd${id}" draggable="true">
            <div class="checkbox" id="pwd${id}-checkboxDiv"><input type="checkbox" id="pwd${id}-checkbox"></div>
            <div class="content">
                ${this.getBaseHtml()}
                ${tool}
            </div>
        </div>`;
        else
            return `<div class="info" id="pwd${id}" draggable="true">
            ${this.getBaseHtml()}
            ${tool}
        </div>`;
    }
    getHtmlRecent(id, checkable = false) {
        let tool = `<div class="tool" style="width: ${checkable ? "39vw" : "43vw"};">
                <p class="icon" id="recent${id}-recover" style="margin-right: 8px;">恢复</p>
                <p class="icon" id="recent${id}-delete">删除</p>
            </div>`;
        if (checkable)
            return `<div class="info" style="flex-direction: row;" id="recent${id}" draggable="true">
            <div class="checkbox" id="recent${id}-checkboxDiv"><input type="checkbox" id="recent${id}-checkbox"></div>
            <div class="content">
                ${this.getBaseHtml(true)}
                ${tool}
            </div>
        </div>`;
        else
            return `<div class="info" id="recent${id}" draggable="true">
            ${this.getBaseHtml(true)}
            ${tool}
        </div>`;
    }
    static format(str, max = showOtherMaxLength, OmitWhere = "back") {
        if (str.length == 0) {
            return "暂无";
        }
        let left = max;
        if (OmitWhere == "front") {
            for (let i = str.length - 1; i >= 0; i--) {
                left -= isFullWidthChar(str[i]) ? 2 : 1;
                if (left < 0) {
                    return "..." + str.slice(i + 1);
                }
            }
        }
        else {
            for (let i = 0; i < str.length; i++) {
                left -= isFullWidthChar(str[i]) ? 2 : 1;
                if (left < 0) {
                    return str.slice(0, i) + "...";
                }
            }
        }
        return str;
    }
    getBaseHtml(isRecent = false) {
        return `<p>来源：${Password.format(this.from)}</p>
            <p>用户名：${Password.format(this.uname)}</p>
            <p>密码：${Password.format(this.pwd)}</p>
            ${this.email == "" ? "" : `<p>邮箱：${Password.format(this.email)}</p>`}
            ${this.phone == "" ? "" : `<p>电话：${Password.format(this.phone)}</p>`}
            ${this.note == "" ? "" : `<p>备注：${Password.format(this.note, showNoteMaxLength)}</p>`}
            <p>${isRecent ? "删除时间" : "修改时间"}：${getReadableTime(isRecent ? this.rmDate : this.moDate)}</p>`;
    }
    ;
    isin(folder) {
        // 检查当前密码是否在folder或folder的子孙目录的目录下
        const f = folder.stringify();
        return f == this.dir.stringify().slice(0, f.length);
    }
}
class Folder {
    /*
    name: 文件夹名称
    parent: 文件夹路径
    parent的格式如下：
    ":/a/"表示在主文件夹下的a文件夹内
    ""表示在主文件夹下
    特别的，主文件夹的name为":"，parent为""，在回收站中的文件name为"~"，parent为""
    */
    constructor(nameOrClass, parent = ":", time = Date.now().toString()) {
        this.type = Type.Folder;
        this.type = Type.Folder;
        if (typeof nameOrClass === "string") {
            this.name = nameOrClass;
            this.parent = parent;
            this.moDate = time;
            this.rmDate = null;
        }
        else {
            this.name = nameOrClass.name;
            this.parent = nameOrClass.parent;
            this.moDate = nameOrClass.moDate;
            this.rmDate = nameOrClass.rmDate;
        }
    }
    getHtml(id, checkable = false) {
        let tool = `<div class="tool" style="width: ${checkable ? "39vw" : "43vw"};">
            <img class="icon" id="folder${id}-edit" style="margin-right: 8px;" src="./resources/edit.png" title="重命名">
            <img class="icon" id="folder${id}-delete" src="./resources/delete.png" title="删除">
        </div>`;
        if (checkable)
            return `<div class="info" style="flex-direction: row;" id="folder${id}" draggable="true">
            <div class="checkbox" id="folder${id}-checkboxDiv"><input type="checkbox" id="folder${id}-checkbox"></div>
            <div class="content">
                <p>${this.name}</p>
                <p>修改日期：${getReadableTime(this.moDate)}</p>
                ${tool}
            </div>
        </div>`;
        else
            return `<div class="info" id="folder${id}" draggable="true">
            <p>${this.name}</p>
            <p>修改日期：${getReadableTime(this.moDate)}</p>
            ${tool}
        </div>`;
    }
    getHtmlRecent(id, checkable = false) {
        let tool = `<div class="tool" style="width: ${checkable ? "39vw" : "43vw"};">
                <p class="icon" id="recent${id}-recover" style="margin-right: 8px;">恢复</p>
                <p class="icon" id="recent${id}-delete">删除</p>
            </div>`;
        if (checkable)
            return `<div class="info" style="flex-direction: row;" id="recent${id}" draggable="true">
            <div class="checkbox" id="recent${id}-checkboxDiv"><input type="checkbox" id="recent${id}-checkbox"></div>
            <div class="content">
                <p>${this.name}</p>
                <p>删除日期：${getReadableTime(this.rmDate)}</p>
                ${tool}
            </div>
        </div>`;
        return `
        <div class="info" id="recent${id}" draggable="true">
            <p>${this.name}</p>
            <p>删除日期：${getReadableTime(this.rmDate)}</p>
            ${tool}
        </div>
        `;
    }
    static root() {
        return new Folder(":", "");
    }
    static bin() {
        return new Folder("~", "");
    }
    static fromString(str, time = Date.now().toString()) {
        if (str[str.length - 1] != "/")
            str += "/";
        const arr = str.split("/");
        let k = arr.slice(0, arr.length - 2).join("/");
        return new Folder(arr[arr.length - 2], k == "" ? "" : k + "/", time);
    }
    stringify() {
        return this.parent + this.name + "/";
    }
    isSame(folder) {
        return this.stringify() == folder.stringify();
    }
    setParent(parent) {
        this.parent = parent.stringify();
    }
    getParent() {
        return Folder.fromString(this.parent);
    }
    // 判断item是否包含在当前文件夹中
    isInclude(item) {
        if (item instanceof Folder)
            return item.parent == this.stringify();
        else
            return item.dir.isSame(this);
    }
    // 判断文件夹是否在当前文件夹或后代文件夹下
    isin(folder) {
        const f = folder.stringify();
        return f == this.parent.slice(0, f.length);
    }
    toReadable() {
        let ans = this.stringify(), lans = "主文件夹 > ";
        for (let i = 2; i < ans.length; i++) {
            if (ans[i] == "/" && i != ans.length - 1)
                lans += " > ";
            else
                lans += ans[i];
        }
        return lans;
    }
}
class MainSetting {
    constructor() {
        this.autoCopy = false;
    }
}
function encrypt(data, key, index = 0) {
    let enc;
    if (data instanceof Password)
        enc = new Password(data);
    else
        enc = new Folder(data);
    function getKey() {
        let dkey = key + key; // 重复主密码
        let res = dkey.slice(index, index + key.length); // 取出主密码
        index++;
        if (index >= key.length)
            index = 0;
        return res;
    }
    let keyList = Object.keys(data);
    keyList.sort();
    for (let v of keyList) {
        if (typeof data[v] === "string") {
            enc[v] = window.cryp.encrypt(data[v], getKey());
        }
        else if (data[v] instanceof Folder) {
            enc[v] = new Folder(encrypt(data[v], key, index));
        }
    }
    return enc;
}
function decrypt(data, key, index = 0) {
    let dec;
    if (data instanceof Password)
        dec = new Password(data);
    else
        dec = new Folder(data);
    function getKey() {
        let dkey = key + key; // 重复主密码
        let res = dkey.slice(index, index + key.length); // 取出主密码
        index++;
        if (index >= key.length)
            index = 0;
        return res;
    }
    let keyList = Object.keys(data);
    keyList.sort();
    for (let v of keyList) {
        if (typeof data[v] == "string") {
            dec[v] = window.cryp.decrypt(data[v], getKey());
        }
        else if (data[v] instanceof Folder) {
            dec[v] = new Folder(decrypt(data[v], key, index));
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
let folderIsEditing = false; // 是否正在编辑文件夹
let currentFolder = Folder.root();
let clipboard = new Set();
let mainSetting = new MainSetting();
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
function getScroll() {
    return {
        top: main.scrollTop || main.scrollTop,
        left: main.scrollLeft || main.scrollLeft
    };
}
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
        mainSetting: mainSetting,
        salt: salt,
        memory: isremember ? mainPwd : null,
        isPwdNull: mainPwd === "",
    });
    window.fs.save("./data", data);
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
function deepCopy(value) {
    if (value === null || typeof value !== "object") {
        return value;
    }
    if (Array.isArray(value)) {
        return value.map(item => deepCopy(item));
    }
    const copied = {};
    for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
            copied[key] = deepCopy(value[key]);
        }
    }
    return copied;
}
function init(dir) {
    saveData();
    update(dir);
}
// 渲染main界面
function update(dir, checkable = false) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    if (dir.stringify() == "~/") {
        showRecent();
        return;
    }
    let topScroll;
    if (dir.isSame(currentFolder)) {
        topScroll = getScroll();
    }
    else {
        topScroll = { top: 0, left: 0 };
    }
    currentFolder = dir;
    let faname = Folder.fromString(dir.parent).name;
    let inner = `<div class="title">密码列表</div>
    ${dir.isSame(Folder.root()) ? "" : `<div class="subtitle">当前位置：${Password.format(dir.toReadable(), showPathMaxLength, "front")}</div>`}
    <div id="MainToolBar">
    ${checkable ?
        `<p class="tool" id="checkable">取消选择</p>
        <p class="tool" id="check-all">全部选择</p>
        <p class="tool" id="check-invert">反向选择</p>
        <img src="../pages/resources/delete.png" title="删除" class="tool" id="delete">
        <img src="../pages/resources/copy.png" title="复制" class="tool" id="copy">`
        :
            `
        <p class="${clipboard.size == 0 ? "invaildTool" : "tool"}" id="paste">粘贴</p>
        <p class="${clipboard.size == 0 ? "invaildTool" : "tool"}" id="move">移动</p>
        <p class="tool" id="checkable">选择</p>
        <img src="../pages/resources/setting.png" title="设置" class="tool" id="setting">
        <img src="../pages/resources/newFolder.png" title="新建文件夹" class="tool" id="newFolder">
        ${dir.isSame(Folder.root()) ? "" : `<img src="../pages/resources/up.png" title="上移到${faname == ":" ? "主文件夹" : faname}" class="tool" id="up">`}`}
    </div>
    `;
    let nowPwds = [];
    let nowFolders = [];
    let has = false;
    for (let i = 0; i < folderList.length; i++) {
        if (dir.isInclude(folderList[i])) {
            nowFolders.push({ item: folderList[i], idx: i });
            has = true;
        }
    }
    for (let i = 0; i < pwdList.length; i++) {
        if (dir.isInclude(pwdList[i])) {
            nowPwds.push({ item: pwdList[i], idx: i });
            has = true;
        }
    }
    nowFolders.sort((a, b) => {
        return a.item.name.localeCompare(b.item.name);
    });
    nowPwds.sort((a, b) => {
        return a.item.from.localeCompare(b.item.from);
    });
    nowFolders.forEach((value, idx) => {
        inner += value.item.getHtml(idx, checkable);
    });
    nowPwds.forEach((value, idx) => {
        inner += value.item.getHtml(idx, checkable);
    });
    if (!has) {
        inner += `<p>暂无密码</p>`;
    }
    inner += `
    <div class="info" id="recent">
        <p>最近删除</p>
    </div>
    ${dir.isSame(Folder.root()) ? "" : `<div class="info" style="display: none" id="parent">
        <p>推拽到此可以上移到${faname == ":" ? "主文件夹" : "“" + faname + "”"}</p>
    </div>`}
    <div class="action" id="addPwd"><p>添加密码</p></div>
    `;
    main.innerHTML = inner;
    (_a = document.querySelector("#setting")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
        setting(dir);
    });
    (_b = document.querySelector("#up")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
        update(dir.getParent());
    });
    (_c = document.querySelector("#checkable")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => {
        update(dir, !checkable);
    });
    if (!dir.isSame(Folder.root())) {
        const parent = document.querySelector("#parent");
        parent.addEventListener("drop", (e) => {
            var _a;
            if (folderIsEditing)
                return;
            e.preventDefault();
            const index = (_a = e === null || e === void 0 ? void 0 : e.dataTransfer) === null || _a === void 0 ? void 0 : _a.getData("text/plain");
            const num = parseInt(index.substring(1));
            parent.style.display = "none";
            if (index[0] == "p") {
                moveItem(Type.Password, num, Folder.fromString(dir.parent));
            }
            else {
                moveItem(Type.Folder, num, Folder.fromString(dir.parent));
            }
            saveData();
            update(dir, checkable);
        });
        parent.addEventListener("dragover", (e) => {
            if (folderIsEditing)
                return;
            e.preventDefault();
        });
    }
    if (checkable) {
        (_d = document.querySelector("#check-all")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", () => {
            nowFolders.forEach((value, index) => {
                document.querySelector(`#folder${index}-checkbox`).checked = true;
            });
            nowPwds.forEach((value, index) => {
                document.querySelector(`#pwd${index}-checkbox`).checked = true;
            });
        });
        (_e = document.querySelector("#check-invert")) === null || _e === void 0 ? void 0 : _e.addEventListener("click", () => {
            nowFolders.forEach((value, index) => {
                document.querySelector(`#folder${index}-checkbox`).checked = !document.querySelector(`#folder${index}-checkbox`).checked;
            });
            nowPwds.forEach((value, index) => {
                document.querySelector(`#pwd${index}-checkbox`).checked = !document.querySelector(`#pwd${index}-checkbox`).checked;
            });
        });
        (_f = document.querySelector("#delete")) === null || _f === void 0 ? void 0 : _f.addEventListener("click", () => {
            nowFolders.forEach((value, index) => {
                if (document.querySelector(`#folder${index}-checkbox`).checked)
                    deleteItem(Type.Folder, index, dir, false);
            });
            nowPwds.forEach((value, index) => {
                if (document.querySelector(`#pwd${index}-checkbox`).checked) {
                    deleteItem(Type.Password, index, dir, false);
                }
            });
            init(dir);
        });
        let copy = document.querySelector("#copy");
        copy === null || copy === void 0 ? void 0 : copy.addEventListener("click", () => {
            clipboard.clear();
            nowFolders.forEach((value, index) => {
                if (document.querySelector(`#folder${index}-checkbox`).checked)
                    clipboard.add({ type: Type.Folder, index: nowFolders[index].idx });
            });
            nowPwds.forEach((value, index) => {
                if (document.querySelector(`#pwd${index}-checkbox`).checked) {
                    clipboard.add({ type: Type.Password, index: nowPwds[index].idx });
                }
            });
            copy.src = "../pages/resources/copy_done.png";
            setTimeout(() => {
                copy.src = "../pages/resources/copy.png";
            }, 1000);
        });
    }
    else {
        (_g = document.querySelector("#paste")) === null || _g === void 0 ? void 0 : _g.addEventListener("click", () => {
            for (let i of clipboard) {
                moveItem(i.type, i.index, dir, true);
            }
            init(dir);
        });
        (_h = document.querySelector("#move")) === null || _h === void 0 ? void 0 : _h.addEventListener("click", () => {
            for (let i of clipboard) {
                moveItem(i.type, i.index, dir);
            }
            clipboard.clear();
            init(dir);
        });
    }
    (_j = document.querySelector("#newFolder")) === null || _j === void 0 ? void 0 : _j.addEventListener("click", () => {
        let k = new Set();
        for (let i = 0; i < folderList.length; i++) {
            if (dir.isInclude(folderList[i])) {
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
        mkdir(new Folder(`新建文件夹${lowerBound == 0 ? "" : lowerBound}`, dir.stringify()));
        update(dir);
    });
    addBtn = document.querySelector("#addPwd");
    addBtn === null || addBtn === void 0 ? void 0 : addBtn.addEventListener("click", () => {
        addPwd(dir);
    });
    for (let i = 0; i < nowPwds.length; i++) {
        const editBtn = document.querySelector(`#pwd${i}-edit`);
        editBtn.addEventListener("click", (e) => {
            e === null || e === void 0 ? void 0 : e.stopPropagation();
            changePwd(pwdList, nowPwds[i].idx, dir);
        });
        const deleteBtn = document.querySelector(`#pwd${i}-delete`);
        deleteBtn.addEventListener("click", (e) => {
            e === null || e === void 0 ? void 0 : e.stopPropagation();
            deleteItem(Type.Password, nowPwds[i].idx, dir);
        });
        const info = document.querySelector(`#pwd${i}`);
        info.addEventListener("click", () => {
            if (folderIsEditing)
                return;
            if (mainSetting.autoCopy) {
                copyToClipboard(pwdList[nowPwds[i].idx].pwd);
                window.msg.infoSync("消息", "密码已复制到剪贴板。");
                return;
            }
            showPwd(pwdList, nowPwds[i].idx, dir);
        });
        info.addEventListener("dragstart", (e) => {
            var _a;
            if (folderIsEditing)
                return;
            if (!dir.isSame(Folder.root()))
                document.querySelector("#parent").style.display = "flex";
            (_a = e === null || e === void 0 ? void 0 : e.dataTransfer) === null || _a === void 0 ? void 0 : _a.setData("text/plain", "p" + nowPwds[i].idx.toString());
        });
        if (checkable) {
            const check = document.querySelector(`#pwd${i}-checkboxDiv`);
            const checkBox = document.querySelector(`#pwd${i}-checkbox`);
            check.addEventListener("click", (e) => {
                e.stopPropagation();
                checkBox.checked = !checkBox.checked;
            });
            checkBox.addEventListener("click", (e) => {
                e.stopPropagation();
            });
        }
    }
    for (let i = 0; i < nowFolders.length; i++) {
        const feditBtn = document.querySelector(`#folder${i}-edit`);
        feditBtn.addEventListener("click", (e) => {
            e === null || e === void 0 ? void 0 : e.stopPropagation();
            const div = document.querySelector(`#folder${i}`);
            div.innerHTML = `<input type="text" value="${nowFolders[i].item.name}" id="folder${i}-input">`;
            const input = document.querySelector(`#folder${i}-input`);
            folderIsEditing = true;
            input.focus();
            input.select();
            input.addEventListener("keydown", (e) => {
                if (e.key == "Enter" && !e.isComposing) {
                    input.blur();
                }
            });
            input.addEventListener("blur", () => {
                let newFolder = new Folder(nowFolders[i].item);
                newFolder.name = input.value;
                folderIsEditing = false;
                if (nowFolders.findIndex(v => (v.item.isSame(newFolder))) != -1 && !newFolder.isSame(nowFolders[i].item)) {
                    window.msg.warning("警告", "文件夹名已存在");
                    init(dir);
                    return;
                }
                for (let j = 0; j < newFolder.name.length; j++) {
                    if (newFolder.name[j] == "/") {
                        window.msg.warning("警告", "文件夹名不能包含“/”");
                        init(dir);
                        return;
                    }
                }
                for (let j = 0; j < pwdList.length; j++) {
                    if (nowFolders[i].item.isInclude(pwdList[j])) {
                        pwdList[j].dir = newFolder;
                    }
                }
                for (let j = 0; j < folderList.length; j++) {
                    if (nowFolders[i].item.isInclude(folderList[j])) {
                        folderList[j].setParent(newFolder);
                    }
                }
                folderList[nowFolders[i].idx] = new Folder(newFolder);
                init(dir);
            });
        });
        const fdeleteBtn = document.querySelector(`#folder${i}-delete`);
        fdeleteBtn.addEventListener("click", (e) => {
            if (folderIsEditing)
                return;
            e === null || e === void 0 ? void 0 : e.stopPropagation();
            deleteItem(Type.Folder, nowFolders[i].idx, dir);
            update(dir);
        });
        const folder = document.querySelector(`#folder${i}`);
        folder.addEventListener("click", () => {
            if (folderIsEditing)
                return;
            update(nowFolders[i].item);
        });
        folder.addEventListener("dragstart", (e) => {
            var _a;
            if (folderIsEditing)
                return;
            if (!dir.isSame(Folder.root()))
                document.querySelector("#parent").style.display = "flex";
            (_a = e === null || e === void 0 ? void 0 : e.dataTransfer) === null || _a === void 0 ? void 0 : _a.setData("text/plain", "f" + nowFolders[i].idx.toString());
        });
        folder.addEventListener("dragover", (e) => {
            if (folderIsEditing)
                return;
            e.preventDefault();
        });
        folder.addEventListener("drop", (e) => {
            var _a;
            if (folderIsEditing)
                return;
            e.preventDefault();
            const index = (_a = e === null || e === void 0 ? void 0 : e.dataTransfer) === null || _a === void 0 ? void 0 : _a.getData("text/plain");
            if (parseInt(index.substring(1)) == nowFolders[i].idx)
                return;
            let error = "";
            function move(info) {
                let id = parseInt(info.substring(1));
                if (info[0] == "p") {
                    moveItem(Type.Password, id, nowFolders[i].item);
                }
                else if (info[0] == "f") {
                    moveItem(Type.Folder, id, nowFolders[i].item);
                }
            }
            move(index);
            if (error != "")
                window.msg.warning("警告", error);
            saveData();
            update(dir, checkable);
        });
        if (checkable) {
            const check = document.querySelector(`#folder${i}-checkboxDiv`);
            const checkBox = document.querySelector(`#folder${i}-checkbox`);
            check.addEventListener("click", (e) => {
                e.stopPropagation();
                checkBox.checked = !checkBox.checked;
            });
            checkBox.addEventListener("click", (e) => {
                e.stopPropagation();
            });
        }
    }
    (_k = document.querySelector("#recent")) === null || _k === void 0 ? void 0 : _k.addEventListener("click", () => {
        if (folderIsEditing)
            return;
        showRecent();
    });
    main === null || main === void 0 ? void 0 : main.scrollTo(topScroll);
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
            window.msg.warningSync("警告", `“${folderList[index].name}”已存在`);
            return;
        }
        let newFolder = new Folder(folderList[index]);
        newFolder.parent = dir_to.stringify();
        if (newFolder.isin(folderList[index])) {
            window.msg.warningSync("警告", `目标文件夹“${folderList[index].name}”是源文件夹的子文件夹`);
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
            alert("请填写完整信息");
            return;
        }
        const dir = by[index].dir;
        by[index] = new Password(name, uname, pwd, note, email, phone, dir);
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
        recentItem = recentItem.filter((item, i) => {
            return !index.includes(i);
        });
    }
    else
        recentItem.splice(index, 1);
    saveData();
}
function recoverPwd(index) {
    // 恢复最近删除的密码
    recentItem[index].rmDate = null;
    if (recentItem[index] instanceof Password) {
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
// 显示密码， from表示从哪个页面跳转过来的，如果是从最近删除跳转过来的，返回时会返回到最近删除页面，否则返回到主页面，需要填写Page枚举
function showPwd(by, index, from) {
    var _a, _b, _c, _d, _e, _f;
    let inner = `
    <div class="form">
    <div class="formItem_Copy"><label for="from">来源：</label><input type="text" id="from" class="vaild" value="${by[index].from}" readonly /><img class="icon" src="./resources/copy.png" id="fromCopy" title="复制"></div>
    <div class="formItem_Copy"><label for="uname">用户名：</label><input type="text" id="uname" class="vaild" value="${by[index].uname}" readonly /><img class="icon" src="./resources/copy.png" id="unameCopy" title="复制"></div>
    <div class="formItem_Copy"><label for="pwd">密码：</label><input type="text" id="pwd" class="vaild" value="${by[index].pwd}" readonly /><img class="icon" src="./resources/copy.png" id="pwdCopy" title="复制"></div>
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
    if (from != Folder.bin()) {
        let list = [];
        for (let i = 0; i < pwdList.length; i++) {
            if (pwdList[i].pwd == by[index].pwd && i != index) {
                list.push(i);
            }
        }
        if (list.length == 1) {
            safety.innerHTML += `<p style="color: orange">此密码与${pwdList[list[0]].from}的密码是重复的。</p>`;
        }
        else if (list.length == 2) {
            safety.innerHTML += `<p style="color: orange">此密码与${pwdList[list[0]].from}和${pwdList[list[1]].from}的密码是重复的。</p>`;
        }
        else if (list.length > 2) {
            safety.innerHTML += `<p style="color: red">此密码与${pwdList[list[0]].from}、${pwdList[list[1]].from}等${list.length}个来源的密码是重复的。</p>`;
        }
        let isR = false;
        for (let i = 0; i < simplePwd.length; i++) {
            if (by[index].pwd == simplePwd[i]) {
                safety.innerHTML += `<p style="color: red">此密码很容易暴露。</p>`;
                isR = true;
            }
        }
        if (!isR)
            for (let i = 0; i < lessSimplePwd.length; i++) {
                if (by[index].pwd == lessSimplePwd[i]) {
                    safety.innerHTML += `<p style="color: orange">此密码比较容易暴露。</p>`;
                    isR = true;
                }
            }
        if (!isR) {
            if (!isNaN(Number(by[index].pwd)))
                safety.innerHTML += `<p style="color: orange">此密码只包含数字，比较容易暴露。</p>`;
            if (by[index].pwd.length <= 3)
                safety.innerHTML += `<p style="color: orange">此密码太短，比较容易暴露。</p>`;
        }
        if (safety.innerHTML == "")
            safety.style.display = "none";
    }
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
        if (from == Folder.bin()) {
            showRecent();
        }
        else {
            update(from);
        }
    });
}
function showRecent(checkable = false) {
    var _a, _b, _c, _d, _e, _f;
    let pos;
    if (currentFolder.isSame(Folder.bin())) {
        pos = getScroll();
    }
    else {
        pos = { top: 0, left: 0 };
    }
    currentFolder = Folder.bin();
    // 显示最近删除的密码
    let inner = `<div class="title">最近删除</div>
    <div id="MainToolBar">
    ${checkable ?
        `<p class="tool" id="checkable">取消选择</p>
        <p class="tool" id="check-all">全部选择</p>
        <p class="tool" id="check-invert">反向选择</p>
        <p class="tool" id="delete">删除</p>
        <p class="tool" id="recover">恢复</p>`
        :
            `<p class="tool" id="checkable">选择</p>`}
    </div>`;
    recentItem.sort((a, b) => {
        return a.rmDate > b.rmDate ? -1 : 1;
    });
    for (let i = 0; i < recentItem.length; i++) {
        inner += recentItem[i].getHtmlRecent(i, checkable);
    }
    if (recentItem.length == 0) {
        inner += `<p>暂无删除密码</p>`;
    }
    inner += `
    <div class="action" id="back"><p>返回</p></div>
    `;
    main.innerHTML = inner;
    (_a = document.querySelector("#checkable")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
        showRecent(!checkable);
    });
    if (checkable) {
        (_b = document.querySelector("#check-all")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
            recentItem.forEach((item, index) => {
                document.querySelector(`#recent${index}-checkbox`).checked = true;
            });
        });
        (_c = document.querySelector("#check-invert")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => {
            recentItem.forEach((item, index) => {
                document.querySelector(`#recent${index}-checkbox`).checked = !document.querySelector(`#recent${index}-checkbox`).checked;
            });
        });
        (_d = document.querySelector("#delete")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", () => {
            let cnt = 0;
            recentItem.forEach((item, index) => {
                if (document.querySelector(`#recent${index}-checkbox`).checked)
                    cnt++;
            });
            if (cnt == 0)
                return;
            let result = window.msg.warning("警告", `此操作不可撤销，你确定要永久删除${cnt}项吗？`, ["确定", "取消"])
                .then((res) => {
                if (res == 0) {
                    let de = [];
                    recentItem.forEach((item, index) => {
                        if (document.querySelector(`#recent${index}-checkbox`).checked)
                            de.push(index);
                    });
                    deleterecentItem(de);
                    showRecent();
                }
            });
        });
        (_e = document.querySelector("#recover")) === null || _e === void 0 ? void 0 : _e.addEventListener("click", () => {
            for (let i = recentItem.length - 1; i >= 0; i--) {
                if (document.querySelector(`#recent${i}-checkbox`).checked)
                    recoverPwd(i);
            }
            showRecent();
        });
    }
    for (let i = 0; i < recentItem.length; i++) {
        const recoverBtn = document.querySelector(`#recent${i}-recover`);
        recoverBtn.addEventListener("click", (e) => {
            e === null || e === void 0 ? void 0 : e.stopPropagation();
            recoverPwd(i);
            showRecent();
        });
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
        const info = document.querySelector(`#recent${i}`);
        info.addEventListener("click", () => {
            if (recentItem[i] instanceof Password)
                showPwd(recentItem, i, Folder.bin());
        });
        if (checkable) {
            const check = document.querySelector(`#recent${i}-checkboxDiv`);
            const checkbox = document.querySelector(`#recent${i}-checkbox`);
            check.addEventListener("click", (e) => {
                e.stopPropagation();
                checkbox.checked = !checkbox.checked;
            });
            checkbox.addEventListener("click", (e) => {
                e.stopPropagation();
            });
        }
    }
    (_f = document.querySelector("#back")) === null || _f === void 0 ? void 0 : _f.addEventListener("click", () => {
        update(Folder.root());
    });
    main === null || main === void 0 ? void 0 : main.scrollTo(pos);
}
function setting(dir) {
    var _a, _b;
    // 显示设置页面
    main.innerHTML = `
    <div class="title">设置</div>
    <div class="form">
    <p>安全设置</p>
    <div class="settingFormItem">
        <div><label for="mainPwd">访问密钥：</label><input type="text" id="mainPwd" class="vaild" value="${mainPwd}"/></div>
        <div><input type="checkbox" id="rememberPwd" ${isremember ? "checked" : ""}/><label for="rememberPwd">记住密钥</label></div>
    </div>
    <p>其他个性化设置</p>
    <div class="settingFormItem">
        <input type="checkbox" id="autoCopy" ${mainSetting.autoCopy ? "checked" : ""}/><label for="autoCopy">当点击一条信息时，不会跳转到详情界面，而是直接复制这条信息对应的密码。</label></div>
    </div>
    <div class="action" id="save"><p>保存</p></div>
    <div class="action" id="cancel"><p>取消</p></div>
    `;
    (_a = document.querySelector("#save")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
        mainPwd = document.querySelector("#mainPwd").value;
        isremember = document.querySelector("#rememberPwd").checked;
        mainSetting.autoCopy = document.querySelector("#autoCopy").checked;
        init(dir);
    });
    (_b = document.querySelector("#cancel")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
        update(dir);
    });
}
window.fs.read("./data").then((data) => {
    var _a;
    data = data.replace(/\s/g, '');
    let obj = JSON.parse(data);
    mainSetting = obj.mainSetting;
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
        update(Folder.root());
    }
}).catch((err) => {
    console.log(err);
    pwdList = [];
    recentItem = [];
    mainSetting = new MainSetting();
    update(Folder.root());
});
