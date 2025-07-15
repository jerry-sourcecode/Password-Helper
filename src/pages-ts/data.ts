/**
 * 这个文件是用来定义和存储数据的
 */
const showNoteMaxLength: number = 135; // 在main页面显示备注的最大长度
const showOtherMaxLength: number = 60; // 在main页面显示来源、用户名、密码的最大长度
const showSearchMaxLength: number = 47; // 在搜索页面显示来源、用户名、密码的最大长度
const showPathMaxLength: number = 35; // 在main页面显示路径的最大长度
const showBasicInfoMaxLength: number = 55; // 在setting页面显示基本信息的最大长度

enum Type { // 类型枚举
    Folder, // 文件夹
    Password, // 密码
    Task // 任务
}

type Item = Folder | Password; // 项类型
type clipboardItem = { type: Type, index: number };


/**
 * 密码类
 * @member from 来源
 * @member uname 用户名
 * @member pwd 密码
 * @member email 邮箱
 * @member phone 手机号
 * @member note 备注
 * @member dir 父文件夹
 * @member type 类型
 * @member moDate 修改日期
 * @member rmDate 删除日期
 */
class Password { // 密码类
    from: string; // 来源
    uname: string // 用户名
    pwd: string; // 密码
    email: string; // 邮箱
    phone: string; // 手机号
    note: string; // 备注
    private dir: string; // 文件夹
    type: Type = Type.Password; // 类型
    moDate: string; // 创建日期
    rmDate: string | null = null; // 删除日期
    pin: boolean = false; // 是否置顶
    constructor(date: Password);
    constructor(from?: string, uname?: string, pwd?: string, note?: string, email?: string, phone?: string, dir?: Folder);
    constructor(fromOrdata: string | Password = "", uname: string = "", pwd: string = "", note: string = "", email: string = "", phone: string = "", dir: Folder = Folder.root()) { // 构造函数
        this.type = Type.Password;
        if (typeof fromOrdata === "string") {
            this.moDate = Date.now().toString();
            this.rmDate = null;
            this.from = fromOrdata;
            this.uname = uname;
            this.pwd = pwd;
            this.note = note;
            this.email = email;
            this.phone = phone;
            this.dir = dir.stringify();
        } else {
            this.from = fromOrdata.from;
            this.uname = fromOrdata.uname;
            this.pwd = fromOrdata.pwd;
            this.note = fromOrdata.note;
            this.email = fromOrdata.email;
            this.phone = fromOrdata.phone;
            this.dir = (typeof fromOrdata.dir == "object" ? new Folder(fromOrdata.dir).stringify() : fromOrdata.dir);
            this.rmDate = fromOrdata.rmDate;
            this.moDate = fromOrdata.moDate;
            this.pin = fromOrdata.pin === undefined ? false : fromOrdata.pin; // 为了兼容旧版本
        }
    }

