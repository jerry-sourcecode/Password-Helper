export {};

interface fs {
    save: (filename: string, data: string) => void;
    read: (filename: string) => Promise<string>;
}

interface msg {
    info: (title: string, msg: string, choice?: string[]) => Promise<number>;
    warning: (title: string, msg: string, choice?: string[]) => Promise<number>;
    p : (data:string, pwd: string) => Promise<string>;
}

interface cryp {
    encrypt: (data: string, pwd: string) => Promise<string>;
    decrypt: (data: string, pwd: string) => Promise<string>;
    pbkdf2: (pwd: string, salt: string) => Promise<string>;
}

declare global {
    interface Window {
        fs: fs;
        msg: msg;
        cryp: cryp;
    }
}
