export const SITE = {
  title: "nxdyy's 摆烂小站",
  subtitle: 'nxdyy的摆烂小站',
  description: 'nxdyy突发奇想搭建的博客',
  author: 'nxdyy',
  url: 'https://blog.nxdyy.cn',
};

export const POSTS_PER_PAGE = 10;

/** 生成与旧 Hexo 站一致的 permalink：/YYYY/MM/DD/:title/ */
export function postUrl(id: string, date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `/${y}/${m}/${d}/${id}/`;
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getPostUrl(post: { id: string; data: { date: Date } }): string {
  return postUrl(post.id, post.data.date);
}

export function sortPostsDesc<T extends { data: { date: Date } }>(posts: T[]): T[] {
  return [...posts].sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** 根据标题确定性选取默认封面（避免随机导致的闪烁） */
export function previewFor(title: string, previews: string[]): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash * 31 + title.charCodeAt(i)) | 0;
  }
  const name = previews[Math.abs(hash) % previews.length];
  return `/imgs/preview/${name}`;
}

/** 去除 Markdown 语法，取纯文本摘要 */
export function stripMarkdown(md: string, length = 80): string {
  const text = md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*`~_|-]/g, ' ')
    .replace(/\\\s/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > length ? text.slice(0, length) + '…' : text;
}
