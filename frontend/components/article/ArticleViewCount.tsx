'use client';

import { useEffect, useState } from 'react';

const COUNT_WINDOW_MS = 30 * 60 * 1000;

export default function ArticleViewCount({ slug, initialCount }: { slug: string; initialCount: number }) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    const key = `article-view:${slug}`;
    const now = Date.now();
    let last = 0;
    try { last = Number(localStorage.getItem(key)) || 0; } catch { /* storage may be disabled */ }
    const method = last > 0 && now - last < COUNT_WINDOW_MS ? 'GET' : 'POST';
    if (method === 'POST') {
      try { localStorage.setItem(key, String(now)); } catch { /* continue without storage */ }
    }
    fetch(`/api/article-views/${encodeURIComponent(slug)}`, { method, cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error('点击数请求失败');
        return response.json() as Promise<{ data?: { view_count?: number } }>;
      })
      .then((result) => {
        const current = result?.data?.view_count;
        if (typeof current === 'number' && Number.isSafeInteger(current) && current >= 0) setCount(current);
      })
      .catch(() => {
        if (method === 'POST') {
          try { if (localStorage.getItem(key) === String(now)) localStorage.removeItem(key); } catch { /* ignore */ }
        }
      });
  }, [slug]);

  return <span>点击数：<span className="tabular-nums">{count.toLocaleString('zh-CN')}</span></span>;
}
