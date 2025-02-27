"use strict";
function random(a, b) {
    return Math.floor(Math.random() * (b - a) + a);
}
function randstr(length) {
    let res = "";
    let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_+-=[]{}|;':,.<>/?";
    for (let i = 0; i < length; i++) {
        res += chars[random(0, chars.length)];
    }
    return res;
}
function isFullWidthChar(c) {
    return c.charCodeAt(0) > 255;
}
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
function getScroll() {
    return {
        top: main.scrollTop || main.scrollTop,
        left: main.scrollLeft || main.scrollLeft
    };
}
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
