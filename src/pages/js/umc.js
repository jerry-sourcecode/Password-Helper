"use strict";
class UMC {
    static getName(data) {
        if (data == "")
            throw new Error("data is null");
        data = data.replace(/\s/g, '');
        let obj = JSON.parse(data);
        if (obj.name) {
            return obj.name;
        }
        return "untitled";
    }
    /**
     * 将给定的加密字符串解密为一个明文对象，并将其应用
     * @param data 处理前的字符串
     */
    static parse(data) {
        var _a;
        if (data == "")
            throw new Error("data is null");
        data = data.replace(/\s/g, '');
        let obj = JSON.parse(data);
        const supportVersion = ["1.2", "1.3", "1.4", "1.4.1"];
        if (supportVersion.indexOf(obj.version) === -1)
            mkDialog("数据无效", `不支持数据版本${obj.version}！`);
        mainSetting = obj.mainSetting;
        repoName = obj.name;
        document.title = `Password Helper - ${repoName}`;
        const salt = obj.salt;
        if (obj.isPwdNull) {
            UMC.decrypt(obj, Cryp.pbkdf2("", salt));
        }
        else {
            if (obj.memory !== null && obj.memory !== undefined) {
                let m = obj.memory;
                let dpwd = Cryp.pbkdf2(m, salt);
                if (Cryp.pbkdf2(dpwd, salt) == obj.mainPwd) {
                    isremember = true;
                    mainPwd = m;
                    UMC.decrypt(obj, dpwd);
                }
                else {
                    isremember = false;
                }
            }
            if (!isremember) {
                content.innerHTML = `
                <div class="title">请输入访问密钥</div>
                <div class="form">
                <div><label for="mainPwd">访问密钥：</label><input type="text" id="mainPwd" class="vaild"/></div>
                ${mainSetting.mainPwdTip === "" ? `` : `<div><p>密码提示：${mainSetting.mainPwdTip}</p></div>`}
                <div><input type="checkbox" id="rememberPwd"} style="margin-right: 10px;"/><label for="rememberPwd">记住密钥</label></div>
                </div>
                <div class="action" id="Yes"><p>确定</p></div>
                <div id="error"></div>
                `;
                document.querySelector("#navBar").style.display = "none";
                (_a = document.querySelector("#Yes")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
                    let m = document.querySelector("#mainPwd").value;
                    let dpwd = Cryp.pbkdf2(m, salt);
                    if (Cryp.pbkdf2(dpwd, salt) == obj.mainPwd) {
                        isremember = document.querySelector("#rememberPwd").checked;
                        mainPwd = m;
                        document.querySelector("#navBar").style.display = "flex";
                        UMC.decrypt(obj, dpwd);
                        saveData();
                    }
                    else {
                        document.querySelector("#error").innerHTML = `
                        <div class="alert alert-danger alert-dismissible fade show" role="alert">
                            <strong>密钥错误！</strong>你需要检查你的密钥。
                        </div>`;
                        let alert = new bootstrap.Alert(document.querySelector(".alert"));
                        setTimeout(() => {
                            alert.close();
                        }, 1000);
                    }
                });
            }
        }
    }
    /**
     * Decrypts the given object using the provided key.
     * @param obj The object to decrypt.
     * @param key The key to use for decryption.
     * @returns True if decryption was successful, false otherwise.
     */
    static decrypt(obj, key) {
        let v = obj.version;
        if (v == "1.2" || v == "1.3" || v == "1.4")
            this.V1_2V1_3V1_4(obj, key);
        else if (v == "1.4.1")
            this.V1_4_1(obj, key);
        else
            return false;
        document.querySelector("#nav-home").click();
        return true;
    }
    /**
     * Decrypts the given object using the provided key.
     * @param obj The object to decrypt.
     * @param key The key to use for decryption.
     * 适用于 1.2, 1.3, 1.4 版本
     */
    static V1_2V1_3V1_4(obj, key) {
        if (Number(obj.version) < 1.4) {
            obj.pwd.forEach((element) => {
                element.dir = decrypt(element.dir, key);
            });
            obj.recent.forEach((element) => {
                if (element.type == Type.Password)
                    element.dir = decrypt(element.dir, key);
            });
        }
        obj.pwd.forEach((element) => {
            if (Number(obj.version) < 1.4)
                pwdList.push(decrypt(new Password(element), key, ["dir"]));
            else
                pwdList.push(decrypt(new Password(element), key));
        });
        obj.folder.forEach((element) => {
            folderList.push(decrypt(new Folder(element), key));
        });
        if (Number(obj.version) >= 1.4) {
            signUpTime = Cryp.decrypt(obj.signUpTime, key);
            obj.bin.forEach((element) => {
                if (element.type == Type.Password)
                    binItem.push(decrypt(new Password(element), key));
                else
                    binItem.push(decrypt(new Folder(element), key));
            });
        }
        else
            obj.recent.forEach((element) => {
                if (element.type == Type.Password)
                    binItem.push(decrypt(new Password(element), key, ["dir"]));
                else
                    binItem.push(decrypt(new Folder(element), key));
            });
        if (obj.version === "1.2") {
            DONETasks = [];
            score = 0;
            level = 1;
        }
        else if (Number(obj.version) >= 1.3) {
            obj.DONETasks.forEach((element) => {
                DONETasks.push(TaskMap.dec(element, key));
            });
            score = Number(Cryp.decrypt(obj.score, key));
            level = Number(Cryp.decrypt(obj.level, key));
        }
        this.initToV1_4_1();
    }
    static V1_4_1(obj, key) {
        obj.pwd.forEach((element) => {
            pwdList.push(decrypt(new Password(element), key));
        });
        obj.folder.forEach((element) => {
            folderList.push(decrypt(new Folder(element), key));
        });
        signUpTime = Cryp.decrypt(obj.signUpTime, key);
        obj.bin.forEach((element) => {
            if (element.type == Type.Password)
                binItem.push(decrypt(new Password(element), key));
            else
                binItem.push(decrypt(new Folder(element), key));
        });
        obj.DONETasks.forEach((element) => {
            DONETasks.push(TaskMap.dec(element, key));
        });
        score = Number(Cryp.decrypt(obj.score, key));
        level = Number(Cryp.decrypt(obj.level, key));
    }
    static initToV1_4_1() {
        mainSetting.generateRandomPwdSetting = {
            weightOfLetter: 5,
            weightOfNum: 3,
            weightOfPunc: 1
        };
    }
}
;
