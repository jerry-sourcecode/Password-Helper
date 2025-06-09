/**
 * 一些关于用户组、任务、权限的类
 */

/**
 * 任务基类
 * @member title 任务标题
 * @member description 任务描述
 * @member location 完成任务的位置
 * @member reward 任务奖励
 * @member times 需要完成任务的次数
 * @member id 任务ID，应保证独一无二
 * @member type 数据类型，在此类中始终为Type.Task
 */
class Task {
    title: string;
    description: string;
    location: Folder | null;
    reward: number;
    id: string;
    times: number;
    type: Type;
    constructor(title: string | Task, description: string = "", location: Folder | null = null, reward: number = 0, times: number = 1, id: string = (typeof title === "string" ? title : title.id)) {
        this.type = Type.Task;
        if (typeof title == "string") {
            this.title = title;
            this.description = description;
            this.location = location;
            this.reward = reward;
            this.id = id;
            this.times = times;
        } else {
            this.title = title.title;
            this.description = title.description;
            this.location = title.location;
            this.reward = title.reward;
            this.id = title.id;
            this.times = title.times;
        }
    }
    /**
     * 完成一次任务
     * @param id 任务ID
     */
    static tryDone(id: string): void {
        let index: number = -1;
        NEEDTODO.forEach((v, idx) => {
            if (v.id() == id) index = idx;
        })
        if (index == -1) return;
        if (NEEDTODO[index].done()) return;
        // 找到对应的任务，并+1进度，如果不在DONE任务中，则添加到DONE任务中
        let flag: boolean = false;
        DONETasks.forEach((v, idx) => {
            if (v.id() == id) {
                DONETasks[idx].doTimes += 1;
                index = idx;
                flag = true;
                return;
            }
        })
        if (!flag) {
            tasks.forEach((v, idx) => {
                if (v.id == id) {
                    DONETasks.push(new TaskMap(idx, 1));
                    index = DONETasks.length - 1;
                    return;
                }
            })
        }
        saveData();
        if (DONETasks[index].done()) {
            mkToast("任务", "任务完成", `<p>你已经成功完成了任务：${DONETasks[index].title()}</p>`, ["去看看"])
                .then((res) => {
                    if (res == 0) {
                        update(Folder.home());
                    }
                });
        }
        updateNeedTODOTasks();
        return;
    }
    /**
     * 是否完成任务
     * @param doTimes 完成任务的次数
     * @returns 结果
     */
    done(doTimes: number): boolean {
        return doTimes >= this.times;
    }
}

/**
 * 权限管理类
 * @member pwdNum 允许创建的最大密码数量
 * @member folderNum 允许创建的最大文件夹数量
 * @member canUseBin 是否允许使用回收站
 * @member canMove 是否允许移动文件
 * @member canSearch 是否允许使用搜索功能
 * @member canLock 是否允许加二级锁
 * @member canUseSetting 是否允许使用设置功能
 */
class Permission {
    pwdNum: number;
    folderNum: number;
    canUseBin: boolean;
    canMove: boolean;
    canSearch: boolean;
    canLock: boolean;
    constructor(pwdNum: number, folderNum: number, canUseBin: boolean, canMove: boolean, canSearch: boolean, canLock: boolean) {
        this.pwdNum = pwdNum;
        this.folderNum = folderNum;
        this.canUseBin = canUseBin;
        this.canMove = canMove;
        this.canSearch = canSearch;
        this.canLock = canLock;
    }
    /**
     * 是否可以添加密码
     * @param alreadyHave 已经拥有的密码数量
     * @returns 结果
     */
    canAddPwd(alreadyHave: number): boolean {
        if (this.pwdNum == -1) return true;
        else return this.pwdNum >= alreadyHave + 1;
    }
    /**
     * 是否可以添加文件夹
     * @param alreadyHave 已经拥有的文件夹数量
     * @returns 结果
     */
    canAddFolder(alreadyHave: number): boolean {
        if (this.folderNum == -1) return true;
        else return this.folderNum >= alreadyHave + 1;
    }
}
/**
 * 用户组类
 * @member name 用户组名称
 * @member description 用户组介绍
 * @member needLevel 用户组所需等级
 */
