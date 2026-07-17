/**
 * Material Web 组件初始化
 * 在 DOMContentLoaded 和每次 SPA 导航后重新初始化
 * 功能：md-menu、md-tabs、md-select 初始化，涟漪效果，移动端导航抽屉，侧边栏面板
 */
(function () {
  'use strict';

  /**
   * 初始化 md-menu 组件
   * 将带有 anchor 属性的 md-menu 与对应的锚点元素关联
   */
  function initMenus() {
    var menus = document.querySelectorAll('md-menu');
    menus.forEach(function (menu) {
      var anchorId = menu.getAttribute('anchor');
      if (!anchorId) return;
      var anchor = document.getElementById(anchorId);
      if (!anchor) return;

      // 移除旧的事件监听（通过标记避免重复绑定）
      if (anchor.dataset.menuInit) return;
      anchor.dataset.menuInit = 'true';

      anchor.addEventListener('click', function (e) {
        e.stopPropagation();
        menu.open = !menu.open;
      });
    });
  }

  /**
   * 初始化 md-tabs 组件
   * 设置 tab 切换时的内容面板联动
   */
  function initTabs() {
    var tabContainers = document.querySelectorAll('md-tabs');
    tabContainers.forEach(function (tabsEl) {
      // 如果已经绑定过则跳过
      if (tabsEl.dataset.tabsInit) return;
      tabsEl.dataset.tabsInit = 'true';

      var tabs = tabsEl.querySelectorAll('md-tab, md-primary-tab, md-secondary-tab');
      if (tabs.length === 0) return;

      // 查找相邻的内容面板
      var parent = tabsEl.parentElement;
      if (!parent) return;
      var panels = parent.querySelectorAll('.tab-panel');
      if (panels.length === 0) return;

      function activatePanel(index) {
        panels.forEach(function (panel, i) {
          panel.style.display = (i === index) ? '' : 'none';
        });
      }

      tabs.forEach(function (tab, index) {
        tab.addEventListener('click', function () {
          activatePanel(index);
        });
      });

      // 默认激活第一个
      activatePanel(0);
    });
  }

  /**
   * 初始化 md-select 组件
   */
  function initSelects() {
    var selects = document.querySelectorAll('md-select, md-filled-select, md-outlined-select');
    selects.forEach(function (select) {
      if (select.dataset.selectInit) return;
      select.dataset.selectInit = 'true';

      select.addEventListener('change', function (e) {
        // 触发自定义事件供外部监听
        var event = new CustomEvent('material-select-change', {
          detail: { value: e.target.value },
          bubbles: true
        });
        select.dispatchEvent(event);
      });
    });
  }

  /**
   * 设置涟漪效果
   * 为可点击元素添加 md-ripple
   */
  function initRipple() {
    var clickables = document.querySelectorAll(
      '.nav-item, .drawer-nav-item, .sidebar-widget-header, .article-card, .back-to-top'
    );
    clickables.forEach(function (el) {
      if (el.dataset.rippleInit) return;
      el.dataset.rippleInit = 'true';

      // 检查是否已有 ripple 子元素
      if (el.querySelector('md-ripple')) return;

      // 创建 md-ripple 元素
      var ripple = document.createElement('md-ripple');
      el.style.position = el.style.position || 'relative';
      el.style.overflow = el.style.overflow || 'hidden';
      el.appendChild(ripple);
    });
  }

  /**
   * 移动端导航抽屉
   */
  function initMobileDrawer() {
    var drawer = document.getElementById('mobile-drawer');
    var menuBtn = document.getElementById('mobile-menu-btn');

    if (!drawer || !menuBtn) return;

    // 避免重复绑定
    if (drawer.dataset.drawerInit) return;
    drawer.dataset.drawerInit = 'true';

    // 打开抽屉
    menuBtn.addEventListener('click', function () {
      drawer.open = !drawer.open;
    });

    // 关闭抽屉
    drawer.addEventListener('close', function () {
      drawer.open = false;
    });

    // 点击导航项后关闭抽屉
    var drawerNavItems = drawer.querySelectorAll('.drawer-nav-item');
    drawerNavItems.forEach(function (item) {
      item.addEventListener('click', function () {
        // 延迟关闭，让导航先完成
        setTimeout(function () {
          drawer.open = false;
        }, 150);
      });
    });
  }

  /**
   * 侧边栏面板切换/关闭按钮
   */
  function initSidebarPanel() {
    var toggleBtns = document.querySelectorAll('.sidebar-toggle-btn');
    var closeBtns = document.querySelectorAll('.sidebar-close-btn');

    toggleBtns.forEach(function (btn) {
      if (btn.dataset.sidebarInit) return;
      btn.dataset.sidebarInit = 'true';

      btn.addEventListener('click', function () {
        var targetId = btn.getAttribute('data-target');
        if (!targetId) return;
        var panel = document.getElementById(targetId);
        if (panel) {
          panel.classList.toggle('open');
        }
      });
    });

    closeBtns.forEach(function (btn) {
      if (btn.dataset.sidebarInit) return;
      btn.dataset.sidebarInit = 'true';

      btn.addEventListener('click', function () {
        var panel = btn.closest('.sidebar-panel');
        if (panel) {
          panel.classList.remove('open');
        }
      });
    });
  }

  /**
   * 导航下拉菜单切换（非 Material Web 的自定义下拉）
   */
  function initNavDropdowns() {
    // 点击页面其他地方关闭所有下拉菜单
    document.addEventListener('click', function (e) {
      var openMenus = document.querySelectorAll('md-menu[open]');
      openMenus.forEach(function (menu) {
        // 如果点击的不是菜单内部，则关闭
        if (!menu.contains(e.target)) {
          var anchorId = menu.getAttribute('anchor');
          var anchor = anchorId ? document.getElementById(anchorId) : null;
          if (!anchor || !anchor.contains(e.target)) {
            menu.open = false;
          }
        }
      });
    });
  }

  /**
   * 回到顶部按钮
   */
  function initBackToTop() {
    var btn = document.querySelector('.back-to-top');
    if (!btn) return;

    if (btn.dataset.backToTopInit) return;
    btn.dataset.backToTopInit = 'true';

    // 滚动显示/隐藏
    var scrollThreshold = 300;
    var ticking = false;

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          if (window.scrollY > scrollThreshold) {
            btn.classList.add('visible');
          } else {
            btn.classList.remove('visible');
          }
          ticking = false;
        });
        ticking = true;
      }
    });

    // 点击回到顶部
    btn.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  /**
   * 暗色模式切换
   */
  function initThemeToggle() {
    var toggle = document.querySelector('.theme-toggle-btn');
    if (!toggle) return;

    if (toggle.dataset.themeToggleInit) return;
    toggle.dataset.themeToggleInit = 'true';

    toggle.addEventListener('click', function () {
      document.body.classList.toggle('dark-theme');
      var isDark = document.body.classList.contains('dark-theme');
      try {
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
      } catch (e) { /* ignore */ }
    });

    // 从 localStorage 恢复
    try {
      var saved = localStorage.getItem('theme');
      if (saved === 'dark') {
        document.body.classList.add('dark-theme');
      } else if (saved === 'light') {
        document.body.classList.remove('dark-theme');
      }
    } catch (e) { /* ignore */ }
  }

  /**
   * 主初始化函数
   */
  function initMaterial() {
    initMenus();
    initTabs();
    initSelects();
    initRipple();
    initMobileDrawer();
    initSidebarPanel();
    initNavDropdowns();
    initBackToTop();
    initThemeToggle();
  }

  // 初始加载
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMaterial);
  } else {
    initMaterial();
  }

  // SPA 导航后重新初始化
  document.addEventListener('spa:ContentLoaded', function () {
    // 重置初始化标记，允许重新绑定
    var initialized = document.querySelectorAll(
      '[data-menu-init], [data-tabs-init], [data-select-init], ' +
      '[data-ripple-init], [data-drawer-init], [data-sidebar-init], ' +
      '[data-back-to-top-init], [data-theme-toggle-init]'
    );
    initialized.forEach(function (el) {
      delete el.dataset.menuInit;
      delete el.dataset.tabsInit;
      delete el.dataset.selectInit;
      delete el.dataset.rippleInit;
      delete el.dataset.drawerInit;
      delete el.dataset.sidebarInit;
      delete el.dataset.backToTopInit;
      delete el.dataset.themeToggleInit;
    });

    initMaterial();
  });

})();
