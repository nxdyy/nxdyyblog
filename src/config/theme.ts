/** 主题配置 —— 从 Hexo material-blog 主题 _config.yml 迁移 */

export interface MenuItem {
  title: string;
  icon: string;
  url: string;
  /** 下拉菜单最大条目数（仅分类/标签） */
  dropdown?: number;
}

export const theme = {
  /** 顶部导航 */
  menu: [
    { title: '首页', icon: 'home', url: '/' },
    { title: '归档', icon: 'archive', url: '/archives/' },
    { title: '分类', icon: 'list', url: '/categories/', dropdown: 3 },
    { title: '标签', icon: 'label', url: '/tags/', dropdown: 3 },
    { title: '关于我', icon: 'person', url: '/about/' },
    { title: '开源许可', icon: 'gavel', url: '/license/' },
  ] as MenuItem[],

  /** 侧边栏开关 */
  sidebar: {
    recent_posts: true,
    tags: true,
    links: true,
  },

  /** 个人链接 */
  links: [{ name: 'Github', link: 'https://github.com/nxdyy/' }],

  /** 文章默认封面（按标题哈希确定性地选取） */
  default_preview: ['preview1.webp', 'preview2.webp', 'preview3.webp', 'preview4.webp'],

  /** 背景轮播图 */
  slide_background: { prefix: '/imgs/slide/background', ext: 'webp', max_count: 6 },

  /** 公告横幅（首页顶部，可关闭） */
  issue: {
    enable: true,
    html: '欢迎来到 nxdyy 的摆烂小站！博客已迁移至 Astro + Material 3 Expressive。',
  },

  /** Shiki 代码块增强 */
  shiki: {
    line_numbers: true,
    copy_button: true,
    height_limit: 600,
  },

  /** 页面转场 */
  page_transition: { animation: 'fade' as 'fade' | 'slide' | 'scale', duration: 300 },

  /** 自定义页脚（ICP 备案） */
  custom_footer:
    "<a href='https://beian.miit.gov.cn/' target='_blank'>晋ICP备2026006275号-1</a> | <span style=\"display: inline-flex; align-items: center; vertical-align: middle;\"><img src=\"/imgs/TB1..50QpXXXXX7XpXXXXXXXXXX-40-40.png\" width=\"20\" style=\"margin-right: 5px;\" />  <a href=\"https://beian.mps.gov.cn/#/query/webSearch?code=14010502990640\" rel=\"noreferrer\" target=\"_blank\">晋公网安备14010502990640号</a></span>",
};
