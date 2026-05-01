---
title: 使用wsl安装ubuntu18.04并编译华为内核
date: 2025-12-27 21:40:00
---
# **一、安装wsl和ubuntu18.04**

## **1.安装wsl**

powershell输入以下命令即可

`wsl --install`

## **2.安装ubunt18.04（-99%的问题，不建议安装其他版本）**

微软商店搜索`Ubuntu 18.04.6 LTS`或者打开`https://apps.microsoft.com/detail/9PNKSF5ZN4SW`更或者打开

`http://tlu.dl.delivery.mp.microsoft.com/filestreamingservice/files/96c69c93-9025-4584-8c39-15922b118041?P1=1766850950&P2=404&P3=2&P4=ngZN86lXlY5%2fdoUYjCtdDQOSJeXTp2fbVfzsAOE8GJeRxQP3cNtuSj2MNsObguuqBZwoUog71zfEiY5lCKnHOg%3d%3d`

推荐使用idm下载，浏览器似乎不能正常下载

下载后直接打开

## **3.\[可选]迁移wsl到其他盘符**

打开CMD，输入`wsl -l -v`查看wsl虚拟机的名称与状态

找到需要的容器记下全称

输入 `wsl --shutdown` 使其停止运行，再次使用`wsl -l -v`确保其处于stopped状态

①导出它的备份（比如命名为Ubuntu.tar)**记得创建文件夹**

```
wsl --export Ubuntu-18.04 D:\Ubuntu_WSL\Ubuntu.tar
```

②确定在此目录下可以看见备份Ubuntu.tar文件之后，注销原有的wsl

```
wsl --unregister Ubuntu-18.04
```

③将备份文件恢复到`D:\Ubuntu_WSL`中去

```
wsl --import Ubuntu-18.04 D:\Ubuntu_WSL D:\Ubuntu_WSL\Ubuntu.tar
```

④恢复原本用户

```
Ubuntu1804 config --default-user [原本用户名]
```

## **4.\[可选]换源**

wsl中输入并且更新软件包

```
bash <(curl -sSL https://linuxmirrors.cn/main.sh)
```

# **二、编译内核**

这一步可能使用终端操作文件会有些麻烦可以尝试使用`nautilus`和`gedit`

附：参考：`https://github.com/Coconutat/Huawei-GSI-And-Modify-Or-Support-KernelSU-Tutorial/wiki/7.KernelSU%E9%80%82%E9%85%8DEMUI9%E6%88%969.1.0%E7%B3%BB%E7%BB%9F%E7%9A%84%E5%86%85%E6%A0%B8`

## **1.下载内核**

`https://consumer.huawei.com/en/opensource/`

注意：部分机型可能没有旧版本的内核，可以尝试下载同处理器设备的内核

## **2.下载编译器**

华为内核4.9只支持以下编译器

`https://android.googlesource.com/platform/prebuilts/gcc/linux-x86/aarch64/aarch64-linux-android-4.9/+archive/refs/heads/pie-release.tar.gz`

新版本的编译器会玩“障眼法”，所以需要将`/bin/`中的`real-aarch64-linux-android-g++`改为`aarch64-linux-android-g++`，`real-aarch64-linux-android-gcc`改为`aarch64-linux-android-gcc`

## **3.\[可选]处理内核（需要ksu情况下需要修改）**

解压内核，这里就引用文章了

### **①\[引用]第三节：处理内核**

华为内核和其它手机内核有显著的区别。毕竟其他设备可能是高通或者联发科，而华为用的是海思麒麟。\
所以内核有更多的碎片化趋势，因为包含大量华为自定义的代码。\
所以接下来，我们需要处理内核的**defconfig**文件。\
路径是 arch/arm64/configs/XXXXXXX\_defconfig。\
因为不同机型的defconfig文件不一样。所以，前面用XXXXXXX代替了。\
这个文件是用来确认哪些内核组建需要编译，哪些不需要编译。

**这里我们需要处理以下内容**：

> 有些可能没有，如果有就做改动，没有则无需。