class UserGroup {
    name: string;
    description: string;
    permission: Permission;
    needLevel: number;
    constructor(name: string | UserGroup, description: string = "", needLevel: number = 0, permission: Permission = new Permission(0, 0, false, false, false, false)) {
        if (typeof name == "string") {
            this.name = name;
            this.description = description;
            this.needLevel = needLevel;
            this.permission = permission;
        }
        else {
            this.name = name.name;
            this.description = name.description
            this.needLevel = name.needLevel;
            this.permission = name.permission;
        }
    }
}

/**储存任务的加密形式 */
type TaskMapCrypto = { task: string, doTimes: string, fulfilled: string };
/**
 * 任务记录类
 * @member task 任务在全局数组{@linkcode tasks}中的索引
 * @member doTimes 完成任务的次数
 * @member fulfilled 是否获取了奖励
 */
class TaskMap { // 任务记录
    private task: number;
    doTimes: number;
    fulfilled: boolean;
    constructor(task: number | TaskMap, doTimes?: number, fulfilled?: boolean) {
        if (typeof task == "number") {
            this.task = task;
            this.doTimes = doTimes || 0;
            this.fulfilled = fulfilled || false;
        }
        else {
            this.task = task.task;
            this.doTimes = task.doTimes;
            this.fulfilled = task.fulfilled;
        }
    }
    /**
     * 加密任务记录
     * @param key 密钥
     * @returns 加密结果
     */
    enc(key: string): TaskMapCrypto {
        return {
            task: Cryp.encrypt(this.task.toString(), key),
            doTimes: Cryp.encrypt(this.doTimes.toString(), key),
            fulfilled: Cryp.encrypt(this.fulfilled ? "T" : "F", key)
        };
    }
    /**
     * 解密任务记录
     * @param obj 加密的任务记录
     * @param key 密钥
     * @returns 解密结果
     */
    static dec(obj: TaskMapCrypto, key: string): TaskMap {
        return new TaskMap(
            parseInt(Cryp.decrypt(obj.task, key)),
            parseInt(Cryp.decrypt(obj.doTimes, key)),
            Cryp.decrypt(obj.fulfilled, key) == "T" ? true : false
        );
    }
    /**
     * 是否完成任务
     * @returns 结果
     */
    done() {
        return this.doTimes >= tasks[this.task].times
    }
    /**
     * @returns 任务标题
     */
    title(): string {
        return tasks[this.task].title;
    }
    /**
     * @returns 任务描述
     */
    description(): string {
        return tasks[this.task].description;
    }
    /**
     * @returns 完成任务需要的位置
     */
    location(): Folder | null {
        return tasks[this.task].location;
    }
    /**
     * @returns 任务奖励
     */
    reward(): number {
        return tasks[this.task].reward;
    }
    /**
     * @returns 任务ID
     */
    id(): string {
        return tasks[this.task].id;
    }
    /**
     * @returns 任务完成的需要次数
     */
    times(): number {
        return tasks[this.task].times;
    }
}

