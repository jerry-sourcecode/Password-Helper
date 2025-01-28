# 准备工作
因为本项目不含node_modules，所以需要手动安装node_modules
在项目处运行一下命令
```bash
npm install electron --save-dev
npm install nodemon
```
如果想要启动程序，运行以下命令
```bash
tsc
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