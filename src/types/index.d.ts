export {};

interface fs {
    save: (filename: string, data: string) => void;
    read: (filename: string) => Promise<string>;
}

interface msg {
    info: (title: string, msg: string, choice?: string[]) => Promise<number>;
    warning: (title: string, msg: string, choice?: string[]) => Promise<number>;
    infoSync: (title: string, msg: string, choice?: string[]) => number;
    warningSync: (title: string, msg: string, choice?: string[]) => number;
}

interface cryp {
    encrypt: (data: string, pwd: string) => string;
    decrypt: (data: string, pwd: string) => string;
    pbkdf2: (pwd: string, salt: string) => string;
}

declare global {
    interface Window {
        fs: fs;
        msg: msg;
        cryp: cryp;
    }
}

declare function mkDialog(title: string, message: string, option: Array<string>): void;
declare function goHome(): void;
declare function update(dir: Folder, checkable: boolean) : void;
declare const simplePwd: Array<string>;
declare const lessSimplePwd: Array<string>;