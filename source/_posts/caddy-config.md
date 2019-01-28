---
title: 使用caddy部署静态站点和代理
date: 2018-11-29 16:13:12
layout: post
author: Knorien
cdn: header-on
header-img: sw1080.png
tags:
  - 静态部署
  - proxy
categories: 教程
keywords: 
  - caddy
  - https
  - golang
description: caddy实现部署
---
# 介绍
> &emsp;&emsp;`caddy`是一个由`go`语言编写的是具有自动HTTPS的HTTP/2 Web服务器。功能与`nginx`和`Apache`类似，但具有更低的上手成本、更简洁的配置和自动`HTTPS`的便利性，不用自己手动或者用脚本去执行生成签名证书。
> &emsp;&emsp;得益于`Let's Encrypt`开源项目的支持，`caddy`默认支持并自动启用`HTTPS`协议，使用`Let's Encrypt`签发的免费证书，并且默认启用`HTTP/2`协议。
# 特性
> 官方介绍

- 简单的`Caddyfile`配置
- 默认自动启用`Let's Encrypt`签名的`HTTPS`协议
- 默认启用`HTTP/2`
- 虚拟主机能使多个站点同时工作
- `QUIC`的支持
- `TLS`秘钥转换
- 支持插件扩展
- 没有外部依赖，能在任何地方运行

# 安装
&emsp;&emsp;前往[官方下载](https://caddyserver.com/tutorial)页面进行下载，支持`macOS`、`FreeBSD`、`dragonfly`、`Linux`、`nacl`、`OpenBSD`、`plan9`、`Solaris`、`Windows`等平台，几乎覆盖了主流的服务器平台。这里主要讲在`CentOS 7.4`上的安装。
&emsp;&emsp;执行脚本`curl https://getcaddy.com | bash -s personal`进行下载安装，完成安装后可以使用`which caddy`查看到`caddy`的默认安装位置为`/usr/local/bin/caddy`。

# 配置
&emsp;&emsp;通过`cd`命令跳转到`caddy`的工作目录，执行`caddy`即可运行服务器，默认端口`2015`，可通过访问`http://localhost:2015`或者如果服务器开放了`2015`端口可以通过访问`http://ip:2015`查看`caddy`是否正常运行。
&emsp;&emsp;执行脚本`mkdir -p /path/to`，创建文件夹用于存储配置(个人习惯喜欢把配置文件放在一个易于管理的地方)。通过`vim Caddyfile`创建`caddy`配置文件，并用于启动。

### 一、配置静态服务器
```bash
# 默认一个域名下同时启用HTTP和HTTPS协议，并且HTTP访问会重定向到HTTPS。
# 多域名重定向需要自己写方法判断
knorien.top {                        # 域名
    tls example@email.com            # 邮箱用于生成证书
    root /home/webroot/deploy/blog   # 部署的站点的根目录
    gzip                             # 启用gzip
    log /path/to/logs/caddy-main.log # 保存日志
    redir 301 {                      # 重定向 可使用if()条件判断，正则实现匹配 
        / https://www.{host}{uri}
    }
}
www.knorien.top {
    tls example@email.com
    root /home/webroot/deploy/blog
    gzip
    log /path/to/logs/caddy-www.log
}
```

### 二、配置代理
```bash
yourapi.knorien.top {
    proxy / localhost:port
    log /path/to/logs/caddy-yourapi.log
}
```
**这个代理配置真的是坑死人了，因为默认开启HTTPS，且不是代理静态站点，故不需要设置TLS，不然会导致整个caddy服务器挂掉，虽然在启动caddy服务器的时候能正常通过，并且启动服务，不只是proxy不生效，而且会导致其他正常代理的站点失效**
### 三、其他配置
&emsp;&emsp;当然，`caddy`不止这点功能，还有很强大的正、反向代理功能一些其他的功能配置，因为没有需求所以就诶有尝试。具体可以参照文档进行配置。

> 执行脚本`/usr/local/bin/caddy -agree -quic -conf /path/to/Caddyfile`启动`caddy`，即可通过浏览器访问域名查看效果。

# 守护进程
&emsp;&emsp;[Amami Ruri](https://github.com/TenkaiRuri)的安利和强力推荐，这里通过`supervisor`执行进程守护和管理。通过`yum`或者官网的介绍安装即可，这里不做赘述。
&emsp;&emsp;添加配置，通过`vi supervisord.conf`在配置的最底部加上一行`files = /path/to/supervisord.ini`，保存退出。
```bash
[include]
files = supervisord.d/*.ini
files = /path/to/supervisord.ini
```
&emsp;&emsp;通过`vi /path/to/supervisord.ini`编写程序启动配置，指向启动`caddy`并进行守护。
```bash
[program:caddy]
user=root
command=/usr/local/bin/caddy -agree -quic -conf /path/to/Caddyfile
startsecs=1
startretries=100
autorstart=true
autorestart=true
```
**执行命令`supervisorctl start caddy`即可启动，或者执行`supervisorctl restart caddy`执行重启。**
> 具体配置和字段释义参照官方文档进行设置查阅。

# 参考链接
Caddy官方文档：https://caddyserver.com/
Caddy仓库地址：https://github.com/mholt/caddy
Let's Encrypt：https://letsencrypt.org/
Supervisor：http://www.supervisord.org/
感谢大佬[Amami Ruri](https://github.com/TenkaiRuri)的指点和安利。