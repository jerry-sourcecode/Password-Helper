const {app, BrowserWindow, ipcMain, dialog, Menu} = require("electron");
const path = require('path');
const fs = require('fs');

const projectRoot = app.getAppPath();
let defaultPath = app.getPath("home");

const MenuTemplate = [
    {
        label: '帮助',
        submenu: [
            {
                label: '正则表达式',
                click: () => {
                    const win = createWindow("正则表达式", "./src/pages/regex.html", ()=>{return;});
                }
            },
        ]
    }
];

function setIpc(win){
    ipcMain.on("save-file", (event, filename, data)=>{
        if (filename[0] !== '.') fs.writeFileSync(filename, data);
        else fs.writeFileSync(path.join(projectRoot, filename), data);
    });
    ipcMain.handle("read-file", (event, filename)=>{
        if (filename[0] === '.') filename = path.join(projectRoot, filename);
        let k;
        try{
            k = new Promise((resolve, resject) => {
                resolve(fs.readFileSync(filename, 'utf-8'));
            }) 
        } catch(e){
            k = new Promise((resolve, resject) => {
                resject(e);
            }) 
        }
        return k;
    });
    ipcMain.on("msg", (event, title, type, msg, choice)=>{
        event.returnValue = dialog.showMessageBoxSync(win, {
            type: type,
            title: title,
            message: msg,
            buttons: choice,
            cancelId: -1
        });
    });
    ipcMain.on("open-msg", (event, title, msg, filters)=>{
        let i = defaultPath.length - 1;
        while(defaultPath[i] != "/" && defaultPath[i] != "\\") i--;
        let ans = dialog.showOpenDialogSync(win, {
            title: title,
            message: msg,
            properties: ['openFile'],
            filters: filters,
            defaultPath: defaultPath.slice(0, i+1)
        });
        if (ans !== undefined){
            defaultPath = ans[0];
            event.returnValue = ans[0];
        } else {
            event.returnValue = undefined;
        }
    });
    ipcMain.on("save-msg", (event, title, msg, filters)=>{
        let i = defaultPath.length - 1;
        while(defaultPath[i] != "/" && defaultPath[i] != "\\") i--;
        let ans = dialog.showSaveDialogSync(win, {
            title: title,
            message: msg,
            filters: filters,
            properties: ['createDirectory'],
            defaultPath: defaultPath.slice(0, i+1)
        });
        if (ans !== undefined){
            defaultPath = ans;
            event.returnValue = ans;
        } else {
            event.returnValue = undefined;
        }
    });
}

/**
 * 创造一个窗口
 * @param {string} title 窗口名
 * @param {string} loadFile 载入文件的相对路径
 * @param {Function} callbacks 回调函数，在创造窗口前执行，有参数win，表示创造出的窗口对象
 * @returns 一个 BrowserWindow 对象，创造出的窗口对象
 */
function createWindow(title, loadFile, callbacks = (win) => {return;}) {
    const isDebug = true;
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, "./preload.js"),
            sandbox: false,
            devTools: isDebug,
        },
        title: title
    })

    if (!isDebug){
        win.webContents.on('before-input-event', (event, input) => {
            if ((input.control || input.meta) && input.key.toLowerCase() === 'r') {
              event.preventDefault();
            }
        });
    }
    callbacks(win);

    win.show();

    win.loadFile(loadFile)
    return win;
}

app.on("ready", ()=>{
    const appMenu = Menu.buildFromTemplate(MenuTemplate);
    Menu.setApplicationMenu(appMenu);
    const win = createWindow("Password Helper", "./src/pages/index.html", (win) => {
        setIpc(win);
        win.maximize();
    });
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})