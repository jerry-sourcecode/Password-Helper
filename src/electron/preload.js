const { contextBridge, ipcRenderer } = require("electron");
const filesystem = require("fs");

contextBridge.exposeInMainWorld("fs", {
	save: (filename, data) => {
		ipcRenderer.send("save-file", filename, data);
	},
	read: (filename) => {
		return ipcRenderer.invoke("read-file", filename);
	},
	readSync: (filename) => {
		filename = ipcRenderer.sendSync("complete-path", filename);
		return filesystem.readFileSync(filename, "utf-8");
	},
	hasFile: (filename) => {
		return ipcRenderer.sendSync("have-file", filename);
	},
});

contextBridge.exposeInMainWorld("msg", {
	info: (title, msg, choice = ["确定"]) =>
		ipcRenderer.send("msg", title, "info", msg, choice),
	warning: (title, msg, choice = ["确定"]) =>
		ipcRenderer.send("msg", title, "warning", msg, choice),
	infoSync: (title, msg, choice = ["确定"]) =>
		ipcRenderer.sendSync("msg", title, "info", msg, choice),
	warningSync: (title, msg, choice = ["确定"]) =>
		ipcRenderer.sendSync("msg", title, "warning", msg, choice),
	showOpenDialogSync: (title, msg, filters, allowMulti) =>
		ipcRenderer.sendSync("open-msg", title, msg, filters, allowMulti),
	showSaveDialogSync: (title, msg, filters) =>
		ipcRenderer.sendSync("save-msg", title, msg, filters),
});

contextBridge.exposeInMainWorld("electronAPI", {
	startNewProcess: (path = undefined) =>
		ipcRenderer.send("start-new-process", path),
	getArg: (startWith) => {
		const arg = process.argv.find((arg) =>
			arg.startsWith(`--${startWith}=`)
		);
		if (arg) return arg.replace(`--${startWith}=`, "");
		return null;
	},
	setArg: (startWith, v) => {
		if (!process.argv.find((arg) => arg.startsWith(`--${startWith}=`))) {
			process.argv.push(`--${startWith}=${v}`);
		} else {
			process.argv = process.argv.map((arg) =>
				arg.startsWith(`--${startWith}=`) ? `--${startWith}=${v}` : arg
			);
		}
	},
	rmArg: (startWith) => {
		process.argv = process.argv.filter(
			(item) => !item.startsWith(`--${startWith}=`)
		);
	},
});
