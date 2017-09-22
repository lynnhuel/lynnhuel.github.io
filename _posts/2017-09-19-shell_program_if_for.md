---
layout: post
title: "SHELL脚本的流程控制"
date: 2017-09-19 
description: ""
tag: linux 
---  

 **shell脚本中的流程控制语句，和其他编程语言区别不大，条件判断语句有if，case。循环语句有for，while，until，因为bash环境的特点，还有snift和select等参数和菜单交互的语句。各种用法跟各种高级语言也是类似的。**

****

# 流程控制：条件判断（选择执行）     

if 判断
-

***

单分支

	if 判断条件;then
		条件为真的分支代码
	fi

双分支

	if 判断条件; then
		条件为真的分支代码
	else
		条件为假的分支代码
	fi

多分支

	if 判断条件1; then
		条件为真的分支代码
	elif 判断条件2; then
		条件为真的分支代码
	elif 判断条件3; then
		条件为真的分支代码
	else
		以上条件都为假的分支代码
	fi

判断条件：可以为命令，判断的依据是命令是否执行成功。即返回值为0时，表示判断成功。
例子：
	
	if ping -c1 -W2 station1 &> /dev/null;then
		echo 'Station1 is UP'
	elif grep "station1" ~/maintenance.txt &> /dev/null;then
		echo 'Station1 is undergoing maintenance‘
	else
		echo 'Station1 is unexpectedly DOWN!'
		exit 1
	fi

case 比较
-

***

用法：

	case 变量引用 in
	PAT1)
		分支1
		;;
	PAT2)
		分支2
		;;
	...
	*)
		默认分支
		;;
	esac

case支持glob风格的通配符：
>*: 任意长度任意字符  
?: 任意单个字符  
[]：指定范围内的任意单个字符  
a|b: a或b  

# 循环判断     

**循环中continue、break都可以使用，与其他语言一致**

for
-

****

### 方式一    

	for 变量名 in 列表;do
		循环体
	done

列表生成方式：

	(1) 直接给出列表  
	(2) 整数列表：  
		(a) {start..end}  
		(b) $(seq [start [step]] end)  
	(3) 返回列表的命令  
		$(COMMAND)  
	(4) 使用glob， 如： *.sh  
	(5) 变量引用；  
		$@, $*

### 方式二      

	for ((i=0;i<n;i++));do
		循环体
	done

while
-

***

### 方式一    

	while CONDITION; do
		循环体
	done

### 方式二（逐行读取文件）    

	while read line; do
		循环体
	done < /PATH/FROM/SOMEFILE

until
-

***

跟while相反
	
	until CONDITION; do
		循环体
	done

**条件为假时，执行循环体，真时，结束**

select 菜单创建
-

***

	select variable in list
	do
		循环体命令
	done

- 把列表list中的值，变成编号1-XX的菜单。
- 用户输入菜单列表中的某个数字，执行相应的命令
- select 是个无限循环，因此要记住用 break 命令退出循环，或用 exit 命令终止脚本。也可以按 ctrl+c退出循环
- select 经常和 case 联合使用
- 与 for 循环类似，可以省略 in list， 此时使用位置参量
 

循环控制语句
-----

*****

### continue：跳出本次循环，继续下一个循环       
### break：结束循环      
### snift：脚本的参数左移，即$1的值给$0，$2的值给$1，$0原值删除。     
