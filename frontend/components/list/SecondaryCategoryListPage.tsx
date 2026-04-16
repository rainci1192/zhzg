import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Link from 'next/link';
import { getSecondaryCategoryPageList } from '@/lib/api';

type ListItem = {
  id: number;
  title: string;
  slug: string;
  publish_time: string | null;
};

type SidebarItem = { name: string; href: string };
type BreadcrumbItem = { name: string; href: string };

type Props = {
  pageTitle: string;
  emptyText: string;
  secondaryCategoryName: string;
  articleFrom?: string;
  sidebarTitle: string;
  sidebarItems: SidebarItem[];
  breadcrumbItems: BreadcrumbItem[];
  listPath: string;
  pageSize?: number;
  searchParams?: { page?: string };
  primaryCategoryName?: string;
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

export default async function SecondaryCategoryListPage({
  pageTitle,
  emptyText,
  secondaryCategoryName,
  articleFrom,
  sidebarTitle,
  sidebarItems,
  breadcrumbItems,
  listPath,
  pageSize = 5,
  searchParams,
  primaryCategoryName,
}: Props) {
  const currentPage = Math.max(1, Number(searchParams?.page || '1') || 1);

  const resp = await getSecondaryCategoryPageList(
    secondaryCategoryName,
    currentPage,
    pageSize,
    primaryCategoryName ? { primaryCategoryName } : undefined
  );

  const list: ListItem[] = (resp.data || []).map((item: any) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    publish_time: item.publish_time || null,
  }));

  const total = resp.meta?.pagination?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const safePage = Math.min(currentPage, totalPages);
  const pageNumbers = getPageNumbers(safePage, totalPages);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">{pageTitle}</h1>
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-6">
            <aside className="w-64 flex-shrink-0">
              <Sidebar title={sidebarTitle} items={sidebarItems} />
            </aside>

            <div className="flex-1">
              {list.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-gray-500">{emptyText}</div>
              ) : (
                <div className="space-y-4">
                  {list.map((item) => {
                    const date = item.publish_time ? new Date(item.publish_time) : null;
                    const day = date ? String(date.getDate()).padStart(2, '0') : '--';
                    const month = date ? String(date.getMonth() + 1).padStart(2, '0') : '--';
                    const year = date ? date.getFullYear() : '--';

                    const href = articleFrom
                      ? `/article/${item.slug}?from=${articleFrom}`
                      : `/article/${item.slug}`;

                    return (
                      <Link
                        key={item.id}
                        href={href}
                        className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-transparent hover:border-blue-100"
                      >
                        {/* ⬇️ 高度从 h-24 缩小到 h-20 (80px) */}
                        <div className="flex items-stretch h-20">
                          
                          {/* 左侧正方形日期区域 (80x80) */}
                          <div className="w-20 flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 group-hover:from-blue-600 group-hover:to-blue-700 transition-colors duration-300 relative overflow-hidden flex flex-col items-center justify-center">
                            
                            {/* 装饰性背景光晕，悬浮时放大 */}
                            <div className="absolute top-0 right-0 -mt-3 -mr-3 w-10 h-10 bg-white opacity-10 rounded-full blur-md group-hover:scale-150 transition-transform duration-500"></div>

                            <div className="relative z-10 flex flex-col items-center">
                              {/* ⬇️ 日期变小为 text-2xl，悬浮时轻微上浮 */}
                              <div className="text-2xl font-bold text-white leading-none transform group-hover:-translate-y-0.5 transition-transform duration-300">
                                {day}
                              </div>
                              {/* ⬇️ 年份和月份合并，减小字号 */}
                              <div className="text-[11px] text-blue-100 mt-1 font-medium tracking-wider group-hover:text-white transition-colors duration-300">
                                {year}.{month}
                              </div>
                            </div>
                          </div>

                          {/* 右侧内容区域（仅显示标题） */}
                          <div className="flex-1 px-5 relative flex flex-col justify-center overflow-hidden">
                            <div className="relative z-10 pr-6">
                              {/* 将标题字号稍微调到 text-base 配合更矮的容器 */}
                              <h3 className="text-base font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2 leading-snug">
                                {item.title}
                              </h3>
                            </div>

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

              {/* 分页 */}
              <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
                {safePage > 1 ? (
                  <Link href={`${listPath}?page=${safePage - 1}`} className="px-4 py-2 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 text-sm">上一页</Link>
                ) : (
                  <span className="px-4 py-2 bg-gray-100 text-gray-400 rounded cursor-not-allowed text-sm">上一页</span>
                )}

                {pageNumbers.map((p, idx) =>
                  p === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 py-2 text-gray-400">...</span>
                  ) : (
                    <Link
                      key={p}
                      href={`${listPath}?page=${p}`}
                      className={`px-4 py-2 rounded transition-colors text-sm ${
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
                  <Link href={`${listPath}?page=${safePage + 1}`} className="px-4 py-2 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 text-sm">下一页</Link>
                ) : (
                  <span className="px-4 py-2 bg-gray-100 text-gray-400 rounded cursor-not-allowed text-sm">下一页</span>
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
