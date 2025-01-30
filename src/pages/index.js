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
class Password {
    constructor(from, uname, pwd, note, email, phone) {
        this.from = from;
        this.uname = uname;
        this.pwd = pwd;
        this.note = note;
        this.email = email;
        this.phone = phone;
    }
    getHtml() {
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
    getHtmlRecent() {
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
let addBtn = document.querySelector("#addPwd"); // 添加密码按钮
const main = document.querySelector("#mainDiv"); // main界面
let pwdList = []; // 密码列表
let recentPwd = []; // 最近删除的密码列表
let mainPwd = ""; // 主密码
// 一些工具函数
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
function saveData() {
    let data = JSON.stringify({
        pwd: pwdList,
        recent: recentPwd,
    });
    window.fs.save("./data", data);
}
// 渲染main界面
function update(by = pwdList) {
    var _a, _b;
    let inner = `<div class="title">密码列表</div>
    <div style="position: absolute; top: 15px; right: 45px;" id="setting"><img src="../pages/resources/setting.png" title="设置" class="icon" style="width: 25px;height: 25px;"></div>
    `;
    for (let i = 0; i < by.length; i++) {
        inner += by[i].getHtml();
    }
    if (by.length == 0) {
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
    addBtn = document.querySelector("#addPwd");
    addBtn === null || addBtn === void 0 ? void 0 : addBtn.addEventListener("click", () => {
        addPwd();
    });
    let editBtns = document.querySelectorAll("#edit");
    for (let i = 0; i < editBtns.length; i++) {
        editBtns[i].addEventListener("click", (e) => {
            e === null || e === void 0 ? void 0 : e.stopPropagation();
            changePwd(by, i);
        });
    }
    let deleteBtns = document.querySelectorAll("#delete");
    for (let i = 0; i < deleteBtns.length; i++) {
        deleteBtns[i].addEventListener("click", (e) => {
            e === null || e === void 0 ? void 0 : e.stopPropagation();
            deletePwd(i);
        });
    }
    let infos = document.querySelectorAll(".info");
    for (let i = 0; i < infos.length; i++) {
        if (infos[i].id == "recent") {
            continue;
        }
        infos[i].addEventListener("click", () => {
            showPwd(pwdList, i);
        });
    }
    (_b = document.querySelector("#recent")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
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
        let email = document.querySelector("#email").value;
        let phone = document.querySelector("#phone").value;
        let note = document.querySelector("#note").value;
        if (name == "" || uname == "" || pwd == "") {
            alert("请填写完整信息");
            return;
        }
        by[index] = new Password(name, uname, pwd, note, email, phone);
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
    recentPwd.unshift(new Password(pwdList[index].from, pwdList[index].uname, pwdList[index].pwd, pwdList[index].note, pwdList[index].email, pwdList[index].phone));
    pwdList.splice(index, 1);
    saveData();
    update();
}
function deleteRecentPwd(index) {
    // 删除最近删除的密码
    recentPwd.splice(index, 1);
    saveData();
}
function recoverPwd(index) {
    // 恢复最近删除的密码
    pwdList.push(recentPwd[index]);
    recentPwd.splice(index, 1);
    saveData();
    update();
}
function addPwd() {
    // 添加密码
    let tgt = pwdList.length;
    pwdList.push(new Password("", "", "", "", "", ""));
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
    for (let i = 0; i < recentPwd.length; i++) {
        inner += recentPwd[i].getHtmlRecent();
    }
    if (recentPwd.length == 0) {
        inner += `<p>暂无删除密码</p>`;
    }
    inner += `
    <div class="action" id="back"><p>返回</p></div>
    `;
    main.innerHTML = inner;
    let recoverBtns = document.querySelectorAll("#recover");
    for (let i = 0; i < recoverBtns.length; i++) {
        recoverBtns[i].addEventListener("click", (e) => {
            e === null || e === void 0 ? void 0 : e.stopPropagation();
            recoverPwd(i);
            showRecent();
        });
    }
    let deleteBtns = document.querySelectorAll("#delete");
    for (let i = 0; i < deleteBtns.length; i++) {
        deleteBtns[i].addEventListener("click", (e) => {
            e === null || e === void 0 ? void 0 : e.stopPropagation();
            let result = window.msg.warning("警告", "此操作不可撤销，你确定要永久删除吗？", ["确定", "取消"]);
            result.then((res) => {
                if (res == 0) {
                    deleteRecentPwd(i);
                    showRecent();
                }
            });
        });
    }
    let infos = document.querySelectorAll(".info");
    for (let i = 0; i < infos.length; i++) {
        infos[i].addEventListener("click", () => {
            showPwd(recentPwd, i, Page.Recent);
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
    </div>
    <div class="action" id="save"><p>保存</p></div>
    <div class="action" id="cancel"><p>取消</p></div>
    `;
    (_a = document.querySelector("#save")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
        mainPwd = document.querySelector("#mainPwd").value;
        update();
    });
    (_b = document.querySelector("#cancel")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
        update();
    });
}
window.fs.read("./data").then((data) => {
    let obj = JSON.parse(data);
    for (let i = 0; i < obj.pwd.length; i++) {
        pwdList.push(new Password(obj.pwd[i].from, obj.pwd[i].uname, obj.pwd[i].pwd, obj.pwd[i].note, obj.pwd[i].email, obj.pwd[i].phone));
    }
    for (let i = 0; i < obj.recent.length; i++) {
        recentPwd.push(new Password(obj.recent[i].from, obj.recent[i].uname, obj.recent[i].pwd, obj.recent[i].note, obj.recent[i].email, obj.recent[i].phone));
    }
    update();
}).catch((err) => {
    console.log(err);
    pwdList = [];
    recentPwd = [];
    update();
});
