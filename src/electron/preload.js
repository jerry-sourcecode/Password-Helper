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
    }
});