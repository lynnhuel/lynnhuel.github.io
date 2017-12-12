---
layout: post
title: "ubuntu中Vmware下mac os的安装小记"
date: 2017/11/18
description: "ubuntu中Vmware下mac os的安装小记"
tag: ubuntu
---

上一篇博客中，我安装好了我的vmware。用的也很开心。  
我觉得linux下的vmware用起来很流畅，然后又动了装macos的心思，以前都是在win下装的，现在换了环境，不知道怎么样。我要试一试。

### 装备/环境/材料
环境ubuntu+vmware14
工具vmware_unlocker低版本
系统盘：当年淘宝买的mac原版系统安装优盘

背景知识：vmware原生不支持安装macos，需要破解

百度随便下载了个unlocker，因为是python写的，所以差不多也都能用。
然而，就是这么一个随便下载的，让我遇到了个坑。

unlocker的样子：
![](/images/vmware/目录.png)

linux下破解，需要使用lnx-install.sh这个脚本
 
 添加执行权限：`sudo chmod +x lnx-install.sh`  
 运行：`sudo ./lnx-install.sh`   
 
 结果提示我/usr/lib/vmware/lib/libvmwarebase.so.0/libvmwarebase.so.0不存在
 
 我打开了lnx-install.sh
 
 ![](/images/vmware/lnx文件内容.png)
 
 发现有个判断，如果有就cp一下。也没多想，我就直接把
/usr/lib/vmware/lib/libvmwarebase.so/libvmwarebase.so复制出来一个/usr/lib/vmware/lib/libvmwarebase.so.0/libvmwarebase.so.0

然后运行脚本，完美，成功结束。

然后打开虚拟机，创建，并没有看到apple的选项。

后来又试了几次，还是不行，重启也不行。

非常苦恼，我就打起了14patch.py的主意

果然让我找到了这一句
![](/images/vmware/14文件内容.png)

这个破解脚本应该是vmware12时候的，最多支持到了12,12应该是使用了新的特性，没有so.0那个文件夹。  
于是，把判断删掉，直接定义成.so  

完事！完美看到apple osx！

![](/images/vmware/apple.png)

### u盘启动安装的问题

新建虚拟机之后，注意看有没有一个usb控制器，如果没有就添加一个，选usb3.0或者usb2.0,然后启动即可。

