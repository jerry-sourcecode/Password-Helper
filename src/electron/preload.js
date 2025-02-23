const {contextBridge, ipcRenderer, dialog} = require('electron');
const crypto = require('crypto-js');

contextBridge.exposeInMainWorld("fs",{
    save: (filename, data) => {
        ipcRenderer.send("save-file", filename, data);
    },
    read: (filename) => {
        return ipcRenderer.invoke("read-file", filename)
    }
});

contextBridge.exposeInMainWorld("msg",{
    info: (title, msg, choice = ["确定"]) => ipcRenderer.send("msg", title, "info", msg, choice),
    warning: (title, msg, choice = ["确定"]) => ipcRenderer.send("msg", title, "warning", msg, choice),
    infoSync: (title, msg, choice = ["确定"]) => ipcRenderer.sendSync("msg", title, "info", msg, choice),
    warningSync: (title, msg, choice = ["确定"]) => ipcRenderer.sendSync("msg", title, "warning", msg, choice),
    showOpenDialogSync: (title, msg, filters) => ipcRenderer.sendSync("open-msg", title, msg, filters),
    showSaveDialogSync: (title, msg, filters) => ipcRenderer.sendSync("save-msg", title, msg, filters),
});

contextBridge.exposeInMainWorld("cryp",{
    encrypt(data, key){
        return crypto.AES.encrypt(data, key).toString();
    },
    decrypt(data, key){
        return crypto.AES.decrypt(data, key).toString(crypto.enc.Utf8);
    },
    pbkdf2(data, salt){
        return crypto.PBKDF2(data, salt, {
                    keySize: 256 / 32,
                    iterations: 10,
                    hasher: crypto.algo.SHA256
                }).toString(crypto.enc.Hex);
    }
});