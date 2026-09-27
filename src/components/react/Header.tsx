import { useEffect, useRef, useState } from 'react';

export interface NavMenuItem {
  title: string;
  icon: string;
  url: string;
  dropdown?: number;
}

interface DropdownEntry {
  name: string;
  url: string;
}

interface HeaderProps {
  menu: NavMenuItem[];
  siteTitle: string;
  /** 下拉数据（标签/分类，按使用量排序取前 N） */
  tags: DropdownEntry[];
  categories: DropdownEntry[];
}

function isActivePath(currentPath: string, url: string): boolean {
  const path = currentPath.replace(/\/index\.html$/, '/').replace(/\/+$/, '/') || '/';
  if (url === '/') return path === '/';
  return path === url || path.startsWith(url);
}

/**
 * 顶部导航（React 岛）
 * - 桌面导航 + 搜索框 + 标签/分类下拉（md-menu）
 * - 移动端汉堡菜单 + md-navigation-drawer
 * - 监听 SPA 导航事件，更新高亮
 */
export default function Header({ menu, siteTitle, tags, categories }: HeaderProps) {
  const [currentPath, setCurrentPath] = useState('/');
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const update = () => setCurrentPath(window.location.pathname);
    update();
    document.addEventListener('spa:afternavigate', update);
    window.addEventListener('popstate', update);
    return () => {
      document.removeEventListener('spa:afternavigate', update);
      window.removeEventListener('popstate', update);
    };
  }, []);

  // 组件内部关闭（遮罩点击 / Esc）时同步 pointer-events 开关类
  useEffect(() => {
    const drawer = drawerRef.current;
    if (!drawer) return;
    const syncOpenClass = (e: Event) => {
      const opened = !!(e as CustomEvent).detail?.opened;
      drawer.classList.toggle('drawer-open', opened);
    };
    drawer.addEventListener('navigation-drawer-changed', syncOpenClass);
    return () => drawer.removeEventListener('navigation-drawer-changed', syncOpenClass);
  }, []);

  const toggleDrawer = () => {
    const drawer = drawerRef.current as any;
    if (drawer) {
      drawer.opened = !drawer.opened;
      drawer.classList.toggle('drawer-open', drawer.opened);
    }
  };

  const renderDropdown = (m: NavMenuItem) => {
    const entries = m.url.startsWith('/tags') ? tags : categories;
    const menuId = `menu-${m.url.replace(/\//g, '')}`;
    const anchorId = `nav-dropdown-${m.url.replace(/\//g, '')}`;
    return (
      <div className="nav-item nav-dropdown" id={anchorId} key={m.url}>
        <button
          className="nav-dropdown-trigger"
          onClick={() => {
            const el = document.getElementById(menuId) as any;
            if (el) el.open = !el.open;
          }}
        >
          <span className="material-symbols-outlined">{m.icon}</span>
          <span className="nav-label">{m.title}</span>
          <span className="material-symbols-outlined dropdown-arrow">expand_more</span>
        </button>
        {/* 无数据时渲染空弹层是显示 bug，回退为普通导航链接 */}
        {entries.length > 0 && (
          <md-menu id={menuId} positioning="popover" anchor={anchorId}>
            {entries.slice(0, m.dropdown).map((entry) => (
              <md-menu-item key={entry.url}>
                <a href={entry.url} slot="headline">
                  {entry.name}
                </a>
              </md-menu-item>
            ))}
            {entries.length > (m.dropdown ?? 0) && (
              <>
                <md-divider />
                <md-menu-item>
                  <a href={m.url} slot="headline">
                    查看全部...
                  </a>
                </md-menu-item>
              </>
            )}
          </md-menu>
        )}
      </div>
    );
  };

  return (
    <>
      <header className="material-header" id="gal-header">
        <div className="material-header-inner">
          <div className="header-brand">
            <a href="/">
              <span className="brand-text">{siteTitle}</span>
            </a>
          </div>

          <form className="header-search" action="/search/" method="get">
            <span className="material-symbols-outlined search-icon">search</span>
            <input
              type="text"
              name="s"
              placeholder="搜索文章..."
              autoComplete="off"
              className="header-search-input"
            />
          </form>

          <nav className="header-nav" id="desktop-nav">
            {menu.map((m) => {
              const hasEntries =
                m.url.startsWith('/tags') ? tags.length > 0 : m.url.startsWith('/categories') ? categories.length > 0 : false;
              return m.dropdown && hasEntries ? (
                renderDropdown(m)
              ) : (
                <a
                  key={m.url}
                  href={m.url}
                  className={`nav-item ${isActivePath(currentPath, m.url) ? 'active' : ''}`}
                >
                  <span className="material-symbols-outlined">{m.icon}</span>
                  <span className="nav-label">{m.title}</span>
                </a>
              );
            })}
          </nav>

          <button
            className="mobile-menu-btn"
            id="mobile-menu-btn"
            onClick={toggleDrawer}
            aria-label="打开菜单"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </header>

      {/* 移动端导航抽屉（labs 的 modal 变体是独立元素，标准版无 type 属性） */}
      <md-navigation-drawer-modal ref={drawerRef} id="mobile-drawer">
        <div className="drawer-header">
          <span className="drawer-brand-text">{siteTitle}</span>
        </div>
        <md-divider />
        <nav className="drawer-nav">
          {menu.map((m) => (
            <div key={m.url} className="drawer-nav-group">
              <a
                href={m.url}
                className={`drawer-nav-item ${isActivePath(currentPath, m.url) ? 'active' : ''}`}
                onClick={toggleDrawer}
              >
                <span className="material-symbols-outlined">{m.icon}</span>
                <span>{m.title}</span>
              </a>
              {m.dropdown && (m.url.includes('tags') || m.url.includes('categories')) && (
                <div className="drawer-sub-items">
                  {(m.url.includes('tags') ? tags : categories)
                    .slice(0, m.dropdown)
                    .map((entry) => (
                      <a key={entry.url} href={entry.url} className="drawer-sub-item" onClick={toggleDrawer}>
                        <span>{entry.name}</span>
                      </a>
                    ))}
                  <a href={m.url} className="drawer-sub-item view-all" onClick={toggleDrawer}>
                    <span>查看全部...</span>
                  </a>
                </div>
              )}
            </div>
          ))}
        </nav>
      </md-navigation-drawer-modal>
    </>
  );
}
