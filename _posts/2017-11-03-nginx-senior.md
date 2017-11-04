---
layout: post
title: "centos nginx高级应用"
date: 2017/11/03
description: "nginx配置介绍，重定向，监控"
tag: linux
--- 

# nginx高级应用

### 重定向 ###

#### 例子： ####

1、 根据不同客户端进行重定向， 实现请求分离

	if ($http_user_agent ~ “MSIE”) {
	rewrite ^(.*)$ /mobile/$1 break;
	} 
	#在server段配置， 用户用IE浏览器访问， 路由请求到/mobile/目录下

2、 对于不存在的页面， 强行跳转到提示页面

	if (!-e $request_filename) {
	rewrite ^(.*)$ /404.html break;
	} 
	#在server段配置， 当用户访问的页面不存在时， 跳转到提示页面

3、 抵挡恶意攻击重定向

	if ($http_user_agent ~ "ApacheBench") {
	rewrite ^(.*)$ /404.html break;
	}
	#对于用户agent进行判断， 如果是不合理agent， 可直接跳转到处理页面， 也可以return直接
	返回代码。

4、 实现url域名跳转

	if ($http_user_agent ~ "MSIE") {
	rewrite ^(.*)$ http://www.magedu.com/$1 redirect;
	} 
	#对于IE浏览器的用户， 跳转到新的域名站点


#### 规则： ####

**rewrite**功能就是， 使用nginx提供的全局变量或自己设置的变量，结合正则表达式和标志位实现url重写以及重定向。 rewrite只能放在server{},location{},if{}中， 并且只能对域名后边的除去传递的参数外的字符串起作用

举例： http://www.magedu.com/index.php =>http://www.magedu.com/new/index.php

表明看rewrite和location功能有点像， 都能实现跳转， 主要区别在于rewrite是在同一域名内更改获取资源的路径， 而location是对一类路径做控制访问或反向代理，可以proxy_pass到其他机器。 很多情况下rewrite也会写在location里， 它们的执行顺序是：

> 1、 执行server块的rewrite指令  
> 2、 执行location匹配  
> 3、 执行选定的location中的rewrite指令 


如果其中某步URI被重写， 则重新循环执行1-3， 直到找到真实存在的文件； 循环超过10次， 则返回500 Internal Server Error错误。

语法rewrite regex replacement [flag];

|flag标志位|作用|
|--|--|
|last :| 相当于Apache的[L]标记， 表示完成rewrite
|break :| 停止执行当前虚拟主机的后续rewrite指令集
|redirect :| 返回302临时重定向， 地址栏会显示跳转后的地址
|permanent :| 返回301永久重定向， 地址栏会显示跳转后的地址

因为301和302不能简单的只返回状态码， 还必须有重定向的URL，这就是return指令无法返回301,302的原因了。 这里 last 和 break区别有点难以理解：

> last一般写在server和if中， 而break一般使用在location中
> last不终止重写后的url匹配， 即新的url会再从server走一遍匹配流程， 而break终止重写后的匹配
> break和last都能组织继续执行后面的rewrite指令

**if判断指令**

语法为if(condition){...}， 对给定的条件condition进行判断。 如果为真， 大括号内的rewrite指令将被执行， if条件(conditon)可以是如下任何内容：

> 当表达式只是一个变量时， 如果值为空或任何以0开头的字符串都会当做false  
> 直接比较变量和内容时， 使用=或!=  
> ~正则表达式匹配， ~*不区分大小写的匹配， !~区分大小写的不匹配  
> -f和!-f用来判断是否存在文件  
> -d和!-d用来判断是否存在目录  
> -e和!-e用来判断是否存在文件或目录  
> -x和!-x用来判断文件是否可执行  

|常见全局变量|含义|
|-|-|
|$host：|请求主机头字段， 否则为服务器名称。
|$http_user_agent：| 客户端agent信息
|$http_cookie： |客户端cookie信息
|$limit_rate：| 这个变量可以限制连接速率。
|$request_method：| 客户端请求的动作， 通常为GET或POST。
|$remote_addr：| 客户端的IP地址。
|$request_filename：| 当前请求的文件路径， 由root或alias指令与URI请求生成。
|$scheme：| HTTP方法（如http， https） 。
|$server_protocol：| 请求使用的协议， 通常是HTTP/1.0或HTTP/1.1。
|$server_addr： |服务器地址， 在完成一次系统调用后可以确定这个值。
|$server_name： |服务器名称。
|$server_port： |请求到达服务器的端口号。
|$request_uri： |包含请求参数的原始URI， 不包含主机名， 如："/foo/bar.php?arg=baz"


### 监控页面 ###

Nginx运行状态， StubStatus模块获取Nginx自启动的工作状态（编译时要开启对应功能）

	location /status {
		stub_status on;  #启用StubStatus的工作访问状态
		access_log logs/nginxstatus.log;  #指定StubStaus模块的访问日志文件
		auth_basic "nginxstatus";  #Nginx认证机制（需Apache的htpasswd命令生成）
		auth_basic_user_file ../htpasswd;  #用来认证的密码文件 
	}

访问： http://IP/NginxStatus  测试

![nginx监控](images/nginx/监控.png,"nginx监控图")

#### nginx状态页面各段含义 ####

Active connections： 当前活动的客户端连接数；  
accepts： 已经接受的客户端连接总数量；  
handled： 已经处理过后客户端连接总数量；  
requests： 客户端的总的请求数量；  
Readking： 正在读取的客户端请求的数量；  
Writing： 正向其发送响应报文的连接数量；  
Waiting： 等待其发出请求的空闲连接数量。  


### 加密的https链接 ###

![nginx https](images/nginx/ssl.png,"nginx-https配置")

> ssl_certificate file;   #证书文件路径；  
> ssl_certificate_key file;  #证书对应的私钥文件；  
> ssl_ciphers ciphers; #指明由nginx使用的加密算法， 可以是OpenSSL库中所支持各加密套件；   
> ssl_protocols [SSLv2] [SSLv3] [TLSv1] [TLSv1.1] [TLSv1.2];  #指明支持的ssl协议版本， 默认为后三个；   
> ssl_session_cache off | none | [builtin[:size]] [shared:name:size]; #指明ssl会话缓存机制； builtin： 使用OpenSSL内置的ssl会话缓存， 对机制为各worker私有； shared： 在各worker之间使用一个共享的缓存； name： 独有名称； size： 缓存空间大小；   
> ssl_session_timeout time;  #ssl会话超时时长； 即ssl session cache中的缓存有效时长；   