    /**
     * 得到基础的HTML代码
     * @param id 作为这个HTML的唯一身份标识符的一部分，而给的一个编号
     * @param checkable 是否可以被选择
     * @returns HTML代码
     */
    getHtml(id: number, checkable: boolean = false): HTMLCode {
        let tool = `<div class="tool" style="width: ${checkable ? "39vw" : "43vw"};">
            <div class="tool-group">
                <img class="icon" id="pwd${id}-edit" style="margin-right: 8px;" src="./resources/edit.png" data-bs-toggle="tooltip" data-bs-placement="top" title="编辑">
                <img class="icon" id="pwd${id}-delete" src="./resources/delete.png" data-bs-toggle="tooltip" data-bs-placement="top" title="删除">
                <img class="icon" id="pwd${id}-pin" ${this.pin ? `src="./resources/pin-off.png" title="取消置顶"` : `src="./resources/pin.png" title="置顶"`} data-bs-toggle="tooltip" data-bs-placement="top">
            </div>
        </div>`
        if (checkable) return `<div class="info card" style="flex-direction: row;" id="pwd${id}" draggable="true">
            <div class="checkbox" id="pwd${id}-checkboxDiv"><input type="checkbox" id="pwd${id}-checkbox"></div>
            <div class="check-content">
                ${this.getBaseHtml()}
                ${tool}
            </div>
        </div>`;
        else return `<div class="info card" id="pwd${id}" draggable="true">
            ${this.getBaseHtml()}
            ${tool}
        </div>`;
    }
    /**
     * 得到卡片形式的HTML代码
     * @param id 作为这个HTML的唯一身份标识符的一部分，而给的一个编号
     * @param checkable 是否可以被选择
     * @param searchPart 搜索Regex的文字，默认为undefined，表示不搜索
     * @returns HTML代码
     */
    getCard(id: number, isBin: boolean = false, searchPart: string): HTMLCode {
        let newPwd = new Password(this);
        function markSearchWord(key: "from" | "uname" | "pwd" | "email" | "phone" | "note"): void {
            // 和Folder.getCard类似，处理搜索部分
            if (searchPart) {
                const regStr = searchPart.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"); // 转义正则表达式特殊字符
                const reg = new RegExp(regStr, "i");
                const match = newPwd[key].match(reg);
                if (match && match.index !== undefined) {
                    // 格式化到合适长度
                    let formatted = Password.format(newPwd[key], showSearchMaxLength, match.index + match[0].length / 2);
                    // 格式化后还能匹配则高亮，否则整体标红
                    if (new RegExp(regStr, "i").test(formatted)) {
                        newPwd[key] = formatted.replace(new RegExp(regStr, "i"), (m) => `<span class="highlight">${m}</span>`);
                    } else {
                        newPwd[key] = `<span class="highlight">${formatted}</span>`;
                    }
                } else {
                    // 源文本无法匹配，正常格式化
                    newPwd[key] = Password.format(newPwd[key], showSearchMaxLength);
                }
            } else {
                newPwd[key] = Password.format(newPwd[key], showSearchMaxLength);
            }
        }
        markSearchWord("from");
        markSearchWord("uname");
        markSearchWord("pwd");
        markSearchWord("email");
        markSearchWord("phone");
        markSearchWord("note");
        return `
        <div class="card" style="width: 100%;" id="card${id}">
            <div class="card-body">
                <p class="card-text">
                    <p>路径：${Password.format(this.getParent().toReadableText(), showPathMaxLength, "front")}</p>
                    <p>来源：${newPwd.from}</p>
                    <p>用户名：${newPwd.uname}</p>
                    <p>密码：${newPwd.pwd}</p>
                    ${this.email == "" ? "" : `<p>邮箱：${newPwd.email}</p>`}
                    ${this.phone == "" ? "" : `<p>手机号：${newPwd.phone}</p>`}
                    ${this.note == "" ? "" : `<p>备注：${newPwd.note}</p>`}
                    <p>${isBin ? "删除时间" : "修改时间"}：${getReadableTime(isBin ? this.rmDate! : this.moDate)}</p>
                    <button type="button" class="btn ${isBin ? "btn-secondary" : "btn-primary"}" id="card${id}-path">跳转到对应路径</button>
                    <button type="button" class="btn btn-primary" id="card${id}-detail">查看详情</button>
                </p>
            </div>
        </div>
        `
    }
    /**
     * 得到回收站形式的HTML代码
     * @param id 作为这个HTML的唯一身份标识符的一部分，而给的一个编号
     * @param checkable 是否可以被选择
     * @returns HTML代码
     */
    getHtmlBin(id: number, checkable: boolean = false): HTMLCode {
        let tool = `<div class="tool" style="width: ${checkable ? "39vw" : "43vw"};">
            <div class="tool-group">
                <p class="icon" id="bin${id}-recover" style="margin-right: 8px;">恢复</p>
                <p class="icon" id="bin${id}-delete">删除</p>
                </div>
            </div>`
        if (checkable) return `<div class="info" style="flex-direction: row;" id="bin${id}" draggable="true">
            <div class="checkbox" id="bin${id}-checkboxDiv"><input type="checkbox" id="bin${id}-checkbox"></div>
            <div class="check-content">
                ${this.getBaseHtml(true)}
                <p>原路径：${this.getParent().toReadableText()}</p>
                ${tool}
            </div>
        </div>`;
        else return `<div class="info" id="bin${id}" draggable="true">
            ${this.getBaseHtml(true)}
            <p>原路径：${this.getParent().toReadableText()}</p>
            ${tool}
        </div>`;
    }
    /**
     * 格式化字符串，超过最大长度的部分用...代替
     * @param str 源字符串
     * @param max 最大长度
     * @param OmitWhere 在前面还是后面省略，前面为"front"，后面为"back"
     * @returns 处理后的字符串
     */
    static format(str: string, max?: number, OmitWhere?: "front" | "back"): string;
    /**
     * 格式化字符串，超过最大长度的部分用...代替
     * @param str 源字符串
     * @param max 最大长度
     * @param midPoint 尽量居于中间位置的下标
     * @returns 处理后的字符串
     */
    static format(str: string, max?: number, midPoint?: number): string;
    static format(str: string, max: number = showOtherMaxLength, OmitWhereOrMidPoint: "front" | "back" | number = "back"): string {
        if (str.length == 0) {
            return "暂无";
        }
        let left: number = max;
        if (OmitWhereOrMidPoint === "front") {
            for (let i = str.length - 1; i >= 0; i--) {
                left -= isFullWidthChar(str[i]) ? 2 : 1;
                if (left < 0) {
                    return "..." + str.slice(i + 1);
                }
            }
        } else if (OmitWhereOrMidPoint === "back") {
            for (let i = 0; i < str.length; i++) {
                left -= isFullWidthChar(str[i]) ? 2 : 1;
                if (left < 0) {
                    return str.slice(0, i) + "...";
                }
            }
        } else {
            let startIdx = Math.floor(OmitWhereOrMidPoint - max / 2);
            if (startIdx < 0) startIdx = 0;
            let endIdx = startIdx + max;
            if (endIdx > str.length) endIdx = str.length;
            let ans = "";
            if (startIdx > 0) {
                ans += "...";
            }
            ans += str.slice(startIdx, endIdx);
            if (endIdx < str.length) {
                ans += "...";
            }
            return ans;
        }
        return str;
    }
    /**
     * 获取密码的基本html
     * @param isBin 是否是回收站的密码
     * @returns HTML代码
     * @description 这个函数是为了避免重复代码而写的，主要是为了在getHtml和getHtmlBin中使用
     */
    private getBaseHtml(isBin: boolean = false): HTMLCode {
        return `<p>来源：${Password.format(this.from)}</p>
            <p>用户名：${Password.format(this.uname)}</p>
            <p>密码：******</p>
            ${this.email == "" ? "" : `<p>邮箱：${Password.format(this.email)}</p>`}
            ${this.phone == "" ? "" : `<p>手机号：${Password.format(this.phone)}</p>`}
            ${this.note == "" ? "" : `<p>备注：${Password.format(this.note, showNoteMaxLength)}</p>`}
            <p>${isBin ? "删除时间" : "修改时间"}：${getReadableTime(isBin ? this.rmDate! : this.moDate)}</p>`
    };
    /**
     * 检查当前密码是否在folder或folder的子孙目录的目录下
     * @param folder 文件夹
     * @returns 结果
     */
    isin(folder: Folder): boolean {
        const f = folder.stringify()
        return f == this.getParent().stringify().slice(0, f.length);
    }
    /**
     * 获得密码的深度
     * @returns 深度
     * @description 深度是指密码所在的文件夹树中的层数，主文件夹下为1，子文件夹为2，孙子文件夹为3，以此类推
     * @example :/hello/password => 2
     */
    deepth(): number {
        return this.getParent().deepth() + 1;
    }
    /**
     * 检查这个密码是否被二级锁加密了
     */
    isLocked(): boolean {
        return this.getParent().isLocked();
    }
    /**
     * 得到密码所在的文件夹
     * @returns 文件夹
     */
    getParent(): Folder {
        let p: Folder | null = null;
        folderList.forEach(v => {
            if (v.stringify() == this.dir) p = v;
        })
        if (p) return p;
        return Folder.fromString(this.dir);
    }
    setParent(parent: Folder): void {
        this.dir = parent.stringify()
    }
}

