// app/cooperation/news/page.tsx
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Link from 'next/link';
import pool from '@/lib/db';

const PAGE_SIZE = 5;

type CooperationNewsItem = {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  publish_time: string | null;
};

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  if (current > 4) pages.push('...');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 3) pages.push('...');
  pages.push(total);
  return pages;
}

export default async function CooperationNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const currentPage = Math.max(1, Number(sp?.page || '1') || 1);

  const sidebarItems = [
    { name: '合作动态', href: '/cooperation/news' },
    { name: '合作单位', href: '/cooperation/partners' },
  ];

  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '校企合作', href: '/cooperation/news' },
    { name: '合作动态', href: '/cooperation/news' },
  ];

  const countRes = await pool.query(
    `
    SELECT COUNT(*)::int AS total
    FROM articles a
    JOIN categories c ON c.id = a.category_id
    WHERE a.status = 'published'
      AND c.slug = 'cooperation-news'
    `
  );

  const total = countRes.rows[0]?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const safeOffset = (safePage - 1) * PAGE_SIZE;

  const listRes = await pool.query(
    `
    SELECT a.id, a.title, a.slug, a.summary, a.publish_time
    FROM articles a
    JOIN categories c ON c.id = a.category_id
    WHERE a.status = 'published'
      AND c.slug = 'cooperation-news'
    ORDER BY a.is_top DESC, a.publish_time DESC NULLS LAST, a.id DESC
    LIMIT $1 OFFSET $2
    `,
    [PAGE_SIZE, safeOffset]
  );

  const list: CooperationNewsItem[] = listRes.rows;
  const pageNumbers = getPageNumbers(safePage, totalPages);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">合作动态</h1>
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-6">
            <aside className="w-64 flex-shrink-0">
              <Sidebar title="校企合作" items={sidebarItems} />
            </aside>

            <div className="flex-1">
              {list.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-gray-500">暂无合作动态</div>
              ) : (
                <div className="space-y-4">
                  {list.map((item) => {
                    const date = item.publish_time ? new Date(item.publish_time) : null;
                    const day = date ? String(date.getDate()).padStart(2, '0') : '--';
                    const month = date ? String(date.getMonth() + 1).padStart(2, '0') : '--';
                    const year = date ? date.getFullYear() : '--';

                    return (
                      <Link
                        key={item.id}
                        href={`/article/${item.slug}?from=cooperation`}
                        className="group block bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                      >
                        <div className="flex items-stretch">
                          {/* 蓝色主调日期卡片 */}
                          <div className="relative w-20 flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-500">
                            <div className="h-full flex flex-col items-center justify-center p-3 relative overflow-hidden">
                              {/* 背景光效 */}
                              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                              
                              {/* 日期内容 */}
                              <div className="relative z-10 text-center">
                                <div className="text-3xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                                  {day}
                                </div>
                                <div className="text-xs text-blue-100 mt-0.5">
                                  {year}
                                </div>
                                <div className="text-xs font-semibold text-white mt-0.5">
                                  {month}月
                                </div>
                              </div>

                              {/* 装饰性光点 */}
                              <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-white/60 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                              <div className="absolute bottom-2 left-2 w-1 h-1 bg-white/40 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                            </div>
                          </div>

                          {/* 内容区域 */}
                          <div className="flex-1 p-5 relative">
                            <div className="relative z-10">
                              <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300 mb-2 leading-relaxed">
                                {item.title}
                              </h3>
                              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                {item.summary || '暂无摘要'}
                              </p>
                            </div>

                            {/* 右侧箭头 */}
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* 底部蓝色进度条 */}
                        <div className="h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                      </Link>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
                {safePage > 1 ? (
                  <Link
                    href={`/cooperation/news?page=${safePage - 1}`}
                    className="px-4 py-2 bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
                  >
                    上一页
                  </Link>
                ) : (
                  <span className="px-4 py-2 bg-gray-100 text-gray-400 rounded cursor-not-allowed">
                    上一页
                  </span>
                )}

                {pageNumbers.map((p, idx) =>
                  p === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 py-2 text-gray-400">...</span>
                  ) : (
                    <Link
                      key={p}
                      href={`/cooperation/news?page=${p}`}
                      className={`px-4 py-2 rounded transition-colors ${
                        p === safePage
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {p}
                    </Link>
                  )
                )}

                {safePage < totalPages ? (
                  <Link
                    href={`/cooperation/news?page=${safePage + 1}`}
                    className="px-4 py-2 bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
                  >
                    下一页
                  </Link>
                ) : (
                  <span className="px-4 py-2 bg-gray-100 text-gray-400 rounded cursor-not-allowed">
                    下一页
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
