"use strict";
class Task {
    constructor(title, description = "", location = null, reward = 0, times = 1, id = (typeof title === "string" ? title : title.id)) {
        this.doTimes = 0;
        this.type = Type.Task;
        if (typeof title == "string") {
            this.title = title;
            this.description = description;
            this.location = location;
            this.reward = reward;
            this.id = id;
            this.times = times;
        }
        else {
            this.title = title.title;
            this.description = title.description;
            this.location = title.location;
            this.reward = title.reward;
            this.id = title.id;
            this.times = title.times;
            this.doTimes = title.doTimes;
        }
    }
    fitNumber() {
        this.reward = Number(this.reward);
        this.times = Number(this.times);
        this.doTimes = Number(this.doTimes);
    }
    static tryDone(id) {
        let index = -1;
        if (TODOTasks.length >= 1 && TODOTasks[0].id === id && !TODOTasks[0].done())
            index = 0;
        else if (TODOTasks.length >= 2 && TODOTasks[1].id === id && !TODOTasks[1].done())
            index = 1;
        else
            return false;
        TODOTasks[index].doTimes++;
        saveData();
        if (TODOTasks[index].done()) {
            mkToast("任务", "任务完成", `<p>你已经成功完成了任务：${TODOTasks[index].title}</p>`, ["去看看"])
                .then((res) => {
                if (res == 0) {
                    update(Folder.home());
                }
            });
        }
        return true;
    }
    done() {
        return this.doTimes >= this.times;
    }
}
const tasks = [
    new Task("初出茅庐", "创建你的第一个密码。你可以在主界面通过“添加密码”按钮来添加一个密码。", Folder.root(), 100),
    new Task("好事成双", "创建你的两个密码。", Folder.root(), 100, 2),
    new Task("密码的产后护理", "修改一次密码。可以在主界面点击密码的右下角工具栏的编辑图标（右起第一个）来编辑密码。", Folder.root(), 50),
    new Task("例行检查", "查看一次密码的详情。可以在主界面直接点击密码来查看密码的详情。", Folder.root(), 50),
    new Task("安全密码养成记", "创建或者修改一个密码，使其成为一个没有安全风险的密码。安全性提示可以在详情页面中查询，你可以尝试使用添加密码页面中的“随机生成一个高强度的密码”功能。", Folder.root(), 100),
    new Task("密码清理，双倍给力！", "删除两次密码。可以在主界面点击密码的右下角工具栏的删除图标（右起第二个）来删除密码。", Folder.root(), 50, 2),
    new Task("密码复活术", "恢复一次密码。可以在最近删除界面点击密码的右下角工具栏的恢复功能来恢复密码。", Folder.bin(), 100),
    new Task("密码清除？不留痕迹！", "彻底删除一次密码。可以在最近删除界面点击密码的右下角工具栏的删除功能来彻底删除密码。", Folder.bin(), 50),
    new Task("文件夹，你好！", "创建你的第一个文件夹。可以在主界面点击右上角工具栏的新建文件夹功能来添加一个文件夹。", Folder.root(), 100),
    new Task("文件夹改名记", "给你的文件夹进行一次重命名。可以在主界面点击文件夹右下角工具栏的重命名图标来重命名一个文件夹。", Folder.root(), 50),
    new Task("新世界", "尝试进入一个文件夹。你可以通过在主界面直接点击一个文件夹来进入它。", Folder.root(), 50),
    new Task("幻影显形", "将你的一个密码或文件夹使用鼠标拖拽到另外一个文件夹之中。", Folder.root(), 100),
    new Task("文件向上冲", "将你的一个密码或文件夹上移。你可以使用鼠标将其拖拽到最下方的“拖拽到此上移到……”。", Folder.root(), 100),
    new Task("文件大扫除", "尝试批量删除文件。你可以在主界面点击右上角工具栏的选择功能，在选择了合适的文件后，再次点击右上角工具栏的删除图标。", Folder.root(), 100),
    new Task("选择操作，轻松掌控！", "尝试批量彻底删除或恢复文件。你可以在最近删除界面点击右上角工具栏的选择功能，在选择了合适的文件后，再次点击右上角工具栏的删除或恢复功能。", Folder.bin(), 50),
    new Task("文件搬运大法", `<p style="text-indent: 2em">尝试粘贴或移动文件。</p>
        <p style="text-indent: 2em">总体分成下面几步：</p>
        <p style="text-indent: 2em">1. 在主界面点击右上角工具栏的选择功能，在选择了合适的文件后，再次点击右上角工具栏的复制图标。</p>
        <p style="text-indent: 2em">2. 更改位置，可以通过进入文件夹或点击右上角工具栏的上移图标。</p>
        <p style="text-indent: 2em">3. 点击右上角工具栏的粘贴或移动功能。</p>
        <p style="text-indent: 2em">请注意：两者都会使得当前目录下出现你所复制的文件，但粘贴会在当前文件夹下创建一个新的文件，而移动会将文件移动到当前文件夹下。</p>`, Folder.root(), 200),
    new Task("妈妈再也不用担心我密码泄露啦！", "设置访问密钥。你可以在设置界面设置访问密钥。如果你设置了访问密钥，每一次访问你都需要填写，你也可以选中“记住密码”来让程序自动填写。", Folder.setting(), 100),
];
let TODOTasks = [];
function goHome() {
    var _a, _b, _c;
    let taskHTML = ``;
    for (let i = 0; i < Math.min(TODOTasks.length, 2); i++) {
        const finPer = Math.round(TODOTasks[i].doTimes / TODOTasks[i].times * 1000) / 10;
        taskHTML += `
        <div class="card taskCard">
            <div class="card-body">
                <h5 class="card-title">${TODOTasks[i].title}</h5>
                <p class="card-text" style="text-indent: 2em">${TODOTasks[i].description}</p>
                <p class="card-text" style="text-indent: 2em">你可以获得${TODOTasks[i].reward}kgCO₂e的碳排放配额。</p>
                <div class="progress">
                    <div class="progress-bar" role="progressbar" style="width: ${finPer}%;" aria-valuenow="${finPer}" aria-valuemin="0" aria-valuemax="100">${finPer}%</div>
                </div>
                ${TODOTasks[i].done() ?
            `<p class="btn btn-warning" id="task${i + 1}-btn">领取奖励</p>`
            :
                `<p class="btn ${TODOTasks[i].location === null ? `btn-secondary` : `btn-primary`}" id="task${i + 1}-btn">${TODOTasks[i].location === null ? `待完成` : `去完成`}</p>`}
            </div>
        </div>`;
    }
    let maxScore, levelHtml = "";
    if (level == 1) {
        maxScore = 350;
    }
    else if (level == 2) {
        maxScore = 700;
    }
    else if (level == 3) {
        maxScore = 1050;
    }
    else if (level == 4) {
        maxScore = 1450;
    }
    else {
        maxScore = 1450;
    }
    if (level >= 1) {
        levelHtml = `
        <p>你需要获取四枚铭牌，拯救世界。</p>
        `;
    }
    if (level >= 2) {
        levelHtml += `
        <br>
        <p>你成功获取到了永恒冰核。</p>
        <p>永恒冰核：冻结数据污染引发的熵增效应，逆转现实世界冰川消融。</p>
        <p>北极圈永夜下的观测站正发出垂死哀鸣，量子服务器组像一具被剖开的机械巨兽，暗红数据流从它千疮百孔的散热鳍片中喷涌而出。你踩着冻结了液态氮的地面艰难前行，防护服关节处的润滑剂早已凝固成胶状。当第99999次密码碰撞警报撕裂空气时，整座建筑突然倾斜——黑客植入的蠕虫病毒正将地基转化为虚数坐标。你扑向中央控制台，手掌在零下70度的钛合金密码匣上烙出血痂。冰核觉醒的瞬间，蓝白色铭文如极光般穿透穹顶，所有被污染的账户在元宇宙凝结成千米高的代码冰川，黑客的惨叫随着熵增监测仪归零的蜂鸣戛然而止。七十二小时后，格陵兰冰盖上出现了二十二世纪以来第一朵自然形成的雪晶。</p>
        `;
    }
    if (level >= 3) {
        levelHtml += `
        <br>
        <p>你成功获取到了星辰穹顶。</p>
        <p>星辰穹顶：构建宇宙级防御网，抵御大规模数据垃圾侵袭。</p>
        <p>近地轨道漂浮的防火墙残骸折射着夕阳，如同被撕碎的星环。你拽着碳纳米绳荡过数据坟场时，突然被某种引力捕获——暗焰组织培育的「噬界蠕虫」正张开彩虹状的口器，它的每一圈齿环都是旋转的ipv9黑洞地址。你将星辰铭牌插入脊椎接口的刹那，整个太阳系的备用服务器同时亮起。银河级加密协议从猎户座悬臂奔涌而来，在人类数字疆域外编织出由超立方体构成的防护网。那些吞噬卫星的病毒云团撞上防御层时，竟绽放出超新星爆炸般的银色火花。此刻元宇宙所有用户都听见了奇点坍缩的轰鸣，东京涩谷巨蛋体育馆的全息天幕上，浮现出用二十世纪摩尔斯电码写的公告：「地球根目录完成镜像备份」。</p>
        `;
    }
    if (level >= 4) {
        levelHtml += `
        <br>
        <p>你成功获取到了文明火种。</p>
        <p>文明火种：通过全球用户生物密钥重启生态数据库。</p>
        <p>南极洲的共识石碑在极光中震颤，全世界用户正将生物密钥刺入自己锁骨下方的数据端口。你看见挪威语言学家的视网膜投影出卢恩符文，孟加拉渔夫哼唱的古老民谣转化为拓扑密码，甚至国际空间站传来的失重心电图都在重组为斐波那契数列。当最后一位火星殖民者切断自己与地核量子计算机的神经链接时，所有数据流在南纬90度汇聚成通天火柱。黑色冰壳碎裂的轰鸣中，你徒手挖开滚烫的玄武岩地面——生态数据库深处，被熵增污染的北极熊基因链正被金色光点重新编译。忽然有冰凉的触感掠过手背，一头由全息极光凝成的幼熊虚影，正用二维码斑纹的爪子轻触你残破的防护手套。</p>
        `;
    }
    if (level >= 5) {
        levelHtml += `
        <br>
        <p>你成功获取到了虚空根系。</p>
        <p>虚空根系：本质是一枚暗物质驱动的文明复苏引擎。它将数据污染中的无序熵增逆向转化为有序的生命能量。</p>
        <p>赤道海底的暗物质反应堆正在尖叫，八千条光缆从马里亚纳海沟延伸而出，在岩浆与数字洪流中扭结成发光树根。你潜入沸腾的硅酸盐海洋时，防护面具显示外界温度足以汽化钨钢——直到触碰到那枚由反物质雕刻的铭牌。激活瞬间，所有被数据污染腐蚀的硬件开始疯狂生长，东京塔化作钢铁红杉刺破云层，迪拜服务器农场迸发出蕨类植物的全息孢子。最震撼的是元宇宙深处，那些被"暗焰"焚毁的文明记忆竟从数据坟场抽出嫩芽：公元前图书馆的莎草纸纹理在修复埃及云端，敦煌壁画的矿物光谱重新点亮丝绸之路节点。当第一片由纳米机器人构成的金色银杏叶飘落在你掌心时，南极洲传来冰川以每秒三毫米速度逆向增长的警报声。</p>
        <p>你已经成功拯救了地球。</p>
        `;
    }
    let scorePercent = Math.round(score / maxScore * 1000) / 10;
    main.innerHTML = `
    <div class="title">我的</div>
    <div class="accordion" id="mainAccordion">
        <div class="accordion-item" id="backstory">
            <h2 class="accordion-header" id="accordionHeadingForBackstory">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseForBackstory" aria-expanded="true" aria-controls="collapseForBackstory">
                背景故事
                </button>
            </h2>
            <div id="collapseForBackstory" class="accordion-collapse collapse" aria-labelledby="accordionHeadingForBackstory" data-bs-parent="#mainAccordion">
                <div class="accordion-body">
                    <div class="title">密码绿洲计划</div>
                    <p>公元2277年，全球数据污染危机爆发。在元宇宙全面普及的时代，每一次密码泄露都会引发连锁反应——量子服务器过载产生的熵增效应，竟导致真实世界的冰川消融。黑客组织"暗焰"肆意制造数据垃圾，北极观测站检测到每10万次密码碰撞就会释放相当于燃烧1吨煤炭的虚拟碳排放。</p>
                    <p>联合国紧急启动「密码绿洲」计划，将全球用户的密码管理系统改造成生态防护网络。你作为第7代密码守林人，肩负拯救源宇宙和地球着使命。
                    <p>人类最后的希望藏在四块神秘铭牌中：「永恒冰核」，能冻结被黑客入侵的账户；「星辰穹顶」，可为整个文件夹施加黑洞级防护；而传说中由全世界用户共同铸造的「文明火种」和「虚空根系」，将重启地球生态平衡...</p>
                    <p>你需要拿到这四块铭牌，拯救地球。</p>
                </div>
            </div>
        </div>
        <div class="accordion-item" id="gameplay">
            <h2 class="accordion-header" id="accordionHeadingForGameplay">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseForGameplay" aria-expanded="true" aria-controls="collapseForGameplay">
                游戏玩法
                </button>
            </h2>
            <div id="collapseForGameplay" class="accordion-collapse collapse" aria-labelledby="accordionHeadingForGameplay" data-bs-parent="#mainAccordion">
                <div class="accordion-body">
                    <p>通过完成任务生成「数据光合作用」，获得碳排放额度，获取全部的四块铭牌</p>
                </div>
            </div>
        </div>
        <div class="accordion-item" id="levelLog">
            <h2 class="accordion-header" id="accordionHeadingForLevelLog">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseForLevelLog" aria-expanded="true" aria-controls="collapseForLevelLog">
                升级报告
                </button>
            </h2>
            <div id="collapseForLevelLog" class="accordion-collapse collapse" aria-labelledby="accordionHeadingForLevelLog" data-bs-parent="#mainAccordion">
                <div class="accordion-body">
                    ${levelHtml}
                </div>
            </div>
        </div>
    </div>
    <div class="card taskCard">
        <div class="card-body">
            <p class="card-text">你获得的碳排放额度：${score} / ${maxScore}kgCO₂e</p>
            ${level < 5 ? `<p class="card-text">升级还需要：${Math.max(maxScore - score, 0)}kgCO₂e</p>` : ``}
            <div class="progress">
                <div class="progress-bar" role="progressbar" style="width: ${scorePercent}%;" aria-valuenow="${scorePercent}" aria-valuemin="0" aria-valuemax="100">${scorePercent}%</div>
            </div>
            ${level < 5 ? `${scorePercent >= 100 ?
        `<p class="btn btn-warning" id="score-btn">领取奖励</p>`
        :
            `<p class="btn btn-secondary" id="score-btn">待完成</p>`}` : `<p class="btn btn-secondary">已完成</p>`}
        </div>
    </div>
    ${taskHTML}
    `;
    if (TODOTasks.length > 0)
        (_a = document.querySelector("#task1-btn")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
            if (TODOTasks[0].done()) {
                score += TODOTasks[0].reward;
                mkDialog("领取成功", `你已经成功领取了${TODOTasks[0].reward}kgCO₂e的碳排放配额。`);
                TODOTasks.splice(0, 1);
                saveData();
                update(Folder.home());
                return;
            }
            if (TODOTasks[0].location !== null)
                update(TODOTasks[0].location);
        });
    if (TODOTasks.length > 1)
        (_b = document.querySelector("#task2-btn")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
            if (TODOTasks[1].done()) {
                score += TODOTasks[1].reward;
                mkDialog("领取成功", `你已经成功领取了${TODOTasks[1].reward}kgCO₂e的碳排放配额。`);
                TODOTasks.splice(1, 1);
                saveData();
                update(Folder.home());
                return;
            }
            if (TODOTasks[1].location !== null)
                update(TODOTasks[1].location);
        });
    if (scorePercent >= 100 && level < 5) {
        (_c = document.querySelector("#score-btn")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => {
            level++;
            mkDialog("升级成功", `你已经成功升级到Level ${level}，在升级报告中查看更多。`);
            saveData();
            update(Folder.home());
        });
    }
}
