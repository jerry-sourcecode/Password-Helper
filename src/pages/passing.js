"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ref = void 0;
exports.deepCopy = deepCopy;
class Ref {
    constructor(value) {
        this.value = value;
    }
}
exports.Ref = Ref;
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