/**
 * 文件夹类
 * @member name 文件夹名称
 * @member parent 文件夹路径
 * @member moDate 修改日期
 * @member rmDate 删除日期
 * @member type 文件夹类型
 * @member lock 加密锁密码
 * @member cachePwd 如果用户已经输入过了密码，则缓存密码
 * @member pin 是否置顶
*/
class Folder {
    /**
    ":/a/"表示在主文件夹下的a文件夹内
    ""表示在主文件夹下
    特别的，主文件夹的name为":"，parent为""，在回收站中的文件name为"~"，parent为""
     */
    name: string;
    private parent: string;
    moDate: string;
    rmDate: string | null;
    lock: string | null = null; // 加密锁
    timelock: string | null = null;
    cachePwd: string | null = null; // 缓存密码
    type: Type = Type.Folder;
    pin: boolean = false;
    constructor(data: Folder);
    constructor(name: string, parent?: string, time?: string);
    constructor(nameOrClass: string | Folder, parent: string = ":", time: string = Date.now().toString()) {
        this.type = Type.Folder;
        if (typeof nameOrClass === "string") {
            this.name = nameOrClass;
            this.parent = parent;
            this.moDate = time;
            this.rmDate = null;
        } else {
            this.name = nameOrClass.name;
            this.parent = nameOrClass.parent;
            this.moDate = nameOrClass.moDate;
            this.rmDate = nameOrClass.rmDate;
            this.lock = nameOrClass.lock === undefined ? null : nameOrClass.lock; // 为了兼容旧版本
            this.cachePwd = nameOrClass.cachePwd === undefined ? null : nameOrClass.cachePwd; // 为了兼容旧版本
            this.timelock = nameOrClass.timelock === undefined ? null : nameOrClass.timelock; // 为了兼容旧版本
            this.pin = nameOrClass.pin === undefined ? false : nameOrClass.pin; // 为了兼容旧版本
        }
    }
    /**
     * 得到基础的HTML代码
     * @param id 作为这个HTML的唯一身份标识符的一部分，而给的一个编号
     * @param checkable 是否可以被选择
     * @returns HTML代码
     */
    getHtml(id: number, checkable: boolean = false): HTMLCode {
        let inner = `
        <p><img class="FolderIcon" style="margin-right: 8px;" src="./resources/folder.png">${this.name}</p>
        <p>修改日期：${getReadableTime(this.moDate)}</p>
        <div class="tool" style="width: ${checkable ? "39vw" : "43vw"};">
            <div class="attrib-group">
                ${this.lock !== null && this.cachePwd === null ? `<img src="../pages/resources/lock.png" title="此文件夹已被加密！" class="icon attrib" data-bs-toggle="tooltip" data-bs-placement="top">` : ""}
                ${this.lock !== null && this.cachePwd !== null ? `<img src="../pages/resources/unlock.png" title="此文件夹已解锁！点击以加密" class="icon attrib" data-bs-toggle="tooltip" data-bs-placement="top" id="folder${id}-unlocked">` : ""}
                ${this.timelock !== null && UserPlugin.isPluginEnable("Time-Lock") && Number(this.timelock) > Date.now() ? `<img src="../pages/resources/time-lock.png" title="时间锁限制" class="icon attrib" data-bs-toggle="tooltip" data-bs-placement="top">` : ""}
            </div>
            <div class="tool-group">
                <img class="icon" id="folder${id}-edit" style="margin-right: 8px;" src="./resources/edit.png" data-bs-toggle="tooltip" data-bs-placement="top" title="重命名">
                <img class="icon" id="folder${id}-delete" src="./resources/delete.png" data-bs-toggle="tooltip" data-bs-placement="top" title="删除">
                <img class="icon" id="folder${id}-pin" ${this.pin ? `src="./resources/pin-off.png" title="取消置顶"` : `src="./resources/pin.png" title="置顶"`} data-bs-toggle="tooltip" data-bs-placement="top">
            </div>
        </div>`
        if (checkable) return `<div class="card info" style="flex-direction: row;" id="folder${id}" draggable="true">
            <div class="checkbox" id="folder${id}-checkboxDiv"><input type="checkbox" id="folder${id}-checkbox"></div>
            <div class="check-content">
                ${inner}
            </div>
        </div>`;
        else return `<div class="card info" id="folder${id}" draggable="true">
            ${inner}
        </div>`;
    }
    /**
     * 得到卡片形式的HTML代码
     * @param id 作为这个HTML的唯一身份标识符的一部分，而给的一个编号
     * @param checkable 是否可以被选择
     * @param searchPart 被搜索出来，需要标红的部分，默认为undefined，表示不搜索
     * @returns HTML代码
     */

