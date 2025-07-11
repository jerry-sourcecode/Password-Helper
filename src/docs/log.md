# 准备工作

因为本项目不含 node_modules，所以需要手动安装 node_modules
在项目处运行一下命令

```shell
npm i
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

# 关于 electron api

## fs

```ts
save: (filename: string, data: string) => void;
```

-   参数：
    -   `filename`：文件名（相对于项目根路径）
    -   `data`：数据
-   作用：将**data**存入**filename**中。

```ts
read: (filename: string) => Promise<string>;
```

-   参数：
    -   `filename`：文件名（相对于项目根路径）
-   返回值：表示收到的数据。
-   作用：读取**filename**中的数据。

## msg

```ts
info: (title: string, msg: string, choice?: string[]) => Promise<number>;
warning: (title: string, msg: string, choice?: string[]) => Promise<number>;
```

-   参数：
    -   `title`：窗口名
    -   `msg`：窗口内容
    -   `choice`：每一项是一个字符串，表示一个按钮上面的文字。
-   返回值：表示用户按下按钮在`choice`中对应的索引，取消则返回-1。
-   作用：显示一个阻塞程序的模态对话框，其中，`info`函数会显示一个消息样态的对话框，而`warning`会显示一个警告样态的对话框。

## Cryp

```ts
encrypt: (data: string, pwd: string) => string;
decrypt: (data: string, pwd: string) => string;
pbkdf2: (pwd: string, salt: string) => string;
```

-   参数：
    -   `data`：需要加密或解密的数据
    -   `pwd`：密码
    -   `salt`：盐
-   返回值：加密或解密后的数据
-   作用：加密或解密数据，`pbkdf2`函数用于单向哈希加密。

# 声明

此程序的依赖如下：

1. electron
2. typescript
3. crypto-js
4. bootstrap
5. 所有图标搜集自https://icon.sucai999.com

-   图标复制来自https://github.com/dariushhpg1/IconaMoon
-   图标删除来自 Google
-   图标编辑来自https://github.com/artcoholic/akar-icons
-   图标新增文件夹来自https://github.com/stephenhutchings/typicons.font
-   其余为原创图标或作者许可证未要求表明来源。

**文件夹**

-   `docs`：存放文档
-   `electron`：存放 electron 相关文件
-   `pages`：存放 html、css、js 文件
-   `pages-ts`：存放 ts 文件
-   `types`：存放类型声明文件

**文件**

-   `log.md`：存放日志
-   `main.js`：electron 主进程文件
-   `preload.js`：electron 预加载文件
-   `crypto-js.min.js`：crypto-js 库
-   `index.css`：全局样式文件
-   `index.html`：主页面 html 文件
-   `data.ts => data.js`：一些关于数据处理的函数文件
-   `dialog.ts => dialog.js`：关于处理对话框的文件
-   `home.ts => home.js`：“我的”页面文件
-   `index.ts => index.js`：主文件，程序的切入口
-   `mainPage.ts => mainPage.js`：主界面文件
-   `password.ts => password.js`：常见的、易被猜到的密码文件
-   `tools.ts => tools.js`：工具文件

**类型声明文件**

-   `crypto-js.d.ts`：crypto-js 库类型声明文件
-   `index.d.ts`：全局类型声明文件

**图标**

-   `copy.png`：复制图标
-   `copy_done.png`：复制完成图标
-   `delete.png`：删除图标
-   `edit.png`：编辑图标
-   `newFolder.png`：新建文件夹图标
-   `up.png`：向上图标

# 文件格式

本项目使用.umc（User migration credentials，用户迁移凭证）文件进行数据交换

## umc v1.4

v1.4 版本适用于程序的 1.3 版本及以后版本

```json
{
	"version": "1.4", // 版本号
	"pwd": [
		// 密码列表
		{
			// 描述一个password的格式
			"type": "<int>", // 文件类型，因为pwd中的都是密码，所以应该为1，明文储存
			"rmDate": "<int> | <null>", // 删除日期，因为没有被删除，所以是null
			"from": "<string>", // 来源字段
			"uname": "<string>", // 用户名字段
			"pwd": "<string>", // 密码字段
			"email": "<string>", // 邮箱字段
			"phone": "<string>", // 手机号字段
			"dir": "<string>", // 密码所处位置
			"moDate": "<int>" // 最近一次修改的日期
		}
		// ...
	],
	"folder": [
		// 文件夹列表
		{
			// 描述一个folder的格式
			"lock": "<string>", // 二级锁密码
			"cachePwd": null, // 用作缓存，请忽视
			"type": "<int>", // 文件类型，因为folder中的都是文件夹，所以应该为0，明文储存
			"name": "<string>", // 文件名
			"parent": "<string>", // 地址
			"moDate": "<int>", // 最近一次修改的日期
			"rmDate": "<int> | <null>" // 删除日期，因为没有被删除，所以是null
		}
		// ...
	],
	"bin": [
		// 回收站
		{
			"type": "<int>"
			// 如果type属性为0，则是上面描述一个folder的格式
			// 如果type属性为1，则是上面描述一个password的格式
			// ...
		}
		// ...
	],
	"mainPwd": "<string>", // 主密码，会经过二次加密
	"mainSetting": {
		// 全局设置，明文储存
		"autoCopy": "<bool>", // 自动复制
		"easyAppend": "<bool>" // 使用表单添加数据
	},
	"salt": "<string>", // 加密所用盐值
	"memory": "<string> | null", // 如果使用了“记住密码”功能，会在此处记录密码，否则为null，不会被加密
	"isPwdNull": "<bool>", // 有没有设置密码，明文储存
	"DONETasks": [
		// 已经完成至少一次的任务
		{
			"task": "<int>", // 在全局task数组中的索引
			"doTimes": "<int>", // 完成的次数
			"fulfilled": "<bool>" // 有没有领取奖励
		}
		// ...
	],
	"score": "<int>", // 分数
	"level": "<int>" // 等级
}
```

## umc v1.4.1

v1.4.1 版本适用于程序版本 v1.4 及后续版本

```json
{
	"version": "1.4.1", // 版本号，明文
	"name": "<string>", // 此仓库的名称，明文
	"pwd": [
		// 密码列表
		{
			// 描述一个password的格式
			"type": "<int>", // 文件类型，因为pwd中的都是密码，所以应该为1，明文储存
			"rmDate": "<int> | <null>", // 删除日期，因为没有被删除，所以是null
			"from": "<string>", // 来源字段
			"uname": "<string>", // 用户名字段
			"pwd": "<string>", // 密码字段
			"email": "<string>", // 邮箱字段
			"phone": "<string>", // 手机号字段
			"dir": "<string>", // 密码所处位置
			"moDate": "<int>" // 最近一次修改的日期
		}
		// ...
	],
	"folder": [
		// 文件夹列表
		{
			// 描述一个folder的格式
			"lock": "<string>", // 二级锁密码
			"cachePwd": null, // 用作缓存，请忽视
			"type": "<int>", // 文件类型，因为folder中的都是文件夹，所以应该为0，明文储存
			"name": "<string>", // 文件名
			"parent": "<string>", // 地址
			"moDate": "<int>", // 最近一次修改的日期
			"rmDate": "<int> | <null>", // 删除日期，因为没有被删除，所以是null
			"timelock": "<int> | <null>" // 插件“时间锁”锁设定的时间，明文存储
		}
		// ...
	],
	"bin": [
		// 回收站
		{
			"type": "<int>"
			// 如果type属性为0，则是上面描述一个folder的格式
			// 如果type属性为1，则是上面描述一个password的格式
			// ...
		}
		// ...
	],
	"mainPwd": "<string>", // 主密码，会经过二次加密
	"mainSetting": {
		// 全局设置，明文储存
		"autoCopy": "<bool>", // 自动复制
		"easyAppend": "<bool>", // 使用表单添加数据
		"mainPwdTip": "<string>", // 主密码的提示
		"pwdSortBy": "<int>", // 表示密码的排序方法
		"folderSortBy": "<int>", // 表示文件夹排序方法
		"generateRandomPwdSetting": {
			// 随机生成密码的设置
			"weightOfLetter": "<int>", //表示字母的权重
			"weightOfNum": "<int>", //表示数字的权重
			"weightOfPunc": "<int>" //表示特殊字符的权重
		}
	},
	"salt": "<string>", // 加密所用盐值
	"memory": "<string> | null", // 如果使用了“记住密码”功能，会在此处记录密码，否则为null，不会被加密
	"isPwdNull": "<bool>", // 有没有设置密码，明文储存
	"DONETasks": [
		// 已经完成至少一次的任务
		{
			"task": "<int>", // 在全局task数组中的索引
			"doTimes": "<int>", // 完成的次数
			"fulfilled": "<bool>" // 有没有领取奖励
		}
		// ...
	],
	"score": "<int>", // 分数
	"level": "<int>", // 等级
	"signUpTime": "<int>" // 注册时间
}
```

## editor 1.0

e1.0 可以用在版本 v1.4 及之后版本中

```json
{
	"version": "e1.0", // 版本号，明文
	"search": {
		// 搜索设置
		"txt": "<string>", // 当前搜索框中的信息
		"lastSearchTxt": "<string>", // 上一次搜索的信息（按下搜索按键）
		"setting": {
			// 高级设置
			"isReg": "<bool>", // 是否允许正则
			"isCaseSensitive": "<bool>", // 是否大小写敏感
			"searchFrom": "<bool>", // 是否搜索“来源”部分
			"searchUname": "<bool>", // 是否搜索“用户名”部分
			"searchPwd": "<bool>", // 是否搜索“密码”部分
			"searchPhone": "<bool>", // 是否搜索“手机号”部分
			"searchEmail": "<bool>", // 是否搜索“邮箱”部分
			"searchNote": "<bool>", // 是否搜索“注释”部分
			"searchFolder": "<bool>", // 是否搜索“文件夹”部分
			"startDate": "<int> | null", // 起始时间限制
			"endDate": "<int> | null" // 结束时间限制
		}
	},
	"umcFilePaths": [
		"<string>" // 记录的仓库地址
		// ...
	],
	"editorSetting": {
		"defaultRepoPath": "null | <string>" // 默认仓库地址
	},
	"plugin": {
		// 插件
		"id": "<string>", // 插件的唯一标识符
		"enabled": "<boolean>" // 是否启用
	},
	"menu": {
		"view": {
			"plugin": "<bool>", // “插件”视图是否启用
			"search": "<bool>" // “搜索”视图是否启用
		}
	}
}
```

# 特殊函数

你可以通过运行函数 `cheat()` 来立即将分数和等级提升到极高值，并且保存数据。
