import type { IpcRendererEvent } from "electron";

const { contextBridge, ipcRenderer } = require("electron");
const filesystem = require("fs");

contextBridge.exposeInMainWorld("fs", {
    save: (filename: string, data: string) => {
        ipcRenderer.send("save-file", filename, data);
    },
    read: (filename: string) => {
        return ipcRenderer.invoke("read-file", filename);
    },
    readSync: (filename: string) => {
        filename = ipcRenderer.sendSync("complete-path", filename);
        return filesystem.readFileSync(filename, "utf-8");
    },
    hasFile: (filename: string) => {
        return ipcRenderer.sendSync("have-file", filename);
    },
});

contextBridge.exposeInMainWorld("msg", {
    showOpenDialogSync: (title: string, msg: string, filters: Electron.FileFilter[], allowMulti: boolean) =>
        ipcRenderer.sendSync("open-msg", title, msg, filters, allowMulti),
    showSaveDialogSync: (title: string, msg: string, filters: Electron.FileFilter[]) =>
        ipcRenderer.sendSync("save-msg", title, msg, filters),
});

contextBridge.exposeInMainWorld("electronAPI", {
    startNewProcess: (path: string = undefined) =>
        ipcRenderer.send("start-new-process", path),
    getArg: (startWith: string) => {
        const arg = process.argv.find((arg) =>
            arg.startsWith(`--${startWith}=`)
        );
        if (arg) return arg.replace(`--${startWith}=`, "");
        return null;
    },
    setArg: (startWith: string, v: string) => {
        if (!process.argv.find((arg) => arg.startsWith(`--${startWith}=`))) {
            process.argv.push(`--${startWith}=${v}`);
        } else {
            process.argv = process.argv.map((arg) =>
                arg.startsWith(`--${startWith}=`) ? `--${startWith}=${v}` : arg
            );
        }
    },
    rmArg: (startWith: string) => {
        process.argv = process.argv.filter(
            (item) => !item.startsWith(`--${startWith}=`)
        );
    },
});

contextBridge.exposeInMainWorld("ProgramMenu", {
    onMenuViewChange: (callback: (sub: "search" | "plugin", stt: boolean) => void) =>
        ipcRenderer.on("view", (e: IpcRendererEvent, sub: "search" | "plugin", stt: boolean) => callback(sub, stt)),
    getViewMenu: () => ipcRenderer.sendSync("get-menu"),
});
