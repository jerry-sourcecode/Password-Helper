const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld("fs",{
    save: (filename, data)=>{
        ipcRenderer.send("save-file", filename, data);
    },
    read(filename){
        return ipcRenderer.invoke("read-file", filename)
    }
});

contextBridge.exposeInMainWorld("msg",{
    info(title, msg, choice = ["确定"]){
        return ipcRenderer.invoke("msg", title, "info", msg, choice);
    },
    warning(title, msg, choice = ["确定"]){
        return ipcRenderer.invoke("msg", title, "warning", msg, choice);
    },
});

contextBridge.exposeInMainWorld("cryp",{
    encrypt(data, key){
        return ipcRenderer.invoke("AES-enc", data, key);
    },
    decrypt(data, key){
        return ipcRenderer.invoke("AES-dec", data, key);
    },
    pbkdf2(data, salt){
        return ipcRenderer.invoke("PBKDF2", data, salt);
    }
});