---
layout: post
title: "centos中压缩解压工具"
date: 2017-09-19 
description: ""
tag: linux 
---  

### 压缩工具介绍
compress

```
-Z
	-d #解压缩   
		uncompress    
		zcat X.Z > X     
	-c #将结果打印到屏幕上，配合重定向，不会覆盖原文件，但权限会变。           
	-f #默认不对硬链接数为2及以上的文件压缩，加上f，强制压缩指定文件，而其他同inode的文件硬链接数减1.    
	-v #显示详细过程。    
```


gzip
	

```
.gz
	-d #解压缩
		gunzip
		zcat X.gz > X
	-c #将结果打印到屏幕上，配合重定向，不会覆盖原文件，但权限会变。
	-f #默认不对硬链接数为2及以上的文件压缩，加上f，强制压缩指定文件，而其他同inode的文件硬链接数减1.
	-v #显示详细过程。
	-# 	数字越大，压缩比越高，速度越慢，文件越小。
		-1 等于 --fast
		-2，3，4，5，6(default)，7，8
		-9 等于 --best
```


bzip2
	

```
.bz2
	-d #解压缩
		bunzip
		bzcat X.bz2 > X
	-k #保留原文件
	-c #将结果打印到屏幕上，配合重定向，不会覆盖原文件，但权限会变。
	-f #默认不对硬链接数为2及以上的文件压缩，加上f，强制压缩指定文件，而其他同inode的文件硬链接数减1.
	-v #显示详细过程。
	-# #数字越大，压缩比越高，速度越慢，文件越小。
		-1 #等于 --fast
		-2，3，4，5，6，7，8
		-9 #等于 --best (default)
```

xz
	

```
.xz
	-d #解压缩
		xzcat 
	-k #保留原文件
	-f #默认不对硬链接数为2及以上的文件压缩，加上f，强制压缩指定文件，而其他同inode的文件硬链接数减1.
	-v #显示详细过程。
	-# 	数字越大，压缩比越高，速度越慢，文件越小。
		-0 等于 --fast
		-1 -2，3，4，5，6(default)，7，8
		-9 等于 --best 
```


zip
	

```
.zip
	unzip 解压缩
	|zip 将生成的文件名 - #可以将管道前的输出结果转为文件并压缩。通过此方式压缩的文件只能使用“unzip -p 压缩包 > 新文件 ”来解压缩
	unzip -p #预览解压缩后的内容到屏幕，可以配置重定向将结果保存到指定文件，权限会发生变化。
	zip -r 新文件名.zip 被压缩打包的文件（可以为多个文件）
```

rar

```
rar解压需要安装rar工具
	yum install rar #安装rar
	rar 要压缩的文件名
	unrar 要解压的文件名
```


### 归档工具
tar 
	

```
	-cf 创建包名字  原文件（可以指定多个）
	-tf 包名字   #显示包中的文件名
		-tvf    #详细显示包中的文件名
	-rf 包名字 新文件名（可以指定多个）
	--delete -f 包名字 被删除的文件名(可以指定多个)
	-xf 包名字           #解出所有的文件到当前目录
		-xf 包名字 文件名 #解所指定的文件到当前目录
	-C 解包到指定目录
	-v 显示过程
	-Jcf 创建包的名字(.tar.xz) 原文件（可以指定多个）  #打包并用xz压缩
	-jcf 创建包的名字(.tar.bz2) 原文件（可以指定多个） #打包并用bzip压缩
	-zcf 创建包的名字(.tar.gz) 原文件（可以指定多个）  #打包并用gzip压缩
	-T 指定个列表，包含需要被打包的文件，以换行符为间隔
	-X 指定个排除列表，以换行符为间隔
```

```
split –b Size –d tar-file-name prefix-name  #将tar包分隔为多个文件
cat 被分隔出的多个文件名 > 单个文件名
	
```

cpio

```
	ls * |cpio -o > 文件名.cpio    #打包。
	cpio -id < 文件名.cpio #解开被cpio打包的文件
	gzip 文件名.cpio       #生成文件名为文件名.cpio.gz 
	/boot/initramfs-xxxx.img 
		Centos6: cpio.gz文件。zcat initramfs-xxxx.img |cpio -id
		Centos7: cpio文件 cpio -id < initramfs-xxxx.img
	-tv < 文件名.cpio      #预览cpio打包的文件。
```


