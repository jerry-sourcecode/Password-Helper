import { app, BrowserWindow, ipcMain, dialog, Menu } from "electron";
import type { FileFilter, IpcMainEvent, MenuItemConstructorOptions } from "electron";
import path from "path";
import fs from "fs";

const projectRoot = app.getAppPath();
let defaultPath = app.getPath("home");

let windowList: BrowserWindow[] = [];

function getMenuTemplate(): MenuItemConstructorOptions[] {
    return [
        {
            label: "视图",
            submenu: [
                {
                    label: "搜索",
                    type: "checkbox" as const,
                    checked: true,
                    click: (menuItem) => {
                        windowList.forEach((win) => {
                            win.webContents.send(
                                "view",
                                "search",
                                (menuItem as Electron.MenuItem).checked
                            );
                        });
                    },
                },
                {
                    label: "插件",
                    type: "checkbox" as const,
                    checked: true,
                    click: (menuItem) => {
                        windowList.forEach((win) => {
                            win.webContents.send(
                                "view",
                                "plugin",
                                (menuItem as Electron.MenuItem).checked
                            );
                        });
                    },
                },
            ],
        },
        {
            label: "帮助",
            submenu: [
                {
                    label: "正则表达式",
                    click: () => {
                        createWindow(
                            "正则表达式",
                            "./src/pages/regex.html"
                        );
                    },
                },
                {
                    label: "Github",
                    click: () => {
                        createWindow(
                            "Github",
                            "https://www.github.com/jerry-sourcecode/password-helper",
                            { isURL: true }
                        );
                    },
                },
                {
                    label: "关于",
                    click: () => {
                        createWindow(
                            "关于",
                            "./src/pages/about.html"
                        );
                    },
                },
            ],
        },
    ];
}

/**
 * 不修改绝对路径，同时将相对路径补全为绝对路径
 * @param {string} filename 待处理的文件名
 * @returns 经过处理的文件名
 */
function completePath(filename: string) {
    filename = filename.trim().replace(/^"(.*)"$/, "$1"); // 删除首尾的引号
    let targetPath;
    if (path.isAbsolute(filename)) {
        // 处理相对路径
        targetPath = filename;
    } else {
        targetPath = path.join(projectRoot, filename);
    }
    return targetPath;
}

let readFileHandlerRegistered = false;

function setIpc(win: BrowserWindow) {
    ipcMain.on("save-file", (event: IpcMainEvent, targetPath: string, data: string) => {
        targetPath = completePath(targetPath);
        // 自动创建父目录
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        fs.writeFileSync(targetPath, data);
        event.returnValue = true;
    });
    if (!readFileHandlerRegistered) {
        ipcMain.handle("read-file", (event: IpcMainEvent, targetPath: string) => {
            try {
                targetPath = completePath(targetPath);
                return fs.readFileSync(targetPath, "utf-8");
            } catch (e) {
                console.error("READFILE ERROR!!!");
                throw e;
            }
        });
        readFileHandlerRegistered = true;
    }
    ipcMain.on("open-msg", (event: IpcMainEvent, title: string, msg: string, filters: FileFilter[], allowMulti: boolean) => {
        let i = defaultPath.length - 1;
        while (defaultPath[i] != "/" && defaultPath[i] != "\\") i--;
        let ans = dialog.showOpenDialogSync(win, {
            title: title,
            message: msg,
            properties: ["openFile", allowMulti ? "multiSelections" : undefined],
            filters: filters,
            defaultPath: defaultPath.slice(0, i + 1),
        });
        if (ans !== undefined) {
            defaultPath = ans[0];
            event.returnValue = ans;
        } else {
            event.returnValue = undefined;
        }
    });
    ipcMain.on("save-msg", (event: IpcMainEvent, title: string, msg: string, filters: FileFilter[]) => {
        let i = defaultPath.length - 1;
        while (defaultPath[i] != "/" && defaultPath[i] != "\\") i--;
        let ans = dialog.showSaveDialogSync(win, {
            title: title,
            message: msg,
            filters: filters,
            properties: ["createDirectory"],
            defaultPath: defaultPath.slice(0, i + 1),
        });
        if (ans !== undefined) {
            defaultPath = ans;
            event.returnValue = ans;
        } else {
            event.returnValue = undefined;
        }
    });
    ipcMain.on("have-file", (event: IpcMainEvent, filepath: string) => {
        filepath = completePath(filepath);
        fs.access(filepath, fs.constants.F_OK, (err: Error) => {
            if (err) event.returnValue = false;
            else event.returnValue = true;
        });
    });
    ipcMain.on("start-new-process", (e: IpcMainEvent, path: string) => {
        let arg: string[] = [];
        if (path !== undefined) arg.push(`--repoPath=${path}`);
        createWindow("Password Helper", "./src/pages/index.html", {
            isURL: false,
            argu: arg,
        });
    });
    ipcMain.on("complete-path", (event: IpcMainEvent, filepath: string) => {
        event.returnValue = completePath(filepath);
    });
    ipcMain.on("get-menu", (event: IpcMainEvent) => {
        const menu = Menu.getApplicationMenu().items.find(
            (item) => item.label === "视图"
        ).submenu.items;
        event.returnValue = {
            plugin: menu.find((item) => item.label === "插件").checked,
            search: menu.find((item) => item.label === "搜索").checked,
        };
    });
}

