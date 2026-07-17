/**
 * 页面转场动画
 * 配合 router.js 的 SPA 导航事件实现无刷新页面切换效果
 * 支持动画类型: fade, slide, scale
 * 通过 window.pageTransition 配置: { enable, animation, duration }
 */
(function () {
  'use strict';

  var config = window.pageTransition || {};
  if (!config.enable) return;

  var ANIMATION = config.animation || 'fade';
  var DURATION = config.duration || 300;

  /**
   * 注入转场动画样式
   */
  function injectStyles() {
    if (document.getElementById('page-transition-styles')) return;
    var style = document.createElement('style');
    style.id = 'page-transition-styles';
    style.textContent = [
      /* 淡入淡出 */
      '@keyframes pt-fade-out {',
      '  from { opacity: 1; }',
      '  to { opacity: 0; }',
      '}',

      '@keyframes pt-fade-in {',
      '  from { opacity: 0; }',
      '  to { opacity: 1; }',
      '}',

      /* 滑动 */
      '@keyframes pt-slide-out {',
      '  from { opacity: 1; transform: translateY(0); }',
      '  to { opacity: 0; transform: translateY(-20px); }',
      '}',

      '@keyframes pt-slide-in {',
      '  from { opacity: 0; transform: translateY(20px); }',
      '  to { opacity: 1; transform: translateY(0); }',
      '}',

      /* 缩放 */
      '@keyframes pt-scale-out {',
      '  from { opacity: 1; transform: scale(1); }',
      '  to { opacity: 0; transform: scale(0.95); }',
      '}',

      '@keyframes pt-scale-in {',
      '  from { opacity: 0; transform: scale(1.05); }',
      '  to { opacity: 1; transform: scale(1); }',
      '}',

      /* 应用动画的类 */
      '.pt-leave {',
      '  animation-fill-mode: forwards;',
      '  animation-timing-function: ease;',
      '}',

      '.pt-enter {',
      '  animation-fill-mode: forwards;',
      '  animation-timing-function: ease;',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  /**
   * 获取动画名称
   */
  function getAnimationName(type, phase) {
    var prefix = 'pt-';
    switch (ANIMATION) {
      case 'slide':
        return prefix + 'slide-' + phase;
      case 'scale':
        return prefix + 'scale-' + phase;
      case 'fade':
      default:
        return prefix + 'fade-' + phase;
    }
  }

  /**
   * 执行离开动画
   */
  function animateOut(element) {
    return new Promise(function (resolve) {
      var animName = getAnimationName(ANIMATION, 'out');
      element.style.animationDuration = DURATION + 'ms';
      element.style.animationName = animName;
      element.classList.add('pt-leave');

      function onEnd() {
        element.removeEventListener('animationend', onEnd);
        element.classList.remove('pt-leave');
        element.style.animationName = '';
        element.style.animationDuration = '';
        resolve();
      }

      element.addEventListener('animationend', onEnd);

      // 安全超时
      setTimeout(resolve, DURATION + 50);
    });
  }

  /**
   * 执行进入动画
   */
  function animateIn(element) {
    return new Promise(function (resolve) {
      var animName = getAnimationName(ANIMATION, 'in');
      element.style.animationDuration = DURATION + 'ms';
      element.style.animationName = animName;
      element.classList.add('pt-enter');

      function onEnd() {
        element.removeEventListener('animationend', onEnd);
        element.classList.remove('pt-enter');
        element.style.animationName = '';
        element.style.animationDuration = '';
        resolve();
      }

      element.addEventListener('animationend', onEnd);

      // 安全超时
      setTimeout(resolve, DURATION + 50);
    });
  }

  /**
   * 获取主内容区域
   */
  function getMainContent() {
    return document.getElementById('mainstay');
  }

  // 监听 SPA 导航前事件 - 执行离开动画
  document.addEventListener('spa:BeforeNavigate', function () {
    var main = getMainContent();
    if (!main) return;

    // 以同步方式设置样式，异步等待动画完成
    var animName = getAnimationName(ANIMATION, 'out');
    main.style.animationDuration = DURATION + 'ms';
    main.style.animationName = animName;
    main.classList.add('pt-leave');
  });

  // 监听 SPA 内容加载完成事件 - 执行进入动画
  document.addEventListener('spa:ContentLoaded', function () {
    var main = getMainContent();
    if (!main) return;

    // 清除离开动画状态
    main.classList.remove('pt-leave');
    main.style.animationName = '';
    main.style.animationDuration = '';

    // 执行进入动画
    animateIn(main);
  });

  // 初始化样式
  injectStyles();

})();
