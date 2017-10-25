---
layout: post
title: "linux-ftp服务搭建与配置"
date: 2017/10/25  
description: "本文介绍FTP服务的搭建和配置"
tag: linux
--- 

### FTP协议简介 ###   

File Transfer Protocol 早期的三个应用级协议之一  
双通道协议：数据和命令连接  
数据传输格式：二进制（默认）和文本  

#### 两种模式 ####  

服务器角度：

|模式|描述|
|-|-|
|主动(PORT style)：|服务器主动连接<br>命令（控制）：客户端：随机port --- 服务器： tcp21<br>数据： 客户端：随机port+1 ---服务器： tcp20|
|被动(PASV style)：|客户端主动连接<br>命令（控制）：客户端：随机port --- 服务器： tcp21<br>数据：客户端：随机port+1 ---服务器：随机port|

#### 状态码 ####

	1XX：信息 		125：数据连接打开
	2XX：成功类状态 	200：命令OK 			230：登录成功
	3XX：补充类 		331：用户名OK
	4XX：客户端错误 	425：不能打开数据连接
	5XX：服务器错误 	530：不能登录


#### 用户认证： ####

匿名用户： ftp,anonymous,对应Linux用户ftp  
系统用户： Linux用户,用户/etc/passwd,密码/etc/shadow   
虚拟用户：特定服务的专用用户，独立的用户/密码文件  


### vsftpd程序配置 ###

配置文件:`/etc/vsftpd/vsftpd.conf`

|配置项|描述|
|-|:--|
|配置FTP服务以非独立服务方运行|listen=NO，默认为独立方式|
|命令端口|listen_port=21|
|主动模式端口|connect_from_port_20=YES   //主动模式端口为20<br>ftp_data_port=20   //指定主动模式的端口|
|被动模式端口范围|linux客户端默认使用被动模式<br>windows 客户端默认使用主动模式<br>pasv_min_port=6000  //0为随机分配<br>pasv_max_port=6010
|使用当地时间|use_localtime=YES //使用当地时间（默认为NO，使用GMT）|
|匿名用户|anonymous_enable=YES //支持匿名用户<br>no_anon_password=YES(默认NO) //匿名用户略过口令检查<br>anon_world_readable_only (默认YES)//只能下载全部读的文件<br>anon_upload_enable=YES //匿名上传，注意:文件系统权限<br>anon_mkdir_write_enable=YES<br>anon_other_write_enable=YES //可删除和修改上传的文件<br>anon_umask=077 //指定匿名上传umask<br>指定上传文件的默认的所有者和权限:<br>chown_uploads=YES(默认NO)<br>chown_username=wang<br>chown_upload_mode=0644
|Linux系统用户|<br>guest_enable=YES //所有系统用户都映射成guest用<br>guest_username=ftp //配合上面选项才生效，指定guest用户<br>local_enable=YES //是否允许linux用户登录<br>write_enable-YES //允许linux用户上传文件<br>local_umask=022 //指定系统用户上传文件的默认权限<br>local_root=/ftproot //非匿名用户登录所在目录
|禁锢系统用户于家目录|chroot_local_user=YES（默认NO，不禁锢）//禁锢所有系统用户<br>列表禁锢：<br>chroot_list_enable=YES<br>chroot_list_file=/etc/vsftpd/chroot_list<br>当chroot_local_user=YES时，则chroot_list中用户不禁锢<br>当chroot_local_user=NO时， 则chroot_list中用户禁锢|
|日志配置| wu-ftp日志：默认启用<br>xferlog_enable=YES （默认） 启用记录上传下载日志<br>xferlog_std_format=YES （默认）使用wu-ftp日志格式<br>xferlog_file=/var/log/xferlog （默认）可自动生成<br>vsftpd日志：默认不启用<br>dual_log_enable=YES 使用vsftpd日志格式，默认不启用<br>vsftpd_log_file=/var/log/vsftpd.log（默认）可自动生成|
|登陆提示|ftpd_banner=“welcome to mage ftp server"<br>banner_file=/etc/vsftpd/ftpbanner.txt //优先上面项生效|
|目录访问提示|dirmessage_enable=YES (默认)<br>message_file=.message(默认)信息存放在指定目录下.message|
|是否启用控制用户登录的列表文件|userlist_enable=YES 默认有此设置<br>userlist_deny=YES(默认值)黑名单,不提示口令， NO为白名单<br>userlist_file=/etc/vsftpd/users_list 此为默认值|
|连接限制|max_clients=0 最大并发连接数<br>max_per_ip=0 每个IP同时发起的最大连接数|
|vsftpd服务指定用户身份运行|nopriv_user=nobody|
|传输速率： 字节/秒|anon_max_rate=0 匿名用户的最大传输速率<br>local_max_rate=0 本地用户的最大传输速率|
|连接时间：|秒为单位<br>connect_timeout=60 主动模式数据连接超时时长<br>accept_timeout=60 被动模式数据连接超时时长<br>data_connection_timeout=300 数据连接无数据输超时时长<br>idle_session_timeout=60 无命令操作超时时长
|优先以文本方式传输|ascii_upload_enable=YES<br>ascii_download_enable=YES|

