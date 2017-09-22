---
layout: post
title: "centos6 挂载ntfs硬盘"
date: 2017-09-19 
description: ""
tag: linux 
---  

### 本身不支持NTFS
centos本身是企业版系统，认为NTFS文件系统不稳定，不利于长效管理，所以不对NTFS做支持。    
所以它在内核中默认禁用NTFS支持。

我恰巧有个优盘是NTFS，需要挂载，我就研究了一下挂载的方式。

### fuse-ntfs-3g
NTFS-3G 是一个开源的软件，可以实现 Linux、Free BSD、Mac OSX、NetBSD 和 Haiku 等操作系统中的 NTFS 读写支持。它可以安全且快速地读写 Windows 系统的 NTFS 分区，而不用担心数据丢失。

我们来安装fuse-ntfs-3g    
首先通过wget下载源码包     
`wget https://tuxera.com/opensource/ntfs-3g_ntfsprogs-2017.3.23.tgz`
我们可以看到是tgz的格式，那么就是tar归档gz压缩    
我们用     
`tar xvf ntfs-3g_ntfsprogs-2017.3.23.tgz`    
解压缩    
然后我们可以看到当前目录下有个名字叫做ntfs-3g_ntfsprogs-2017.3.23.tgz的文件夹     
我们进入然后     
`./configure`    
`make&make install`     
这就装好了。如果安装失败，可能是你的gcc编译器没有安装或者配置好	     
 
安装后之后，可以用mount -t ntfs-3g /dev/设备名  挂载目录      
来挂载我们的ntfs设备。     