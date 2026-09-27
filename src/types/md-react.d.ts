import 'react';

/**
 * Material Web 自定义元素的 React JSX 类型声明
 * React 19 原生支持 custom elements，仅需补充类型
 */
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'md-menu': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        positioning?: string;
        anchor?: string;
        open?: boolean;
      };
      'md-menu-item': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'md-divider': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'md-navigation-drawer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        type?: string;
        open?: boolean;
      };
      'md-fab': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        variant?: string;
        size?: string;
      };
      'md-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        slot?: string;
      };
      'md-outlined-text-field': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        label?: string;
        value?: string;
        placeholder?: string;
      };
      'md-filled-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        disabled?: boolean;
      };
    }
  }
}
