# Hexo 博客项目技术文档

## 1. 项目概述

本项目是一个基于 **Hexo 8.1.1** 构建的静态博客系统，部署在 `https://blog.nxdyy.cn`。博客使用了自定义主题 **hexo-theme-gal**（基于 AONOSORA 主题修改），具有现代化的 UI 设计、丰富的交互特效和完善的侧边栏功能。

### 1.1 核心技术栈

| 技术 | 版本/说明 | 用途 |
|------|----------|------|
| Hexo | 8.1.1 | 静态博客生成器 |
| Node.js | - | 运行环境 |
| EJS | ^2.0.0 | 模板引擎 |
| Bootstrap | 3.x | CSS 框架 |
| jQuery | 3.6.4 | JavaScript 库 |
| AOS | - | 滚动动画库 |
| Highslide | - | 图片灯箱效果 |
| Font Awesome | 4.7.0 | 图标字体 |
| LeanCloud | - | 文章统计服务 |
| Gitment | - | 评论系统 |

---

## 2. 项目结构

```
/www/wwwroot/blog.nxdyy.cn/
├── _config.yml                 # Hexo 全局配置文件
├── package.json                # 项目依赖
├── source/                     # 博客内容源文件
│   └── _posts/                 # Markdown 文章
├── public/                     # 生成的静态文件（部署目录）
├── themes/
│   └── hexo-theme-gal/         # 自定义主题
│       ├── _config.yml         # 主题配置文件
│       ├── layout/             # EJS 模板文件
│       │   ├── layout.ejs      # 基础布局模板
│       │   ├── index.ejs       # 首页模板
│       │   ├── post.ejs        # 文章页模板
│       │   ├── page.ejs        # 自定义页面模板
│       │   ├── archive.ejs     # 归档页模板
│       │   ├── tag.ejs         # 标签页模板
│       │   ├── category.ejs    # 分类页模板
│       │   ├── categories.ejs  # 分类列表页模板
│       │   ├── tags.ejs        # 标签列表页模板
│       │   ├── _partial/       # 公共组件
│       │   │   ├── head.ejs    # HTML Head
│       │   │   ├── header.ejs  # 导航栏
│       │   │   ├── footer.ejs  # 页脚
│       │   │   ├── sidebar.ejs # 侧边栏容器
│       │   │   ├── article.ejs # 文章详情
│       │   │   ├── excerpt.ejs # 文章摘要
│       │   │   ├── pagination.ejs # 分页
│       │   │   ├── slideshow.ejs  # 背景轮播
│       │   │   ├── oni.ejs     # 右键菜单特效
│       │   │   └── issue.ejs   # 公告栏
│       │   └── _widget/        # 侧边栏小部件
│       │       ├── author.ejs      # 作者信息
│       │       ├── search.ejs      # 搜索框
│       │       ├── recent_posts.ejs # 近期文章
│       │       ├── hot_posts.ejs   # 最热文章
│       │       ├── random_posts.ejs # 随机文章
│       │       ├── hot_tags.ejs    # 热门标签
│       │       ├── friend_links.ejs # 友情链接
│       │       ├── links.ejs       # 个人链接
│       │       └── recent_comments.ejs # 最新评论
│       ├── source/             # 主题静态资源
│       │   ├── css/
│       │   │   └── style.css   # 主题样式（含 Font Awesome）
│       │   ├── js/
│       │   │   ├── blog.js          # 核心交互逻辑
│       │   │   ├── page-transition.js # 无刷新页面转场
│       │   │   ├── hs.js            # Highslide 图片处理
│       │   │   ├── oni.js           # 右键菜单特效
│       │   │   ├── activate-power-mode.js # 输入特效
│       │   │   ├── comment/
│       │   │   │   ├── leancloud.js # 文章统计
│       │   │   │   └── gitment.js   # 评论系统渲染
│       │   │   └── highslide/       # Highslide 插件
│       │   └── imgs/           # 图片资源
│       └── languages/
│           └── default.yml     # 语言配置
└── ...
```

---

## 3. 配置文件详解

### 3.1 Hexo 全局配置 (`_config.yml`)

