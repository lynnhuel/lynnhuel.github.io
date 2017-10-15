---
layout: post
title: "Centos——安全与加密"
date: 2017/10/09 11:42:21
description: ""
tag: linux
--- 

### 墨菲定律 ###   

一种心理学效应，是由爱德华·墨菲（ Edward A.Murphy）提出的，原话：如果有两种或两种以上的方式去做某件事情，而其中一种选择方式将导致灾难，则必定有人会做出这种选择

> 主要内容：   
 任何事都没有表面看起来那么简单  
 所有的事都会比你预计的时间长  
 会出错的事总会出错  
 如果你担心某种情况发生，那么它就更有可能发生  

### 安全防护环节 ###

物理安全：各种设备/主机、机房环境  
系统安全：主机或设备的操作系统  
应用安全：各种网络服务、应用程序  
网络安全：对网络访问的控制、防火墙规则  
数据安全：信息的备份与恢复、加密解密  
管理安全：各种保障性的规范、流程、方法  

### 对称加密 ###  

加密和解密使用同一个密钥
	
	DES： Data Encryption Standard， 56bits  
	3DES：  
	AES： Advanced (128, 192, 256bits)  
	Blowfish， Twofish  
	IDEA， RC6， CAST5  

#### 特性： ####  
1、加密、解密使用同一个密钥，效率高  
2、将原始数据分割成固定大小的块，逐个进行加密   
#### 缺陷： ####  
1、 密钥过多  
2、密钥分发  
3、数据来源无法确认  

### 非对称加密 ###

公钥加密：密钥是成对出现

1 公钥：公开给所有人； public key
2 私钥：自己留存，必须保证其私密性； secret key

 特点：用公钥加密数据，只能使用与之配对的私钥解密；反之亦然

#### 功能： ####

1 数字签名：主要在于让接收方确认发送方身份
2 对称密钥交换：发送方用对方的公钥加密一个对称密钥后发送给
对方
3 数据加密：适合加密较小数据
####  缺点： ####   
密钥长， 加密解密效率低下
 
算法：
		
	RSA（加密，数字签名） ,DSA（数字签名） ,ELGamal

### CA与证书 ###

#### PKI: ####   
Public Key Infrastructure

签证机构： CA（ Certificate Authority）
注册机构： RA
证书吊销列表： CRL
证书存取库：

#### X.509： ####  
定义了证书的结构以及认证协议标准

> 版本号  
序列号  
签名算法  
颁发者  
有效期限  
主体名称  
主体公钥  
CRL分发点  
扩展信息  
发行者签名  

### 创建私有CA： ###

openssl的配置文件： /etc/pki/tls/openssl.cnf

 1、创建所需要的文件

	touch /etc/pki/CA/index.txt 生成证书索引数据库文件   
	echo 01 > /etc/pki/CA/serial 指定第一个颁发证书的序列号

 2、 CA自签证书

生成私钥

	cd /etc/pki/CA/  
	(umask 066; openssl genrsa -out /etc/pki/CA/private/cakey.pem 2048)

生成自签名证书

	openssl req -new -x509 –key    
	/etc/pki/CA/private/cakey.pem -days 7300 -out  
	/etc/pki/CA/cacert.pem  
		-new: 生成新证书签署请求  
		-x509: 专用于CA生成自签证书  
		-key: 生成请求时用到的私钥文件  
		-days n：证书的有效期限  
		-out /PATH/TO/SOMECERTFILE: 证书的保存路径  

 3、 颁发证书

• A 在需要使用证书的主机生成证书请求
给web服务器生成私钥

	(umask 066; openssl genrsa -out /etc/pki/tls/private/test.key 2048)

生成证书申请文件

	openssl req -new -key /etc/pki/tls/private/test.key  
	-days 365 -out etc/pki/tls/test.csr  

• B 将证书请求文件传输给CA
• C CA签署证书，并将证书颁发给请求者

	openssl ca -in /tmp/test.csr –out   
	/etc/pki/CA/certs/test.crt -days 365
  
注意：默认国家，省，公司名称三项必须和CA一致

• D 查看证书中的信息：

	openssl x509 -in /PATH/FROM/CERT_FILE -noout -text|issuer|subject|serial|dates  
	openssl ca -status SERIAL 查看指定编号的证书状态

 4、吊销证书

• A 在客户端获取要吊销的证书的serial
	
	openssl x509 -in /PATH/FROM/CERT_FILE -noout -serial -subject

• B 在CA上，根据客户提交的serial与subject信息，对比检验是
否与index.txt文件中的信息一致，吊销证书：
	
	openssl ca -revoke /etc/pki/CA/newcerts/SERIAL.pem38

• C 指定第一个吊销证书的编号
注意：第一次更新证书吊销列表前，才需要执行

	echo 01 > /etc/pki/CA/crlnumber

 D 更新证书吊销列表
	
	openssl ca -gencrl -out /etc/pki/CA/crl/crl.pem

查看crl文件：
	
	openssl crl -in /etc/pki/CA/crl/crl.pem