### 实现基于SSL的ftps ###

#### 查看是否支持SSL ####

	ldd `which vsftpd`    查看到libssl.so

####  创建自签名证书 ####

	cd /etc/pki/tls/certs/
	make vsftpd.pem
	openssl x509 -in vsftpd.pem -noout –text

#### 配置vsftpd服务支持SSL： #### 

/etc/vsftpd/vsftpd.conf

	ssl_enable=YES 启用SSL
	allow_anon_ssl=NO 匿名不支持SSL
	force_local_logins_ssl=YES 本地用户登录加密
	force_local_data_ssl=YES 本地用户数据传输加密
	rsa_cert_file=/etc/pki/tls/certs/vsftpd.pem

####  用filezilla等工具测试 ####

### 实现基于文件验证的vsftpd虚拟用户 ###

#### 一、创建用户数据库文件 ####

	 vim /etc/vsftpd/vusers.txt  
	
		wang
		wangpass
		mage
		magepass
	
	 cd /etc/vsftpd/  
	 db_load -T -t hash -f vusers.txt vusers.db  
	 chmod 600 vusers.db  

#### 二、创建用户和访问FTP目录 ####

	 useradd -d /var/ftproot -s /sbin/nologin vuser
	 chmod +rx /var/ftproot/

• centos7 还需要执行以下操作：

	 chmod -w /var/ftproot/
	 mkdir /var/ftproot/upload
	 setfacl -m u:vuser:rwx /var/ftproot/upload

#### 三、创建pam配置文件 ####
	
	 vim /etc/pam.d/vsftpd.db

		auth required pam_userdb.so db=/etc/vsftpd/vusers
		account required pam_userdb.so db=/etc/vsftpd/vusers

#### 四、指定pam配置文件 ####

	 vim /etc/vsftpd/vsftpd.conf
	
		guest_enable=YES
		guest_username=vuser
		pam_service_name=vsftpd.db

#### 五、 SELinux设置： ####

禁用SELinux 或者 `setsebool -P ftpd_full_access 1`

#### 六、虚拟用户建立独立的配置文件 ####
	
	mdkir /etc/vsftpd/vusers.d/ 创建配置文件存放的路径
	vim /etc/vsftpd/vsftpd.conf
	user_config_dir=/etc/vsftpd/vusers.d/
	cd /etc/vsftpd/vusers.d/ 进入此目录

允许wang用户可读写，其它用户只读
	
	vim wang 创建各用户自已的配置文件

		anon_upload_enable=YES
		anon_mkdir_write_enable=YES
		anon_other_write_enable=YES

	vim mage 创建各用户自已的配置文件

		local_root=/ftproot 登录目录改变至指定的目录

### 实现基于MYSQL验证的vsftpd虚拟用户 ###

### 一、在FTP服务器上安装vsftpd和pam_mysql包 ###

#### 二、在数据库服务器上创建虚拟用户账号 ####

• 1.建立存储虚拟用户数据库和连接的数据库用户

	mysql> CREATE DATABASE vsftpd;
	mysql> SHOW DATABASES;

  ftp服务和mysql不在同一主机：
	
	mysql> GRANT SELECT ON vsftpd.* TO vsftpd@'172.16.%.%' IDENTIFIED BY 'magedu';  
	//172.16.%.%为ftp主机网段，也可以直接指定ip
	
  ftp服务和mysql在同一主机：

	mysql> GRANT SELECT ON vsftpd.* TO vsftpd@localhost IDENTIFIED BY 'magedu';
	mysql> GRANT SELECT ON vsftpd.* TO vsftpd@'127.0.0.1' IDENTIFIED BY 'magedu';
	mysql> FLUSH PRIVILEGES;


2.准备相关表

	mysql> USE vsftpd;
	Mysql> SHOW TABLES;
	mysql> CREATE TABLE users (
		id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
		name CHAR(50) BINARY NOT NULL,
		password CHAR(48) BINARY NOT NULL
	);
	mysql>DESC users;

