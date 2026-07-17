/**
 * 欧尼酱右键菜单 (Vanilla JS 版本)
 * 拦截右键菜单事件，显示圆形菜单
 * 仅在 window.oniConfig 配置存在时激活
 */
(function () {
  'use strict';

  // 检查配置
  if (!window.oniConfig) return;

  var BOUNDARY = 150;
  var MENU_SIZE = 300;
  var menu = null;
  var circle = null;
  var audio = null;
  var isOpen = false;

  /**
   * 注入样式
   */
  function injectStyles() {
    if (document.getElementById('oni-menu-styles')) return;
    var style = document.createElement('style');
    style.id = 'oni-menu-styles';
    style.textContent = [
      '.oni-menu {',
      '  position: fixed;',
      '  z-index: 10000;',
      '  display: none;',
      '  opacity: 0;',
      '  transition: opacity 0.15s ease;',
      '}',

      '.oni-menu.visible {',
      '  display: block;',
      '  opacity: 1;',
      '}',

      '.oni-circle {',
      '  position: relative;',
      '  width: ' + MENU_SIZE + 'px;',
      '  height: ' + MENU_SIZE + 'px;',
      '  border-radius: 50%;',
      '  background: rgba(30, 30, 30, 0.85);',
      '  backdrop-filter: blur(12px);',
      '  -webkit-backdrop-filter: blur(12px);',
      '  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);',
      '  border: 1px solid rgba(255, 255, 255, 0.1);',
      '}',

      '.oni-circle .oni-ring {',
      '  position: relative;',
      '  width: 100%;',
      '  height: 100%;',
      '}',

      '.oni-circle.open .oni-ring {',
      '  animation: oni-ring-open 0.4s ease forwards;',
      '}',

      '@keyframes oni-ring-open {',
      '  from { transform: scale(0.5); opacity: 0; }',
      '  to { transform: scale(1); opacity: 1; }',
      '}',

      '.oni-menu-item {',
      '  position: absolute;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  width: 70px;',
      '  height: 70px;',
      '  border-radius: 50%;',
      '  text-decoration: none;',
      '  color: #ffffff;',
      '  font-size: 14px;',
      '  font-weight: 500;',
      '  font-family: var(--md-sys-typescale-label-large-font, "Roboto", "Noto Sans SC", sans-serif);',
      '  transform: translate(-50%, -50%);',
      '  transition: all 0.2s ease;',
      '  text-align: center;',
      '  line-height: 1.2;',
      '  cursor: pointer;',
      '}',

      '.oni-menu-item:hover {',
      '  background: rgba(255, 255, 255, 0.15);',
      '  transform: translate(-50%, -50%) scale(1.1);',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  /**
   * 创建菜单 DOM
   */
  function createMenu() {
    if (menu) return;

    injectStyles();

    menu = document.createElement('div');
    menu.className = 'oni-menu';

    circle = document.createElement('div');
    circle.className = 'oni-circle';
    circle.id = 'oni-circle';

    var ring = document.createElement('div');
    ring.className = 'oni-ring';

    // 菜单项配置
    var items = window.oniConfig.items || [
      { title: '首页', url: '/' },
      { title: '归档', url: '/archives' },
      { title: '关于', url: '/about' }
    ];

    // 菜单项位置 (6个位置围绕圆形)
    var positions = [
      { left: '50%', top: '15%' },
      { left: '80.3%', top: '32.5%' },
      { left: '80.3%', top: '67.5%' },
      { left: '50%', top: '85%' },
      { left: '19.7%', top: '67.5%' },
      { left: '19.7%', top: '32.5%' }
    ];

    items.forEach(function (item, index) {
      if (index >= positions.length) return;
      var a = document.createElement('a');
      a.className = 'oni-menu-item';
      a.href = item.url || '#';
      a.textContent = item.title || '';
      a.style.left = positions[index].left;
      a.style.top = positions[index].top;
      ring.appendChild(a);
    });

    circle.appendChild(ring);

    // 音频
    if (window.oniConfig.audio) {
      audio = document.createElement('audio');
      audio.id = 'oni-audio';
      audio.src = window.oniConfig.audio;
      circle.appendChild(audio);
    }

    menu.appendChild(circle);
    document.body.appendChild(menu);
  }

  /**
   * 显示菜单
   */
  function showMenu(x, y) {
    if (!menu) createMenu();

    var docEl = document.documentElement;
    var clientHeight = docEl.clientHeight;
    var clientWidth = docEl.clientWidth;

    var top = y - BOUNDARY;
    var left = x - BOUNDARY;

    // 边界检测
    if (top < 0) top = 0;
    if (clientHeight - y < BOUNDARY) top = clientHeight - MENU_SIZE;
    if (left < 0) left = 0;
    if (clientWidth - x < BOUNDARY) left = clientWidth - MENU_SIZE;

    menu.style.top = top + 'px';
    menu.style.left = left + 'px';
    menu.style.display = 'block';

    // 触发动画
    requestAnimationFrame(function () {
      menu.style.opacity = '1';
      circle.classList.add('open');
    });

    // 播放音效
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(function () { /* 自动播放被阻止 */ });
    }

    isOpen = true;
  }

  /**
   * 隐藏菜单
   */
  function hideMenu() {
    if (!menu || !isOpen) return;

    menu.style.opacity = '0';
    circle.classList.remove('open');

    setTimeout(function () {
      if (menu) menu.style.display = 'none';
    }, 150);

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    isOpen = false;
  }

  // 监听右键菜单事件
  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    e.stopPropagation();

    var clickX = e.clientX;
    var clickY = e.clientY;

    // 兼容性：计算 pageX
    var pageX = e.pageX || (clickX + (document.documentElement.scrollLeft || document.body.scrollLeft));
    var pageY = e.pageY || (clickY + (document.documentElement.scrollTop || document.body.scrollTop));

    showMenu(pageX, pageY);
  });

  // 点击其他区域关闭菜单
  document.addEventListener('mousedown', function (e) {
    if (!isOpen) return;
    // 左键或中键点击非菜单区域
    if (e.button !== 2 && menu && !menu.contains(e.target)) {
      hideMenu();
    }
  });

  // ESC 键关闭
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) {
      hideMenu();
    }
  });

})();
