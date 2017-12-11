---
layout: post
title: "memcached 简介"
date: 2017/11/15
description: "memcached 简介应用与实战"
tag: 缓存技术
---
# memcached是什么 #

Memcached是一个自由开源的，高性能，分布式内存对象缓存系统。它是一种基于内存的key-value存储，用来存储小块的任意数据（字符串、对象）。这些数据可以是数据库调用、API调用或者是页面渲染的结果。Memcached简洁而强大。它的简洁设计便于快速开发，减轻开发难度，解决了大数据量缓存的很多问题。它的API兼容大部分流行的开发语言。本质上，它是一个简洁的key-value存储系统。一般的使用目的是，**通过缓存数据库查询结果，减少数据库访问次数，以提高动态Web应用的速度、提高可扩
展性。**


### memcached配置 ###

一、 安装memcached  
`yum intall memcached`  
二、 配置文件修改  

	/etc/sysconfig/memcached #路径
	PORT="11211" #端口
	USER="memcached" #启动用户
	MAXCONN="1024" #最大连接
	CACHESIZE="64" #缓存空间大小

|命令|用法
|-|-|
|-d |指定memcached进程作为一个守护进程启动
|-m <num> |指定分配给memcached使用的内存， 单位是MB， 默认为64；
|-u <username> |运行memcached的用户
|-l <ip_addr> |监听的服务器IP地址， 如果有多个地址的话， 使用逗号分隔， 格式可以为“IP地址:端口号”， 例如： -l 指定192.168.0.184:19830,192.168.0.195:13542； 端口号也可以通过-p选项指定
|-p <num> |Listen on TCP port <num>, the default is port 11211.
|-c <num> |设置最大运行的并发连接数， 默认是1024
|-R <num> |为避免客户端饿死（starvation） ， 对连续达到的客户端请求数设置一个限额， 如果超过该设置， 会选择另一个连接来处理请求， 默认为20
|-k |设置锁定所有分页的内存， 对于大缓存应用场景， 谨慎使用该选项
|-P |保存memcached进程的pid文件
|-s <file> |指定Memcached用于监听的UNIX socket文件
|-a <perms> |设置-s选项指定的UNIX socket文件的权限
|-U <num> |Listen on UDP port <num>, the default is port 11211, 0 is off.

### memcached状态查看 ###

	STAT pid 22362 //memcache服务器的进程ID
	STAT uptime 1469315 //服务器已经运行的秒数
	STAT time 1339671194 //服务器当前的unix时间戳
	STAT version 1.4.9 //memcache版本
	STAT libevent 1.4.9-stable //libevent版本
	STAT pointer_size 64 //当前操作系统的指针大小（32位系统一般是32bit,64就是64位操作系统）
	STAT rusage_user 3695.485200 //进程的累计用户时间
	STAT rusage_system 14751.273465 //进程的累计系统时间
	STAT curr_connections 69 //服务器当前存储的items数量
	STAT total_connections 855430 //从服务器启动以后存储的items总数量
	STAT connection_structures 74 //服务器分配的连接构造数
	STAT reserved_fds 20 //
	STAT cmd_get 328806688 //get命令（获取） 总请求次数
	STAT cmd_set 75441133 //set命令（保存） 总请求次数
	STAT get_hits 253547177 //总命中次数
	STAT get_misses 75259511 //总未命中次数

### memcached使用 ###

memcached set 命令的基本语法如下所示：

	set key flags exptime bytes [noreply] 
	value

eg

	set name 1 1800 8
	xiaoming

**key** 是通过被存储在Memcached的数据并从memcached获取键(key)的名称。  
**flags** 是32位无符号整数， 该项目被检索时用的数据(由用户提供)， 并沿数据返回服务器存
储。  
**exptime** 以秒过期时间， 0表示没有延迟， 如果exptime大于30天， Memcached将使用它
作为UNIX时间戳过期。  
**bytes** 是在数据块中， 需要被存储的字节数。 基本上， 这是一个需要存储在memcached的
数据的长度。  
**noreply **(可选) 参数告知服务器不发送回复  
**value** 是一个需要存储的数据。 数据需要与上述选项执行命令后， 将通过新的一行。

### memcached测试脚本 ###

	<?php
		$mem = new Memcache;
		$mem->connect("172.17.254.148", 11211); #连接Memcached
		$version = $mem->getVersion();
		echo "Server's version: ".$version."<br/>\n"; #输出Memcached版本信息
		$mem->set('magedu', 'Hello World', 0, 600); #向Memcached存储数据'Hello World',时间为600s
		echo "Store data in the cache (data will expire in 600 seconds)<br/>\n";
		$get_result = $mem->get('magedu'); #获取testkey的值
		echo "$get_result is from memcached server.";
	?>