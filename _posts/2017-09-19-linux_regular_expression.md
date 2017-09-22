---
layout: post
title: "linux正则表达式的使用"
date: 2017-09-19 
description: ""
tag: linux 
---  

### 1、什么是正则表达式
英文为：regexp   
详细信息查看：`man 7 regex`   
支持的程序：grep,sed,awk,vim, less,nginx,varnish等  
类别：基本正则表达式： BRE    扩展正则表达式： ERE   
用处：用于匹配或检测想要的内容。  

### 2、字符规则

> ***字符匹配***:   
> . 匹配任意单个字符   
> [] 匹配指定范围内的任意单个字符   
> [^] 匹配指定范围外的任意单个字符   
> [:alnum:] 字母和数字  
> [:alpha:] 代表任何英文大小写字符，亦即 A-Z, a-z   
> [:lower:] 小写字母   
> [:upper:] 大写字母  
> [:blank:] 空白字符（空格和制表符）   
> [:space:] 水平和垂直的空白字符（比[:blank:]包含的范围广）  
> [:cntrl:] 不可打印的控制字符（退格、删除、警铃...）   
> [:digit:] 十进制数字              [:xdigit:]十六进制数字  
> [:graph:] 可打印的非空白字符 [:print:] 可打印字符 [:punct:] 标点符号  

>***匹配次数：用在要指定次数的字符后面，用于指定前面的字符要出现的次数***  
>`* `匹配前面的字符任意次，包括0次   (贪婪模式：尽可能长的匹配)  
>`.*` 任意长度的任意字符  
>`\? `匹配其前面的字符0或1次  
>`\+ `匹配其前面的字符至少1次  
>`\{n\} `匹配前面的字符n次  
>`\{m,n\} `匹配前面的字符至少m次，至多n次  
>`\{,n\} `匹配前面的字符至多n次  
>`\{n,\}` 匹配前面的字符至少n次  
 
>***位置锚定：定位出现的位置***  
>`^ `行首锚定，用于模式的最左侧  
>`$ `行尾锚定，用于模式的最右侧  
>`^PATTERN$ `用于模式匹配整行  
>`^$ `空行  
>`^[[:space:]]*$` 空白行  
>`\< `或 `\b` 词首锚定，用于单词模式的左侧  
>`\> `或 `\b `词尾锚定；用于单词模式的右侧  
>`\<PATTERN\> `匹配整个单词  
> 
> ***分组***： \(\) 将一个或多个字符捆绑在一起，当作一个整体进 行处理，如：` \(root\)\+`   
> 分组括号中的模式匹配到的内容会被正则表达式引擎记录于 内部的变量中，这些变量的命名方式为:` \1`, `\2`, ` \3`, ...   
>示例： `\(string1\+\(string2\)*\) \1`  
>        ： `string1\+\(string2\)* \2 ： string2 `  
> ***后向引用***：引用前面的分组括号中的模式所匹配字符， 而非模式本身   
> ***或者***：`\ |` 示例：` a \ |b`: a或b `C\ |cat`: C或cat `\(C\ |c\)at`:Cat或cat  



### 用法示例
1、显示/proc/meminfo文件中以大小s开头的行(要求：使用两种方法)   

	`grep ^S\ |^s /proc/meminfo`
	`grep -i ^s /proc/meninfo`

2、显示/etc/passwd文件中不以/bin/bash结尾的行

	`grep -v "/bin/bash$" /etc/passwd`

3、显示用户rpc默认的shell程序

	` grep "^rpc\>"   /etc/passwd  | cut -d : -f7 `
	` grep -w "^rpc"   /etc/passwd  | cut -d : -f7 `

4、找出/etc/passwd中的两位或三位数

	`cat /etc/passwd |grep -o "\<[0-9]\{2,3\}\>"`

5、显示CentOS7的/etc/grub2.cfg文件中，至少以一个空白字符开头的且后面存非空白字符的行

	`cat /etc/grub2.cfg  |grep "^[[:space:]]\+[^[:space:]]"`

6、找出“netstat -tan”命令的结果中以‘LISTEN’后跟任意多个空白字符结尾的行

	 `netstat -tan|grep "\<LISTEN\>[[:space:]]*$" `

7、显示CentOS7上所有系统用户的用户名和UID

	` cat /etc/passwd |cut -d: -f1,3 |grep "\<[[:digit:]]\{1,3\}\>"$`

8、添加用户bash、testbash、basher、sh、nologin(其shell为/sbin/nologin),找出/etc/passwd用户名同shell名的行

	` cat /etc/passwd | grep "\(^.*\)\>.*\/\1$"`

9、仅利用df和grep和sort，取出磁盘各分区利用率，并从大到小排序

	` df |grep ^/dev/sd |grep -o "\b[[:digit:]]\{1,3\}\b%"|sort -rn`

### 留给大家的linux学习者的练习

1、显示三个用户root、mage、wang的UID和默认shell

2、找出/etc/rc.d/init.d/functions文件中行首为某单词(包括下划线)后面跟一个小括号的行

3、使用egrep取出/etc/rc.d/init.d/functions中其基名

4、使用egrep取出上面路径的目录名

5、统计last命令中以root登录的每个主机IP地址登录次数

6、利用扩展正则表达式分别表示0-9、10-99、100-199、200-249、250-255

7、显示ifconfig命令结果中所有IPv4地址

8、将此字符串：welcome to magedu linux 中的每个字符去重并排序，重复次数多的排到前面

***答案***

 1. `cat /etc/passwd|grep -E "^(root|wang|mage)\>"|cut -d : -f3,7`
`cat /etc/passwd|grep -E -w "^(root|wang|mage)"|cut -d : -f3,7`
 2. `cat /etc/rc.d/init.d/functions |egrep  "^.*\(\)" `
 3. `echo /etc/rc.d/init.d/functions |egrep -o "[^/]+$"`
 4. `echo /etc/rc.d/init.d/functions |egrep -o "[/]*.+/"`
 5. `last|grep root|grep -v tty|tr -s ' '|cut -d' ' -f3|grep -v ^:|sort|uniq -c`
 6. `[0-9]
[1-0][0-9]
1[0-9][0-9]
2[0-4][0-9]
25[0-5]`
 7. `ifconfig |grep -o "[0-9]\+\.[0-9]\+\.[0-9]\+\.[0-9]\+"`
 8. `echo "welcome to magedu linux"|egrep -o "[[:alpha:]]"|sort|uniq -c|sort -r|tr -s ' '|cut -d' ' -f3|paste -s -d' '`
