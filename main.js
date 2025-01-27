const {app, BrowserWindow, ipcMain, dialog} = require("electron")
const path = require('path');
const fs = require('fs')

function setIpc(win){
    ipcMain.on("save-file", (event, filename, data)=>{
        fs.writeFileSync(filename, data);
    });
    ipcMain.handle("read-file", (event, filename)=>{
        return fs.readFileSync(filename, 'utf-8');
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

    win.loadFile("./pages/index.html")
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