# 准备工作
因为本项目不含node_modules，所以需要手动安装node_modules
在项目处运行一下命令
```shell
npm i electron --save
npm i typescript --save--dev
npm i @popperjs/core
```
如果想要监视，即运行`npm start`命令的，运行一下命令
```shell
npm i nodemon --save--dev
```
如果想要启动程序，运行以下命令
```shell
tsc
npm test
```
如果想要持续监视
```shell
npm run w
npm start
```

# 关于electron api
## fs
```ts
save: (filename: string, data: string) => void;
```
- 参数：
    - `filename`：文件名（相对于项目根路径）
    - `data`：数据
- 作用：将**data**存入**filename**中。
```ts
read: (filename: string) => Promise<string>;
```
- 参数：
    - `filename`：文件名（相对于项目根路径）
- 返回值：表示收到的数据。
- 作用：读取**filename**中的数据。
## msg
```ts
info: (title: string, msg: string, choice?: string[]) => Promise<number>;
warning: (title: string, msg: string, choice?: string[]) => Promise<number>;
```
- 参数：
    - `title`：窗口名
    - `msg`：窗口内容
    - `choice`：每一项是一个字符串，表示一个按钮上面的文字。
- 返回值：表示用户按下按钮在`choice`中对应的索引，取消则返回-1。
- 作用：显示一个阻塞程序的模态对话框，其中，`info`函数会显示一个消息样态的对话框，而`warning`会显示一个警告样态的对话框。
## Cryp
```ts
encrypt: (data: string, pwd: string) => string;
decrypt: (data: string, pwd: string) => string;
pbkdf2: (pwd: string, salt: string) => string;
```
- 参数：
    - `data`：需要加密或解密的数据
    - `pwd`：密码
    - `salt`：盐
- 返回值：加密或解密后的数据
- 作用：加密或解密数据，`pbkdf2`函数用于单向哈希加密。

# 声明
此程序的依赖如下：
1. electron
2. typescript
3. crypto-js
4. bootstrap
5. 所有图标搜集自https://icon.sucai999.com
- 图标复制来自https://github.com/dariushhpg1/IconaMoon
- 图标删除来自Google
- 图标编辑来自https://github.com/artcoholic/akar-icons
- 图标新增文件夹来自https://github.com/stephenhutchings/typicons.font
- 其余为原创图标或作者许可证未要求表明来源。

**文件夹**
- `docs`：存放文档
- `electron`：存放electron相关文件
- `pages`：存放html、css、js文件
- `pages-ts`：存放ts文件
- `types`：存放类型声明文件

**文件**
- `log.md`：存放日志
- `main.js`：electron主进程文件
- `preload.js`：electron预加载文件
- `crypto-js.min.js`：crypto-js库
- `index.css`：全局样式文件
- `index.html`：主页面html文件
- `data.ts => data.js`：一些关于数据处理的函数文件
- `dialog.ts => dialog.js`：关于处理对话框的文件
- `home.ts => home.js`：“我的”页面文件
- `index.ts => index.js`：主文件，程序的切入口
- `mainPage.ts => mainPage.js`：主界面文件
- `password.ts => password.js`：常见的、易被猜到的密码文件
- `tools.ts => tools.js`：工具文件

**类型声明文件**
- `crypto-js.d.ts`：crypto-js库类型声明文件
- `index.d.ts`：全局类型声明文件

**图标**
- `copy.png`：复制图标
- `copy_done.png`：复制完成图标
- `delete.png`：删除图标
- `edit.png`：编辑图标
- `newFolder.png`：新建文件夹图标
- `up.png`：向上图标

