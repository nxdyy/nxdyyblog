import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 与 Hexo 一致，将无时区的日期按本地时间（Asia/Shanghai）解读：
// YAML 无时区时间戳会被解析为 UTC，这里把 UTC 墙上时间重新解释为本地时间
const localDate = z
  .coerce.date()
  .transform((d) => new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()));

// id = 文件名（去掉 .md），与旧 Hexo 站 permalink :title 完全一致，保证 URL 不变
const blog = defineCollection({
  loader: glob({
    pattern: '*.md',
    base: './src/content/blog',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    date: localDate,
    updated: localDate.optional(),
    tags: z.array(z.string()).default([]),
    categories: z.array(z.string()).default([]),
    /** 置顶文章 */
    top: z.boolean().optional(),
  }),
});

export const collections = { blog };
