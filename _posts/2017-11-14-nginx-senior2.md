---
layout: post
title: "nginx实现反向代理与负载均衡、缓存"
date: 2017/11/14
description: "nginx 反向代理 负载均衡 实战配置 高级应用"
tag: 负载均衡与高可用
---

### Nginx实现反向代理 ###

nginx代理基于是ngx_http_proxy_module模块的功能， 该模块有很多属性配置选项， 如：  
**proxy_pass：** 指定将请求代理至server的URL路径；  
**proxy_set_header：** 将发送至server的报文的某首部进行重写；  
**proxy_send_timeout：** 在连接断开之前两次发送到server的最大间隔时长； 过了这么长时间后端还是没有收到数据， 连接会被关闭
**proxy_read_timeout：** 是从后端读取数据的超时时间， 两次读取操作的时间间隔如果大于这个值， 和后端的连接会被关闭。
**proxy_connect_timeout：** 是和后端建立连接的超时时间

#### proxy_pass配置常见用法有三种： ####

1、 location的/uri将被替换为/newuri， 如下：
	
	location /uri {
		proxy_pass http://ip:port/newuri;
	} 
		#将/mobi 的请求跳转到新服务器上/mobile目录下
	location /mobi/ {
		proxy_pass http://172.16.100.1/mobile/index.php;
	}

2、 如果location的URI是通过模式匹配定义的， 其URI将直接被传递， 而不能为其指定转换的另一个URI。

	location ~ ^/mobile {
		proxy_pass http://172.16.100.2;
	}


3、 如果在location中使用的URL重定向， 那么nginx将使用重定向后的URI处理请求， 而不再考虑之前定义的URI

	location /youxi {
		rewrite ^(.*)$ /mobile/$1 break;
		proxy_pass http://172.16.100.1;
	} 

proxy_set_header可将发送至server的报文的某首部进行重写； 常用于nginx做负载均衡时， 获取客户端IP时， 需要添加forward头部。

	proxy_set_header Host $host;
	proxy_set_header X-REMOTE-IP $remote_addr;
	proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
原有请求报文中如果存在X-Forwared-For首部， 则将client_addr以逗号分隔补原有值后， 否则则直接添加此首部；

日志查看："$remote_addr" $host "$http_x_forwarded_for"


### Nginx实现反向代理负载均衡 ###

nginx负载均衡是ngx_http_upstream_module模块的功能， 需要在配置文件http块上下文中定义upstream块， 指定一组负载均衡的后端服务器， 然后在上面讲到的proxy_pass中引用， 就可以反向代理时实现负载均衡了。

语法： `server address [parameters]`

#### paramerters： ####
**weight：** 负载均衡策略权重， 默认为1；  
**max_fails：** 在一定时间内（这个时间在fail_timeout参数中设置） 检查这个服务器是否
可用时产生的最多失败请求数  
**fail_timeout：** 在经历了max_fails次失败后， 暂停服务的时间。 max_fails可以和
fail_timeout一起使用， 进行对后端服务器的健康状态检查；  
**backup：** 当 **所有后端服务器都宕机**时， 可以指定代理服务器自身作为备份， 对外提供维
护提示页面；  
**down：**永久不可用。


	upstream dynamic {
		server backend1.example.com weight=5;
		server backend2.example.com:8080 max_fails=3; fail_timeout=5s ;
		server 192.0.2.1 max_fails=3;
		server backup1.example.com:8080 backup;
		server backup2.example.com:8080 backup;
	} 

(专业健康检测模块 nginx_upstream_check_module-master)

upstream块里可以用多个server选项配置多个后端服务器， 同时还可配置对后端服务器的健康状态检查， 可以在server后面加上max_fails（proxy_next_upstream指定检查策略， 默认为返回超时为失败） 和fail_timeout参数实现； 也可以用health_check选项来实现health_check可以指定的参数较多， 不过需要定义在location上下文中。  
另外， 可以指定代理服务器自身作为备份server， 当所有后端服务器都宕机时， 对外提供维护提示页面。  
还可以指定**负载均衡**策略： 主要有round_robin（加权轮询， 默认） 、hash、 ip_hash、 least_conn（最少连接） 和least_time（最少响应时间， 商业版本） ， 策略定义在upstream上下文即可;


