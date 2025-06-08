class UMC {
    /**
     * 将给定的加密字符串解密为一个明文对象，并将其应用
     * @param data 处理前的字符串
     */
    static parse(data: string) {
        if (data == "") throw new Error("data is null");
        data = data.replace(/\s/g, '')
        let obj = JSON.parse(data);

        const supportVersion = ["1.2", "1.3", "1.4", "1.4.1"]
        if (supportVersion.indexOf(obj.version) === -1) mkDialog("数据无效", `不支持数据版本${obj.version}！`);

        mainSetting = obj.mainSetting;
        const salt = obj.salt;
        if (obj.isPwdNull) {
            UMC.decrypt(obj, Cryp.pbkdf2("", salt));
        } else {
            if (obj.memory !== null && obj.memory !== undefined) {
                let m = obj.memory;
                let dpwd = Cryp.pbkdf2(m, salt);
                if (Cryp.pbkdf2(dpwd, salt) == obj.mainPwd) {
                    isremember = true;
                    mainPwd = m;
                    UMC.decrypt(obj, dpwd);
                } else {
                    isremember = false;
                }
            }
            if (!isremember) {
                main!.innerHTML = `
                <div class="title">请输入访问密钥</div>
                <div class="form">
                <div><label for="mainPwd">访问密钥：</label><input type="text" id="mainPwd" class="vaild"/></div>
                ${mainSetting.mainPwdTip === "" ? `` : `<div><p>密码提示：${mainSetting.mainPwdTip}</p></div>`}
                <div><input type="checkbox" id="rememberPwd"} style="margin-right: 10px;"/><label for="rememberPwd">记住密钥</label></div>
                </div>
                <div class="action" id="Yes"><p>确定</p></div>
                <div id="error"></div>
                `;
                (<HTMLDivElement>document.querySelector("#navBar")).style.display = "none";
                document.querySelector("#Yes")?.addEventListener("click", () => {
                    let m = (document.querySelector("#mainPwd") as HTMLInputElement).value;
                    let dpwd = Cryp.pbkdf2(m, salt);
                    if (Cryp.pbkdf2(dpwd, salt) == obj.mainPwd) {
                        isremember = (document.querySelector("#rememberPwd") as HTMLInputElement).checked;
                        mainPwd = m;
                        (<HTMLDivElement>document.querySelector("#navBar")).style.display = "flex";
                        UMC.decrypt(obj, dpwd);
                        saveData();
                    } else {
                        document.querySelector("#error")!.innerHTML = `
                        <div class="alert alert-danger alert-dismissible fade show" role="alert">
                            <strong>密钥错误！</strong>你需要检查你的密钥。
                        </div>`;
                        let alert = new bootstrap.Alert(document.querySelector(".alert") as HTMLDivElement);
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
    private static decrypt(obj: any, key: string): boolean {
        let v: string = obj.version;
        if (v == "1.2" || v == "1.3" || v == "1.4") this.V1_2V1_3V1_4(obj, key);
        else if (v == "1.4.1") this.V1_4_1(obj, key);
        else return false;
        (document.querySelector("#nav-home") as HTMLSpanElement).click();
        return true;
    }
    /**
     * Decrypts the given object using the provided key.
     * @param obj The object to decrypt.
     * @param key The key to use for decryption.
     * 适用于 1.2, 1.3, 1.4 版本
     */
    private static V1_2V1_3V1_4(obj: any, key: string): void {
        if (Number(obj.version) < 1.4) {
            obj.pwd.forEach((element: any) => {
                element.dir = decrypt(element.dir, key);
            });
            obj.recent.forEach((element: any) => {
                if (element.type == Type.Password) element.dir = decrypt(element.dir, key);
            });
        }
        obj.pwd.forEach((element: any) => {
            if (Number(obj.version) < 1.4) pwdList.push(<Password>decrypt(new Password(element), key, ["dir"]));
            else pwdList.push(<Password>decrypt(new Password(element), key));
        });
        obj.folder.forEach((element: any) => {
            folderList.push(<Folder>decrypt(new Folder(element), key));
        })
        if (Number(obj.version) >= 1.4) {
            signUpTime = Cryp.decrypt(obj.signUpTime, key);
            obj.bin.forEach((element: any) => {
                if (element.type == Type.Password) binItem.push(<Item>decrypt(new Password(element), key));
                else binItem.push(<Item>decrypt(new Folder(element), key));
            });
        }
        else
            obj.recent.forEach((element: any) => {
                if (element.type == Type.Password) binItem.push(<Item>decrypt(new Password(element), key, ["dir"]));
                else binItem.push(<Item>decrypt(new Folder(element), key));
            });
        if (obj.version === "1.2") {
            DONETasks = [];
            score = 0;
            level = 1;
        }
        else if (Number(obj.version) >= 1.3) {
            obj.DONETasks.forEach((element: any) => {
                DONETasks.push(TaskMap.dec(element, key));
            })
            score = Number(Cryp.decrypt(obj.score, key));
            level = Number(Cryp.decrypt(obj.level, key));
        }
        this.initToV1_4_1();
    }
    private static V1_4_1(obj: any, key: string) {
        obj.pwd.forEach((element: any) => {
            pwdList.push(<Password>decrypt(new Password(element), key));
        });
        obj.folder.forEach((element: any) => {
            folderList.push(<Folder>decrypt(new Folder(element), key));
        })
        signUpTime = Cryp.decrypt(obj.signUpTime, key);
        obj.bin.forEach((element: any) => {
            if (element.type == Type.Password) binItem.push(<Item>decrypt(new Password(element), key));
            else binItem.push(<Item>decrypt(new Folder(element), key));
        });
        obj.DONETasks.forEach((element: any) => {
            DONETasks.push(TaskMap.dec(element, key));
        })
        score = Number(Cryp.decrypt(obj.score, key));
        level = Number(Cryp.decrypt(obj.level, key));
    }
    private static initToV1_4_1(): void {
        mainSetting.generateRandomPwdSetting = {
            weightOfLetter: 5,
            weightOfNum: 3,
            weightOfPunc: 1
        }
    }
};