```yaml
# 站点基本信息
title: nxdyy's 摆烂小站
subtitle: 'nxdyy的摆烂小站'
description: 'nxdyy突发奇想搭建的博客'
keywords: nxdyy, 博客, 摆烂小站, hexo, 5
author: nxdyy
language: zh-CN
timezone: 'Asia/Shanghai'

# URL 配置
url: https://blog.nxdyy.cn
permalink: :year/:month/:day/:title/

# 分页配置
index_generator:
  path: ''
  per_page: 10
  order_by: -date

per_page: 10

# 主题配置
theme: hexo-theme-gal

# JSON Content 生成器（用于搜索）
jsonContent:
  dateFormat: MM-DD
  pages:
    title: true
    text: true
    path: true
    date: true
    excerpt: true
    preview: true
  posts:
    title: true
    text: true
    path: true
    date: true
    excerpt: true
    tags: [{
        name: tag.name,
        slug: tag.slug,
        permalink: tag.permalink
    }]
    preview: true
```

### 3.2 主题配置 (`themes/hexo-theme-gal/_config.yml`)

主题配置是博客功能定制的核心，主要配置项包括：

#### 3.2.1 基础配置

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `use_logo` | boolean | 是否使用 Logo 图片 |
| `logo_image` | string | Logo 图片路径 |
| `navbar_text` | string | 导航栏文字（无 Logo 时显示） |
| `xs_bg_image` | string | 移动端背景图 |
| `author_image` | string | 作者头像 |
| `programmer_mode` | boolean | 程序员模式（改变文章显示样式） |

#### 3.2.2 导航菜单 (`menu`)

```yaml
menu:
  - title: 首页
    icon: home
    url: /
  - title: 归档
    icon: archive
    url: archives
  - title: 分类
    icon: list
    url: categories
    dropdown: 3  # 下拉菜单最大项目数
  - title: 标签
    icon: tags
    url: tags
    dropdown: 3
  - title: 关于我
    icon: user
    url: about
```

#### 3.2.3 侧边栏配置 (`sidebar`)

```yaml
sidebar:
  recent_comments: true   # 最新评论
  hot_posts: true         # 最热文章（需 LeanCloud）
  recent_posts: true      # 最新文章
  random_posts: true      # 随机文章
  tags: true              # 热门标签
  friend_links: false     # 友情链接
  links: true             # 个人链接
```

#### 3.2.4 功能开关

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `use_issue` | boolean | 是否显示公告 |
| `open_oni` | boolean | 是否开启右键菜单特效 |
| `use_comment` | boolean | 是否使用评论系统 |
| `show_excerpt` | boolean | 是否显示文章摘要 |
| `custom_cursor` | boolean | 是否启用自定义鼠标指针 |

#### 3.2.5 背景图配置 (`slide_background`)

```yaml
slide_background:
  use_url: false           # true: 使用外链, false: 使用本地图片
  prefix: slide/background # 图片前缀
  ext: jpg                 # 图片后缀
  max_count: 6             # 可选图片数量
```

#### 3.2.6 代码高亮主题

```yaml
highlight_theme: atom-one-dark  # 可选: github, railscasts, monokai_sublime, atom-one-dark, darcula
```

#### 3.2.7 无刷新页面转场

```yaml
page_transition:
  enable: true
  animation: fade    # 可选: fade, slide, scale
  duration: 300      # 动画持续时间(ms)
```

#### 3.2.8 自动摘要

```yaml
auto_excerpt:
  enable: true
  length: 50    # 自动摘要字符长度
```

#### 3.2.9 第三方服务配置

**LeanCloud 文章统计：**
```yaml
leancloud:
  appid:  # your appId
  appkey: # your appKey
```

**Gitment 评论系统：**
```yaml
comment:
  gitment:
    owner: # GitHub ID
    repo: # 存储评论的仓库
    oauth:
      client_id: # OAuth App ID
      client_secret: # OAuth App Secret
      redirect_uri: # 可选
```

**自定义页尾：**
```yaml
custom_footer:
  enable: true
  content: "<script src=\"//cdn.busuanzi.cc/busuanzi/3.6.9/busuanzi.min.js\" defer></script>"
```

---

## 4. 模板系统详解

### 4.1 基础布局 (`layout/layout.ejs`)

基础布局模板定义了所有页面的通用结构：

```
<!DOCTYPE html>
<html>
<head> ... </head>
<body>
    <!-- 加载中提示 -->
    <div id="page-loader">...</div>
    
    <!-- 背景轮播图 -->
    <%- partial('_partial/slideshow.ejs') %>
    
    <!-- 右键菜单特效（可选） -->
    <% if(theme.open_oni === true) { %>
    <%- partial('_partial/oni.ejs') %>
    <% } %>
    
    <!-- 导航栏 -->
    <%- partial('_partial/header') %>
    
    <!-- 主体内容 -->
    <div id="gal-body">
        <div class="container">
            <div class="row">
                <!-- 主内容区 (8列) -->
                <div class="col-md-8 gal-right" id="mainstay">
                    <%- body %>
                </div>
                <!-- 侧边栏 (4列) -->
                <%- partial('_partial/sidebar') %>
            </div>
        </div>
    </div>
    
    <!-- 页脚 -->
    <%- partial('_partial/footer') %>
</body>
</html>
```

