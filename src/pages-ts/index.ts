const showNoteMaxLength: number = 152; // 在main页面显示备注的最大长度
const showOtherMaxLength: number = 60; // 在main页面显示来源、用户名、密码的最大长度
const showPathMaxLength: number = 65; // 在main页面显示路径的最大长度

enum Type{ // 类型枚举
    Folder, // 文件夹
    Password, // 密码
}

class Password{ // 密码类
    from: string; // 来源
    uname: string // 用户名
    pwd: string; // 密码
    email: string; // 邮箱
    phone: string; // 电话
    note: string; // 备注
    dir: Folder; // 文件夹
    type: Type = Type.Password; // 类型
    constructor(fromOrdata: string | Password = "", uname: string = "", pwd: string = "", note: string = "", email: string = "", phone: string = "", dir: Folder = Folder.root()){ // 构造函数
        this.type = Type.Password;
        if (typeof fromOrdata === "string") {
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
        }
    }
    getHtml(id: number, checkable: boolean = false): string{
		let tool = `<div class="tool">
			<img class="icon" id="pwd${id}-edit" style="margin-right: 8px;" src="./resources/edit.png" title="编辑">
			<img class="icon" id="pwd${id}-delete" src="./resources/delete.png" title="删除">
		</div>`
		if (checkable) return `<div class="info" style="flex-direction: row;" id="pwd${id}" draggable="true">
			<div class="checkbox"><input type="checkbox" id="pwd${id}-checkbox"></div>
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
    getHtmlRecent(id: number): string{ // 获取密码在recent页面的html
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
    private getBaseHtml(): string{ // 获取密码的基本html
        return `<p>来源：${Password.format(this.from)}</p>
            <p>用户名：${Password.format(this.uname)}</p>
            <p>密码：${Password.format(this.pwd)}</p>
            ${this.email == ""?"":`<p>邮箱：${Password.format(this.email)}</p>`}
            ${this.phone == ""?"":`<p>电话：${Password.format(this.phone)}</p>`}
            ${this.note == ""?"":`<p>备注：${Password.format(this.note, showNoteMaxLength)}</p>`}`
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
    type: Type = Type.Folder;
    /*
    name: 文件夹名称
    parent: 文件夹路径
    parent的格式如下：
    ":/a/"表示在主文件夹下的a文件夹内
    ""表示在主文件夹下

    特别的，主文件夹的name为":"，parent为""，在回收站中的文件name为"~"，parent为""
    */
    constructor(nameOrClass: string | Folder, parent: string = ":"){
        this.type = Type.Folder;
        if (typeof nameOrClass === "string"){
            this.name = nameOrClass;
            this.parent = parent;
        } else {
            this.name = nameOrClass.name;
            this.parent = nameOrClass.parent;
        }
    }
	getHtml(id: number, checkable: boolean = false): string{
		let tool = `<div class="tool">
			<img class="icon" id="folder${id}-edit" style="margin-right: 8px;" src="./resources/edit.png" title="重命名">
			<img class="icon" id="folder${id}-delete" src="./resources/delete.png" title="删除">
		</div>`
		if (checkable) return `<div class="info" style="flex-direction: row;" id="folder${id}" draggable="true">
			<div class="checkbox"><input type="checkbox" id="folder${id}-checkbox"></div>
			<div class="content">
				<p>${this.name}</p>
				${tool}
			</div>
        </div>`;
		else return `<div class="info" id="folder${id}" draggable="true">
            <p>${this.name}</p>
            ${tool}
        </div>`;
    }
    getHtmlRecent(id: number): string{ // 获取密码在recent页面的html
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
    static root(): Folder{
        return new Folder(":", "");
    }
    static bin(): Folder{
        return new Folder("~", "");
    }
    static fromString(str: string): Folder{
        if (str[str.length - 1] != "/") str += "/";
        const arr = str.split("/");
        let k = arr.slice(0, arr.length - 2).join("/");
        return new Folder(arr[arr.length - 2], k == "" ? "" : k + "/");
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
    isInclude(item : Folder | Password): boolean{
        if (item instanceof Folder) return item.parent == this.stringify();
        else return item.dir.isSame(this);
    }
    // 判断文件夹是否在当前文件夹或后代文件夹下
    isin(folder: Folder): boolean{
        const f = folder.stringify()
        return f == this.parent.slice(0, f.length);
    }
}

function encrypt(data: Password | Folder, key: string): Password | Folder{ // 加密
    let enc: Password | Folder;
    if (data instanceof Password) enc = new Password(data);
    else enc = new Folder(data);
    let index : number = 0;
    function getKey(): string{
        let dkey: string = key + key; // 重复主密码
        let res: string = dkey.slice(index, index + key.length); // 取出主密码
        index++;
        if (index >= key.length) index = 0;
        return res;
    }
    for (let v of Object.keys(data) as (keyof (Password | Folder))[]){
        if (typeof data[v] === "string"){
            (enc as any)[v] = window.cryp.encrypt(data[v], getKey())
        }
    }
    return enc;
}
function decrypt(data:Password | Folder, key: string): Password | Folder{ // 解密
    let dec: Password | Folder;
    if (data instanceof Password) dec = new Password(data);
    else dec = new Folder(data);
    let index : number = 0;
    function getKey(): string{
        let dkey: string = key + key; // 重复主密码
        let res: string = dkey.slice(index, index + key.length); // 取出主密码
        index++;
        if (index >= key.length) index = 0;
        return res;
    }
    for (let v of Object.keys(data) as (keyof (Password | Folder))[]){
        if (typeof data[v] == "string"){
            (dec as any)[v] = window.cryp.decrypt(data[v], getKey());
        }
    }
    return dec;
}
    

let addBtn = document.querySelector("#addPwd"); // 添加密码按钮
const main = document.querySelector("#mainDiv"); // main界面
let pwdList : Array<Password> = []; // 密码列表
let recentItem : Array<Password | Folder> = []; // 最近删除的密码列表
let folderList : Array<Folder> = []; // 文件夹列表
let mainPwd : string = ""; // 主密码
let isremember : boolean = false; // 是否记住密码
let folderIsEditing : boolean = false; // 是否正在编辑文件夹
let currentFolder : Folder = Folder.root();

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
function saveData(): void{ // 保存数据
    let salt: string = randstr(16);
    let enc = window.cryp.pbkdf2(mainPwd, salt)
    let pwdListUpdated : Array<Password> = []
    let folderListUpdated : Array<Folder> = [];
    let recentItemUpdated : Array<Password | Folder> = [];

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


// 渲染main界面
function update(dir: Folder) : void{
    let topScroll
    if (dir.isSame(currentFolder)){
        topScroll = getScroll();
    } else {
        topScroll = {top: 0, left: 0};
    }
    currentFolder = dir;
    let inner : string = `<div class="title">密码列表</div>
    ${dir.isSame(Folder.root())?"":`<div class="subtitle">当前位置：${Password.format(dir.stringify(), showPathMaxLength, "front")}</div>`}
    <div style="position: absolute; top: 15px; right: 45px;" id="MainToolBar">
        <img src="../pages/resources/setting.png" title="设置" class="icon" style="width: 25px;height: 25px;" id="setting">
        <img src="../pages/resources/newFolder.png" title="新建文件夹" class="icon" style="width: 25px;height: 25px;" id="newFolder">
    	${dir.isSame(Folder.root())?"":`<img src="../pages/resources/up.png" title="上移到${dir.parent}" class="icon" style="width: 23px;height: 23px;" id="up">`}
    </div>
    `;

    let has : boolean = false;
    for (let i = 0; i < folderList.length; i++){
        if (dir.isInclude(folderList[i])) {
            inner += folderList[i].getHtml(i);
            has = true;
        }
    }
    for (let i = 0; i < pwdList.length; i++){
        if (dir.isInclude(pwdList[i])) {
            inner += pwdList[i].getHtml(i);
            has = true;
        }
    }
    if (!has){
        inner += `<p>暂无密码</p>`;
    }
    inner += `
    <div class="info" id="recent">
        <p>最近删除</p>
    </div>
    <div class="action" id="addPwd"><p>添加密码</p></div>
    `;
    main!.innerHTML = inner;
    document.querySelector("#setting")?.addEventListener("click", () => {
        setting();
    });
	document.querySelector("#up")?.addEventListener("click", () => {
	    update(dir.getParent());
	});
    document.querySelector("#newFolder")?.addEventListener("click", () => {
        let k : Set<number> = new Set()
        for (let i = 0; i < folderList.length; i++){
            if (dir.isInclude(folderList[i])){
                if(folderList[i].name == "新建文件夹") k.add(0);
                if (folderList[i].name.length >= 5 && folderList[i].name.slice(0, 5) == "新建文件夹"){
                    let can: boolean = true;
                    for(let j = 5; j < folderList[i].name.length; j++){
                        if (isNaN(Number(folderList[i].name[j]))){
                            can = false;
                            break;
                        }
                    }
                    if (can){
                        k.add(Number(folderList[i].name.slice(5)));
                    }
                }
            }
        }
        let lowerBound = 0;
        while(true){
            if (!k.has(lowerBound)){
                break;
            }
            lowerBound++;
        }
        mkdir(new Folder(`新建文件夹${lowerBound == 0 ? "" : lowerBound}`, dir.stringify()));
        update(dir);
    });
    addBtn = document.querySelector("#addPwd");
    addBtn?.addEventListener("click", () => {
        addPwd(dir);
    });
    for(let i = 0; i < pwdList.length; i++){
        if (!dir.isInclude(pwdList[i])) continue;
        const editBtn = document.querySelector(`#pwd${i}-edit`);
        editBtn!.addEventListener("click", (e) => {
            e?.stopPropagation();
            changePwd(pwdList, i, dir);
        });
    }
    for(let i = 0; i < pwdList.length; i++){
        if (!dir.isInclude(pwdList[i])) continue;
        const deleteBtn = document.querySelector(`#pwd${i}-delete`);
        deleteBtn!.addEventListener("click", (e) => {
            e?.stopPropagation();
            deleteItem(Type.Password, i, dir);
        });
    }
    for(let i = 0; i < folderList.length; i++){
        if (!dir.isInclude(folderList[i])) continue;
        const feditBtn = document.querySelector(`#folder${i}-edit`);
        feditBtn!.addEventListener("click", (e) => {
            e?.stopPropagation();
            const div = document.querySelector(`#folder${i}`);
            div!.innerHTML = `<input type="text" value="${folderList[i].name}" id="folder${i}-input">`;
            const input = document.querySelector(`#folder${i}-input`) as HTMLInputElement;
            folderIsEditing = true;
            input.focus();
            input.select();
            input.addEventListener("keydown", (e) => {
                if (e.key == "Enter" && !e.isComposing){
                    input.blur();
                }
            })
            input!.addEventListener("blur", () => {
                let newFolder : Folder = new Folder(folderList[i]);
                newFolder.name = input!.value;
                folderIsEditing = false;
                if (folderList.findIndex(v => (v.isSame(newFolder))) != -1 && !newFolder.isSame(folderList[i])){
                    window.msg.warning("警告", "文件夹名已存在");
                    saveData();
                    update(dir);
                    return;
                }
                for(let j = 0; j < pwdList.length; j++){
                    if (folderList[i].isInclude(pwdList[j])) {
                        pwdList[j].dir = newFolder;
                    }
                }
                for(let j = 0; j < folderList.length; j++){
                    if (folderList[i].isInclude(folderList[j])) {
                        folderList[j].setParent(newFolder);
                    }
                }
                folderList[i] = new Folder(newFolder);
                saveData();
                update(dir);
            });
        });
    }
    for(let i = 0; i < folderList.length; i++){
        if (!dir.isInclude(folderList[i])) continue;
        const fdeleteBtn = document.querySelector(`#folder${i}-delete`);
        fdeleteBtn!.addEventListener("click", (e) => {
            if (folderIsEditing) return;
            e?.stopPropagation();
            deleteItem(Type.Folder, i, dir);
            update(dir);
        });
    }
    for(let i = 0; i < pwdList.length; i++){
        if (!dir.isInclude(pwdList[i])) continue;
        const info = document.querySelector(`#pwd${i}`);
        info!.addEventListener("click", () => {
            if (folderIsEditing) return;
            showPwd(pwdList, i, dir);
        });
    }
    for(let i = 0; i < folderList.length; i++){
        if (!dir.isInclude(folderList[i])) continue;
        const folder = document.querySelector(`#folder${i}`);
        folder!.addEventListener("click", () => {
            if (folderIsEditing) return;
            update(folderList[i]);
        });
    }
    document.querySelector("#recent")?.addEventListener("click", () => {
        if (folderIsEditing) return;
        showRecent();
    });