    getCard(id: number, isBin: boolean = false, searchPart: string): HTMLCode {
        let newname = this.name;
        if (searchPart) {
            const regStr = searchPart.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"); // 转义正则表达式特殊字符
            const reg = new RegExp(regStr, "i");
            const match = this.name.match(reg);
            if (match && match.index !== undefined) {
                // 格式化到合适长度
                let formatted = Password.format(this.name, showSearchMaxLength, match.index + match[0].length / 2);
                // 格式化后还能匹配则高亮，否则整体标红
                if (new RegExp(regStr, "i").test(formatted)) {
                    newname = formatted.replace(new RegExp(regStr, "i"), (m) => `<span class="highlight">${m}</span>`);
                } else {
                    newname = `<span class="highlight">${formatted}</span>`;
                }
            } else {
                // 源文本无法匹配，正常格式化
                newname = Password.format(this.name, showSearchMaxLength);
            }
        } else {
            newname = Password.format(this.name, showSearchMaxLength);
        }
        return `
        <div class="card" style="width: 100%;" id="card${id}">
            <div class="card-body">
                <p class="card-text">
                    <p>路径：${Password.format(Folder.fromString(this.parent).toReadableText(), showPathMaxLength, "front")}</p>
                    <p>文件名：${newname}</p>
                    <p>${isBin ? "删除时间" : "修改时间"}：${getReadableTime(isBin ? this.rmDate! : this.moDate)}</p>
                    ${isBin ? "" : `<button type="button" class="btn ${isBin ? "btn-secondary" : "btn-primary"}" id="card${id}-path">进入该文件夹</button>`}
                </p>
            </div>
        </div>
        `
    }

