import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/layout/PageHero';
import { getPageNumbers } from '@/lib/pagination';
import type { ListArticleItem } from '@/lib/api';

type Props = {
  title: string;
  path: '/news' | '/notice';
  from: 'news' | 'notice';
  items: ListArticleItem[];
  page: number;
  pageCount: number;
  total: number;
};

export default function EditorialListing({ title, path, from, items, page, pageCount, total }: Props) {
  const pages = getPageNumbers(page, pageCount);
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="site-subpage flex-1">
        <PageHero title={title} items={[{ name: '首页', href: '/' }, { name: title, href: path }]} />
        <div className="site-editorial-wrap">
          <div className="site-list-intro">
            <div><span className="site-list-kicker">NEWS &amp; UPDATES</span><h2>{title}</h2></div>
            <p>共 {total} 条 · 第 {page} / {pageCount} 页</p>
          </div>
          {items.length === 0 ? (
            <div className="site-list-empty">暂无{title}内容</div>
          ) : (
            <div className="site-editorial-list">
              {items.map((item) => {
                const date = item.publish_time ? new Date(item.publish_time) : null;
                const valid = date && !Number.isNaN(date.getTime());
                return (
                  <Link key={item.id} href={`/article/${encodeURIComponent(item.slug)}?from=${from}`} className="site-editorial-item">
                    <span className="site-editorial-date" aria-label={valid ? date.toLocaleDateString('zh-CN') : '暂无日期'}>
                      <strong>{valid ? String(date.getDate()).padStart(2, '0') : '--'}</strong>
                      <small>{valid ? `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}` : '----.--'}</small>
                    </span>
                    <span className="site-editorial-copy">
                      <strong>{item.title}</strong>
                      {item.summary && <span>{item.summary}</span>}
                    </span>
                    <span className="site-editorial-arrow" aria-hidden="true">↗</span>
                  </Link>
                );
              })}
            </div>
          )}
          {pageCount > 1 && (
            <nav className="site-pagination" aria-label={`${title}分页`}>
              {page > 1 ? <Link href={`${path}?page=${page - 1}`}>上一页</Link> : <span className="is-disabled">上一页</span>}
              {pages.map((p, index) => p === '...'
                ? <span key={`ellipsis-${index}`} className="is-ellipsis">…</span>
                : <Link key={p} href={`${path}?page=${p}`} aria-current={p === page ? 'page' : undefined}>{p}</Link>)}
              {page < pageCount ? <Link href={`${path}?page=${page + 1}`}>下一页</Link> : <span className="is-disabled">下一页</span>}
            </nav>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
