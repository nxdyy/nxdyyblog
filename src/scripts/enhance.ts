/**
 * 客户端增强脚本（迁移自 shiki-highlight.js / 侧栏交互 / issue / bookmark.js）
 * 全部使用事件委托 + 重入式初始化，保证 SPA 内容替换后依然可用。
 */
import { theme } from '../config/theme';

const SCROLL_OFFSET = 80;

/* ==================== 代码块增强 ==================== */

function enhanceCodeBlocks() {
  document.querySelectorAll<HTMLPreElement>('#mainstay pre.astro-code').forEach((pre) => {
    if (pre.closest('.shiki-container')) return; // 已处理
    const lang = pre.getAttribute('data-language') || 'text';
    const limit = theme.shiki.height_limit;

    const figure = document.createElement('figure');
    figure.className = 'shiki-container';
    if (theme.shiki.line_numbers) figure.classList.add('shiki-line-numbers');

    // 工具栏：语言标签 + 复制按钮
    if (theme.shiki.copy_button) {
      const toolbar = document.createElement('figcaption');
      toolbar.className = 'shiki-toolbar';
      const langEl = document.createElement('span');
      langEl.className = 'shiki-lang';
      langEl.textContent = lang;
      const copyBtn = document.createElement('button');
      copyBtn.className = 'shiki-copy-btn';
      copyBtn.textContent = '复制';
      copyBtn.addEventListener('click', () => {
        navigator.clipboard
          .writeText(pre.textContent || '')
          .then(() => {
            copyBtn.textContent = '已复制';
            copyBtn.classList.add('copied');
            setTimeout(() => {
              copyBtn.textContent = '复制';
              copyBtn.classList.remove('copied');
            }, 2000);
          })
          .catch(() => {
            copyBtn.textContent = '复制失败';
          });
      });
      toolbar.append(langEl, copyBtn);
      figure.appendChild(toolbar);
    }

    // 行号：把 code 子节点按换行拆分为 .shiki-line
    if (theme.shiki.line_numbers) {
      const code = pre.querySelector('code');
      if (code) wrapLines(code);
    }

    // 结构：figure.shiki-container > [toolbar] + .shiki-expand > pre
    pre.replaceWith(figure);
    const expandWrap = document.createElement('div');
    expandWrap.className = 'shiki-expand';
    expandWrap.appendChild(pre);
    figure.appendChild(expandWrap);

    // 高度限制 + 展开
    if (pre.scrollHeight > limit) {
      expandWrap.classList.add('collapsed');
      const btn = document.createElement('button');
      btn.className = 'shiki-expand-btn';
      btn.textContent = '展开';
      btn.addEventListener('click', () => {
        const collapsed = expandWrap.classList.toggle('collapsed');
        btn.textContent = collapsed ? '展开' : '收起';
      });
      expandWrap.appendChild(btn);
    }
  });
}

/** 把 code 的顶层节点按 \n 拆成 .shiki-line span（保留 token span 不跨行） */
function wrapLines(code: Element) {
  const nodes = Array.from(code.childNodes);
  const lines: DocumentFragment[] = [];
  let current = document.createDocumentFragment();

  const pushLine = () => {
    lines.push(current);
    current = document.createDocumentFragment();
  };

  nodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent) {
      const parts = node.textContent.split('\n');
      parts.forEach((part, i) => {
        if (i > 0) pushLine();
        if (part) current.appendChild(document.createTextNode(part));
      });
    } else {
      // token span 内部通常不含换行
      if (node.textContent && node.textContent.includes('\n')) {
        // 保险处理：跨行 token，整体放入当前行
        current.appendChild(node.cloneNode(true));
        pushLine();
      } else {
        current.appendChild(node.cloneNode(true));
      }
    }
  });
  pushLine();

  code.textContent = '';
  lines.forEach((frag) => {
    const line = document.createElement('span');
    line.className = 'shiki-line';
    line.appendChild(frag);
    code.appendChild(line);
  });
}

