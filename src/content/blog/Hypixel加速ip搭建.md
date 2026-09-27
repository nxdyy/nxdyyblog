---
title: Hypixel加速ip搭建
date: 2026-07-07 19:16:29
---
事情是这样的：
    1.暑假到来，想跟朋友玩游戏，但是找不到好玩的游戏
    2.突然间想起了hypixel服务器 ，但是没找到好友加速ip

这就步入了正题，加速ip的搭建！

# 一、选择好用的服务端

## 1.尝试[minecraftspeedproxy](https://github.com/AllesUgo/Minecraft-Speed-Proxy/)

最开始我通过必应搜索到了[minecraftspeedproxy](https://github.com/AllesUgo/Minecraft-Speed-Proxy/)，似乎好像还可以用，但当我想将其添加到宝塔里时...

```
...
[2026-07-05 22-11-29] [ERROR] Error: Command line is empty
[2026-07-05 22-11-29] [ERROR] Error: Command line is empty
[2026-07-05 22-11-29] [ERROR] Error: Command line is empty
...
```

不到一分钟日志文件已经1GB了，这已经没法用了！！

服务端也没有正常的启动，搜索解决方法也没有找到

我去另辟蹊径了

最终找到了[ZBProxy](https://github.com/layou233/ZBProxy)

## 2.使用[ZBProxy](https://github.com/layou233/ZBProxy)

这个服务端是基于go写的，还算好用（宝塔对go项目的兼容程度还行？）

我下载了`ZBProxy-linux-amd64-v3`版本的服务端

直接部署到服务器上面就行

# 二、使用[ZBProxy](https://github.com/layou233/ZBProxy)搭建加速ip

运行[ZBProxy](https://github.com/layou233/ZBProxy)

```
./ZBProxy-linux-amd64-v3
```

然后会生成一篇配置文件(被折叠)：

```json
{"Log": {"Level": "debug"
},"Services": [{
            "Name": "Hypixel-in",
            "Listen": 25565,
            //监听端口
            "IPAccess": {"Mode": ""},"Outbound": {}}],"Router": {
        "DefaultOutbound": "RESET","Rules": [{"Type": "always","Rewrite": {},
                "Sniff": "minecraft"},{"Type": "ServiceName",
                "Parameter": "Hypixel-in",
                "Rewrite": {"Minecraft": {
                        "Hostname": "mc.hypixel.net",
                        //发送给目标服务器地址的端口
                        "Port": 25565}},"Outbound": "Hypixel-out"}]},"Outbounds": [{
                        //目标端口
            "Name": "Hypixel-out",
            "TargetAddress": "mc.hypixel.net",
            //目标服务器
            "TargetPort": 25565,
            //目标端口
            "Minecraft": {
                "OnlineCount": {
                    "Max": 24,
                    //最大玩家数量
                    "Online": -1,
                    //在线数量，小于0就是真实数量
                    "EnableMaxLimit": true
                    //是否启用数量限制
                    //"Sample": ["玩家1","玩家2"]
                },"HostnameAccess": {"Mode": ""},"NameAccess": {"Mode": ""},
                "PingMode": "",
                //minecraft显示的服务器延迟
                "MotdFavicon": "",
                //服务器图标，64x64，png，base64
                "MotdDescription": ""
                //服务器描述
            },"ProxyOptions": {}}],"Lists": {}}

```

大体就是这样

根据实际情况调整，当然不调整也行，默认连接hyp服务器

这里的说明及其不明确，最好参照官方文档[https://launium.com/doc/ZBProxy/zh/](https://launium.com/doc/ZBProxy/zh/)

服务端不需要额外的环境，直接运行即可

# 三、搭建完成

保存配置文件以后直接运行即可，服务端会自动加载配置文件

如果你想图方便也可以直接加入宝塔里面

我搭建完成的结果是这样的：

![搭建完成结果](https://blog.nxdyy.cn/imgs/Hypixel加速ip搭建-1.png)

当然也可以直接连接的！

`hyp.nxdyy.cn`

只要有剩余的资源就会运行！！