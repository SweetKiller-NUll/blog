---
title: 使用Let's Encrypt申请免费的HTTPS证书
date: 2018-10-31 13:11:48
layout: post
author: Knorien
cdn: header-on
header-img: sw1080.png
tags:
  - https
  - 加密
  - 证书
  - Let's Encrypt
  - acme-tiny
---
> &emsp;&emsp;HTTPS（全称：Hyper Text Transfer Protocol over Secure Socket Layer），是以安全为目标的HTTP通道，简单讲是HTTP的安全版。即HTTP下加入SSL层，HTTPS的安全基础是SSL，因此加密的详细内容就需要SSL。
> &emsp;&emsp;Let's Encrypt，是2016年4月12日成立的一家证书授权中心，提供免费的传输层安全（TLS）X.509证书，通过自动化的过程消除目前安全网站证书需要手工创建，加密，签名，安装以及更新的复杂性。
## 安装OpenSSL
&emsp;&emsp;要使用HTTPS需要使用OpenSSL进行签名生成，一般CnetOS 7默认会安装有，但是我在进行签名的时候遇到一个问题，就是找不到`openssl.cnf`在哪而导致的无法正确生成`.csr`文件。因此我们需要先安装最新版的OpenSSL。我们可以从[官网](https://www.openssl.org/source/)下载OpenSSL的源码进行安装。以`openssl-1.1.1.tar.gz`为例。
```bash
$ yum -y install gcc zlib
$ cd ~
$ mkdir openssl && cd openssl
$ wget https://www.openssl.org/source/openssl-1.1.1.tar.gz
$ tar -xzf openssl-1.1.1.tar.gz
$ cd openssl-1.1.1
$ ./config --prefix=/usr/local/openssl
$ mack && make install
```
可以通过`which openssl`查看OpenSSL的安装路径。然后使用脚本复制`openssl.cnf`到`/etc/ssl/`（此步骤可以省略，只要能找到`openssl.cnf`文件在哪里就行）。
```bash
$ cp /usr/local/openssl/ssl/openssl.cnf /etc/ssl/
```
## 创建CSR(Certificate Signing Request，证书签名请求) 文件
```bash
$ cd ~
$ mkdir ssl && cd ssl
$ git clone https://github.com/diafygi/acme-tiny.git
# 创建RSA私钥用于Let's Encrypt识别身份。
$ openssl genrsa 4096 > account.key
# 创建CSR（Certificate Signing Request，证书签名请求）文件。可选RSA私钥或ECC私钥，这里选择的是RSA私钥。
$ openssl genrsa 4096 > domain.key
# 生成CSR文件，这里添加包含`www`和不包含`www`的情况，其他子域可根据需要添加。
$ openssl req -new -sha256 -key domain.key -subj "/" -reqexts SAN -config <(cat /etc/ssl/openssl.cnf <(printf "[SAN]\nsubjectAltName=DNS:knorien.top,DNS:www.knorien.top")) > domain.csr
```
**注意：如果提示找不到`/etc/ssl/openssl.cnf`文件，则查看`/etc/ssl/`文件夹下是否存在`openssl.cnf`文件。如果不存在就将该文件复制到`/etc/ssl/`下，或者修改以上脚本路径。也可以采用交互方式创建CSR文件。**
使用交互方式`openssl req -new -sha256 -key domain.key -out domain.csr`创建CSR文件，信息根据自己需要填写。**Common Name必须填写为域名**。
## 配置验证服务
> acme-tiny脚本会生成验证文件并写入到你指定的目录下，然后通过 ".well-known/acme-challenge/" 这个URL来访问到验证文件。 注意: Let's Encrypt 会对你的服务器做一次http请求来进行验证，因此你需要保证80端口能够访问。
手动生成`challenges`目录，用来存放验证文件（路径可以根据需要修改）。
```bash
$ mkdir -p /var/www/challenges
```
nginx配置
```nginx
{
  server {
    listen 80;
    server_name knorien.top www.knorien.top;

    if ( $request_uri !~ "/.well-known/acme-challenge/*" ) {  # 让 Let's Encrypt 成功访问到验证文件不受 301 影响
      return 301 https://knorien.top$request_uri;             # 注意进行301重定向到https，否则通过http仍能访问你的站点
    }

    location /.well-known/acme-challenge/ {
      alias /var/www/challenges/;
      try_files $uri =404;
    }
  }
}
```
## 获取签名证书
```bash
$ cd ~/ssl/acme-tiny/
$ chmod +x acme_tiny.py         // 赋予acm_tiny可执行权限
$ python acme_tiny.py --account-key ./../account.key --csr ./../domain.csr --acme-dir /var/www/challenges/ > ./signed.crt // 生成签名证书
```
## 安装证书
> 针对nginx，你还需要将 Let's Encrypt 的中间件证书`intermediate.pem`内容附加在签名证书signed.crt之后。
```bash
$ cd ~/ssl/acme-tiny/
$ wget -O - https://letsencrypt.org/certs/lets-encrypt-x3-cross-signed.pem > intermediate.pem
$ cat signed.crt intermediate.pem > chained.pem
$ mkdir -p /path/to
$ cp chained.pem /path/to/
$ cd ..
$ cp account.key domain.key domain.csr acme-tiny /path/to/
```
配置nginx的443端口。
```nginx
{
  server {
    listen 443;
    server_name knorien.top www.knorien.top;

    ssl on;
    ssl_certificate /path/to/chained.pem;
    ssl_certificate_key /path/to/domain.key;
    ssl_session_timeout 5m;
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA:ECDHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA:DHE-RSA-AES128-SHA;
    ssl_session_cache shared:SSL:50m;
    ssl_prefer_server_ciphers on;
  }
}
```
## 证书自动更新定时任务
> Let's Encrypt 证书有效期只有90天，所以需要定期更新。现在只需要写一个更新脚本并把它放到定时任务中即可。
```bash
#!/usr/bin/sh
python /path/to/acme-tiny/acme_tiny.py --account-key /path/to/account.key --csr /path/to/domain.csr --acme-dir /var/www/challenges/ > signed.crt || exit
wget -O - https://letsencrypt.org/certs/lets-encrypt-x3-cross-signed.pem > intermediate.pem
cat signed.crt intermediate.pem > /path/to/chained.pem
service nginx reload
```
保存脚本为`renew_cert.sh`，执行`chmod a+x renew_cert.sh`赋予脚本可执行权限。设置定时任务每个月执行一次即可。
```bash
$ 0 0 1 * * sudo bash /path/to/renew_cert.sh 2>> /var/log/acme_tiny.log
```
## 参考链接
https://imququ.com/post/letsencrypt-certificate.html
https://laravel-china.org/articles/2766/lets-encrypt-the-site-of-the-encrypted-tour
