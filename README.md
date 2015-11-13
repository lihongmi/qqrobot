SmartQQ-Bot
------
SmartQQ-Bot powered by node.js

FYI: QQ is a instant messaging service widely used in china provided by Tencent. SmartQQ is the web implmentation.

基于 [WebQQ](http://w.qq.com/) 的机器人。原项目是 Xu Han 用 CoffeeScript 开发，这是一个很棒的项目。Raymond Xie 主要增加了对 二维码扫描认证登陆的支持。这个版本全部代码转换为 javascript，并且发布为 npm 包，无需配置，安装即可使用，更加方便。

![SmartQQ-Bot](qqbot.png)

Features
-----
* 手机QQ二维码扫描登录，貌似这是目前 WebQQ 唯一允许的登录方式
* 支持好友，群，讨论组的接入
* 插件化，目前支持消息的派发
* 提供HTTP API支持（比如群通知什么的都能做哦）
* 除了 qqbot，还附带了一个命令行的 qq 来连接 qqbot，可以用来显示好友、群组列表，发送消息等操作

你可以用TA来  

经典案例：
* 持续集成自动通知 (这是软件项目开发必备的，也是我使用并改进 qqbot 最初的原因 --- Raymond)
* 用来集成团队协作系统的消息推送（有QQ消息推送的看板系统，是真的即时沟通 --- Raymond）

其它可能的用途：
* 监控报警机器人（监控报警啊什么的，对于天天做电脑前，报警还得通过邮件短信提醒多不直接呢）
* 辅助管理群成员，比如自动清理刷屏用户啊（请自己实现）
* 聊天机器人（请自己实现AI）
* 部署机器人（请了解hubot的概念）

Installation
-----
```bash
$ [sudo] npm install -g smartqq-bot
```

Usage as Standalone Robot
-----
```bash
$ qqbot
```

* 执行 `qqbot` 启动 SmartQQ-Bot，会从QQ服务器请求二维码图片，并打开显示
* 用手机QQ扫描二维码，并选择允许 smartQQ 登录
* 登陆成功后，可以用 Ctrl+Z, bg 1 使之进入后台模式

* 接下来，可以用其他的程序访问 qqbot 的 apiserver，调用 SmartQQ-Bot 的功能，协议为：
`http://localhost:3200/send?type=[group|buddy|discuss]&to=[qqnumber/nick/gname]&msg=[msg]`

* 或者，用附带的命令行的 qq，访问启动后 qqbot，可以用来显示好友、群组列表，发送消息等操作

```bash
$ qq list buddy
$ qq list group
$ qq send buddy {qq_number/nick} {msg}
$ qq send group {group_number/gname} {msg}
$ qq quit
```

参考资料
----
* [CHANGELOG.md](CHANGELOG.md)
* [WebQQ协议](protocol.md)
* 访问 http://w.qq.com/ ，事实上，了解 WebQQ 协议更直接的方式，是通过 Chrome 打开“审查元素”模式，观察和服务器之间的网络交互

TODO
---
* 用户信息,qq号等
* 机器人响应前缀
* 图片发送支持

Credits
----
* QQBot 主要由 [xhan](https://github.com/xhan) 从 2013年12月开始，陆陆续续实现绝大部分功能。
* [Raymond Xie](https://github.com/floatinghotpot) 于 2015年10月 增加了 手机QQ二维码扫描认证登陆。