/**
 * 创造一个窗口
 * @param {string} title 窗口名
 * @param {string} loadFile 载入文件的相对于项目的相对路径
 * @param {Function} callbacks 回调函数，在创造窗口前执行，有参数win，表示创造出的窗口对象
 * @param options 可选参数，其中，isURL为是时，loadfile可以填写一个URL
 * @returns 一个 BrowserWindow 对象，创造出的窗口对象
 * @example createWindow("Hello World", "index.html", (win) => {alert("done!")})
 * // 这段代码创建了一个窗口名称为"Hello World"，使用"index.html"进行创建，在窗口完成前，会调用alert显示
 */
function createWindow(
    title: string,
    loadFile: string,
    options: {
        isURL?: boolean,
        argu?: string[],
        callbacks?: (win: BrowserWindow) => void
    } = { isURL: false, argu: [], callbacks: () => { } }
) {
    const isDebug = true;
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, "./preload.js"),
            sandbox: false,
            devTools: isDebug,
            contextIsolation: true,
            additionalArguments: options.argu,
        },
        title: title,
    });

    win.webContents.on(
        "did-fail-load",
        (event, errorCode, errorDescription, validatedURL) => {
            console.error(
                "页面加载失败:",
                errorCode,
                errorDescription,
                validatedURL
            );
        }
    );
    if (!isDebug) {
        win.webContents.on("before-input-event", (event, input) => {
            if (
                (input.control || input.meta) &&
                input.key.toLowerCase() === "r"
            ) {
                event.preventDefault();
            }
            if (
                (input.control || input.meta) &&
                input.shift &&
                input.key.toLowerCase() === "i"
            ) {
                event.preventDefault();
            }
        });
    } else {
        win.webContents.on("before-input-event", (event, input) => {
            if (
                (input.control || input.meta) &&
                input.shift &&
                input.key.toLowerCase() === "i"
            ) {
                win.webContents.openDevTools();
                event.preventDefault();
            }
            if (
                (input.control || input.meta) &&
                input.key.toLowerCase() === "r"
            ) {
                event.preventDefault();
                win.webContents.reload();
            }
        });
    }
    if (options.callbacks) options.callbacks(win);

    win.show();

    // 加载URL或文件
    if (options.isURL) {
        win.loadURL(loadFile);
    } else {
        win.loadFile(path.join(projectRoot, loadFile));
    }

    const appMenu = Menu.buildFromTemplate(getMenuTemplate());
    Menu.setApplicationMenu(appMenu);

    windowList.push(win);

    return win;
}

app.on("ready", () => {
    const win = createWindow("Password Helper", "./src/pages/index.html", {
        callbacks: (win) => {
            setIpc(win);
            win.maximize();
            win.setAspectRatio(1);
        },
    });

    // Menu初始化
    try {
        let str = JSON.parse(
            fs.readFileSync(completePath("./editor"), "utf-8")
        );
        const menu = Menu.getApplicationMenu();
        const viewMenu = menu.items.find((item) => item.label === "视图");
        viewMenu.submenu.items.find((item) => item.label === "搜索").checked =
            str.menu.view.search;
        viewMenu.submenu.items.find((item) => item.label === "插件").checked =
            str.menu.view.plugin;
        // 通知Electron刷新菜单显示
        Menu.setApplicationMenu(menu);
    } catch (error) {
        const menu = Menu.getApplicationMenu();
        const viewMenu = menu.items.find((item) => item.label === "视图");
        viewMenu.submenu.items.find(
            (item) => item.label === "搜索"
        ).checked = true;
        viewMenu.submenu.items.find(
            (item) => item.label === "插件"
        ).checked = true;
        console.log(error);
    }

    // app.on("activate", () => {
    //     if (BrowserWindow.getAllWindows().length === 0) createWindow();
    // });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
