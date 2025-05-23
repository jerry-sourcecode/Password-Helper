# 关于
这是一个可以帮助用户储存密码的系统

版本：v1.2

使用了以下开源的框架或库：
1. 使用了electron框架进行开发
2. 使用了crypto-js库进行加密
3. 使用了bootstrap库渲染组件

## 为什么使用此程序
- 采用加密技术，保证密码不泄露
- 使用文件夹管理密码，增强可读性和可查找性
- 支持批量移动密码
- 误删除也可以快速恢复
- 有趣的新手引导，帮助你立即上手
- 搜索功能让你快速找到目标

# 教程
## 概念
- 密码：基本结构，见下面的[添加密码](#添加密码)
- 文件夹：基本结构，见下面的[添加文件夹](#添加文件夹)
- 文件：密码和文件夹的总称。

## 添加密码
你可以通过页面底部的添加密码来添加一串密码。

添加的密码可以有以下的几个内容：
- 来源（必填）：填写密码的来源，一般是网站或者是软件名
- 用户名（必填）：填写账户的用户名
- 密码（必填）：填写密码
- 邮箱和手机号：如果使用邮箱或手机号注册可以填写邮箱或手机号
- 备注：可以填写你想说的话

**随机生成一个高强度的密码**

此按钮点击后，会随机生成一个新的密码，并自动覆盖原本密码框中的内容，

**保存与取消**

点击提交按钮可以保存更改，提交到系统中，点击取消可以放弃新建。

## 添加文件夹
文件夹可以帮助你高效且清晰地管理密码。

你可以点击右上角的“添加文件夹”图标来添加一个文件夹。

相同目录下文件夹**不可**重名！

## 阅览密码
被提交到系统中的密码会以来源字典序进行排序显示在屏幕上。

每一个密码都会展示密码的所有内容，如果字数太多会用省略号代替。

被提交到系统中的文件夹会以名称字典序进行排序显示在屏幕上。

## 操作密码
**拖拽**
你可以拖拽一个密码或文件夹到任意一个文件夹里。

在拖拽时，下方会出现一个“拖拽到此可以上移到……”的模块，可以将文件移动到上一级文件夹。

**主工具栏**
增加文件夹图标可以在当前目录下增加一个文件夹。

设置图标可以打开[设置界面](#设置)。

粘贴：如果没有复制过，则会是不可用。会将上一次选择的所有内容复制一份并粘贴到当前目录下。

移动：与粘贴类似，不过生效时会删除原位置的文件。

上移图标：会在根目录隐藏。上移到上一级目录。

当前位置：会在根目录隐藏。可以显示当前所在位置。

**选择功能**，可以进入一个选择状态，此状态下所有的文件前面都会带有一个复选框。
- 全部选择：选择该目录下全部的文件。
- 反向选择：对于该目录下全部的文件，如果被选中，则取消选中，如果没有被选中，则选中。
- 删除：删除所有选中的文件。
- 复制：或者说是取样，记录下当前选中的文件，与粘贴和移动配合使用。
- 取消选择：退出选择状态。

**信息工具栏**

在每一个密码的右下角，会有“删除”和“编辑”工具。

“删除”会将该密码移动至“回收站”。

“编辑”会打开此密码的编辑工具，你可以更改这个密码的内容。

同样，在每一个文件夹的右下角，也会有“删除”和“编辑”工具。

“删除”仍旧会将该文件夹移动至“回收站”。

“编辑”可以更改文件夹的名称。

**子目录**

如果你想要进入某个文件夹，你可以点击这个文件夹，而后就可以进入这个文件夹。顶上的“当前位置”会发生变化。

### 密码详情

点击一个密码会进入该密码对应的详情界面

详情界面会展示密码的所有信息，且增加了复制功能，点击后面的图标即可复制，复制完成后图标样式会发生变化。

**安全性提示**

在详情页面还会有安全性提示，轻微的安全性提示会用橙色标记，严重的会使用红色标记。

## 设置
### 安全设置
- 你可以设置访问密钥，如果这样，你需要每一次访问都需要填写密钥。
- 如果你觉得麻烦，你当然可以勾选下面的记住密钥，这样就不必记住密钥了。
### 其他个性化设置
- 当点击一条信息时，不会跳转到详情界面，而是直接复制这条信息对应的密码：如果你点击了密码，那么会直接将密码复制，而不是进入详情界面。如果你的各项内容的字数很少，这个选项会极大地方便你的体验。
- 添加密码时，使用快速而简洁的表单形式来代替创建引导形式：此选项仅建议熟练之后再开启，在方便的同时也会减少一些提示。

## 回收站
你可以在这里检查你删除的文件。

如果你删除的是文件夹，回收站中会显示你删除的文件夹和该文件夹下的每一个文件（即会把文件夹展开）。

除此之外，还会显示删除的日期。

**删除**：此操作不可逆！彻底删除一个文件。

**恢复**：取消删除一个文件，将文件移动回原来的位置，若原位不存在则会自动创建。

选择：类似于[操作密码](#操作密码)中的选择，只是没有复制功能，另外增加了批量删除和恢复功能。

## 当前位置

在主页面且不是根目录时，最顶端会出现“当前位置”栏，你可以点击其中的每一项，而回会跳转到对应的目录

## 新手指引

你可以通过新手指引来了解本程序的大部分功能。

## 搜索

你可以搜索储存的所有东西，包括密码、文件夹、回收站。

你可以通过设置高级设置来实现更多功能。