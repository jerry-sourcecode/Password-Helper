"use strict";
/**
 * 页面的渲染和切换
 */
/**
 * 如果你不在{@link mainPage.ts}这个文件中，请使用{@linkcode update}函数
 * @private
 */
class TurnToPage {
    /**
     * 展示“设置”页面
     */
    static showSetting() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        // 显示设置页面
        main.innerHTML = `
        <div class="title">设置</div>
        <div class="form">
            <p>安全设置</p>
            <div class="settingFormItem">
                <div><label for="mainPwd">访问密钥：</label><input type="text" id="mainPwd" class="vaild" value="${mainPwd}"/></div>
                <div><label for="mainPwdTip">密钥提示：</label><input type="text" id="mainPwdTip" value="${mainSetting.mainPwdTip === undefined ? "" : mainSetting.mainPwdTip}"/></div>
                <div><input type="checkbox" id="rememberPwd" ${mainPwd == "" ? "disabled" : `${isremember ? "checked" : ""}`}><label for="rememberPwd">记住密钥</label></div>
            </div>
            <p>其他个性化设置</p>
            <div class="settingFormItem">
                <div><input type="checkbox" id="autoCopy" ${mainSetting.autoCopy ? "checked" : ""}/><label for="autoCopy">当点击一条信息时，不会跳转到详情界面，而是直接复制这条信息对应的密码。</label></div>
                <div><input type="checkbox" id="easyAppend" ${mainSetting.easyAppend ? "checked" : ""}/><label for="easyAppend">添加密码时，使用快速而简洁的表单形式来代替创建引导形式。</label></div>
                <div><label for="pwdSortBy">密码显示顺序设置：</label>
                    <select id="pwdSortBy">
                        <option value="name" ${mainSetting.pwdSortBy === SortBy.name ? "selected" : ""}>按照来源顺序</option>
                        <option value="name_reserve" ${mainSetting.pwdSortBy === SortBy.name_reverse ? "selected" : ""}>按照来源倒序</option>
                        <option value="time_late" ${mainSetting.pwdSortBy === SortBy.time_late ? "selected" : ""}>按照修改时间顺序</option>
                        <option value="time_early" ${mainSetting.pwdSortBy === SortBy.time_early ? "selected" : ""}>按照修改时间倒序</option>
                    </select>
                </div>
                <div><label for="folderSortBy">文件夹显示顺序设置：</label>
                    <select id="folderSortBy">
                        <option value="name" ${mainSetting.folderSortBy === SortBy.name ? "selected" : ""}>按照文件夹名顺序</option>
                        <option value="name_reserve" ${mainSetting.folderSortBy === SortBy.name_reverse ? "selected" : ""}>按照文件夹名倒序</option>
                        <option value="time_late" ${mainSetting.folderSortBy === SortBy.time_late ? "selected" : ""}>按照重命名时间顺序</option>
                        <option value="time_early" ${mainSetting.folderSortBy === SortBy.time_early ? "selected" : ""}>按照重命名时间倒序</option>
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
            <p class="btn btn-secondary" id="apply" style="margin-left: auto;">应用</p>
        </div>
        `;
        const saveKey = document.querySelector("#rememberPwd");
        (_a = document.querySelector("#mainPwd")) === null || _a === void 0 ? void 0 : _a.addEventListener("input", (e) => {
            saveKey.disabled = e.target.value == "";
            if (saveKey.disabled)
                saveKey.checked = false;
        });
        let applyStyle = () => {
            var _a, _b;
            (_a = document.querySelector("#apply")) === null || _a === void 0 ? void 0 : _a.classList.add("btn-primary");
            (_b = document.querySelector("#apply")) === null || _b === void 0 ? void 0 : _b.classList.remove("btn-secondary");
        };
        (_b = document.querySelector("#mainPwd")) === null || _b === void 0 ? void 0 : _b.addEventListener("input", () => {
            Task.tryDone("妈妈再也不用担心我密码泄露啦！");
            applyStyle();
        });
        saveKey.addEventListener("change", () => {
            applyStyle();
        });
        (_c = document.querySelector("#mainPwdTip")) === null || _c === void 0 ? void 0 : _c.addEventListener("input", () => {
            applyStyle();
        });
        (_d = document.querySelector("#autoCopy")) === null || _d === void 0 ? void 0 : _d.addEventListener("change", () => {
            applyStyle();
        });
        (_e = document.querySelector("#easyAppend")) === null || _e === void 0 ? void 0 : _e.addEventListener("change", () => {
            applyStyle();
        });
        (_f = document.querySelector("#pwdSortBy")) === null || _f === void 0 ? void 0 : _f.addEventListener("change", () => {
            applyStyle();
        });
        (_g = document.querySelector("#folderSortBy")) === null || _g === void 0 ? void 0 : _g.addEventListener("change", () => {
            applyStyle();
        });
        (_h = document.querySelector("p#apply")) === null || _h === void 0 ? void 0 : _h.addEventListener("click", (e) => {
            var _a, _b, _c;
            if ((_a = document.querySelector("p#apply")) === null || _a === void 0 ? void 0 : _a.classList.contains("btn-primary")) {
                mainPwd = document.querySelector("#mainPwd").value;
                isremember = saveKey.checked;
                mainSetting.mainPwdTip = document.querySelector("#mainPwdTip").value;
                mainSetting.autoCopy = document.querySelector("#autoCopy").checked;
                mainSetting.easyAppend = document.querySelector("#easyAppend").checked;
                switch (document.querySelector("#pwdSortBy").value) {
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
                        break;
                }
                switch (document.querySelector("#folderSortBy").value) {
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
                        break;
                }
                saveData();
                (_b = document.querySelector("p#apply")) === null || _b === void 0 ? void 0 : _b.classList.remove("btn-primary");
                (_c = document.querySelector("p#apply")) === null || _c === void 0 ? void 0 : _c.classList.add("btn-secondary");
            }
        });
        (_j = document.querySelector("div#exportUMC")) === null || _j === void 0 ? void 0 : _j.addEventListener("click", () => {
            let ans = window.msg.showSaveDialogSync("选择导出地址", "", [{ name: '用户迁移凭证', extensions: ['umc'] }]);
            if (ans === undefined)
                return;
            saveUMC(ans);
        });
        (_k = document.querySelector("div#importUMC")) === null || _k === void 0 ? void 0 : _k.addEventListener("click", () => {
            mkDialog("警告", "此操作会覆盖原有数据，你确定要继续吗？", ["确定", "取消"])
                .then((res) => {
                if (res == 1)
                    return;
                let ans = window.msg.showOpenDialogSync("选择导出地址", "", [{ name: '用户迁移凭证', extensions: ['umc'] }]);
                if (ans === undefined)
                    return;
                readUMC(ans);
            });
        });
        (_l = document.querySelector("#reset")) === null || _l === void 0 ? void 0 : _l.addEventListener("click", () => {
            mkDialog("警告", "此操作会清空所有数据并立即重启，你确定要继续吗？", ["确定", "取消"])
                .then((res) => {
                if (res == 0) {
                    window.fs.save("./data", "");
                    location.reload();
                }
            });
        });
        main === null || main === void 0 ? void 0 : main.scrollTo(pagePos.setting);
    }
    /**
     * 展示“回收站”页面
     * @param checkable 是否开启“选择模式”
     */
    static showBin(checkable = false) {
        var _a, _b, _c, _d, _e, _f;
        // 显示回收站的密码
        let inner = `<div class="title">回收站</div>
        <div id="MainToolBar">
        ${checkable ?
            `<p class="tool" id="checkable">取消选择</p>
            <p class="tool" id="check-all">全部选择</p>
            <p class="tool" id="check-invert">反向选择</p>
            <p class="tool" id="delete">删除</p>
            <p class="tool" id="recover">恢复</p>`
            :
                `<p class="tool" id="checkable">选择</p>`}
        </div>`;
        binItem.sort((a, b) => {
            return a.rmDate > b.rmDate ? -1 : 1;
        });
        for (let i = 0; i < binItem.length; i++) {
            inner += binItem[i].getHtmlBin(i, checkable);
        }
        if (binItem.length == 0) {
            inner += `<p>暂无删除密码</p>`;
        }
        main.innerHTML = inner;
        (_a = document.querySelector("#checkable")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
            update(Folder.bin(), !checkable);
        });
        if (checkable) {
            (_b = document.querySelector("#check-all")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
                binItem.forEach((item, index) => {
                    document.querySelector(`#bin${index}-checkbox`).checked = true;
                });
            });
            (_c = document.querySelector("#check-invert")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => {
                binItem.forEach((item, index) => {
                    document.querySelector(`#bin${index}-checkbox`).checked = !document.querySelector(`#bin${index}-checkbox`).checked;
                });
            });
            (_d = document.querySelector("#delete")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", () => {
                let cnt = 0;
                binItem.forEach((item, index) => {
                    if (document.querySelector(`#bin${index}-checkbox`).checked)
                        cnt++;
                });
                if (cnt == 0)
                    return;
                mkDialog("警告", "此操作不可撤销，你确定要永久删除吗？", ["确定", "取消"])
                    .then((res) => {
                    if (res == 0) {
                        Task.tryDone("选择操作，轻松掌控！");
                        let de = [];
                        binItem.forEach((item, index) => {
                            if (document.querySelector(`#bin${index}-checkbox`).checked)
                                de.push(index);
                        });
                        deletebinItem(de);
                        init(Folder.bin());
                    }
                });
            });
            (_e = document.querySelector("#recover")) === null || _e === void 0 ? void 0 : _e.addEventListener("click", () => {
                for (let i = binItem.length - 1; i >= 0; i--) {
                    if (document.querySelector(`#bin${i}-checkbox`).checked)
                        recoverPwd(i);
                }
                Task.tryDone("选择操作，轻松掌控！");
                init(Folder.bin());
            });
        }
        for (let i = 0; i < binItem.length; i++) {
            const recoverBtn = document.querySelector(`#bin${i}-recover`);
            recoverBtn.addEventListener("click", (e) => {
                e === null || e === void 0 ? void 0 : e.stopPropagation();
                recoverPwd(i);
                init(Folder.bin());
            });
            const deleteBtn = document.querySelector(`#bin${i}-delete`);
            deleteBtn.addEventListener("click", (e) => {
                e === null || e === void 0 ? void 0 : e.stopPropagation();
                mkDialog("警告", "此操作不可撤销，你确定要永久删除吗？", ["确定", "取消"])
                    .then((res) => {
                    if (res == 0) {
                        deletebinItem(i);
                        init(Folder.bin());
                    }
                });
            });
            const info = document.querySelector(`#bin${i}`);
            info.addEventListener("click", () => {
                if (binItem[i].type == Type.Password)
                    showPwd(binItem, i, Folder.bin());
            });
            if (checkable) {
                const check = document.querySelector(`#bin${i}-checkboxDiv`);
                const checkbox = document.querySelector(`#bin${i}-checkbox`);
                check.addEventListener("click", (e) => {
                    e.stopPropagation();
                    checkbox.checked = !checkbox.checked;
                });
                checkbox.addEventListener("click", (e) => {
                    e.stopPropagation();
                });
            }
        }
        (_f = document.querySelector("#back")) === null || _f === void 0 ? void 0 : _f.addEventListener("click", () => {
            update(Folder.root());
        });
        main === null || main === void 0 ? void 0 : main.scrollTo(pagePos.bin);
    }
    /**
     * 展示“搜索”页面
     */
    static showSearch() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        function getNowFormatDate(date) {
            let year = date.getFullYear(), //获取完整的年份(4位)
            month = date.getMonth() + 1, //获取当前月份(0-11,0代表1月)
            ddate = date.getDate(); // 获取当前日(1-31)
            let strmonth = month.toString(), strDate = ddate.toString(); // 将月份和日转换为字符串
            if (month < 10)
                strmonth = `0${month}`; // 如果月份是个位数，在前面补0
            if (ddate < 10)
                strDate = `0${ddate}`; // 如果日是个位数，在前面补0
            return `${year}-${strmonth}-${strDate}`;
        }
        main.innerHTML = `<div class="title">搜索</div>
        <div class="form">
            <!-- 搜索表单 -->
            <div role="search" style="width: 100%; margin-bottom: 5px;">
                <div class="input-group d-flex">
                    <input 
                        type="search" 
                        class="form-control form-control-lg" 
                        placeholder="搜索内容..." 
                        aria-label="搜索"
                        style="font-size: 15px; margin: 5px;"
                        id="searchInput"
                    >
                    <button 
                        class="btn btn-outline-secondary" 
                        id="searchBtn"
                        style="margin: 5px;"
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
                        <div>
                            <label>搜索时间范围：自</label>
                            <input type="text" id="datepicker-start" class="form-control datepicker" placeholder="不填写则无限制" readonly value="${searchMemory.setting.startDate === null ? "" : getNowFormatDate(new Date(searchMemory.setting.startDate))}">
                            <label>至</label>
                            <input type="text" id="datepicker-end" class="form-control datepicker" placeholder="不填写则无限制" readonly value="${searchMemory.setting.endDate === null ? "" : getNowFormatDate(new Date(searchMemory.setting.endDate))}">
                        </div>
                    </div>
                </div>
            </div>
            <div id="searchResult" style="width: 100%;"></div>
        </div>
            `;
        jQuery('.datepicker').each(function () {
            var $input = jQuery(this);
            $input.datepicker({
                defaultViewDate: 'today',
                language: 'zh-CN',
                clearBtn: true,
            });
        });
        $('#datepicker-start').datepicker().on('changeDate', function () {
            const startDate = $('#datepicker-start').datepicker('getDate');
            $('#datepicker-end').datepicker('setStartDate', startDate);
            searchMemory.setting.startDate = startDate === null ? null : startDate.getTime();
        });
        $("#datepicker-start").datepicker().on("clearDate", function () {
            $('#datepicker-end').datepicker('setStartDate', null);
            searchMemory.setting.startDate = null;
        });
        $('#datepicker-end').datepicker().on('changeDate', function () {
            const endDate = $('#datepicker-end').datepicker('getDate');
            $('#datepicker-start').datepicker('setEndDate', endDate);
            endDate.setHours(23, 59, 59, 999); // 设置结束时间为当天的最后一刻
            searchMemory.setting.endDate = endDate === null ? null : endDate.getTime();
        });
        $("#datepicker-end").datepicker().on("clearDate", function () {
            $('#datepicker-start').datepicker('setEndDate', null);
            searchMemory.setting.endDate = null;
        });
        const searchSetting = {
            isReg: document.querySelector("#isReg"),
            isCaseSensitive: document.querySelector("#isCaseSensitive"),
            searchFrom: document.querySelector("#searchFrom"),
            searchUname: document.querySelector("#searchUname"),
            searchPwd: document.querySelector("#searchPwd"),
            searchPhone: document.querySelector("#searchPhone"),
            searchEmail: document.querySelector("#searchEmail"),
            searchNote: document.querySelector("#searchNote"),
            searchFolder: document.querySelector("#searchFolder"),
        };
        document.querySelector("#searchInput").addEventListener("keydown", (e) => {
            if (e.key == "Enter" && !e.isComposing) {
                e.target.blur();
                document.querySelector("#searchBtn").click();
            }
        });
        document.querySelector("#searchInput").addEventListener("input", () => {
            searchMemory.txt = document.querySelector("#searchInput").value;
        });
        (_a = document.querySelector("#isReg")) === null || _a === void 0 ? void 0 : _a.addEventListener("change", () => { searchMemory.setting.isReg = searchSetting.isReg.checked; });
        (_b = document.querySelector("#isCaseSensitive")) === null || _b === void 0 ? void 0 : _b.addEventListener("change", () => { searchMemory.setting.isCaseSensitive = searchSetting.isCaseSensitive.checked; });
        (_c = document.querySelector("#searchFrom")) === null || _c === void 0 ? void 0 : _c.addEventListener("change", () => { searchMemory.setting.searchFrom = searchSetting.searchFrom.checked; });
        (_d = document.querySelector("#searchUname")) === null || _d === void 0 ? void 0 : _d.addEventListener("change", () => { searchMemory.setting.searchUname = searchSetting.searchUname.checked; });
        (_e = document.querySelector("#searchPwd")) === null || _e === void 0 ? void 0 : _e.addEventListener("change", () => { searchMemory.setting.searchPwd = searchSetting.searchPwd.checked; });
        (_f = document.querySelector("#searchPhone")) === null || _f === void 0 ? void 0 : _f.addEventListener("change", () => { searchMemory.setting.searchPhone = searchSetting.searchPhone.checked; });
        (_g = document.querySelector("#searchEmail")) === null || _g === void 0 ? void 0 : _g.addEventListener("change", () => { searchMemory.setting.searchEmail = searchSetting.searchEmail.checked; });
        (_h = document.querySelector("#searchNote")) === null || _h === void 0 ? void 0 : _h.addEventListener("change", () => { searchMemory.setting.searchNote = searchSetting.searchNote.checked; });
        (_j = document.querySelector("#searchFolder")) === null || _j === void 0 ? void 0 : _j.addEventListener("change", () => { searchMemory.setting.searchFolder = searchSetting.searchFolder.checked; });
        (_k = document.querySelector("#searchBtn")) === null || _k === void 0 ? void 0 : _k.addEventListener("click", () => {
            searchMemory.lastSearchTxt = searchMemory.txt;
            function canFound(test, by) {
                if (!searchSetting.isCaseSensitive.checked) {
                    test = test.toLowerCase();
                    by = by.toLowerCase();
                }
                if (searchSetting.isReg.checked) {
                    return new RegExp(by).test(test);
                }
                else {
                    return test.indexOf(by) != -1;
                }
            }
            function showPwdCard(list, index) {
                function mkIt() {
                    var _a, _b;
                    result.insertAdjacentHTML("beforeend", list[index].getCard(cnt));
                    (_a = document.querySelector(`#card${cnt}-path`)) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
                        update(list[index].getParent());
                    });
                    (_b = document.querySelector(`#card${cnt}-detail`)) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
                        showPwd(list, index, Folder.search());
                    });
                    cnt++;
                }
                if (hasItemCard(list[index]))
                    mkIt();
            }
            function showFolderCard(item) {
                function mkIt() {
                    var _a;
                    result.insertAdjacentHTML("beforeend", item.getCard(cnt));
                    (_a = document.querySelector(`#card${cnt}-path`)) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
                        update(item);
                    });
                    cnt++;
                }
                if (hasItemCard(item))
                    mkIt();
            }
            function hasItemCard(item) {
                if (item.isLocked())
                    return false;
                if (item.rmDate !== null) {
                    if ((searchMemory.setting.startDate !== null && Number(item.rmDate) < searchMemory.setting.startDate) ||
                        (searchMemory.setting.endDate !== null && Number(item.rmDate) > searchMemory.setting.endDate)) {
                        return false;
                    }
                }
                else {
                    if ((searchMemory.setting.startDate !== null && Number(item.moDate) < searchMemory.setting.startDate) ||
                        (searchMemory.setting.endDate !== null && Number(item.moDate) > searchMemory.setting.endDate)) {
                        return false;
                    }
                }
                if (item.type == Type.Password) {
                    item = item;
                    if (canFound(item.from, input.value) && searchSetting.searchFrom.checked)
                        return true;
                    else if (canFound(item.uname, input.value) && searchSetting.searchUname.checked)
                        return true;
                    else if (canFound(item.phone, input.value) && searchSetting.searchPhone.checked)
                        return true;
                    else if (canFound(item.pwd, input.value) && searchSetting.searchPwd.checked)
                        return true;
                    else if (canFound(item.email, input.value) && searchSetting.searchEmail.checked)
                        return true;
                    else if (canFound(item.note, input.value) && searchSetting.searchNote.checked)
                        return true;
                    return false;
                }
                else {
                    item = item;
                    return canFound(item.name, input.value) && searchSetting.searchFolder.checked;
                }
            }
            const input = document.querySelector("#searchInput");
            const result = document.querySelector("#searchResult");
            let cnt = 0, flag = false;
            result.innerHTML = "";
            saveEditorData();
            if (input.value == "") {
                result.innerHTML = `<div class="alert alert-danger" role="alert">
                    请输入搜索内容！
                </div>`;
                return;
            }
            Task.tryDone("密码侦探");
            result === null || result === void 0 ? void 0 : result.insertAdjacentHTML("beforeend", `<div><h5><strong>在所有文件中搜索“${input.value}”，发现以下结果：</strong></h5></div>`);
            // 检查是否有
            flag = false;
            for (let i = 0; i < pwdList.length; i++) {
                if (hasItemCard(pwdList[i])) {
                    flag = true;
                    break;
                }
            }
            if (flag) {
                result.insertAdjacentHTML("beforeend", "<div><h5><strong>密码</strong></h5></div>");
                for (let i = 0; i < pwdList.length; i++) {
                    showPwdCard(pwdList, i);
                }
            }
            flag = false;
            for (let i = 0; i < folderList.length; i++) {
                if (hasItemCard(folderList[i])) {
                    flag = true;
                    break;
                }
            }
            if (flag) {
                result.insertAdjacentHTML("beforeend", "<div><h5><strong>文件夹</strong></h5></div>");
                for (let i = 0; i < folderList.length; i++) {
                    showFolderCard(folderList[i]);
                }
            }
            flag = false;
            for (let i = 0; i < binItem.length; i++) {
                if (hasItemCard(binItem[i])) {
                    flag = true;
                    break;
                }
            }
            if (flag) {
                result.insertAdjacentHTML("beforeend", "<div><h5><strong>回收站</strong></h5></div>");
                for (let i = 0; i < binItem.length; i++) {
                    if (binItem[i].type == Type.Password) {
                        showPwdCard(binItem, i);
                    }
                    else {
                        showFolderCard(binItem[i]);
                    }
                }
            }
            if (cnt == 0) {
                result.innerHTML = `<div class="alert alert-danger" role="alert">
                    没有找到相关内容！
                </div>`;
            }
        });
        searchSetting.isReg.checked = searchMemory.setting.isReg;
        searchSetting.isCaseSensitive.checked = searchMemory.setting.isCaseSensitive;
        searchSetting.searchFrom.checked = searchMemory.setting.searchFrom;
        searchSetting.searchUname.checked = searchMemory.setting.searchUname;
        searchSetting.searchPwd.checked = searchMemory.setting.searchPwd;
        searchSetting.searchEmail.checked = searchMemory.setting.searchEmail;
        searchSetting.searchPhone.checked = searchMemory.setting.searchPhone;
        searchSetting.searchNote.checked = searchMemory.setting.searchNote;
        searchSetting.searchFolder.checked = searchMemory.setting.searchFolder;
        if (searchMemory.lastSearchTxt !== "" && searchMemory.lastSearchTxt !== null) {
            document.querySelector("#searchInput").value = searchMemory.lastSearchTxt;
            document.querySelector("#searchBtn").click();
        }
        document.querySelector("#searchInput").value = searchMemory.txt;
        main === null || main === void 0 ? void 0 : main.scrollTo(pagePos.search);
        return;
    }
    /**
     * 切换到“设置”页面。
     * @param token 访问token，请填写{@linkcode TurnToPage.Token}
     */
    static setting(token) {
        if (token === TurnToPage.token) {
            this.showSetting();
        }
        else {
            throw new Error("token is not correct");
        }
    }
    /**
     * 切换到“回收站”页面。
     * @param token 访问token，请填写{@linkcode TurnToPage.Token}
     */
    static bin(token, checkable = false) {
        if (token === TurnToPage.token) {
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
    static search(token) {
        if (token === TurnToPage.token) {
            this.showSearch();
        }
        else {
            throw new Error("token is not correct");
        }
    }
}
/**一个token，可以填写在这个类的其余公开函数的token参数 */
TurnToPage.token = Symbol("byFunctionUpdate");
/**
 * 更改页面，支持切换到“回收站”、“设置”、“搜索”页面。
 * @param dir 要切换到的文件夹
 * @param checkable 切换后是否开启“选择”模式
 */
function update(dir, checkable = false) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    removeTips();
    updatePos();
    dir = new Folder(dir);
    currentFolder = dir;
    document.querySelector("span#nav-setting").classList.remove("active");
    document.querySelector("span#nav-bin").classList.remove("active");
    document.querySelector("span#nav-home").classList.remove("active");
    document.querySelector("span#nav-mainPage").classList.remove("active");
    document.querySelector("span#nav-search").classList.remove("active");
    if (dir.isSame(Folder.bin())) {
        document.querySelector("span#nav-bin").classList.add("active");
        TurnToPage.bin(TurnToPage.token, checkable);
        return;
    }
    else if (dir.isSame(Folder.home())) {
        document.querySelector("span#nav-home").classList.add("active");
        goHome(TurnToPage.token);
        return;
    }
    else if (dir.isSame(Folder.setting())) {
        document.querySelector("span#nav-setting").classList.add("active");
        TurnToPage.setting(TurnToPage.token);
        return;
    }
    else if (dir.isSame(Folder.search())) {
        document.querySelector("span#nav-search").classList.add("active");
        TurnToPage.search(TurnToPage.token);
        return;
    }
    else {
        document.querySelector("span#nav-mainPage").classList.add("active");
    }
    pagePos.mainDir = dir;
    let loca = dir.toReadableHTML(); // location
    let inner = `<div class="title">密码列表</div>
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
        `}`}
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
    nowPwds.sort((a, b) => {
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
    <div class="action" id="addPwd"><p>添加密码</p></div>
    `;
    main.innerHTML = inner;
    updateTooltip();
    (_a = document.querySelector("#up")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
        update(dir.getParent());
    });
    (_b = document.querySelector("#checkable")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
        update(dir, !checkable);
    });
    if (!dir.isSame(Folder.root())) {
        const parent = document.querySelector("div#dragParentCard");
        parent.addEventListener("drop", (e) => {
            var _a;
            if (folderIsEditing)
                return;
            e.preventDefault();
            const index = (_a = e === null || e === void 0 ? void 0 : e.dataTransfer) === null || _a === void 0 ? void 0 : _a.getData("text/plain");
            const num = parseInt(index.substring(1));
            parent.style.display = "none";
            if (index[0] == "p") {
                moveItem(Type.Password, num, dir.getParent());
            }
            else {
                moveItem(Type.Folder, num, dir.getParent());
            }
            Task.tryDone("文件向上冲");
            init(dir, checkable);
        });
        parent.addEventListener("dragover", (e) => {
            if (folderIsEditing)
                return;
            e.preventDefault();
        });
        for (let i = 0; i < loca.num; i++) {
            (_c = document.querySelector(`#dirItem${i}`)) === null || _c === void 0 ? void 0 : _c.addEventListener("click", (e) => {
                Task.tryDone("快速穿梭");
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
            let errNum = 0;
            nowFolders.forEach((value, index) => {
                if (document.querySelector(`#folder${index}-checkbox`).checked) {
                    try {
                        deleteItem(Type.Folder, value.idx, dir, false);
                    }
                    catch (error) {
                        errNum++;
                    }
                }
            });
            nowPwds.forEach((value, index) => {
                if (document.querySelector(`#pwd${index}-checkbox`).checked) {
                    try {
                        deleteItem(Type.Password, value.idx, dir, false);
                    }
                    catch (error) {
                        errNum++;
                    }
                }
            });
            if (errNum > 0)
                mkDialog("删除失败", `有${errNum}个文件因为权限问题而无法删除，请先解开所有二级锁。`);
            else
                Task.tryDone("文件大扫除");
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
        });
        (_h = document.querySelector("#move")) === null || _h === void 0 ? void 0 : _h.addEventListener("click", () => {
            if (!getCurrentUserGroup().permission.canMove) {
                mkDialog("权限不足", "当前用户组没有权限进行移动操作。");
                return;
            }
            for (let i of clipboard) {
                moveItem(i.type, i.index, dir);
            }
            Task.tryDone("文件搬运大法");
            clipboard.clear();
            init(dir);
        });
        (_j = document.querySelector("#lock")) === null || _j === void 0 ? void 0 : _j.addEventListener("click", () => {
            if (!getCurrentUserGroup().permission.canLock) {
                mkDialog("权限不足", "当前用户组没有权限进行加密操作。");
                return;
            }
            let nowIndex = -1;
            for (let i = 0; i < folderList.length; i++) {
                if (folderList[i].isSame(dir)) {
                    nowIndex = i;
                    break;
                }
            }
            let choice = ["确定", "取消"];
            if (folderList[nowIndex].lock !== null)
                choice.push("取消二级锁");
            mkDialog("设置二级锁", "输入新的二级锁密码：", choice, {
                isStatic: true,
                otherHTML: `<div class="formItem"><input type="password" id="lockInput" placeholder="在这里输入新密码"></div>`,
                otherAction: () => { document.querySelector("#lockInput").focus(); },
                defaultOption: 0
            })
                .then((res) => {
                if (res == 0) {
                    const input = document.querySelector("#lockInput");
                    if (input.value == "") {
                        mkDialog("设置失败！", "密码不能为空。", ["确定"], { defaultOption: 0 });
                        return;
                    }
                    folderList[nowIndex].lock = Cryp.pbkdf2(Cryp.pbkdf2(input.value));
                    folderList[nowIndex].cachePwd = input.value;
                    saveData();
                    Task.tryDone("双重加密，双重保护");
                    mkToast("设置成功！", "", "<p>二级锁已设置成功。</p>");
                }
                else if (res == 2) {
                    folderList[nowIndex].lock = null;
                    folderList[nowIndex].cachePwd = null;
                    saveData();
                    mkToast("取消成功！", "", "<p>二级锁已取消。</p>");
                }
            });
        });
    }
    (_k = document.querySelector("#newFolder")) === null || _k === void 0 ? void 0 : _k.addEventListener("click", () => {
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
        if (mkdir(new Folder(`新建文件夹${lowerBound == 0 ? "" : lowerBound}`, dir.stringify())))
            Task.tryDone("文件夹，你好！");
        init(dir);
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
            try {
                deleteItem(Type.Password, nowPwds[i].idx, dir);
            }
            catch (error) {
                mkDialog("删除失败", "此文件因为权限问题无法删除，请先解锁所有二级锁。");
            }
        });
        const info = document.querySelector(`#pwd${i}`);
        info.addEventListener("click", () => {
            if (folderIsEditing)
                return;
            if (mainSetting.autoCopy) {
                copyToClipboard(pwdList[nowPwds[i].idx].pwd);
                mkToast("成功复制！", "", "<p>密码已复制到剪贴板。<br>如果想要查看详情，请在设置中设置。</p>");
                return;
            }
            showPwd(pwdList, nowPwds[i].idx, dir);
        });
        info.addEventListener("dragstart", (e) => {
            var _a;
            if (folderIsEditing)
                return;
            if (!dir.isSame(Folder.root()))
                document.querySelector("div#dragParentCard").style.display = "flex";
            (_a = e === null || e === void 0 ? void 0 : e.dataTransfer) === null || _a === void 0 ? void 0 : _a.setData("text/plain", "p" + nowPwds[i].idx.toString());
        });
        info.addEventListener("dragend", () => {
            document.querySelector("div#dragParentCard").style.display = "none";
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
            removeTips();
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
        fdeleteBtn.addEventListener("click", (e) => {
            if (folderIsEditing)
                return;
            e === null || e === void 0 ? void 0 : e.stopPropagation();
            try {
                deleteItem(Type.Folder, nowFolders[i].idx, dir);
            }
            catch (error) {
                mkDialog("删除失败", "此文件因为权限问题无法删除，请先解锁所有二级锁。");
            }
            init(dir);
        });
        if (nowFolders[i].item.lock !== null && nowFolders[i].item.cachePwd !== null) {
            const fUnlocked = document.querySelector(`#folder${i}-unlocked`);
            fUnlocked.addEventListener("click", (e) => {
                e === null || e === void 0 ? void 0 : e.stopPropagation();
                lockFolder(nowFolders[i].item);
                update(dir);
                saveData();
            });
        }
        const folder = document.querySelector(`#folder${i}`);
        folder.addEventListener("click", () => {
            if (folderIsEditing)
                return;
            if (nowFolders[i].item.lock !== null && nowFolders[i].item.cachePwd === null) {
                mkDialog("二级锁", "请输入二级锁密码：", ["确定", "取消"], {
                    isStatic: true,
                    otherHTML: `<div class="formItem"><input type="password" id="lockInput" placeholder="在这里输入密码"></div>`,
                    otherAction: () => { document.querySelector("#lockInput").focus(); },
                    defaultOption: 0
                })
                    .then((res) => {
                    if (res == 0) {
                        const input = document.querySelector("#lockInput");
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
                                pwdList[j] = decrypt(pwdList[j], Cryp.pbkdf2(input.value), ["dir"]);
                            }
                        }
                        for (let j = 0; j < folderList.length; j++) {
                            if (folderList[j].isin(nowFolders[i].item)) {
                                folderList[j] = decrypt(folderList[j], Cryp.pbkdf2(input.value), ["parent"]);
                            }
                        }
                        update(nowFolders[i].item);
                        mkToast("解锁成功！", "", "<p>文件夹已解锁。</p>");
                    }
                });
                return;
            }
            else {
                Task.tryDone("新世界");
                update(nowFolders[i].item);
            }
        });
        folder.addEventListener("dragstart", (e) => {
            var _a;
            if (folderIsEditing)
                return;
            if (!dir.isSame(Folder.root()))
                document.querySelector("div#dragParentCard").style.display = "flex";
            (_a = e === null || e === void 0 ? void 0 : e.dataTransfer) === null || _a === void 0 ? void 0 : _a.setData("text/plain", "f" + nowFolders[i].idx.toString());
        });
        folder.addEventListener("dragover", (e) => {
            if (folderIsEditing)
                return;
            e.preventDefault();
        });
        folder.addEventListener("dragend", () => {
            document.querySelector("div#dragParentCard").style.display = "none";
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
            Task.tryDone("幻影显形");
            init(dir, checkable);
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
    main === null || main === void 0 ? void 0 : main.scrollTo(pagePos.main);
}