    /**
     * 得到回收站形式的HTML代码
     * @param id 作为这个HTML的唯一身份标识符的一部分，而给的一个编号
     * @param checkable 是否可以被选择
     * @returns HTML代码
     */
    getHtmlBin(id: number, checkable: boolean = false): HTMLCode { // 获取密码在bin页面的html
        let tool = `<div class="tool" style="width: ${checkable ? "39vw" : "43vw"};">
            <div class="tool-group">
                <p class="icon" id="bin${id}-recover" style="margin-right: 8px;">恢复</p>
                <p class="icon" id="bin${id}-delete">删除</p>
            </div>
            </div>`;
        let inner = `
        <p><img class="FolderIcon" style="margin-right: 8px;" src="./resources/folder.png">${this.name}</p>
        <p>删除日期：${getReadableTime(this.rmDate!)}</p>
        <p>原路径：${this.toReadableText()}</p>
        ${tool}
        `;
        if (checkable) return `<div class="info" style="flex-direction: row;" id="bin${id}" draggable="true">
            <div class="checkbox" id="bin${id}-checkboxDiv"><input type="checkbox" id="bin${id}-checkbox"></div>
            <div class="check-content">
                ${inner}
            </div>
        </div>`;
        return `
        <div class="info" id="bin${id}" draggable="true">
            ${inner}
        </div>
        `;
    }
    /**
     * 获得根目录文件夹
     * @returns 根目录
     */
    static root(): Folder {
        return new Folder(":", "");
    }
    /**
     * 获得回收站文件夹
     * @returns 回收站
     */
    static bin(): Folder {
        return new Folder("~", "");
    }
    /**
     * 获得主文件夹
     * @returns 主文件夹
     */
    static home(): Folder {
        return new Folder("H", "");
    }
    /**
     * 获得设置文件夹
     * @returns 设置文件夹
     */
    static setting(): Folder {
        return new Folder("SET", "");
    }
    /**
     * 获得搜索文件夹
     * @returns 搜索文件夹
     */
    static search(): Folder {
        return new Folder("SCH", "");
    }
    /**
     * 获得更改文件文件夹
     * @returns 标志着更改文件的文件夹
     */
    static change(): Folder {
        return new Folder("C", "");
    }
    /**
     * 获得添加文件文件夹
     * @returns 标志着添加文件的文件夹
     */
    static append(): Folder {
        return new Folder("A", "");
    }
    /**
     * 获得显示文件文件夹
     * @returns 标志着显示文件的文件夹
     */
    static show(): Folder {
        return new Folder("SHW", "");
    }
    /**
     * 获得插件文件夹
     * @returns 标志着插件的文件夹
     */
    static plugin(): Folder {
        return new Folder("P", "");
    }
    /**
     * 获取子目录
     * @param dirname 目录名称
     * @returns 子目录
     */
    subDir(dirname: string): Folder {
        return new Folder(dirname, this.stringify());
    }
    /**
     * 判断是否是系统文件夹
     */
    isSystemFolder(): boolean {
        return this.parent == "";
    }
    /**
     * 通过字符串获得文件夹对象
     * @param str 文件夹路径
     * @param time 时间戳
     * @returns 文件夹对象
     */
    static fromString(str: string, time: string = Date.now().toString()): Folder {
        if (str[str.length - 1] != "/") str += "/";
        const arr = str.split("/");
        let k = arr.slice(0, arr.length - 2).join("/");
        return new Folder(arr[arr.length - 2], k == "" ? "" : k + "/", time);
    }
    /**
     * 获得文件夹的字符串表示
     * @returns 文件夹路径
     */
    stringify(): string {
        return this.parent + this.name + "/";
    }
    /**
     * 比较两个文件夹是否相同
     * @param folder 要比较的文件夹
     * @returns 比较结果
     */
    isSame(folder: Folder): boolean {
        return this.stringify() == folder.stringify();
    }
    /**
     * 更改路径
     * @param parent 新的父文件夹
     */
    setParent(parent: Folder) {
        this.parent = parent.stringify();
    }
    /**
     * 获得父文件夹对象
     * @returns 父文件夹对象
     * @throws 当当前文件夹是系统文件夹时，报错：System folder doesn't have parent.
     */
    getParent(): Folder {
        if (this.isSystemFolder()) throw new Error("System folder doesn't have parent.");
        let p = null;
        folderList.forEach(element => {
            if (element.stringify() == this.parent) {
                p = element;
            }
        });
        if (p) return p;
        return Folder.fromString(this.parent);
    }
    /**
     * 判断item是否包含在当前文件夹中
     * @param item 要检查的文件或文件夹
     * @returns 结果
     */
    isInclude(item: Item): boolean {
        if (item.type == Type.Folder) return (<Folder>item).parent == this.stringify();
        else return item.getParent().isSame(this);
    }
    /**
     * 判断当前文件夹是否在folder或folder的后代文件夹下
     * @param folder 要检查的文件夹
     * @returns 结果
     */
    isin(folder: Folder): boolean {
        const f = folder.stringify()
        if (this.isSame(folder)) return false;
        return f == this.stringify().slice(0, f.length);
    }
    /**
     * 判断当前文件夹是否是folder或folder的后代文件夹
     * @description 这个函数和isin不同的是，它会检查当前文件夹是否和folder相同，
     * @param folder 要检查的文件夹
     * @returns 结果
     */
    isOrIn(folder: Folder): boolean {
        if (folder.isSame(this)) return true;
        return this.isin(folder);
    }
    /**
     * 可读的HTML代码
     * @returns 结果，其中，num表示层级数
     */
    toReadableHTML(): { html: HTMLCode, num: number } {
        let ans: string = this.stringify(), lans: Array<{ text: string, index: number }> = [{ text: "主文件夹", index: 1 }], tmp: string = "";
        for (let i = 2; i < ans.length; i++) {
            if (ans[i] == "/") {
                lans.push({ text: tmp, index: i });
                tmp = "";
            }
            else tmp += ans[i];
        }
        // 检查长度
        let length = 0, maxindex = 0;
        for (let i = lans.length - 1; i >= 0; i--) {
            length += lans[i].text.length;
            if (length > showPathMaxLength) {
                if (i == lans.length - 1) {
                    lans[i].text = Password.format(lans[i].text, showPathMaxLength, "front");
                    maxindex = i;
                }
                else maxindex = i + 1;
                break;
            }
            length += 2;
        }
        let tgtHtml: string = "";
        if (maxindex != 0)
            tgtHtml += `<li class="breadcrumb-item active"><p>...</p></li>`;
        for (let i = maxindex; i < lans.length; i++) {
            if (i == lans.length - 1) {
                tgtHtml += `<li class="breadcrumb-item active" aria-current="page"><p data-location="${ans.slice(0, lans[i].index)}" id="dirItem${i}">${lans[i].text}</p></li>`;
            } else {
                tgtHtml += `<li class="breadcrumb-item"><p class="action" data-location="${ans.slice(0, lans[i].index)}" id="dirItem${i}">${lans[i].text}</p></li>`;
            }
        }
        return {
            html: `
        <nav style="--bs-breadcrumb-divider: '>';" aria-label="breadcrumb">
            <ol class="breadcrumb">
                ${tgtHtml}
            </ol>
        </nav>
        `, num: lans.length
        };
    }
    /**
     * 可读的文本
     * @returns 结果
     */
    toReadableText(): string {
        let ans: string = this.stringify(), lans: string = "主文件夹";
        for (let i = 1; i < ans.length - 1; i++) {
            if (ans[i] == "/") lans += " > ";
            else lans += ans[i];
        }
        return lans;
    }
    /**
     * 获得文件夹的深度
     * @returns 深度
     * @description 深度是指文件夹的层数，主文件夹为0，子文件夹为1，孙子文件夹为2，以此类推
     * @example :/hello/world/ => 2
     */
    deepth(): number {
        let ans: string = this.stringify(), deepth: number = 0;
        for (let i = 0; i < ans.length; i++) {
            if (ans[i] == "/") deepth++;
        }
        // 可是深度是从0开始的，所以要减去1
        if (deepth > 0) deepth--;
        return deepth;
    }
    /**
     * 判断给文件夹是否还被加密
     * @description 一个文件夹时被加密的，当且仅当该文件夹或其父文件夹有密码，即lock属性不为null
     */
    isLocked(): boolean {
        let folder: Folder = this;
        while (!folder.isSystemFolder()) {
            if (folder.lock !== null && folder.cachePwd === null) return true;
            folder = folder.getParent();
        }
        return false;
    }
}