const tasks: Array<Task> = [
    new Task("初出茅庐", "创建你的第一个密码。你可以在主界面通过“添加密码”按钮来添加一个密码。", Folder.root(), 1000),
    new Task("好事成双", "创建你的两个密码。", Folder.root(), 1000, 2),
    new Task("密码的产后护理", "修改一次密码。可以在主界面点击密码的右下角工具栏的编辑图标（右起第一个）来编辑密码。", Folder.root(), 500),
    new Task("例行检查", "查看一次密码的详情。可以在主界面直接点击密码来查看密码的详情。", Folder.root(), 500),
    new Task("安全密码养成记", "创建或者修改一个密码，使其成为一个没有安全风险的密码。安全性提示可以在详情页面中查询，你可以尝试使用添加密码页面中的“随机生成一个高强度的密码”功能。", Folder.root(), 1000),
    new Task("密码清理，双倍给力！", "删除两次密码。可以在主界面点击密码的右下角工具栏的删除图标（右起第二个）来删除密码。", Folder.root(), 500, 2),
    new Task("密码复活术", "恢复一次密码。可以在回收站界面点击密码的右下角工具栏的恢复功能来恢复密码。", Folder.bin(), 1000),
    new Task("密码清除？不留痕迹！", "彻底删除一次密码。可以在回收站界面点击密码的右下角工具栏的删除功能来彻底删除密码。", Folder.bin(), 500),
    new Task("文件夹，你好！", "创建你的第一个文件夹。可以在主界面点击右上角工具栏的新建文件夹功能来添加一个文件夹。", Folder.root(), 1000),
    new Task("文件夹改名记", "给你的文件夹进行一次重命名。可以在主界面点击文件夹右下角工具栏的重命名图标来重命名一个文件夹。", Folder.root(), 500),
    new Task("新世界", "尝试进入一个文件夹。你可以通过在主界面直接点击一个文件夹来进入它。", Folder.root(), 500),
    new Task("快速穿梭", "尝试通过点击主页面顶端“当前位置”中的文件夹名字实现快速移动。温馨提示：在根目录下，“当前位置”模块会被隐藏，你可以进入任意一个文件夹来完成任务。", Folder.root(), 500),
    new Task("幻影显形", "将你的一个密码或文件夹使用鼠标拖拽到另外一个文件夹之中。", Folder.root(), 1000),
    new Task("文件向上冲", "将你的一个密码或文件夹上移。你可以使用鼠标将其拖拽到右侧的“拖拽到此上移到……”。", Folder.root(), 1000),
    new Task("文件大扫除", "尝试批量删除文件。你可以在主界面点击右上角工具栏的选择功能，在选择了合适的文件后，再次点击右上角工具栏的删除图标。", Folder.root(), 1000),
    new Task("选择操作，轻松掌控！", "尝试批量彻底删除或恢复文件。你可以在回收站界面点击右上角工具栏的选择功能，在选择了合适的文件后，再次点击右上角工具栏的删除或恢复功能。", Folder.bin(), 500),
    new Task("文件搬运大法", `<p style="text-indent: 2em">尝试粘贴或移动文件。</p>
        <p style="text-indent: 2em">总体分成下面几步：</p>
        <p style="text-indent: 2em">1. 在主界面点击右上角工具栏的选择功能，在选择了合适的文件后，再次点击右上角工具栏的复制图标。</p>
        <p style="text-indent: 2em">2. 更改位置，可以通过进入文件夹或点击右上角工具栏的上移图标。</p>
        <p style="text-indent: 2em">3. 点击右上角工具栏的粘贴或移动功能。</p>
        <p style="text-indent: 2em">请注意：两者都会使得当前目录下出现你所复制的文件，但粘贴会在当前文件夹下创建一个新的文件，而移动会将文件移动到当前文件夹下。</p>`, Folder.root(), 1500),
    new Task("密码侦探", "尝试搜索功能。搜索可以帮助你快速地查找密码或文件夹。你可以在主界面点击右上角工具栏的搜索图标，然后输入你想要搜索的内容。", Folder.search(), 500),
    new Task("妈妈再也不用担心我密码泄露啦！", "设置访问密钥。你可以在设置界面设置访问密钥。如果你设置了访问密钥，每一次访问你都需要填写，你也可以选中“记住密码”来让程序自动填写。", Folder.setting(), 500),
    new Task("双重加密，双重保护", "设置二级锁。你可以在一个文件夹中点击右上角的“加密”图标，这样就可以给这个文件夹加设二级锁。你可以通过文件夹左下角的图标来知晓加密状态。对于已经被解锁的文件夹，点击“已解锁”图标可以重新加密文件夹。", Folder.root(), 500),
]

const userGroups: Array<UserGroup> = [
    new UserGroup(
        "新进用户",
        "获得一些基础功能",
        1,
        new Permission(
            3, 0, false, false, false, false
        )
    ),
    new UserGroup(
        "初级用户",
        "获得更多的密码额度，解锁使用回收站的权限",
        2,
        new Permission(
            5, 0, true, false, false, false
        )
    ),
    new UserGroup(
        "中级用户",
        "解锁使用文件夹的权限",
        3,
        new Permission(
            5, 2, true, false, false, false
        )
    ),
    new UserGroup(
        "高级用户",
        "解锁移动文件的权限",
        4,
        new Permission(
            5, 2, true, true, false, false
        )
    ),
    new UserGroup(
        "银卡用户",
        "获得更多配额",
        5,
        new Permission(
            10, 5, true, true, false, false
        )
    ),
    new UserGroup(
        "金卡用户",
        "解锁搜索文件的权限",
        6,
        new Permission(
            10, 5, true, true, true, false
        )
    ),
    new UserGroup(
        "钻石用户",
        "解锁二级锁的权限",
        7,
        new Permission(
            10, 5, true, true, true, true
        )
    ),
    new UserGroup(
        "元老",
        "文件的创建将无配额限制",
        8,
        new Permission(
            -1, -1, true, true, true, true
        )
    )
]

