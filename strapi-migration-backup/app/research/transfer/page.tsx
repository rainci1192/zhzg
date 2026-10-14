import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Link from 'next/link';
import { getResearchTransfers } from '@/lib/api';

const PAGE_SIZE = 5;

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

export default async function ResearchTransfer({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const currentPage = Math.max(1, Number(sp?.page || '1') || 1);

  const sidebarItems = [
    { name: '科研机构', href: '/research/institutions' },
    { name: '科研动态', href: '/research/news' },
    { name: '成果转化', href: '/research/transfer' },
  ];

  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '科学研究', href: '/research/institutions' },
    { name: '成果转化', href: '/research/transfer' },
  ];

  const result = await getResearchTransfers(currentPage, PAGE_SIZE);
  const transferData = result.data;
  const total = result.meta?.pagination?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageNumbers = getPageNumbers(safePage, totalPages);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">成果转化</h1>
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-6">
            <aside className="w-64 flex-shrink-0">
              <Sidebar title="科学研究" items={sidebarItems} />
            </aside>

            <div className="flex-1">
              {transferData.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-gray-500">暂无成果转化数据</div>
              ) : (
                <div className="space-y-4">
                  {transferData.map((item) => {
                    const date = item.publish_time ? new Date(item.publish_time) : null;
                    const day = date ? String(date.getDate()).padStart(2, '0') : '--';
                    const yearMonth = date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` : '--';

                    return (
                      <Link
                        key={item.id}
                        href={`/research/transfer/${item.slug}`}
                        className="group block bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 p-6"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-20 flex-shrink-0 text-center">
                            <div className="text-2xl font-bold text-blue-600">{day}</div>
                            <div className="text-xs text-gray-500">{yearMonth}</div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors mb-2">
                              {item.title}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {item.summary || '暂无摘要'}
                            </p>
                            {item.attachments && item.attachments.length > 0 && (
                              <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                                <span>{item.attachments.length} 个附件</span>
                              </div>
                            )}
                          </div>
                          <svg
                            className="w-6 h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
                  {safePage > 1 ? (
                    <Link
                      href={`/research/transfer?page=${safePage - 1}`}
                      className="px-4 py-2 bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
                    >
                      上一页
                    </Link>
                  ) : (
                    <span className="px-4 py-2 bg-gray-100 text-gray-400 rounded cursor-not-allowed">上一页</span>
                  )}

                  {pageNumbers.map((p, idx) =>
                    p === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-2 py-2 text-gray-400">...</span>
                    ) : (
                      <Link
                        key={p}
                        href={`/research/transfer?page=${p}`}
                        className={`px-4 py-2 rounded transition-colors ${
                          p === safePage ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        {p}
                      </Link>
                    )
                  )}

                  {safePage < totalPages ? (
                    <Link
                      href={`/research/transfer?page=${safePage + 1}`}
                      className="px-4 py-2 bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
                    >
                      下一页
                    </Link>
                  ) : (
                    <span className="px-4 py-2 bg-gray-100 text-gray-400 rounded cursor-not-allowed">下一页</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
