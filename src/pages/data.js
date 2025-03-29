"use strict";
const showNoteMaxLength = 152; // 在main页面显示备注的最大长度
const showOtherMaxLength = 60; // 在main页面显示来源、用户名、密码的最大长度
const showPathMaxLength = 35; // 在main页面显示路径的最大长度
var Type;
(function (Type) {
    Type[Type["Folder"] = 0] = "Folder";
    Type[Type["Password"] = 1] = "Password";
    Type[Type["Task"] = 2] = "Task"; // 任务
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
            <img class="icon" id="pwd${id}-edit" style="margin-right: 8px;" src="./resources/edit.png" data-bs-toggle="tooltip" data-bs-placement="top" title="编辑">
            <img class="icon" id="pwd${id}-delete" src="./resources/delete.png" data-bs-toggle="tooltip" data-bs-placement="top" title="删除">
        </div>`;
        if (checkable)
            return `<div class="info" style="flex-direction: row;" id="pwd${id}" draggable="true">
            <div class="checkbox" id="pwd${id}-checkboxDiv"><input type="checkbox" id="pwd${id}-checkbox"></div>
            <div class="check-content">
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
    getCard(id, isRecent = false) {
        return `
        <div class="card" style="width: 100%;" id="card${id}">
            <div class="card-body">
                <p class="card-text">
                    <p>路径：${Password.format(this.dir.toReadableText(), showPathMaxLength, "front")}</p>
                    <p>来源：${Password.format(this.from)}</p>
                    <p>用户名：${Password.format(this.uname)}</p>
                    <p>密码：******</p>
                    ${this.email == "" ? "" : `<p>邮箱：${Password.format(this.email)}</p>`}
                    ${this.phone == "" ? "" : `<p>手机号：${Password.format(this.phone)}</p>`}
                    ${this.note == "" ? "" : `<p>备注：${Password.format(this.note, showNoteMaxLength)}</p>`}
                    <p>${isRecent ? "删除时间" : "修改时间"}：${getReadableTime(isRecent ? this.rmDate : this.moDate)}</p>
                    <button type="button" class="btn ${isRecent ? "btn-secondary" : "btn-primary"}" id="card${id}-path">跳转到对应路径</button>
                    <button type="button" class="btn btn-primary" id="card${id}-detail">查看详情</button>
                </p>
            </div>
        </div>
        `;
    }
    getHtmlRecent(id, checkable = false) {
        let tool = `<div class="tool" style="width: ${checkable ? "39vw" : "43vw"};">
                <p class="icon" id="recent${id}-recover" style="margin-right: 8px;">恢复</p>
                <p class="icon" id="recent${id}-delete">删除</p>
            </div>`;
        if (checkable)
            return `<div class="info" style="flex-direction: row;" id="recent${id}" draggable="true">
            <div class="checkbox" id="recent${id}-checkboxDiv"><input type="checkbox" id="recent${id}-checkbox"></div>
            <div class="check-content">
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
            <p>密码：******</p>
            ${this.email == "" ? "" : `<p>邮箱：${Password.format(this.email)}</p>`}
            ${this.phone == "" ? "" : `<p>手机号：${Password.format(this.phone)}</p>`}
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
            <img class="icon" id="folder${id}-edit" style="margin-right: 8px;" src="./resources/edit.png" data-bs-toggle="tooltip" data-bs-placement="top" title="重命名">
            <img class="icon" id="folder${id}-delete" src="./resources/delete.png" data-bs-toggle="tooltip" data-bs-placement="top" title="删除">
        </div>`;
        if (checkable)
            return `<div class="info" style="flex-direction: row;" id="folder${id}" draggable="true">
            <div class="checkbox" id="folder${id}-checkboxDiv"><input type="checkbox" id="folder${id}-checkbox"></div>
            <div class="check-content">
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
    getCard(id, isRecent = false) {
        return `
        <div class="card" style="width: 100%;" id="card${id}">
            <div class="card-body">
                <p class="card-text">
                    <p>路径：${Password.format(Folder.fromString(this.parent).toReadableText(), showPathMaxLength, "front")}</p>
                    <p>文件名：${Password.format(this.name)}</p>
                    <p>${isRecent ? "删除时间" : "修改时间"}：${getReadableTime(isRecent ? this.rmDate : this.moDate)}</p>
                    <button type="button" class="btn ${isRecent ? "btn-secondary" : "btn-primary"}" id="card${id}-path">进入该文件夹</button>
                </p>
            </div>
        </div>
        `;
    }
    getHtmlRecent(id, checkable = false) {
        let tool = `<div class="tool" style="width: ${checkable ? "39vw" : "43vw"};">
                <p class="icon" id="recent${id}-recover" style="margin-right: 8px;">恢复</p>
                <p class="icon" id="recent${id}-delete">删除</p>
            </div>`;
        if (checkable)
            return `<div class="info" style="flex-direction: row;" id="recent${id}" draggable="true">
            <div class="checkbox" id="recent${id}-checkboxDiv"><input type="checkbox" id="recent${id}-checkbox"></div>
            <div class="check-content">
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
    static home() {
        return new Folder("H", "");
    }
    static setting() {
        return new Folder("SET", "");
    }
    static search() {
        return new Folder("SCH", "");
    }
    static change() {
        return new Folder("C", "");
    }
    static append() {
        return new Folder("A", "");
    }
    static show() {
        return new Folder("SHW", "");
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
        return f == this.stringify().slice(0, f.length);
    }
    toReadableHTML() {
        let ans = this.stringify(), lans = [{ text: "主文件夹", index: 1 }], tmp = "";
        for (let i = 2; i < ans.length; i++) {
            if (ans[i] == "/") {
                lans.push({ text: tmp, index: i });
                tmp = "";
            }
            else
                tmp += ans[i];
        }
        // 检查长度
        let length = 0, maxindex = 0;
        for (let i = lans.length - 1; i >= 0; i--) {
            length += lans[i].text.length;
            if (length > showPathMaxLength) {
                if (i == lans.length - 1) {
                    lans[i].text = Password.format(lans[i].text, showPathMaxLength, "front");
                    maxindex = i;
                }
                else
                    maxindex = i + 1;
                break;
            }
            length += 2;
        }
        let tgtHtml = "";
        if (maxindex != 0)
            tgtHtml += `<li class="breadcrumb-item active"><p>...</p></li>`;
        for (let i = maxindex; i < lans.length; i++) {
            if (i == lans.length - 1) {
                tgtHtml += `<li class="breadcrumb-item active" aria-current="page"><p data-location="${ans.slice(0, lans[i].index)}" id="dirItem${i}">${lans[i].text}</p></li>`;
            }
            else {
                tgtHtml += `<li class="breadcrumb-item"><p class="action" data-location="${ans.slice(0, lans[i].index)}" id="dirItem${i}">${lans[i].text}</p></li>`;
            }
        }
        return { html: `
        <nav style="--bs-breadcrumb-divider: '>';" aria-label="breadcrumb">
            <ol class="breadcrumb">
                ${tgtHtml}
            </ol>
        </nav>
        `, num: lans.length };
    }
    toReadableText() {
        let ans = this.stringify(), lans = "主文件夹";
        for (let i = 1; i < ans.length - 1; i++) {
            if (ans[i] == "/")
                lans += " > ";
            else
                lans += ans[i];
        }
        return lans;
    }
}
var SortBy;
(function (SortBy) {
    SortBy[SortBy["time_early"] = 0] = "time_early";
    SortBy[SortBy["time_late"] = 1] = "time_late";
    SortBy[SortBy["name"] = 2] = "name";
    SortBy[SortBy["name_reverse"] = 3] = "name_reverse";
})(SortBy || (SortBy = {}));
class MainSetting {
    constructor() {
        this.autoCopy = false;
        this.easyAppend = false;
        this.pwdSortBy = SortBy.name;
        this.folderSortBy = SortBy.name;
    }
}
function saveData() {
    // 数据保存
    let data = getData();
    window.fs.save("./data", data);
}
function getData(ismemory = isremember) {
    let salt = randstr(16);
    let enc = cryp.pbkdf2(mainPwd, salt);
    let pwdListUpdated = [];
    let folderListUpdated = [];
    let binItemUpdated = [];
    let tasksUpdated = [];
    for (let index = 0; index < pwdList.length; index++) {
        pwdListUpdated.push(encrypt(pwdList[index], enc));
    }
    for (let index = 0; index < folderList.length; index++) {
        folderListUpdated.push(encrypt(folderList[index], enc));
    }
    for (let index = 0; index < binItem.length; index++) {
        binItemUpdated.push(encrypt(binItem[index], enc));
    }
    for (let index = 0; index < TODOTasks.length; index++) {
        tasksUpdated.push(TODOTasks[index].enc(enc));
    }
    let encScore = cryp.encrypt(score.toString(), enc);
    let enclevel = cryp.encrypt(level.toString(), enc);
    // 数据保存
    return JSON.stringify({
        version: "1.2",
        pwd: pwdListUpdated,
        folder: folderListUpdated,
        recent: binItemUpdated,
        mainPwd: cryp.pbkdf2(enc, salt),
        mainSetting: mainSetting,
        salt: salt,
        memory: ismemory ? mainPwd : null,
        isPwdNull: mainPwd === "",
        TODOTasks: tasksUpdated,
        score: encScore,
        level: enclevel
    });
}
function saveUMC(path) {
    window.fs.save(path, getData(false));
    mkDialog("导出成功！", `成功导出至${path}`);
}
function readUMC(path) {
    window.fs.read(path)
        .then((res) => {
        window.fs.save("./data", res);
        mkDialog("导入成功！", "重启以应用数据，是否立即重启？", ["立即重启", "再等等"], true)
            .then((res) => {
            if (res == 0)
                location.reload();
        });
    });
}
