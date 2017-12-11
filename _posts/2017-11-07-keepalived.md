---
layout: post
title: "keepalived 高可用集群"
date: 2017/11/07
description: "keepalived 高可用集群"
tag: 负载均衡与高可用
--- 

### Keepalived ###

Keepalived的作用是检测服务器的状态，如果有一台web服务器宕机，或工作出现故障，Keepalived将检测到，并将有故障的服务器从系统中剔除，同时使用其他服务器代替该服务器的工作，当服务器工作正常后Keepalived自动将服务器加入到服务器群中，这些工作全部自动完成，不需要人工干涉，需要人工做的只是修复故障的服务器。


#### 特点 ####

**配置文件简单：**配置文件比较简单，可通过简单配置实现高可用功能稳定性强：keepalived是一个类似于layer3, 4 & 7交换机制的软件，具备我们平时说的第3层、第4层和第7层交换机的功能，常用于前端负载均衡器的高可用服务，当主服务器出现故障时，可快速进行切换，监测机制灵活，成功率高。  
**成本低廉：**开源软件，可直接下载配置使用，没有额外费用。  
**应用范围广：**因为keepalived可应用在多个层面，所以它几乎可以对所有应用做高可用，包括LVS、数据库、http服务、nginx负载均衡等等  
**支持多种类型：**支持主从模式、主主模式高可用，可根据业务场景灵活选择。

![keepalived工作流程图](/images/keepalived/工作流程.png)

如上图，keepalived主要是模块是VRRP Stack和Cheackers，实现HA集群中失败切换（Failover)功能。Keepalived通过VRRP功能能再结合LVS负载均衡软件即可部署一个高性能的负载均衡集群系统。，Cheackers主要实现可实现对服务器运行状态检测和故障隔离。，其中ipvs和realserver健康状态检查通过配置文件配置就可以实现，而其他服务高可用则需要通过自己编写脚本，然后配置keepalived调用来实现。

Keepalived运行有**3个守护进程**。父进程主要负责读取配置文件初始化、监控2个子进程等；然后两个子进程，一个负责VRRP，另一个负责Cheackers健康检查。其中父进程监控模块为WacthDog，工作实现：每个子进程打开一个接受unix域套接字，父进程连接到那些unix域套接字并向子进程发送周期性（5s）hello包。上图是Keepalived的功能体系结构，大致分两层：用户空间（user space）和内核空间（kernel space）。内核空间：主要包括IPVS（IP虚拟服务器，用于实现网络服务的负载均衡）和NETLINK（提供高级路由及其他相关的网络功能）两个部份。

#### VRRP（Virtual Router Redundancy Protocol， 虚拟路由冗余协议） ####

可以认为是实现路由器高可用的协议， 简单的说， 当一个路由器故障时可以由另一个备份路由器继续提供相同的服务。  
VRRP根据优先级来确定虚拟路由器中每台路由器的角色（Master路由器或Backup路由器） 。 VRRP优先级的取值范围为0到255（数值越大表明优先级越高） ， 可配置的范围是1到254， 优先级0为系统保留给路由器放弃Master位置时候使用， 255则是系统保留给IP地址拥有者使用。 优先级越高， 则越有可能成为Master路由器。 当两台优先级相同的路由器同时竞争Master时， 比较接口IP地址大小。 接口地址大者当选为Master。

### 程序配置讲解 ###

#### keepalived： ####

程序包：Keepalived  

> /etc/keepalived/keepalived.conf #主配置文件  
> /etc/rc.d/init.d/keepalived #启动脚本  
> /etc/sysconfig/keepalived #启动时的添加参数  
> /usr/sbin/keepalived #启动程序  

### keepalived安装方式 

keepalived安装常用两种方式，yum安装和源码包安装

**yum 安装：**通常是在线安装，好处是安装方式简单，不易出错；常用的安装yum源为epel，centos6.4之后，keepalived已经被官方收录，可直接安装（推荐）

**源码包安装：**需要在官网把源码下载下来，在自己的系统里编译生成可执行文件，然后执行。

**Keepalived配置文件讲解**

	global_defs { #全局配置
		notification_email { #realserver故障时通知邮件的收件人地址，可以多个
		root@localhost
		}
		notification_email_from root_keepalived #发件人信息（可以随意伪装，因为邮件系统不会验证处理发件人信息）
		smtp_server 127.0.0.1 #发邮件的服务器（一定不可为外部地址）
		smtp_connect_timeout 30 #连接超时时间
		router_id KEEPALIVED #路由器的标识（可以随便改动）
	}


>

	vrrp_instance VI_1 { #配置虚拟路由器的实例，VI_1是自定义的实例名称
		state MASTER 
		#初始状态，MASTER|BACKUP，当state指定的instance的初始化状态，在两台服务器都启动以后，马上发生竞选，优先级高的成为MASTER，所以这里的MASTER并不是表示此台服务器一直是MASTER
		interface eth0 #通告选举所用端口
		virtual_router_id 51 #虚拟路由的ID号（一般不可大于255）
		priority 101 #优先级信息 #备节点必须更低
		advert_int 1 #VRRP通告间隔，秒
		authentication {
			auth_type PASS #认证机制
			auth_pass 5344 #密码（尽量使用随机）
		}
	nopreempt #非抢占模式


>

	virtual_server 192.168.18.240 80 { #设置一个virtual server:VIP:Vport
		delay_loop 3 # service polling的delay时间，即服务轮询的时间间隔
		lb_algo rr #LVS调度算法：rr|wrr|lc|wlc|lblc|sh|dh
		lb_kind DR #LVS集群模式：NAT|DR|TUN
		#persistence_timeout 120 #会话保持时间（持久连接，秒），即以用户在120秒内被分配到同一个后端realserver
		nat_mask 255.255.255.255
		protocol TCP #健康检查用的是TCP还是UDP36
	}

>

	real_server 192.168.18.251 80 { #后端真实节点主机的权重等设置，主要，后端有几台这里就要设置几个
	weight 1 #给每台的权重，rr无效
	#inhibit_on_failure #表示在节点失败后，把他权重设置成0，而不是IPVS中删除
	url {
		path /
		status_code 200
	} 
	TCP_CHECK {
		connect_timeout 2 #连接超时时间
		nb_get_retry 3 #重连次数
		delay_before_retry 1 #重连间隔
	}

