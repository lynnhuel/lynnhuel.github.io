---
layout: post
title: "linux-httpd配置"
date: 2017/10/16 21:02:21 
description: ""
tag: linux
--- 

### 工作模式 ###  

|模式|描述|图示|
|-|---|----------|
|prefork：|多进程I/O模型，每个进程响应一个请求，默认模型一个主进程：生成和回收n个子进程， 创建套接字，不响应请求多个子进程：工作work进程，每个子进程处理一个请求；系统初始时，预先生成多个空闲进程，等待请求，最大不超过1024个|![prefork](http://52wcf.me/images/httpd/prefork.png)|
|worker：|复用的多进程I/O模型,多进程多线程， IIS使用此模型一个主进程： 生成m个子进程，每个子进程负责生个n个线程，每个线程响应一个请求，并发响应请求： m*n|![worker](http://52wcf.me/images/httpd/worker.png)|
|event：|事件驱动模型（worker模型的变种）一个主进程：生成m个子进程，每个进程直接响应n个请求，并发响应请求： m*n，有专门的线程来管理这些keep-alive类型的线程，当有真实请求时， 将请求传递给服务线程，执行完毕后，又允许释放。这样增强了高并发场景下的请求处理能力|![event](http://52wcf.me/images/httpd/event.png)|

#### 切换工作模式 ####

/etc/sysconfig/httpd 文件中

![工作模式](http://52wcf.me/images/httpd/工作模式.png)

如图，默认为prefork模式，去掉注释井号，后面修改为想要切换的模式，重启服务即可。

### 配置 ###

本文以centos6为准

默认版本为apache2.2版本

配置文件
	
/etc/httpd/conf/httpd.conf
 
	三部分：  
	1全局 2主服务配置 3虚拟主机  

主要参数

	serverroot 根目录  
	servertokens 响应头服务器版本  
	listen 监听端口；多监听  
	keepalive 持续连接  
	documentroot 站点目录  
	directoryindex 默认首页  

主要命令

	httpd -M 查看模块  
	httpd -l 查看静态编译的模块
	检查配置语法：
	httpd –t  
	service httpd configtest  
	服务控制和启动：  
	chkconfig httpd on|off  
	service {start|stop|restart|status|configtest|reload} httpd  
	

文件路径

	<Directory “/path">
	...
	</Directory>
	<File “/path/file”>
	...
	</File>
	<FileMatch "PATTERN">
	...
	</FileMatch>

URL路径：

	<Location "">
	...
	</Location>
	<LocationMatch "">
	...
	</LocationMatch>

示例：

	<FilesMatch "\.(gif|jpe?g|png)$">
	<Files “?at.*”> 通配符
	<Location /status>
	<LocationMatch "/(extra|special)/data">

访问控制：

	options 工作特性  indexes|followsymlinks|none|all  
	配置文件  /etc/httpd/conf.d/*
	默认支持followsymlinks不支持indexes默认子文件夹继承父文件夹  

|选项|描述|
|-|-|
|Indexes：|指明的URL路径下不存在与定义的主页面资源相符的资源文件时，返回索引列表给用户|
|FollowSymLinks：|允许访问符号链接文件所指向的源文件|
|None：|全部禁用|
|All： |全部允许|

AllowOverride
	
>与访问控制相关的哪些指令可以放在指定目录下的.htaccess（由AccessFileName指定）文件中，覆盖之前的配置指令，只对<directory>语句有效  
	AllowOverride All: 					所有指令都有效  
	AllowOverride None： .htaccess 		文件无效  
	AllowOverride AuthConfig Indexes 	除了AuthConfig和Indexes的其它指令都无法覆盖

order和allow、 deny

>order：定义生效次序；写在后面的表示默认法则  
Order allow,deny  
Order deny,allow  
Allow from, Deny from  

设定默认字符集

	AddDefaultCharset UTF-8
	中文字符集： GBK, GB2312, GB18030

定义路径别名

	格式： Alias /URL/ "/PATH/"
		DocumentRoot "/www/htdocs"
			http://www.magedu.com/download/bash.rpm
			==>/www/htdocs/download/bash.rpm
		Alias /download/ "/rpms/pub/"
			http://www.magedu.com/download/bash.rpm
			==>/rpms/pub/bash.rpm
			http://www.magedu.com/images/logo.png
			==>/www/htdocs/images/logo.png