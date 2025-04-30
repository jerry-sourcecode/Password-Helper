/**
 * 如果你不在{@link mainPage.ts}这个文件中，请使用{@linkcode update}函数
 * @private
 */
class TurnToPage{
    /**
     * 展示“设置”页面
     */
    private static showSetting() : void {
        // 显示设置页面
        main!.innerHTML = `
        <div class="title">设置</div>
        <div class="form">
            <p>安全设置</p>
            <div class="settingFormItem">
                <div><label for="mainPwd">访问密钥：</label><input type="text" id="mainPwd" class="vaild" value="${mainPwd}"/></div>
                <div><label for="mainPwdTip">密钥提示：</label><input type="text" id="mainPwdTip" value="${mainSetting.mainPwdTip === undefined ? "":mainSetting.mainPwdTip}"/></div>
                <div><input type="checkbox" id="rememberPwd" ${mainPwd == "" ? "disabled" : `${isremember ? "checked" : ""}`}><label for="rememberPwd">记住密钥</label></div>
            </div>
            <p>其他个性化设置</p>
            <div class="settingFormItem">
                <div><input type="checkbox" id="autoCopy" ${mainSetting.autoCopy ? "checked" : ""}/><label for="autoCopy">当点击一条信息时，不会跳转到详情界面，而是直接复制这条信息对应的密码。</label></div>
                <div><input type="checkbox" id="easyAppend" ${mainSetting.easyAppend ? "checked" : ""}/><label for="easyAppend">添加密码时，使用快速而简洁的表单形式来代替创建引导形式。</label></div>
                <div><label for="pwdSortBy">密码显示顺序设置：</label>
                    <select id="pwdSortBy">
                        <option value="name" ${mainSetting.pwdSortBy === SortBy.name?"selected":""}>按照来源顺序</option>
                        <option value="name_reserve" ${mainSetting.pwdSortBy === SortBy.name_reverse?"selected":""}>按照来源倒序</option>
                        <option value="time_late" ${mainSetting.pwdSortBy === SortBy.time_late?"selected":""}>按照修改时间顺序</option>
                        <option value="time_early" ${mainSetting.pwdSortBy === SortBy.time_early?"selected":""}>按照修改时间倒序</option>
                    </select>
                </div>
                <div><label for="folderSortBy">文件夹显示顺序设置：</label>
                    <select id="folderSortBy">
                        <option value="name" ${mainSetting.folderSortBy === SortBy.name?"selected":""}>按照文件夹名顺序</option>
                        <option value="name_reserve" ${mainSetting.folderSortBy === SortBy.name_reverse?"selected":""}>按照文件夹名倒序</option>
                        <option value="time_late" ${mainSetting.folderSortBy === SortBy.time_late?"selected":""}>按照重命名时间顺序</option>
                        <option value="time_early" ${mainSetting.folderSortBy === SortBy.time_early?"selected":""}>按照重命名时间倒序</option>
                    </select>
                </div>
            </div>
            <p>导出设置</p>
            <div class="settingFormItem" style="text-indent: 2em">
                <p>导出的数据是一个加密的文件，你可以将它导出到本地，然后在另一台设备上导入。你可以使用数据来快速且安全的转移你的数据。</p>
                <p>请注意，导出的数据是强制加密的，你需要输入你的访问密钥才能导入，即使你选中了“记住密码”。</p>
                <p style="color: red;">请注意：导入文件将会覆盖掉原有数据，无法恢复。</p>
                <div id="exportUMC"><p class="action">点此导出数据</p></div>
                <div id="importUMC"><p class="action">点此导入数据</p></div>
            </div>
            <div id="reset"><p class="action">点此重置</p></div>
        </div>
        `;
        const saveKey = document.querySelector("#rememberPwd") as HTMLInputElement;
        document.querySelector("#mainPwd")?.addEventListener("input", (e) => {
            saveKey.disabled = (<HTMLInputElement>e.target).value == "";
            if (saveKey.disabled) saveKey.checked = false;
        });


        document.querySelector("#mainPwd")?.addEventListener("change", () => {
            Task.tryDone("妈妈再也不用担心我密码泄露啦！")
            mainPwd = (document.querySelector("#mainPwd") as HTMLInputElement).value;
            saveData();
        })
        saveKey.addEventListener("change", () => {
            isremember = saveKey.checked;
            saveData();
        })
        document.querySelector("#mainPwdTip")?.addEventListener("change", () => {
            mainSetting.mainPwdTip = (document.querySelector("#mainPwdTip") as HTMLInputElement).value;
            saveData();
        })
        document.querySelector("#autoCopy")?.addEventListener("change", () => {
            mainSetting.autoCopy = (document.querySelector("#autoCopy") as HTMLInputElement).checked;
            saveData();
        })
        document.querySelector("#easyAppend")?.addEventListener("change", () => {
            mainSetting.easyAppend = (document.querySelector("#easyAppend") as HTMLInputElement).checked;
            saveData();
        })
        document.querySelector("#pwdSortBy")?.addEventListener("change", () => {
            switch ((document.querySelector("#pwdSortBy") as HTMLInputElement).value) {
                case "name":
                    mainSetting.pwdSortBy = SortBy.name;
                    break;
            
                case "name_reserve":
                    mainSetting.pwdSortBy = SortBy.name_reverse;
                    break;
                
                case "time_early":
                    mainSetting.pwdSortBy = SortBy.time_early;
                    break;

                case "time_late":
                    mainSetting.pwdSortBy = SortBy.time_late;
            }
            saveData();
        })
        document.querySelector("#folderSortBy")?.addEventListener("change", () => {
            switch ((document.querySelector("#folderSortBy") as HTMLInputElement).value) {
                case "name":
                    mainSetting.folderSortBy = SortBy.name;
                    break;
            
                case "name_reserve":
                    mainSetting.folderSortBy = SortBy.name_reverse;
                    break;
                
                case "time_early":
                    mainSetting.folderSortBy = SortBy.time_early;
                    break;

                case "time_late":
                    mainSetting.folderSortBy = SortBy.time_late;
            }
            saveData();
        })

        document.querySelector("div#exportUMC")?.addEventListener("click", () => {
            let ans: string | undefined = window.msg.showSaveDialogSync("选择导出地址", "", [{ name: '用户迁移凭证', extensions: ['umc'] }])
            if (ans === undefined) return;
            saveUMC(ans);
        });
        document.querySelector("div#importUMC")?.addEventListener("click", () => {
            mkDialog("警告", "此操作会覆盖原有数据，你确定要继续吗？", ["确定", "取消"])
            .then((res) => {
                if (res == 1) return;
                let ans: string | undefined = window.msg.showOpenDialogSync("选择导出地址", "", [{ name: '用户迁移凭证', extensions: ['umc'] }])
                if (ans === undefined) return;
                readUMC(ans);
            })
        });
        document.querySelector("#reset")?.addEventListener("click", () => {
            mkDialog("警告", "此操作会清空所有数据并立即重启，你确定要继续吗？", ["确定", "取消"])
            .then((res) => {
                if (res == 0){
                    window.fs.save("./data", "");
                    location.reload();
                }
            })
        });
        main?.scrollTo(pagePos.setting)
    }

