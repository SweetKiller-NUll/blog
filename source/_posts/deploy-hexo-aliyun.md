---
title: 在云服务器上自动部署并更新hexo
date: 2018-10-30 20:14:36
layout: post
author: Knorien
cdn: header-on
header-img: sw1080.png
tags:
  - 自动部署
  - hexo
  - nginx
  - 阿里云
categories: 教程
keywords: 
  - hexo
  - nginx
description: hexo自动部署阿里云
---
# 本地环境
> 本地开发环境为*`macOS Mojave v14.0`*，编辑器为*`Visual Studio Code v1.28.2`*，nodejs版本为*`v10.12.0`*。
## 一、准备工作
### 1、nodejs
&emsp;&emsp;从[nodejs官网](https://nodejs.org/)下载安装。安装完成之后`node -v` `npm -v`查看nodejs以及npm是否安装成功和版本号。
### 2、Git
&emsp;&emsp;从[git-scm](https://git-scm.com/)下载安装文件进行安装。安装完成之后`git --version`查看是否安装成功和版本号。
### 3、hexo-cli
&emsp;&emsp;通过`yarn`或者`npm`全局安装`hexo-cli`脚手架。
```bash
$ yarn golbal add hexo-cli
$ npm install -g hexo-cli
```
## 二、项目
### 1、初始化hexo项目
&emsp;&emsp;通过`hexo-cli`脚手架命令行`hexo init <project-name> && cd <project-name>`初始化hexo项目。
### 2、依赖安装
&emsp;&emsp;通过`yarn`或者`npm i`安装依赖。安装`hexo-deployer-git`部署插件和`hexo-server`本地服务插件，来对hexo项目的部署和本地服务启动。
```bash
$ yarn add hexo-deployer-git
$ yarn add hexo-server -D
```
### 3、博客编写
&emsp;&emsp;使用`hexo new <title>`来生成文章文件。使用Markdown语法书写文章，可以[查看Markdown](https://github.com/guodongxiaren/README)语法规则。其他hexo的用法可以查看[hexo官方文档](https://hexo.io)。比如自己设计主题或者应用开源主题，可以查看更多的hexo高级用法。
### 4、本地启动开发预览和部署
&emsp;&emsp;本地启动开发预览模式很简单，只需要执行`hexo clean && hexo generate && hexo server`即可启动本地开发服务器实现预览。默认以端口号4000运行，即可以直接访问`http://localhost:4000`进行本地查看项目效果。  
&emsp;&emsp;而部署到线上也是很简单的，只要将generate生成的静态文件部署到线上服务器即可。即可运行命令行`hexo clean && hexo generate --deploy`实现一键部署。具体实现查看[文档](https://hexo.io/zh-cn/docs/deployment)。这里主要讲解通过Git实现自动化部署到自己的云服务器，而其他的诸如github pages的部署可以直接查看官方文档。
### 5、自动化部署
&emsp;&emsp;配置`_config.yml`文件，`deploy`项设置Git相关信息，达到实现上传Git的目的。
```yml
deploy:
    type: git
    repo: git@SERVER_IP:GIT_PATH # <repository url>比如我的仓库地址为git@SERVER_IP:/home/git/blog.git
    branch: master               # 仓库分支
    message: 提交的信息            # commit的信息，可不填写。默认为 Site updated: {{ now('YYYY-MM-DD HH:mm:ss') }}
```
**可以将脚本写进`package.json`中，这样就能通过我们开发的熟悉脚本`yarn dev`或`npm run dev`启动本地服务，执行`yarn build`或`npm run build`实现自动化部署。**
```json
{
  "scripe": {
    "dev": "hexo clean && hexo generate && hexo server",
    "build": "hexo clean && hexo generate --deploy"
  }
}
```
而要实现自动化部署并能够访问，还需要服务端的配置相配合。下面将讲解服务端和其相关的配置。
# 服务器环境（CentOS 7.4）
> 我自己的服务器系统是`CentOS 7.4`，其他的Linux系统差异性需看问题解决。
## 一、准备工作
### 1、yum
&emsp;&emsp;`yum -y update`。这一步可以跳过，但是个人还是建议更新。而设置`epel-release`安装源的步骤亦可以省略，有需求可Google。
### 2、Git
&emsp;&emsp;`可以使用`yum -y install git`来安装，也可以使用源码进行安装最新版的Git。
&emsp;&emsp;首先，需要移除旧版本，也就是CentOS 7自带的Git，如果有自带的Git的话。
```bash
yum remove git
```
&emsp;&emsp;其次，下载最新版的源码或者特定版本的源码。可以从[git-scm](https://www.kernel.org/pub/software/scm/git/)或[github](https://github.com/git/git/release)下载`tar.gz`压缩包。
```bash
# 安装编译源码所需要的环境
$ yum -y install curl-devel expat-devel gettext-devel openssl-devel zlib-devel gcc perl-ExtUtils-MakeMaker
# 下载
$ cd /usr/src
$ wget https://www.kernel.org/pub/software/scm/git/git-2.5.0.tar.gz
$ tar -zxvf git-2.5.0.tar.gz
# 编译源码
$ cd git-2.5.0
$ make prefix=/usr/local/git all
$ make prefix=/usr/local/git install
# 查看Git版本
git --version
```
### 3、nginx
&emsp;&emsp;这里通过nginx代理静态站点，故需要安装nginx，通过yum直接安装`yum -y install nginx`，也可以通过其他方式安装。nginx默认配置在`/etc/nginx/nginx.conf`，只需要修改root地址指向部署静态文件的目录就可以。有域名的时候需要指定域名`server_name`。
```bash
$ vim /etc/nginx/nginx.conf
```
英文输入法下按i进入编辑模式。
```nginx
server {
  server_name   _;            # 默认为_，也就是localhost或者127.0.0.1。
  root          /DEPLOYPATH;  # 部署静态资源文件的目录，用绝对路径。建议部署在`/home`文件夹下，即`/home/**/deploy`，可以避免一些权限问题。
}
```
**`注意：nginx的配置都需要以;结尾，不然启动的时候会报错或者出现一些其他的异常。`**
&emsp;&emsp;如果输出的时候提示读写权限的问题可以给部署目录添加读写权限`chmod -R 777 /home/**/deploy`，部署路径和文件夹名自定。修改完配置之后按`ESC`退出编辑模式，`shift+:`进入命令行执行`:wq`保存退出操作。执行脚本`nginx`启动nginx服务器。
```bash
$ nginx || systemctl start nginx && systemctl enable nginx         # 启动nginx服务
$ nginx -s reload                                                  # 重启nginx服务
$ nginx -s stop || systemctl stop nginx && systemctl disable nginx # 停止nginx服务
$ nginx -s quit                                                    # 退出nginx服务
```
&emsp;&emsp;更多的nginx命令指令和操作可以查看[官方文档](https://nginx.org/en/docs/)。如果出现错误可以根据错误提示进行推测或者直接`Google/Baidu`搜索错误信息，一般都能找到错误原因和解决方法。
&emsp;&emsp;验证nginx是否开启成功，可以在部署目录新建index.html文件，写点东西然后通过ip或者域名访问。nginx默认开启80端口，可以自行设置其他端口。如果云服务器没有开放代理端口的访问需要先开启端口访问权限，否则无法正常进行访问，具体可自行搜索。
### 4、部署和自动化
&emsp;&emsp;部署静态资源文件，直接将资源文件放在部署目录下就可以，可以直接通过将打包好的文件上传到`github`或者其他Git仓库，`git clone`download到部署目录即可。而要实现自动化部署到自己的云服务器的话，这里采用git的hooks来实现。如果是要部署到github pages的话，可以直接通过`[Travis-CI](https://travis-ci.org/)`实现自动化，这里不做多的解释，可自行搜索实现。
&emsp;&emsp;为了服务器的安全或者其他的问题，这里将创建Git账户来存储Git仓库。
```bash
$ adduser git
$ chmod 740 /etc/sudoers
$ vim /etc/sudoers
```
找到`root   ALL=(ALL)   ALL`，在这行下面添加配置
```text/plain
git   ALL=(ALL)   ALL
```
保存退出之后改回权限`chmod 400 /etc/sudoers`，然后设置git用户的密码
```bash
sudo passwd git
```
按照提示修改完密码。
&emsp;&emsp;通过`su git`切换到Git账户，执行以下脚本将本地的公钥添加到授权，即可实现免密码登录，也就是Git提交代码的时候无需输入密码。
```bash
$ su git
$ mkdir ~/.ssh
$ vi ~/.ssh/authorized_keys
# 然后将电脑中执行 `cat ~/.ssh/id_rsa.pub | pbcopy` ，将公钥复制粘贴到authorized_keys，保存退出。
$ chmod 600 ~/.ssh/authorized_keys
$ chmod 700 ~/.ssh
```
然后本地执行`ssh -v git@SERVER_IP`验证是否实现免密登录。
&emsp;&emsp;接下来将在Git账户下创建Git仓库，以此实现自动化部署。登录服务器执行脚本
```bash
$ su git
$ cd ~
$ git init --bare blog.git // 需要实现hooks需要指定--bare，仓库名称自定，需要后面一一对应上即可。
```
使用git-hooks实现自动化部署，这里使用的钩子是`post-receive`，如果存在`post-receive.sample`文件将此复制一份重命名为`post-receive`，如果没有就新建名为`post-receive`文件。执行以下脚本
```bash
$ vi ~/blog.git/hooks/post-receive
```
```bash
#!/bin/sh
git --work-tree=/DEPLOYPATH --git-dir=/home/git/blog.git checkout --force
```
退出保存，然后执行`chmod +x ~/blog.git/hooks/post-receive`赋予文件可执行权限。
至此，所有的配置都已完成，可以通过本地执行部署脚本将本地静态文件提交到云服务器的Git仓库，并通过钩子实现自动化的部署了。
**😒这里坑死我了，因为一些权限和路径的问题，来回折腾的我都蒙圈了。**
> **重点：主要就是注意部署目录的路径，Git仓库的路径问题。还有各种权限问题。所有的坑无非就是这两种，仔细查看错误信息，查阅网上资料，所有的问题都能够很好的得到解决。**
> 纸上得来终觉浅，绝知此事要躬行。总要自己试试，才能够知道行不行。只要把坑都踩过一遍，才知道哪些坑是真的坑，哪些坑是自己粗心大意所致。