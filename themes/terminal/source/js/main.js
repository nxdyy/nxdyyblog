/**
 * Terminal Theme - Main JavaScript
 * SPA routing, keyboard shortcuts, search, theme toggle
 */

(function() {
  'use strict';

  // ---- State ----
  var state = {
    sidebarCollapsed: false,
    theme: 'dark',
    searchActive: false,
    searchData: null,
    currentUrl: window.location.pathname
  };

  // ---- DOM Elements ----
  var sidebar, mainContent, searchInput, searchResults, themeBtn, mobileMenuBtn;

  // ---- Initialize ----
  function init() {
    sidebar = document.getElementById('terminal-sidebar');
    mainContent = document.getElementById('terminal-main');
    searchInput = document.getElementById('search-input');
    searchResults = document.getElementById('search-results');
    themeBtn = document.getElementById('theme-toggle-btn');
    mobileMenuBtn = document.getElementById('mobile-menu-btn');

    // Load saved theme
    var savedTheme = localStorage.getItem('terminal-theme');
    if (savedTheme) {
      state.theme = savedTheme;
      applyTheme(savedTheme);
    }

    // Load saved sidebar state (desktop only)
    if (window.innerWidth > 768) {
      var savedSidebar = localStorage.getItem('terminal-sidebar');
      if (savedSidebar === 'collapsed') {
        toggleSidebar(true);
      }
    } else {
      // Mobile: sidebar collapsed by default
      toggleSidebar(true);
    }

    // Bind events
    bindKeyboardShortcuts();
    bindSidebarToggle();
    bindThemeToggle();
    bindMobileMenu();
    bindSearch();
    bindPostClicks();
    bindSpaLinks();

    // Init code highlight
    initHighlight();

    // Init math rendering
    initMath();

    // Create search results overlay
    createSearchOverlay();

    // Create SPA loading bar
    createLoadingBar();

    // Mobile sidebar overlay
    createMobileOverlay();

    // Update active sidebar link
    updateActiveLink();
  }

  // ---- Theme Toggle ----
  function applyTheme(theme) {
    document.body.className = theme === 'light' ? 'theme-light' : 'theme-dark';
    state.theme = theme;
    localStorage.setItem('terminal-theme', theme);
    if (themeBtn) {
      themeBtn.textContent = theme === 'dark' ? '[T]' : '[T]';
      themeBtn.title = 'Toggle Theme [Ctrl+T] (' + theme + ')';
    }
  }

  function toggleTheme() {
    var newTheme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
  }

  function bindThemeToggle() {
    if (themeBtn) {
      themeBtn.addEventListener('click', function() {
        toggleTheme();
      });
    }
  }

  // ---- Sidebar Toggle ----
  function toggleSidebar(forceCollapsed) {
    if (typeof forceCollapsed === 'boolean') {
      state.sidebarCollapsed = forceCollapsed;
    } else {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    }

    if (state.sidebarCollapsed) {
      sidebar.classList.add('collapsed');
      mainContent.classList.add('sidebar-collapsed');
      if (window.innerWidth > 768) {
        localStorage.setItem('terminal-sidebar', 'collapsed');
      }
    } else {
      sidebar.classList.remove('collapsed');
      mainContent.classList.remove('sidebar-collapsed');
      if (window.innerWidth > 768) {
        localStorage.setItem('terminal-sidebar', 'expanded');
      }
    }

    // Update toggle button icon
    var toggleBtn = document.getElementById('sidebar-toggle');
    if (toggleBtn) {
      toggleBtn.querySelector('.toggle-icon').textContent = state.sidebarCollapsed ? '[>]' : '[<]';
    }

    // Mobile
    if (window.innerWidth <= 768) {
      if (state.sidebarCollapsed) {
        sidebar.classList.remove('mobile-open');
        removeMobileOverlay();
      } else {
        sidebar.classList.add('mobile-open');
        showMobileOverlay();
      }
    }
  }

  function bindSidebarToggle() {
    var toggle = document.getElementById('sidebar-toggle');
    if (toggle) {
      toggle.addEventListener('click', function() {
        toggleSidebar();
      });
    }
  }

  // ---- Mobile Menu ----
  function bindMobileMenu() {
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', function() {
        toggleSidebar();
      });
    }
  }

  // ---- Mobile Overlay ----
  var mobileOverlay = null;

  function createMobileOverlay() {
    mobileOverlay = document.createElement('div');
    mobileOverlay.id = 'mobile-overlay';
    mobileOverlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:99;display:none;cursor:pointer;';
    mobileOverlay.addEventListener('click', function() {
      toggleSidebar(true);
    });
    document.body.appendChild(mobileOverlay);
  }

  function showMobileOverlay() {
    if (mobileOverlay && window.innerWidth <= 768) {
      mobileOverlay.style.display = 'block';
    }
  }

  function removeMobileOverlay() {
    if (mobileOverlay) {
      mobileOverlay.style.display = 'none';
    }
  }

  // ---- Active Link ----
  function updateActiveLink() {
    var currentPath = window.location.pathname;
    var links = document.querySelectorAll('.sidebar-link a');
    links.forEach(function(link) {
      link.classList.remove('active');
      var href = link.getAttribute('href');
      if (href === currentPath || (href !== '/' && currentPath.startsWith(href))) {
        link.classList.add('active');
      }
    });
  }

  // ---- Keyboard Shortcuts ----
  function bindKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
      // Don't trigger shortcuts when typing in inputs
      var tag = e.target.tagName.toLowerCase();
      var isInput = tag === 'input' || tag === 'textarea' || tag === 'select';

      // Escape - clear search or close overlays
      if (e.key === 'Escape') {
        if (state.searchActive) {
          closeSearch();
          e.preventDefault();
        }
        if (searchInput) searchInput.blur();
        return;
      }

      // / - Focus search
      if (e.key === '/' && !isInput) {
        e.preventDefault();
        if (searchInput) searchInput.focus();
        return;
      }

      // Ctrl+S - Toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        toggleSidebar();
        return;
      }

      // Ctrl+T - Toggle theme
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        toggleTheme();
        return;
      }

      // Ctrl+P or Ctrl+K - Open search
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'k')) {
        e.preventDefault();
        if (searchInput) searchInput.focus();
        return;
      }

      // j/k - Scroll down/up (vim-like, only when not in input)
      if (!isInput) {
        if (e.key === 'j') {
          window.scrollBy(0, 60);
          return;
        }
        if (e.key === 'k') {
          window.scrollBy(0, -60);
          return;
        }
        // g - Go to top
        if (e.key === 'g' && !e.ctrlKey) {
          window.scrollTo(0, 0);
          return;
        }
        // G - Go to bottom
        if (e.key === 'G') {
          window.scrollTo(0, document.body.scrollHeight);
          return;
        }
      }
    });
  }

  // ---- Search ----
  function bindSearch() {
    if (!searchInput) return;

    searchInput.addEventListener('input', debounce(function() {
      var query = searchInput.value.trim();
      if (query.length < 2) {
        closeSearch();
        return;
      }
      performSearch(query);
    }, 300));

    searchInput.addEventListener('focus', function() {
      if (searchInput.value.trim().length >= 2) {
        performSearch(searchInput.value.trim());
      }
    });
  }

  function createSearchOverlay() {
    if (document.getElementById('search-results')) return;

    var overlay = document.createElement('div');
    overlay.id = 'search-results';
    overlay.innerHTML = '<div class="search-results-header">' +
      '<span class="search-results-title">[Search Results]</span>' +
      '<span class="search-close">[ESC] Close</span>' +
      '</div>' +
      '<div id="search-results-list"></div>';
    document.body.appendChild(overlay);
    searchResults = overlay;

    // Close button
    var closeBtn = overlay.querySelector('.search-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        closeSearch();
      });
    }
  }

  function performSearch(query) {
    if (!state.searchData) {
      loadSearchData(function() {
        doSearch(query);
      });
    } else {
      doSearch(query);
    }
  }

  function loadSearchData(callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/content.json', true);
    xhr.onload = function() {
      if (xhr.status === 200) {
        try {
          state.searchData = JSON.parse(xhr.responseText);
        } catch(e) {
          state.searchData = [];
        }
      } else {
        state.searchData = [];
      }
      callback();
    };
    xhr.onerror = function() {
      state.searchData = [];
      callback();
    };
    xhr.send();
  }

  function doSearch(query) {
    if (!state.searchData || !searchResults) return;

    var results = [];
    var q = query.toLowerCase();
    var posts = state.searchData.posts || state.searchData;

    if (Array.isArray(posts)) {
      posts.forEach(function(post) {
        var title = (post.title || '').toLowerCase();
        var text = (post.text || post.content || '').toLowerCase();
        var tags = [];
        if (post.tags) {
          if (Array.isArray(post.tags)) {
            tags = post.tags.map(function(t) { return t.name || t; });
          }
        }
        var tagStr = tags.join(' ').toLowerCase();

        if (title.indexOf(q) !== -1 || text.indexOf(q) !== -1 || tagStr.indexOf(q) !== -1) {
          var snippet = getSnippet(text, q, 100);
          results.push({
            title: post.title,
            url: post.path || post.url,
            snippet: snippet
          });
        }
      });
    }

    var listEl = document.getElementById('search-results-list');
    if (listEl) {
      if (results.length === 0) {
        listEl.innerHTML = '<div class="gray" style="padding: 8px 0;">No results found for "' + escapeHtml(query) + '"</div>';
      } else {
        var html = '';
        results.forEach(function(r) {
          html += '<div class="search-result-item">' +
            '<div class="post-title"><span class="title-marker">&gt; </span><a href="' + escapeHtml(r.url) + '">' + escapeHtml(r.title) + '</a></div>' +
            '<div class="match-text gray">' + r.snippet + '</div>' +
            '</div>';
        });
        listEl.innerHTML = html;
      }
    }

    searchResults.classList.add('active');
    state.searchActive = true;

    // Bind clicks on search results for SPA
    var links = searchResults.querySelectorAll('a');
    links.forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        closeSearch();
        spaNavigate(link.getAttribute('href'));
      });
    });
  }

  function getSnippet(text, query, len) {
    var idx = text.indexOf(query);
    if (idx === -1) return escapeHtml(text.substring(0, len)) + '...';
    var start = Math.max(0, idx - len / 2);
    var end = Math.min(text.length, idx + len / 2);
    var snippet = text.substring(start, end);
    snippet = escapeHtml(snippet);
    var qEscaped = escapeHtml(query);
    snippet = snippet.replace(new RegExp(qEscaped.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '<mark>$&</mark>');
    return (start > 0 ? '...' : '') + snippet + (end < text.length ? '...' : '');
  }

  function closeSearch() {
    if (searchResults) {
      searchResults.classList.remove('active');
    }
    state.searchActive = false;
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // ---- SPA Navigation ----
  var loadingBar = null;

  function createLoadingBar() {
    loadingBar = document.createElement('div');
    loadingBar.id = 'spa-loading';
    document.body.appendChild(loadingBar);
  }

  function showLoading() {
    if (loadingBar) {
      loadingBar.className = 'active';
    }
  }

  function hideLoading() {
    if (loadingBar) {
      loadingBar.className = 'done';
      setTimeout(function() {
        loadingBar.className = '';
      }, 500);
    }
  }

  function bindSpaLinks() {
    document.addEventListener('click', function(e) {
      var link = e.target.closest('a');
      if (!link) return;

      var href = link.getAttribute('href');
      if (!href) return;

      // Skip external links, anchors, and non-GET links
      if (href.indexOf('://') !== -1 && href.indexOf(window.location.host) === -1) return;
      if (href.startsWith('#')) return;
      if (href.startsWith('mailto:')) return;
      if (link.target === '_blank') return;

      // SPA navigation
      e.preventDefault();
      spaNavigate(href);
    });
  }

  function spaNavigate(url) {
    if (url === state.currentUrl) return;

    showLoading();

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function() {
      if (xhr.status === 200) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(xhr.responseText, 'text/html');

        // Update content
        var newContent = doc.getElementById('terminal-content');
        var currentContent = document.getElementById('terminal-content');
        if (newContent && currentContent) {
          currentContent.innerHTML = newContent.innerHTML;
        }

        // Update title
        var newTitle = doc.querySelector('title');
        if (newTitle) {
          document.title = newTitle.textContent;
        }

        // Update URL
        history.pushState({}, '', url);
        state.currentUrl = url;

        // Scroll to top
        window.scrollTo(0, 0);

        // Re-init dynamic content
        initHighlight();
        initMath();
        bindPostClicks();
        updateActiveLink();

        hideLoading();
      } else {
        hideLoading();
        window.location.href = url;
      }
    };
    xhr.onerror = function() {
      hideLoading();
      window.location.href = url;
    };
    xhr.send();
  }

  // Handle back/forward
  window.addEventListener('popstate', function() {
    var url = window.location.pathname;
    if (url !== state.currentUrl) {
      spaNavigate(url);
    }
  });

  // ---- Post Click Navigation ----
  function bindPostClicks() {
    var postItems = document.querySelectorAll('.post-item[data-url]');
    postItems.forEach(function(item) {
      item.addEventListener('click', function(e) {
        if (e.target.tagName === 'A') return;
        var url = item.getAttribute('data-url');
        if (url) {
          spaNavigate(url);
        }
      });
    });
  }

  // ---- Code Block Enhancements ----
  function initHighlight() {
    // Add copy button and language label to figure.highlight blocks (Hexo server-side rendered)
    document.querySelectorAll('#terminal-content figure.highlight').forEach(function(figure) {
      if (figure.querySelector('.code-header')) return;

      var header = document.createElement('div');
      header.className = 'code-header';
      header.style.cssText = 'display:flex;justify-content:flex-end;padding:2px 8px;background:var(--bg);border-bottom:1px solid var(--border-color);';

      // Extract language from class (e.g. "highlight bash")
      var classes = figure.className.split(/\s+/);
      var langName = '';
      for (var i = 0; i < classes.length; i++) {
        if (classes[i] !== 'highlight') {
          langName = classes[i];
          break;
        }
      }

      if (langName) {
        var langLabel = document.createElement('span');
        langLabel.className = 'code-lang';
        langLabel.style.cssText = 'color:var(--fg-gray);font-size:0.9rem;margin-right:auto;';
        langLabel.textContent = langName;
        header.appendChild(langLabel);
      }

      var copyBtn = document.createElement('span');
      copyBtn.className = 'copy-btn';
      copyBtn.style.cssText = 'color:var(--fg-gray);cursor:pointer;font-size:0.9rem;';
      copyBtn.textContent = '[copy]';
      copyBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        var codeEl = figure.querySelector('.code pre') || figure.querySelector('code');
        if (codeEl) {
          var text = codeEl.textContent;
          navigator.clipboard.writeText(text).then(function() {
            copyBtn.textContent = '[copied]';
            setTimeout(function() {
              copyBtn.textContent = '[copy]';
            }, 2000);
          }).catch(function() {
            var range = document.createRange();
            range.selectNodeContents(codeEl);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            document.execCommand('copy');
            sel.removeAllRanges();
            copyBtn.textContent = '[copied]';
            setTimeout(function() {
              copyBtn.textContent = '[copy]';
            }, 2000);
          });
        }
      });
      header.appendChild(copyBtn);

      figure.insertBefore(header, figure.firstChild);
    });

    // Also handle plain pre>code blocks (not wrapped in figure)
    document.querySelectorAll('#terminal-content pre:not(figure pre)').forEach(function(pre) {
      if (pre.querySelector('.code-header')) return;
      if (pre.closest('figure.highlight')) return;

      var header = document.createElement('div');
      header.className = 'code-header';
      header.style.cssText = 'display:flex;justify-content:flex-end;padding:2px 8px;background:var(--bg);border-bottom:1px solid var(--border-color);';

      var lang = pre.querySelector('code');
      var langClass = lang ? lang.className.match(/language-(\w+)/) : null;
      var langName = langClass ? langClass[1] : '';

      if (langName) {
        var langLabel = document.createElement('span');
        langLabel.className = 'code-lang';
        langLabel.style.cssText = 'color:var(--fg-gray);font-size:0.9rem;margin-right:auto;';
        langLabel.textContent = langName;
        header.appendChild(langLabel);
      }

      var copyBtn = document.createElement('span');
      copyBtn.className = 'copy-btn';
      copyBtn.style.cssText = 'color:var(--fg-gray);cursor:pointer;font-size:0.9rem;';
      copyBtn.textContent = '[copy]';
      copyBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        var code = pre.querySelector('code');
        if (code) {
          navigator.clipboard.writeText(code.textContent).then(function() {
            copyBtn.textContent = '[copied]';
            setTimeout(function() {
              copyBtn.textContent = '[copy]';
            }, 2000);
          }).catch(function() {
            var range = document.createRange();
            range.selectNodeContents(code);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            document.execCommand('copy');
            sel.removeAllRanges();
            copyBtn.textContent = '[copied]';
            setTimeout(function() {
              copyBtn.textContent = '[copy]';
            }, 2000);
          });
        }
      });
      header.appendChild(copyBtn);

      pre.insertBefore(header, pre.firstChild);
    });
  }

  // ---- Math Rendering ----
  function initMath() {
    if (typeof renderMathInElement !== 'undefined') {
      var contentEl = document.getElementById('terminal-content');
      if (contentEl) {
        renderMathInElement(contentEl, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true }
          ],
          throwOnError: false
        });
      }
    }
  }

  // ---- Utility ----
  function debounce(fn, delay) {
    var timer;
    return function() {
      var context = this;
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function() {
        fn.apply(context, args);
      }, delay);
    };
  }

  // ---- Boot ----
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
