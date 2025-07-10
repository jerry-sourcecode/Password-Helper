/**
 * 更改页面，支持切换到“我的”、“回收站”、“设置”、“搜索”页面。
 * @param dir 要切换到的文件夹
 * @param checkable 切换后是否开启“选择”模式
 */
function update(dir: Folder, checkable: boolean = false): void {
    Tooltip.disabled();

    updatePos();

    dir = new Folder(dir);
    currentFolder = dir;
    document.querySelector("span#nav-setting")!.classList.remove("active");
    document.querySelector("span#nav-bin")!.classList.remove("active");
    document.querySelector("span#nav-home")!.classList.remove("active");
    document.querySelector("span#nav-mainPage")!.classList.remove("active");
    document.querySelector("span#nav-search")!.classList.remove("active");
    document.querySelector("span#nav-plugin")!.classList.remove("active");
    if (dir.isSame(Folder.bin())) {
        document.querySelector("span#nav-bin")!.classList.add("active");
        _showBin(checkable);
        return;
    } else if (dir.isSame(Folder.home())) {
        document.querySelector("span#nav-home")!.classList.add("active");
        _goHome();
        return;
    } else if (dir.isSame(Folder.setting())) {
        document.querySelector("span#nav-setting")!.classList.add("active");
        _showSetting();
        return;
    } else if (dir.isSame(Folder.search())) {
        document.querySelector("span#nav-search")!.classList.add("active");
        _showSearch();
        return;
    } else if (dir.isin(Folder.plugin()) || dir.isSame(Folder.plugin())) {
        document.querySelector("span#nav-plugin")!.classList.add("active");
        _goPlugin(dir);
        return;
    }
    else {
        document.querySelector("span#nav-mainPage")!.classList.add("active");
    }
    pagePos.mainDir = dir;
    let loca = dir.toReadableHTML(); // location
    let inner: string = `<div class="title">密码列表</div>
    ${dir.isSame(Folder.root()) ? "" : `<div class="subtitle"><p>当前位置：</p>${loca.html}</div>`}
    <div id="MainToolBar">
    ${checkable ?
            `<p class="tool" id="checkable">取消选择</p>
        <p class="tool" id="check-all">全部选择</p>
        <p class="tool" id="check-invert">反向选择</p>
        <img src="../pages/resources/delete.png" title="删除" class="tool" data-bs-toggle="tooltip" data-bs-placement="top" id="delete">
        <img src="../pages/resources/copy.png" title="复制" data-bs-toggle="tooltip" data-bs-placement="top" class="tool" id="copy">`
            :
            `
        <p class="${clipboard.size == 0 ? "invaildTool" : "tool"}" id="paste">粘贴</p>
        <p class="${clipboard.size == 0 ? "invaildTool" : "tool"}" id="move">移动</p>
        <p class="tool" id="checkable">选择</p>
        <img src="../pages/resources/newFolder.png" title="新建文件夹" class="tool" data-bs-toggle="tooltip" data-bs-placement="top" id="newFolder">
        ${dir.isSame(Folder.root()) ? "" : `
        <img src="../pages/resources/up.png" title="上移到${dir.getParent().name == ":" ? "主文件夹" : dir.getParent().name}" data-bs-toggle="tooltip" data-bs-placement="top" class="tool" id="up">
        <img src="../pages/resources/lock.png" title="加密" class="tool" data-bs-toggle="tooltip" data-bs-placement="top" id="lock">
        `}`
        }
    </div>
    `;
    type pwdMapping = { item: Password, idx: number };
    type folderMapping = { item: Folder, idx: number };
    let nowPwds: Array<pwdMapping> = [];
    let nowFolders: Array<folderMapping> = [];
    let has: boolean = false;
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
    nowFolders.sort((a: folderMapping, b: folderMapping) => {
        // 当a置顶但b不置顶时，a排在前面
        if (a.item.pin && !b.item.pin) return -1;
        // 当b置顶但a不置顶时，b排在前面
        if (b.item.pin && !a.item.pin) return 1;
        switch (mainSetting.folderSortBy) {
            case SortBy.name:
                return a.item.name.localeCompare(b.item.name);
            case SortBy.name_reverse:
                return b.item.name.localeCompare(a.item.name);
            case SortBy.time_early:
                return Number(a.item.moDate) - Number(b.item.moDate);
            case SortBy.time_late:
                return Number(b.item.moDate) - Number(a.item.moDate);
        }
    });
    nowPwds.sort((a: pwdMapping, b: pwdMapping) => {
        // 当a置顶但b不置顶时，a排在前面
        if (a.item.pin && !b.item.pin) return -1;
        // 当b置顶但a不置顶时，b排在前面
        if (b.item.pin && !a.item.pin) return 1;
        switch (mainSetting.folderSortBy) {
            case SortBy.name:
                return a.item.from.localeCompare(b.item.from);
            case SortBy.name_reverse:
                return b.item.from.localeCompare(a.item.from);
            case SortBy.time_early:
                return Number(a.item.moDate) - Number(b.item.moDate);
            case SortBy.time_late:
                return Number(b.item.moDate) - Number(a.item.moDate);
        }
    });
    nowFolders.forEach((value: folderMapping, idx: number) => {
        if (value.item.pin) inner += value.item.getHtml(idx, checkable);
    });
    nowPwds.forEach((value: pwdMapping, idx: number) => {
        if (value.item.pin) inner += value.item.getHtml(idx, checkable);
    });
    nowFolders.forEach((value: folderMapping, idx: number) => {
        if (!value.item.pin) inner += value.item.getHtml(idx, checkable);
    });
    nowPwds.forEach((value: pwdMapping, idx: number) => {
        if (!value.item.pin) inner += value.item.getHtml(idx, checkable);
    });
    if (!has) {
        inner += `<p>暂无密码</p>`;
    }
    inner += `
    <div class="action" id="addPwd"><p>添加密码</p></div>
    `;
    content!.innerHTML = inner;
    Tooltip.enabled();
    document.querySelector("#up")?.addEventListener("click", () => {
        update(dir.getParent());
    });
    document.querySelector("#checkable")?.addEventListener("click", () => {
        update(dir, !checkable);
    });
    if (!dir.isSame(Folder.root())) {
        const parent = document.querySelector("div#dragParentCard") as HTMLDivElement;
        parent!.addEventListener("drop", (e) => {
            if (folderIsEditing) return;
            e.preventDefault();
            const index: string = (e as DragEvent)?.dataTransfer?.getData("text/plain") as string;
            const num: number = parseInt(index.substring(1));
            parent!.style.display = "none";
            if (index[0] == "p") {
                moveItem(Type.Password, num, dir.getParent());
            } else {
                moveItem(Type.Folder, num, dir.getParent());
            }
            Task.tryDone("文件向上冲");
            init(dir, checkable);
        });
        parent!.addEventListener("dragover", (e) => {
            if (folderIsEditing) return;
            e.preventDefault();
        });
        for (let i = 0; i < loca.num; i++) {
            document.querySelector(`#dirItem${i}`)?.addEventListener("click", (e) => {
                Task.tryDone("快速穿梭");
                update(Folder.fromString((e.target as HTMLDivElement).dataset.location!));
            })
        }
    }
    if (checkable) {
        document.querySelector("#check-all")?.addEventListener("click", () => {
            nowFolders.forEach((value: folderMapping, index: number) => {
                (document.querySelector(`#folder${index}-checkbox`) as HTMLInputElement)!.checked = true;
            })
            nowPwds.forEach((value: pwdMapping, index: number) => {
                (document.querySelector(`#pwd${index}-checkbox`) as HTMLInputElement)!.checked = true;
            })
        });
        document.querySelector("#check-invert")?.addEventListener("click", () => {
            nowFolders.forEach((value: folderMapping, index: number) => {
                (document.querySelector(`#folder${index}-checkbox`) as HTMLInputElement)!.checked = !(document.querySelector(`#folder${index}-checkbox`) as HTMLInputElement)!.checked;
            })
            nowPwds.forEach((value: pwdMapping, index: number) => {
                (document.querySelector(`#pwd${index}-checkbox`) as HTMLInputElement)!.checked = !(document.querySelector(`#pwd${index}-checkbox`) as HTMLInputElement)!.checked;
            })
        })
        document.querySelector("#delete")?.addEventListener("click", () => {
            let errNum = 0
            nowFolders.forEach((value: folderMapping, index: number) => {
                if ((document.querySelector(`#folder${index}-checkbox`) as HTMLInputElement)!.checked) {
                    try {
                        deleteItem(Type.Folder, value.idx, dir, false);
                    } catch (error) {
                        errNum++;
                    }
                }
            })
            nowPwds.forEach((value: pwdMapping, index: number) => {
                if ((document.querySelector(`#pwd${index}-checkbox`) as HTMLInputElement)!.checked) {
                    try {
                        deleteItem(Type.Password, value.idx, dir, false);
                    } catch (error) {
                        errNum++;
                    }
                }
            })
            if (errNum > 0) mkDialog("删除失败", `有${errNum}个文件因为权限问题而无法删除，请先解开所有二级锁。`)
            else Task.tryDone("文件大扫除");
            init(dir);
        })
        let copy = document.querySelector("#copy") as HTMLImageElement;
        copy?.addEventListener("click", () => {
            clipboard.clear();
            nowFolders.forEach((value: folderMapping, index: number) => {
                if ((document.querySelector(`#folder${index}-checkbox`) as HTMLInputElement)!.checked) clipboard.add({ type: Type.Folder, index: nowFolders[index].idx })
            })
            nowPwds.forEach((value: pwdMapping, index: number) => {
                if ((document.querySelector(`#pwd${index}-checkbox`) as HTMLInputElement)!.checked) {
                    clipboard.add({ type: Type.Password, index: nowPwds[index].idx })
                }
            })
            copy!.src = "../pages/resources/copy_done.png";
            setTimeout(() => {
                copy!.src = "../pages/resources/copy.png";
            }, 1000);
        })
    } else {
        document.querySelector("#paste")?.addEventListener("click", () => {
            // 检查用户组
            if (!getCurrentUserGroup().permission.canMove) {
                mkDialog("权限不足", "当前用户组没有权限进行移动操作。");
                return;
            }
            for (let i of clipboard) {
                moveItem(i.type, i.index, dir, true);
            }
            Task.tryDone("文件搬运大法");
            init(dir);
        })
        document.querySelector("#move")?.addEventListener("click", () => {
            if (!getCurrentUserGroup().permission.canMove) {
                mkDialog("权限不足", "当前用户组没有权限进行移动操作。");
                return;
            }
            for (let i of clipboard) {
                moveItem(i.type, i.index, dir);
            }
            Task.tryDone("文件搬运大法");
            clipboard.clear();
            init(dir)
        })
        document.querySelector("#lock")?.addEventListener("click", () => {
            if (!getCurrentUserGroup().permission.canLock) {
                mkDialog("权限不足", "当前用户组没有权限进行加密操作。");
                return;
            }
            let nowIndex: number = -1;
            for (let i = 0; i < folderList.length; i++) {
                if (folderList[i].isSame(dir)) {
                    nowIndex = i;
                    break;
                }
            }
            let choice: Array<string> = ["确定", "取消"];
            if (folderList[nowIndex].lock !== null) choice.push("取消二级锁");
            function toDatetimeLocal(date: Date): string {
                const pad = (n: number) => n.toString().padStart(2, '0');
                return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
            }
            mkDialog(
                "设置二级锁",
                "输入新的二级锁密码：",
                choice,
                {
                    isStatic: true,
                    otherHTML: `
                    <div class="formItem"><input type="password" id="lockInput" placeholder="在这里输入新密码"></div>
                    ${UserPlugin.isPluginEnable("Time-Lock") ? `
                    <div class="formItem"><label>在此之前，你不能解锁文件夹</label><input type="datetime-local" id="time-lock" style="margin:5px" value="${folderList[nowIndex].timelock === null ? `` : toDatetimeLocal(new Date(Number(folderList[nowIndex].timelock)!))}"></div>
                        ` : ``}
                    `,
                    otherAction: () => { (document.querySelector("#lockInput") as HTMLInputElement).focus(); },
                    defaultOption: 0
                }
            )
                .then((res) => {
                    if (res == 0) {
                        const input = document.querySelector("#lockInput") as HTMLInputElement;
                        const dateInput = document.querySelector("#time-lock") as HTMLInputElement;
                        if (input.value == "" && !(UserPlugin.isPluginEnable("Time-Lock") && dateInput.value != "")) {
                            mkDialog("设置失败！", "密码不能为空。", ["确定"], { defaultOption: 0 });
                            return;
                        }
                        if (UserPlugin.isPluginEnable("Time-Lock") && dateInput.value != "") {
                            folderList[nowIndex].timelock = new Date(dateInput.value).getTime().toString()
                        }
                        if (input.value != "") {
                            folderList[nowIndex].lock = Cryp.pbkdf2(Cryp.pbkdf2(input.value));
                            folderList[nowIndex].cachePwd = input.value;
                        }
                        saveData();
                        Task.tryDone("双重加密，双重保护");
                        mkToast("设置成功！", "", "<p>二级锁已设置成功。</p>");
                    } else if (res == 2) {
                        folderList[nowIndex].lock = null;
                        folderList[nowIndex].cachePwd = null;
                        saveData();
                        mkToast("取消成功！", "", "<p>二级锁已取消。</p>");
                    }
                }
                )
        });
    }
    document.querySelector("#newFolder")?.addEventListener("click", () => {
        let k: Set<number> = new Set()
        for (let i = 0; i < folderList.length; i++) {
            if (dir.isInclude(folderList[i])) {
                if (folderList[i].name == "新建文件夹") k.add(0);
                if (folderList[i].name.length >= 5 && folderList[i].name.slice(0, 5) == "新建文件夹") {
                    let can: boolean = true;
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
        if (mkdir(new Folder(`新建文件夹${lowerBound == 0 ? "" : lowerBound}`, dir.stringify()))) Task.tryDone("文件夹，你好！");
        init(dir);
    });
    addBtn = document.querySelector("#addPwd");
    addBtn?.addEventListener("click", () => {
        addPwd(dir);
    });
    for (let i = 0; i < nowPwds.length; i++) {
        const editBtn = document.querySelector(`#pwd${i}-edit`);
        editBtn!.addEventListener("click", (e) => {
            e?.stopPropagation();
            changePwd(pwdList, nowPwds[i].idx, dir);
        });
        const deleteBtn = document.querySelector(`#pwd${i}-delete`);
        deleteBtn!.addEventListener("click", (e) => {
            e?.stopPropagation();
            try {
                deleteItem(Type.Password, nowPwds[i].idx, dir);
            } catch (error) {
                mkDialog("删除失败", "此文件因为权限问题无法删除，请先解锁所有二级锁。");
            }
        });
        const pinBtn = document.querySelector(`#pwd${i}-pin`);
        pinBtn!.addEventListener("click", (e) => {
            e?.stopPropagation();
            nowPwds[i].item.pin = !nowPwds[i].item.pin;
            init(dir);
        });
        const info = document.querySelector(`#pwd${i}`);
        info!.addEventListener("click", () => {
            if (folderIsEditing) return;
            if (mainSetting.autoCopy) {
                copyToClipboard(pwdList[nowPwds[i].idx].pwd);
                mkToast("成功复制！", "", "<p>密码已复制到剪贴板。<br>如果想要查看详情，请在设置中设置。</p>");
                return;
            }
            showPwd(pwdList, nowPwds[i].idx, dir);
        });
        info!.addEventListener("dragstart", (e) => {
            if (folderIsEditing) return;
            if (!dir.isSame(Folder.root())) (document.querySelector("div#dragParentCard") as HTMLElement)!.style.display = "flex";
            (e as DragEvent)?.dataTransfer?.setData("text/plain", "p" + nowPwds[i].idx.toString());
        });
        info!.addEventListener("dragend", () => {
            (document.querySelector("div#dragParentCard") as HTMLElement)!.style.display = "none";
        });
        if (checkable) {
            const check = document.querySelector(`#pwd${i}-checkboxDiv`) as HTMLDivElement;
            const checkBox = document.querySelector(`#pwd${i}-checkbox`) as HTMLInputElement;
            check!.addEventListener("click", (e) => {
                e.stopPropagation();
                checkBox.checked = !checkBox.checked;
            });
            checkBox!.addEventListener("click", (e) => {
                e.stopPropagation();
            })
        }
    }
    for (let i = 0; i < nowFolders.length; i++) {
        const feditBtn = document.querySelector(`#folder${i}-edit`);
        feditBtn!.addEventListener("click", (e) => {
            Tooltip.disabled();
            e?.stopPropagation();
            const div = document.querySelector(`#folder${i}`);
            div!.innerHTML = `<input type="text" value="${nowFolders[i].item.name}" id="folder${i}-input">`;
            const input = document.querySelector(`#folder${i}-input`) as HTMLInputElement;
            folderIsEditing = true;
            input.focus();
            input.select();
            input.addEventListener("keydown", (e) => {
                if (e.key == "Enter" && !e.isComposing) {
                    input.blur();
                }
            })
            input!.addEventListener("blur", () => {
                let newFolder: Folder = new Folder(nowFolders[i].item);
                newFolder.name = input!.value;
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
                        pwdList[j].setParent(newFolder);
                    }
                }
                for (let j = 0; j < folderList.length; j++) {
                    if (nowFolders[i].item.isInclude(folderList[j])) {
                        folderList[j].setParent(newFolder);
                    }
                }
                Task.tryDone("文件夹改名记");
                folderList[nowFolders[i].idx] = new Folder(newFolder);
                folderList[nowFolders[i].idx].moDate = Date.now().toString();
                init(dir);
            });
        });
        const fdeleteBtn = document.querySelector(`#folder${i}-delete`);
        fdeleteBtn!.addEventListener("click", (e) => {
            if (folderIsEditing) return;
            e?.stopPropagation();
            try {
                deleteItem(Type.Folder, nowFolders[i].idx, dir);
            } catch (error) {
                mkDialog("删除失败", "此文件因为权限问题无法删除，请先解锁所有二级锁。");
            }
            init(dir);
        });
        const fpinBtn = document.querySelector(`#folder${i}-pin`);
        fpinBtn!.addEventListener("click", (e) => {
            e?.stopPropagation();
            nowFolders[i].item.pin = !nowFolders[i].item.pin;
            init(dir);
        });
        if (nowFolders[i].item.lock !== null && nowFolders[i].item.cachePwd !== null) {
            const fUnlocked = document.querySelector(`#folder${i}-unlocked`);
            fUnlocked!.addEventListener("click", (e) => {
                e?.stopPropagation();
                lockFolder(nowFolders[i].item);
                update(dir);
                saveData();
            })
        }
        const folder = document.querySelector(`#folder${i}`);
        folder!.addEventListener("click", () => {
            if (folderIsEditing) return;
            if (nowFolders[i].item.timelock != null && Number(nowFolders[i].item.timelock) > Date.now() && UserPlugin.isPluginEnable("Time-Lock")) {
                mkDialog(
                    "时间锁",
                    `该文件在 ${getReadableTime(nowFolders[i].item.timelock!)} 前无法被解锁。`
                )
                return;
            }
            if (nowFolders[i].item.lock !== null && nowFolders[i].item.cachePwd === null) {
                mkDialog(
                    "二级锁",
                    "请输入二级锁密码：",
                    ["确定", "取消"],
                    {
                        isStatic: true,
                        otherHTML: `<div class="formItem"><input type="password" id="lockInput" placeholder="在这里输入密码"></div>`,
                        otherAction: () => { (document.querySelector("#lockInput") as HTMLInputElement).focus(); },
                        defaultOption: 0
                    }
                )
                    .then((res) => {
                        if (res == 0) {
                            const input = document.querySelector("#lockInput") as HTMLInputElement;
                            if (input.value == "") {
                                mkDialog("解锁失败", "密码不能为空！", ["确定"], { defaultOption: 0 });
                                return;
                            }
                            if (nowFolders[i].item.lock != Cryp.pbkdf2(Cryp.pbkdf2(input.value))) {
                                mkDialog("解锁失败", "密码错误！", ["确定"], { defaultOption: 0 });
                                return;
                            }
                            Task.tryDone("新世界");
                            folderList[nowFolders[i].idx].cachePwd = input.value;
                            // 对文件夹下的文件进行解锁
                            for (let j = 0; j < pwdList.length; j++) {
                                if (pwdList[j].isin(nowFolders[i].item)) {
                                    pwdList[j] = decrypt(pwdList[j], Cryp.pbkdf2(input.value), ["dir"]) as Password;
                                }
                            }
                            for (let j = 0; j < folderList.length; j++) {
                                if (folderList[j].isin(nowFolders[i].item)) {
                                    folderList[j] = decrypt(folderList[j], Cryp.pbkdf2(input.value), ["parent"]) as Folder;
                                }
                            }
                            update(nowFolders[i].item);
                            mkToast("解锁成功！", "", "<p>文件夹已解锁。</p>");
                        }
                    })
                return;
            }
            else {
                Task.tryDone("新世界");
                update(nowFolders[i].item);
            }
        });
        folder!.addEventListener("dragstart", (e) => {
            if (folderIsEditing) return;
            if (!dir.isSame(Folder.root())) (document.querySelector("div#dragParentCard") as HTMLElement)!.style.display = "flex";
            (e as DragEvent)?.dataTransfer?.setData("text/plain", "f" + nowFolders[i].idx.toString());
        });
        folder!.addEventListener("dragover", (e) => {
            if (folderIsEditing) return;
            e.preventDefault();
        });
        folder!.addEventListener("dragend", () => {
            (document.querySelector("div#dragParentCard") as HTMLElement)!.style.display = "none";
        });
        folder!.addEventListener("drop", (e) => {
            if (folderIsEditing) return;
            e.preventDefault();
            const index: string = (e as DragEvent)?.dataTransfer?.getData("text/plain") as string;
            if (parseInt(index.substring(1)) == nowFolders[i].idx && index[0] == "f") return;
            function move(info: string) {
                let id: number = parseInt(info.substring(1))
                if (info[0] == "p") {
                    moveItem(Type.Password, id, nowFolders[i].item);
                } else if (info[0] == "f") {
                    moveItem(Type.Folder, id, nowFolders[i].item);
                }
            }
            move(index);
            Task.tryDone("幻影显形");
            init(dir, checkable);
        });
        if (checkable) {
            const check = document.querySelector(`#folder${i}-checkboxDiv`) as HTMLDivElement;
            const checkBox = document.querySelector(`#folder${i}-checkbox`) as HTMLInputElement;
            check!.addEventListener("click", (e) => {
                e.stopPropagation();
                checkBox.checked = !checkBox.checked;
            });
            checkBox!.addEventListener("click", (e) => {
                e.stopPropagation()
            });
        }
    }
    content?.scrollTo(pagePos.main)
}