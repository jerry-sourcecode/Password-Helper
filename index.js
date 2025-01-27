"use strict";
const showNoteMaxLength = 152;
const showOtherMaxLength = 60;
class Password {
    constructor(from, uname, pwd, note) {
        this.from = from;
        this.uname = uname;
        this.pwd = pwd;
        this.note = note;
    }
    getHtml() {
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
    format(str, max = showOtherMaxLength) {
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
}
let addBtn = document.querySelector("#addPwd");
const main = document.querySelector("#mainDiv");
let pwdList = [];
function random(a, b) {
    return Math.floor(Math.random() * (b - a) + a);
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
function update(by = pwdList) {
    let inner = ``;
    for (let i = 0; i < by.length; i++) {
        inner += by[i].getHtml();
    }
    if (by.length == 0) {
        inner = `<p>暂无密码</p>`;
    }
    inner += `<div class="action" id="addPwd"><p>添加密码</p></div>`;
    main.innerHTML = inner;
    addBtn = document.querySelector("#addPwd");
    addBtn === null || addBtn === void 0 ? void 0 : addBtn.addEventListener("click", () => {
        addPwd();
    });
    let editBtns = document.querySelectorAll("#edit");
    for (let i = 0; i < editBtns.length; i++) {
        editBtns[i].addEventListener("click", () => {
            changePwd(by, i);
        });
    }
    let deleteBtns = document.querySelectorAll("#delete");
    for (let i = 0; i < deleteBtns.length; i++) {
        deleteBtns[i].addEventListener("click", () => {
            deletePwd(i);
        });
    }
    let infos = document.querySelectorAll(".info");
    for (let i = 0; i < infos.length; i++) {
        infos[i].addEventListener("click", () => {
            showPwd(i);
        });
    }
}
function changePwd(by, index, isAppend = false) {
    var _a, _b;
    let inner = `
    <div class="form">
    <div class="formItem"><label for="from">来源：</label><input type="text" id="from" class="${by[index].from == "" ? "invaild" : "vaild"}" value="${by[index].from}" /><span class="check"></span></div>
    <div class="formItem"><label for="uname">用户名：</label><input type="text" id="uname" class="${by[index].uname == "" ? "invaild" : "vaild"}" value="${by[index].uname}" /><span class="check"></span></div>
    <div class="formItem"><label for="pwd">密码：</label><input type="text" id="pwd" class="${by[index].pwd == "" ? "invaild" : "vaild"}" value="${by[index].pwd}" /><span class="check"></span></div>
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
        let str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_+";
        let res = "";
        for (let i = 0; i < random(10, 16); i++) {
            res += str[random(0, str.length - 1)];
        }
        pwd.value = res;
        pwd.dispatchEvent(new Event("input"));
    });
    (_a = document.querySelector("#submit")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
        let name = document.querySelector("#from").value;
        let uname = document.querySelector("#uname").value;
        let pwd = document.querySelector("#pwd").value;
        let note = document.querySelector("#note").value;
        if (name == "" || uname == "" || pwd == "") {
            alert("请填写完整信息");
            return;
        }
        by[index] = new Password(name, uname, pwd, note);
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
    pwdList.splice(index, 1);
    update();
}
function addPwd() {
    let tgt = pwdList.length;
    pwdList.push(new Password("", "", "", ""));
    changePwd(pwdList, tgt, true);
}
function showPwd(index) {
    var _a, _b, _c, _d;
    let inner = `
    <div class="form">
    <div class="formItem_Copy"><label for="from">来源：</label><input type="text" id="from" class="vaild" value="${pwdList[index].from}" readonly /><img class="icon" src="./img/copy.png" id="fromCopy" title="复制"></div>
    <div class="formItem_Copy"><label for="uname">用户名：</label><input type="text" id="uname" class="vaild" value="${pwdList[index].uname}" readonly /><img class="icon" src="./img/copy.png" id="unameCopy" title="复制"></div>
    <div class="formItem_Copy"><label for="pwd">密码：</label><input type="text" id="pwd" class="vaild" value="${pwdList[index].pwd}" readonly /><img class="icon" src="./img/copy.png" id="pwdCopy" title="复制"></div>
    <div class="formItem"><label for="note">备注：</label><br><textarea id="note" readonly>${pwdList[index].note}</textarea></div>
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
            (_b = document.querySelector("#fromCopy")) === null || _b === void 0 ? void 0 : _b.setAttribute("src", "./img/copy_done.png");
            (_c = document.querySelector("#from")) === null || _c === void 0 ? void 0 : _c.setAttribute("copyed", "true");
            setTimeout(() => {
                var _a, _b;
                (_a = document.querySelector("#fromCopy")) === null || _a === void 0 ? void 0 : _a.setAttribute("src", "./img/copy.png");
                (_b = document.querySelector("#from")) === null || _b === void 0 ? void 0 : _b.removeAttribute("copyed");
            }, 1500);
        }
    });
    (_b = document.querySelector("#unameCopy")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
        var _a, _b, _c;
        if (((_a = document.querySelector("#uname")) === null || _a === void 0 ? void 0 : _a.getAttribute("copyed")) == "true") {
            return;
        }
        if (copyToClipboard(pwdList[index].uname)) {
            (_b = document.querySelector("#unameCopy")) === null || _b === void 0 ? void 0 : _b.setAttribute("src", "./img/copy_done.png");
            (_c = document.querySelector("#uname")) === null || _c === void 0 ? void 0 : _c.setAttribute("copyed", "true");
            setTimeout(() => {
                var _a, _b;
                (_a = document.querySelector("#unameCopy")) === null || _a === void 0 ? void 0 : _a.setAttribute("src", "./img/copy.png");
                (_b = document.querySelector("#uname")) === null || _b === void 0 ? void 0 : _b.removeAttribute("copyed");
            }, 1500);
        }
    });
    (_c = document.querySelector("#pwdCopy")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => {
        var _a, _b, _c;
        if (((_a = document.querySelector("#pwd")) === null || _a === void 0 ? void 0 : _a.getAttribute("copyed")) == "true") {
            return;
        }
        if (copyToClipboard(pwdList[index].pwd)) {
            (_b = document.querySelector("#pwdCopy")) === null || _b === void 0 ? void 0 : _b.setAttribute("src", "./img/copy_done.png");
            (_c = document.querySelector("#pwd")) === null || _c === void 0 ? void 0 : _c.setAttribute("copyed", "true");
            setTimeout(() => {
                var _a, _b;
                (_a = document.querySelector("#pwdCopy")) === null || _a === void 0 ? void 0 : _a.setAttribute("src", "./img/copy.png");
                (_b = document.querySelector("#pwd")) === null || _b === void 0 ? void 0 : _b.removeAttribute("copyed");
            }, 1500);
        }
    });
    (_d = document.querySelector("#back")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", () => {
        update();
    });
}
update();
