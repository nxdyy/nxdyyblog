/**
 * blog.js - 核心博客功能
 * 侧边栏面板、Tab切换、回到顶部、搜索验证、Material Web 重新初始化
 */
(function () {
  'use strict';

  // ============================================================
  //  搜索表单验证
  // ============================================================
  function initSearchForm() {
    var searchForm = document.querySelector('#search-form');
    if (!searchForm) return;

    searchForm.querySelectorAll('.btn-gal, [type="submit"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        var input = btn.closest('form')
          ? btn.closest('form').querySelector('input[type="search"], input[type="text"]')
          : btn.previousElementSibling;
        if (input && !input.value.trim()) {
          e.preventDefault();
          input.focus();
        }
      });
    });
  }

  // ============================================================
  //  侧边栏面板 折叠/展开 & 关闭
  // ============================================================
  function initPanelToggles() {
    document.querySelectorAll('.panel-toggle').forEach(toggle => {
      // 移除旧监听 (SPA 重复初始化时)
      var newToggle = toggle.cloneNode(true);
      toggle.parentNode.replaceChild(newToggle, toggle);

      newToggle.addEventListener('click', () => {
        var panel = newToggle.closest('.panel-gal');
        if (!panel) return;
        if (newToggle.classList.contains('fa-chevron-circle-up')) {
          newToggle.classList.remove('fa-chevron-circle-up');
          newToggle.classList.add('fa-chevron-circle-down');
          panel.classList.add('toggled');
        } else {
          newToggle.classList.remove('fa-chevron-circle-down');
          newToggle.classList.add('fa-chevron-circle-up');
          panel.classList.remove('toggled');
        }
      });
    });

    document.querySelectorAll('.panel-remove').forEach(removeBtn => {
      var newBtn = removeBtn.cloneNode(true);
      removeBtn.parentNode.replaceChild(newBtn, removeBtn);

      newBtn.addEventListener('click', () => {
        var panel = newBtn.closest('.panel');
        if (!panel) return;
        // 淡出动画
        panel.style.transition = 'opacity 1s ease';
        panel.style.opacity = '0';
        setTimeout(() => {
          panel.style.display = 'none';
        }, 1000);
      });
    });
  }

  // ============================================================
  //  侧边栏 Tab 切换
  // ============================================================
  function initSidebarTabs() {
    var tabs = document.querySelectorAll('#sidebar-tabs md-tab');
    var panels = document.querySelectorAll('#sidebar-tabs .tab-panel');
    if (!tabs.length || !panels.length) return;

    function activatePanel(index) {
      panels.forEach((panel, i) => {
        panel.style.display = (i === index) ? '' : 'none';
      });
    }

    tabs.forEach((tab, index) => {
      // 移除旧监听
      var newTab = tab.cloneNode(true);
      tab.parentNode.replaceChild(newTab, tab);

      newTab.addEventListener('click', () => {
        activatePanel(index);
      });
    });

    // 重新获取 (cloneNode 后引用变化)
    var freshTabs = document.querySelectorAll('#sidebar-tabs md-tab');
    // 默认显示第一个
    activatePanel(0);
  }

  // ============================================================
  //  回到顶部按钮
  // ============================================================
  function initBackToTop() {
    var backToTop = document.getElementById('back-to-top');
    if (!backToTop) return;

    var ticking = false;
    var scrollThreshold = 200;

    function updateVisibility() {
      if (window.scrollY > scrollThreshold) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
      ticking = false;
    }

    // 使用 requestAnimationFrame 优化滚动性能
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateVisibility);
        ticking = true;
      }
    });

    // 点击平滑回顶
    var fab = backToTop.querySelector('md-fab');
    if (fab) {
      fab.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // 初始检查
    updateVisibility();
  }

  // ============================================================
  //  Material Web 组件重新初始化 (SPA 导航后)
  // ============================================================
  function reinitMaterialComponents() {
    // 重新初始化 Material Web ripple 效果
    document.querySelectorAll('[md-ripple]').forEach(el => {
      if (typeof el.ripple !== 'undefined') {
        try { el.ripple = true; } catch (e) { /* ignore */ }
      }
    });

    // Material Web menu 重新绑定
    document.querySelectorAll('md-menu').forEach(menu => {
      try {
        if (menu.open) menu.open = false;
      } catch (e) { /* ignore */ }
    });
  }

  // ============================================================
  //  移动端抽屉初始化
  // ============================================================
  function initMobileDrawer() {
    var drawer = document.getElementById('mobile-drawer');
    if (!drawer) return;

    // SPA 导航后重新监听关闭事件
    drawer.addEventListener('close', () => {
      drawer.open = false;
    });
  }

  // ============================================================
  //  统一初始化入口
  // ============================================================
  function initializeAll() {
    initSearchForm();
    initPanelToggles();
    initSidebarTabs();
    initBackToTop();
    initMobileDrawer();
    reinitMaterialComponents();
  }

  // DOMContentLoaded 时初始化
  document.addEventListener('DOMContentLoaded', initializeAll);

  // SPA 导航完成后重新初始化
  document.addEventListener('spa:ContentLoaded', () => {
    // 延迟一帧确保 DOM 已更新
    requestAnimationFrame(initializeAll);
  });

})();
