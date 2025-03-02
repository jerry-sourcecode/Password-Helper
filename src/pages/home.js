"use strict";
class Task {
    constructor(title, description = "", location = null, reward = 0, times = 1, id = (typeof title === "string" ? title : title.id)) {
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
        }
    }
    static tryDone(id) {
        let index = -1;
        if (TODOTasks.length >= 1 && TODOTasks[0].id() === id && !TODOTasks[0].done())
            index = 0;
        else if (TODOTasks.length >= 2 && TODOTasks[1].id() === id && !TODOTasks[1].done())
            index = 1;
        else
            return false;
        TODOTasks[index].doTimes++;
        saveData();
        if (TODOTasks[index].done()) {
            mkToast("任务", "任务完成", `<p>你已经成功完成了任务：${TODOTasks[index].title()}</p>`, ["去看看"])
                .then((res) => {
                if (res == 0) {
                    update(Folder.home());
                }
            });
        }
        return true;
    }
    done(doTimes) {
        return doTimes >= this.times;
    }
}
class Nameplate {
    constructor(name, source = "", use = "", backstory = "", log = "", needLevel = 0) {
        if (typeof name == "string") {
            this.name = name;
            this.source = source;
            this.use = use;
            this.backstory = backstory;
            this.log = log;
            this.needLevel = needLevel;
        }
        else {
            this.name = name.name;
            this.source = name.source;
            this.use = name.use;
            this.backstory = name.backstory;
            this.log = name.log;
            this.needLevel = name.needLevel;
        }
    }
}
class TaskMap {
    constructor(task, doTimes) {
        if (typeof task == "number") {
            this.task = task;
            this.doTimes = doTimes || 0;
        }
        else {
            this.task = task.task;
            this.doTimes = task.doTimes;
        }
    }
    enc(key) {
        return {
            task: cryp.encrypt(this.task.toString(), key),
            doTimes: cryp.encrypt(this.doTimes.toString(), key)
        };
    }
    static dec(obj, key) {
        return new TaskMap(parseInt(cryp.decrypt(obj.task, key)), parseInt(cryp.decrypt(obj.doTimes, key)));
    }
    done() {
        return this.doTimes >= tasks[this.task].times;
    }
    title() {
        return tasks[this.task].title;
    }
    description() {
        return tasks[this.task].description;
    }
    location() {
        return tasks[this.task].location;
    }
    reward() {
        return tasks[this.task].reward;
    }
    id() {
        return tasks[this.task].id;
    }
    times() {
        return tasks[this.task].times;
    }
}
const tasks = [
    new Task("初出茅庐", "创建你的第一个密码。你可以在主界面通过“添加密码”按钮来添加一个密码。", Folder.root(), 1000),
    new Task("好事成双", "创建你的两个密码。", Folder.root(), 1000, 2),
    new Task("密码的产后护理", "修改一次密码。可以在主界面点击密码的右下角工具栏的编辑图标（右起第一个）来编辑密码。", Folder.root(), 500),
    new Task("例行检查", "查看一次密码的详情。可以在主界面直接点击密码来查看密码的详情。", Folder.root(), 500),
    new Task("安全密码养成记", "创建或者修改一个密码，使其成为一个没有安全风险的密码。安全性提示可以在详情页面中查询，你可以尝试使用添加密码页面中的“随机生成一个高强度的密码”功能。", Folder.root(), 1000),
    new Task("密码清理，双倍给力！", "删除两次密码。可以在主界面点击密码的右下角工具栏的删除图标（右起第二个）来删除密码。", Folder.root(), 500, 2),
    new Task("密码复活术", "恢复一次密码。可以在最近删除界面点击密码的右下角工具栏的恢复功能来恢复密码。", Folder.bin(), 1000),
    new Task("密码清除？不留痕迹！", "彻底删除一次密码。可以在最近删除界面点击密码的右下角工具栏的删除功能来彻底删除密码。", Folder.bin(), 500),
    new Task("文件夹，你好！", "创建你的第一个文件夹。可以在主界面点击右上角工具栏的新建文件夹功能来添加一个文件夹。", Folder.root(), 1000),
    new Task("文件夹改名记", "给你的文件夹进行一次重命名。可以在主界面点击文件夹右下角工具栏的重命名图标来重命名一个文件夹。", Folder.root(), 500),
    new Task("新世界", "尝试进入一个文件夹。你可以通过在主界面直接点击一个文件夹来进入它。", Folder.root(), 500),
    new Task("快速穿梭", "尝试通过点击主页面顶端“当前位置”中的文件夹名字实现快速移动。温馨提示：在根目录下，“当前位置”模块会被隐藏，你可以进入任意一个文件夹来完成任务。", Folder.root(), 500),
    new Task("幻影显形", "将你的一个密码或文件夹使用鼠标拖拽到另外一个文件夹之中。", Folder.root(), 1000),
    new Task("文件向上冲", "将你的一个密码或文件夹上移。你可以使用鼠标将其拖拽到最下方的“拖拽到此上移到……”。", Folder.root(), 1000),
    new Task("文件大扫除", "尝试批量删除文件。你可以在主界面点击右上角工具栏的选择功能，在选择了合适的文件后，再次点击右上角工具栏的删除图标。", Folder.root(), 1000),
    new Task("选择操作，轻松掌控！", "尝试批量彻底删除或恢复文件。你可以在最近删除界面点击右上角工具栏的选择功能，在选择了合适的文件后，再次点击右上角工具栏的删除或恢复功能。", Folder.bin(), 500),
    new Task("文件搬运大法", `<p style="text-indent: 2em">尝试粘贴或移动文件。</p>
        <p style="text-indent: 2em">总体分成下面几步：</p>
        <p style="text-indent: 2em">1. 在主界面点击右上角工具栏的选择功能，在选择了合适的文件后，再次点击右上角工具栏的复制图标。</p>
        <p style="text-indent: 2em">2. 更改位置，可以通过进入文件夹或点击右上角工具栏的上移图标。</p>
        <p style="text-indent: 2em">3. 点击右上角工具栏的粘贴或移动功能。</p>
        <p style="text-indent: 2em">请注意：两者都会使得当前目录下出现你所复制的文件，但粘贴会在当前文件夹下创建一个新的文件，而移动会将文件移动到当前文件夹下。</p>`, Folder.root(), 2000),
    new Task("妈妈再也不用担心我密码泄露啦！", "设置访问密钥。你可以在设置界面设置访问密钥。如果你设置了访问密钥，每一次访问你都需要填写，你也可以选中“记住密码”来让程序自动填写。", Folder.setting(), 1000),
];
const nameplates = [
    new Nameplate("熵锁锚核", "冰层下冻结着偷盗时间的恶魔，永眠者的呼吸凝成秩序的牢笼", "生成绝对零度防火墙，将数据攻击冻结成无害冰晶", "这块冰晶打造的铭牌内封存着麦克斯韦妖算法原型，能在量子层面建立数据负熵屏障。其原型来自21世纪某位匿名密码学家遗留在极地科考站的草稿纸，当观测站发现北极圈数据熵值曲线与冰川消融速度完全吻合时，终于破解了这份用啤酒渍书写的微分方程。佩戴者可在半径十公里内形成密码沙盒，将黑客攻击转化为无害的雪花代码。", "<p>北极冰川深处，你跪在坍塌的量子观测站废墟上。暗焰组织留下的数据病毒正在啃噬服务器，冰层裂缝中渗出荧光的熵增黏液。头盔投影显示这里埋着初代守林人封存的锚核，但每靠近一步，虚拟界面的温度计就暴跌十度。</p><p>你突然意识到，真正的密钥是「静止」——当暗焰的蠕虫代码扑来时，你切断所有能源主动冻结自己。绝对寂静中，冰层裂开蛛网纹路，一枚冰蓝色六棱柱缓缓升起。那些病毒撞上铭牌瞬间凝成雪屑，飘向天际化作极光。</p>", 2),
    new Nameplate("极光棱镜", "破碎的镜子预言了第七次日落，凝视深渊者终将成为星空拼图", "折射数据污染轨迹，标记暗焰藏身坐标", "刻有十六重虹膜的银质圆盘，其原型是格陵兰岛原住民用陨铁打造的星象观测器。第3代守林人在冰芯里发现了它的量子纠缠特性——当虚拟碳排放超标时，表面会浮现极光构成的预警图腾。升级后的铭牌能通过瞳孔生物密码激活，在元宇宙投射出笼罩整个北半球的北极星坐标网，精准定位暗焰组织的数据污染源。", "<p>格陵兰冰洞内，暗焰制造的虚假极光正在诱骗科考无人机坠毁。你贴着洞壁爬行，手中辐射仪因棱镜的能量脉冲疯狂跳动。突然脚下冰层塌陷，你坠入二十米深的冰井——这里竟藏着二十二世纪的极地天文台遗址。</p><p>全息星图在头顶旋转，棱镜就嵌在坍塌的射电望远镜焦点处。但每次伸手触碰，棱镜就会分裂成七个重影。你想起谜语中的「第七次日落」，将防护服切换到黄昏光谱模式。当第七道橙光扫过时，所有幻影坍缩成实体，棱镜边缘浮现出暗焰老巢的经纬度。</p>", 3),
    new Nameplate("雷蚀龙芯", "撕裂夜幕的雷霆囚禁在青铜瞳孔，被诅咒的刀刃以背叛者的鲜血开刃", "释放数据链闪电，逆向腐蚀暗焰核心服务器", "由火山黑曜石与液态金属融合而成，表面布满龙鳞状电路纹，因过量吸收火山辐射产生变异。当暗焰组织试图用虚拟岩浆污染地壳数据时，铭牌会从地幔层召唤等离子闪电，这些闪电能顺着敌方数据链回溯烧毁主机芯片。曾有三名守林人在接触它时被反噬，付出了生命的代价发现必须以自身血液激活龙瞳——每道闪电都将携带攻击者的基因密码，确保力量永不失控。", "<p>勘察加火山口的岩浆湖沸腾着暗红色代码，这是暗焰组织用伪造的碳排放交易数据生成的虚拟熔岩。你穿着反射护甲沿火山壁下滑，手中探测仪显示龙芯嵌在湖心黑色结晶柱里。十二台机械守卫突然苏醒，它们的激光束扫过处岩浆炸起十米高。</p><p>你冒险跳入岩浆，护甲在高温中剥离成纳米虫群。当赤裸的右手抓住龙芯时，那些岩浆突然凝固成紫黑色晶体——铭牌在吸收整座火山的算力。机械守卫的炮口调转对准自己，它们的钢铁身躯爬满枝状闪电，最终连同火山服务器一起坍缩成焦黑的硅化木。</p>", 4),
    new Nameplate("时溯沙漏", "倒流的沙粒淹死了守钟人的影子，过去与未来在溺亡者的血管里重逢", "预判未来三十天的数据污染事件", "悬浮着反物质沙粒的双层钛合金容器，沙粒坠落轨迹对应着人类史上所有密码演变史。暗焰组织曾盗取其原型试图破解时间加密算法，却导致沙漏出现镜像倒流——上半部分显示冰川完全消融的2278年，下半部分定格在楔形文字诞生的公元前3200年。完全激活后可展开四维密码字典，预判未来三百年的数据污染节点。", "<p>埃及金字塔地下，暗焰正在用沙漏原型篡改时间戳制造虚假历史。你躲在法老棺椁后，看着他们启动沙漏逆转了石壁上的象形文字。等雇佣兵离开后，你冲向祭坛却触发机关——整个墓室开始像魔方一样翻转。</p><p>在第六次天地倒转时，你发现沙漏的影子始终指向正北。用激光笔沿影子切开地面，露出真正的铭牌：上层黑沙显示「2278年冰川消亡」，下层白沙呈现「新纪元种子库」。你掏出前两块铭牌排成一排，黑沙突然开始倒流回白沙层，墓室响起五千年前的楔形文字警报声。</p>", 5),
    new Nameplate("星火燧芯", "熄灭的陨石里住着偷火种的贼，灰烬中站起的盗火者点燃了黄昏", "焚烧数据垃圾转化为清洁量子能", "燃烧着永恒火焰的玄武岩芯片，内核储存着人类最早的火种基因序列。22世纪清洁能源联盟曾试图用它构建碳中和区块链，却在核聚变实验事故中沉入马里亚纳海沟。重启后的铭牌能在量子服务器底层引燃“文明篝火”，将数据垃圾煅烧成可降解的二进制孢子，其释放的虚拟热能可反哺现实世界的冻土带。", "<p>马里亚纳海沟底部，被暗焰改造成垃圾焚化炉的深海基地正喷发黑烟。你驾驶潜水器冲破剧毒热泉，机械臂抓住岩缝中半融化的燧芯。突然警报炸响——暗焰启动了自毁程序，岩壁渗出沥青状的数据污染物，将你困在直径三米的沸腾气泡里。</p><p>你抡起液压锤砸向燧芯表面的玄武岩外壳，火星迸溅的刹那，铭牌突然吸入周围所有热能。海水极速结冰，黑烟凝成雪花簌簌坠落。舱内屏幕亮起提示：「文明之火需以绝望为引」。</p>", 6),
    new Nameplate("血棘菌脉", "吮吸战死者骨髓的藤蔓开出铁锈花，被埋葬的兵器在菌丝里长出毒牙", "向暗焰的数据流注入生物病毒", "一截嵌着弹片的猩红菌丝，其源头可追溯至冷战时期生物实验室泄露的纳米武器。这些菌种以重金属和电磁波为食，在刚果雨林深处与军用AI结合成共生体。当植入敌方服务器时，菌丝会伪装成防火墙迅速增殖，其孢子携带的朊病毒能扭曲数据编码逻辑——被攻击的系统将不断“生长”出无效代码，如同癌细胞般自我吞噬。", "<p>暗焰在刚果盆地培育的杀人藤突然变异，你追踪到这些植物根须竟在吞噬5G基站。砍开一株直径三米的血色巨菌，内部涌出带着军用编码的孢子云。你被迫吸入部分孢子，左手瞬间木质化并长出尖刺。</p><p>幻觉中看到纳粹1943年在此埋藏的生化武器资料库，那些腐烂的档案正通过菌丝上传到暗焰服务器。你用木质化的左手插入菌盖，强行进行神经连接。当痛觉达到临界值时，整片菌林突然向你跪拜——它们把携带致命程序的孢子注入你体内，而你反将孢子群改造为铭牌载体。</p>", 7),
    new Nameplate("鲸墟鸣匣", "沉默的鲸骨在海底搭建通天巴别塔，溺亡文明的声带震碎了时空的琥珀", "重启地球-元宇宙共生协议", "嵌有抹香鲸耳骨化石的青铜装置，记录着海洋哺乳动物千万年进化的声波密码。22世纪元宇宙基建过度抽取海水冷却量子服务器，致使鲸群集体搁浅自杀。守林人从它们颅腔内的磁性晶体提取出“生命冗余编码”，当所有铭牌齐聚时能发出跨维度的鲸歌脉冲，在虚实交界处重构碳基与硅基文明的共生契约。", "<p>东京湾海底，暗焰用次声波武器驱赶着机械虎鲸群。你穿着抗压服潜入核电站废墟，鸣匣卡在反应堆燃料棒之间，表面附着的贝类生物正发出诡异频率的声波。每靠近一米，耳膜就渗出鲜血，AR界面显示这是鲸类文明最后的悲鸣。</p><p>你摘下翻译器直接用骨传导接收声波，颅腔共振的剧痛中竟听懂了旋律——那是抹香鲸用二十年寿命编写的密码。跟着旋律节拍游动，机械虎鲸突然调头为你开路。握住鸣匣的瞬间，所有鲸鱼机械体同时抬头，向海面射出蔚蓝的光柱。</p>", 8)
];
const levelMap = [
    -1,
    0,
    2000,
    4000,
    6000,
    8000,
    10000,
    12000,
    15000
];
let isHasNewNameplate = false;
function goHome(token) {
    var _a, _b, _c, _d;
    if (token !== TurnToPage.token) {
        throw new Error("Token Error");
    }
    let taskHTML = ``;
    for (let i = 0; i < Math.min(TODOTasks.length, 2); i++) {
        const finPer = Math.round(TODOTasks[i].doTimes / TODOTasks[i].times() * 1000) / 10;
        taskHTML += `
        <div class="card taskCard">
            <div class="card-body">
                <h5 class="card-title">${TODOTasks[i].title()}</h5>
                <p class="card-text" style="text-indent: 2em">${TODOTasks[i].description()}</p>
                <p class="card-text" style="text-indent: 2em">你可以获得<strong>${TODOTasks[i].reward()}</strong>tCO₂e的碳排放配额。</p>
                <div class="progress">
                    <div class="progress-bar" role="progressbar" style="width: ${finPer}%;" aria-valuenow="${finPer}" aria-valuemin="0" aria-valuemax="100">${finPer}%</div>
                </div>
                ${TODOTasks[i].done() ?
            `<p class="btn btn-warning" id="task${i + 1}-btn">领取奖励</p>`
            :
                `<p class="btn ${TODOTasks[i].location() === null ? `btn-secondary` : `btn-primary`}" id="task${i + 1}-btn">${TODOTasks[i].location() === null ? `待完成` : `去完成`}</p>`}
            </div>
        </div>`;
    }
    let maxScore, levelHtml = "";
    if (level >= 8)
        maxScore = levelMap[8];
    else
        maxScore = levelMap[level + 1];
    if (level == 1) {
        levelHtml += `
        <p>你还没有获得任何铭牌，请先完成任务。</p>`;
    }
    else {
        levelHtml += `
        <p>你可以点击对应铭牌的名字来查看详细信息</p>
        `;
    }
    for (let i = 0; i < nameplates.length; i++) {
        if (level >= nameplates[i].needLevel) {
            levelHtml += `
            <p class="action" data-bs-toggle="collapse" href="#storyFor${nameplates[i].name}" aria-expanded="false" role="button" aria-controls="storyFor${nameplates[i].name}">
                ${nameplates[i].name}
            </p>
            <div class="collapse" id="storyFor${nameplates[i].name}">
                <div class="card card-body">
                    <p style="font-style: italic;">${nameplates[i].source}</p>
                    <span>铭牌作用：</span>
                    <p>${nameplates[i].use}</p>
                    <span>可靠情报：</span>
                    <p>${nameplates[i].backstory}</p>
                    <span>搜集报告：</span>
                    ${nameplates[i].log}
                </div>
            </div>
            `;
        }
    }
    if (level >= 8) {
        levelHtml += `
        <p>当鸣匣的蓝光与其他所有铭牌的光柱交汇时，北极冰盖上腾起六角形彩虹。无数冰晶在虹光中重组成DNA链般的结构，暗焰制造的污染云被吸入其中，吐出嫩芽形状的清洁数据包。你跪在光晕中心，看着手腕上由铭牌变形而成的银色树苗——它根系扎进量子服务器，枝干延伸到真实世界的臭氧层破洞。</p>
        <p>七天后，首支探险队在格陵兰岛发现了新生冰层下闪烁的铭牌图腾。联合国宣布启动"新诺亚协议"，要求所有元宇宙入口必须搭载生物密码验证系统。而你驻守着正在恢复的北极点，手中的守林人终端不时收到2278年的天气预报——在全人类重建信任体系的第三个春天，永冻层将首次迎来真实的极光与花海。</p>
        <p>三个月后，第一朵真实与虚拟共生的「数据花」在新西伯利亚盛开，花瓣上的荧光纹路正是所有铭牌的小型化投影。孩子们通过脑机接口给花授粉时，会在神经元层面传承守护密码的契约。而你在每个午夜仍能听见鲸歌，那是从冰川新生线传来的、跨越时空的谢意。</p>
        `;
    }
    let scorePercent = Math.round(score / maxScore * 1000) / 10;
    let nextNameplate = (nameplates[0]);
    for (let i of nameplates) {
        if (i.needLevel == level + 1) {
            nextNameplate = i;
            break;
        }
    }
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
                    <p>人类最后的希望藏在六块神秘铭牌中，你需要拿到这六块铭牌，拯救地球。</p>
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
        <div class="accordion-item" id="nameplate">
            <h2 class="accordion-header" id="accordionHeadingForNameplate">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseForNameplate" aria-expanded="true" aria-controls="collapseForNameplate">
                铭牌<span class="badge bg-danger invisible" style="margin-left:7px;" id="badgeNew">New!</span>
                </button>
            </h2>
            <div id="collapseForNameplate" class="accordion-collapse collapse" aria-labelledby="accordionHeadingForNameplate" data-bs-parent="#mainAccordion">
                <div class="accordion-body">
                    ${levelHtml}
                </div>
            </div>
        </div>
    </div>
    <div class="card taskCard">
        <div class="card-body">
            <p class="card-text">当前等级：Level ${level}</p>
            <p class="card-text">你获得的碳排放额度：<strong>${score}</strong>/<strong>${maxScore}</strong>tCO₂e</p>
            ${level < levelMap.length - 1 ? `
                <p class="card-text">升级还需要：<strong>${Math.max(maxScore - score, 0)}</strong>tCO₂e</p>
                <p class="card-text">升级后你将会获得：${nextNameplate.name}——<em>${nextNameplate.source}</em></p>
            ` : ``}
            <div class="progress">
                <div class="progress-bar" role="progressbar" style="width: ${scorePercent}%;" aria-valuenow="${scorePercent}" aria-valuemin="0" aria-valuemax="100">${scorePercent}%</div>
            </div>
            ${level < levelMap.length - 1 ? `${scorePercent >= 100 ?
        `<p class="btn btn-warning" id="score-btn">领取奖励</p>`
        :
            `<p class="btn btn-secondary" id="score-btn">待完成</p>`}` : `<p class="btn btn-secondary">已完成</p>`}
        </div>
    </div>
    ${taskHTML}
    `;
    const newWarning = document.querySelector("#badgeNew");
    if (isHasNewNameplate) {
        newWarning === null || newWarning === void 0 ? void 0 : newWarning.classList.remove("invisible");
    }
    else {
        newWarning === null || newWarning === void 0 ? void 0 : newWarning.classList.add("invisible");
    }
    (_a = document.querySelector("#nameplate")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
        newWarning === null || newWarning === void 0 ? void 0 : newWarning.classList.add("invisible");
        isHasNewNameplate = false;
    });
    if (TODOTasks.length > 0)
        (_b = document.querySelector("#task1-btn")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
            if (TODOTasks[0].done()) {
                score += TODOTasks[0].reward();
                mkDialog("领取成功", `你已经成功领取了<strong>${TODOTasks[0].reward()}</strong>tCO₂e的碳排放配额。`);
                TODOTasks.splice(0, 1);
                saveData();
                update(Folder.home());
                return;
            }
            if (TODOTasks[0].location() !== null)
                update(TODOTasks[0].location());
        });
    if (TODOTasks.length > 1)
        (_c = document.querySelector("#task2-btn")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => {
            if (TODOTasks[1].done()) {
                score += TODOTasks[1].reward();
                mkDialog("领取成功", `你已经成功领取了<strong>${TODOTasks[1].reward()}</strong>tCO₂e的碳排放配额。`);
                TODOTasks.splice(1, 1);
                saveData();
                update(Folder.home());
                return;
            }
            if (TODOTasks[1].location() !== null)
                update(TODOTasks[1].location());
        });
    if (scorePercent >= 100 && level < levelMap.length - 1) {
        (_d = document.querySelector("#score-btn")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", () => {
            level++;
            mkDialog("升级成功", `你已经成功升级到Level ${level}，获得了新的铭牌。`);
            isHasNewNameplate = true;
            saveData();
            update(Folder.home());
        });
    }
}