/* ==================== 侧栏交互（事件委托） ==================== */

function setupDelegatedUI() {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    // 侧栏 Tab 切换
    const tabBtn = target.closest<HTMLElement>('#sidebar-tabs .tab-btn');
    if (tabBtn) {
      const tabName = tabBtn.dataset.tab;
      document.querySelectorAll('#sidebar-tabs .tab-btn').forEach((b) => b.classList.remove('active'));
      tabBtn.classList.add('active');
      document.querySelectorAll<HTMLElement>('#sidebar-tabs .tab-panel').forEach((panel) => {
        panel.style.display = panel.id === 'panel-' + tabName ? '' : 'none';
      });
      return;
    }

    // widget 折叠
    const toggleBtn = target.closest<HTMLElement>('#sidebar .panel-toggle');
    if (toggleBtn) {
      const widget = toggleBtn.closest('.sidebar-widget');
      const content = widget?.querySelector<HTMLElement>('.widget-content');
      if (content) {
        const hidden = content.style.display === 'none';
        content.style.display = hidden ? '' : 'none';
        const icon = toggleBtn.querySelector('.material-symbols-outlined');
        if (icon) icon.textContent = hidden ? 'expand_less' : 'expand_more';
      }
      return;
    }

    // widget 关闭
    const removeBtn = target.closest<HTMLElement>('#sidebar .panel-remove');
    if (removeBtn) {
      const widget = removeBtn.closest<HTMLElement>('.sidebar-widget');
      if (widget) widget.style.display = 'none';
      return;
    }

    // 公告关闭
    const issueClose = target.closest<HTMLElement>('.issue-close-btn');
    if (issueClose) {
      const banner = document.getElementById('gal-issue');
      if (banner) banner.style.display = 'none';
      try {
        localStorage.setItem('issue-closed', 'true');
      } catch {
        /* ignore */
      }
    }
  });

  // 公告恢复（重入式：SPA 换内容后同样生效）
  applyIssueClosedState();
}

function applyIssueClosedState() {
  try {
    if (localStorage.getItem('issue-closed') === 'true') {
      const banner = document.getElementById('gal-issue');
      if (banner) banner.style.display = 'none';
    }
  } catch {
    /* ignore */
  }
}

/* ==================== 书签 / TOC 浮动面板（迁移自 bookmark.js） ==================== */

interface TocHeading {
  id: string;
  text: string;
  level: number;
  el: HTMLElement;
}

let scrollSpyCleanup: (() => void) | null = null;