/**
 * 获取当前用户组
 * @returns 当前用户组
 */
function getCurrentUserGroup(): UserGroup {
    for (let i = 0; i < userGroups.length; i++) {
        if (userGroups[i].needLevel == level) {
            return userGroups[i];
        }
    }
    return userGroups[userGroups.length - 1];
}
/**
 * 获取下一个用户组
 * @returns 下一个用户组，如果没有则返回null
 */
function getNextUserGroup(): UserGroup | null {
    for (let i = 0; i < userGroups.length; i++) {
        if (userGroups[i].needLevel == level + 1) {
            return userGroups[i];
        }
    }
    return null;
}

/**
 * levelMap[i]表示到达第i级所需要的经验
 */
const levelMap: Array<number> = [
    -1, //占位
    0,
    2000,
    4000,
    6000,
    8000,
    10000,
    12000,
    15000
]
/**
 * 获取在当前版本能够成为的最大等级数
 * @returns 最大等级数
 */
function getMaxLevel() {
    return levelMap.length - 1;
}

let isHasNewUserGroup: boolean = false;

/**
 * 刷新待办事项
 */
function updateNeedTODOTasks(): void {
    NEEDTODO = [];
    for (let i = 0; i < DONETasks.length; i++) {
        if (DONETasks[i].done() === false || !DONETasks[i].fulfilled) {
            NEEDTODO.push(new TaskMap(DONETasks[i]));
        }
    }
    if (NEEDTODO.length < 2) {
        for (let i = 0; i < tasks.length; i++) {
            let flag = false;
            for (let j = 0; j < DONETasks.length; j++) {
                if (tasks[i].id === DONETasks[j].id()) {
                    flag = true;
                    break;
                }
            }
            if (flag === false) {
                NEEDTODO.push(new TaskMap(i, 0));
                if (NEEDTODO.length >= 2) break;
            }
        }
    }
}

/**
 * 切换到“我的”页面，请不要通过此函数切换页面，而是通过{@linkcode update}
 */