/**
 * 排序类型枚举
 * @description 用于排序的枚举类型
 * @member time_early 按照时间从早到晚排序
 * @member time_late 按照时间从晚到早排序
 * @member name 按照名称从小到大排序
 * @member name_reverse 按照名称从大到小排序
 */
enum SortBy {
    time_early,
    time_late,
    name,
    name_reverse
}

type GenerateRandomPwdSetting = {
    /**字母权值*/
    weightOfLetter: number,
    /**数字权值*/
    weightOfNum: number,
    /**标点权值*/
    weightOfPunc: number
}

class MainSetting {
    /**自动复制密码 */
    autoCopy: boolean = false;
    /**密码排序方式 */
    pwdSortBy: SortBy = SortBy.name;
    /**文件夹排序方式 */
    folderSortBy: SortBy = SortBy.name;
    /**主密码提示 */
    mainPwdTip: string = "";
    /**密码随机生成器设置 */
    generateRandomPwdSetting: GenerateRandomPwdSetting = {
        weightOfLetter: 5,
        weightOfNum: 3,
        weightOfPunc: 1
    }
}

/**
 * 数据保存
 * @description 保存数据到本地磁盘
 */
function saveData(): void { // 保存数据
    // 数据保存
    let data = getData();
    window.fs.save(curPath, data);
}

