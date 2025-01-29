const showNoteMaxLength = 152; // 在main页面显示备注的最大长度
const showOtherMaxLength = 60; // 在main页面显示来源、用户名、密码的最大长度

enum Page{ // 页面枚举
    Main, // 主页面
    Change, // 编辑页面
    Show, // 显示页面
    Recent, // 最近删除页面
}

class Password{ // 密码类
    from: string; // 来源
    uname: string // 用户名
    pwd: string; // 密码
    email: string; // 邮箱
    phone: string; // 电话
    note: string; // 备注
    constructor(from: string, uname: string, pwd: string, note: string, email: string, phone: string){ // 构造函数
        this.from = from;
        this.uname = uname;
        this.pwd = pwd;
        this.note = note;
        this.email = email;
        this.phone = phone;
    }
    getHtml(): string{ // 获取密码在main页面的html
        return `
        <div class="info">
            ${this.getBaseHtml()}
            <div class="tool">
                <img class="icon" id="edit" style="margin-right: 8px;" src="./resources/edit.png" title="编辑">
                <img class="icon" id="delete" src="./resources/delete.png" title="删除">
            </div>
        </div>
        `;
    }
    getHtmlRecent(): string{ // 获取密码在recent页面的html
        return `
        <div class="info">
            ${this.getBaseHtml()}
            <div class="tool">
                <img class="icon" id="recover" style="margin-right: 8px;" src="./resources/recovery.png" title="恢复">
                <img class="icon" id="delete" src="./resources/delete.png" title="删除">
            </div>
        </div>
        `;
    }
    private getBaseHtml(): string{ // 获取密码的基本html
        function format(str: string, max: number = showOtherMaxLength): string{
            if (str.length == 0){
                return "暂无";
            }
            let left: number = max;
            for (let i = 0; i < str.length; i++){
                left -= isFullWidthChar(str[i]) ? 2 : 1;
                if (left < 0){
                    return str.slice(0, i) + "...";
                }
            }
            return str;
        }
        return `<p>来源：${format(this.from)}</p>
            <p>用户名：${format(this.uname)}</p>
            <p>密码：${format(this.pwd)}</p>
            ${this.email == ""?"":`<p>邮箱：${format(this.email)}</p>`}
            ${this.phone == ""?"":`<p>电话：${format(this.phone)}</p>`}
            ${this.note == ""?"":`<p>备注：${format(this.note, showNoteMaxLength)}</p>`}`
        };
    }

let addBtn = document.querySelector("#addPwd"); // 添加密码按钮
const main = document.querySelector("#mainDiv"); // main界面
let pwdList : Array<Password> = []; // 密码列表
let recentPwd : Array<Password> = []; // 最近删除的密码列表

// 一些工具函数
function random(a: number, b: number): number{ // 生成[a, b]之间的随机数
    return Math.floor(Math.random() * (b - a) + a);
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
function saveData(): void{ // 保存数据
    let data: string = JSON.stringify({
        pwd: pwdList,
        recent: recentPwd,
    });
    window.fs.save("./data", data);
}
// 渲染main界面
function update(by: Array<Password> = pwdList) : void{
    let inner : string = `<div class="title">密码列表</div>`;
    for (let i = 0; i < by.length; i++){
        inner += by[i].getHtml();
    }
    if (by.length == 0){
        inner += `<p>暂无密码</p>`;
    }
    inner += `
    <div class="info" id="recent">
        <p>最近删除</p>
    </div>
    <div class="action" id="addPwd"><p>添加密码</p></div>
    `;
    main!.innerHTML = inner;
    addBtn = document.querySelector("#addPwd");
    addBtn?.addEventListener("click", () => {
        addPwd();
    });
    let editBtns = document.querySelectorAll("#edit");
    for(let i = 0; i < editBtns.length; i++){
        editBtns[i].addEventListener("click", (e) => {
            e?.stopPropagation();
            changePwd(by, i);
        });
    }
    let deleteBtns = document.querySelectorAll("#delete");
    for(let i = 0; i < deleteBtns.length; i++){
        deleteBtns[i].addEventListener("click", (e) => {
            e?.stopPropagation();
            deletePwd(i);
        });
    }
    let infos = document.querySelectorAll(".info");
    for(let i = 0; i < infos.length; i++){
        if (infos[i].id == "recent"){
            continue;
        }
        infos[i].addEventListener("click", () => {
            showPwd(pwdList, i);
        });
    }
    document.querySelector("#recent")?.addEventListener("click", () => {
        showRecent();
    });
}

// 渲染编辑密码界面，并更改密码，isAppend表示是否是添加密码，为true时，取消将会删除该密码，会返回main界面
function changePwd(by: Array<Password>, index: number, isAppend : boolean = false) : void{
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
        let str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_+";
        let res = "";
        for (let i = 0; i < random(10, 16); i++){
            res += str[random(0, str.length - 1)];
        }
        pwd.value = res;
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
        by[index] = new Password(name, uname, pwd, note, email, phone);
        saveData()
        update();
    });
    document.querySelector("#cancel")?.addEventListener("click", () => {
        if (isAppend){
            by.splice(index, 1);
        }
        update();
    });
}