### 4.2 首页模板 (`layout/index.ejs`)

首页展示文章列表，支持置顶文章：

```ejs
<% if(theme.use_issue) { %>
<%- partial('_partial/issue') %>
<% } %>

<div id="article-list">
    <!-- 置顶文章（仅在第一页显示） -->
    <% if (page.prev === 0) { %>
        <% var topPosts = site.posts.filter(function (post) {
            return typeof post.top !== 'undefined' && post.top === true
        }).sort('date', -1) %>
        <% topPosts.forEach(function (post) { %>
            <%- partial('_partial/excerpt', { item: post, top: true }) %>
        <% }) %>
    <% } %>
    
    <!-- 普通文章列表 -->
    <% page.posts.filter(function (post) {
        return typeof post.top === 'undefined' || post.top === false
    }).forEach(function (post) { %>
        <%- partial('_partial/excerpt', { item: post }) %>
    <% }) %>
</div>

<%- partial('_partial/pagination', { page: page }) %>
```

**置顶文章设置：** 在文章 Front-matter 中添加 `top: true`

### 4.3 文章详情模板 (`layout/post.ejs`)

```ejs
<%- partial('_partial/article', { item: page, isPage: false } ) %>
```

### 4.4 文章摘要组件 (`layout/_partial/excerpt.ejs`)

文章摘要组件同时支持桌面端和移动端显示：

- **桌面端 (`.hidden-xs`)**：完整布局，包含日期徽章、标题、标签、摘要、预览图
- **移动端 (`.visible-xs`)**：简化布局，居中显示

**摘要生成逻辑：**
```javascript
var excerptText = '';
if (item.preview_text) {
    excerptText = markdown(item.preview_text);
} else if (item.excerpt) {
    excerptText = item.excerpt;
} else if (theme.auto_excerpt && theme.auto_excerpt.enable && item.content) {
    var rawContent = item.content.replace(/<[^>]+>/g, '');
    var autoLength = theme.auto_excerpt.length || 50;
    excerptText = rawContent.length > autoLength ? rawContent.substring(0, autoLength) + '...' : rawContent;
}
```

### 4.5 文章详情组件 (`layout/_partial/article.ejs`)

文章详情页包含：
- 面包屑导航
- 封面图（随机从 `default_preview` 中选择）
- 文章标题
- 标签和日期
- 阅读量统计（需 LeanCloud）
- 文章内容
- 评论系统（可选）

---

## 5. 前端交互系统

### 5.1 核心脚本 (`source/js/blog.js`)

#### 5.1.1 搜索表单验证
```javascript
var searchForm = $('#search-form');
var searchSubmit = searchForm.find('.btn-gal')
searchSubmit.each(function () {
    $(this).on('click', function (event) {
        var searchInput = $(this).prev()
        var input = searchInput.val().trim()
        if(input === null || input === '') {
            event.preventDefault();
            searchInput.focus()
        }
    })
})
```

#### 5.1.2 背景轮播图
```javascript
var slideList = []
var prefix = window.slideConfig.prefix
var ext = '.' + window.slideConfig.ext
var maxCount = window.slideConfig.maxCount
for(var k = 0; k < 6; k++) {
    var n = Math.floor(Math.random() * maxCount) + 1
    while(slideList.indexOf(n) !== -1) {
        n = Math.floor(Math.random() * maxCount) + 1
    }
    slideList.push(n)
}

var cdSlideShow = $('.cb-slideshow')
cdSlideShow.find('span').each(function (i, span) {
    $(this).css('backgroundImage', 'url(\'' + prefix + slideList[i] + ext + '\')')
})
```

#### 5.1.3 面板折叠/关闭
```javascript
var panelToggle = $('.panel-toggle')
var panelRemove = $('.panel-remove')
panelToggle.on('click', function () {
    var that = $(this)
    var panelGal = that.parents('.panel-gal')
    if(that.hasClass('fa-chevron-circle-up')) {
        that.removeClass('fa-chevron-circle-up').addClass('fa-chevron-circle-down')
        panelGal.addClass('toggled')
    } else {
        that.removeClass('fa-chevron-circle-down').addClass('fa-chevron-circle-up')
        panelGal.removeClass('toggled')
    }
})
```

