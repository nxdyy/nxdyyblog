import { useEffect } from 'react';

interface SpaRouterProps {
  animation: 'fade' | 'slide' | 'scale';
  duration: number;
}

const SEARCH_PATH = '/search/';

function shouldIntercept(link: HTMLAnchorElement): boolean {
  const href = link.getAttribute('href');
  if (!href) return false;
  if (href === '#') return false;
  if (link.target === '_blank') return false;
  if (link.hasAttribute('download')) return false;
  if (href.startsWith('#')) return false;
  if (href.startsWith('javascript')) return false;
  if (href.startsWith('mailto:')) return false;
  if (href.startsWith('tel:')) return false;

  // 搜索页含交互状态，走完整加载
  if (href.startsWith(SEARCH_PATH)) return false;

  if (href.startsWith('/')) return true;
  if (href.startsWith(window.location.origin)) return true;
  return false;
}

function animate(el: HTMLElement, kind: 'out' | 'in', { animation, duration }: SpaRouterProps, done: () => void) {
  const finish = () => {
    el.style.transition = '';
    el.style.opacity = '';
    el.style.transform = '';
    done();
  };

  requestAnimationFrame(() => {
    if (animation === 'fade') {
      if (kind === 'out') {
        el.style.transition = `opacity ${duration}ms var(--m3-motion-easing-standard)`;
        el.style.opacity = '0';
        setTimeout(finish, duration);
      } else {
        el.style.opacity = '0';
        el.style.transition = `opacity ${duration}ms var(--m3-motion-easing-emphasized-decelerate)`;
        requestAnimationFrame(() => {
          el.style.opacity = '1';
          setTimeout(finish, duration);
        });
      }
    } else if (animation === 'slide') {
      const offset = kind === 'out' ? '-50px' : '50px';
      const reset = kind === 'out' ? '' : 'translateX(0)';
      if (kind === 'in') el.style.transform = offset;
      el.style.opacity = kind === 'in' ? '0' : el.style.opacity || '1';
      el.style.transition = `transform ${duration}ms var(--m3-motion-easing-emphasized), opacity ${duration}ms var(--m3-motion-easing-standard)`;
      requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = reset;
        setTimeout(finish, duration);
      });
    } else if (animation === 'scale') {
      const scale = kind === 'out' ? '0.95' : '0.9';
      if (kind === 'in') {
        el.style.transform = `scale(${scale})`;
        el.style.opacity = '0';
      }
      el.style.transition = `transform ${duration}ms var(--m3-motion-easing-emphasized), opacity ${duration}ms var(--m3-motion-easing-standard)`;
      requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = kind === 'in' ? 'scale(1)' : 'scale(0.95)';
        setTimeout(finish, duration);
      });
    } else {
      finish();
    }
  });
}

/**
 * SPA 路由（React 岛，无 UI）
 * 迁移自旧主题 router.js：拦截内部链接 → fetch → 替换 #mainstay/#sidebar → 转场动画 → 历史管理
 */
export default function SpaRouter(props: SpaRouterProps) {
  useEffect(() => {
    let isTransitioning = false;

    const emit = (name: string, detail: Record<string, unknown> = {}) => {
      document.dispatchEvent(new CustomEvent(name, { detail }));
    };

    const showLoader = () => {
      const loader = document.getElementById('page-loader');
      if (loader) {
        loader.classList.add('visible');
        loader.style.display = 'block';
      }
      document.body.classList.add('page-transitioning');
    };

    const hideLoader = () => {
      const loader = document.getElementById('page-loader');
      if (loader) {
        loader.classList.remove('visible');
        setTimeout(() => {
          loader.style.display = 'none';
        }, 400);
      }
      document.body.classList.remove('page-transitioning');
    };

    const navigateTo = (url: string, pushState: boolean) => {
      if (isTransitioning) return;
      const currentPath = window.location.pathname + window.location.search;
      const targetPath = url.replace(window.location.origin, '');
      if (targetPath === currentPath) return;

      isTransitioning = true;
      emit('spa:beforenavigate', { url });

      if (pushState) history.pushState({ url }, '', url);

      const mainstay = document.getElementById('mainstay');
      const sidebar = document.getElementById('sidebar');

      animate(mainstay || document.body, 'out', props, () => {
        showLoader();
        fetch(url, { credentials: 'same-origin' })
          .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.text();
          })
          .then((html) => {
            hideLoader();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const main = doc.querySelector('#mainstay');
            const side = doc.querySelector('#sidebar');
            const title = doc.querySelector('title');

            if (title) document.title = title.textContent || document.title;
            if (mainstay && main) mainstay.innerHTML = main.innerHTML;
            if (sidebar && side) sidebar.innerHTML = side.innerHTML;

            // 先回到页顶再播放入场动画，避免看到新页面中间位置
            window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
            animate(mainstay || document.body, 'in', props, () => {
              isTransitioning = false;
              emit('spa:afternavigate', { url });
            });
          })
          .catch(() => {
            hideLoader();
            isTransitioning = false;
            window.location.href = url;
          });
      });
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a');
      if (!link || !shouldIntercept(link)) return;
      e.preventDefault();
      const href = link.getAttribute('href')!;
      navigateTo(href.startsWith('/') ? window.location.origin + href : href, true);
    };

    const onPopState = () => {
      navigateTo(window.location.href, false);
    };

    document.addEventListener('click', onClick);
    window.addEventListener('popstate', onPopState);

    if (!history.state) {
      history.replaceState({ url: window.location.href }, '', window.location.href);
    }

    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('popstate', onPopState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 纯逻辑组件，不渲染任何 UI
  return <></>;
}
