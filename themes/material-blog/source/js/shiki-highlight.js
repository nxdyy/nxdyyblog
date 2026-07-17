/**
 * Shiki 代码高亮增强
 * 处理由 hexo-shiki-plugin 在服务端渲染的代码块
 * 功能：复制按钮、行号显示、语言标签、长代码块折叠/展开、工具栏
 */
(function () {
  'use strict';

  var COLLAPSE_THRESHOLD = 30; // 超过此行数则折叠
  var initialized = new WeakSet();

  /**
   * 获取代码块的语言
   */
  function getLanguage(el) {
    var lang = el.getAttribute('data-lang');
    if (lang) return lang;
    // 从 class 中提取 language-xxx
    var classes = (el.className || '').split(/\s+/);
    for (var i = 0; i < classes.length; i++) {
      var cls = classes[i];
      if (cls.indexOf('language-') === 0) return cls.replace('language-', '');
      if (cls.indexOf('lang-') === 0) return cls.replace('lang-', '');
    }
    // 从 style 或 data 属性中尝试获取
    var figure = el.closest('figure');
    if (figure) {
      lang = figure.getAttribute('data-lang');
      if (lang) return lang;
      var figClasses = (figure.className || '').split(/\s+/);
      for (var j = 0; j < figClasses.length; j++) {
        if (figClasses[j].indexOf('language-') === 0) return figClasses[j].replace('language-', '');
      }
    }
    return '';
  }

  /**
   * 获取代码文本内容
   */
  function getCodeText(pre) {
    var code = pre.querySelector('code');
    return code ? code.innerText : pre.innerText;
  }

  /**
   * 计算代码行数
   */
  function countLines(text) {
    return text.split('\n').length;
  }

  /**
   * 创建复制按钮
   */
  function createCopyButton() {
    var btn = document.createElement('button');
    btn.className = 'shiki-copy-btn';
    btn.setAttribute('aria-label', '复制代码');
    btn.innerHTML = '<span class="material-symbols-outlined">content_copy</span>';
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var pre = btn.closest('.shiki-wrapper') || btn.closest('figure');
      if (!pre) return;
      var codeText = getCodeText(pre.querySelector('pre'));
      if (!codeText) return;
      navigator.clipboard.writeText(codeText).then(function () {
        btn.innerHTML = '<span class="material-symbols-outlined">check</span>';
        btn.classList.add('copied');
        setTimeout(function () {
          btn.innerHTML = '<span class="material-symbols-outlined">content_copy</span>';
          btn.classList.remove('copied');
        }, 2000);
      }).catch(function () {
        // 降级方案
        var textarea = document.createElement('textarea');
        textarea.value = codeText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          btn.innerHTML = '<span class="material-symbols-outlined">check</span>';
          btn.classList.add('copied');
          setTimeout(function () {
            btn.innerHTML = '<span class="material-symbols-outlined">content_copy</span>';
            btn.classList.remove('copied');
          }, 2000);
        } catch (err) { /* ignore */ }
        document.body.removeChild(textarea);
      });
    });
    return btn;
  }

  /**
   * 创建语言标签
   */
  function createLangLabel(lang) {
    var label = document.createElement('span');
    label.className = 'shiki-lang-label';
    label.textContent = lang;
    return label;
  }

  /**
   * 创建工具栏
   */
  function createToolbar(lang) {
    var toolbar = document.createElement('div');
    toolbar.className = 'shiki-toolbar';
    if (lang) {
      toolbar.appendChild(createLangLabel(lang));
    }
    toolbar.appendChild(createCopyButton());
    return toolbar;
  }

  /**
   * 创建折叠/展开按钮
   */
  function createCollapseToggle() {
    var btn = document.createElement('button');
    btn.className = 'shiki-collapse-btn';
    // 默认状态是折叠的，所以显示"展开代码"
    btn.innerHTML = '<span class="material-symbols-outlined">expand_more</span> 展开代码';
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var wrapper = btn.closest('.shiki-wrapper') || btn.closest('figure');
      if (!wrapper) return;
      var codeContainer = wrapper.querySelector('.shiki-code-container');
      if (!codeContainer) return;
      var isCollapsed = codeContainer.classList.contains('collapsed');
      if (isCollapsed) {
        // 展开：移除 collapsed 类，限制解除
        codeContainer.classList.remove('collapsed');
        btn.innerHTML = '<span class="material-symbols-outlined">expand_less</span> 收起代码';
      } else {
        // 收起：添加 collapsed 类，恢复高度限制
        codeContainer.classList.add('collapsed');
        btn.innerHTML = '<span class="material-symbols-outlined">expand_more</span> 展开代码';
      }
    });
    return btn;
  }

  /**
   * 为代码块添加行号
   */
  function addLineNumbers(pre) {
    var code = pre.querySelector('code');
    if (!code) return;
    // 如果已经有行号则跳过
    if (pre.querySelector('.shiki-line-numbers') || code.querySelector('.line-number')) return;

    var lines = getCodeText(pre).split('\n');
    // 去掉末尾空行
    if (lines[lines.length - 1].trim() === '') lines.pop();
    var lineCount = lines.length;

    var lineNumbersDiv = document.createElement('div');
    lineNumbersDiv.className = 'shiki-line-numbers';
    lineNumbersDiv.setAttribute('aria-hidden', 'true');
    var nums = '';
    for (var i = 1; i <= lineCount; i++) {
      nums += '<span>' + i + '</span>';
    }
    lineNumbersDiv.innerHTML = nums;
    pre.insertBefore(lineNumbersDiv, pre.firstChild);
    pre.classList.add('has-line-numbers');
  }

  /**
   * 初始化单个代码块
   */
  function initCodeBlock(pre) {
    if (initialized.has(pre)) return;
    initialized.add(pre);

    var figure = pre.closest('figure');

    // 如果 hexo-shiki-plugin 已处理（有 .shiki-tools 或 .codeblock），跳过
    if (figure && (figure.querySelector('.shiki-tools') || figure.querySelector('.codeblock'))) {
      return;
    }

    var lang = getLanguage(pre);
    var codeText = getCodeText(pre);
    var lineCount = countLines(codeText);
    // 去掉末尾空行计数
    var lines = codeText.split('\n');
    if (lines[lines.length - 1].trim() === '') lineCount--;

    // 如果在 figure 内部，使用 figure 作为包装器
    var wrapper = figure || pre;

    // 创建外层包装器（如果需要）
    if (!figure) {
      var div = document.createElement('div');
      div.className = 'shiki-wrapper';
      pre.parentNode.insertBefore(div, pre);
      div.appendChild(pre);
      wrapper = div;
    }

    // 添加工具栏
    var toolbar = createToolbar(lang);
    wrapper.insertBefore(toolbar, wrapper.firstChild);

    // 添加行号
    if (window.shikiConfig && window.shikiConfig.line_numbers !== false) {
      addLineNumbers(pre);
    }

    // 长代码块折叠
    if (lineCount > COLLAPSE_THRESHOLD) {
      // 将 pre 包装到 shiki-code-container 中
      var codeContainer = document.createElement('div');
      codeContainer.className = 'shiki-code-container';
      pre.parentNode.insertBefore(codeContainer, pre);
      codeContainer.appendChild(pre);

      var collapseBtn = createCollapseToggle();
      wrapper.appendChild(collapseBtn);

      // 默认折叠
      codeContainer.classList.add('collapsed');
    }
  }

  /**
   * 注入样式
   */
  function injectStyles() {
    if (document.getElementById('shiki-highlight-styles')) return;
    var style = document.createElement('style');
    style.id = 'shiki-highlight-styles';
    style.textContent = [
      '.shiki-wrapper, figure.shiki {',
      '  position: relative;',
      '  margin: 1em 0;',
      '  border-radius: var(--md-sys-shape-corner-medium, 12px);',
      '  overflow: hidden;',
      '  background: var(--hl-bg, #282c34);',
      '  box-shadow: var(--md-sys-elevation-1, 0 1px 2px rgba(0,0,0,0.3), 0 1px 3px 1px rgba(0,0,0,0.15));',
      '}',

      '.shiki-toolbar {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: space-between;',
      '  padding: 6px 12px;',
      '  background: var(--hltools-bg, rgba(0,0,0,0.15));',
      '  border-bottom: 1px solid rgba(255,255,255,0.06);',
      '  min-height: 36px;',
      '}',

      '.shiki-lang-label {',
      '  font-size: 12px;',
      '  font-weight: 500;',
      '  color: var(--hltools-color, rgba(255,255,255,0.55));',
      '  text-transform: uppercase;',
      '  letter-spacing: 0.5px;',
      '  font-family: var(--md-sys-typescale-label-medium-font, "Roboto", sans-serif);',
      '}',

      '.shiki-copy-btn {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  width: 32px;',
      '  height: 32px;',
      '  border: none;',
      '  border-radius: var(--md-sys-shape-corner-small, 8px);',
      '  background: transparent;',
      '  color: var(--hltools-color, rgba(255,255,255,0.55));',
      '  cursor: pointer;',
      '  transition: all 0.2s ease;',
      '}',

      '.shiki-copy-btn:hover {',
      '  background: rgba(255,255,255,0.1);',
      '  color: rgba(255,255,255,0.85);',
      '}',

      '.shiki-copy-btn.copied {',
      '  color: #4caf50;',
      '}',

      '.shiki-copy-btn .material-symbols-outlined {',
      '  font-size: 18px;',
      '}',

      '.shiki-wrapper pre, figure.shiki pre {',
      '  margin: 0;',
      '  padding: 16px;',
      '  overflow-x: auto;',
      '  font-size: 14px;',
      '  line-height: 1.6;',
      '  tab-size: 4;',
      '}',

      '.shiki-wrapper pre code, figure.shiki pre code {',
      '  font-family: "Fira Code", "JetBrains Mono", "Source Code Pro", Menlo, Consolas, monospace;',
      '}',

      '.shiki-line-numbers {',
      '  display: inline-block;',
      '  float: left;',
      '  text-align: right;',
      '  padding-right: 12px;',
      '  margin-right: 12px;',
      '  border-right: 1px solid rgba(255,255,255,0.08);',
      '  color: rgba(255,255,255,0.25);',
      '  user-select: none;',
      '  font-size: 13px;',
      '  line-height: 1.6;',
      '}',

      '.shiki-line-numbers span {',
      '  display: block;',
      '}',

      'pre.has-line-numbers {',
      '  display: flex;',
      '}',

      'pre.has-line-numbers code {',
      '  flex: 1;',
      '  min-width: 0;',
      '}',

      '.shiki-code-container {',
      '  overflow: hidden;',
      '  transition: max-height 0.3s ease;',
      '  max-height: 200px;',
      '}',

      '.shiki-code-container:not(.collapsed) {',
      '  max-height: none;',
      '}',

      '.shiki-collapse-btn {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  gap: 4px;',
      '  width: 100%;',
      '  padding: 8px;',
      '  border: none;',
      '  background: var(--hltools-bg, rgba(0,0,0,0.15));',
      '  color: var(--hltools-color, rgba(255,255,255,0.55));',
      '  font-size: 12px;',
      '  font-family: var(--md-sys-typescale-label-medium-font, "Roboto", sans-serif);',
      '  cursor: pointer;',
      '  transition: all 0.2s ease;',
      '}',

      '.shiki-collapse-btn:hover {',
      '  background: rgba(255,255,255,0.08);',
      '  color: rgba(255,255,255,0.85);',
      '}',

      '.shiki-collapse-btn .material-symbols-outlined {',
      '  font-size: 18px;',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  /**
   * 主初始化函数
   */
  function initShikiHighlight() {
    // 主题自行处理代码块

    injectStyles();

    // 查找所有 shiki 代码块
    // 1. <pre class="shiki">
    // 2. <figure class="shiki"> 内的 <pre>
    // 3. 带有 data-lang 属性的 <pre>
    var pres = document.querySelectorAll('pre.shiki, figure.shiki pre, pre[data-lang]');
    pres.forEach(function (pre) {
      initCodeBlock(pre);
    });

    // 也处理 figure.shiki 自身
    var figures = document.querySelectorAll('figure.shiki');
    figures.forEach(function (figure) {
      var pre = figure.querySelector('pre');
      if (pre && !initialized.has(pre)) {
        initCodeBlock(pre);
      }
    });
  }

  // 初始加载
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShikiHighlight);
  } else {
    initShikiHighlight();
  }

  // SPA 导航后重新初始化
  document.addEventListener('spa:ContentLoaded', initShikiHighlight);

})();