    for (let i = 0; i < pwdList.length; i++){
        if (!dir.isInclude(pwdList[i])) continue;
        const pwd = document.querySelector(`#pwd${i}`);
        pwd!.addEventListener("dragstart", (e) => {
            if (folderIsEditing) return;
            (e as DragEvent)?.dataTransfer?.setData("text/plain", "p" + i.toString());
        });
    };
    for (let i = 0; i < folderList.length; i++){
        if (!dir.isInclude(folderList[i])) continue;
        const folder = document.querySelector(`#folder${i}`);
        folder!.addEventListener("dragstart", (e) => {
            if (folderIsEditing) return;
            (e as DragEvent)?.dataTransfer?.setData("text/plain", "f" + i.toString());
        });
    }
    for (let i = 0; i < folderList.length; i++){
        if (!dir.isInclude(folderList[i])) continue;
        const folder = document.querySelector(`#folder${i}`);
        folder!.addEventListener("dragover", (e) => {
            if (folderIsEditing) return;
            e.preventDefault();
        });
        folder!.addEventListener("drop", (e) => {
            if (folderIsEditing) return;
            e.preventDefault();
            const index : string = (e as DragEvent)?.dataTransfer?.getData("text/plain") as string;
            if (index[0] == "p"){
                pwdList[parseInt(index.substring(1))].dir = folderList[i];
            } else if (index[0] == "f"){
                folderList[parseInt(index.substring(1))].setParent(folderList[i]);
            }
            saveData()
            update(dir);
        })
    }
    main?.scrollTo(topScroll)
}

