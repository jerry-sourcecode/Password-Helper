/**
 * 随机生成一个[a, b]之间的整数
 * @param a 上限
 * @param b 下限
 * @returns 一个符合要求的随机数
 */
function random(a: number, b: number): number{ // 生成[a, b]之间的随机数
    return Math.floor(Math.random() * (b - a) + a);
}
/**
 * 生成随机字符串
 * @param length 字符串长度
 * @returns 随机字符串
 */
function randstr(length: number): string{
    let res: string = "";
    let chars: string = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_+-=[]{}|;':,.<>/?";
    for (let i = 0; i < length; i++){
        res += chars[random(0, chars.length)];
    }
    return res;
}
/**
 * 判断一个字符是否是全角字符
 * @param c 字符
 * @returns 返回是否是全角字符
 */
function isFullWidthChar(c: string): boolean{
    return c.charCodeAt(0) > 255;
}
/**
 * 将一个字符粘贴到剪切板
 * @param str 字符串
 * @returns 是否成功
 * @description 该函数使用了Clipboard API，可能在某些浏览器中不支持
 */
function copyToClipboard(str: string): boolean{
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
/**
 * 获取当前页面的滚动位置
 * @returns 滚动位置
 */
function getScroll(): {top: number, left: number}{
    return {
        top: main!.scrollTop || main!.scrollTop,
        left: main!.scrollLeft || main!.scrollLeft
    }
}
/**
 * 完全深拷贝一个对象
 * @param value 需要深拷贝的对象
 * @returns 新的对象
 */
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

/**
 * 删除所有的悬浮工具提示
 */
function removeTips(): void{
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(tooltip => {bootstrap.Tooltip.getInstance(tooltip)?.dispose();});
    return;
}

/**
 * 触发所有的悬浮提示
 */
function updateTooltip(): void{
    [...document.querySelectorAll('[data-bs-toggle="tooltip"]')].forEach(t => new bootstrap.Tooltip(t));
}