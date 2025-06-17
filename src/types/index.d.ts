export { };

import { FileFilter } from 'electron';

interface fs {
    /**
     * 写入文件
     * @param filename 文件名，允许相对路径或绝对路径
     * @param data 写入的数据
     */
    save: (filename: string, data: string) => void;
    /**
     * 读取文件
     * @param filename 文件名，允许相对路径或绝对路径
     * @returns 文件内的内容
     * @error 可能会报错，由于文件不存在
     */
    read: (filename: string) => Promise<string>;
    /**
     * 同步读取文件
     * @param filename 文件名，允许相对路径或绝对路径
     * @returns 文件内的内容，出现错误时返回undefined
     */
    readSync: (filename: string) => string | undefined;
    /**
     * 检查文件是否存在
     * @param filename 文件名，允许相对路径或绝对路径
     * @returns 检查结果
     */
    hasFile: (filename: string) => boolean;
}

interface msg {
    info: (title: string, msg: string, choice?: string[]) => Promise<number>;
    warning: (title: string, msg: string, choice?: string[]) => Promise<number>;
    infoSync: (title: string, msg: string, choice?: string[]) => number;
    warningSync: (title: string, msg: string, choice?: string[]) => number;
    /**
     * 选择一个文件
     * @param title 窗口标题
     * @param msg 提示文字
     * @param filters 文件后缀选择器
     * @param allowMulti 是否允许多选
     * @returns 文件路径，如果未选择则为undefined
     * @example window.msg.showOpenDialogSync("选择地址", "", [{ name: '用户迁移凭证', extensions: ['umc'] }]) // 选择了后缀为umc的文件，且名称为用户迁移凭证
     */
    showOpenDialogSync: (title: string, msg: string, filters: Electron.FileFilter[], allowMulti: boolean) => string[] | undefined;
    /**
     * 选择保存文件的地址
     * @param title 窗口标题
     * @param msg 提示文字
     * @param filters 文件后缀选择器
     * @returns 文件路径，如果未选择则为undefined
     * @example window.msg.showSaveDialogSync("选择地址", "", [{ name: '用户迁移凭证', extensions: ['umc'] }]) // 选择了后缀为umc的文件，且名称为用户迁移凭证
     */
    showSaveDialogSync: (title: string, msg: string, filters: Electron.FileFilter[]) => string | undefined;
}

interface electronAPI {
    /**
     * 创造一个新窗口，并且开启一个新的程序
     */
    startNewProcess: (path?: string) => void;
    /**
     * 获取启动窗口时附带的参数
     * @param key 参数的键
     * @returns 获取的参数值
     */
    getArg: (key: string) => string | null;
    /**
     * 更改附带的参数，没有则新增
     * @param key 参数的键
     * @param value 更改为的参数值
     */
    setArg: (key: string, value: string) => void;
    /**
     * 删除附带的参数
     * @param key 参数的键
     */
    rmArg: (key: string) => void;
}

declare global {
    interface Window {
        fs: fs;
        msg: msg;
        electronAPI: electronAPI
    }
}