```
CONFIG_HISI_PMALLOC=y  
CONFIG_HIVIEW_SELINUX=y    
CONFIG_HISI_SELINUX_EBITMAP_RO=y    
CONFIG_HISI_SELINUX_PROT=y    
CONFIG_HISI_RO_LSM_HOOKS=y    
CONFIG_INTEGRITY=y      
CONFIG_INTEGRITY_AUDIT=y      
CONFIG_HUAWEI_CRYPTO_TEST_MDPP=y    
CONFIG_HUAWEI_SELINUX_DSM=y    
CONFIG_HUAWEI_HIDESYMS=y    
CONFIG_HW_SLUB_SANITIZE=y    
CONFIG_HUAWEI_PROC_CHECK_ROOT=y    
CONFIG_HW_ROOT_SCAN=y    
CONFIG_HUAWEI_EIMA=y    
CONFIG_HUAWEI_EIMA_ACCESS_CONTROL=y    
CONFIG_HW_DOUBLE_FREE_DYNAMIC_CHECK=y    
CONFIG_HKIP_ATKINFO=y    
CONFIG_HW_KERNEL_STP=y  
CONFIG_HISI_HHEE=y    
CONFIG_HISI_HHEE_TOKEN=y    
CONFIG_HISI_DIEID=y    
CONFIG_HISI_SUBPMU=y   
CONFIG_TEE_ANTIROOT_CLIENT=y  
CONFIG_HWAA=y   

```

附:\
4.14.x内核额外选项(实验性质，建议按照4.9的参数修改)

```
CONFIG_SECURITY_KSHIELD=y
CONFIG_HWDPS=y
CONFIG_HUAWEI_MDPP_CCMODE=y
CONFIG_HUAWEI_SOP=y
CONFIG_HKIP_SELINUX_PROT=y
CONFIG_HKIP_SELINUX_POLDB_SIZE_MB=8
CONFIG_HHEE=y
CONFIG_HKIP_MODULE_ALLOC=y
CONFIG_UEFI_HHEE=y
CONFIG_HKIP_PRMEM=y
CONFIG_HKIP_PRMEM_BYPASS=y
CONFIG_DEBUG_HKIP_PRMEM=y
CONFIG_PRMEM_MAX_MEMORY=8
CONFIG_HKIP_PROTECT_BPF=y
CONFIG_HKIP_PROTECT_BPF_CAP=2
CONFIG_HKIP_PROTECT_POWEROFF_CMD=y
CONFIG_HKIP_XOM_CODE=y
CONFIG_CFI_CHECK_CACHE_NUM=512
CONFIG_HKIP_CFI_HARDEN=y
CONFIG_SUBPMU=y
CONFIG_HW_ROOT_SCAN_RODATA_MEASUREMENT_API=y

```

这些内容需要改成如下格式：\
`# CONFIG_XXXXXX is not set`\
例如：\
`# CONFIG_HW_ROOT_SCAN is not set`\
这个改动的含义是不编译这些模块。

**可选部分（大于安卓9的GSI）**： 把\
`# CONFIG_SECURITY_SELINUX_DEVELOP is not set`\
改为\
`CONFIG_SECURITY_SELINUX_DEVELOP=y`\
改动此处是使开机的时候手机SELinux默认是Permissive状态。

关闭AVB验证：

```
CONFIG_DM_VERITY=y  
CONFIG_DM_VERITY_AVB=y

```

改为

```
# CONFIG_DM_VERITY is not set  
# CONFIG_DM_VERITY_AVB is not set 

```

针对980设备的额外修改：\
找到目录：**drivers/hisi/hi64xx**下的**hi64xx\_utils.c**\
找到代码：

```
int hisi_codec_get_dieid(char *dieid, unsigned int len)
{
	if (cdc_type == HI64XX_CODEC_TYPE_6405) {
		return hi6405_codec_get_dieid(dieid, len);
	}
	return -1;
}

```

将其注释掉：

```
/*
int hisi_codec_get_dieid(char *dieid, unsigned int len)
{
	if (cdc_type == HI64XX_CODEC_TYPE_6405) {
		return hi6405_codec_get_dieid(dieid, len);
	}
	return -1;
}
*/

```

即可完成修改。

Debug用：\
在不理解以下关于SELinux安全选项的部分时，请直接跳过，不要修改。\
关于SELinux安全选项：\
`CONFIG_SECURITY_SELINUX_BOOTPARAM`

