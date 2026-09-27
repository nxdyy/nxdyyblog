import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { SITE, getPostUrl, sortPostsDesc } from '../lib/utils';

export const GET: APIRoute = async () => {
  const posts = sortPostsDesc(await getCollection('blog'));
  const staticPages = ['/', '/archives/', '/tags/', '/categories/', '/about/', '/license/'];
  const urls = [...staticPages, ...posts.map((p) => getPostUrl(p))];
  const txt = urls.map((u) => new URL(u, SITE.url).href).join('\n');
  return new Response(txt + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