### Nginx实现缓存功能 ###

#### 为什么需要缓存？ ####

缓存的最根本的目的是为了提高网站性能,减轻频繁访问数据， 而给数据库带来的压力。 合理的缓存， 还会减轻程序运算时， 对CPU带来的压力。 在计算机现代结构中， 操作内存中的数据比操作存放在硬盘上的数据是要快N个数量级的， 操作简单的文本结构的数据， 比操作数据库中的数据快N个数量级 。

例如:每次用户访问网站,都必须从数据库读取网站的标题,每读一次需要15毫秒的时间,如果有100个用户(先不考虑同一时间访问),每小时访问10次,那么就需要读取数据库1000次,需要时间15000毫秒.如果把页面直接变成页面缓存， 则每次访问就不需要去数据库读取， 大大提升了网站性能。



缓存数据分为两部分（索引， 数据） ：  
1、 存储数据的索引， 存放在内存中;  
2、 存储缓存数据， 存放在磁盘空间中；  

Nginx实现缓存是通过代理缓存pxory_cache， 这也是ngx_http_proxy_module模块提供的功能， 这里配置选项较多， 常用的选项有： proxy_cache_path、 proxy_cache和proxy_cache_valid。61

1、**proxy_cache_path**  
proxy_cache_path定义一个完整的缓存空间， 指定缓存数据的磁盘路径、 索引存放的内存空间以及一些其他参数， 如缓存删除策略。
**注意**， 该选项只能定义在http块上下文中。
如， 

	proxy_cache_path /data/cache levels=1:2 keys_zone=web:10m max_size=1G inactive=10;
缓存数据存储在/data/cache目录中；

 - levels： 配置在该目录下再分两层目录， 一层1个随机字符作为名称， 二层2个随机字符作为名称，levels最多三层， 每层最多两个字符， 这是为了加快访问文件的速度； 最后使用代理url的哈希值作为关键字与文件名， 一个缓存数据如下： /data/nginx/cache/c/29/b7f54b2df7773722d382f4809d65029c； 
 - keys_zone： 用来为这个缓存区起名， 并设置大小。 指定名称为web， 这个名称后面proxy_cache需要
引用； 而10m就是内存空间的大小；
 - max_size： 指定最大缓存数据磁盘空间的大小；
 - inactive： 在inactive指定的时间内， 未被访问的缓存数据将从缓存中删除。

2、 **proxy_cache**  
proxy_cache用来引用上面proxy_cache_path定义的缓存空间， 现
时打开缓存功能， 如下：

	proxy_cache web； #引用上面定义上的缓存空间， 同一缓存空间可以在几个地方使用

3、 **proxy_cache_valid**
proxy_cache_valid设置不同响应代码的缓存时间， 如：

	proxy_cache_valid 200 302 10m;
	proxy_cache_valid 404 1m;63

#### 配置Nginx缓存实例： ####

先配置proxy_cache_path， 再配置proxy_cache引用、 打开缓存空间， 着配置两个proxy_cache_valid； 为方便调试测试， 我们可以通过add_header给请求响应增加一个头部信息， 表示从服务器上返回的cache
状态怎么样（有没有命中） ， 主要配置如下：

	#定义一个完整的缓存空间; 缓存数据存储在/data/cache目录中/配置在该目录下再分两层目录， 名称为web(proxy_cache引用),10m内存空间大小/最大缓存数据磁盘空间的大小/10分钟未被访问的缓存数据将从缓存中删除
	proxy_cache_path /data/cache levels=1:2 keys_zone=web:10m max_size=1G inactive=10m;64

>

	server {
		listen 80;
		server_name localhost;
		#charset koi8-r;
		#access_log logs/host.access.log main;
		add_header Magedu-Cache "$upstream_cache_status form $server_addr"; 
		#给请求响应增加一个头部信息， 表示从服务器上返回的cache状态怎么样（有没有命中）
		location / {
			proxy_pass http://webserver; #引用上面定义的upstream负载均衡组
			proxy_cache web; #引用上面定义上的缓存空间， 同一缓存空间可以在几个地方使用
			proxy_cache_valid 200 302 10m;
			proxy_cache_valid 404 1m; #对代码200和302的响应设置10分钟的缓存， 对代码404的响应设置为1分钟:
		}
	}
