/**
 * SPA Router - 无刷新页面路由
 * 使用 fetch() 加载页面, 替换 DOM 内容, 管理浏览器历史
 */
(function () {
  'use strict';

  var transitionConfig = window.pageTransition || { enable: false, animation: 'fade', duration: 300 };

  // 即使未启用转场, 也注册 SPA 路由 (用于全站功能)
  var isTransitioning = false;

  // ---- 加载指示器 ----
  function showLoader() {
    var loader = document.getElementById('page-loader');
    if (loader) {
      loader.style.display = 'block';
      loader.classList.remove('loaded');
    }
    document.body.classList.add('page-transitioning');
  }

  function hideLoader() {
    var loader = document.getElementById('page-loader');
    if (loader) {
      loader.classList.add('loaded');
      setTimeout(() => {
        loader.style.display = 'none';
      }, 500);
    }
    document.body.classList.remove('page-transitioning');
  }

  // ---- 过渡动画 ----
  function animateOut(el, callback) {
    if (!transitionConfig.enable) {
      callback();
      return;
    }
    var duration = transitionConfig.duration || 300;
    var animation = transitionConfig.animation || 'fade';

    requestAnimationFrame(() => {
      if (animation === 'fade') {
        el.style.transition = `opacity ${duration}ms ease`;
        el.style.opacity = '0';
        setTimeout(callback, duration);
      } else if (animation === 'slide') {
        el.style.transition = `transform ${duration}ms ease, opacity ${duration}ms ease`;
        el.style.opacity = '0';
        el.style.transform = 'translateX(-50px)';
        setTimeout(callback, duration);
      } else if (animation === 'scale') {
        el.style.transition = `transform ${duration}ms ease, opacity ${duration}ms ease`;
        el.style.opacity = '0';
        el.style.transform = 'scale(0.95)';
        setTimeout(callback, duration);
      } else {
        callback();
      }
    });
  }

  function animateIn(el, callback) {
    if (!transitionConfig.enable) {
      callback();
      return;
    }
    var duration = transitionConfig.duration || 300;
    var animation = transitionConfig.animation || 'fade';

    requestAnimationFrame(() => {
      if (animation === 'fade') {
        el.style.opacity = '0';
        el.style.transition = `opacity ${duration}ms ease`;
        requestAnimationFrame(() => {
          el.style.opacity = '1';
          setTimeout(callback, duration);
        });
      } else if (animation === 'slide') {
        el.style.opacity = '0';
        el.style.transform = 'translateX(50px)';
        el.style.transition = `transform ${duration}ms ease, opacity ${duration}ms ease`;
        requestAnimationFrame(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateX(0)';
          setTimeout(callback, duration);
        });
      } else if (animation === 'scale') {
        el.style.opacity = '0';
        el.style.transform = 'scale(0.9)';
        el.style.transition = `transform ${duration}ms ease, opacity ${duration}ms ease`;
        requestAnimationFrame(() => {
          el.style.opacity = '1';
          el.style.transform = 'scale(1)';
          setTimeout(callback, duration);
        });
      } else {
        callback();
      }
    });
  }

  // ---- 获取页面内容 ----
  function fetchPageContent(url) {
    return new Promise((resolve, reject) => {
      showLoader();
      fetch(url, { credentials: 'same-origin' })
        .then(response => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return response.text();
        })
        .then(html => {
          hideLoader();
          var parser = new DOMParser();
          var doc = parser.parseFromString(html, 'text/html');
          var mainstay = doc.querySelector('#mainstay');
          var sidebar = doc.querySelector('#sidebar');
          var title = doc.querySelector('title');
          resolve({
            main: mainstay ? mainstay.innerHTML : null,
            sidebar: sidebar ? sidebar.innerHTML : null,
            title: title ? title.textContent : document.title,
            doc: doc
          });
        })
        .catch(err => {
          hideLoader();
          reject(err);
        });
    });
  }

  // ---- 触发自定义事件 ----
  function emitEvent(name, detail) {
    document.dispatchEvent(new CustomEvent(name, { detail: detail || {} }));
  }

  // ---- 更新导航栏高亮 ----
  function updateNavActive(url) {
    var path = url.replace(window.location.origin, '').replace(/^\//, '').replace(/\/$/, '');
    var navItems = document.querySelectorAll('.header-nav .nav-item');
    navItems.forEach(function(item) {
      item.classList.remove('active');
      var href = item.getAttribute('href');
      if (!href) return;
      var navPath = href.replace(/^\//, '').replace(/\/$/, '');
      if ((navPath === '' && (path === '' || path === 'index.html')) ||
          (navPath !== '' && path.indexOf(navPath) !== -1)) {
        item.classList.add('active');
      }
    });
  }

  // ---- 重新初始化 (SPA 导航后) ----
  function reinitialize(detail) {
    // 更新导航栏高亮
    if (detail && detail.url) {
      updateNavActive(detail.url);
    }

    // 重新初始化 AOS
    try {
      if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 1000, delay: 0, easing: 'ease-out-back' });
      }
    } catch (e) { /* ignore */ }

    // 触发 ContentLoaded 事件, 让各模块自行重新初始化
    emitEvent('spa:ContentLoaded', detail);
  }

  // ---- 核心导航函数 ----
  function navigateTo(url, pushState) {
    if (isTransitioning) return;

    var currentUrl = window.location.href;
    // 比较时忽略 hash
    var currentPath = window.location.pathname + window.location.search;
    var targetPath = url.replace(window.location.origin, '');
    if (targetPath === currentPath || targetPath === window.location.href) return;

    isTransitioning = true;

    // 触发 BeforeNavigate 事件
    emitEvent('spa:BeforeNavigate', { url: url });

    if (pushState !== false) {
      history.pushState({ url: url }, '', url);
    }

    var mainstay = document.getElementById('mainstay');
    var sidebar = document.getElementById('sidebar');

    animateOut(mainstay, () => {
      fetchPageContent(url)
        .then(data => {
          document.title = data.title;

          if (mainstay && data.main !== null) {
            mainstay.innerHTML = data.main;
          }
          if (sidebar && data.sidebar !== null) {
            sidebar.innerHTML = data.sidebar;
          }

          animateIn(mainstay, () => {
            isTransitioning = false;

            // 滚动到顶部
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // 触发 AfterNavigate 事件
            emitEvent('spa:AfterNavigate', { url: url });

            // 重新初始化各模块
            reinitialize({ url: url });
          });
        })
        .catch(() => {
          // 请求失败时回退到普通页面加载
          isTransitioning = false;
          window.location.href = url;
        });
    });
  }

  // ---- 链接过滤 ----
  function shouldIntercept(link) {
    var href = link.getAttribute('href');
    if (!href) return false;
    if (href === '#') return false;
    if (link.target === '_blank') return false;
    if (link.hasAttribute('download')) return false;
    if (link.dataset.toggle || link.dataset.hover) return false;
    if (href.startsWith('#')) return false;
    if (href.startsWith('javascript')) return false;
    if (href.startsWith('mailto:')) return false;
    if (href.startsWith('tel:')) return false;

    // 判断是否为内部链接
    if (href.startsWith('/')) return true;
    if (href.startsWith(window.location.origin)) return true;
    return false;
  }

  // ---- 事件监听 ----

  // 拦截内部链接点击
  document.addEventListener('click', (e) => {
    // 查找最近的 <a> 元素
    var link = e.target.closest('a');
    if (!link) return;
    if (!shouldIntercept(link)) return;

    e.preventDefault();
    var href = link.getAttribute('href');
    // 补全相对路径
    if (href.startsWith('/')) {
      href = window.location.origin + href;
    }
    navigateTo(href, true);
  });

  // 浏览器前进/后退
  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.url) {
      navigateTo(e.state.url, false);
    } else if (window.location.href) {
      navigateTo(window.location.href, false);
    }
  });

  // 初始状态保存
  if (!history.state) {
    history.replaceState({ url: window.location.href }, '', window.location.href);
  }

})();
