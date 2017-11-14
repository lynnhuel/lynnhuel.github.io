---
layout: post
title: "keepalived高级应用配置"
date: 2017/11/09
description: "keepalived 高可用集群 实战配置 高级应用"
tag: 负载均衡与高可用
--- 

### 实现keeaplived故障通知机制 ###

在企业中， 高可用服务， 是保证整个系统稳定性的重要前提， 确保高可用服务能正常工作和运转， 也是非常重要的工作。除了服务上线前的充分测试之外， 也需要确保对高可用服务的监控机制，keepalived自身具备监控和通知机制， 可在发生主从切换、 故障转移时， 通过自定义命令或者脚本， 实现通知功能， 从而让管理员在第一时间得知系统运行状态， 确保整个服务的稳定性和可
用性。

可在配置文件中， 在instance配置中， 通过keepalived通知功能notify， 可
实现定制化脚本功能， 如下所示：

	notify_backup "/etc/keepalived/notify.sh backup"
	notify_master "/etc/keepalived/notify.sh master"
	notify_fault "/etc/keepalived/notify.sh fault"

实现keeaplived故障通知机制

	#!/bin/bash
	# Author: lynn
	contact='root@localhost'
	notify() {
		mailsubject="$(hostname) to be $1: vip floating"
		mailbody="$(date +'%F %H:%M:%S'): vrrp transition, $(hostname) changed to be $1"
		echo $mailbody | mail -s "$mailsubject" $contact
	}
	case $1 in
	master)
		notify master
		exit 0
		;;
	backup)
		notify backup
		exit 0
		;;
	fault)
		notify fault
		exit 0
		;;
	*)
		echo "Usage: $(basename $0) {master|backup|fault}"
		exit 1
		;;
	esac


在配置文件中， 可实现以下配置， 定义一个脚本， 并在对应的实例instance中调用， 之后就可通过手动建立down文件， 使得keepalived实例减少权重，实现主从切换， 常用于在线修改keepalived配置文件时使用

	vrrp_script chk_down {
		script “[[ -f /etc/keepalived/down ]] && exit 1 || exit 0 ”
		interval 2 # check every 2 seconds
		weight -5
	} 
	track_script {
		chk_down
	}


在配置文件中， 可实现以下配置， 定义一个脚本， 并在对应的实例中调用，也可以用于检测服务是否有异常， 异常的话进行切换。

	vrrp_script chk_sshd {
		script "killall -0 sshd" # cheaper than pidof
		interval 2 # check every 2 seconds
		weight -4 # default prio: -4 if KO
		fall 2 # require 2 failures for KO
		rise 2 # require 2 successes for OK
	} 
	track_script {
		chk_sshd
	}


### 实现keepalived主主架构 ###

	node1:
	vrrp_instance VI_1 {
		state MASTER
		interface eno16777736
		virtual_router_id 101
		priority 100
		advert_int 1
		authentication {
			auth_type PASS
			auth_pass ZPNnTQ6F
		}
		virtual_ipaddress {
			172.16.100.9/16
		}
	}

	vrrp_instance VI_2 {
		state BACKUP
		interface eno16777736
		virtual_router_id 102
		priority 99
		advert_int 1
		authentication {
			auth_type PASS
			auth_pass IWyijM5Q
		}
	virtual_ipaddress {
			172.16.100.10/16
		}

>

	node2:
	vrrp_instance VI_1 {
		state BACKUP
		interface eno16777736
		virtual_router_id 101
		priority 99
		advert_int 1
		authentication {
			auth_type PASS
			auth_pass ZPNnTQ6F
		}
		virtual_ipaddress {
			172.16.100.9/16
		}
	}

	vrrp_instance VI_2 {
		state MASTER
		interface eno16777736
		virtual_router_id 102
		priority 100
		advert_int 1
		authentication {
			auth_type PASS
			auth_pass IWyijM5Q
		}
		virtual_ipaddress {
			172.16.100.10/16
		}
	}