function _goHome(): void {
    // 获取最首要的两件（不足两件则可以选择1件或0件）待办事项（以在tasks全局数组中的索引为排序方法）
    updateNeedTODOTasks();

    let taskHTML = ``;
    for (let i = 0; i < Math.min(NEEDTODO.length, 2); i++) {
        const finPer = Math.round(NEEDTODO[i].doTimes / NEEDTODO[i].times() * 1000) / 10;
        taskHTML += `
        <div class="card taskCard">
            <div class="card-body">
                <h5 class="card-title">${NEEDTODO[i].title()}</h5>
                <p class="card-text" style="text-indent: 2em">${NEEDTODO[i].description()}</p>
                <p class="card-text" style="text-indent: 2em">你可以获得<strong>${NEEDTODO[i].reward()}</strong>pt的经验。</p>
                <div class="progress">
                    <div class="progress-bar" role="progressbar" style="width: ${finPer}%;" aria-valuenow="${finPer}" aria-valuemin="0" aria-valuemax="100">${finPer}%</div>
                </div>
                ${NEEDTODO[i].done() ?
                `<p class="btn btn-warning" id="task${i + 1}-btn">领取奖励</p>`
                :
                `<p class="btn ${NEEDTODO[i].location() === null ? `btn-secondary` : `btn-primary`}" id="task${i + 1}-btn">${NEEDTODO[i].location() === null ? `待完成` : `去完成`}</p>`
            }
            </div>
        </div>`
    }
    let maxScore: number;
    if (level >= getMaxLevel()) maxScore = levelMap[getMaxLevel()];
    else maxScore = levelMap[level + 1];

    let scorePercent = Math.min(Math.round(score / maxScore * 1000) / 10, 100);
    let nowUserGroup = getCurrentUserGroup();
    const signUpDayCount = new Date(Number(signUpTime))
    signUpDayCount.setHours(0, 0, 0, 0);
    const nowDayCount = new Date()
    signUpDayCount.setHours(0, 0, 0, 0);
    content!.innerHTML = `
    <div class="title">我的</div>
    <div class="card taskCard">
        <div class="card-body">
            <p class="card-text">
                仓库名称：
                <span id="repo-name-show">${repoName}</span>
                <input type="test" value="${repoName}" style="display: none" id="repo-name-input" />
                <img class="icon" id="edit-repo-name" style="margin-left: 10px; margin-bottom:7px" src="./resources/edit.png" data-bs-toggle="tooltip" data-bs-placement="top" title="修改仓库名称">
            </p>
        </div>
    </div>
    <div class="accordion" id="mainAccordion">
        <div class="accordion-item" id="backstory">
            <h2 class="accordion-header" id="accordionHeadingForBackstory">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseForBackstory" aria-expanded="true" aria-controls="collapseForBackstory">
                玩法介绍
                </button>
            </h2>
            <div id="collapseForBackstory" class="accordion-collapse collapse" aria-labelledby="accordionHeadingForBackstory" data-bs-parent="#mainAccordion">
                <div class="accordion-body">
                    <p>起始的时候，你是新进用户，可以做的事情比较少，你可以通过完成任务，提升用户组，来提升自己的权限。如果你在探索时，突然弹出对话框，且标题为“权限不足”时，快去提升用户组吧。</p>
                </div>
            </div>
        </div>
        <div class="accordion-item" id="userGroup">
            <h2 class="accordion-header" id="accordionHeadingForUserGroup">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseForUserGroup" aria-expanded="true" aria-controls="collapseForUserGroup">
                用户组<span class="badge bg-danger invisible" style="margin-left:7px;" id="badgeNew">New!</span>
                </button>
            </h2>
            <div id="collapseForUserGroup" class="accordion-collapse collapse" aria-labelledby="accordionHeadingForUserGroup" data-bs-parent="#mainAccordion">
                <div class="accordion-body">
                    <p><strong>当前用户组</strong>：${nowUserGroup.name}</p>
                    <p><strong>密码限额</strong>：${nowUserGroup.permission.pwdNum == -1 ? `无限制` : `${nowUserGroup.permission.pwdNum}个密码，已创建${pwdList.length}个`}</p>
                    <p><strong>文件夹限额</strong>：${nowUserGroup.permission.folderNum == -1 ? `无限制` : `${nowUserGroup.permission.folderNum}个文件夹，已创建${folderList.length}个`}</p>
                    <p><strong>回收站</strong>：${nowUserGroup.permission.canUseBin ? `可以使用` : `禁止使用`}</p>
                    <p><strong>移动文件</strong>：${nowUserGroup.permission.canMove ? `可以使用` : `禁止使用`}</p>
                    <p><strong>搜索文件</strong>：${nowUserGroup.permission.canSearch ? `可以使用` : `禁止使用`}</p>
                    <p><strong>二级锁</strong>：${nowUserGroup.permission.canLock ? `可以使用` : `禁止使用`}</p>
                </div>
            </div>
        </div>
    </div>
    <div class="card taskCard">
        <div class="card-body">
            <p class="card-text">当前等级：Level ${level}</p>
            <p class="card-text">当前用户组：${getCurrentUserGroup().name}</p>
            <p class="card-text">你获得的经验：<strong>${score}</strong>/<strong>${maxScore}</strong>pt</p>
            ${level < getMaxLevel() ? `
                <p class="card-text">升级还需要：<strong>${Math.max(maxScore - score, 0)}</strong>pt</p>
                <p class="card-text">升级后的用户组：${getNextUserGroup()!.name}</p>
                <p class="card-text">提升后的用户组效果：${getNextUserGroup()!.description}</p>
            `: ``}
            <div class="progress">
                <div class="progress-bar" role="progressbar" style="width: ${scorePercent}%;" aria-valuenow="${scorePercent}" aria-valuemin="0" aria-valuemax="100">${scorePercent}%</div>
            </div>
            ${level < getMaxLevel() ? `${scorePercent >= 100 ?
            `<p class="btn btn-warning" id="score-btn">领取奖励</p>`
            :
            `<p class="btn btn-secondary" id="score-btn">待完成</p>`
            }` : `<p class="btn btn-secondary">已完成</p>`}
        </div>
    </div>
    ${taskHTML}
    <div class="card taskCard">
            <div class="card-body">
                <h5 class="card-title">数据统计</h5>
                <p class="card-text" style="text-indent: 2em">你注册的时间是：${getReadableTime(signUpTime)}，今天是你注册的第${Math.floor((nowDayCount.getTime() - signUpDayCount.getTime()) / (1000 * 60 * 60 * 24)) + 1}天。</p>
                <p class="card-text" style="text-indent: 2em">你一共创建了${pwdList.length}个密码，其中有${pwdList.filter((_, idx) => checkSafety(idx) === "").length}个是很安全的。</p>
                <p class="card-text" style="text-indent: 2em">你一共创建了${folderList.length}个文件夹，其中有${folderList.filter((v) => v.lock !== null).length}个是加密的。</p>
                <p class="card-text" style="text-indent: 2em">你的回收站中还有${binItem.length}个项目。</p>
                <p class="card-text" style="text-indent: 2em">你一共完成了${DONETasks.filter((v) => v.fulfilled).length}个任务。</p>
            </div>
        </div>
    `;
    updateTooltip();
    document.querySelector("#edit-repo-name")?.addEventListener("click", (e) => {
        const show = document.querySelector("#repo-name-show") as HTMLElement;
        const input = document.querySelector("#repo-name-input") as HTMLInputElement;
        if (show.style.display != "none") {
            show.style.display = "none";
            input.style.display = "inline";
            (e.target as HTMLElement).style.display = "none";
            input.value = repoName;
            input.focus();
            input.select();
            input.addEventListener("keydown", (e) => {
                if (e.key == "Enter" && !e.isComposing) {
                    input.blur();
                }
            })
            input.addEventListener("blur", () => {
                input.style.display = "none";
                show.style.display = "inline";
                repoName = input.value;
                show.innerHTML = repoName;
                (e.target as HTMLElement).style.display = "inline";
                saveData();
            })
        }
    })
    const newWarning = document.querySelector("#badgeNew");
    if (isHasNewUserGroup) {
        newWarning?.classList.remove("invisible");
    } else {
        newWarning?.classList.add("invisible");
    }
    document.querySelector("#userGroup")?.addEventListener("click", () => {
        newWarning?.classList.add("invisible");
        isHasNewUserGroup = false;
    })
    if (NEEDTODO.length > 0) document.querySelector("#task1-btn")?.addEventListener("click", () => {
        if (NEEDTODO[0].done()) {
            score += NEEDTODO[0].reward();
            mkDialog("领取成功", `你已经成功领取了<strong>${NEEDTODO[0].reward()}</strong>pt的经验。`);
            for (let i = 0; i < DONETasks.length; i++) {
                if (DONETasks[i].id() === NEEDTODO[0].id()) {
                    DONETasks[i].fulfilled = true;
                    break;
                }
            }
            init(Folder.home());
            return;
        }
        if (NEEDTODO[0].location() !== null) update(NEEDTODO[0].location()!);
    })
    if (NEEDTODO.length > 1) document.querySelector("#task2-btn")?.addEventListener("click", () => {
        if (NEEDTODO[1].done()) {
            score += NEEDTODO[1].reward();
            mkDialog("领取成功", `你已经成功领取了<strong>${NEEDTODO[1].reward()}</strong>pt的经验。`);
            for (let i = 0; i < DONETasks.length; i++) {
                if (DONETasks[i].id() === NEEDTODO[1].id()) {
                    DONETasks[i].fulfilled = true;
                    break;
                }
            }
            init(Folder.home());
            return;
        }
        if (NEEDTODO[1].location() !== null) update(NEEDTODO[1].location()!);
    })
    if (scorePercent >= 100 && level < getMaxLevel()) {
        document.querySelector("#score-btn")?.addEventListener("click", () => {
            level++;
            mkDialog("升级成功", `你已经成功升级到Level ${level}，进入了新的用户组。`);
            isHasNewUserGroup = true;
            init(Folder.home());
        })
    }
    content?.scrollTo(pagePos.home)
}