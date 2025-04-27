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
/**
 * 密码类
 * @member from 来源
 * @member uname 用户名
 * @member pwd 密码
 * @member email 邮箱
 * @member phone 手机号
 * @member note 备注
 * @member dir 父文件夹
 * @member type 类型
 * @member moDate 修改日期
 * @member rmDate 删除日期
 */
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
    /**
     * 得到基础的HTML代码
     * @param id 作为这个HTML的唯一身份标识符的一部分，而给的一个编号
     * @param checkable 是否可以被选择
     * @returns HTML代码
     */
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
    /**
     * 得到卡片形式的HTML代码
     * @param id 作为这个HTML的唯一身份标识符的一部分，而给的一个编号
     * @param checkable 是否可以被选择
     * @returns HTML代码
     */
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
    /**
     * 得到回收站形式的HTML代码
     * @param id 作为这个HTML的唯一身份标识符的一部分，而给的一个编号
     * @param checkable 是否可以被选择
     * @returns HTML代码
     */
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
    /**
     * 格式化字符串，超过最大长度的部分用...代替
     * @param str 源字符串
     * @param max 最大长度
     * @param OmitWhere 在前面还是后面省略，前面为"front"，后面为"back"
     * @returns 处理后的字符串
     */
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
    /**
     * 获取密码的基本html
     * @param isRecent 是否是最近删除的密码
     * @returns HTML代码
     * @description 这个函数是为了避免重复代码而写的，主要是为了在getHtml和getHtmlRecent中使用
     */
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
    /**
     * 检查当前密码是否在folder或folder的子孙目录的目录下
     * @param folder 文件夹
     * @returns 结果
     */
    isin(folder) {
        const f = folder.stringify();
        return f == this.dir.stringify().slice(0, f.length);
    }
    /**
     * 获得密码的深度
     * @returns 深度
     * @description 深度是指密码所在的文件夹树中的层数，主文件夹下为1，子文件夹为2，孙子文件夹为3，以此类推
     * @example :/hello/password => 2
     */
    deepth() {
        return this.dir.deepth() + 1;
    }
}
/**
 * 文件夹类
 * @member name 文件夹名称
 * @member parent 文件夹路径
 * @member moDate 修改日期
 * @member rmDate 删除日期
 * @member type 文件夹类型
 * @member lock 加密锁密码
 * @member cachePwd 如果用户已经输入过了密码，则缓存密码
*/
class Folder {
    constructor(nameOrClass, parent = ":", time = Date.now().toString()) {
        this.lock = null; // 加密锁
        this.cachePwd = null; // 缓存密码
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
            this.lock = nameOrClass.lock === undefined ? null : nameOrClass.lock; // 为了兼容旧版本
            this.cachePwd = nameOrClass.cachePwd === undefined ? null : nameOrClass.cachePwd; // 为了兼容旧版本
        }
    }
    /**
     * 得到基础的HTML代码
     * @param id 作为这个HTML的唯一身份标识符的一部分，而给的一个编号
     * @param checkable 是否可以被选择
     * @returns HTML代码
     */
    getHtml(id, checkable = false) {
        let tool = `<div class="tool" style="width: ${checkable ? "39vw" : "43vw"};">
            <img class="icon" id="folder${id}-edit" style="margin-right: 8px;" src="./resources/edit.png" data-bs-toggle="tooltip" data-bs-placement="top" title="重命名">
            <img class="icon" id="folder${id}-delete" src="./resources/delete.png" data-bs-toggle="tooltip" data-bs-placement="top" title="删除">
            ${this.lock !== null && this.cachePwd === null ? `<img src="../pages/resources/lock.png" title="此文件夹已被加密！" class="icon attrib" data-bs-toggle="tooltip" data-bs-placement="top">` : ""}
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
    /**
     * 得到卡片形式的HTML代码
     * @param id 作为这个HTML的唯一身份标识符的一部分，而给的一个编号
     * @param checkable 是否可以被选择
     * @returns HTML代码
     */
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
    /**
     * 得到回收站形式的HTML代码
     * @param id 作为这个HTML的唯一身份标识符的一部分，而给的一个编号
     * @param checkable 是否可以被选择
     * @returns HTML代码
     */
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
    /**
     * 获得根目录文件夹
     * @returns 根目录
     */
    static root() {
        return new Folder(":", "");
    }
    /**
     * 获得回收站文件夹
     * @returns 回收站
     */
    static bin() {
        return new Folder("~", "");
    }
    /**
     * 获得主文件夹
     * @returns 主文件夹
     */
    static home() {
        return new Folder("H", "");
    }
    /**
     * 获得设置文件夹
     * @returns 设置文件夹
     */
    static setting() {
        return new Folder("SET", "");
    }
    /**
     * 获得搜索文件夹
     * @returns 搜索文件夹
     */
    static search() {
        return new Folder("SCH", "");
    }
    /**
     * 获得更改文件文件夹
     * @returns 标志着更改文件的文件夹
     */
    static change() {
        return new Folder("C", "");
    }
    /**
     * 获得添加文件文件夹
     * @returns 标志着添加文件的文件夹
     */
    static append() {
        return new Folder("A", "");
    }
    /**
     * 获得显示文件文件夹
     * @returns 标志着显示文件的文件夹
     */
    static show() {
        return new Folder("SHW", "");
    }
    /**
     * 通过字符串获得文件夹对象
     * @param str 文件夹路径
     * @param time 时间戳
     * @returns 文件夹对象
     */
    static fromString(str, time = Date.now().toString()) {
        if (str[str.length - 1] != "/")
            str += "/";
        const arr = str.split("/");
        let k = arr.slice(0, arr.length - 2).join("/");
        return new Folder(arr[arr.length - 2], k == "" ? "" : k + "/", time);
    }
    /**
     * 获得文件夹的字符串表示
     * @returns 文件夹路径
     */
    stringify() {
        return this.parent + this.name + "/";
    }
    /**
     * 比较两个文件夹是否相同
     * @param folder 要比较的文件夹
     * @returns 比较结果
     */
    isSame(folder) {
        return this.stringify() == folder.stringify();
    }
    /**
     * 更改路径
     * @param parent 新的父文件夹
     */
    setParent(parent) {
        this.parent = parent.stringify();
    }
    /**
     * 获得父文件夹对象
     * @returns 父文件夹对象
     */
    getParent() {
        return Folder.fromString(this.parent);
    }
    /**
     * 判断item是否包含在当前文件夹中
     * @param item 要检查的文件或文件夹
     * @returns 结果
     */
    isInclude(item) {
        if (item instanceof Folder)
            return item.parent == this.stringify();
        else
            return item.dir.isSame(this);
    }
    /**
     * 判断文件夹是否在当前文件夹或后代文件夹下
     * @param folder 要检查的文件夹
     * @returns 结果
     */
    isin(folder) {
        const f = folder.stringify();
        if (this.isSame(folder))
            return false;
        return f == this.stringify().slice(0, f.length);
    }
    /**
     * 可读的HTML代码
     * @returns 结果
     */
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
    /**
     * 可读的文本
     * @returns 结果
     */
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
    /**
     * 获得文件夹的深度
     * @returns 深度
     * @description 深度是指文件夹的层数，主文件夹为0，子文件夹为1，孙子文件夹为2，以此类推
     * @example :/hello/world/ => 2
     */
    deepth() {
        let ans = this.stringify(), deepth = 0;
        for (let i = 0; i < ans.length; i++) {
            if (ans[i] == "/")
                deepth++;
        }
        // 可是深度是从0开始的，所以要减去1
        if (deepth > 0)
            deepth--;
        return deepth;
    }
}
/**
 * 排序类型枚举
 * @description 用于排序的枚举类型
 * @member time_early 按照时间从早到晚排序
 * @member time_late 按照时间从晚到早排序
 * @member name 按照名称从小到大排序
 * @member name_reverse 按照名称从大到小排序
 */
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
/**
 * 数据保存
 * @description 保存数据到本地磁盘
 */
function saveData() {
    // 数据保存
    let data = getData();
    window.fs.save("./data", data);
}
/**
 * 获得加密后的数据
 * @param ismemory 是否使用内存密码
 * @returns 数据
 */
function getData(ismemory = isremember) {
    let salt = randstr(16);
    let enc = Cryp.pbkdf2(mainPwd, salt);
    let pwdListUpdated = [];
    let folderListUpdated = [];
    let folderListUpdatedCopy = []; // 复制一份文件夹列表，用于加密
    let binItemUpdated = [];
    let tasksUpdated = [];
    for (let i = 0; i < pwdList.length; i++) {
        pwdListUpdated.push(new Password(pwdList[i]));
    }
    for (let i = 0; i < folderList.length; i++) {
        folderListUpdated.push(new Folder(folderList[i]));
        folderListUpdatedCopy.push(new Folder(folderList[i]));
    }
    // 通过文件夹深度从大到小排序
    folderListUpdatedCopy.sort((a, b) => {
        return b.deepth() - a.deepth();
    });
    for (let i = 0; i < folderListUpdatedCopy.length; i++) {
        if (folderListUpdatedCopy[i].lock !== null && folderListUpdatedCopy[i].cachePwd !== null) {
            for (let j = 0; j < pwdListUpdated.length; j++) {
                if (pwdListUpdated[j].isin(folderListUpdatedCopy[i])) {
                    pwdListUpdated[j] = encrypt(pwdListUpdated[j], Cryp.pbkdf2(folderListUpdatedCopy[i].cachePwd), ["dir"]);
                }
            }
            for (let j = 0; j < folderListUpdated.length; j++) {
                if (folderListUpdated[j].isin(folderListUpdatedCopy[i]) && i != j) {
                    folderListUpdated[j] = encrypt(folderListUpdated[j], Cryp.pbkdf2(folderListUpdatedCopy[i].cachePwd), ["parent"]);
                }
            }
        }
    }
    for (let index = 0; index < pwdList.length; index++) {
        pwdListUpdated[index] = encrypt(pwdListUpdated[index], enc);
    }
    for (let index = 0; index < folderList.length; index++) {
        folderListUpdated[index] = encrypt(folderListUpdated[index], enc);
    }
    for (let index = 0; index < binItem.length; index++) {
        binItemUpdated.push(encrypt(binItem[index], enc));
    }
    for (let index = 0; index < TODOTasks.length; index++) {
        tasksUpdated.push(TODOTasks[index].enc(enc));
    }
    let encScore = Cryp.encrypt(score.toString(), enc);
    let enclevel = Cryp.encrypt(level.toString(), enc);
    // 数据保存
    return JSON.stringify({
        version: "1.2",
        pwd: pwdListUpdated,
        folder: folderListUpdated,
        recent: binItemUpdated,
        mainPwd: Cryp.pbkdf2(enc, salt),
        mainSetting: mainSetting,
        salt: salt,
        memory: ismemory ? mainPwd : null,
        isPwdNull: mainPwd === "",
        TODOTasks: tasksUpdated,
        score: encScore,
        level: enclevel
    });
}
/**
 * 保存UMC数据到指定路径
 * @param path 文件路径
 */
function saveUMC(path) {
    window.fs.save(path, getData(false));
    mkDialog("导出成功！", `成功导出至${path}`);
}
/**
 * 读取UMC数据
 * @param path 文件路径
 */
function readUMC(path) {
    window.fs.read(path)
        .then((res) => {
        window.fs.save("./data", res);
        mkDialog("导入成功！", "重启以应用数据，是否立即重启？", ["立即重启", "再等等"], { isStatic: true })
            .then((res) => {
            if (res == 0)
                location.reload();
        });
    });
}
