/**
 * Material Web 组件注册（Material 3 Expressive）
 * 由 BaseLayout 的 <script> 引入，Vite 打包后注入每个页面。
 * 相比旧主题的 importmap/vendor 方式，改用 npm + 构建期打包。
 */
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/button/text-button.js';
import '@material/web/button/elevated-button.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/iconbutton/filled-icon-button.js';
import '@material/web/iconbutton/outlined-icon-button.js';
// Labs 组件（card / navigation）
import '@material/web/labs/card/filled-card.js';
import '@material/web/labs/card/outlined-card.js';
import '@material/web/labs/card/elevated-card.js';
import '@material/web/labs/navigationbar/navigation-bar.js';
import '@material/web/labs/navigationtab/navigation-tab.js';
import '@material/web/labs/navigationdrawer/navigation-drawer.js';
import '@material/web/labs/navigationdrawer/navigation-drawer-modal.js';
import '@material/web/labs/badge/badge.js';
// Chips
import '@material/web/chips/assist-chip.js';
import '@material/web/chips/filter-chip.js';
import '@material/web/chips/suggestion-chip.js';
import '@material/web/chips/chip-set.js';
// 其他
import '@material/web/dialog/dialog.js';
import '@material/web/divider/divider.js';
import '@material/web/fab/fab.js';
import '@material/web/list/list.js';
import '@material/web/list/list-item.js';
import '@material/web/menu/menu.js';
import '@material/web/menu/menu-item.js';
import '@material/web/progress/circular-progress.js';
import '@material/web/progress/linear-progress.js';
import '@material/web/textfield/filled-text-field.js';
import '@material/web/textfield/outlined-text-field.js';

// Material 3 字体比例样式
import { styles as typescaleStyles } from '@material/web/typography/md-typescale-styles.js';

if (typeof document !== 'undefined' && typescaleStyles.styleSheet) {
  document.adoptedStyleSheets.push(typescaleStyles.styleSheet);
}

// 防止重复注册（SPA / 多模块场景保险）
if (typeof window !== 'undefined' && !window.__mdGuardInstalled) {
  window.__mdGuardInstalled = true;
  const origDefine = customElements.define.bind(customElements);
  customElements.define = function (name, constructor, options) {
    if (customElements.get(name)) return;
    try {
      origDefine(name, constructor, options);
    } catch {
      /* ignore duplicate */
    }
  };
}
