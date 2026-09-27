---
title: we手机版声音修复的过程
date: 2026-09-12 19:14:59
---

# 一、事情的开始

24年我使用we的时候，当时我特别喜欢一键三连娘的壁纸，手机的效果很好，唯一的缺点就是没有声音

我尝试寻找没声音的原因

我当时就想到了，如果是真的不支持，录屏也不会有声音

我尝试录屏，发现是有声音的，这就引发的后面的故事[安卓版壁纸引擎是真的不支持声音？](https://www.bilibili.com/video/BV1nobResE8j/)

当时我就尝试过修改本体来实现功能，但是当时的ai编程还不是那么发展，我印象里就是仅局限于自动补全

当时我尝试用gemin改包，但是当时还不懂安卓逆向，改了包也打不开

# 二、真正实践

26年7月，我开始回味我以前的视频，无意间发现了这个

我当时正好没事可做，我开始完整之前的大饼

## 2.分析apk

we手机端的apk很复杂但很有逻辑（没有混淆等），虽然整个apk全是效果文件

真正的代码存在于两个classes中

解包结构如图（几乎全删了）：

```
wea
├─assets
│  └─scripts          # 非资源的脚本目录，可能包含应用自定义 JS 逻辑
├─lib                 # 原生动态库（arm64-v8a/armeabi-v7a），可能含自定义实现
└─smali
   └─com
      └─io
         └─wallpaperengine  # 应用核心自定义代码（包名 com.io.wallpaperengine）
```

手机支持两种格式的壁纸（视频，场景），固然有两套逻辑

### I.视频类型壁纸

视频类型的壁纸核心逻辑存在于`smali\io\wallpaperengine\weutil\SupportVideoPlayer.smali`400-402和`smali/io/wallpaperengine/weviews/VideoWallpaperViewVideoDrawable.smali`225-229中

原因是因为声音被硬编码为0

这一部分是最简单的，ai1分钟就改完了

### II.场景类型壁纸

我先分析了java层，发现根本就没有场景壁纸的luio