function initBookmark() {
  const widget = document.getElementById('gal-bookmark');
  const list = document.getElementById('gal-bookmark-list');
  const body = document.getElementById('gal-bookmark-body');
  if (!widget || !list || !body) return;

  widget.style.display = 'none';
  list.innerHTML = '';
  scrollSpyCleanup?.();
  scrollSpyCleanup = null;

  const content = document.querySelector('.content-article');
  if (!content) return;

  const headings: TocHeading[] = [];
  content.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((el) => {
    const id = el.getAttribute('id');
    if (!id) return;
    headings.push({
      id,
      text: (el.textContent || '').trim().slice(0, 60),
      level: parseInt(el.tagName.substring(1), 10),
      el,
    });
  });

  if (headings.length < 2) return;

  const minLevel = Math.min(...headings.map((h) => h.level));
  headings.forEach((h) => {
    const li = document.createElement('li');
    li.className = `gal-bookmark-item level-${h.level}`;
    li.setAttribute('data-target', h.id);
    li.style.paddingLeft = 12 + (h.level - minLevel) * 0 + 'px';

    const a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.text;
    a.title = h.text;
    li.appendChild(a);
    list.appendChild(li);
  });

  widget.style.display = '';

  // 点击跳转（委托）
  list.onclick = (e) => {
    const link = (e.target as HTMLElement).closest<HTMLElement>('.gal-bookmark-item a');
    if (!link) return;
    e.preventDefault();
    const li = link.closest('.gal-bookmark-item');
    const targetId = li?.getAttribute('data-target');
    const targetEl = targetId ? document.getElementById(targetId) : null;
    if (targetEl) {
      const top = targetEl.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  // 最小化
  const minimizeBtn = document.getElementById('gal-bookmark-minimize');
  if (minimizeBtn) {
    minimizeBtn.onclick = () => {
      const minimized = widget.classList.toggle('gal-bookmark-minimized');
      const icon = minimizeBtn.querySelector('.material-symbols-outlined');
      if (icon) icon.textContent = minimized ? 'add' : 'remove';
    };
  }

  initBookmarkDrag(widget);
  scrollSpyCleanup = initScrollSpy(headings, body);
}

function initBookmarkDrag(widget: HTMLElement) {
  const header = document.getElementById('gal-bookmark-header');
  if (!header) return;

  let dragging = false;
  let baseLeft = 0,
    baseTop = 0,
    startCursorX = 0,
    startCursorY = 0;

  header.onmousedown = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('.gal-bookmark-btn')) return;
    dragging = true;
    const rect = widget.getBoundingClientRect();
    baseLeft = rect.left;
    baseTop = rect.top;
    startCursorX = e.clientX;
    startCursorY = e.clientY;
    if (widget.style.right !== 'auto') {
      widget.style.left = rect.left + 'px';
      widget.style.top = rect.top + 'px';
      widget.style.right = 'auto';
      widget.style.transform = 'none';
    }
    e.preventDefault();
  };

  document.onmousemove = (e: MouseEvent) => {
    if (!dragging) return;
    const dx = e.clientX - startCursorX;
    const dy = e.clientY - startCursorY;
    const maxLeft = window.innerWidth - widget.offsetWidth;
    const maxTop = window.innerHeight - widget.offsetHeight;
    widget.style.left = Math.max(0, Math.min(baseLeft + dx, maxLeft)) + 'px';
    widget.style.top = Math.max(72, Math.min(baseTop + dy, maxTop)) + 'px';
  };

  document.onmouseup = () => {
    dragging = false;
  };
}

function initScrollSpy(headings: TocHeading[], bodyEl: HTMLElement): () => void {
  let ticking = false;

  const updateActive = () => {
    const scrollPos = window.scrollY;
    let current: string | null = null;
    for (const h of headings) {
      const elTop = h.el.getBoundingClientRect().top + window.scrollY;
      if (elTop - SCROLL_OFFSET - 10 <= scrollPos) current = h.id;
      else break;
    }

    document.querySelectorAll('.gal-bookmark-item').forEach((item) => item.classList.remove('active'));

    if (current) {
      const activeItem = document.querySelector(`.gal-bookmark-item[data-target="${current}"]`);
      if (activeItem) {
        activeItem.classList.add('active');
        const listTop = bodyEl.scrollTop;
        const itemTop = activeItem.offsetTop - bodyEl.offsetTop;
        const itemBottom = itemTop + activeItem.offsetHeight;
        const bodyHeight = bodyEl.clientHeight;
        if (itemTop < listTop) bodyEl.scrollTop = itemTop - 10;
        else if (itemBottom > listTop + bodyHeight) bodyEl.scrollTop = itemBottom - bodyHeight + 10;
      }
    }
  };

  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateActive();
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  updateActive();

  return () => window.removeEventListener('scroll', onScroll);
}

/* ==================== 入口 ==================== */

function initAll() {
  enhanceCodeBlocks();
  initBookmark();
  applyIssueClosedState();
}

setupDelegatedUI();
initAll();

// SPA 导航后重新增强
document.addEventListener('spa:afternavigate', () => {
  requestAnimationFrame(initAll);
});

// 初始加载完成后隐藏 loader
window.addEventListener('load', () => {
  const loader = document.getElementById('page-loader');
  if (loader) {
    loader.classList.add('loaded');
    setTimeout(() => {
      loader.style.display = 'none';
    }, 500);
  }
});
