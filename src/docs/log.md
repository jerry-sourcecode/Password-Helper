# 准备工作
因为本项目不含node_modules，所以需要手动安装node_modules
在项目处运行一下命令
```bash
npm i electron --save-dev
npm i nodemon --save--dev
npm i typescript --save--dev
npm i crypto-js
```
如果想要启动程序，运行以下命令
```bash
tsc
npm test
```
如果想要持续监视
```bash
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
## cryp
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
4. 所有图标搜集自https://icon.sucai999.com
- 图标复制来自https://github.com/dariushhpg1/IconaMoon
- 图标删除来自Google
- 图标编辑来自https://github.com/artcoholic/akar-icons
- 图标新增文件夹来自https://github.com/stephenhutchings/typicons.font
- 其余为原创图标或作者许可证未要求表明来源。