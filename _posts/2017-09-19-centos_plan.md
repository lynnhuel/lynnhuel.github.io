---
layout: post
title: "centos中的计划任务"
date: 2017-09-19 
description: ""
tag: linux 
---  

# CENTOS中的计划任务
计划任务可以让计算机定期或者在未来某个时间执行一次设定的任务。  
比如每天凌晨一点钟自动重启，之类的。

centos中主要有两个计划任务工具，at和cron，还有一个batch是系统工具，空闲时间创建mandb之类信息的工具。  
我们主要来说at和cron

### at


at工具依靠后台服务工作   
服务文件在centos7之后做了改变  

>	centos6: /etc/rc.d/init.d/atd     
开启服务		`service atd start`   
centos7: /usr/lib/systemd/system/atd.service    
开启服务		`systemctl start atd.service`  

at工具的命令格式 `at [option] time`   
主要工作方式是交互式的。也支持重定向和文件导入操作

option主要有：

			-V: 显示版本
			-l:列出指定队列中等待运行的作业；相当于atq
			-d: 删除指定的作业；相当于atrm
			-c: 查看具体作业任务
			-f: /path/from/somefile：从指定的文件中读取任务
			-m:当任务被完成之后，将给用户发送邮件，即使没有标准输出 

time的格式：


			HH:MM [YYYY-mm-dd]   具体时间
			noon, midnight, teatime（4pm）   正午，凌晨，午茶时间
			tomorrow    明天
			now+#{minutes,hours,days, OR weeks}  之后#分钟、小时、天

1.创建完之后，会在/var/spool/at/  文件夹下生成任务文件。   
2.任务运行过程中产生的标准输出和错误会发送邮件给用户


黑白名单机制：

			/etc/at.allow  白名单
			/etc/at.deny  黑名单    
			白名单优先级高，存在白名单的情况下，不看黑名单。

### cronie


服务设置同at
>CentOS 7:  systemctl status crond   
CentOS 6:  service crond status

系统任务  /etc/crontab 文件

![](https://i.imgur.com/HbQJfSQ.png)
				
		文件格式：
				分钟 小时 天 月 星期 身份 命令
				* 每
				*/5每五
				1-10 1到10
				1,10 1和10
				1:2  步进2
				也可以：
					@reboot 重启时执行
				 	@yearly  相当于 0 0 1 1 *
					@annually  0 0 1 1 *
					@monthly 0 0 1 * *
					@weekly 0 0 * * 0
					@daily 0 0 * * *
					@hourly 0 * * * *
				日期与星期同时成立，为并集关系。
				命令中%符号有特殊意义，需要转义，加单引号不用转义。

				/etc/cron.d/ 配置文件
				/etc/cron.hourly/ 每小时脚本
				/etc/cron.daily/ 每天脚本
				/etc/cron.weekly/ 每周脚本
				/etc/cron.monthly/ 每月脚本

用户任务 

				crontab命令
				任务存储在/var/spool/cron/文件夹用户名的目录中
					crontab -e 编辑自己的计划任务
							-l -u 用户 列出
							-r -u 用户 删除


日志文件位置： /var/log/cron


### 总结

计划任务可以帮助我们更好地完成工作，定时备份数据，定时重启系统。一定要好好掌握它~