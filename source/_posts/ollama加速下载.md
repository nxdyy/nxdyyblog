---
title: ollama加速下载
date: 2026-05-17 21:44:15
---

这篇文章是我在国内下载ollama遇到的的下载问题找到的解决方案

理论上全系统通用，自己照着改就行

# 一、获取安装脚本

## 1.从官网获取安装脚本

ollama官网：[https://ollama.com/download/](https://ollama.com/download/)

选择linux，复制安装脚本

我复制到的是：

```bash
curl -fsSL https://ollama.com/install.sh | sh
#将以上脚本下载
wget https://ollama.com/install.sh
```

你说这都下载不了

我第二次也遇到了

从github的发行版页面下载即可，链接：[https://github.com/ollama/ollama/releases](https://github.com/ollama/ollama/releases)

优先下载稳定版

下载完成一样上传到服务器

## 2.编辑安装脚本

先在github找到你要安装的版本，链接：[https://github.com/ollama/ollama/releases](https://github.com/ollama/ollama/releases)

例如我选择v0.24.0

找到下面随便一个下载链接

右键-复制链接地址

再找一个github下载加速的网站

粘贴地址然后加速下载，但是这里只复制下载的链接即可

我复制的是`https://cdn.gh-proxy.org/https://github.com/ollama/ollama/releases/download/v0.24.0/ollama-linux-amd64.tar.zst`

这个加速节点并不好用，后半部分速度极慢，但是都是公益服务，推荐自己搭建，减少资源浪费

修改，只保留路径，改完是这个效果`https://cdn.gh-proxy.org/https://github.com/ollama/ollama/releases/download/v0.24.0/`

```bash
#如果你用的是其他的终端软件可以直接使用软件编辑
vim install.sh
```

找到第171-183行（视版本而定）

```bash
download_and_extract "https://ollama.com/download" "$OLLAMA_INSTALL_DIR" "ollama-linux-${ARCH}"

if [ "$OLLAMA_INSTALL_DIR/bin/ollama" != "$BINDIR/ollama" ] ; then
    status "Making ollama accessible in the PATH in $BINDIR"
    $SUDO ln -sf "$OLLAMA_INSTALL_DIR/ollama" "$BINDIR/ollama"
fi

# Check for NVIDIA JetPack systems with additional downloads
if [ -f /etc/nv_tegra_release ] ; then
    if grep R36 /etc/nv_tegra_release > /dev/null ; then
        download_and_extract "https://ollama.com/download" "$OLLAMA_INSTALL_DIR" "ollama-linux-${ARCH}-jetpack6"
    elif grep R35 /etc/nv_tegra_release > /dev/null ; then
        download_and_extract "https://ollama.com/download" "$OLLAMA_INSTALL_DIR" "ollama-linux-${ARCH}-jetpack5"
```

将`https://ollama.com/download`全部替换为镜像站的地址，例如`https://cdn.gh-proxy.org/https://github.com/ollama/ollama/releases/download/v0.24.0/`

# 二、安装ollama

## 安装

剩下的流程就是正常安装的流程

结束

--------------------------

这篇文章挺简单的是吧w

山西的备案好慢！！！

都等了一周了