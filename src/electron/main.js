const {app, BrowserWindow, ipcMain, dialog} = require("electron");
const path = require('path');
const fs = require('fs');

const projectRoot = app.getAppPath();
let defaultPath = app.getPath("home");

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

function createWindow(){
    const isDebug = true;
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        autoHideMenuBar: true,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, './preload.js'),
            sandbox: false,
            devTools: isDebug
        },
        title: "Password Helper"
    })

    if (!isDebug){
        win.webContents.on('before-input-event', (event, input) => {
            if ((input.control || input.meta) && input.key.toLowerCase() === 'r') {
              event.preventDefault();
            }
        });
    }

    win.maximize();
    win.show();

    setIpc(win);

    win.loadFile("./src/pages/index.html")
}

app.on("ready", ()=>{
    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})