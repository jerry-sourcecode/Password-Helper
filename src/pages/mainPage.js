"use strict";
function update(dir, checkable = false) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    if (dir.isSame(Folder.bin())) {
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
    let location = dir.toReadable();
    let inner = `<div class="title">密码列表</div>
    ${dir.isSame(Folder.root()) ? "" : `<div class="subtitle"><p>当前位置：</p>${location.html}</div>`}
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
    ${dir.isSame(Folder.root()) ? "" : `<div class="info" style="display: none" id="parent">
        <p>推拽到此可以上移到${faname == ":" ? "主文件夹" : "“" + faname + "”"}</p>
    </div>`}
    <div class="action" id="addPwd"><p>添加密码</p></div>
    `;
    main.innerHTML = inner;
    (_a = document.querySelector("#up")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
        update(dir.getParent());
    });
    (_b = document.querySelector("#checkable")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
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
        for (let i = 0; i < location.num; i++) {
            (_c = document.querySelector(`#dirItem${i}`)) === null || _c === void 0 ? void 0 : _c.addEventListener("click", (e) => {
                update(Folder.fromString(e.target.dataset.location));
            });
        }
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
                mkDialog("成功复制！", "密码已复制到剪贴板。<br>如果想要查看详情，请在设置中设置。");
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
                    mkDialog("重命名失败！", "文件夹名已存在。");
                    init(dir);
                    return;
                }
                for (let j = 0; j < newFolder.name.length; j++) {
                    if (newFolder.name[j] == "/") {
                        mkDialog("重命名失败！", "文件夹名不能包含“/”。");
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
            if (parseInt(index.substring(1)) == nowFolders[i].idx && index[0] == "f")
                return;
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
    main === null || main === void 0 ? void 0 : main.scrollTo(topScroll);
}
