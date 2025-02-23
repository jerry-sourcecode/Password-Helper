const showNoteMaxLength: number = 152; // 在main页面显示备注的最大长度
const showOtherMaxLength: number = 60; // 在main页面显示来源、用户名、密码的最大长度
const showPathMaxLength: number = 35; // 在main页面显示路径的最大长度
enum Type{ // 类型枚举
    Folder, // 文件夹
    Password, // 密码
}
type Item = Folder | Password; // 项类型
type clipboardItem = {type: Type, index: number};
class Password{ // 密码类
    from: string; // 来源
    uname: string // 用户名
    pwd: string; // 密码
    email: string; // 邮箱
    phone: string; // 电话
    note: string; // 备注
    dir: Folder; // 文件夹
    type: Type = Type.Password; // 类型
    moDate: string; // 创建日期
    rmDate: string | null = null; // 删除日期
    constructor(fromOrdata: string | Password = "", uname: string = "", pwd: string = "", note: string = "", email: string = "", phone: string = "", dir: Folder = Folder.root()){ // 构造函数
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
        } else {
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
    getHtml(id: number, checkable: boolean = false): string{
        let tool = `<div class="tool" style="width: ${checkable?"39vw":"43vw"};">
            <img class="icon" id="pwd${id}-edit" style="margin-right: 8px;" src="./resources/edit.png" title="编辑">
            <img class="icon" id="pwd${id}-delete" src="./resources/delete.png" title="删除">
        </div>`
        if (checkable) return `<div class="info" style="flex-direction: row;" id="pwd${id}" draggable="true">
            <div class="checkbox" id="pwd${id}-checkboxDiv"><input type="checkbox" id="pwd${id}-checkbox"></div>
            <div class="content">
                ${this.getBaseHtml()}
                ${tool}
            </div>
        </div>`;
        else return `<div class="info" id="pwd${id}" draggable="true">
            ${this.getBaseHtml()}
            ${tool}
        </div>`;
    }
    getHtmlRecent(id: number, checkable: boolean = false): string{ // 获取密码在recent页面的html
        let tool = `<div class="tool" style="width: ${checkable?"39vw":"43vw"};">
                <p class="icon" id="recent${id}-recover" style="margin-right: 8px;">恢复</p>
                <p class="icon" id="recent${id}-delete">删除</p>
            </div>`
        if (checkable) return `<div class="info" style="flex-direction: row;" id="recent${id}" draggable="true">
            <div class="checkbox" id="recent${id}-checkboxDiv"><input type="checkbox" id="recent${id}-checkbox"></div>
            <div class="content">
                ${this.getBaseHtml(true)}
                ${tool}
            </div>
        </div>`;
        else return `<div class="info" id="recent${id}" draggable="true">
            ${this.getBaseHtml(true)}
            ${tool}
        </div>`;
    }
    static format(str: string, max: number = showOtherMaxLength, OmitWhere: "front" | "back" = "back"): string{
        if (str.length == 0){
            return "暂无";
        }
        let left: number = max;
        if (OmitWhere == "front"){
            for (let i = str.length - 1; i >= 0; i--){
                left -= isFullWidthChar(str[i]) ? 2 : 1;
                if (left < 0){
                    return "..." + str.slice(i + 1);
                }
            }
        } else {
            for (let i = 0; i < str.length; i++){
                left -= isFullWidthChar(str[i]) ? 2 : 1;
                if (left < 0){
                    return str.slice(0, i) + "...";
                }
            }
        }
        return str;
    }
    private getBaseHtml(isRecent: boolean = false): string{ // 获取密码的基本html
        return `<p>来源：${Password.format(this.from)}</p>
            <p>用户名：${Password.format(this.uname)}</p>
            <p>密码：******</p>
            ${this.email == ""?"":`<p>邮箱：${Password.format(this.email)}</p>`}
            ${this.phone == ""?"":`<p>电话：${Password.format(this.phone)}</p>`}
            ${this.note == ""?"":`<p>备注：${Password.format(this.note, showNoteMaxLength)}</p>`}
            <p>${isRecent?"删除时间":"修改时间"}：${getReadableTime(isRecent?this.rmDate!:this.moDate)}</p>`
    };
    isin(folder: Folder): boolean{
        // 检查当前密码是否在folder或folder的子孙目录的目录下
        const f = folder.stringify()
        return f == this.dir.stringify().slice(0, f.length);
    }
}
class Folder {
    name: string;
    parent: string;
    moDate: string;
    rmDate: string | null;
    type: Type = Type.Folder;
    /*
    name: 文件夹名称
    parent: 文件夹路径
    parent的格式如下：
    ":/a/"表示在主文件夹下的a文件夹内
    ""表示在主文件夹下
    特别的，主文件夹的name为":"，parent为""，在回收站中的文件name为"~"，parent为""
    */
    constructor(nameOrClass: string | Folder, parent: string = ":", time: string = Date.now().toString()){
        this.type = Type.Folder;
        if (typeof nameOrClass === "string"){
            this.name = nameOrClass;
            this.parent = parent;
            this.moDate = time;
            this.rmDate = null;
        } else {
            this.name = nameOrClass.name;
            this.parent = nameOrClass.parent;
            this.moDate = nameOrClass.moDate;
            this.rmDate = nameOrClass.rmDate;
        }
    }
    getHtml(id: number, checkable: boolean = false): string{
        let tool = `<div class="tool" style="width: ${checkable?"39vw":"43vw"};">
            <img class="icon" id="folder${id}-edit" style="margin-right: 8px;" src="./resources/edit.png" title="重命名">
            <img class="icon" id="folder${id}-delete" src="./resources/delete.png" title="删除">
        </div>`
        if (checkable) return `<div class="info" style="flex-direction: row;" id="folder${id}" draggable="true">
            <div class="checkbox" id="folder${id}-checkboxDiv"><input type="checkbox" id="folder${id}-checkbox"></div>
            <div class="content">
                <p>${this.name}</p>
                <p>修改日期：${getReadableTime(this.moDate)}</p>
                ${tool}
            </div>
        </div>`;
        else return `<div class="info" id="folder${id}" draggable="true">
            <p>${this.name}</p>
            <p>修改日期：${getReadableTime(this.moDate)}</p>
            ${tool}
        </div>`;
    }
    getHtmlRecent(id: number, checkable: boolean = false): string{ // 获取密码在recent页面的html
        let tool = `<div class="tool" style="width: ${checkable?"39vw":"43vw"};">
                <p class="icon" id="recent${id}-recover" style="margin-right: 8px;">恢复</p>
                <p class="icon" id="recent${id}-delete">删除</p>
            </div>`;
        if (checkable) return `<div class="info" style="flex-direction: row;" id="recent${id}" draggable="true">
            <div class="checkbox" id="recent${id}-checkboxDiv"><input type="checkbox" id="recent${id}-checkbox"></div>
            <div class="content">
                <p>${this.name}</p>
                <p>删除日期：${getReadableTime(this.rmDate!)}</p>
                ${tool}
            </div>
        </div>`;
        return `
        <div class="info" id="recent${id}" draggable="true">
            <p>${this.name}</p>
            <p>删除日期：${getReadableTime(this.rmDate!)}</p>
            ${tool}
        </div>
        `;
    }
    static root(): Folder{
        return new Folder(":", "");
    }
    static bin(): Folder{
        return new Folder("~", "");
    }
    static fromString(str: string, time: string = Date.now().toString()): Folder{
        if (str[str.length - 1] != "/") str += "/";
        const arr = str.split("/");
        let k = arr.slice(0, arr.length - 2).join("/");
        return new Folder(arr[arr.length - 2], k == "" ? "" : k + "/", time);
    }
    stringify(): string{
        return this.parent + this.name + "/";
    }
    isSame(folder: Folder): boolean{
        return this.stringify() == folder.stringify();
    }
    setParent(parent: Folder){
        this.parent = parent.stringify();
    }
    getParent(): Folder{
        return Folder.fromString(this.parent);
    }
    // 判断item是否包含在当前文件夹中
    isInclude(item : Item): boolean{
        if (item instanceof Folder) return item.parent == this.stringify();
        else return item.dir.isSame(this);
    }
    // 判断文件夹是否在当前文件夹或后代文件夹下
    isin(folder: Folder): boolean{
        const f = folder.stringify()
        return f == this.parent.slice(0, f.length);
    }
    toReadable(): {html: string, num: number}{
        let ans : string = this.stringify(), lans : Array<{text: string, index: number}> = [{text: "主文件夹", index: 1}], tmp: string = "";
        for(let i = 2; i < ans.length; i++){
            if (ans[i] == "/") {
                lans.push({text: tmp, index: i});
                tmp = "";
            }
            else tmp += ans[i];
        }
        // 检查长度
        let length = 0, maxindex = 0;
        for (let i = lans.length - 1; i >= 0; i--){
            length += lans[i].text.length;
            if (length > showPathMaxLength){
                if (i == lans.length - 1){
                    lans[i].text = Password.format(lans[i].text, showPathMaxLength, "front");
                    maxindex = i;
                }
                else maxindex = i + 1;
                break;
            }
            length += 2;
        }
        let tgtHtml: string = "";
        if (maxindex != 0)
            tgtHtml += `<li class="breadcrumb-item active"><p>...</p></li>`;
        for(let i = maxindex; i < lans.length; i++){
            if (i == lans.length - 1){
                tgtHtml += `<li class="breadcrumb-item active" aria-current="page"><p data-location="${ans.slice(0, lans[i].index)}" id="dirItem${i}">${lans[i].text}</p></li>`;
            } else {
                tgtHtml += `<li class="breadcrumb-item"><p class="breadcrumb-loaction-item" data-location="${ans.slice(0, lans[i].index)}" id="dirItem${i}">${lans[i].text}</p></li>`;
            }
        }
        return {html: `
        <nav style="--bs-breadcrumb-divider: '>';" aria-label="breadcrumb">
            <ol class="breadcrumb">
                ${tgtHtml}
            </ol>
        </nav>
        `, num: lans.length};
    }
}

class MainSetting{
    autoCopy: boolean = false;
}

function encrypt(data: Item, key: string, index: number = 0): Item{ // 加密
    let enc: Item;
    if (data instanceof Password) enc = new Password(data);
    else enc = new Folder(data);
    function getKey(): string{
        let dkey: string = key + key; // 重复主密码
        let res: string = dkey.slice(index, index + key.length); // 取出主密码
        index++;
        if (index >= key.length) index = 0;
        return res;
    }
    let keyList: Array<keyof Item> = <Array<keyof Item>>Object.keys(data);
    keyList.sort();
    for (let v of keyList){
        if (typeof data[v] === "string"){
            (enc as any)[v] = window.cryp.encrypt(data[v], getKey())
        } else if (data[v] instanceof Folder){
            (enc as any)[v] = new Folder(<Folder>encrypt(data[v], key, index));
        }
    }
    return enc;
}
function decrypt(data:Item, key: string, index: number = 0): Item{ // 解密
    let dec: Item;
    if (data instanceof Password) dec = new Password(data);
    else dec = new Folder(data);
    function getKey(): string{
        let dkey: string = key + key; // 重复主密码
        let res: string = dkey.slice(index, index + key.length); // 取出主密码
        index++;
        if (index >= key.length) index = 0;
        return res;
    }
    let keyList: Array<keyof Item> = <Array<keyof Item>>Object.keys(data);
    keyList.sort();
    for (let v of keyList){
        if (typeof data[v] == "string"){
            (dec as any)[v] = window.cryp.decrypt(data[v], getKey());
        } else if (data[v] instanceof Folder){
            (dec as any)[v] = new Folder(<Folder>decrypt(data[v], key, index));
        }
    }
    return dec;
}
    
let addBtn = document.querySelector("#addPwd"); // 添加密码按钮
const main = document.querySelector("#contentDiv"); // main界面
let pwdList : Array<Password> = []; // 密码列表
let recentItem : Array<Item> = []; // 最近删除的密码列表
let folderList : Array<Folder> = []; // 文件夹列表
let mainPwd : string = ""; // 主密码
let isremember : boolean = false; // 是否记住密码
let folderIsEditing : boolean = false; // 是否正在编辑文件夹
let currentFolder : Folder = Folder.root();
let clipboard: Set<clipboardItem> = new Set();
let mainSetting: MainSetting = new MainSetting();

// 一些工具函数
function random(a: number, b: number): number{ // 生成[a, b]之间的随机数
    return Math.floor(Math.random() * (b - a) + a);
}
function randstr(length: number): string{ // 生成随机字符串
    let res: string = "";
    let chars: string = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_+-=[]{}|;':,.<>/?";
    for (let i = 0; i < length; i++){
        res += chars[random(0, chars.length)];
    }
    return res;
}
function isFullWidthChar(c: string): boolean{ // 判断是否是全角字符
    return c.charCodeAt(0) > 255;
}
function copyToClipboard(str: string): boolean{ // 复制到剪贴板
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
function getScroll(): {top: number, left: number}{
    return {
        top: main!.scrollTop || main!.scrollTop,
        left: main!.scrollLeft || main!.scrollLeft
    }
}
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
function saveData(): void{ // 保存数据
    let salt: string = randstr(16);
    let enc = window.cryp.pbkdf2(mainPwd, salt)
    let pwdListUpdated : Array<Password> = []
    let folderListUpdated : Array<Folder> = [];
    let recentItemUpdated : Array<Item> = [];
    for (let index = 0; index < pwdList.length; index++) {
        pwdListUpdated.push(encrypt(pwdList[index], enc) as Password);
    }
    for (let index = 0; index < folderList.length; index++) {
        folderListUpdated.push(encrypt(folderList[index], enc) as Folder);
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
        memory: isremember? mainPwd : null,
        isPwdNull: mainPwd === "",
    });
    window.fs.save("./data", data);
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
function deepCopy<T>(value: T): T {
    if (value === null || typeof value !== "object") {
        return value;
    }
    if (Array.isArray(value)) {
        return value.map(item => deepCopy(item)) as unknown as T;
    }
    const copied = {} as T;
    for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
        copied[key] = deepCopy(value[key]);
        }
    }
    return copied;
}