// 渲染编辑密码界面，并更改密码，isAppend表示是否是添加密码，为true时，取消将会删除该密码，会返回main界面
function changePwd(by: Array<Password>, index: number, dir: Folder, isAppend : boolean = false) : void{
    let inner : string = `
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
    const rd = document.querySelector("#random");
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
            alert("请填写完整信息");
            return;
        }
        const dir = by[index].dir;
        by[index] = new Password(name, uname, pwd, note, email, phone, dir);
        saveData()
        update(dir);
    });
    document.querySelector("#cancel")?.addEventListener("click", () => {
        if (isAppend){
            by.splice(index, 1);
        }
        update(dir);
    });
}

// 删除密码，type为类型，index为索引，dir_from为来源文件夹，dir_rm为删除到的文件夹，默认为回收站，在外部的调用中，save不应被填写
function deleteItem(type: Type, index: number, dir_from: Folder, save: boolean = true) : void{
    if (type == Type.Password) {
        pwdList[index].dir = Folder.fromString(Folder.bin().stringify() + pwdList[index].dir.stringify().slice(2));
        recentItem.unshift(new Password(pwdList[index]));
        pwdList.splice(index, 1);
    } else {
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
        folderList[index] = Folder.fromString(Folder.bin().stringify() + folderList[index].stringify().slice(2));
        recentItem.unshift(new Folder(folderList[index]));
        folderList.splice(index, 1);
    }
    if (save){
        saveData();
        update(dir_from);
    }
}

function deleterecentItem(index: number) : void{
    // 删除最近删除的密码
    recentItem.splice(index, 1);
    saveData();
}

function recoverPwd(index: number) : void{
    // 恢复最近删除的密码
    if (recentItem[index] instanceof Password) {
        recentItem[index].dir = Folder.fromString(Folder.root().stringify() + recentItem[index].dir.stringify().slice(2));
        mkdir((<Password>recentItem[index]).dir);
        pwdList.push(recentItem[index]);
    }
    else {
        recentItem[index] = Folder.fromString(Folder.root().stringify() + recentItem[index].stringify().slice(2));
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
    <div class="formItem_Copy"><label for="pwd">密码：</label><input type="text" id="pwd" class="vaild" value="${by[index].pwd}" readonly /><img class="icon" src="./resources/copy.png" id="pwdCopy" title="复制"></div>
    <div class="formItem_Copy"><label for="email">邮箱：</label><input type="text" id="email" class="vaild" value="${by[index].email}" readonly /><img class="icon" src="./resources/copy.png" id="emailCopy" title="复制"></div>
    <div class="formItem_Copy"><label for="phone">手机号：</label><input type="text" id="phone" class="vaild" value="${by[index].phone}" readonly /><img class="icon" src="./resources/copy.png" id="phoneCopy" title="复制"></div>
    <div class="formItem"><label for="note">备注：</label><br><textarea id="note" readonly>${by[index].note}</textarea></div>
    </div>
    <div class="action" id="back"><p>返回</p></div>
    `
    main!.innerHTML = inner;
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

function showRecent() : void{
    let pos : {top: number, left: number};
    if (currentFolder.isSame(Folder.bin())){
        pos = getScroll();
    } else {
        pos = {top: 0, left: 0};
    }
    currentFolder = Folder.bin();
    // 显示最近删除的密码
    let inner : string = `<div class="title">最近删除</div>`;
    for (let i = 0; i < recentItem.length; i++){
        inner += recentItem[i].getHtmlRecent(i);
    }
    if (recentItem.length == 0){
        inner += `<p>暂无删除密码</p>`;
    }
    inner += `
    <div class="action" id="back"><p>返回</p></div>
    `;
    main!.innerHTML = inner;
    for(let i = 0; i < recentItem.length; i++){
        const recoverBtn = document.querySelector(`#recent${i}-recover`);
        recoverBtn!.addEventListener("click", (e) => {
            e?.stopPropagation();
            recoverPwd(i);
            showRecent();
        });
    }

    for(let i = 0; i < recentItem.length; i++){
        const deleteBtn = document.querySelector(`#recent${i}-delete`);
        deleteBtn!.addEventListener("click", (e) => {
            e?.stopPropagation();
            let result = window.msg.warning("警告", "此操作不可撤销，你确定要永久删除吗？", ["确定", "取消"]);
            result.then((res) => {
                if (res == 0){
                    deleterecentItem(i);
                    showRecent();
                }
            })
        });
    }
    for(let i = 0; i < recentItem.length; i++){
        const info = document.querySelector(`#recent${i}`);
        info!.addEventListener("click", () => {
            if (recentItem[i] instanceof Password) showPwd(<Array<Password>>recentItem, i, Folder.bin());
        });
    }
    document.querySelector("#back")?.addEventListener("click", () => {
        update(Folder.root());
    });
    main?.scrollTo(pos);
}

function setting() : void {
    // 显示设置页面
    main!.innerHTML = `
    <div class="title">设置</div>
    <div class="form">
    <div><label for="mainPwd">访问密钥：</label><input type="text" id="mainPwd" class="vaild" value="${mainPwd}"/></div>
    <div><input type="checkbox" id="rememberPwd" ${isremember ? "checked" : ""} style="margin-right: 10px;"/><label for="rememberPwd">记住密钥</label></div>
    </div>
    <div class="action" id="save"><p>保存</p></div>
    <div class="action" id="cancel"><p>取消</p></div>
    `;
    document.querySelector("#save")?.addEventListener("click", () => {
        mainPwd = (document.querySelector("#mainPwd") as HTMLInputElement).value;
        isremember = (document.querySelector("#rememberPwd") as HTMLInputElement).checked;
        saveData();
        update(Folder.root());
    })
    document.querySelector("#cancel")?.addEventListener("click", () => {
        update(Folder.root());
    });
}

window.fs.read("./data").then((data) => {
    let obj = JSON.parse(data);
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
            `;
            document.querySelector("#Yes")?.addEventListener("click", () => {
                let m = (document.querySelector("#mainPwd") as HTMLInputElement).value;
                let dpwd = window.cryp.pbkdf2(m, salt);
                if (window.cryp.pbkdf2(dpwd, salt) == obj.mainPwd){
                    isremember = (document.querySelector("#rememberPwd") as HTMLInputElement).checked;
                    mainPwd = m;
                    enc(dpwd);
                };
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
        update(Folder.root());
    }
}).catch((err) => {
    console.log(err);
    pwdList = [];
    recentItem = [];
    update(Folder.root());
});