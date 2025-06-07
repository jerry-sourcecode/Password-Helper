"use strict";
class UMC {
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
        // => v1.4.1
        mainSetting.generateRandomPwdSetting = {
            weightOfLetter: 5,
            weightOfNum: 3,
            weightOfPunc: 1
        };
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
}
;