function init(dir: Folder): void{
    saveData();
    update(dir);
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
// 渲染编辑密码界面，并更改密码，isAppend表示是否是添加密码，为true时，取消将会删除该密码，会返回main界面
function changePwd(by: Array<Password>, index: number, dir: Folder, isAppend : boolean = false) : void{
    let inner : string = `
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
        clipboard.delete({type: Type.Password, index: index});
        pwdList[index].dir = Folder.fromString(Folder.bin().stringify() + pwdList[index].dir.stringify().slice(2));
        pwdList[index].rmDate = Date.now().toString();
        recentItem.unshift(new Password(pwdList[index]));
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
        recentItem.unshift(new Folder(folderList[index]));
        folderList.splice(index, 1);
    }
    if (_save){
        init(dir_from)
    }
}
function deleterecentItem(index: number | Array<number>) : void{
    // 删除最近删除的密码
    if (Array.isArray(index)){
        recentItem = recentItem.filter((item, i) => {
            return !index.includes(i);
        });
    }
    else recentItem.splice(index, 1);
    saveData();
}
function recoverPwd(index: number) : void{
    // 恢复最近删除的密码
    recentItem[index].rmDate = null;
    if (recentItem[index] instanceof Password) {
        recentItem[index].dir = Folder.fromString(Folder.root().stringify() + recentItem[index].dir.stringify().slice(2));
        mkdir((<Password>recentItem[index]).dir);
        pwdList.push(recentItem[index]);
    }
    else {
        let x: string = recentItem[index].moDate;
        recentItem[index] = Folder.fromString(Folder.root().stringify() + recentItem[index].stringify().slice(2)); 
        recentItem[index].moDate = x;
        mkdir(Folder.fromString(recentItem[index].parent));
        let has: boolean = false;
        folderList.forEach((item) => {
            if (item.isSame(<Folder>recentItem[index])) {
                has = true;
            }
        });
        if (!has) mkdir(recentItem[index]);
    }
    recentItem.splice(index, 1);
    saveData();
}
function addPwd(dir: Folder) : void{
    // 添加密码
    let tgt : number = pwdList.length;
    pwdList.push(new Password("", "", "", "", "", "", dir));
    changePwd(pwdList, tgt, dir, true);
}
// 显示密码， from表示从哪个页面跳转过来的，如果是从最近删除跳转过来的，返回时会返回到最近删除页面，否则返回到主页面，需要填写Page枚举
function showPwd(by: Array<Password>, index: number, from : Folder) : void{
    let inner : string = `
    <div class="form">
    <div class="formItem_Copy"><label for="from">来源：</label><input type="text" id="from" class="vaild" value="${by[index].from}" readonly /><img class="icon" src="./resources/copy.png" id="fromCopy" title="复制"></div>
    <div class="formItem_Copy"><label for="uname">用户名：</label><input type="text" id="uname" class="vaild" value="${by[index].uname}" readonly /><img class="icon" src="./resources/copy.png" id="unameCopy" title="复制"></div>
    <div class="formItem_Copy"><label for="pwd">密码：</label><input type="password" id="pwd" class="vaild" value="${by[index].pwd}" readonly /><img class="icon" src="./resources/copy.png" id="pwdCopy" title="复制"></div>
    <div class="formItem" id="safety"></div>
    <div class="formItem_Copy"><label for="email">邮箱：</label><input type="text" id="email" class="vaild" value="${by[index].email}" readonly /><img class="icon" src="./resources/copy.png" id="emailCopy" title="复制"></div>
    <div class="formItem_Copy"><label for="phone">手机号：</label><input type="text" id="phone" class="vaild" value="${by[index].phone}" readonly /><img class="icon" src="./resources/copy.png" id="phoneCopy" title="复制"></div>
    <div class="formItem_Copy"><p>修改时间：${getReadableTime(by[index].moDate)}</p></div>
    ${from.isSame(Folder.bin())? `<div class="formItem_Copy"><p>删除时间：${getReadableTime(by[index].rmDate!)}</p></div>` : ""}
    <div class="formItem"><label for="note">备注：</label><br><textarea id="note" readonly>${by[index].note}</textarea></div>
    </div>
    <div class="action" id="back"><p>返回</p></div>
    `
    main!.innerHTML = inner;
    const safety : HTMLDivElement = document.querySelector("#safety")!;
    if (from != Folder.bin()) {
        let list : Array<number> = [];
        for(let i = 0; i < pwdList.length; i++){
            if (pwdList[i].pwd == by[index].pwd && i != index){
                list.push(i);
            }
        }
        if (list.length == 1){
            safety.innerHTML += `<p style="color: orange">此密码与${pwdList[list[0]].from}的密码是重复的。</p>`;
        } else if (list.length == 2){
            safety.innerHTML += `<p style="color: orange">此密码与${pwdList[list[0]].from}和${pwdList[list[1]].from}的密码是重复的。</p>`;
        } else if (list.length > 2){
            safety.innerHTML += `<p style="color: red">此密码与${pwdList[list[0]].from}、${pwdList[list[1]].from}等${list.length}个来源的密码是重复的。</p>`;
        }
        let isR : boolean = false;
        for(let i = 0; i < simplePwd.length; i++){
            if (by[index].pwd == simplePwd[i]){
                safety.innerHTML += `<p style="color: red">此密码很容易暴露。</p>`;
                isR = true;
            }
        }
        if (!isR) for(let i = 0; i < lessSimplePwd.length; i++){
            if (by[index].pwd == lessSimplePwd[i]){
                safety.innerHTML += `<p style="color: orange">此密码比较容易暴露。</p>`;
                isR = true;
            }
        }
        if (!isR){
            if (!isNaN(Number(by[index].pwd)))
                safety.innerHTML += `<p style="color: orange">此密码只包含数字，比较容易暴露。</p>`;
            if (by[index].pwd.length <= 3)
                safety.innerHTML += `<p style="color: orange">此密码太短，比较容易暴露。</p>`;
        }
        if (safety.innerHTML == "") safety.style.display = "none";
    }
    document.querySelector("input#pwd")?.addEventListener("click", (e) => {
        if ((e.target as HTMLInputElement).type == "password") (e.target as HTMLInputElement).type = "text";
        else (document.querySelector("input#pwd") as HTMLInputElement).type = "password";
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
            showRecent();
        } else {
            update(from);
        }
    });
}
function showRecent(checkable: boolean = false) : void{
    let pos : {top: number, left: number};
    if (currentFolder.isSame(Folder.bin())){
        pos = getScroll();
    } else {
        pos = {top: 0, left: 0};
    }
    currentFolder = Folder.bin();
    // 显示最近删除的密码
    let inner : string = `<div class="title">最近删除</div>
    <div id="MainToolBar">
    ${checkable ?
        `<p class="tool" id="checkable">取消选择</p>
        <p class="tool" id="check-all">全部选择</p>
        <p class="tool" id="check-invert">反向选择</p>
        <p class="tool" id="delete">删除</p>
        <p class="tool" id="recover">恢复</p>`
    :
        `<p class="tool" id="checkable">选择</p>`
    }
    </div>`;
    recentItem.sort((a: Item, b: Item) => {
        return a.rmDate! > b.rmDate! ? -1 : 1;
    })
    for (let i = 0; i < recentItem.length; i++){
        inner += recentItem[i].getHtmlRecent(i, checkable);
    }
    if (recentItem.length == 0){
        inner += `<p>暂无删除密码</p>`;
    }
    main!.innerHTML = inner;
    document.querySelector("#checkable")?.addEventListener("click", () => {
        showRecent(!checkable);
    });
    if (checkable){
        document.querySelector("#check-all")?.addEventListener("click", () => {
            recentItem.forEach((item: Item, index: number) => {
                (document.querySelector(`#recent${index}-checkbox`) as HTMLInputElement)!.checked = true;
            })
        });
        document.querySelector("#check-invert")?.addEventListener("click", () => {
            recentItem.forEach((item: Item, index: number) => {
                (document.querySelector(`#recent${index}-checkbox`) as HTMLInputElement)!.checked = !(document.querySelector(`#recent${index}-checkbox`) as HTMLInputElement)!.checked;
            })
        });
        document.querySelector("#delete")?.addEventListener("click", () => {
            let cnt: number = 0;
            recentItem.forEach((item: Item, index: number) => {
                if ((document.querySelector(`#recent${index}-checkbox`) as HTMLInputElement)!.checked) cnt++;
            })
            if (cnt == 0) return;
            mkDialog("警告", "此操作不可撤销，你确定要永久删除吗？", ["确定", "取消"])
            .then((res) => {
                if (res == 0){
                    let de: Array<number> = [];
                    recentItem.forEach((item: Item, index: number) => {
                        if ((document.querySelector(`#recent${index}-checkbox`) as HTMLInputElement)!.checked) 
                            de.push(index);
                    })
                    deleterecentItem(de);
                    showRecent();
                }
            });
        });
        document.querySelector("#recover")?.addEventListener("click", () => {
            for(let i = recentItem.length - 1; i >= 0; i--){
                if ((document.querySelector(`#recent${i}-checkbox`) as HTMLInputElement)!.checked) recoverPwd(i);
            }
            showRecent();
        });
    }
    for(let i = 0; i < recentItem.length; i++){
        const recoverBtn = document.querySelector(`#recent${i}-recover`);
        recoverBtn!.addEventListener("click", (e) => {
            e?.stopPropagation();
            recoverPwd(i);
            showRecent();
        });
        const deleteBtn = document.querySelector(`#recent${i}-delete`);
        deleteBtn!.addEventListener("click", (e) => {
            e?.stopPropagation();
            mkDialog("警告", "此操作不可撤销，你确定要永久删除吗？", ["确定", "取消"])
            .then((res) => {
                if (res == 0){
                    deleterecentItem(i);
                    showRecent();
                }
            })
        });
        const info = document.querySelector(`#recent${i}`);
        info!.addEventListener("click", () => {
            if (recentItem[i] instanceof Password) showPwd(<Array<Password>>recentItem, i, Folder.bin());
        });
        if (checkable){
            const check = document.querySelector(`#recent${i}-checkboxDiv`);
            const checkbox = document.querySelector(`#recent${i}-checkbox`) as HTMLInputElement;
            check!.addEventListener("click", (e) => {
                e.stopPropagation();
                checkbox.checked = !checkbox.checked;
            });
            checkbox.addEventListener("click", (e) => {
                e.stopPropagation();
            })
        }
    }
    document.querySelector("#back")?.addEventListener("click", () => {
        update(Folder.root());
    });
    main?.scrollTo(pos);
}
function setting(dir: Folder) : void {
    // 显示设置页面
    main!.innerHTML = `
    <div class="title">设置</div>
    <div class="form">
    <p>安全设置</p>
    <div class="settingFormItem">
        <div><label for="mainPwd">访问密钥：</label><input type="text" id="mainPwd" class="vaild" value="${mainPwd}"/></div>
        <div><input type="checkbox" id="rememberPwd" ${mainPwd == "" ? "disabled" : `${isremember ? "checked" : ""}`}><label for="rememberPwd">记住密钥</label></div>
    </div>
    <p>其他个性化设置</p>
    <div class="settingFormItem">
        <input type="checkbox" id="autoCopy" ${mainSetting.autoCopy ? "checked" : ""}/><label for="autoCopy">当点击一条信息时，不会跳转到详情界面，而是直接复制这条信息对应的密码。</label></div>
    </div>
    <div class="action" id="apply"><p>应用</p></div>
    `;
    const saveKey = document.querySelector("#rememberPwd") as HTMLInputElement;
    document.querySelector("#mainPwd")?.addEventListener("change", (e) => {
        saveKey.disabled = (<HTMLInputElement>e.target).value == "";
    });
    document.querySelector("#apply")?.addEventListener("click", () => {
        mainPwd = (document.querySelector("#mainPwd") as HTMLInputElement).value;
        isremember = (document.querySelector("#rememberPwd") as HTMLInputElement).checked;
        mainSetting.autoCopy = (document.querySelector("#autoCopy") as HTMLInputElement).checked;
        saveData()
        mkDialog("成功！", "设置已顺利应用到程序。");
    });
}