#### 5.1.4 返回顶部
```javascript
var goTop = $('#gal-gotop')
goTop.css('bottom', '-40px')
goTop.css('display', 'block')
$(window).on('scroll', function () {
    if($(this).scrollTop() > 200) {
        goTop.css('bottom', '20px')
    } else {
        goTop.css('bottom', '-40px')
    }
})
goTop.on('click', function () {
    $('body,html').animate({
        scrollTop: 0
    }, 800)
})
```

### 5.2 无刷新页面转场 (`source/js/page-transition.js`)

实现 SPA 式的页面切换效果，支持三种动画类型：

#### 5.2.1 动画类型

| 类型 | 效果 |
|------|------|
| `fade` | 淡入淡出 |
| `slide` | 左右滑动 |
| `scale` | 缩放效果 |

#### 5.2.2 核心逻辑

```javascript
function navigateTo(url, pushState) {
    if (isTransitioning) return;
    
    isTransitioning = true;
    if (pushState !== false) {
        history.pushState({ url: url }, '', url);
    }
    
    animateOut(function () {
        getPageContent(url, function (err, data) {
            if (err) {
                window.location.href = url;
                return;
            }
            
            document.title = data.title;
            $mainstay.html(data.main);
            $sidebar.html(data.sidebar);
            
            animateIn(function () {
                isTransitioning = false;
                $('html, body').animate({ scrollTop: 0 }, 300);
                // 重新初始化 AOS 和 Highslide
            });
        });
    });
}
```

#### 5.2.3 链接拦截规则

```javascript
$(document).on('click', 'a', function (e) {
    var href = $link.attr('href');
    
    // 排除外部链接、锚点、下载链接等
    if (!href) return;
    if (href === '#') return;
    if ($link.attr('target') === '_blank') return;
    if ($link.attr('download') !== undefined) return;
    if ($link.data('toggle') || $link.data('hover')) return;
    if (href.indexOf('#') === 0) return;
    if (href.indexOf('javascript') === 0) return;
    if (href.indexOf('mailto:') === 0) return;
    if (href.indexOf('tel:') === 0) return;
    
    // 只拦截内部链接
    var isInternal = false;
    if (href.indexOf('/') === 0) {
        isInternal = true;
    } else if (href.indexOf(window.location.origin) === 0) {
        isInternal = true;
    }
    if (!isInternal) return;
    
    e.preventDefault();
    navigateTo(href, true);
});
```

### 5.3 图片灯箱处理 (`source/js/hs.js`)

自动为文章中的图片添加 Highslide 灯箱效果：

```javascript
$('#article').find('.content-article').each(function () {
    $(this).find('img').each(function () {
        if($(this).parent().prop('tagName') !== 'A') {
            $(this).wrap(`<a href="${this.src}" class="highslide-image" onclick="return hs.expand(this);"></a>`)
            $(this).parent().wrap(`<p class="gal-image"></p>`)
            $(this).parent().parent('.gal-image').wrap(`<div class="gal-image-container"></div>`)
            $(this).attr('width', 650);
            $(this).attr('title', '点击放大');
            $(this).attr('alt', '');
        }
    })
})
```

### 5.4 右键菜单特效 (`source/js/oni.js`)

自定义右键菜单，显示环形导航：

- 拦截 `contextmenu` 事件
- 显示圆形菜单，包含首页、上一页、下一页和自定义链接
- 播放音效（`oni.mp3`）
- 点击其他地方或左键关闭菜单

---

## 6. 第三方服务集成

### 6.1 LeanCloud 文章统计 (`source/js/comment/leancloud.js`)

#### 6.1.1 功能

- **文章阅读量统计**：每篇文章访问时自动增加计数
- **最热文章排行**：按阅读量排序展示热门文章
- **随机文章热度**：为侧边栏随机文章添加阅读量

#### 6.1.2 数据模型

```javascript
var Counter = AV.Object.extend('Counter')
// 字段：
// - title: 文章标题
// - url: 文章链接
// - time: 访问次数
```

#### 6.1.3 核心方法

| 方法 | 功能 |
|------|------|
| `addCount(Counter)` | 增加文章访问量 |
| `showPostsTime(Counter)` | 展示文章列表阅读量 |
| `showHotPosts(Counter)` | 展示最热文章 |
| `showRandPosts(randList, randListUrl, Counter)` | 展示随机文章阅读量 |

