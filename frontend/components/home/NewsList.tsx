'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getHomeNews, type ArticleItem } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

function coverUrl(url?: string) {
  if (!url) return '/images/zh-banner2.png';
  return /^https?:\/\//.test(url) ? url : `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
}

function displayDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export default function NewsList() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getHomeNews()
      .then((result) => { if (alive) setArticles(Array.isArray(result?.data) ? result.data : []); })
      .catch((error) => { console.error('首页新闻加载失败:', error); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const lead = articles[0];

  return (
    <div className="home-section-inner">
      <div className="home-section-heading">
        <div><span className="home-section-kicker">COLLEGE NEWS <span>01 / 03</span></span><h2>新闻动态</h2><p>聚焦学院发展，记录创新实践中的每一步。</p></div>
        <Link href="/news" className="home-section-more">全部新闻 <span aria-hidden="true">↗</span></Link>
      </div>

      {loading ? (
        <div className="home-news-grid" aria-label="新闻加载中"><div className="home-loading-block" /><div className="home-loading-block" /></div>
      ) : !lead ? (
        <div className="home-empty">暂无新闻动态，欢迎稍后再来。</div>
      ) : (
        <div className="home-news-grid">
          <Link className="home-news-feature" href={`/article/${lead.slug}?from=news`}>
            <Image src={coverUrl(lead.cover?.url)} alt={lead.title} fill sizes="(max-width: 860px) 100vw, 48vw" className="home-news-feature-image" />
            <div className="home-news-feature-shade" />
            <div className="home-news-feature-copy"><span>学院要闻 · {displayDate(lead.publish_time)}</span><h3>{lead.title}</h3><p>{lead.summary || '查看新闻详情，了解学院最新动态。'}</p><span className="home-news-feature-link">阅读更多 <b aria-hidden="true">↗</b></span></div>
          </Link>
          <div className="home-news-list">
            {articles.slice(1, 5).map((article, index) => (
              <Link href={`/article/${article.slug}?from=news`} className="home-news-item" key={article.id}>
                <span className="home-news-item-bg" style={article.cover?.url ? { backgroundImage: `url("${coverUrl(article.cover.url)}")` } : undefined} aria-hidden="true" />
                <span className="home-news-item-index">{String(index + 2).padStart(2, '0')}</span>
                <span className="home-news-item-content"><time>{displayDate(article.publish_time)}</time><strong>{article.title}</strong><span>{article.summary || '了解学院最新动态'}</span></span>
                <span className="home-news-item-arrow" aria-hidden="true">↗</span>
              </Link>
            ))}
            {articles.length === 1 && <div className="home-news-list-empty">更多学院动态，敬请期待。</div>}
          </div>
        </div>
      )}
    </div>
  );
}