> 添加"selinux"内核引导参数.以允许在引导时使用'selinux=0'禁用SELinux或'selinux=1'启用SELinux.

`CONFIG_SECURITY_SELINUX_BOOTPARAM_VALUE`

> 此选项设置内核参数的默认值 'selinux'，允许SELinux在启动时禁用。 如果这个选项设置为0，SELinux内核参数将默认为0，设备在启动时禁用SELinux。 如果此选项为 设置为1，SELinux内核参数将默认为1，在启动时启用SELinux。

`CONFIG_SECURITY_SELINUX_CHECKREQPROT_VALUE`

> 内核引导参数"checkreqprot"的默认值.设为"0"表示默认检查内核要求执行的保护策略,设为"1"表示默认检查应用程序要求执行的保护策略.此值还可以在运行时通过/selinux/checkreqprot修改.不确定的选"1"。

### **②\[可选]集成ksu（不能编译好后修补！）**

可以参考原文章修改，这里给出附加内容：

```
#集成ksu
curl -LSs "https://raw.githubusercontent.com/tiann/KernelSU/main/kernel/setup.sh" | bash -s v0.9.2
#集成sukiultra
curl -LSs "https://raw.githubusercontent.com/SukiSU-Ultra/SukiSU-Ultra/main/kernel/setup.sh" | bash -s main
```

解释：sukiultra增加了non-GK的支持，但是仍然不推荐，低版本内核编译完成后可能会出现bug

<br />

## **4.开始编译**

### **①安装依赖**

```
sudo apt install git-core gnupg flex bison gperf build-essential zip curl zlib1g-dev gcc-multilib g++-multilib libc6-dev-i386 lib32ncurses5-dev x11proto-core-dev libx11-dev lib32z-dev libgl1-mesa-dev libxml2-utils xsltproc unzip bc
```

额外需求：

Python 2.7 : `sudo apt install python-minimal`

然后输入命令：`sudo ln -sf /usr/bin/python2.7 /usr/bin/python`（可能不用）

使得默认Python是Python2.7(华为官方内核源码不兼容Python3.x)

### **②设置环境变量**

```
export ARCH=arm64  
export PATH=$PATH:/media/coconutat/Files/Downloads/Github/android_kernel_huawei_ravel_KernelSU  
android_kernel_huawei_ravel_KernelSU/aarch64-linux-android-4.9/bin  
export CROSS_COMPILE=aarch64-linux-android-
```

注：根据实际情况设置

### **③开始编译**

```
make ARCH=arm64 O=out XXXXXX_defconfig  
make ARCH=arm64 O=out -j8
```

`XXXXXX_defconfig`是你修改过的那个文件

`-j8`是使用8线程编译，建议调节成自己的cpu线程数x2

等待编译完成即可

### **④打包内核**

```
cp out/arch/arm64/boot/Image.gz tools/
#将编译好的内核复制到工具目录
cd tools
vim pack_kernerimage_cmd.sh
```

按照你的喜欢的方式修改打包脚本

```
#!/bin/bash 
./mkbootimg --kernel kernel --base 0x0 --cmdline "loglevel=4 initcall_debug=n page_tracker=on unmovable_isolate1=2:192M,3:224M,4:256M printktimer=0xfff0a000,0x534,0x538 androidboot.selinux=enforcing buildvariant=user" --tags_offset 0x07A00000 --kernel_offset 0x00080000 --ramdisk_offset 0x07C00000 --header_version 1 --os_version 9 --os_patch_level 2020-01-01  --output kernel.img  
```

`--kernel kernel`是内核文件的路径，将第二个`kernel`替换为你复制过来的`Image.gz`

`--output kernel.img`是输出的文件名称

可选：将`androidboot.selinux=enforcing`改为`androidboot.selinux=permissive`，这个用来将selinux改为宽容模式

```
bash pack_kernerimage_cmd.sh
#打包内核
```

找到`kernel.img`就是你编译的内核了，享受ksu（除了没有基带）

# **三、结尾**

这个内核多多少少我也搞了一个月，一直到1月18号才写完这篇文章，最后基带的问题还是没有解决

也希望自己在新的一年能够有所突破吧