function fmain(){
    function rmActive(){
        document.querySelector("span#nav-setting")!.classList.remove("active");
        document.querySelector("span#nav-bin")!.classList.remove("active");
        document.querySelector("span#nav-home")!.classList.remove("active");
        document.querySelector("span#nav-mainPage")!.classList.remove("active");
    }
    document.querySelector("span#nav-mainPage")!.addEventListener("click", (e) => {
        rmActive();
        (e.target as HTMLSpanElement).classList.add("active");
        update(Folder.root());
    });
    document.querySelector("span#nav-setting")!.addEventListener("click", (e) => {
        rmActive();
        (e.target as HTMLSpanElement).classList.add("active");
        setting(Folder.root());
    });
    document.querySelector("span#nav-bin")!.addEventListener("click", (e) => {
        rmActive();
        (e.target as HTMLSpanElement).classList.add("active");
        update(Folder.bin());
    });
    document.querySelector("span#nav-home")!.addEventListener("click", (e) => {
        rmActive();
        (e.target as HTMLSpanElement).classList.add("active");
        goHome();
    });
    
    window.fs.read("./data").then((data) => {
        data = data.replace(/\s/g,'')
        let obj = JSON.parse(data);
        mainSetting = obj.mainSetting;
        const salt = obj.salt;
        if (obj.isPwdNull){
            enc(window.cryp.pbkdf2("", salt));
        } else {
            if (obj.memory !== null && obj.memory !== undefined){
                let m = obj.memory;
                let dpwd = window.cryp.pbkdf2(m, salt);
                if (window.cryp.pbkdf2(dpwd, salt) == obj.mainPwd){
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
                    let dpwd = window.cryp.pbkdf2(m, salt);
                    if (window.cryp.pbkdf2(dpwd, salt) == obj.mainPwd){
                        isremember = (document.querySelector("#rememberPwd") as HTMLInputElement).checked;
                        mainPwd = m;
                        (<HTMLDivElement>document.querySelector("#navBar")).style.display = "flex";
                        enc(dpwd);
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
                if (element.type == Type.Password) recentItem.push(decrypt(new Password(element), key));
                else recentItem.push(decrypt(new Folder(element), key));
            });
            (document.querySelector("#nav-home") as HTMLSpanElement).click();
        }
    }).catch((err) => {
        console.log(err);
        pwdList = [];
        recentItem = [];
        mainSetting = new MainSetting();
        (document.querySelector("#nav-home") as HTMLSpanElement).click();
    });
}

fmain();