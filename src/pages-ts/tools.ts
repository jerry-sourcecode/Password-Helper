function random(a: number, b: number): number{ // 生成[a, b]之间的随机数
    return Math.floor(Math.random() * (b - a) + a);
}
function randstr(length: number): string{ // 生成随机字符串
    let res: string = "";
    let chars: string = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_+-=[]{}|;':,.<>/?";
    for (let i = 0; i < length; i++){
        res += chars[random(0, chars.length)];
    }
    return res;
}
function isFullWidthChar(c: string): boolean{ // 判断是否是全角字符
    return c.charCodeAt(0) > 255;
}
function copyToClipboard(str: string): boolean{ // 复制到剪贴板
    let success = true;
    navigator.clipboard.writeText(str)
    .then(() => {
        success = true;
    }).catch((err) => {
        console.error("can't copy to clipboard: " + err);
        success = false;
    });
    return success;
}
function getScroll(): {top: number, left: number}{
    return {
        top: main!.scrollTop || main!.scrollTop,
        left: main!.scrollLeft || main!.scrollLeft
    }
}
function deepCopy<T>(value: T): T {
    if (value === null || typeof value !== "object") {
        return value;
    }
    if (Array.isArray(value)) {
        return value.map(item => deepCopy(item)) as unknown as T;
    }
    const copied = {} as T;
    for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
        copied[key] = deepCopy(value[key]);
        }
    }
    return copied;
}