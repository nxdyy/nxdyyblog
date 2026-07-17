/**
 * bookmark.js - 文章书签/目录功能
 * 从文章标题构建浮动 TOC 面板, 支持点击跳转、最小化、拖拽、滚动高亮
 */
(function () {
  'use strict';

  var SCROLL_OFFSET = 80; // 顶部导航栏高度偏移

  function initBookmark() {
    var content = document.querySelector('.content-article');
    if (!content) return;

    // 提取 h1-h6 标题
    var headingEls = content.querySelectorAll('h1, h2, h3, h4, h5, h6');
    var headings = [];

    headingEls.forEach(el => {
      var id = el.getAttribute('id');
      if (!id) return;

      // 去掉 headerlink 锚点后的纯文本
      var text = '';
      var clone = el.cloneNode(true);
      var headerlink = clone.querySelector('.headerlink');
      if (headerlink) clone.removeChild(headerlink);
      text = clone.textContent.trim();
      if (!text) text = el.getAttribute('title') || el.textContent.trim();

      var level = parseInt(el.tagName.substring(1), 10);
      headings.push({ id, text, level, el });
    });

    // 标题不足 2 个则不显示
    if (headings.length < 2) return;

    var widget = document.getElementById('gal-bookmark');
    var list = document.getElementById('gal-bookmark-list');
    var body = document.getElementById('gal-bookmark-body');
    if (!widget || !list || !body) return;

    // 清空列表 (SPA 重新导航时)
    list.innerHTML = '';

    // 计算最小层级用于缩进
    var minLevel = Math.min(...headings.map(h => h.level));

    // 构建书签列表
    headings.forEach(h => {
      var indent = h.level - minLevel;
      var li = document.createElement('li');
      li.className = 'gal-bookmark-item';
      li.setAttribute('data-target', h.id);
      li.style.paddingLeft = (12 + indent * 14) + 'px';

      var a = document.createElement('a');
      a.href = 'javascript:void(0);';
      a.textContent = h.text;
      a.title = h.text;
      li.appendChild(a);
      list.appendChild(li);
    });

    // 显示书签窗口
    widget.style.display = '';

    // 点击跳转
    list.addEventListener('click', (e) => {
      var link = e.target.closest('.gal-bookmark-item a');
      if (!link) return;
      e.preventDefault();
      var li = link.closest('.gal-bookmark-item');
      var targetId = li.getAttribute('data-target');
      var targetEl = document.getElementById(targetId);
      if (targetEl) {
        var top = targetEl.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });

    // 最小化/展开
    var minimizeBtn = document.getElementById('gal-bookmark-minimize');
    if (minimizeBtn) {
      var newBtn = minimizeBtn.cloneNode(true);
      minimizeBtn.parentNode.replaceChild(newBtn, minimizeBtn);
      newBtn.addEventListener('click', () => {
        widget.classList.toggle('gal-bookmark-minimized');
        var icon = newBtn.querySelector('.material-symbols-outlined');
        if (icon) {
          if (widget.classList.contains('gal-bookmark-minimized')) {
            icon.textContent = 'add';
          } else {
            icon.textContent = 'remove';
          }
        }
      });
    }

    // 拖拽功能
    initDrag(widget);

    // 滚动监听 - 高亮当前章节
    initScrollSpy(headings, body);
  }

  // ---- 拖拽功能 ----
  function initDrag(widget) {
    var header = document.getElementById('gal-bookmark-header');
    if (!header) return;

    var dragging = false;
    var baseLeft = 0, baseTop = 0;
    var startCursorX = 0, startCursorY = 0;

    header.addEventListener('mousedown', (e) => {
      // 点击按钮时不拖拽
      if (e.target.closest('.gal-bookmark-btn, #gal-bookmark-minimize')) return;
      dragging = true;

      // 使用 offsetLeft/offsetTop（相对于 offsetParent）
      baseLeft = widget.offsetLeft;
      baseTop = widget.offsetTop;
      startCursorX = e.clientX;
      startCursorY = e.clientY;

      // 首次拖拽时清除 right 定位，切换为 left 定位
      if (widget.style.right !== 'auto') {
        widget.style.left = widget.offsetLeft + 'px';
        widget.style.right = 'auto';
      }

      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      var dx = e.clientX - startCursorX;
      var dy = e.clientY - startCursorY;
      var newLeft = baseLeft + dx;
      var newTop = baseTop + dy;

      // 边界限制（相对于 offsetParent）
      var parent = widget.offsetParent || document.documentElement;
      var maxLeft = parent.clientWidth - widget.offsetWidth;
      var maxTop = parent.scrollHeight - widget.offsetHeight;
      newLeft = Math.max(0, Math.min(newLeft, maxLeft));
      newTop = Math.max(0, Math.min(newTop, maxTop));

      widget.style.left = newLeft + 'px';
      widget.style.top = newTop + 'px';
    });

    document.addEventListener('mouseup', () => {
      dragging = false;
    });
  }

  // ---- 滚动高亮 (Scroll Spy) ----
  function initScrollSpy(headings, bodyEl) {
    var items = document.querySelectorAll('.gal-bookmark-item');

    function updateActive() {
      var scrollPos = window.scrollY;
      var current = null;

      for (var i = 0; i < headings.length; i++) {
        var h = headings[i];
        var elTop = h.el.getBoundingClientRect().top + window.scrollY;
        if (elTop - SCROLL_OFFSET - 10 <= scrollPos) {
          current = h.id;
        } else {
          break;
        }
      }

      items.forEach(item => item.classList.remove('active'));

      if (current) {
        var activeItem = document.querySelector(`.gal-bookmark-item[data-target="${current}"]`);
        if (activeItem) {
          activeItem.classList.add('active');
          // 滚动列表使当前项可见
          var listTop = bodyEl.scrollTop;
          var itemTop = activeItem.offsetTop - bodyEl.offsetTop;
          var itemBottom = itemTop + activeItem.offsetHeight;
          var bodyHeight = bodyEl.clientHeight;
          if (itemTop < listTop) {
            bodyEl.scrollTop = itemTop - 10;
          } else if (itemBottom > listTop + bodyHeight) {
            bodyEl.scrollTop = itemBottom - bodyHeight + 10;
          }
        }
      }
    }

    // 使用 requestAnimationFrame 节流
    var ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateActive();
          ticking = false;
        });
        ticking = true;
      }
    });

    updateActive();
  }

  // ---- 清理书签 (SPA 导航离开文章页时) ----
  function cleanupBookmark() {
    var widget = document.getElementById('gal-bookmark');
    if (widget) {
      widget.style.display = 'none';
      var list = document.getElementById('gal-bookmark-list');
      if (list) list.innerHTML = '';
    }
  }

  // ---- 初始化入口 ----
  document.addEventListener('DOMContentLoaded', () => {
    initBookmark();
  });

  // SPA 导航后重新初始化
  document.addEventListener('spa:ContentLoaded', (e) => {
    // 清理旧书签
    cleanupBookmark();
    // 延迟一帧确保 DOM 已更新
    requestAnimationFrame(() => {
      initBookmark();
    });
  });

})();
