// 一个用于渲染插件市场的文件

/**
 * 记录一个用户插件
 */
class UserPlugin {
    /**插件名称 */
    name: string;
    /**插件的唯一标识符 */
    id: string;
    /**插件的简要描述 */
    desc: string;
    /**插件的README.html，即使用时的详细描述 */
    detail: HTMLCode;
    /**是否启用 */
    isEnabled: boolean;
    constructor(name: string, desc: string, detail: HTMLCode, id?: string);
    constructor(object: UserPlugin);
    constructor(nameORobject: string | UserPlugin, desc?: string, detail?: HTMLCode, id: string = "") {
        if (typeof nameORobject === "object") {
            this.name = nameORobject.name;
            this.desc = nameORobject.desc;
            this.isEnabled = nameORobject.isEnabled;
            this.detail = nameORobject.detail;
            this.id = nameORobject.id;
        } else {
            this.name = nameORobject;
            this.desc = desc!;
            this.isEnabled = false;
            this.detail = detail!;
            this.id = id === "" ? this.name : id;
        }
    }
    /**
     * 将插件对应的HTML显示卡牌安装到element上
     * @param element 目标节点
     */
    addElementIn(element: HTMLElement) {
        const pluginData = this;
        const newNode = document.createElement("div");
        newNode.classList.add("card", "plugin-info");
        newNode.style.width = "40vw";
        newNode.style.marginTop = "10px";
        newNode.style.color = this.isEnabled ? `#000000` : `#838383`;
        newNode.innerHTML = `
        <div class="card-body">
            <h5 class="card-title" style="font-weight: bold">${pluginData.name}</h5>
            <p class="card-title" style="text-indent: 2em">${pluginData.desc}</p>
            <a class="btn btn-primary" style="margin: 5px;" id="plugin-btnfor${pluginData.id}">${this.isEnabled ? `禁用` : `启用`}</a>
        </div>
        `
        element.appendChild(newNode);
        document.querySelector(`a#plugin-btnfor${pluginData.id}`)?.addEventListener("click", (e) => {
            e.stopPropagation();
            const tgt = e.target as HTMLElement;
            if (!this.isEnabled) {
                tgt.innerHTML = "禁用";
                newNode.style.color = "#000000"
                this.isEnabled = true;
                saveEditorData();
            } else {
                newNode.style.color = "#838383"
                tgt.innerHTML = "启用";
                this.isEnabled = false;
                saveEditorData();
            }
        })
        newNode.addEventListener("click", () => update(new Folder(this.id, Folder.plugin().stringify())))
    }
    static isPluginEnable(pluginName: string): boolean | undefined {
        for (let i = 0; i < nowPlugins.length; i++) {
            if (nowPlugins[i].id === pluginName) {
                return nowPlugins[i].isEnabled;
            }
        }
        return undefined;
    }
    toEncObj(): {
        id: string,
        enabled: boolean
    } {
        return {
            id: this.id,
            enabled: this.isEnabled
        }
    }
}

/**官方插件 */
const defaultPlugins: UserPlugin[] = [
    new UserPlugin(
        "时间锁",
        "一种新的方式来有效地保护你的密码",
        `
        <h1>插件：时间锁</h1>
        <h2>插件概述</h2>
        <p>本插件用于为文件夹增加安全屏障，使其在某一时刻前无法被解锁。</p>
        <h2>如何使用</h2>
        <p>进入一个文件夹，点击右上角工具栏的加密<img src="./resources/lock.png" class="icon">图标，然后就可以设置加密到什么时候了。</p>
        <p>被时间锁加密的文件夹会在左下角状态栏出现一个小图标<img src="./resources/time-lock.png" class="icon">，这就表示加密成功了。当用户想要尝试访问被时间锁加密过的文件时，会拒绝访问，并弹出提示。当时间到时，<img src="./resources/time-lock.png" class="icon">会自动消失，此时尝试访问文件夹，程序就不会拒绝访问了。</p>
        <h2>后悔药</h2>
        <p>后悔了？没关系，插件总会有后悔药。你可以通过关闭插件，来暂时访问被时间锁锁住的文件夹，但在插件重新打开时，文件夹会重新上锁。</p>
        `,
        "Time-Lock"
    )
]

/**
 * 进入插件页面
 * @param path 如果是Folder.plugin()，渲染插件市场页面，否则应该是一个在 Folder.plugin() 文件夹下的 Folder，其名字是某一个插件的id，渲染该插件的介绍页面。
 * @example 
 * _goPlugin(Folder.plugin()) => 插件市场页面
 * _goPlugin(new Folder("plugin", Folder.plugin().stringify())) => id为plugin的插件的详细介绍页面
 * @private 请不要使用这个函数，使用 update 函数
 */
function _goPlugin(path: Folder) {
    if (path.isSame(Folder.plugin())) {
        content.innerHTML = `
        <div class="title">插件市场</div>
        <div class="form" id="plugin-form">
        </div>`
        const form = document.querySelector("#plugin-form") as HTMLElement;
        nowPlugins.forEach((v) => {
            v.addElementIn(form);
        })
    } else {
        for (let i = 0; i < nowPlugins.length; i++) {
            if (path.name === nowPlugins[i].id) {
                content.innerHTML = `
                <div class="plugin-box">
                ${nowPlugins[i].detail}
                <button type="button" class="btn btn-primary" id="plugin-back" style="margin-left: auto;">返回</button>
                </div>
                `;
                document.querySelector("#plugin-back")?.addEventListener("click", () => update(Folder.plugin()))
                break;
            }
        }
    }
    return;
}