// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vue from '@astrojs/vue';

export default defineConfig({
  site: 'https://blog.nxdyy.cn',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  vite: {
    build: {
      // lightningcss 会丢弃与 -webkit- 前缀重复的标准属性（backdrop-filter 被剥掉导致磨砂失效），改用 esbuild 保留双声明
      cssMinify: 'esbuild',
    },
  },
  markdown: {
    shikiConfig: {
      theme: 'one-dark-pro',
      wrap: false,
    },
  },
  integrations: [
    react(),
    vue({
      template: {
        compilerOptions: {
          // 允许在 Vue 模板中直接使用 Material Web 自定义元素
          isCustomElement: (tag) => tag.startsWith('md-'),
        },
      },
    }),
  ],
});
