---
layout: post
title: "cacti 监控mongodb模板安装（登录数据库方式监控）"
date: 2018/8/3
description: "cacti 监控mongodb模板安装（登录数据库方式监控）"
tag: 监控
---

# cacti 监控mongodb模板安装（登录数据库方式监控）

### 老版本教程
目前通用的mongodb监控模板，老版教程如下

[cacti监控mongodb实战][1]


上文中指出的模板为早期的项目，现在有了新的项目，测试老版本指定post2的时候，php出错，不清楚是不是版本问题。

***本文只讨论mongo远程登录数据库的方法，ssh方法没有问题，按照上文指导即可。***
### 本次讨论新环境新需求
现在讲一下我所处的环境和所用的方法，希望对你有所帮助。
测试环境mongodb服务器有6台，每台端口不同，无密码登录验证。

老版本的ss_get_by_ssh.php中mongodb监控是这么写的：

    function mongodb_cmdline ( $options ) {
        return “echo \”db._adminCommand({serverStatus:1, repl:2})\” | mongo”;
    }

显然，没有任何命令的修饰，显得很鸡肋，在老版本中，用端口登录数据库的方式并不友好。网上的教程均为老版本使用方法，均采用修改的方式 加入post2参数指定数据库登录端口。新版本对这些进行了修改。新版本定义为：

    function mongodb_cmdline ( $options ) {
       global $use_ssh;
       $port = isset($options['port2']) ? " --port $options[port2]" : '';
       $srv = '';
       if ( isset($options['server']) ) {
          $srv = " --host $options[server]";
       }
       elseif ( ! $use_ssh ) {
          $srv = " --host $options[host]";
       }
       return "echo \"db._adminCommand({serverStatus:1, repl:2})\" | mongo$srv$port";
    }
    
新版本对非ssh登录做了很好的支持，几乎可以不用修改即可使用。注意把脚本中原有的use_ssh常量改成FALSE，在脚本开头的位置。

需要在监控机本地安装mongodb客户端，yum install mongodb

安装监控需要两个文件，一个是模板xml文件，在web页面导入cacti，另一个为ss_get_by_ssh.php[下载地址][2]脚本文件。

因为测试环境的cacti版本问题，新版的xml文件[（新版下载地址）][3]**无法导入**，所以我用了旧的xml文件[旧版文件地址（better-cacti-templates-1.1.8.tar.gz）][4]，需要做一定的修改。

旧版php脚本中对监控项的定义为dc.dd...等
新版如下（450行左右）：
		  
          'MONGODB_connected_clients'         =>  'mk',
          'MONGODB_used_resident_memory'      =>  'ml',
          'MONGODB_used_mapped_memory'        =>  'mm',
          'MONGODB_used_virtual_memory'       =>  'mn',
          'MONGODB_index_accesses'            =>  'mo',
          'MONGODB_index_hits'                =>  'mp',
          'MONGODB_index_misses'              =>  'mq',
          'MONGODB_index_resets'              =>  'mr',
          'MONGODB_back_flushes'              =>  'ms',
          'MONGODB_back_total_ms'             =>  'mt',
          'MONGODB_back_average_ms'           =>  'mu',
          'MONGODB_back_last_ms'              =>  'mv',
          'MONGODB_op_inserts'                =>  'mw',
          'MONGODB_op_queries'                =>  'mx',
          'MONGODB_op_updates'                =>  'my',
          'MONGODB_op_deletes'                =>  'mz',
          'MONGODB_op_getmores'               =>  'ng',
          'MONGODB_op_commands'               =>  'nh',
          'MONGODB_slave_lag'                 =>  'ni',

这些值在xml文件中也有绑定，可以修改php中的设定，也可以导入xml后，修改web页面  Data Input Methods  中模板的scripts。  
![这里写图片描述](https://img-blog.csdn.net/20180803101326872?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dhbmdxaWFueWlseW5u/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)  
这里定义了模板调用php脚本的方法，items只要跟php脚本设定对应即可。
### 不同服务器指定不同端口登录数据库
如果要指定不同端口，上图scripts要修改加入 `--port2 <port2> `
然后在web页面Data Templates中勾选port2参数。这样的话，添加图形时候，会让填写port2参数。  
![这里写图片描述](https://img-blog.csdn.net/20180803101742884?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dhbmdxaWFueWlseW5u/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)


  [1]: https://blog.csdn.net/mchdba/article/details/39805039
  [2]: https://www.percona.com/downloads/percona-monitoring-plugins/percona-monitoring-plugins-1.1.8/source/tarball/percona-monitoring-plugins-1.1.8.tar.gz
  [3]: https://docs.cacti.net/_media/template:package:percona_mongodb_server_ht.xml.gz
  [4]: http://file.qiansw.com/usr/uploads/downloads/2014/05/better-cacti-templates-1.1.8.tar.gz