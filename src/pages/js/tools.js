"use strict";
/**
 * 可用的一些工具函数
 */
/**
 * 随机生成一个[a, b]之间的整数
 * @param a 上限
 * @param b 下限
 * @returns 一个符合要求的随机数
 */
function random(a, b) {
    return Math.floor(Math.random() * (b - a) + a);
}
/**
 * 生成随机字符串
 * @param length 字符串长度
 * @returns 根据 {@linkcode mainSetting.generateRandomPwdSetting} 随机字符串
 */
function randstr(length) {
    function getChar(str) {
        return str[random(0, str.length)];
    }
    let res = "";
    // 不会有0oO1iIlLq9g
    let letter = "abcdefhjkmnprstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ";
    let num = "2345678";
    let punc = `%-}#][:<.>!\\'+,("&/;?@=\${)*_`;
    let typeOfChar = 'L'.repeat(mainSetting.generateRandomPwdSetting.weightOfLetter);
    typeOfChar += 'N'.repeat(mainSetting.generateRandomPwdSetting.weightOfNum);
    typeOfChar += 'P'.repeat(mainSetting.generateRandomPwdSetting.weightOfPunc);
    for (let i = 0; i < length; i++) {
        let tgt = getChar(typeOfChar);
        switch (tgt) {
            case 'L':
                res += getChar(letter);
                break;
            case 'N':
                res += getChar(num);
                break;
            case 'P':
                res += getChar(punc);
                break;
        }
    }
    return res;
}
/**
 * 判断一个字符是否是全角字符
 * @param c 字符
 * @returns 返回是否是全角字符
 */
function isFullWidthChar(c) {
    return c.charCodeAt(0) > 255;
}
/**
 * 将一个字符粘贴到剪切板
 * @param str 字符串
 * @returns 是否成功
 * @description 该函数使用了Clipboard API，可能在某些浏览器中不支持
 */
function copyToClipboard(str) {
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
function getScroll() {
    return {
        top: main.scrollTop || main.scrollTop,
        left: main.scrollLeft || main.scrollLeft
    };
}
/**
 * 完全深拷贝一个对象
 * @param value 需要深拷贝的对象
 * @returns 新的对象
 */
function deepCopy(value) {
    if (value === null || typeof value !== "object") {
        return value;
    }
    if (Array.isArray(value)) {
        return value.map(item => deepCopy(item));
    }
    const copied = {};
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
function removeTips() {
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(tooltip => { var _a; (_a = bootstrap.Tooltip.getInstance(tooltip)) === null || _a === void 0 ? void 0 : _a.dispose(); });
    return;
}
/**
 * 触发所有的悬浮提示
 */
function updateTooltip() {
    [...document.querySelectorAll('[data-bs-toggle="tooltip"]')].forEach(t => new bootstrap.Tooltip(t));
}
