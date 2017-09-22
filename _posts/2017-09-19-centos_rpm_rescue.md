---
layout: post
title: "centos中删除rpm命令恢复"
date: 2017-09-19 
description: ""
tag: linux 
---  

### rpm是redhat系统上的包管理器
如果误删除了rpm命令，带来的影响就是除非编译源码包，否则就装不上任何程序。

如果你误删了rpm命令，请耐心看下去，我会告诉你怎么拯救它。

先请看我的另一篇博客
[救援模式介绍](../linux_rescue)

rpm命令出问题的话，差不多是这样子
![这里写图片描述](http://img.blog.csdn.net/20170824154302491?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvd2FuZ3FpYW55aWx5bm4=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
提示找不到命令文件。

我们进入救援模式开始拯救吧~

如果你是虚拟机，请挂载上你的光盘，如果是物理机，可以装上光驱，没光驱就去别的地方下载个rpm的rpm包吧。

进入救援模式后，一般默认不挂载光盘，我们用mount命令进行挂载  
`mount /dev/sr0 /media`  
将sr0设备挂载到/media目录上。  
根据个人的情况做改变

我的rpm包在光盘Packages目录中，我执行  
`rpm -ivh /media/Packages/rpm-4.8.0-55.e16.x86_64.rpm --root=/mnt/sysimage/`

--root=/mnt/sysimage/  
是指定安装的根目录。这些可以在上一篇博客中看到介绍。

这样我们就装好了rpm的包，因为改变了系统文件，所有开机后会进行安全检查，等一会儿之后，我们就可以开机了，这时候输入rpm执行，熟悉的操作就又回来了~

学会了么？