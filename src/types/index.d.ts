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