/**
 * 保存编辑器数据
 */
function saveEditorData(): void { // 保存数据
    window.fs.save("./editor", getEditorData());
}

/**
 * 获得加密后的数据
 * @param ismemory 是否使用内存密码
 * @returns 数据
 */
function getData(ismemory: boolean = isremember): string {
    let salt: string = randstr(16);
    let enc = Cryp.pbkdf2(mainPwd, salt)
    let pwdListUpdated: Array<Password> = []
    let folderListUpdated: Array<Folder> = [];
    let folderListUpdatedCopy: Array<Folder> = []; // 复制一份文件夹列表，用于加密
    let binItemUpdated: Array<Item> = [];
    let tasksUpdated: Array<TaskMapCrypto> = [];

    for (let i = 0; i < pwdList.length; i++) {
        pwdListUpdated.push(new Password(pwdList[i]));
    }
    for (let i = 0; i < folderList.length; i++) {
        folderListUpdated.push(new Folder(folderList[i]));
        folderListUpdatedCopy.push(new Folder(folderList[i]));
    }

    // 通过文件夹深度从大到小排序
    folderListUpdatedCopy.sort((a, b) => {
        return b.deepth() - a.deepth();
    });

    for (let i = 0; i < folderListUpdatedCopy.length; i++) {
        if (folderListUpdatedCopy[i].lock !== null && folderListUpdatedCopy[i].cachePwd !== null) {
            lockFolder(folderListUpdatedCopy[i], folderListUpdated, pwdListUpdated);
        }
    }

    for (let index = 0; index < pwdList.length; index++) {
        pwdListUpdated[index] = encrypt(pwdListUpdated[index], enc) as Password;
    }
    for (let index = 0; index < folderList.length; index++) {
        folderListUpdated[index] = encrypt(folderListUpdated[index], enc) as Folder;
    }
    for (let index = 0; index < binItem.length; index++) {
        binItemUpdated.push(encrypt(binItem[index], enc) as Item);
    }
    for (let index = 0; index < DONETasks.length; index++) {
        tasksUpdated.push(DONETasks[index].enc(enc));
    }
    let encScore = Cryp.encrypt(score.toString(), enc);
    let enclevel = Cryp.encrypt(level.toString(), enc);
    let encSignUpTime = Cryp.encrypt(signUpTime, enc);
    // 数据保存
    return JSON.stringify({
        version: "1.4.1",
        name: repoName,
        pwd: pwdListUpdated,
        folder: folderListUpdated,
        bin: binItemUpdated,
        mainPwd: Cryp.pbkdf2(enc, salt),
        mainSetting: mainSetting,
        salt: salt,
        memory: ismemory ? mainPwd : null,
        isPwdNull: mainPwd === "",
        DONETasks: tasksUpdated,
        score: encScore,
        level: enclevel,
        signUpTime: encSignUpTime,
    });
}

