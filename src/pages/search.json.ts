import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { formatDate, getPostUrl, sortPostsDesc, stripMarkdown } from '../lib/utils';

// 搜索索引（供 /search/ 页面的 Vue 应用使用）
export const GET: APIRoute = async () => {
  const posts = sortPostsDesc(await getCollection('blog'));
  const data = posts.map((post) => ({
    title: post.data.title,
    url: getPostUrl(post),
    date: formatDate(post.data.date),
    tags: post.data.tags,
    text: stripMarkdown(post.body || '', 1200),
  }));
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
