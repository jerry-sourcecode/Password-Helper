const {app, BrowserWindow, ipcMain, dialog} = require("electron");
const path = require('path');
const fs = require('fs');

const projectRoot = app.getAppPath();

function setIpc(win){
    ipcMain.on("save-file", (event, filename, data)=>{
        fs.writeFileSync(path.join(projectRoot, filename), data);
    });
    ipcMain.handle("read-file", (event, filename)=>{
        let k;
        try{
            k = new Promise((resolve, resject) => {
                resolve(fs.readFileSync(path.join(projectRoot, filename), 'utf-8'));
            }) 
        } catch(e){
            k = new Promise((resolve, resject) => {
                resject(e);
            }) 
        }
        return k;
    });
    ipcMain.handle("msg", async (event, title, type, msg, choice)=>{
        return dialog.showMessageBoxSync(win, {
            type: type,
            title: title,
            message: msg,
            buttons: choice,
            cancelId: -1
        });
    });
}

function createWindow(){
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, './preload.js')
        }
    })

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