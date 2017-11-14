---
layout: post
title: "keepalived 实战配置"
date: 2017/11/08
description: "keepalived 高可用集群 实战配置"
tag: 负载均衡与高可用
--- 

### 实现基于keepalived高可用集群： ###

**一、 环境准备：**   

	centos系统主从两台、 yum源、 防火墙关闭、 各节点时钟服务同步、 各节点之间可以通过主机名互相通信

**二、 安装步骤：**

	1、 iptables -F && setenforing 清空防火墙策略，关闭selinux
	2、 两台服务器都使用yum方式安装keepalived服务

**三、 修改配置文件:**
	
	1． 修改/etc/keepalived/keepalived.conf配置文件内容
	2、 对glob段进行定义， 添加管理员邮箱等
	3、 对vrrp_instance 进行配置， 配置一主一从， 定义一个基于虚拟IP的实例

**四、 检验高可用的效果**

	1、 配置完成后， 观察两侧IP的是情况， 看是否虚拟IP在主上配置成功
	2、 检查主从服务日志， 服务是否运行正常， 监测机制是否有效
	3、 停掉主服务上的keepalived服务， 看虚拟IP是否正常转移到从节点上
	4、 观察日志， 了解整个切换过程， 之后启动主节点服务， 看虚拟IP能否被主服务再接管


### 环境介绍 ###

|机器名称|IP配置|服务角色|备注|
|-|-|-|-|
|lvs-server|VIP:172.17.100.1<br>DIP:192.168.100.1|负载均衡器<br>主服务器|开启路由功能（VIP桥接、DIP仅主机模式）<br>配置keepalived|
|lvs-backup|VIP:172.17.100.1<br>DIP:192.168.100.2|负载均衡器<br>从服务器|开启路由功能（VIP桥接、DIP仅主机模式）<br>配置keepalived|
|rs1|RIP：192.168.100.3|后端nginx服务器|网关指向DIP|
|rs1|RIP：192.168.100.4|后端nginx服务器|网关指向DIP|


### 配置 ###

#### 主服务器配置 ####
1、修改keepalived主(lvs-server-master)配置文件实现virtual_instance

	vrrp_instance VI_1 {
		state MASTER
		interface eth3
		virtual_router_id 51
		priority 100
		advert_int 1
		authentication {
			auth_type PASS
			auth_pass magedu
		}
		virtual_ipaddress {
			172.17.100.1
		}
	}


2、修改keepalived从(lvs-server-backup)配置文件实现virtual_server

	virtual_server 172.17.100.1 80 {
		delay_loop 6
		ld_algo rr
		lb_kind DR
		protocol TCP
		real_server 192.168.100.3 80 {
			weight 1
			TCP_CHECK {
				connect_timeout 3
			}
		}
		real_server 192.168.100.4 80 {
			weight 1
			TCP_CHECK {
				connect_timeout 3
		}
	}

#### 从服务器配置 ####

1、修改keepalived从(lvs-server-backup)配置文件实现virtual_instance

	vrrp_instance VI_1 {
		state BACKUP
		interface eth3
		virtual_router_id 51
		priority 99
		advert_int 1
		authentication {
			auth_type PASS
			auth_pass grr02
		}
		virtual_ipaddress {
			172.17.100.1
		}
	}


2、修改keepalived从(lvs-server-backup)配置文件实现virtual_server

	virtual_server 	172.17.100.1 80 {
		delay_loop 6
		ld_algo rr
		lb_kind DR
		protocol TCP
		real_server 192.168.100.3 80 {
			weight 1
			TCP_CHECK {
				connect_timeout 3
			}
		}
		real_server 192.168.100.4 80 {
			weight 1
			TCP_CHECK {
				connect_timeout 3
			}
		}
	}
