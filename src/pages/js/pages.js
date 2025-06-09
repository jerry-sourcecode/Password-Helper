"use strict";
function _showSetting() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
    // 显示设置页面
    content.innerHTML = `
    <div class="title">设置</div>
    <div class="form">
        <p class="subtitle">安全设置</p>
        <div class="settingFormItem">
            <div><label for="mainPwd">访问密钥：</label><input type="text" id="mainPwd" class="vaild" value="${mainPwd}"/></div>
            <div><label for="mainPwdTip">密钥提示：</label><input type="text" id="mainPwdTip" value="${mainSetting.mainPwdTip === undefined ? "" : mainSetting.mainPwdTip}"/></div>
            <div class="form-check"><input class="form-check-input" type="checkbox" id="rememberPwd" ${mainPwd == "" ? "disabled" : `${isremember ? "checked" : ""}`}><label for="rememberPwd" class="form-check-label">记住密钥</label></div>
        </div>
        <p class="subtitle">密码生成设置</p>
        <div class="settingFormItem">
            <p style="text-indent: 2em">用户可以在这里管理随机生成密码中各种字符的权重，权重越大，随机的密码中就会更有可能含有更多的此类字符。如果权重为0，则此类字符不会出现。</p>
            <div><label for="generateRdPwdSetting-Letter">字母在随机密码中的权重：</label><input type="number" id="generateRdPwdSetting-Letter" class="vaild" value="${mainSetting.generateRandomPwdSetting.weightOfLetter}" min="0" max="10"/></div>
            <div><label for="generateRdPwdSetting-Number">数字在随机密码中的权重：</label><input type="number" id="generateRdPwdSetting-Number" class="vaild" value="${mainSetting.generateRandomPwdSetting.weightOfNum}" min="0" max="10"/></div>
            <div><label for="generateRdPwdSetting-Punc">特殊字符在随机密码中的权重：</label><input type="number" id="generateRdPwdSetting-Punc" class="vaild" value="${mainSetting.generateRandomPwdSetting.weightOfPunc}" min="0" max="10"/></div>
        </div>
        <p class="subtitle">其他个性化设置</p>
        <div class="settingFormItem">
            <div class="form-check"><input class="form-check-input" type="checkbox" id="autoCopy" ${mainSetting.autoCopy ? "checked" : ""}/><label  class="form-check-label" for="autoCopy">当点击一条信息时，不会跳转到详情界面，而是直接复制这条信息对应的密码。</label></div>
            <div class="form-check"><input class="form-check-input" type="checkbox" id="easyAppend" ${mainSetting.easyAppend ? "checked" : ""}/><label  class="form-check-label" for="easyAppend">添加密码时，使用快速而简洁的表单形式来代替创建引导形式。</label></div>
            <div><label for="pwdSortBy">密码显示顺序设置：</label>
                <select id="pwdSortBy" class="form-select">
                    <option value="name" ${mainSetting.pwdSortBy === SortBy.name ? "selected" : ""}>按照来源顺序</option>
                    <option value="name_reserve" ${mainSetting.pwdSortBy === SortBy.name_reverse ? "selected" : ""}>按照来源倒序</option>
                    <option value="time_late" ${mainSetting.pwdSortBy === SortBy.time_late ? "selected" : ""}>按照修改时间顺序</option>
                    <option value="time_early" ${mainSetting.pwdSortBy === SortBy.time_early ? "selected" : ""}>按照修改时间倒序</option>
                </select>
            </div>
            <div><label for="folderSortBy">文件夹显示顺序设置：</label>
                <select id="folderSortBy" class="form-select">
                    <option value="name" ${mainSetting.folderSortBy === SortBy.name ? "selected" : ""}>按照文件夹名顺序</option>
                    <option value="name_reserve" ${mainSetting.folderSortBy === SortBy.name_reverse ? "selected" : ""}>按照文件夹名倒序</option>
                    <option value="time_late" ${mainSetting.folderSortBy === SortBy.time_late ? "selected" : ""}>按照重命名时间顺序</option>
                    <option value="time_early" ${mainSetting.folderSortBy === SortBy.time_early ? "selected" : ""}>按照重命名时间倒序</option>
                </select>
            </div>
        </div>
        <p class="subtitle">仓库设置</p>
        <div class="settingFormItem" style="text-indent: 2em">
            <p>你可以导入一个新的密码库，可以随时方便的切换密码库，原来的密码库不会丢失。</p>
            <p>当前仓库路径：${curPath}</p>
            <div>
                <label for="folderSortBy">仓库切换：</label>
                <button class="btn btn-outline-secondary dropdown-toggle" type="button" id="repoSwitchBtn" data-bs-toggle="dropdown" aria-expanded="false">
                    ${repoName}
                </button>
                <ul class="dropdown-menu" aria-labelledby="repoSwitchBtn" id="repoSwitchUl">
                </ul>
                <img class="icon" id="rf-repo" style="margin-right: 8px;" src="./resources/refresh.png" data-bs-toggle="tooltip" data-bs-placement="top" title="刷新仓库">
            </div>
            <div id="importUMC"><p class="action">点此导入密码库</p></div>
            <div id="newUMC"><p class="action">点此新建密码库</p></div>
        </div>
        <div id="reset"><p class="action">点此注销密码库</p><span>，注销会清除在程序上的记录，但不会删除本地库文件。</span></div>
        <p class="btn btn-secondary" id="apply" style="margin-left: auto;">应用</p>
    </div>
    `;
    updateTooltip();
    const saveKey = document.querySelector("#rememberPwd");
    (_a = document.querySelector("#mainPwd")) === null || _a === void 0 ? void 0 : _a.addEventListener("input", (e) => {
        saveKey.disabled = e.target.value == "";
        if (saveKey.disabled)
            saveKey.checked = false;
    });
    function rfRepo() {
        const repoSwitchUl = document.querySelector("#repoSwitchUl");
        let inner = "";
        for (let i = 0; i < umcFilePaths.length; i++) {
            if (umcFilePaths[i] === curPath) {
                inner += `<li><span class="dropdown-item active" data-path="${umcFilePaths[i]}" id="repoSwitchLi">${repoName}</span></li>`;
                continue;
            }
            let n = window.fs.readSync(umcFilePaths[i]);
            if (n !== undefined)
                inner += `<li><span class="dropdown-item" data-path="${umcFilePaths[i]}" id="repoSwitchLi">${UMC.getName(n)}</span></li>`;
        }
        repoSwitchUl.innerHTML = inner;
        document.querySelectorAll("#repoSwitchLi").forEach((v) => {
            v.addEventListener("click", () => {
                let path = v.dataset.path;
                if (path !== curPath)
                    window.process.startNewProcess(path);
            });
        });
    }
    rfRepo();
    (_b = document.querySelector("#rf-repo")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
        rfRepo();
    });
    let applyStyle = () => {
        var _a, _b;
        (_a = document.querySelector("#apply")) === null || _a === void 0 ? void 0 : _a.classList.add("btn-primary");
        (_b = document.querySelector("#apply")) === null || _b === void 0 ? void 0 : _b.classList.remove("btn-secondary");
    };
    (_c = document.querySelector("#mainPwd")) === null || _c === void 0 ? void 0 : _c.addEventListener("input", () => {
        Task.tryDone("妈妈再也不用担心我密码泄露啦！");
        applyStyle();
    });
    saveKey.addEventListener("change", () => { applyStyle(); });
    (_d = document.querySelector("#mainPwdTip")) === null || _d === void 0 ? void 0 : _d.addEventListener("input", () => { applyStyle(); });
    (_e = document.querySelector("#autoCopy")) === null || _e === void 0 ? void 0 : _e.addEventListener("change", () => { applyStyle(); });
    (_f = document.querySelector("#easyAppend")) === null || _f === void 0 ? void 0 : _f.addEventListener("change", () => { applyStyle(); });
    (_g = document.querySelector("#pwdSortBy")) === null || _g === void 0 ? void 0 : _g.addEventListener("change", () => { applyStyle(); });
    (_h = document.querySelector("#folderSortBy")) === null || _h === void 0 ? void 0 : _h.addEventListener("change", () => { applyStyle(); });
    (_j = document.querySelector("#generateRdPwdSetting-Letter")) === null || _j === void 0 ? void 0 : _j.addEventListener("change", (e) => {
        if (Number(e.target.value) < 0)
            e.target.value = "0";
        if (Number(e.target.value) > 10)
            e.target.value = "10";
        applyStyle();
    });
    (_k = document.querySelector("#generateRdPwdSetting-Number")) === null || _k === void 0 ? void 0 : _k.addEventListener("change", (e) => {
        if (Number(e.target.value) < 0)
            e.target.value = "0";
        if (Number(e.target.value) > 10)
            e.target.value = "10";
        applyStyle();
    });
    (_l = document.querySelector("#generateRdPwdSetting-Punc")) === null || _l === void 0 ? void 0 : _l.addEventListener("change", (e) => {
        if (Number(e.target.value) < 0)
            e.target.value = "0";
        if (Number(e.target.value) > 10)
            e.target.value = "10";
        applyStyle();
    });
    (_m = document.querySelector("p#apply")) === null || _m === void 0 ? void 0 : _m.addEventListener("click", (e) => {
        var _a, _b, _c;
        if ((_a = document.querySelector("p#apply")) === null || _a === void 0 ? void 0 : _a.classList.contains("btn-primary")) {
            mainPwd = document.querySelector("#mainPwd").value;
            isremember = saveKey.checked;
            mainSetting.mainPwdTip = document.querySelector("#mainPwdTip").value;
            mainSetting.autoCopy = document.querySelector("#autoCopy").checked;
            mainSetting.easyAppend = document.querySelector("#easyAppend").checked;
            mainSetting.generateRandomPwdSetting = {
                weightOfLetter: Number(document.querySelector("#generateRdPwdSetting-Letter").value),
                weightOfNum: Number(document.querySelector("#generateRdPwdSetting-Number").value),
                weightOfPunc: Number(document.querySelector("#generateRdPwdSetting-Punc").value)
            };
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
    (_o = document.querySelector("div#newUMC")) === null || _o === void 0 ? void 0 : _o.addEventListener("click", () => {
        let filepath = window.msg.showSaveDialogSync("选择保存地址", "选择保存新文件的地址", [{ name: "密码库文件", extensions: ['umc'] }]);
        if (filepath !== undefined) {
            umcFilePaths.push(filepath);
            curPath = filepath;
            saveData();
            saveEditorData();
            window.process.startNewProcess();
            rfRepo();
        }
    });
    (_p = document.querySelector("div#importUMC")) === null || _p === void 0 ? void 0 : _p.addEventListener("click", () => {
        let filepath = window.msg.showOpenDialogSync("选择打开文件", "选择一个文件来打开", [{ name: "密码库文件", extensions: ['umc'] }]);
        if (filepath !== undefined) {
            if (umcFilePaths.indexOf(filepath) !== -1) {
                mkDialog("打开失败", "密码库已经存在。");
                return;
            }
            umcFilePaths.push(filepath);
            curPath = filepath;
            saveEditorData();
            window.process.startNewProcess();
            rfRepo();
        }
    });
    (_q = document.querySelector("#reset")) === null || _q === void 0 ? void 0 : _q.addEventListener("click", () => {
        umcFilePaths.splice(umcFilePaths.length - 1, 1);
        saveEditorData();
        location.reload();
    });
    content === null || content === void 0 ? void 0 : content.scrollTo(pagePos.setting);
}
function _showBin(checkable = false) {
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
    content.innerHTML = inner;
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
    content === null || content === void 0 ? void 0 : content.scrollTo(pagePos.bin);
}
function _showSearch() {
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
    content.innerHTML = `<div class="title">搜索</div>
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
        /**
         * 检查字符串是否可以被匹配到。
         * @param test 要测试的字符串
         * @param by 要匹配的字符串
         * @returns 匹配到的字符串，如果没有匹配到则返回null
         */
        function canFound(test, by) {
            if (!searchSetting.isCaseSensitive.checked) {
                test = test.toLowerCase();
                by = by.toLowerCase();
            }
            if (searchSetting.isReg.checked) {
                if (new RegExp(by).exec(test) === null)
                    return null;
                return new RegExp(by).exec(test)[0];
            }
            else {
                if (test.indexOf(by) != -1)
                    return by;
                return null;
            }
        }
        function showPwdCard(list, index) {
            function mkIt(str) {
                var _a, _b;
                result.insertAdjacentHTML("beforeend", list[index].getCard(cnt, false, str));
                (_a = document.querySelector(`#card${cnt}-path`)) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
                    update(list[index].getParent());
                });
                (_b = document.querySelector(`#card${cnt}-detail`)) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
                    showPwd(list, index, Folder.search());
                });
                cnt++;
            }
            if (hasItemCard(list[index]) !== null)
                mkIt(hasItemCard(list[index]));
        }
        function showFolderCard(item, isBin = false) {
            function mkIt(k) {
                var _a;
                result.insertAdjacentHTML("beforeend", item.getCard(cnt, isBin, k));
                (_a = document.querySelector(`#card${cnt}-path`)) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
                    update(item);
                });
                cnt++;
            }
            if (hasItemCard(item))
                mkIt(hasItemCard(item));
        }
        function hasItemCard(item) {
            if (item.isLocked())
                return null;
            if (item.rmDate !== null) {
                if ((searchMemory.setting.startDate !== null && Number(item.rmDate) < searchMemory.setting.startDate) ||
                    (searchMemory.setting.endDate !== null && Number(item.rmDate) > searchMemory.setting.endDate)) {
                    return null;
                }
            }
            else {
                if ((searchMemory.setting.startDate !== null && Number(item.moDate) < searchMemory.setting.startDate) ||
                    (searchMemory.setting.endDate !== null && Number(item.moDate) > searchMemory.setting.endDate)) {
                    return null;
                }
            }
            if (item.type == Type.Password) {
                item = item;
                if (canFound(item.from, input.value) && searchSetting.searchFrom.checked)
                    return canFound(item.from, input.value);
                else if (canFound(item.uname, input.value) && searchSetting.searchUname.checked)
                    return canFound(item.uname, input.value);
                else if (canFound(item.phone, input.value) && searchSetting.searchPhone.checked)
                    return canFound(item.phone, input.value);
                else if (canFound(item.pwd, input.value) && searchSetting.searchPwd.checked)
                    return canFound(item.pwd, input.value);
                else if (canFound(item.email, input.value) && searchSetting.searchEmail.checked)
                    canFound(item.email, input.value);
                else if (canFound(item.note, input.value) && searchSetting.searchNote.checked)
                    return canFound(item.note, input.value);
                return null;
            }
            else {
                item = item;
                if (canFound(item.name, input.value) && searchSetting.searchFolder.checked) {
                    return canFound(item.name, input.value);
                }
            }
            return null;
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
        result === null || result === void 0 ? void 0 : result.insertAdjacentHTML("beforeend", `<div><h5><strong style="word-wrap: break-word;">在所有文件中搜索“${input.value}”，发现以下结果：</strong></h5></div>`);
        try {
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
        }
        catch (error) {
            result.innerHTML = `<div class="alert alert-danger" role="alert">
                正则表达式不合法！
            </div>`;
            return;
        }
        if (flag) {
            result.insertAdjacentHTML("beforeend", "<div><h5><strong>回收站</strong></h5></div>");
            for (let i = 0; i < binItem.length; i++) {
                if (binItem[i].type == Type.Password) {
                    showPwdCard(binItem, i);
                }
                else {
                    showFolderCard(binItem[i], true);
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
    content === null || content === void 0 ? void 0 : content.scrollTo(pagePos.search);
    return;
}
