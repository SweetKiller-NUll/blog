---
title: Rocket - 基于Rust的web框架
date: 2019-1-7 10:19:01
layout: post
author: Knorien
cdn: header-on
header-img: sw1080.png
tags:
  - rust
  - web framework
  - rocket
---
> 先丢[官方文档](https://rocket.rs/v0.4/guide/introduction/)。本文是基于macOS编写，Windows下的差异性没有得到验证。
## 介绍
&emsp;&emsp;`Rocket`是一个基于`Rust`的`web`框架。如果你愿意的话，你可以认为`Rocket`是一个集成了`Rails`, `Flask` , `Bottle`和 `Yesod` 特点的框架，而且更灵活，更友好。但是我们更愿意把`Rocket`看做一个新的产物。`Rocket`的目标是快速，简单和灵活。它让你用尽可能少的代码来完成工作，从而变得有趣。这个指南会介绍`rust`的核心功能，中间件及先进概念。看完之后，你会发现使用`Rocket`会让你变得非常高效。

&emsp;&emsp;官方文档假定已经掌握`Rust`编程语言，而`Rust`新手推荐阅读[Rust Book](https://doc.rust-lang.org/book/)。

> Rocket的设计围绕三条哲理：

+ 函数的定义和参数类型需要包含处理请求和验证其有效性所需的必要信息。
+ 所有被处理请求信息都必须指定类型。因为`web`和`HTTP`都是无类型的（有些地方说字符串类型的），因此很多时候不得不把`string`类型转换为需要的类型。`Rocket`会自动做这些事，不需要额外的代码。
+ 不应该强行限制。模板, 序列化, 会话，几乎所有的功能都是可选择的插件形式。对于这些，`Rocket`都有官方库和支持，完全可以自由选择和替换。

这三条规则定义了`Rocket`的接口，并且在`Rocket`的每一个核心功能里都得到了体现。

## 入门
### 一、安装Rust
&emsp;&emsp;`Rocket`使用了大量的Rust的语法扩展和其它开发版的先进特性。因此我们需要使用`nightly`版的`Rust`。

&emsp;&emsp;安装`nightly`版的`Rust`, 我们推荐使用`rustup`。 执行`curl https://sh.rustup.rs -sSf | sh`下载执行脚本，按照提示选择安装，执行命令`source $HOME/.cargo/env`将`rustup`命令添加到`shell`。rustup安装成功之后，请按照下面的命令将`nightly`版的Rust设置为你默认的工具链。
```bash
rustup default nightly
```
Rocket 总是要求使用最新版本nightly版Rust。如果你的Rocket 应用忽然不能编译了。 请确认你使用的是否是最新的nightly版Rust。如果不是使用下面的命令升级：
```bash
rustup update && cargo update
```

> 重新啃`RUST`中，文章没写完。