'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getHomeNotices, type ArticleItem } from '@/lib/api';

function parts(value?: string) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return { day: '--', month: '----.--' };
  return { day: String(date.getDate()).padStart(2, '0'), month: `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}` };
}

export default function NoticeList() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getHomeNotices()
      .then((result) => { if (alive) setArticles(Array.isArray(result?.data) ? result.data : []); })
      .catch((error) => { console.error('首页公告加载失败:', error); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  return (
    <div className="home-section-inner">
      <div className="home-section-heading">
        <div><span className="home-section-kicker">NOTICES & ANNOUNCEMENTS <span>02 / 03</span></span><h2>通知公告</h2><p>重要信息及时发布，为学习与工作提供清晰指引。</p></div>
        <Link href="/notice" className="home-section-more">全部公告 <span aria-hidden="true">↗</span></Link>
      </div>
      {loading ? (
        <div className="home-notice-grid" aria-label="公告加载中">{Array.from({ length: 4 }, (_, index) => <div className="home-loading-block" key={index} />)}</div>
      ) : articles.length === 0 ? (
        <div className="home-empty">暂无通知公告，欢迎稍后再来。</div>
      ) : (
        <div className="home-notice-grid">
          {articles.slice(0, 6).map((article) => {
            const date = parts(article.publish_time);
            return (
              <Link href={`/article/${article.slug}?from=notice`} className="home-notice-item" key={article.id}>
                <time className="home-notice-date"><strong>{date.day}</strong><span>{date.month}</span></time>
                <span className="home-notice-title">{article.title}</span>
                <span className="home-notice-arrow" aria-hidden="true">↗</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