测试连接（ftp主机上测试是否可以联通）

	mysql -uvsftpd -h 172.16.200.200 -pmagedu
	mysql> SHOW DATABASES;

3.添加虚拟用户
根据需要添加所需要的用户，为了安全应该使用PASSWORD 函数加密其密码后存储

	mysql>DESC users;
	mysql> INSERT INTO users(name,password) values(‘wang',password('magedu'));
	mysql> INSERT INTO users(name,password) values(‘mage',password('magedu'));
	mysql> SELECT * FROM users;  //验证是否插入成功

#### 三、在FTP服务器上配置vsftpd服务 ####

 1.在FTP服务器上建立pam认证所需文件

	vi /etc/pam.d/vsftpd.mysql 添加如下两行

		auth required pam_mysql.so user=vsftpd
		passwd=magedu host=mysqlserver db=vsftpd table=users
		usercolumn=name passwdcolumn=password crypt=2

		account required pam_mysql.so user=vsftpd
		passwd=magedu host=mysqlserver db=vsftpd table=users
		usercolumn=name passwdcolumn=password crypt=2

**注意**：参考README文档，选择正确的加密方式  
crypt是加密方式， 0表示不加密， 1表示crypt(3)加密， 2表示使用mysql password()函数加密， 3表示md5加密， 4表示sha1加密

|字段|说明|
|-|-|
|auth |表示认证
|account |验证账号密码正常使用
|required |表示认证要通过
|pam_mysql.so模块|默认的是相对路径，是相对/lib64/security/路径而言，也可以写绝对路径；后面为给此模块传递的参数
|user=vsftpd|为登录mysql的用户
|passwd=magedu |登录mysql的的密码
|host=mysqlserver |mysql服务器的主机名或ip地址
|db=vsftpd |指定连接msyql的数据库名称
|table=users |指定连接数据库中的表名
|usercolumn=name |当做用户名的字段
|passwdcolumn=password |当做用户名字段的密码
|crypt=2 |密码的加密方式为mysql password()函数加密

2.建立相应用户和修改vsftpd配置文件，使其适应mysql认证
建立虚拟用户映射的系统用户及对应的目录
	
	useradd -s /sbin/nologin -d /var/ftproot vuser
	chmod 555 /var/ftproot   //centos7 需除去ftp根目录的写权限
	mkdir /var/ftproot/{upload,pub}
	setfacl –m u:vuser:rwx /var/ftproot/upload

确保/etc/vsftpd.conf中已经启用了以下选项
	
	anonymous_enable=YES

添加下面两项

	guest_enable=YES
	guest_username=vuser

修改下面一项，原系统用户无法登录
	
	pam_service_name=vsftpd.mysql

#### 四、启动vsftpd服务 ####
	
	service vsftpd start;systemctl start vsftpd
	chkconfig vsftpd on;systemctl enable vsftpd

查看端口开启情况

	netstat -tnlp |grep :21

#### 五、 Selinux相关设置：在FTP服务器上执行 ####
	
	restorecon -R /lib64/security
	setsebool -P ftpd_connect_db 1
	setsebool -P ftp_home_dir 1
	chcon -R -t public_content_rw_t /var/ftproot/

#### 六、测试：利用FTP客户端工具,以虚拟用户登录验证结果 ####

	tail /var/log/secure

#### 七、在FTP服务器上配置虚拟用户具有不同的访问权限 ####

vsftpd可以在配置文件目录中为每个用户提供单独的配置文件以定义其ftp服务访问权限，每个虚拟用户的配置文件名同虚拟用户的用户名。配置文件目录可以是任意未使用目录，只需要在vsftpd.conf指定其路径及名称即可

• 1、配置vsftpd为虚拟用户使用配置文件目录

	vim /etc/vsftpd/vsftpd.conf
	添加如下选项
		user_config_dir=/etc/vsftpd/vusers_config

• 2、创建所需要目录，并为虚拟用户提供配置文件

	mkdir /etc/vsftpd/vusers_config/
	cd /etc/vsftpd/vusers_config/
	touch wang mage

3、配置虚拟用户的访问权限
虚拟用户对vsftpd服务的访问权限是通过匿名用户的相关指令进行的。如果需要让用户wang具有上传文件的权限，可以修改/etc/vsftpd/vusers_config/wang文件，在里面添加如下选项并设置为YES即可,只读则设为NO

**注意**：需确保对应的映射用户对于文件系统有写权限

	anon_upload_enable={YES|NO}
	anon_mkdir_write_enable={YES|NO}
	anon_other_write_enable={YES|NO}
	local_root=/ftproot 登录目录改变至指定的目录
