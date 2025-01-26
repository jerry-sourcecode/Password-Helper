const showNoteMaxLength = 152;
const showOtherMaxLength = 60;

class Password{
    from: string;
    uname: string
    pwd: string;
    note: string;
    constructor(from: string, uname: string, pwd: string, note: string){
        this.from = from;
        this.uname = uname;
        this.pwd = pwd;
        this.note = note;
    }
    getHtml(): string{
        return `
        <div class="info">
            <p>来源：${this.format(this.from)}</p>
            <p>用户名：${this.format(this.uname)}</p>
            <p>密码：${this.format(this.pwd)}</p>
            <p>注释：${this.format(this.note, showNoteMaxLength)}</p>
            <div class="tool">
                <img class="icon" id="edit" style="margin-right: 8px;" src="./img/edit.png" title="编辑">
                <img class="icon" id="delete" src="./img/delete.png" title="删除">
            </div>
        </div>
        `;
    }
    private format(str: string, max: number = showOtherMaxLength): string{
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
}

let addBtn = document.querySelector("#addPwd");
const main = document.querySelector("#mainDiv");
let pwdList : Array<Password> = [];

function random(a: number, b: number): number{
    return Math.floor(Math.random() * (b - a) + a);
}

function isFullWidthChar(c: string): boolean{
    return c.charCodeAt(0) > 255;
}

function update(by: Array<Password> = pwdList) : void{
    let inner : string = ``;
    for (let i = 0; i < by.length; i++){
        inner += by[i].getHtml();
    }
    if (by.length == 0){
        inner = `<p>暂无密码</p>`;
    }
    inner += `<div class="action" id="addPwd"><p>添加密码</p></div>`;
    main!.innerHTML = inner;
    addBtn = document.querySelector("#addPwd");
    addBtn?.addEventListener("click", () => {
        addPwd();
    });
    let editBtns = document.querySelectorAll("#edit");
    for(let i = 0; i < editBtns.length; i++){
        editBtns[i].addEventListener("click", () => {
            changePwd(by, i);
        });
    }
    let deleteBtns = document.querySelectorAll("#delete");
    for(let i = 0; i < deleteBtns.length; i++){
        deleteBtns[i].addEventListener("click", () => {
            deletePwd(i);
        });
    }
    let infos = document.querySelectorAll(".info");
    for(let i = 0; i < infos.length; i++){
        infos[i].addEventListener("click", () => {
            showPwd(i);
        });
    }
}

function changePwd(by: Array<Password>, index: number, isAppend : boolean = false) : void{
    // 修改密码
    let inner : string = `
    <div class="form">
    <div class="formItem"><label for="from">来源：</label><input type="text" id="from" class="${by[index].from == "" ? "invaild" : "vaild"}" value="${by[index].from}" /><span></span></div>
    <div class="formItem"><label for="uname">用户名：</label><input type="text" id="uname" class="${by[index].uname == "" ? "invaild" : "vaild"}" value="${by[index].uname}" /><span></span></div>
    <div class="formItem"><label for="pwd">密码：</label><input type="text" id="pwd" class="${by[index].pwd == "" ? "invaild" : "vaild"}" value="${by[index].pwd}" /><span></span></div>
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
        let note = (document.querySelector("#note") as HTMLTextAreaElement).value;
        if (name == "" || uname == "" || pwd == ""){
            alert("请填写完整信息");
            return;
        }
        by[index] = new Password(name, uname, pwd, note);
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
    pwdList.splice(index, 1);
    update();
}

function addPwd() : void{
    // 添加密码
    let tgt : number = pwdList.length;
    pwdList.push(new Password("", "", "", ""));
    changePwd(pwdList, tgt, true);
}

function showPwd(index: number) : void{
    // 显示密码
    let inner : string = `
    <div class="form">
    <div class="formItem"><label for="from">来源：</label><input type="text" id="from" class="vaild" value="${pwdList[index].from}" readonly /></div>
    <div class="formItem"><label for="uname">用户名：</label><input type="text" id="uname" class="vaild" value="${pwdList[index].uname}" readonly /></div>
    <div class="formItem"><label for="pwd">密码：</label><input type="text" id="pwd" class="vaild" value="${pwdList[index].pwd}" readonly /></div>
    <div class="formItem"><label for="note">备注：</label><br><textarea id="note" readonly>${pwdList[index].note}</textarea></div>
    </div>
    <div class="action" id="back"><p>返回</p></div>
    `
    main!.innerHTML = inner;
    document.querySelector("#back")?.addEventListener("click", () => {
        update();
    });
}

update();