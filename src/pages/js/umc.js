"use strict";
class UMC {
    static decrypt(obj, key) {
        if (Number(obj.version) <= 1.4)
            this.encV1_2V1_3V1_4(obj, key);
        else
            return false;
        return true;
    }
    static encV1_2V1_3V1_4(obj, key) {
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
        document.querySelector("#nav-home").click();
    }
}
;
