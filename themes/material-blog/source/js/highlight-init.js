/**
 * 代码块高亮初始化 (hexo-shiki-plugin 输出)
 * 处理 <figure class="shiki"> 和 <pre class="shiki"> 代码块
 * 功能：工具栏（语言标签 + 复制按钮）、行号、高代码块展开/收起
 * 使用 CSS 变量: --hl-color, --hl-bg, --hltools-bg 等
 */
(function () {
  'use strict';

  var MAX_HEIGHT = 600; // 超过此高度(px)则添加展开/收起按钮
  var processedAttr = 'data-hl-init';

  /**
   * 检测代码块语言
   */
  function detectLanguage(container) {
    // data-lang 属性
    var lang = container.getAttribute('data-lang');
    if (lang) return lang;

    // class 中的 language-xxx
    var el = container.querySelector('pre') || container;
    var classes = (el.className || '').split(/\s+/);
    for (var i = 0; i < classes.length; i++) {
      if (classes[i].indexOf('language-') === 0) return classes[i].replace('language-', '');
      if (classes[i].indexOf('lang-') === 0) return classes[i].replace('lang-', '');
    }

    // figure 或父元素
    var parent = container.closest('figure') || container.parentElement;
    if (parent) {
      lang = parent.getAttribute('data-lang');
      if (lang) return lang;
      var pClasses = (parent.className || '').split(/\s+/);
      for (var j = 0; j < pClasses.length; j++) {
        if (pClasses[j].indexOf('language-') === 0) return pClasses[j].replace('language-', '');
      }
    }

    return '';
  }

  /**
   * 获取代码文本
   */
  function getCodeText(container) {
    var code = container.querySelector('code');
    return code ? code.innerText : container.innerText;
  }

  /**
   * 执行复制操作
   */
  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.cssText = 'position:fixed;opacity:0;left:-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        resolve();
      } catch (e) {
        reject(e);
      }
      document.body.removeChild(textarea);
    });
  }

  /**
   * 创建工具栏
   */
  function createToolbar(lang, getCode) {
    var toolbar = document.createElement('div');
    toolbar.className = 'hl-toolbar';

    // 左侧语言标签
    var left = document.createElement('div');
    left.className = 'hl-toolbar-left';
    if (lang) {
      var label = document.createElement('span');
      label.className = 'hl-lang-badge';
      label.textContent = lang;
      left.appendChild(label);
    }
    toolbar.appendChild(left);

    // 右侧复制按钮
    var right = document.createElement('div');
    right.className = 'hl-toolbar-right';
    var copyBtn = document.createElement('button');
    copyBtn.className = 'hl-copy-btn';
    copyBtn.setAttribute('aria-label', '复制代码');
    copyBtn.innerHTML = '<span class="material-symbols-outlined">content_copy</span><span class="hl-copy-text">复制</span>';
    copyBtn.addEventListener('click', function () {
      var code = getCode();
      if (!code) return;
      copyToClipboard(code).then(function () {
        copyBtn.innerHTML = '<span class="material-symbols-outlined">check</span><span class="hl-copy-text">已复制!</span>';
        copyBtn.classList.add('hl-copied');
        setTimeout(function () {
          copyBtn.innerHTML = '<span class="material-symbols-outlined">content_copy</span><span class="hl-copy-text">复制</span>';
          copyBtn.classList.remove('hl-copied');
        }, 2000);
      }).catch(function () {
        copyBtn.querySelector('.hl-copy-text').textContent = '复制失败';
        setTimeout(function () {
          copyBtn.querySelector('.hl-copy-text').textContent = '复制';
        }, 2000);
      });
    });
    right.appendChild(copyBtn);
    toolbar.appendChild(right);

    return toolbar;
  }

  /**
   * 添加行号
   */
  function addLineNumbers(pre) {
    if (pre.querySelector('.hl-line-numbers')) return;

    var code = pre.querySelector('code');
    if (!code) return;

    var text = code.innerText;
    var lines = text.split('\n');
    if (lines.length > 0 && lines[lines.length - 1].trim() === '') lines.pop();
    var count = lines.length;

    var gutter = document.createElement('div');
    gutter.className = 'hl-line-numbers';
    gutter.setAttribute('aria-hidden', 'true');
    var html = '';
    for (var i = 1; i <= count; i++) {
      html += '<span>' + i + '</span>';
    }
    gutter.innerHTML = html;

    pre.classList.add('hl-has-line-numbers');
    pre.insertBefore(gutter, pre.firstChild);
  }

  /**
   * 创建展开/收起按钮
   */
  function createExpandToggle(wrapper, codeContainer) {
    var btn = document.createElement('button');
    btn.className = 'hl-expand-btn';
    btn.innerHTML = '<span class="material-symbols-outlined">unfold_more</span><span>展开全部代码</span>';

    btn.addEventListener('click', function () {
      var isExpanded = codeContainer.classList.contains('hl-expanded');
      if (isExpanded) {
        codeContainer.classList.remove('hl-expanded');
        codeContainer.style.maxHeight = '400px';
        btn.innerHTML = '<span class="material-symbols-outlined">unfold_more</span><span>展开全部代码</span>';
      } else {
        codeContainer.classList.add('hl-expanded');
        codeContainer.style.maxHeight = 'none';
        btn.innerHTML = '<span class="material-symbols-outlined">unfold_less</span><span>收起代码</span>';
      }
    });

    return btn;
  }

  /**
   * 初始化单个代码块
   */
  function processBlock(container) {
    if (container.hasAttribute(processedAttr)) return;
    container.setAttribute(processedAttr, 'true');

    var pre = container.querySelector('pre');
    if (!pre) return;

    var lang = detectLanguage(container);
    var getCode = function () { return getCodeText(pre); };

    // 创建工具栏
    var toolbar = createToolbar(lang, getCode);
    container.insertBefore(toolbar, container.firstChild);

    // 添加行号 (从主题配置或默认开启)
    var config = window.shikiConfig || {};
    if (config.line_numbers !== false) {
      addLineNumbers(pre);
    }

    // 检测高度，决定是否需要展开/收起
    // 使用 requestAnimationFrame 确保 DOM 已渲染
    requestAnimationFrame(function () {
      var height = pre.scrollHeight;
      if (height > MAX_HEIGHT) {
        var codeContainer = document.createElement('div');
        codeContainer.className = 'hl-code-container';
        codeContainer.style.maxHeight = '400px';
        codeContainer.style.overflow = 'hidden';
        codeContainer.style.transition = 'max-height 0.3s ease';

        // 将 pre 移入 codeContainer
        pre.parentNode.insertBefore(codeContainer, pre);
        codeContainer.appendChild(pre);

        var expandBtn = createExpandToggle(container, codeContainer);
        container.appendChild(expandBtn);
      }
    });
  }

  /**
   * 注入样式
   */
  function injectStyles() {
    if (document.getElementById('highlight-init-styles')) return;
    var style = document.createElement('style');
    style.id = 'highlight-init-styles';
    style.textContent = [
      /* 工具栏 */
      '.hl-toolbar {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: space-between;',
      '  padding: 6px 16px;',
      '  background: var(--hltools-bg, #21252b);',
      '  border-bottom: 1px solid rgba(255,255,255,0.06);',
      '  border-radius: var(--md-sys-shape-corner-medium, 12px) var(--md-sys-shape-corner-medium, 12px) 0 0;',
      '}',

      '.hl-toolbar-left, .hl-toolbar-right {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 8px;',
      '}',

      '.hl-lang-badge {',
      '  font-size: 12px;',
      '  font-weight: 500;',
      '  color: var(--hltools-color, rgba(255,255,255,0.5));',
      '  text-transform: uppercase;',
      '  letter-spacing: 0.5px;',
      '  font-family: var(--md-sys-typescale-label-medium-font, "Roboto", sans-serif);',
      '}',

      /* 复制按钮 */
      '.hl-copy-btn {',
      '  display: inline-flex;',
      '  align-items: center;',
      '  gap: 4px;',
      '  padding: 4px 10px;',
      '  border: 1px solid rgba(255,255,255,0.1);',
      '  border-radius: var(--md-sys-shape-corner-small, 8px);',
      '  background: transparent;',
      '  color: var(--hltools-color, rgba(255,255,255,0.5));',
      '  font-size: 12px;',
      '  font-family: var(--md-sys-typescale-label-medium-font, "Roboto", sans-serif);',
      '  cursor: pointer;',
      '  transition: all 0.2s ease;',
      '}',

      '.hl-copy-btn:hover {',
      '  background: rgba(255,255,255,0.08);',
      '  color: rgba(255,255,255,0.85);',
      '  border-color: rgba(255,255,255,0.2);',
      '}',

      '.hl-copy-btn.hl-copied {',
      '  color: #4caf50;',
      '  border-color: #4caf50;',
      '}',

      '.hl-copy-btn .material-symbols-outlined {',
      '  font-size: 16px;',
      '}',

      /* 代码块容器 */
      'figure.shiki, .shiki-wrapper {',
      '  position: relative;',
      '  margin: 1em 0;',
      '  border-radius: var(--md-sys-shape-corner-medium, 12px);',
      '  overflow: hidden;',
      '  background: var(--hl-bg, #282c34);',
      '  box-shadow: var(--md-sys-elevation-1, 0 1px 2px rgba(0,0,0,0.3), 0 1px 3px 1px rgba(0,0,0,0.15));',
      '}',

      /* 代码区域 */
      'figure.shiki pre, .shiki-wrapper pre, .hl-code-container pre {',
      '  margin: 0;',
      '  padding: 16px;',
      '  overflow-x: auto;',
      '  font-size: 14px;',
      '  line-height: 1.6;',
      '  tab-size: 4;',
      '}',

      'figure.shiki pre code, .shiki-wrapper pre code {',
      '  font-family: "Fira Code", "JetBrains Mono", "Source Code Pro", Menlo, Consolas, monospace;',
      '}',

      /* 行号 */
      '.hl-line-numbers {',
      '  display: inline-block;',
      '  float: left;',
      '  min-width: 2.5em;',
      '  text-align: right;',
      '  padding-right: 14px;',
      '  margin-right: 14px;',
      '  border-right: 1px solid rgba(255,255,255,0.08);',
      '  color: var(--hl-linenumber-color, rgba(255,255,255,0.2));',
      '  user-select: none;',
      '  font-size: 13px;',
      '  line-height: 1.6;',
      '}',

      '.hl-line-numbers span {',
      '  display: block;',
      '}',

      'pre.hl-has-line-numbers {',
      '  display: flex;',
      '}',

      'pre.hl-has-line-numbers code {',
      '  flex: 1;',
      '  min-width: 0;',
      '}',

      /* 展开/收起按钮 */
      '.hl-expand-btn {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  gap: 6px;',
      '  width: 100%;',
      '  padding: 8px 16px;',
      '  border: none;',
      '  border-top: 1px solid rgba(255,255,255,0.06);',
      '  background: var(--hltools-bg, #21252b);',
      '  color: var(--hltools-color, rgba(255,255,255,0.5));',
      '  font-size: 12px;',
      '  font-family: var(--md-sys-typescale-label-medium-font, "Roboto", sans-serif);',
      '  cursor: pointer;',
      '  transition: all 0.2s ease;',
      '}',

      '.hl-expand-btn:hover {',
      '  background: rgba(255,255,255,0.06);',
      '  color: rgba(255,255,255,0.85);',
      '}',

      '.hl-expand-btn .material-symbols-outlined {',
      '  font-size: 18px;',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  /**
   * 主初始化函数
   */
  function init() {
    injectStyles();

    // 处理 <figure class="shiki">
    var figures = document.querySelectorAll('figure.shiki');
    figures.forEach(function (fig) {
      processBlock(fig);
    });

    // 处理不在 figure 内的 <pre class="shiki">
    var pres = document.querySelectorAll('pre.shiki');
    pres.forEach(function (pre) {
      if (pre.closest('figure.shiki')) return; // 已在 figure 中处理
      // 包装
      var wrapper = document.createElement('div');
      wrapper.className = 'shiki-wrapper';
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);
      processBlock(wrapper);
    });
  }

  // 初始加载
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // SPA 导航后重新初始化
  document.addEventListener('spa:ContentLoaded', init);

})();
