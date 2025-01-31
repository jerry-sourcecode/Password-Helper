const {contextBridge, ipcRenderer} = require('electron');
const crypto = require('crypto-js');

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