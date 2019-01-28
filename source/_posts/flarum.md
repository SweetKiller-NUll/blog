---
title: 使用caddy部署flarum论坛
date: 2019-01-28 13:40:32
layout: post
author: Knorien
cdn: header-on
header-img: sw1080.png
tags:
  - caddy
  - flarum
categories: 教程
keywords: 
  - caddy
  - flarum
description: caddy部署flarum论坛
---
# 介绍
&emsp;&emsp;`Flarum`是一款优雅简洁的论坛软件。
&emsp;&emsp;我的论坛（空论坛）：[`https://forum.knorien.cn/`](https://forum.knorien.cn/)
> 请留意 Flarum 正处在 Beta 版软件阶段。这意味着：
> - 它还有很多没完成的功能和 Bug， 🐛🐞 而且
> - 某些时候 —— 可能早可能晚 —— 它甚至会崩溃！ 💥
> - 不要在生产环境中使用它。
> - 有责任感地汇报 Bug。
## 快速 - 不臃肿、不复杂、不过度依赖。几分钟之内构建属于自己的社区。
 - `Flarum`基于`PHP`构建，因此很容易安装部署。界面使用 [`Mithril`](https://mithril.js.org/)构建，`Mithril`是一个高性能的`JavaScript`框架。更少的等待，更多的交流。

## 精美的响应式布局
 - `Flarum`不仅仅为程序员开发，而是为所有人开发的。`Flarum`在设计之初就考虑了跨平台，开箱即用。并且`Flarum`的界面风格使用了[`LESS`](http://lesscss.org/)，这样很容易更换主题。

## 强大 - 定制性、可扩展性，都集成在了`Flarum`中。
 - 构建可扩展的软件是很困难的。值得庆幸的是，我们有多年的开发[`esoTalk`](https://esotalk.org/)和[`FluxBB`](https://fluxbb.org/)的经验。`Flarum`的开源架构是非常灵活的，他拥有完善的`API`和文档。

# 安装
> `Flarum`使用[`Composer`](https://getcomposer.org/)管理依存关系和扩展。这意味着`Flarum`没法在没有`SSH（命令行）`连接的主机上安装。我们未来会保证`Flarum`能用其他的方法安装，使之可被所有人使用。与此同时，如果现在你希望运行`Flarum`，你需要寻找允许`SSH`连接的主机。
## 系统需求
&emsp;&emsp;下为运行 Flarum 所需的一些条件。
 - 网页服务器软件： `Apache`(需要支持`mod_rewrite`)，`Nginx`，`Caddy`或者`Lighttpd`；
 - `PHP 5.5+`，需要开启的扩展：`mbstring`, `pdo_mysql`, `openssl`, `json`, `gd`, `dom`, `fileinfo`；
 - `MySQL 5.5+`；
 - `SSH（命令行）`连接。

&emsp;&emsp;这里采用的环境配置为：
 - `MacBook Pro 2017 macOS Mojave v10.14.2`，`Windows`可以使用[`PuTTY`](https://www.putty.org/)来进行服务器访问；
 - `CentOS Linux release 7.6.1810 (Core) `；
 - `PHP 7.2.14`，其他按照正常添加扩展，这里要提一点，`PHP7`的`pdo_mysql`扩展不存在，安装`mysqlnd`即可。可以查看[`webtatic`](https://webtatic.com/packages/php72/)查看有哪些扩展；
 - `MySQL 5.6.43`。

## 安装 Flarum
&emsp;&emsp;`Flarum`使用`Composer`做为管理依存和扩展的工具。所以，在安装`Flarum`之前，你需要在你的电脑上安装`Composer`。然后在`Flarum`应该安装的地方运行此命令：
```bash
composer create-project flarum/flarum . --stability=beta
```
在此命令运行时，你就可以为你的服务器配置`URL`重写了。最后，使用浏览器访问你的论坛，完成最后的安装步骤。

## 服务器配置

### Apache

&emsp;&emsp;`Flarum`附带了一个`Apache`的`.htaccess`文件 —— 记得正确地上传它。如果你在使用共享空间，确保你的空间提供商开启了`mod_rewrite`。你也可能需要将下述加入到你的`Apache`配置中：
```htaccess
<Directory "/path/to/your/forum">
    AllowOverride All
</Directory>
```

### Nginx

&emsp;&emsp;`Flarum`包含一个`.nginx.conf`文件 - 确保它已正确上传。然后，假设您在`Nginx`中设置了`PHP`站点，请将以下内容添加到服务器的配置块中：：
```conf
include /path/to/flarum/.nginx.conf;
```
### Lighttpd

&emsp;&emsp;添加下述配置到你的服务器配置块：
```bash
url.rewrite-if-not-file = (
    "/admin.*" => "/admin.php",
    "/api.*"   => "/api.php",
    "/.*"      => "/index.php"
)
```

### **`Caddy`**
&emsp;&emsp;添加下属配置到`Caddyfile`文件启动服务模块：
```Caddyfile
domain.example.com {
    root /path/to/flarum/public
    rewrite {
        to {path} {path}/ /index.php
    }
    fastcgi / /var/run/php-fpm/php-fpm.sock php
    header /assets {
      +Cache-Control "public, must-revalidate, proxy-revalidate"
      +Cache-Control "max-age=2592000"
      Pragma "public"
    }
    gzip
    log /path/to/logs/caddy-flarum.log
}
```

> 如果出现目录不可写的问题，代码为`0775`，可以执行以下命令解决：
```bash
chmod -R 0777 /path/to/flarum
```

> 具体可以查看[官方安装文档](https://flarum.org/docs/install.html)查看参考。

## 扩展

&emsp;&emsp;`Flarum`扩展由社区提供，可以通过社区[`extensions`](https://discuss.flarum.org/t/extensions)板块获取插件，并于`yourflarum/admin#/extensions`，即`超级管理员`的`管理`模块下`插件`子模块启用。
&emsp;&emsp;以安装中文语言扩展为例：
链接地址：[`https://discuss.flarum.org/d/17954-chinese-language-pack-for-beta8`](https://discuss.flarum.org/d/17954-chinese-language-pack-for-beta8)

### 安装
```bash
composer require csineneo/lang-simplified-chinese
```

### 卸载
```bash
composer remove csineneo/lang-simplified-chinese
```

# 后记
> 写这篇文章的时候，官方对于`Caddy`部署没有多做描述，社区对这方面的资料也非常少。还有因本人对`PHP`的不了解，着实踩了不少坑。如果是`NGINX`部署的可以直接参照官方的配置进行，如果是跟我一样`Caddy`进行部署代理的，可以参照本文配置。

> 有什么不懂的可以在下方留言大家交流，尽可能不要匿名啊，好歹写个昵称。