### 6.2 Gitment 评论系统 (`source/js/comment/gitment.js`)

#### 6.2.1 自定义主题

定义了 `galTheme` 对象，包含：
- `render`：根容器渲染
- `renderHeader`：评论头部（评论数量）
- `renderComments`：评论列表（含分页）
- `renderEditor`：评论编辑器（含表情）
- `renderFooter`：页脚

#### 6.2.2 表情系统

支持 25 个内置表情，点击插入到评论框：
```javascript
for(var k = 1; k <= 25; k++) {
    const emoji = document.createElement('img')
    $emoji.attr('src', '/imgs/smilies/' + k + '.png')
    $emoji.on('click', (function (index) {
        return function () { addEmoji(index) }
    })(k))
}
```

#### 6.2.3 最新评论侧边栏

通过 GitHub API 获取最新评论：
```javascript
$.ajax({
    url: "https://api.github.com/repos/" + owner + '/' + repo + '/issues/comments',
    data: { sort: 'created', direction: 'desc' }
})
```

---

## 7. CSS 样式系统

### 7.1 核心样式变量

| 属性 | 值 | 说明 |
|------|-----|------|
| 主色调 | `#d9534f` | 红色主题 |
| 背景色 | `rgba(230, 238, 232, 0.5)` | 半透明白色 |
| 文字色 | `#3d4450` | 深灰色 |
| 链接色 | `#d2322d` | 红色 |
| 导航栏背景 | `rgba(10, 10, 0, 0.7)` | 半透明黑色 |

### 7.2 响应式断点

| 断点 | 说明 |
|------|------|
| `@media (max-width: 768px)` | 移动端 |
| `@media (min-width: 768px)` | 平板及以上 |

### 7.3 动画效果

#### 7.3.1 背景轮播动画
```css
@keyframes imageAnimation {
  0% { opacity: 0; }
  8% { opacity: 1; transform: scale(1.05); }
  17% { opacity: 1; transform: scale(1.1) rotate(0deg); }
  25% { opacity: 0; transform: scale(1.1) rotate(0deg); }
  100% { opacity: 0; }
}
```

#### 7.3.2 AOS 滚动动画
- `data-aos="fade-up"`：向上淡入
- `data-aos="flip-up"`：向上翻转
- `data-aos="flip-right"`：向右翻转
- `data-aos-duration`：动画持续时间

### 7.4 自定义滚动条
```css
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  border-radius: 10px;
  background-color: #F5F5F5;
}
::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background-color: #018EE8;
}
```

---

## 8. 侧边栏小部件

### 8.1 作者信息 (`_widget/author.ejs`)

- 显示作者头像（支持 URL 或本地路径）
- 显示作者描述（支持 Markdown）
- 头像悬停 360° 旋转动画

### 8.2 搜索框 (`_widget/search.ejs`)

- 表单提交到 `/search/index.html`
- 使用 `hexo-generator-json-content` 生成的 JSON 数据

### 8.3 近期文章 (`_widget/recent_posts.ejs`)

```javascript
site.posts.sort('date', -1).slice(0, 10).forEach(function (post) { ... })
```

### 8.4 随机文章 (`_widget/random_posts.ejs`)

```javascript
for(let i = 0; i < randCount; i++) {
    let randNum = Math.floor(Math.random() * site.posts.length)
    while(randResults.indexOf(randNum) !== -1) {
        randNum = Math.floor(Math.random() * site.posts.length)
    }
    randResults.push(randNum)
}
```

### 8.5 热门标签 (`_widget/hot_tags.ejs`)

- 标签云效果
- 随机字体大小（8px - 20px）
- 7 种颜色循环

### 8.6 最热文章 (`_widget/hot_posts.ejs`)

- 依赖 LeanCloud 统计
- 按阅读量排序
- 显示阅读量徽章

---

## 9. 分页系统 (`layout/_partial/pagination.ejs`)

### 9.1 分页逻辑

- 当前页前后最多显示 3 页
- 超过 7 页时显示省略号
- 支持首页和末页快速跳转

### 9.2 分页结构

```
< 1 ... (n-3) (n-2) (n-1) [n] (n+1) (n+2) (n+3) ... total >
```

---

## 10. 特殊页面

### 10.1 搜索页面 (`layout/page/search.ejs`)

基于 `hexo-generator-json-content` 生成的 `content.json` 实现客户端搜索。

### 10.2 404 页面 (`layout/page/404.ejs`)

自定义 404 错误页面。

### 10.3 自定义页面

