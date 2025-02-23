function saveData(): void{ // 保存数据
    // 数据保存
    let data = getData();
    window.fs.save("./data", data);
}

function getData(ismemory: boolean = isremember): string{
    let salt: string = randstr(16);
    let enc = window.cryp.pbkdf2(mainPwd, salt)
    let pwdListUpdated : Array<Password> = []
    let folderListUpdated : Array<Folder> = [];
    let recentItemUpdated : Array<Item> = [];
    for (let index = 0; index < pwdList.length; index++) {
        pwdListUpdated.push(encrypt(pwdList[index], enc) as Password);
    }
    for (let index = 0; index < folderList.length; index++) {
        folderListUpdated.push(encrypt(folderList[index], enc) as Folder);
    }
    for (let index = 0; index < recentItem.length; index++) {
        recentItemUpdated.push(encrypt(recentItem[index], enc));
    }
    // 数据保存
    return JSON.stringify({
        version: "1.0",
        pwd: pwdListUpdated,
        folder: folderListUpdated,
        recent: recentItemUpdated,
        mainPwd: window.cryp.pbkdf2(enc, salt),
        mainSetting: mainSetting,
        salt: salt,
        memory: ismemory? mainPwd : null,
        isPwdNull: mainPwd === "",
    });
}

function saveUMC(path: string) : void {
    window.fs.save(path, getData(false));
    mkDialog("导出成功！", `成功导出至${path}`);
}

function readUMC(path: string): void {
    window.fs.read(path)
    .then((res) => {
        window.fs.save("./data", res);
        mkDialog("导入成功！", "重启以应用数据，是否立即重启？", ["立即重启", "再等等"], true)
        .then((res) => {
            if (res == 0) location.reload();
        })
    })
}