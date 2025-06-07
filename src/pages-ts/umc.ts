class UMC {
    /**
     * Decrypts the given object using the provided key.
     * @param obj The object to decrypt.
     * @param key The key to use for decryption.
     * @returns True if decryption was successful, false otherwise.
     */
    static decrypt(obj: any, key: string): boolean {
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
        // => v1.4.1
        mainSetting.generateRandomPwdSetting = {
            weightOfLetter: 5,
            weightOfNum: 3,
            weightOfPunc: 1
        }
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
};