/**
 * 获得编辑器数据的文本
 * @returns 文本
 */
function getEditorData(): string {
    let encPlugins: Object[] = [];
    nowPlugins.forEach((v => {
        encPlugins.push(v.toEncObj());
    }))
    // 数据保存
    let data = {
        version: "e1.0",
        search: searchMemory,
        umcFilePaths: umcFilePaths,
        editorSetting: editorSetting,
        plugins: encPlugins,
        menu: {
            view: window.ProgramMenu.getViewMenu()
        },
    };
    return JSON.stringify(data);
}

/**
 * 对于一个已经被解锁的文件夹，重新进行加密
 * @param folder 已被上锁且被解锁的文件夹
 */
function lockFolder(folder: Folder, foldersList: Folder[] = folderList, pwdsList: Password[] = pwdList): void {
    // 首先判断一下是否正在被加密
    if (folder.lock !== null && folder.cachePwd === null) return;
    if (folder.lock === null) {
        console.log("加密失败，因为文件夹没有被加密");
        return;
    }
    foldersList.forEach((v, idx) => {
        if (v.isin(folder) && !v.isSame(folder)) {
            foldersList[idx] = encrypt(v, Cryp.pbkdf2(folder.cachePwd!), ["parent"]) as Folder;
        }
    });
    pwdsList.forEach((v, idx) => {
        if (v.isin(folder)) {
            pwdsList[idx] = encrypt(v, Cryp.pbkdf2(folder.cachePwd!), ["dir"]) as Password;
        }
    });
    folder.cachePwd = null;
}

/**
 * 保存UMC数据到指定路径
 * @param path 文件路径
 */
function saveUMC(path: string): void {
    window.fs.save(path, getData(false));
    mkDialog("导出成功！", `成功导出至${path}`);
}

/**
 * 读取UMC数据
 * @param path 文件路径
 */
function readUMC(path: string): void {
    window.fs.read(path)
        .then((res) => {
            window.fs.save("./data", res);
            mkDialog("导入成功！", "重启以应用数据，是否立即重启？", ["立即重启", "再等等"], { isStatic: true })
                .then((res) => {
                    if (res == 0) location.reload();
                })
        })
}