---
layout: post
title: "centos nginx企业级优化配置"
date: 2017/11/03
description: "nginx企业级优化配置"
tag: 负载均衡与高可用
--- 

1、 开启Epoll模型， 开启多请求处理机制以内核复制模式， 来提高处理性能

	use epoll； #event段
	multi_accept on; #worker按串行方式来处理连接， 一个连接只有一个worker被唤醒， 其他的处于休眠状态
	sendfile on； #http段 避免内核缓冲区数据和用户缓冲区数据之间的拷贝

2、 设置Nginx进程和CPU的亲和性， 减少进程上下文切换

	worker_processes 4； #main
	worker_cpu_affinity auto；

3、 设置最大连接数和最大文件数， 提升并发

	worker_connections 65535; #event段
	worker_rlimit_nofile 65535; #main段

4、 设置连接超时时间和网络参数优化， 提升连接复用率

	keepalive_timeout 60; #http段
	tcp_nodelay on; # 提高高频发送小数据报文的实时性
	tcp_nopush on; #允许将 HTTP 应答首部与数据内容在同一个报文中发出

5、 开启Nginx压缩功能， 节省带宽

	gzip on | off; #启用或禁用gzip压缩响应报文； #http段
	gzip_comp_level level; #压缩比， 1-9， 默认为1; #http段
	gzip_types text/plain application/x-javascript text/css application/xml text/javascript application/xhttpd-php image/jpeg image/gif image/png; #定义压缩类型

6、 基于Nginx的LNMP架构优化， fastcgi性能优化、 PHP性能参数优化

	fastcgi_cache_path /usr/local/nginx/fastcgi_cache levels=1:2 keys_zone=TEST:10m
	inactive=5m; #为FastCGI缓存指定一个文件路径、 目录结构等级、 关键字区域存储时间和非活动删除时间
	fastcgi_connect_timeout 300; #指定连接到后端FastCGI的超时时间。
	fastcgi_send_timeout 300; #指定向FastCGI传送请求的超时时间， 这个值是已经完成两次握手后向FastCGI传送请求的超时时间。
	fastcgi_read_timeout 300; #指定接收FastCGI应答的超时时间， 这个值是已经完成两次握手后接收FastCGI应答的超时时间。
	fastcgi_buffer_size 64k; #用于指定读取FastCGI应答第一部分需要用多大的缓冲区
	fastcgi_buffers 4 64k; #指定本地需要用多少和多大的缓冲区来缓冲FastCGI的应答请求
	fastcgi_busy_buffers_size 128k; #默认值是fastcgi_buffers的两倍。
	fastcgi_temp_file_write_size 128k; #表示在写入缓存文件时使用多大的数据块， 默认值是fastcgi_buffers的两倍。
	fastcgi_cache TEST; #表示开启FastCGI缓存并为其指定一个名称
	fastcgi_cache_valid 200 302 1h;
	fastcgi_cache_valid 301 1d;
	fastcgi_cache_valid any 1m; #用来指定应答代码的缓存时间， 实例中的值表示将200和302应答缓存一个小时， 将301应答缓存1天， 其他应答均缓存1分钟。

#### PHP-FPM企业级性能优化 ####

1、 设置脚本超时时间， 自动结束的php脚本， 以释放占用的资源

	request_terminate_timeout = 30

2、 调整php-fpm的进程工作模式， ， static（静态） 或者dynamic（动态）

	pm = dynamic|static
	pm.max_children： 静态方式下开启的php-fpm进程数量。
	pm.start_servers： 动态方式下的起始php-fpm进程数量。
	pm.min_spare_servers： 动态方式下的最小php-fpm进程数量。
	pm.max_spare_servers： 动态方式下的最大php-fpm进程数量。
	pm.max_requests = 500 php-fpm进程最多处理多少个请求后销毁
	#比如说512M的虚拟机， 建议pm.max_spare_servers设置为20（512*0.8/20） 。

3、 开启慢查询日志

	request_slowlog_timeout = 1 #慢查询日志时间
	slowlog = /var/log/php-fpm/www-slow.log #日志路径

4、 修改打开最大文件数

	ulimit -n 65535
	rlimit_files = 65535 #php-fpm配置