在 `layout/page.ejs` 中通过 `page.title` 判断：
```ejs
<% if(page.title === 'search') { %>
    <%- partial('page/search', { item: page }) %>
<% } else if(page.title === '404') { %>
    <%- partial('page/404') %>
<% } else { %>
    <%- partial('_partial/article', { item: page, isPage: true } ) %>
<% } %>
```

---

## 11. 构建与部署

### 11.1 常用命令

```bash
# 安装依赖
npm install

# 本地预览
npm run server
# 或
hexo server

# 生成静态文件
npm run build
# 或
hexo generate

# 清理缓存
npm run clean
# 或
hexo clean

# 部署
npm run deploy
# 或
hexo deploy
```

### 11.2 依赖包

```json
{
  "hexo": "^8.0.0",
  "hexo-generator-archive": "^2.0.0",
  "hexo-generator-category": "^2.0.0",
  "hexo-generator-index": "^4.0.0",
  "hexo-generator-json-content": "^4.2.3",
  "hexo-generator-tag": "^2.0.0",
  "hexo-renderer-ejs": "^2.0.0",
  "hexo-renderer-marked": "^7.0.0",
  "hexo-renderer-sass": "^0.5.0",
  "hexo-renderer-stylus": "^3.0.1",
  "hexo-server": "^3.0.0",
  "sass": "^1.99.0"
}
```

---

## 12. 扩展开发指南

### 12.1 添加新的侧边栏小部件

1. 在 `layout/_widget/` 创建新的 EJS 文件
2. 在 `layout/_partial/sidebar.ejs` 中引入
3. 在主题 `_config.yml` 的 `sidebar` 配置中添加开关

### 12.2 添加新的页面模板

1. 在 `layout/page/` 创建新的 EJS 文件
2. 在 `layout/page.ejs` 中添加判断条件
3. 创建对应的 Markdown 文件（Front-matter 中设置 `title`）

### 12.3 修改主题配置

编辑 `themes/hexo-theme-gal/_config.yml`，修改后需重新生成：
```bash
hexo clean && hexo generate
```

### 12.4 添加自定义 CSS

编辑 `themes/hexo-theme-gal/source/css/style.css`，添加自定义样式。

### 12.5 添加自定义 JavaScript

1. 在 `themes/hexo-theme-gal/source/js/` 创建 JS 文件
2. 在 `layout/layout.ejs` 底部引入

---

## 13. 注意事项

### 13.1 安全问题

- **Gitment OAuth 配置**：`client_secret` 暴露在客户端，建议：
  - 使用服务端代理处理 OAuth 流程
  - 或更换为其他评论系统（如 Valine、Waline）

### 13.2 性能优化

- 背景图使用压缩后的图片
- 开启 Hexo 的缓存功能
- 考虑使用 CDN 加速静态资源

### 13.3 兼容性

- 主题使用 Bootstrap 3，支持 IE9+
- 部分特效（如 AOS）在旧版浏览器可能不生效
- 移动端有专门的适配样式

---

## 14. 文件索引

### 14.1 核心模板文件

| 文件 | 功能 |
|------|------|
| `layout/layout.ejs` | 基础布局 |
| `layout/index.ejs` | 首页 |
| `layout/post.ejs` | 文章页 |
| `layout/page.ejs` | 自定义页面 |
| `layout/_partial/head.ejs` | HTML Head |
| `layout/_partial/header.ejs` | 导航栏 |
| `layout/_partial/footer.ejs` | 页脚 |
| `layout/_partial/sidebar.ejs` | 侧边栏容器 |
| `layout/_partial/article.ejs` | 文章详情 |
| `layout/_partial/excerpt.ejs` | 文章摘要 |
| `layout/_partial/pagination.ejs` | 分页 |

### 14.2 核心脚本文件

| 文件 | 功能 |
|------|------|
| `source/js/blog.js` | 核心交互 |
| `source/js/page-transition.js` | 无刷新转场 |
| `source/js/hs.js` | 图片灯箱 |
| `source/js/oni.js` | 右键菜单 |
| `source/js/comment/leancloud.js` | 文章统计 |
| `source/js/comment/gitment.js` | 评论系统 |

### 14.3 配置文件

| 文件 | 功能 |
|------|------|
| `_config.yml` | Hexo 全局配置 |
| `themes/hexo-theme-gal/_config.yml` | 主题配置 |
| `package.json` | 项目依赖 |

---

*文档生成时间：2026-05-18*
*主题版本：1.0.0*
*Hexo 版本：8.1.1*
