function update(dir: Folder, checkable: boolean = false) : void{
    if (dir.isSame(Folder.bin())){
        showRecent();
        return;
    }
    let topScroll
    if (dir.isSame(currentFolder)){
        topScroll = getScroll();
    } else {
        topScroll = {top: 0, left: 0};
    }
    currentFolder = dir;
    let faname = Folder.fromString(dir.parent).name;
    let location = dir.toReadable();
    let inner : string = `<div class="title">密码列表</div>
    ${dir.isSame(Folder.root())?"":`<div class="subtitle"><p>当前位置：</p>${location.html}</div>`}
    <div id="MainToolBar">
    ${checkable?
        `<p class="tool" id="checkable">取消选择</p>
        <p class="tool" id="check-all">全部选择</p>
        <p class="tool" id="check-invert">反向选择</p>
        <img src="../pages/resources/delete.png" title="删除" class="tool" id="delete">
        <img src="../pages/resources/copy.png" title="复制" class="tool" id="copy">`
        :
        `
        <p class="${clipboard.size == 0? "invaildTool":"tool"}" id="paste">粘贴</p>
        <p class="${clipboard.size == 0? "invaildTool":"tool"}" id="move">移动</p>
        <p class="tool" id="checkable">选择</p>
        <img src="../pages/resources/newFolder.png" title="新建文件夹" class="tool" id="newFolder">
        ${dir.isSame(Folder.root())?"":`<img src="../pages/resources/up.png" title="上移到${faname == ":"?"主文件夹":faname}" class="tool" id="up">`}`
    }
    </div>
    `;
    type pwdMapping = {item: Password, idx: number};
    type folderMapping = {item: Folder, idx: number};
    let nowPwds: Array<pwdMapping> = [];
    let nowFolders: Array<folderMapping> = [];
    let has : boolean = false;
    for (let i = 0; i < folderList.length; i++){
        if (dir.isInclude(folderList[i])) {
            nowFolders.push({item: folderList[i], idx: i});
            has = true;
        }
    }
    for (let i = 0; i < pwdList.length; i++){
        if (dir.isInclude(pwdList[i])) {
            nowPwds.push({item: pwdList[i], idx: i});
            has = true;
        }
    }
    nowFolders.sort((a: folderMapping, b: folderMapping) => {
        return a.item.name.localeCompare(b.item.name);
    });
    nowPwds.sort((a: pwdMapping, b: pwdMapping) => {
        return a.item.from.localeCompare(b.item.from);
    });
    nowFolders.forEach((value: folderMapping, idx: number) => {
        inner += value.item.getHtml(idx, checkable);
    });
    nowPwds.forEach((value: pwdMapping, idx: number) => {
        inner += value.item.getHtml(idx, checkable);
    });
    if (!has){
        inner += `<p>暂无密码</p>`;
    }
    inner += `
    ${dir.isSame(Folder.root())?"":`<div class="info" style="display: none" id="parent">
        <p>推拽到此可以上移到${faname==":"?"主文件夹":"“"+faname+"”"}</p>
    </div>`}
    <div class="action" id="addPwd"><p>添加密码</p></div>
    `;
    main!.innerHTML = inner;
    document.querySelector("#up")?.addEventListener("click", () => {
        update(dir.getParent());
    });
    document.querySelector("#checkable")?.addEventListener("click", () => {
        update(dir, !checkable);
    });
    if (!dir.isSame(Folder.root())){
        const parent = document.querySelector("#parent") as HTMLDivElement;
        parent!.addEventListener("drop", (e) => {
            if (folderIsEditing) return;
            e.preventDefault();
            const index : string = (e as DragEvent)?.dataTransfer?.getData("text/plain") as string;
            const num: number = parseInt(index.substring(1));
            parent!.style.display = "none";
            if (index[0] == "p"){
                moveItem(Type.Password, num, Folder.fromString(dir.parent));
            } else {
                moveItem(Type.Folder, num, Folder.fromString(dir.parent));
            }
            saveData();
            update(dir, checkable)
        });
        parent!.addEventListener("dragover", (e) => {
            if (folderIsEditing) return;
            e.preventDefault();
        });
        for(let i = 0; i < location.num; i++){
            document.querySelector(`#dirItem${i}`)?.addEventListener("click", (e) => {
                update(Folder.fromString((e.target as HTMLDivElement).dataset.location!));
            })
        }
    }
    if (checkable){
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
            nowFolders.forEach((value: folderMapping, index: number) => {
                if ((document.querySelector(`#folder${index}-checkbox`) as HTMLInputElement)!.checked) deleteItem(Type.Folder, index, dir, false);
            })
            nowPwds.forEach((value: pwdMapping, index: number) => {
                if ((document.querySelector(`#pwd${index}-checkbox`) as HTMLInputElement)!.checked){
                    deleteItem(Type.Password, index, dir, false);
                }
            })
            init(dir);
        })
        let copy = document.querySelector("#copy") as HTMLImageElement;
        copy?.addEventListener("click", () => {
            clipboard.clear();
            nowFolders.forEach((value: folderMapping, index: number) => {
                if ((document.querySelector(`#folder${index}-checkbox`) as HTMLInputElement)!.checked) clipboard.add({type: Type.Folder, index: nowFolders[index].idx})
            })
            nowPwds.forEach((value: pwdMapping, index: number) => {
                if ((document.querySelector(`#pwd${index}-checkbox`) as HTMLInputElement)!.checked){
                    clipboard.add({type: Type.Password, index: nowPwds[index].idx})
                }
            })
            copy!.src = "../pages/resources/copy_done.png";
            setTimeout(() => {
                copy!.src = "../pages/resources/copy.png";
            }, 1000);
        })
    } else {
        document.querySelector("#paste")?.addEventListener("click", () => {
            for(let i of clipboard){
                moveItem(i.type, i.index, dir, true);
            }
            init(dir);
        })
        document.querySelector("#move")?.addEventListener("click", () => {
            for(let i of clipboard){
                moveItem(i.type, i.index, dir);
            }
            clipboard.clear();
            init(dir)
        })
    }
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
    for(let i = 0; i < nowPwds.length; i++){
        const editBtn = document.querySelector(`#pwd${i}-edit`);
        editBtn!.addEventListener("click", (e) => {
            e?.stopPropagation();
            changePwd(pwdList, nowPwds[i].idx, dir);
        });
        const deleteBtn = document.querySelector(`#pwd${i}-delete`);
        deleteBtn!.addEventListener("click", (e) => {
            e?.stopPropagation();
            deleteItem(Type.Password, nowPwds[i].idx, dir);
        });
        const info = document.querySelector(`#pwd${i}`);
        info!.addEventListener("click", () => {
            if (folderIsEditing) return;
            if (mainSetting.autoCopy){
                copyToClipboard(pwdList[nowPwds[i].idx].pwd);
                mkDialog("成功复制！", "密码已复制到剪贴板。<br>如果想要查看详情，请在设置中设置。");
                return;
            }
            showPwd(pwdList, nowPwds[i].idx, dir);
        });
        info!.addEventListener("dragstart", (e) => {
            if (folderIsEditing) return;
            if (!dir.isSame(Folder.root())) (document.querySelector("#parent") as HTMLElement)!.style.display = "flex";
            (e as DragEvent)?.dataTransfer?.setData("text/plain", "p" + nowPwds[i].idx.toString());
        });
        if (checkable){
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
    for(let i = 0; i < nowFolders.length; i++){
        const feditBtn = document.querySelector(`#folder${i}-edit`);
        feditBtn!.addEventListener("click", (e) => {
            e?.stopPropagation();
            const div = document.querySelector(`#folder${i}`);
            div!.innerHTML = `<input type="text" value="${nowFolders[i].item.name}" id="folder${i}-input">`;
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
                let newFolder : Folder = new Folder(nowFolders[i].item);
                newFolder.name = input!.value;
                folderIsEditing = false;
                if (nowFolders.findIndex(v => (v.item.isSame(newFolder))) != -1 && !newFolder.isSame(nowFolders[i].item)){
                    mkDialog("重命名失败！", "文件夹名已存在。");
                    init(dir);
                    return;
                }
                for(let j = 0; j < newFolder.name.length; j++){
                    if (newFolder.name[j] == "/"){
                        mkDialog("重命名失败！", "文件夹名不能包含“/”。");
                        init(dir);
                        return;
                    }
                    }
                for(let j = 0; j < pwdList.length; j++){
                    if (nowFolders[i].item.isInclude(pwdList[j])) {
                        pwdList[j].dir = newFolder;
                    }
                }
                for(let j = 0; j < folderList.length; j++){
                    if (nowFolders[i].item.isInclude(folderList[j])) {
                        folderList[j].setParent(newFolder);
                    }
                }
                folderList[nowFolders[i].idx] = new Folder(newFolder);
                init(dir);
            });
        });
        const fdeleteBtn = document.querySelector(`#folder${i}-delete`);
        fdeleteBtn!.addEventListener("click", (e) => {
            if (folderIsEditing) return;
            e?.stopPropagation();
            deleteItem(Type.Folder, nowFolders[i].idx, dir);
            update(dir);
        });
        const folder = document.querySelector(`#folder${i}`);
        folder!.addEventListener("click", () => {
            if (folderIsEditing) return;
            update(nowFolders[i].item);
        });
        folder!.addEventListener("dragstart", (e) => {
            if (folderIsEditing) return;
            if (!dir.isSame(Folder.root())) (document.querySelector("#parent") as HTMLElement)!.style.display = "flex";
            (e as DragEvent)?.dataTransfer?.setData("text/plain", "f" + nowFolders[i].idx.toString());
        });
        folder!.addEventListener("dragover", (e) => {
            if (folderIsEditing) return;
            e.preventDefault();
        });
        folder!.addEventListener("drop", (e) => {
            if (folderIsEditing) return;
            e.preventDefault();
            const index : string = (e as DragEvent)?.dataTransfer?.getData("text/plain") as string;
            if (parseInt(index.substring(1)) == nowFolders[i].idx && index[0] == "f") return;
            function move(info: string){
                let id: number = parseInt(info.substring(1))
                if (info[0] == "p"){
                    moveItem(Type.Password, id, nowFolders[i].item);
                } else if (info[0] == "f"){
                    moveItem(Type.Folder, id, nowFolders[i].item);
                }
            }
            move(index);
            saveData();
            update(dir, checkable)
        });
        if (checkable){
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
    main?.scrollTo(topScroll)
}