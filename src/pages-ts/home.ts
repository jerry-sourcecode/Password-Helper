class Task{
    title: string;
    description: string;
    location: Folder | null;
    reward: number;
    id: string;
    times: number;
    type: Type;
    constructor(title: string | Task, description: string = "", location: Folder | null = null, reward: number = 0, times: number = 1, id: string = (typeof title === "string" ? title : title.id)){
        this.type = Type.Task;
        if (typeof title == "string"){
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
    static tryDone(id: string): boolean{
        let index: number = -1;
        if (TODOTasks.length >= 1 &&TODOTasks[0].id() === id && !TODOTasks[0].done()) index = 0;
        else if (TODOTasks.length >= 2 && TODOTasks[1].id() === id && !TODOTasks[1].done()) index = 1;
        else return false;
        TODOTasks[index].doTimes++;
        saveData();
        if (TODOTasks[index].done()) {
            mkToast("任务", "任务完成", `<p>你已经成功完成了任务：${TODOTasks[index].title()}</p>`, ["去看看"])
            .then((res) => {
                if (res == 0){
                    update(Folder.home());
                }
            });
        }
        return true
    }
    done(doTimes: number): boolean{
        return doTimes >= this.times;
    }
}

class Nameplate{
    name: string;
    source: string;
    use: string;
    backstory: string;
    log: string;
    needLevel: number;
    constructor(name: string | Nameplate, source: string = "", use: string = "", backstory: string = "", log: string = "", needLevel: number = 0){
        if (typeof name == "string"){
            this.name = name;
            this.source = source;
            this.use = use;
            this.backstory = backstory;
            this.log = log;
            this.needLevel = needLevel;
        }
        else{
            this.name = name.name;
            this.source = name.source;
            this.use = name.use;
            this.backstory = name.backstory;
            this.log = name.log;
            this.needLevel = name.needLevel;
        }
    }
}

type TaskMapCrypto = {task: string, doTimes: string};
class TaskMap{ // 任务记录
    private task: number;
    doTimes: number;
    constructor(task: number | TaskMap, doTimes?: number){
        if (typeof task == "number"){
            this.task = task;
            this.doTimes = doTimes || 0;
        }
        else{
            this.task = task.task;
            this.doTimes = task.doTimes;
        }
    }
    enc(key: string): TaskMapCrypto{
        return{
            task: cryp.encrypt(this.task.toString(), key),
            doTimes: cryp.encrypt(this.doTimes.toString(), key)
        };
    }
    static dec(obj: TaskMapCrypto, key: string): TaskMap{
        return new TaskMap(
            parseInt(cryp.decrypt(obj.task, key)),
            parseInt(cryp.decrypt(obj.doTimes, key))
        );
    }
    done(){
        return this.doTimes >= tasks[this.task].times
    }
    title(): string{
        return tasks[this.task].title;
    }
    description(): string{
        return tasks[this.task].description;
    }
    location(): Folder | null{
        return tasks[this.task].location;
    }
    reward(): number{
        return tasks[this.task].reward;
    }
    id(): string{
        return tasks[this.task].id;
    }
    times(): number{
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
        <p style="text-indent: 2em">请注意：两者都会使得当前目录下出现你所复制的文件，但粘贴会在当前文件夹下创建一个新的文件，而移动会将文件移动到当前文件夹下。</p>`, Folder.root(), 1500),
    new Task("密码侦探", "尝试搜索功能。搜索可以帮助你快速地查找密码或文件夹。你可以在主界面点击右上角工具栏的搜索图标，然后输入你想要搜索的内容。", Folder.search(), 500),
    new Task("妈妈再也不用担心我密码泄露啦！", "设置访问密钥。你可以在设置界面设置访问密钥。如果你设置了访问密钥，每一次访问你都需要填写，你也可以选中“记住密码”来让程序自动填写。", Folder.setting(), 1000),
]

const nameplates: Array<Nameplate> = [
    new Nameplate(
        "熵锁锚核", 
        "冰封的叹息在鲸骨纹路里结晶", 
        "能冻结错误时间线的扩散，将量子病毒困在绝对零度的牢笼", 
        `<p><strong>《东海科学报》报道</strong></p>
        <p>2173年12月7日凌晨，银海市海洋研究院发生重大科研事故。据值班记录显示，存放在B区实验室的深海采样物"锚核"突然释放异常低温，导致整个实验区被冰晶覆盖。该物体系上月从翡翠海沟3800米深处打捞所得，表面呈现类似鲸骨的天然纹路。</p><p>事故发生时，正在运行的量子计算机遭受未知攻击。令人意外的是，攻击程序在触及锚核释放的低温场后，竟凝结成肉眼可见的蓝色冰尘。院长陈明华教授向本报透露："这些冰尘在显微镜下显现出上世纪90年代东海辐射监测站的建筑轮廓，与现有档案完全吻合。"</p><p>目前该物体已转移至特制冷藏库，但多名工作人员反映，库房时常传出类似婴儿啼哭的声波震动。安保部门表示正在调查相关现象。</p>
        <p><strong>实验员手记</strong></p>
        <p>今夜我值最后一班岗。凌晨三点，显示屏突然跳出一串1987年的日期代码。锚核在防护罩里缓慢旋转，像极了老家那台总在除夕夜停摆的座钟。冰霜顺着电缆爬进控制台时，我听见母亲的声音。她二十年前就去世了，在东海辐射监测站做保洁员的母亲。"孩子，把锚核送去第七区......"话音未落，应急灯突然投射出布满整个天花板的鲸骨纹路。那纹路间闪烁着ES-014的荧光编号，像星空般寂静。</p>`,
        `<p>我是保安老张，在海洋研究院看了二十年大门。那晚陈院长冲进值班室时，手里攥着的玉米馍还冒着冷气，馍皮上凝着冰碴子。他说自动贩卖机突然吐出1987年的粮票食物时，我就知道要出大事。</p>
        <p>跟着他冲到B区实验室，防寒服根本挡不住那种冷。那不是冬天的寒气，倒像我九岁那年跳进冰窟窿捞父亲遗物的滋味——他参与第七区建设后再没回来。锚核在防护罩里高速旋转，甩出的冰晶在墙上拼出人脸：食堂刘姐、门卫老赵头、还有我失踪多年的父亲。</p>
        <p>当冰晶人脸同时张嘴时，整层楼的显示器跳出同一串代码：ES-014。我突然想起母亲临终前攥着的工牌，背面就刻着这个编号。陈院长突然惨叫，他手里的玉米馍裂开，露出微型胶卷：1987年12月7日的实验日志，记载着如何将人体改造成低温锚点。</p>
        <p>现在每当我经过第七区仓库，怀里的老怀表就会停摆。表盘玻璃上映出的永远是1987年12月7日，父亲跳入反应堆冷却池的最后一刻。</p>`,
        2
    ),
    new Nameplate(
        "极光棱镜",
        "碎镜中打捞起的第13次日落",
        "折射数据污折射被篡改的历史轨迹，在星空投射真相的坐标染轨迹",
        `<p><strong>《气象观察》期刊</strong></p>
        <p>2174年1月13日晚，翡翠海沿岸出现罕见极光现象。根据国家空间天气监测预警中心数据，此次极光活动伴随异常电磁脉冲，导致沿海地区电子设备集体显示1991年的气象云图。</p>
        <p>值得注意的是，云图中被重点标注的第七区坐标，与三十年前"蔚蓝计划"秘密档案记载的生态实验区完全重合。中科院遥感所专家表示，极光中检测到的高能粒子流与"熵锁锚核"物质光谱高度一致。</p>
        <p><strong>渔民口述实录</strong></p>
        <p>"那晚我的渔船像被鬼附了体。"</p>
        <p>老周蹲在码头石墩上，烟头在暮色里一明一灭："罗盘疯转，声呐屏跳出我爹1987年写的航海日志。抬头就看见极光里站着个抱孩子的女人，跟二十年前淹死在海里的媳妇一个样。"</p>
        <p>他忽然压低声音："光幕裂开时，我捞到块透亮的水晶。对着月光一照，里头冻着个穿白大褂的女人，胸口别着蔚蓝计划的徽章——那玩意我媳妇下葬时手里也攥着一个。"</p>
        `,
        `
        <p>我是灯塔管理员叶添。那夜极光降临前，收音机突然播放1971年的台风警报——那是我父亲参加"蔚蓝计划"后失踪的日子。跟着杂音走到塔顶，看见海天之间裂开道银色缝隙。
        <p>极光碎片坠落时，我用手套去接，羊皮手套瞬间被烧出蜂窝状的洞。那些碎片在观测台上滚动，拼出第七区的经纬度坐标。最亮的碎片里冻着个婴儿，襁褓上的蓝鲸刺绣和我父亲实验室照片里的一模一样。</p>
        <p>当我把碎片放进父亲留下的黄铜望远镜时，镜片突然投射出全息影像：1987年的第七区地下室，穿白大褂的女人正把婴儿放入锚核舱。她转身的瞬间，我认出那是我从未见过的母亲。</p>
        <p>现在每到月圆之夜，灯塔玻璃就会映出极光路径。昨晚光路尽头指向我的烫伤疤——那是我七岁时打翻父亲实验日志留下的。火焰吞噬了"人体锚点"四个字，却在皮肤上烙下ES-014的焦痕。</p>`,
        3
    ),
    new Nameplate(
        "雷蚀龙芯",
        "囚禁在青铜里的亿万次心跳",
        "释放生物电脉冲，烧毁伪造的记忆回路",
        `<p><strong>《电力安全通报》</strong></p>
        <p>2174年3月15日，银海市第三核电站2号机组突发异常。监控显示，反应堆冷却池底部出现不明青铜立方体，表面布满蜂窝状蚀痕。该物体持续释放高频电磁脉冲，导致控制室屏幕集体回滚至1987年12月7日的运行日志——当日正是"蔚蓝计划"启动的日期。</p>
        <p>联合国科技院专家团队介入调查后确认，立方体释放的电流频率与"熵锁锚核"冰晶震荡波完全同步。站长王志刚向本报透露："每当雷暴临近，立方体表面会投影出穿白大褂的女性影像，她怀中的婴儿襁褓上绣着'ES'字样，与研究院事故中的编号一致。"</p>
        <p><strong>电工日记片段</strong></p>
        <p>2174.3.15 雷雨夜</p>
        <p>扳手刚碰到配电箱，手背的旧疤突然灼痛。</p>
        <p>这块疤是十年前检修第七区电缆时留下的，形状像片龙鳞。</p>
        <p>雷光劈进冷却池的瞬间，池水沸腾如熔岩。</p>
        <p>青铜立方体从水底浮起，裂缝中掉出半张烧焦的工作证——照片是我母亲，姓名栏写着"埃琳娜·桑切斯"，部门标注为"蔚蓝计划人体锚点组"。</p>
        <p>可她在我出生时就难产死了。</p>
        <p>除非，她根本没死......</p>
        `,
        `<p>我是核电站清洁工林秀兰。那夜雷暴最猛时，冷却池的水突然逆流成漩涡。青铜立方体从池底升起，表面跳动着和我母亲工牌上相同的ES-014编号。</p>
        <p>当我用扫帚去够那立方体时，一道电弧突然窜入掌心。剧痛中看到走马灯般的画面：1991年，母亲在第七区地下175米处，将婴儿时期的我放进锚核舱。原来我就是那个被抹去的人体锚点实验品。</p>
        <p>立方体裂开时，里面掉出半张焚烧过的《量子焚化协议》，签署日期是2174年12月7日。现在我的左臂布满龙鳞状疤痕，每当雷声响起，疤痕就会在墙上投出倒计时：距离锚点归位还有214天。</p>`,
        4
    ),
    new Nameplate(
        "时溯沙漏",
        "吞下晨昏线的漩涡吐出骨灰",
        "用死者的时间尘埃预演未来三十天的可能性",
        `<p><strong>《突发事件预警》</strong></p>
        <p>2174年5月20日，银海市地铁3号线发生集体昏迷事件。乘客反映，车厢电子屏突然显示未来30天的污染事件预报，包括6月15日第七区废料井泄漏预警。经查，所有异常信号均源自某乘客携带的沙漏状装置，其内部砂砾经检测为1987年第七区土壤样本。</p>
        <p>疾控中心警告，接触该沙漏者会出现短期记忆混乱。一名昏迷乘客苏醒后坚称自己"回到了1991年"，并准确描绘出当年已销毁的辐射监测站内部结构。</p>
        <p><strong>拾荒者口述</strong></p>
        <p>"我在第七区围墙外捡到那沙漏时，里头装的不是沙子，是闪着荧光的骨灰。"</p>
        <p>老赵头缩在棚屋角落，煤油灯将他的影子投在斑驳的墙上："半夜它突然立起来，漏出的光在地上拼出个日期——1987年12月7日。我儿子就是那天在第七区施工时失踪的......今早我发现沙漏底刻着ES-014，和我儿子工牌上的编号一样。"</p>
        `,
        `<p>我是地铁安检员周小梅。老人抱着沙漏进站时，我闻到了海盐和铁锈混杂的味道——和父亲渔船上的气息一模一样。他失踪于1991年第七区泄漏事故，官方说尸体被封在混凝土里。</p>
        <p>沙漏在他手中倾覆时，所有车窗变成了镜子。我眼睁睁看着镜中的自己退化成女婴，躺在刻有ES-014的金属舱内。老人突然抓住我的手，他掌心的温度让我想起童年时父亲教我认星图的触感。</p>
        <p>"沙漏里的不是沙子，是第七区死难者的骨灰。"他在昏迷前最后一刻说，"12月7日去地下175米，那里有所有答案......"</p>
        <p>现在我的安检仪每天凌晨三点会扫描出异常物品：有时是1987年的实验报告，有时是沾着海水的婴儿襁褓。昨天扫出张泛黄的照片，母亲抱着我站在第七区铁门前，她白大褂上别着蔚蓝计划的徽章。</p>`,
        5
    ),
    new Nameplate(
        "星火燧芯",
        "陨石胎衣中啼哭的盗火者",
        "焚烧时间悖论产生的数据残渣，净化时空连续体",
        `<p><strong>《环保监察快报》</strong></p>
        <p>2174年7月，第七区废料填埋场监测到异常热能。无人机航拍显示，地表裂痕中涌出青色火焰，焚烧后的灰烬经检测为纯净碳颗粒。环保局溯源发现，热源中心埋藏着刻有"星火"字样的金属圆柱体，其释放能量与三十年前"蔚蓝计划"实验日志记载的"量子焚化"数据完全吻合。</p>
        <p><strong>焊工手记</strong></p>
        <p>夜班时切割废料罐，火星突然聚成个人形。</p>
        <p>那是个穿白大褂的女人，火焰从她怀中的婴儿襁褓里喷涌而出。</p>
        <p>我吓得扔开焊枪，火人却指向第七区方向："去把燧芯交给老周......"</p>
        <p>低头发现防护服口袋多了块滚烫的金属片，上面蚀刻着ES-014和1987.12.7。</p>
        <p>老周是我岳父，他女儿二十年前带着蔚蓝徽章嫁给我，婚后三个月就投海自尽了。</p>
        `,
        `<p>我是第七区看守员李大勇。妻子投海那晚，她在沙滩上画满燃烧的锚点符号。如今这些符号出现在焚化炉的灰烬里，它指引我找到星火燧芯。</p>
        <p>我握着滚烫的金属圆柱体时，掌心突然浮现妻子溺亡前的记忆：她不是自杀，而是被蔚蓝计划灭口。燧芯里封存着她最后的录音："大勇，2174年12月7日，用星火烧毁锚核舱......"</p>
        <p>昨夜巡查时，燧芯突然引燃所有废料。火焰在空中拼出妻子怀孕时的超声图像——胎儿后颈清晰可见ES-014的烙印。原来我们的孩子才是真正的时空锚点。</p>
        <p>现在每当燧芯发热，我就能听见妻子撕心裂肺的呼喊。她在火中说："去海底找鸣匣，那是修正时间的最后机会"。</p>`,
        6
    ),
    new Nameplate(
        "血棘菌脉",
        "铁锈花蕊中绽放的旧日战争",
        "向篡改者植入记忆病毒，使其被自己的谎言反噬",
        `<p><strong>《生物安全警报》</strong></p>
        <p>2174年9月，第七区周边出现大规模藤蔓增生现象。这些藤蔓分泌强腐蚀性黏液，并释放干扰电子设备的生物脉冲。植物学家发现，藤蔓DNA中嵌合着1987年"蔚蓝计划"实验菌株标记，其生长轨迹与"时溯沙漏"预测的污染路径完全一致。</p>
        <p><strong>护林员录音</strong></p>
        <p>"藤蔓缠上瞭望塔时，我的猎枪突然锈成了渣。"</p>
        <p>老孙头的咳嗽声混着山风："那些红叶子会模仿人声，昨晚一直喊着'埃琳娜回来吧'。今早我在树根处挖到块铁盒，里面装着蔚蓝计划的实验录像带——播放时全是雪噪点，但背景音分明是我女儿在哭，她二十年前在第七区实验室当保洁员......"</p>
        `,
        `
        <p>我是护林员之女孙倩。藤蔓吞噬观测站那夜，我的血液变成了荧光蓝色。这些发光液体在站内地板上流淌，绘出第七区地下锚核舱的结构图。</p>
        <p>触摸藤蔓主干时，菌丝突然刺入血管。我在剧痛中看到母亲1987年的记忆：她被迫将刚出生的我送入锚核舱，舱门关闭前在我后颈烙下ES-014。</p>
        <p>藤蔓开花时，花粉在空气中凝成倒计时全息投影：距离锚点闭合还剩7天。我用斧头劈开最粗的藤茎，里面嵌着母亲的工作日志——最后一页写着："小倩，12月7日去海底，把锚核送回它该在的时空"。</p>
        `,
        7
    ),
    new Nameplate(
        "鲸墟鸣匣",
        "溺亡的巴别塔将在大海深处复活",
        "重启所有被切断的因果链，让平行时空共振归一",
        `<p><strong>《海洋考古重大发现》</strong></p>
        <p>2174年12月7日，考古队在第七区海底发现巨型鲸骨矩阵。这些鲸骨表面生长着电子元件化珊瑚，持续播放1987年的实验录音。中央铁匣开启后，内部藏有"蔚蓝计划"终极档案，证实该计划旨在通过ES-014号志愿者（埃琳娜·桑切斯）将人体转化为时空锚点，但最后惨遭失败。</p>
        <p><strong>潜水员遗书</strong></p>
        <p>"铁匣打开的瞬间，我的血液开始逆流。"</p>
        <p>陈勇的绝笔信皱巴巴地浸着海水："埃琳娜的全息影像说，她在1987年怀着的婴儿是时空纠错程序。我们每个人都是锚点的延伸。12月7日，所有碎片将在第七区重组时间线。"</p>
        `,
        `<p>我是保安老张。2174年12月7日，怀表在凌晨归零时炸成碎片。跟着表针的荧光粉末冲到海岸，海水正退潮露出鲸骨巨塔。</p>
        <p>塔顶鸣匣开启的瞬间，所有伤疤同时苏醒，它们汇聚成埃琳娜的全息影像。她怀中的婴儿睁开眼，瞳孔里旋转着银河。</p>
        <p>"你们每个人都是锚点的碎片。"她说，"现在把疼痛还给我。"</p>
        <p>当我们将手按在鸣匣上时，鲸骨矩阵开始崩塌。我望见1987年的母亲按下终止键，锚核舱缓缓开启，本该成为锚点的婴儿被抱出销毁。</p>
        <p>海风吹散晨雾时，第七区的废料井长出大片蓝花。我摘下朵花别在胸口，花瓣背面刻着：时间线已修正，ES-014归档。</p>`,
        8
    )
]

const levelMap: Array<number> = [
    -1,
    0,
    2000,
    4000,
    6000,
    8000,
    10000,
    12000,
    15000
]

let isHasNewNameplate: boolean = false;

function goHome(token: Symbol): void {
    if (token !== TurnToPage.token) {
        throw new Error("Token Error");
    }
    let taskHTML = ``;
    for (let i = 0; i < Math.min(TODOTasks.length, 2); i++){
        const finPer = Math.round(TODOTasks[i].doTimes / TODOTasks[i].times() * 1000)/10;
        taskHTML += `
        <div class="card taskCard">
            <div class="card-body">
                <h5 class="card-title">${TODOTasks[i].title()}</h5>
                <p class="card-text" style="text-indent: 2em">${TODOTasks[i].description()}</p>
                <p class="card-text" style="text-indent: 2em">你可以获得<strong>${TODOTasks[i].reward()}</strong>tCO₂e的碳排放配额。</p>
                <div class="progress">
                    <div class="progress-bar" role="progressbar" style="width: ${finPer}%;" aria-valuenow="${finPer}" aria-valuemin="0" aria-valuemax="100">${finPer}%</div>
                </div>
                ${TODOTasks[i].done()?
                `<p class="btn btn-warning" id="task${i+1}-btn">领取奖励</p>`
                :
                `<p class="btn ${TODOTasks[i].location() === null?`btn-secondary`:`btn-primary`}" id="task${i+1}-btn">${TODOTasks[i].location() === null?`待完成`:`去完成`}</p>`
                }
            </div>
        </div>`
    }
    let maxScore: number, levelHtml: string = "";
    if (level >= 8) maxScore = levelMap[8];
    else maxScore = levelMap[level + 1];

    if(level ==  1){
        levelHtml += `
        <p>你还没有获得任何铭牌，请先完成任务。</p>`
    } else {
        levelHtml += `
        <p>你可以点击对应铭牌的名字来查看详细信息</p>
        `
    }

    for(let i = 0; i < nameplates.length; i++){
        if (level >= nameplates[i].needLevel){
            levelHtml += `
            <p class="action" data-bs-toggle="collapse" href="#storyFor${nameplates[i].name}" aria-expanded="false" role="button" aria-controls="storyFor${nameplates[i].name}">
                ${nameplates[i].name}
            </p>
            <div class="collapse" id="storyFor${nameplates[i].name}">
                <div class="card card-body">
                    <p style="font-style: italic;">${nameplates[i].source}</p>
                    <span><strong>铭牌作用：</strong></span>
                    <p>${nameplates[i].use}</p>
                    <span><strong>可靠情报：</strong></span>
                    <p>${nameplates[i].backstory}</p>
                    <span><strong>搜集报告：</strong></span>
                    ${nameplates[i].log}
                </div>
            </div>
            `
        }
    }

    if (level >= 8){
        levelHtml += `
        <p>2174年12月7日，翡翠海掀起黑色潮汐。我们七个带着伤疤的人站在鲸骨塔顶，老张的怀表、叶添的烫伤、林秀兰的龙鳞疤痕同时灼烧。
        当鸣匣吞噬所有铭牌的瞬间，1987年的实验室在我们眼前重现。母亲抱着婴儿走向锚核舱，这次她扯下胸口的蔚蓝徽章，狠狠砸向紧急制动阀。舱门在闭合前爆裂，三十七道时间线如摔碎的镜子般四溅。</p>
        <p>潮水退去时，第七区的混凝土长出荧蓝珊瑚。老周渔船满载而归，他女儿在甲板上唱着1987年的童谣；叶添的收音机终于收到父亲平安归航的电报；我摸着后颈渐渐淡去的刺青，浪涛声里传来婴儿熟睡的呼吸。</p>
        <p>海底传来一声悠长的鲸歌，所有错误的时间线在此刻坍缩成珍珠，永远沉眠在蔚蓝计划的墓志铭上。</p>
        `
    }

    let scorePercent = Math.min(Math.round(score / maxScore * 1000)/10, 100);
    let nextNameplate: Nameplate = (nameplates[0]);
    for(let i of nameplates){
        if (i.needLevel == level + 1){
            nextNameplate = i;
            break;
        }
    }
    main!.innerHTML = `
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
                    <p>翡翠海的风总带着咸腥的锈味，像无数把生锈的钥匙在摩擦。三十年前那场代号"蔚蓝"的时空实验失败后，这片海域就成了现实的补丁——渔船会捞上印着未来日期的罐头，潜水员的头盔里偶尔传来1971年的广播，最老练的渔民也不敢在月圆之夜出航。</p>
                    <p>我在第七区废弃观测站当看守的第十年，在父亲留下的防水记事本里发现张泛黄照片。照片里穿白大褂的母亲抱着婴儿，背景是布满管道的实验室，墙角电子钟显示着1987年12月7日。那个本该在我出生时就死去的母亲，正对着镜头微笑，她怀中的婴儿后颈隐约可见发光的ES-014刺青。</p>
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
            ${level < levelMap.length-1?`
                <p class="card-text">升级还需要：<strong>${Math.max(maxScore-score, 0)}</strong>tCO₂e</p>
                <p class="card-text">升级后你将会获得：${nextNameplate.name}——<em>${nextNameplate.source}</em></p>
            `:``}
            <div class="progress">
                <div class="progress-bar" role="progressbar" style="width: ${scorePercent}%;" aria-valuenow="${scorePercent}" aria-valuemin="0" aria-valuemax="100">${scorePercent}%</div>
            </div>
            ${level < levelMap.length-1?`${scorePercent >= 100?
            `<p class="btn btn-warning" id="score-btn">领取奖励</p>`
            :
            `<p class="btn btn-secondary" id="score-btn">待完成</p>`
            }`:`<p class="btn btn-secondary">已完成</p>`}
        </div>
    </div>
    ${taskHTML}
    `;
    const newWarning = document.querySelector("#badgeNew");
    if (isHasNewNameplate){
        newWarning?.classList.remove("invisible");
    } else {
        newWarning?.classList.add("invisible");
    }
    document.querySelector("#nameplate")?.addEventListener("click", () => {
        newWarning?.classList.add("invisible");
        isHasNewNameplate = false;
    })
    if (TODOTasks.length > 0) document.querySelector("#task1-btn")?.addEventListener("click", () => {
        if (TODOTasks[0].done()) {
            score += TODOTasks[0].reward();
            mkDialog("领取成功", `你已经成功领取了<strong>${TODOTasks[0].reward()}</strong>tCO₂e的碳排放配额。`);
            TODOTasks.splice(0, 1);
            init(Folder.home());
            return;
        }
        if (TODOTasks[0].location() !== null) update(TODOTasks[0].location()!);
    })
    if (TODOTasks.length > 1) document.querySelector("#task2-btn")?.addEventListener("click", () => {
        if (TODOTasks[1].done()) {
            score += TODOTasks[1].reward();
            mkDialog("领取成功", `你已经成功领取了<strong>${TODOTasks[1].reward()}</strong>tCO₂e的碳排放配额。`);
            TODOTasks.splice(1, 1);
            init(Folder.home());
            return;
        }
        if (TODOTasks[1].location() !== null) update(TODOTasks[1].location()!);
    })
    if (scorePercent >= 100 && level < levelMap.length-1){
        document.querySelector("#score-btn")?.addEventListener("click", () => {
            level++;
            mkDialog("升级成功", `你已经成功升级到Level ${level}，获得了新的铭牌。`);
            isHasNewNameplate = true;
            init(Folder.home());
        })
    }
    main?.scrollTo(pagePos.home)
}