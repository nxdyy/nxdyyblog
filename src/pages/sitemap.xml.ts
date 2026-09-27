import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { SITE, getPostUrl, sortPostsDesc } from '../lib/utils';

export const GET: APIRoute = async () => {
  const posts = sortPostsDesc(await getCollection('blog'));
  const staticPages = ['/', '/archives/', '/tags/', '/categories/', '/about/', '/license/'];
  const urls = [...staticPages, ...posts.map((p) => getPostUrl(p))];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((u) => {
    const loc = new URL(u, SITE.url).href;
    return `  <url><loc>${loc}</loc></url>`;
  })
  .join('\n')}
</urlset>`;
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
