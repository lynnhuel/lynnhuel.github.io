---
layout: post
title: "centos中救援模式入门"
date: 2017-09-19 
description: ""
tag: linux 
---  

当我们一不小心把linux系统文件删除了，导致无法开机或者某些程序无法使用，该怎么办呢？
linux为我们准备了救援模式（Rescue）！
进入救援模式即可进入小型系统进行操作。进行恢复。

### 我们用VMware和Centos6.9进行演示。


虚拟光驱中我们加载centos6.9的安装镜像
![这里写图片描述](http://img.blog.csdn.net/20170812174845573?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvd2FuZ3FpYW55aWx5bm4=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

加载成功是这样的：

![这里写图片描述](http://img.blog.csdn.net/20170812174906965?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvd2FuZ3FpYW55aWx5bm4=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

现在启动Centos6.9

开机是Vmware主板的启动界面，这时候，快速在画面上点击鼠标左键，然后按下ESC键。进入启动项选择界面
![这里写图片描述](http://img.blog.csdn.net/20170812174408333?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvd2FuZ3FpYW55aWx5bm4=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

选择cd驱动器启动。
![这里写图片描述](http://img.blog.csdn.net/20170812175006598?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvd2FuZ3FpYW55aWx5bm4=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

这是我们centos6.9的安装界面。   
选择第三项，救援模式。    
回车。   

![这里写图片描述](http://img.blog.csdn.net/20170812175648597?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvd2FuZ3FpYW55aWx5bm4=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

选择语言，我们默认就好，回车：

![这里写图片描述](http://img.blog.csdn.net/20170812175731872?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvd2FuZ3FpYW55aWx5bm4=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

选择键盘，默认，回车：

![这里写图片描述](http://img.blog.csdn.net/20170812175759779?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvd2FuZ3FpYW55aWx5bm4=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

选择是否开启网络接口，根据自己的需要，开启的话，需要稍微配置一下，我们选no：

![这里写图片描述](http://img.blog.csdn.net/20170812175907655?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvd2FuZ3FpYW55aWx5bm4=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

它提示我们，原来的系统磁盘已经被挂载到了光盘系统的/mnt/sysimage下。    
这里要着重讲一下。系统的根目录现在是/mnt/sysimage/    
系统的/boot目录，现在是/mnt/sysimage/boot     

如果确定要进入，选择continue，进入只读模式，选择read-only    
也可以选择跳过。    
我们选择continue

![这里写图片描述](http://img.blog.csdn.net/20170812200013524?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvd2FuZ3FpYW55aWx5bm4=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

提示我们，系统已经挂载到了/mnt/sysimage目录下，如果想要在原系统中的路径模式，可以输入`chroot /mnt/sysimage `命令     
如果输入这个命令，那么，它会开启一个子bash环境，系统磁盘根目录就会变成原来的。在子bash中不能访问光盘系统 的文件。

我们按回车：
![这里写图片描述](http://img.blog.csdn.net/20170812200756990?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvd2FuZ3FpYW55aWx5bm4=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

好了，第一个是立即获取一个shell环境，手动修复系统。    
第二个是运行诊断工具    
第三个重启系统。   
我们选择手动shell环境  


![这里写图片描述](http://img.blog.csdn.net/20170812200926392?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvd2FuZ3FpYW55aWx5bm4=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

观察最下面，已经出现了shell命令行，我们可以开始修复系统了。   
这个命令行下，cd命令默认回到/tmp下    

如果没有进入chroot命令，那么进行操作的时候，一定要注意路径问题，磁盘被挂载在/mnt/sysimage下。   

 
好了，这次的分享就到这里，有什么疑问，小伙伴们可以留言给我哦   
 
