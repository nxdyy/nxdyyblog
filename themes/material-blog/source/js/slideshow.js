/**
 * slideshow.js - 背景幻灯片初始化
 * 从 window.slideConfig 读取配置, 随机选取 6 张图片设置为背景
 */
(function () {
  'use strict';

  function initSlideshow() {
    var config = window.slideConfig;
    if (!config || !config.prefix || !config.maxCount) return;

    var prefix = config.prefix;
    var ext = '.' + config.ext;
    var maxCount = parseInt(config.maxCount, 10);

    if (isNaN(maxCount) || maxCount < 1) return;

    // 随机选取 6 张不重复的图片
    var slideList = [];
    var pickCount = Math.min(6, maxCount);
    while (slideList.length < pickCount) {
      var n = Math.floor(Math.random() * maxCount) + 1;
      if (slideList.indexOf(n) === -1) {
        slideList.push(n);
      }
    }

    // 设置背景图片到 .cb-slideshow li span 元素
    var spans = document.querySelectorAll('.cb-slideshow li span');
    spans.forEach((span, i) => {
      if (i < slideList.length) {
        span.style.backgroundImage = `url('${prefix}${slideList[i]}${ext}')`;
      }
    });
  }

  // DOMContentLoaded 时初始化
  document.addEventListener('DOMContentLoaded', initSlideshow);

  // SPA 导航后重新初始化 (背景图不需要重复设置, 但保留事件以防万一)
  document.addEventListener('spa:ContentLoaded', () => {
    // 背景幻灯片通常在页面级别保持不变, 不需要重新初始化
    // 但如果需要动态更新, 可在此处调用 initSlideshow()
  });

})();