function deletePwd(index: number) : void{
    // 删除密码
    recentPwd.unshift(new Password(pwdList[index].from, pwdList[index].uname, pwdList[index].pwd, pwdList[index].note, pwdList[index].email, pwdList[index].phone));
    pwdList.splice(index, 1);
    saveData();
    update();
}

function deleteRecentPwd(index: number) : void{
    // 删除最近删除的密码
    recentPwd.splice(index, 1);
    saveData();
}

function recoverPwd(index: number) : void{
    // 恢复最近删除的密码
    pwdList.push(recentPwd[index]);
    recentPwd.splice(index, 1);
    saveData();
    update();
}

function addPwd() : void{
    // 添加密码
    let tgt : number = pwdList.length;
    pwdList.push(new Password("", "", "", "", "", ""));
    changePwd(pwdList, tgt, true);
}

// 显示密码， from表示从哪个页面跳转过来的，如果是从最近删除跳转过来的，返回时会返回到最近删除页面，否则返回到主页面，需要填写Page枚举
function showPwd(by: Array<Password>, index: number, from : Page = Page.Main) : void{
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
        if (from == Page.Main){
            update();
        } else if (from == Page.Recent){
            showRecent();
        }
    });
}

function showRecent() : void{
    // 显示最近删除的密码
    let inner : string = `<div class="title">最近删除</div>`;
    for (let i = 0; i < recentPwd.length; i++){
        inner += recentPwd[i].getHtmlRecent();
    }
    if (recentPwd.length == 0){
        inner += `<p>暂无删除密码</p>`;
    }
    inner += `
    <div class="action" id="back"><p>返回</p></div>
    `;
    main!.innerHTML = inner;
    let recoverBtns = document.querySelectorAll("#recover");
    for(let i = 0; i < recoverBtns.length; i++){
        recoverBtns[i].addEventListener("click", (e) => {
            e?.stopPropagation();
            recoverPwd(i);
            showRecent();
        });
    }
    let deleteBtns = document.querySelectorAll("#delete");
    for(let i = 0; i < deleteBtns.length; i++){
        deleteBtns[i].addEventListener("click", (e) => {
            e?.stopPropagation();
            let result = window.msg.warning("警告", "此操作不可撤销，你确定要永久删除吗？", ["确定", "取消"]);
            result.then((res) => {
                if (res == 0){
                    deleteRecentPwd(i);
                    showRecent();
                }
            })
        });
    }
    let infos = document.querySelectorAll(".info");
    for(let i = 0; i < infos.length; i++){
        infos[i].addEventListener("click", () => {
            showPwd(recentPwd, i, Page.Recent);
        });
    }
    document.querySelector("#back")?.addEventListener("click", () => {
        update();
    });
}

window.fs.read("./data").then((data) => {
    let obj = JSON.parse(data);
    for(let i = 0; i < obj.pwd.length; i++){
        pwdList.push(new Password(obj.pwd[i].from, obj.pwd[i].uname, obj.pwd[i].pwd, obj.pwd[i].note, obj.pwd[i].email, obj.pwd[i].phone));
    }
    for(let i = 0; i < obj.recent.length; i++){
        recentPwd.push(new Password(obj.recent[i].from, obj.recent[i].uname, obj.recent[i].pwd, obj.recent[i].note, obj.recent[i].email, obj.recent[i].phone));
    }
    update();
}).catch((err) => {
    console.log(err);
    pwdList = [];
    recentPwd = [];
    update();
});