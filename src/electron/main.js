const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const path = require("path");
const fs = require("fs");

const projectRoot = app.getAppPath();
let defaultPath = app.getPath("home");

const MenuTemplate = [
	{
		label: "帮助",
		submenu: [
			{
				label: "正则表达式",
				click: () => {
					const win = createWindow(
						"正则表达式",
						"./src/pages/regex.html"
					);
				},
			},
			{
				label: "Github",
				click: () => {
					const win = createWindow(
						"Github",
						"https://www.github.com/jerry-sourcecode/password-helper",
						() => {},
						{ isURL: true }
					);
				},
			},
		],
	},
];

function setIpc(win) {
	/**
	 * 不修改绝对路径，同时将相对路径补全为绝对路径
	 * @param {string} filename 待处理的文件名
	 * @returns 经过处理的文件名
	 */
	function completePath(filename) {
		filename = filename.trim().replace(/^"(.*)"$/, "$1"); // 删除首尾的引号
		let targetPath;
		if (path.isAbsolute(filename)) {
			// 处理相对路径
			targetPath = filename;
		} else {
			targetPath = path.join(projectRoot, filename);
		}
		return targetPath;
	}
	ipcMain.on("save-file", (event, targetPath, data) => {
		targetPath = completePath(targetPath);
		// 自动创建父目录
		fs.mkdirSync(path.dirname(targetPath), { recursive: true });
		fs.writeFileSync(targetPath, data);
		event.returnValue = true;
	});
	ipcMain.handle("read-file", (event, targetPath) => {
		targetPath = completePath(targetPath);
		try {
			k = new Promise((resolve, resject) => {
				resolve(fs.readFileSync(targetPath, "utf-8"));
			});
		} catch (e) {
			k = new Promise((resolve, resject) => {
				resject(e);
			});
		}
		return k;
	});
	ipcMain.on("msg", (event, title, type, msg, choice) => {
		event.returnValue = dialog.showMessageBoxSync(win, {
			type: type,
			title: title,
			message: msg,
			buttons: choice,
			cancelId: -1,
		});
	});
	ipcMain.on("open-msg", (event, title, msg, filters) => {
		let i = defaultPath.length - 1;
		while (defaultPath[i] != "/" && defaultPath[i] != "\\") i--;
		let ans = dialog.showOpenDialogSync(win, {
			title: title,
			message: msg,
			properties: ["openFile"],
			filters: filters,
			defaultPath: defaultPath.slice(0, i + 1),
		});
		if (ans !== undefined) {
			defaultPath = ans[0];
			event.returnValue = ans[0];
		} else {
			event.returnValue = undefined;
		}
	});
	ipcMain.on("save-msg", (event, title, msg, filters) => {
		let i = defaultPath.length - 1;
		while (defaultPath[i] != "/" && defaultPath[i] != "\\") i--;
		let ans = dialog.showSaveDialogSync(win, {
			title: title,
			message: msg,
			filters: filters,
			properties: ["createDirectory"],
			defaultPath: defaultPath.slice(0, i + 1),
		});
		if (ans !== undefined) {
			defaultPath = ans;
			event.returnValue = ans;
		} else {
			event.returnValue = undefined;
		}
	});
	ipcMain.on("have-file", (event, filepath) => {
		filepath = completePath(filepath);
		fs.access(filepath, fs.constants.F_OK, (err) => {
			if (err) event.returnValue = false;
			else event.returnValue = true;
		});
	});
	ipcMain.on("start-new-process", (e) => {
		createWindow("Password Helper", "./src/pages/index.html");
	});
	ipcMain.on("complete-path", (event, filepath) => {
		event.returnValue = completePath(filepath);
	});
}

/**
 * 创造一个窗口
 * @param {string} title 窗口名
 * @param {string} loadFile 载入文件的相对路径
 * @param {Function} callbacks 回调函数，在创造窗口前执行，有参数win，表示创造出的窗口对象
 * @param {{ isURL: boolean; }} [options={ isURL: false }] 可选参数，其中，isURL为是时，loadfile可以填写一个URL
 * @returns 一个 BrowserWindow 对象，创造出的窗口对象
 */
function createWindow(
	title,
	loadFile,
	callbacks = (win) => {
		return;
	},
	options = { isURL: false }
) {
	const isDebug = true;
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		show: false,
		webPreferences: {
			preload: path.join(__dirname, "./preload.js"),
			sandbox: false,
			devTools: isDebug,
		},
		title: title,
	});

	if (!isDebug) {
		win.webContents.on("before-input-event", (event, input) => {
			if (
				(input.control || input.meta) &&
				input.key.toLowerCase() === "r"
			) {
				event.preventDefault();
			}
			if (
				(input.control || input.meta) &&
				input.shift &&
				input.key.toLowerCase() === "i"
			) {
				event.preventDefault();
			}
		});
	} else {
		win.webContents.on("before-input-event", (event, input) => {
			if (
				(input.control || input.meta) &&
				input.shift &&
				input.key.toLowerCase() === "i"
			) {
				win.webContents.openDevTools();
				event.preventDefault();
			}
		});
	}
	callbacks(win);

	win.show();

	if (!options.isURL) win.loadFile(loadFile);
	else win.loadURL(loadFile);
	return win;
}

app.on("ready", () => {
	const appMenu = Menu.buildFromTemplate(MenuTemplate);
	Menu.setApplicationMenu(appMenu);
	const win = createWindow(
		"Password Helper",
		"./src/pages/index.html",
		(win) => {
			setIpc(win);
			win.maximize();
			win.setAspectRatio(1);
		}
	);
	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
