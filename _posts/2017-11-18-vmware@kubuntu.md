---
layout: post
title: "ubuntu中Vmware安装与故障处理"
date: 2017/11/18
description: "ubuntu中Vmware安装与故障处理"
tag: ubuntu
---

本人使用的kubuntu17.10版本，系统自带内核是 4.13的。   

### 安装

在vmware官网下载了最新版  
VMware-Workstation-Full-14.0.0-6661328.x86_64.bundle
执行
`sudo ./VMware-Workstation-Full-14.0.0-6661328.x86_64.bundle`  
接下来就是正常的安装步骤，安装完之后，程序菜单就有了，然后我做了一个桌面快捷方式。

### 问题

#### problem1：  

![](http://images.cnitblog.com/blog/511414/201411/201411163594624.png)
打开之后提示无法编译，点击install之后，显示失败。

解决方法：   
`sudo apt-get install linux-headers-$(uname -r)`  
必要时重启

#### problem2：  

上一个问题解决之后，我们成功的打开了vmware workstation。  
成功创建虚拟机，打开虚拟机，我又遇到一个问题，提示我  
![](https://imgsa.baidu.com/exp/w=480/sign=cfbb2875fefaaf5184e380b7bc5594ed/314e251f95cad1c8a6267c747c3e6709c83d51c7.jpg)

大概是这么个样子，可是我8G内存，刚开机，不可能不够用。但是在 网上找不到解决方案，只在CSDN上找到一个
vmware在ubuntu17.10,内核4.13下内存不足的补丁程序。

下载链接我就不放了，因为并没有什么用。

然后我实在找不到方法，就直接换成了4.14的内核。然后就没有然后了

#### problem3：

网络无法启动。vmnet无法启动，虚拟机无法连接虚拟网卡。

查看vmware的命令，发现有vmware-netcfg和vmware-networks两个相关命令。  
后者有--start --stop命令。  
使用之后均失败。启动error

百度之后得到方案：

	sudo modprobe vmnet                     //加载vmnet模块
	sudo vmware-networks --start

这样就启动了网络了，写进启动，或者写成脚本，就可以了。	