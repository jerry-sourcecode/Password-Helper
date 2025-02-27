const {contextBridge, ipcRenderer, dialog} = require('electron');

contextBridge.exposeInMainWorld("fs",{
    save: (filename, data) => {
        ipcRenderer.send("save-file", filename, data);
    },
    read: (filename) => {
        return ipcRenderer.invoke("read-file", filename)
    },
});

contextBridge.exposeInMainWorld("msg",{
    info: (title, msg, choice = ["确定"]) => ipcRenderer.send("msg", title, "info", msg, choice),
    warning: (title, msg, choice = ["确定"]) => ipcRenderer.send("msg", title, "warning", msg, choice),
    infoSync: (title, msg, choice = ["确定"]) => ipcRenderer.sendSync("msg", title, "info", msg, choice),
    warningSync: (title, msg, choice = ["确定"]) => ipcRenderer.sendSync("msg", title, "warning", msg, choice),
    showOpenDialogSync: (title, msg, filters) => ipcRenderer.sendSync("open-msg", title, msg, filters),
    showSaveDialogSync: (title, msg, filters) => ipcRenderer.sendSync("save-msg", title, msg, filters),
});