    /**
     * 展示“最近删除”页面
     * @param checkable 是否开启“选择模式”
     */
    private static showBin(checkable: boolean = false) : void{
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
        binItem.sort((a: Item, b: Item) => {
            return a.rmDate! > b.rmDate! ? -1 : 1;
        })
        for (let i = 0; i < binItem.length; i++){
            inner += binItem[i].getHtmlRecent(i, checkable);
        }
        if (binItem.length == 0){
            inner += `<p>暂无删除密码</p>`;
        }
        main!.innerHTML = inner;
        document.querySelector("#checkable")?.addEventListener("click", () => {
            update(Folder.bin(), !checkable);
        });
        if (checkable){
            document.querySelector("#check-all")?.addEventListener("click", () => {
                binItem.forEach((item: Item, index: number) => {
                    (document.querySelector(`#recent${index}-checkbox`) as HTMLInputElement)!.checked = true;
                })
            });
            document.querySelector("#check-invert")?.addEventListener("click", () => {
                binItem.forEach((item: Item, index: number) => {
                    (document.querySelector(`#recent${index}-checkbox`) as HTMLInputElement)!.checked = !(document.querySelector(`#recent${index}-checkbox`) as HTMLInputElement)!.checked;
                })
            });
            document.querySelector("#delete")?.addEventListener("click", () => {
                let cnt: number = 0;
                binItem.forEach((item: Item, index: number) => {
                    if ((document.querySelector(`#recent${index}-checkbox`) as HTMLInputElement)!.checked) cnt++;
                })
                if (cnt == 0) return;
                mkDialog("警告", "此操作不可撤销，你确定要永久删除吗？", ["确定", "取消"])
                .then((res) => {
                    if (res == 0){
                        Task.tryDone("选择操作，轻松掌控！");
                        let de: Array<number> = [];
                        binItem.forEach((item: Item, index: number) => {
                            if ((document.querySelector(`#recent${index}-checkbox`) as HTMLInputElement)!.checked) 
                                de.push(index);
                        })
                        deletebinItem(de);
                        init(Folder.bin());
                    }
                });
            });
            document.querySelector("#recover")?.addEventListener("click", () => {
                for(let i = binItem.length - 1; i >= 0; i--){
                    if ((document.querySelector(`#recent${i}-checkbox`) as HTMLInputElement)!.checked) recoverPwd(i);
                }
                Task.tryDone("选择操作，轻松掌控！");
                init(Folder.bin());
            });
        }
        for(let i = 0; i < binItem.length; i++){
            const recoverBtn = document.querySelector(`#recent${i}-recover`);
            recoverBtn!.addEventListener("click", (e) => {
                e?.stopPropagation();
                recoverPwd(i);
                init(Folder.bin());
            });
            const deleteBtn = document.querySelector(`#recent${i}-delete`);
            deleteBtn!.addEventListener("click", (e) => {
                e?.stopPropagation();
                mkDialog("警告", "此操作不可撤销，你确定要永久删除吗？", ["确定", "取消"])
                .then((res) => {
                    if (res == 0){
                        deletebinItem(i);
                        init(Folder.bin());
                    }
                })
            });
            const info = document.querySelector(`#recent${i}`);
            info!.addEventListener("click", () => {
                if (binItem[i] instanceof Password) showPwd(<Array<Password>>binItem, i, Folder.bin());
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
        main?.scrollTo(pagePos.bin);
    }

    /**
     * 展示“搜索”页面
     */
    private static showSearch(): void{
        main!.innerHTML = `<div class="title">搜索</div>
        <div class="form">
            <!-- 搜索表单 -->
            <div role="search" style="width: 100%; margin-bottom: 10px;">
                <div class="input-group d-flex">
                    <input 
                        type="search" 
                        class="form-control form-control-lg" 
                        placeholder="搜索内容..." 
                        aria-label="搜索"
                        style="font-size: 15px;"
                        id="searchInput"
                    >
                    <button 
                        class="btn btn-outline-secondary" 
                        id="searchBtn"
                    >
                        搜索
                    </button>
                </div>
                <p class="action" data-bs-toggle="collapse" href="#searchSetting" aria-expanded="false" role="button" aria-controls="searchSetting">
                    点此展开或折叠高级设置
                </p>
                <div class="collapse" id="searchSetting">
                    <div class="card card-body">
                        <div><input type="checkbox" id="isReg"/><label for="isReg">使用正则表达式</label></div>
                        <div><input type="checkbox" id="isCaseSensitive"/><label for="isCaseSensitive">大小写敏感</label></div>
                        <p>搜索密码的以下部分：</p>
                        <div style="margin-left: 20px">
                            <div><input type="checkbox" id="searchFrom"/><label for="searchFrom">来源</label></div>
                            <div><input type="checkbox" id="searchUname"/><label for="searchUname">用户名</label></div>
                            <div><input type="checkbox" id="searchPwd"/><label for="searchPwd">密码</label></div>
                            <div><input type="checkbox" id="searchEmail"/><label for="searchEmail">邮箱</label></div>
                            <div><input type="checkbox" id="searchPhone"/><label for="searchPhone">手机号</label></div>
                            <div><input type="checkbox" id="searchNote"/><label for="searchNote">备注</label></div>
                        </div>
                        <div><input type="checkbox" id="searchFolder"/><label for="searchFolder">搜索文件夹</label></div>
                    </div>
                </div>
            </div>
            <div id="searchResult" style="width: 100%;"></div>
        </div>
            `;
        const searchSetting = {
            isReg: document.querySelector("#isReg") as HTMLInputElement,
            isCaseSensitive: document.querySelector("#isCaseSensitive") as HTMLInputElement,
            searchFrom: document.querySelector("#searchFrom") as HTMLInputElement,
            searchUname: document.querySelector("#searchUname") as HTMLInputElement,
            searchPwd: document.querySelector("#searchPwd") as HTMLInputElement,
            searchPhone: document.querySelector("#searchPhone") as HTMLInputElement,
            searchEmail: document.querySelector("#searchEmail") as HTMLInputElement,
            searchNote: document.querySelector("#searchNote") as HTMLInputElement,
            searchFolder: document.querySelector("#searchFolder") as HTMLInputElement,
        };
        document.querySelector("#searchInput")!.addEventListener("keydown", (e) => {
            if ((e as KeyboardEvent).key == "Enter" && !(e as KeyboardEvent).isComposing){
                (e.target as HTMLInputElement)!.blur();
                (document.querySelector("#searchBtn") as HTMLButtonElement).click();
            }
        })
        document.querySelector("#searchInput")!.addEventListener("input", () => {
            searchMemory.txt = (document.querySelector("#searchInput") as HTMLInputElement)!.value;
        })

        document.querySelector("#isReg")?.addEventListener("change", () => {searchMemory.setting.isReg = searchSetting.isReg.checked;})
        document.querySelector("#isCaseSensitive")?.addEventListener("change", () => {searchMemory.setting.isCaseSensitive = searchSetting.isCaseSensitive.checked;})
        document.querySelector("#searchFrom")?.addEventListener("change", () => {searchMemory.setting.searchFrom = searchSetting.searchFrom.checked;})
        document.querySelector("#searchUname")?.addEventListener("change", () => {searchMemory.setting.searchUname = searchSetting.searchUname.checked;})
        document.querySelector("#searchPwd")?.addEventListener("change", () => {searchMemory.setting.searchPwd = searchSetting.searchPwd.checked;})
        document.querySelector("#searchPhone")?.addEventListener("change", () => {searchMemory.setting.searchPhone = searchSetting.searchPhone.checked;})
        document.querySelector("#searchEmail")?.addEventListener("change", () => {searchMemory.setting.searchEmail = searchSetting.searchEmail.checked;})
        document.querySelector("#searchNote")?.addEventListener("change", () => {searchMemory.setting.searchNote = searchSetting.searchNote.checked;})
        document.querySelector("#searchFolder")?.addEventListener("change", () => {searchMemory.setting.searchFolder = searchSetting.searchFolder.checked;})

        document.querySelector("#searchBtn")?.addEventListener("click", () => {
            searchMemory.isSearched = true;
            searchMemory.lastSearchTxt = searchMemory.txt;
            function canFound(test: string, by: string): boolean{
                if (!searchSetting.isCaseSensitive.checked){
                    test = test.toLowerCase();
                    by = by.toLowerCase();
                }
                if (searchSetting.isReg.checked){
                    return new RegExp(by).test(test);
                } else {
                    return test.indexOf(by) != -1;
                }
            }
            function showPwdCard(list: Array<Password>, index: number): void{
                function mkIt(): void{
                    result!.insertAdjacentHTML("beforeend", list[index].getCard(cnt));
                    document.querySelector(`#card${cnt}-path`)?.addEventListener("click", () => {
                        update(list[index].dir);
                    })
                    document.querySelector(`#card${cnt}-detail`)?.addEventListener("click", () => {
                        showPwd(list,  index, Folder.search());
                    })
                    cnt++;
                }
                if (hasItemCard(list[index])) mkIt();
            }
            function showFolderCard(item: Folder): void{
                function mkIt(): void{
                    result!.insertAdjacentHTML("beforeend", item.getCard(cnt));
                    document.querySelector(`#card${cnt}-path`)?.addEventListener("click", () => {
                        update(item);
                    })
                    cnt++;
                }
                if (hasItemCard(item)) mkIt();
            }
            function hasItemCard(item: Item): boolean{
                if (item instanceof Password)
                {
                    if (canFound(item.from, input.value) && searchSetting.searchFrom.checked) return true;
                    else if (canFound(item.uname, input.value) && searchSetting.searchUname.checked) return true;
                    else if (canFound(item.phone, input.value) && searchSetting.searchPhone.checked) return true;
                    else if (canFound(item.pwd, input.value) && searchSetting.searchPwd.checked) return true;
                    else if (canFound(item.email, input.value) && searchSetting.searchEmail.checked) return true;
                    else if (canFound(item.note, input.value) && searchSetting.searchNote.checked) return true;
                    return false;
                } else {
                    return canFound(item.name, input.value) && searchSetting.searchFolder.checked;
                }
            }
            const input = document.querySelector("#searchInput") as HTMLInputElement;
            const result = document.querySelector("#searchResult");
            let cnt: number = 0, flag : boolean = false;
            result!.innerHTML = "";
            saveEditorData();
            if (input.value == ""){
                result!.innerHTML = `<div class="alert alert-danger" role="alert">
                    请输入搜索内容！
                </div>`;
                return;
            }
            Task.tryDone("密码侦探");
            result?.insertAdjacentHTML("beforeend", `<div><h5><strong>在所有文件中搜索“${input.value}”，发现以下结果：</strong></h5></div>`)

            // 检查是否有
            flag = false;
            for (let i = 0; i < pwdList.length; i++){
                if (hasItemCard(pwdList[i])){
                    flag = true;
                    break;
                }
            }
            if (flag){
                result!.insertAdjacentHTML("beforeend", "<div><h5><strong>密码</strong></h5></div>");
                for(let i = 0; i < pwdList.length; i++){
                    showPwdCard(pwdList, i);
                }
            }

            flag = false;
            for (let i = 0; i < folderList.length; i++){
                if (hasItemCard(folderList[i])){
                    flag = true;
                    break;
                }
            }
            if (flag){
                result!.insertAdjacentHTML("beforeend", "<div><h5><strong>文件夹</strong></h5></div>");
                for(let i = 0; i < folderList.length; i++){
                    showFolderCard(folderList[i]);
                }
            }

            flag = false;
            for (let i = 0; i < binItem.length; i++){
                if (hasItemCard(binItem[i])){
                    flag = true;
                    break;
                }
            }
            if (flag){
                result!.insertAdjacentHTML("beforeend", "<div><h5><strong>最近删除</strong></h5></div>");
                for(let i = 0; i < binItem.length; i++){
                    if (binItem[i].type == Type.Password){
                        showPwdCard(binItem as Array<Password>, i);
                    } else {
                        showFolderCard(binItem[i] as Folder);
                    }
                }
            }

            if (cnt == 0){
                result!.innerHTML = `<div class="alert alert-danger" role="alert">
                    没有找到相关内容！
                </div>`;
            }
        })

        searchSetting.isReg.checked = searchMemory.setting.isReg;
        searchSetting.isCaseSensitive.checked = searchMemory.setting.isCaseSensitive;
        searchSetting.searchFrom.checked = searchMemory.setting.searchFrom;
        searchSetting.searchUname.checked = searchMemory.setting.searchUname;
        searchSetting.searchPwd.checked = searchMemory.setting.searchPwd;
        searchSetting.searchEmail.checked = searchMemory.setting.searchEmail;
        searchSetting.searchPhone.checked = searchMemory.setting.searchPhone;
        searchSetting.searchNote.checked = searchMemory.setting.searchNote;
        searchSetting.searchFolder.checked = searchMemory.setting.searchFolder;
        if (searchMemory.lastSearchTxt != "" && searchMemory.isSearched){
            (document.querySelector("#searchInput") as HTMLInputElement)!.value = searchMemory.lastSearchTxt;
            (document.querySelector("#searchBtn") as HTMLButtonElement).click();
        }
        (document.querySelector("#searchInput") as HTMLInputElement)!.value = searchMemory.txt;
        main?.scrollTo(pagePos.search)
        return;
    }

    /**一个token，可以填写在这个类的其余公开函数的token参数 */
    static token = Symbol("byFunctionUpdate");

    /**
     * 切换到“设置”页面。
     * @param token 访问token，请填写{@linkcode TurnToPage.Token}
     */
    static setting(token: symbol): void{
        if (token === TurnToPage.token){
            this.showSetting();
        }
        else {
            throw new Error("token is not correct");
        }
    }

    /**
     * 切换到“最近删除”页面。
     * @param token 访问token，请填写{@linkcode TurnToPage.Token}
     */
    static bin(token: symbol, checkable: boolean = false): void{
        if (token === TurnToPage.token){
            this.showBin(checkable);
        }
        else {
            throw new Error("token is not correct");
        }
    }

    /**
     * 切换到“搜索”页面。
     * @param token 访问token，请填写{@linkcode TurnToPage.Token}
     */
    static search(token: symbol): void{
        if (token === TurnToPage.token){
            this.showSearch();
        }
        else {
            throw new Error("token is not correct");
        }
    }
}
/**
 * 更改页面，支持切换到“最近删除”、“设置”、“搜索”页面。
 * @param dir 要切换到的文件夹
 * @param checkable 切换后是否开启“选择”模式
 */
function update(dir: Folder, checkable: boolean = false) : void{
    removeTips();

    updatePos();

    dir = new Folder(dir);
    currentFolder = dir;
    document.querySelector("span#nav-setting")!.classList.remove("active");
    document.querySelector("span#nav-bin")!.classList.remove("active");
    document.querySelector("span#nav-home")!.classList.remove("active");
    document.querySelector("span#nav-mainPage")!.classList.remove("active");
    document.querySelector("span#nav-search")!.classList.remove("active");
    if (dir.isSame(Folder.bin())){
        document.querySelector("span#nav-bin")!.classList.add("active");
        TurnToPage.bin(TurnToPage.token, checkable);
        return;
    } else if (dir.isSame(Folder.home())){
        document.querySelector("span#nav-home")!.classList.add("active");
        goHome(TurnToPage.token);
        return;
    } else if (dir.isSame(Folder.setting())){
        document.querySelector("span#nav-setting")!.classList.add("active");
        TurnToPage.setting(TurnToPage.token);
        return;
    } else if (dir.isSame(Folder.search())){
        document.querySelector("span#nav-search")!.classList.add("active");
        TurnToPage.search(TurnToPage.token);
        return;
    }
    else {
        document.querySelector("span#nav-mainPage")!.classList.add("active");
    }
    pagePos.mainDir = dir;
    let faname = Folder.fromString(dir.parent).name;
    let loca = dir.toReadableHTML(); // location
    let inner : string = `<div class="title">密码列表</div>
    ${dir.isSame(Folder.root())?"":`<div class="subtitle"><p>当前位置：</p>${loca.html}</div>`}
    <div id="MainToolBar">
    ${checkable?
        `<p class="tool" id="checkable">取消选择</p>
        <p class="tool" id="check-all">全部选择</p>
        <p class="tool" id="check-invert">反向选择</p>
        <img src="../pages/resources/delete.png" title="删除" class="tool" data-bs-toggle="tooltip" data-bs-placement="top" id="delete">
        <img src="../pages/resources/copy.png" title="复制" data-bs-toggle="tooltip" data-bs-placement="top" class="tool" id="copy">`
        :
        `
        <p class="${clipboard.size == 0? "invaildTool":"tool"}" id="paste">粘贴</p>
        <p class="${clipboard.size == 0? "invaildTool":"tool"}" id="move">移动</p>
        <p class="tool" id="checkable">选择</p>
        <img src="../pages/resources/newFolder.png" title="新建文件夹" class="tool" data-bs-toggle="tooltip" data-bs-placement="top" id="newFolder">
        ${dir.isSame(Folder.root())?"":`
        <img src="../pages/resources/up.png" title="上移到${faname == ":"?"主文件夹":faname}" data-bs-toggle="tooltip" data-bs-placement="top" class="tool" id="up">
        <img src="../pages/resources/lock.png" title="加密" class="tool" data-bs-toggle="tooltip" data-bs-placement="top" id="lock">
        `}`
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
        inner += value.item.getHtml(idx, checkable);
    });
    nowPwds.forEach((value: pwdMapping, idx: number) => {
        inner += value.item.getHtml(idx, checkable);
    });
    if (!has){
        inner += `<p>暂无密码</p>`;
    }
    inner += `
    <div class="action" id="addPwd"><p>添加密码</p></div>
    `;
    main!.innerHTML = inner;
    [...document.querySelectorAll('[data-bs-toggle="tooltip"]')].forEach(t => new bootstrap.Tooltip(t));
    document.querySelector("#up")?.addEventListener("click", () => {
        update(dir.getParent());
    });
    document.querySelector("#checkable")?.addEventListener("click", () => {
        update(dir, !checkable);
    });
    if (!dir.isSame(Folder.root())){
        const parent = document.querySelector("div#dragParentCard") as HTMLDivElement;
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
            Task.tryDone("文件向上冲");
            init(dir, checkable);
        });
        parent!.addEventListener("dragover", (e) => {
            if (folderIsEditing) return;
            e.preventDefault();
        });
        for(let i = 0; i < loca.num; i++){
            document.querySelector(`#dirItem${i}`)?.addEventListener("click", (e) => {
                Task.tryDone("快速穿梭");
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
            Task.tryDone("文件大扫除");
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
            Task.tryDone("文件搬运大法");
            init(dir);
        })
        document.querySelector("#move")?.addEventListener("click", () => {
            for(let i of clipboard){
                moveItem(i.type, i.index, dir);
            }
            Task.tryDone("文件搬运大法");
            clipboard.clear();
            init(dir)
        })
        document.querySelector("#lock")?.addEventListener("click", () => {
            let nowIndex: number = -1;
            for(let i = 0; i < folderList.length; i++){
                if (folderList[i].isSame(dir)){
                    nowIndex = i;
                    break;
                }
            }
            let choice: Array<string> = ["确定", "取消"];
            if (folderList[nowIndex].lock !== null) choice.push("取消二级锁");
            mkDialog(
                "设置二级锁", 
                "输入新的二级锁密码：", 
                choice, 
                {
                    isStatic: true, 
                    otherHTML: `<div class="formItem"><input type="password" id="lockInput" placeholder="在这里输入新密码"></div>`, 
                    otherAction: () => {(document.querySelector("#lockInput") as HTMLInputElement).focus();},
                    defaultOption: 0
                }
            )
            .then((res) => {
                    if (res == 0){
                        const input = document.querySelector("#lockInput") as HTMLInputElement;
                        if (input.value == ""){
                            mkDialog("设置失败！", "密码不能为空。", ["确定"], {defaultOption: 0});
                            return;
                        }
                        folderList[nowIndex].lock = Cryp.pbkdf2(Cryp.pbkdf2(input.value));
                        folderList[nowIndex].cachePwd = input.value;
                        saveData();
                        mkToast("设置成功！", "","<p>二级锁已设置成功。</p>");
                    } else if (res == 2){
                        folderList[nowIndex].lock = null;
                        folderList[nowIndex].cachePwd = null;
                        saveData();
                        mkToast("取消成功！", "","<p>二级锁已取消。</p>");
                    }
                }
            )
        });
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
        Task.tryDone("文件夹，你好！");
        init(dir);
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
                mkToast("成功复制！", "","<p>密码已复制到剪贴板。<br>如果想要查看详情，请在设置中设置。</p>");
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
            removeTips();
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
            deleteItem(Type.Folder, nowFolders[i].idx, dir);
            init(dir);
        });
        const folder = document.querySelector(`#folder${i}`);
        folder!.addEventListener("click", () => {
            if (folderIsEditing) return;
            if (nowFolders[i].item.lock !== null && nowFolders[i].item.cachePwd === null){
                mkDialog(
                    "二级锁", 
                    "请输入二级锁密码：", 
                    ["确定", "取消"], 
                    {
                        isStatic: true, 
                        otherHTML: `<div class="formItem"><input type="password" id="lockInput" placeholder="在这里输入密码"></div>`, 
                        otherAction: () => {(document.querySelector("#lockInput") as HTMLInputElement).focus();},
                        defaultOption: 0
                    }
                )
                .then((res) => {
                    if (res == 0){
                        const input = document.querySelector("#lockInput") as HTMLInputElement;
                        if (input.value == ""){
                            mkDialog("解锁失败", "密码不能为空！", ["确定"], {defaultOption: 0});
                            return;
                        }
                        if (nowFolders[i].item.lock != Cryp.pbkdf2(Cryp.pbkdf2(input.value))){
                            mkDialog("解锁失败", "密码错误！", ["确定"], {defaultOption: 0});
                            return;
                        }
                        Task.tryDone("新世界");
                        folderList[nowFolders[i].idx].cachePwd = input.value;
                        // 对文件夹下的文件进行解锁
                        for(let j = 0; j < pwdList.length; j++){
                            if (pwdList[j].isin(nowFolders[i].item)){
                                pwdList[j] = decrypt(pwdList[j], Cryp.pbkdf2(input.value), ["dir"]) as Password;
                            }
                        }
                        for(let j = 0; j < folderList.length; j++){
                            if (folderList[j].isin(nowFolders[i].item)){
                                folderList[j] = decrypt(folderList[j], Cryp.pbkdf2(input.value), ["parent"]) as Folder;
                            }
                        }
                        update(nowFolders[i].item);
                        mkToast("解锁成功！", "","<p>文件夹已解锁。</p>");
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
            Task.tryDone("幻影显形");
            init(dir, checkable);
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
    main?.scrollTo(pagePos.main)
}