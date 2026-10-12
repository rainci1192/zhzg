// app/students/showcase/page.tsx
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Link from 'next/link';
import { getContentPage, mediaUrl, type StrapiMedia } from '@/lib/strapi-content';

const PAGE_SIZE = 6; // 3列 × 2行

type ShowcaseItem = {
  id: number;
  name: string;
  description: string | null;
  image: StrapiMedia | null;
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

export default async function StudentsShowcase({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const currentPage = Math.max(1, Number(sp?.page || '1') || 1);

  const sidebarItems = [
    { name: '学生管理', href: '/students/management' },
    { name: '学生活动', href: '/students/activities' },
    { name: '学生风采', href: '/students/showcase' },
  ];

  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '学生工作', href: '/students/management' },
    { name: '学生风采', href: '/students/showcase' },
  ];

  const result = await getContentPage<ShowcaseItem>('student-showcases', currentPage, PAGE_SIZE);
  const { page: safePage, pageCount } = result.meta.pagination;
  const totalPages = Math.max(1, pageCount);
  const items = result.data;
  const pageNumbers = getPageNumbers(safePage, totalPages);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">学生风采</h1>
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-6">
            <aside className="w-64 flex-shrink-0">
              <Sidebar title="学生工作" items={sidebarItems} />
            </aside>

            <div className="flex-1">
              {items.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-gray-500">暂无学生风采数据</div>
              ) : (
                <div className="grid grid-cols-3 gap-6">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="group bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                    >
                      {/* 图片区域 */}
                      <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-100">
                        {mediaUrl(item.image) ? (
                          <img
                            src={mediaUrl(item.image)!}
                            alt={item.name}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400">暂无图片</div>
                        )}
                        {/* hover 遮罩 */}
                        <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/20 transition-all duration-300"></div>
                      </div>

                      {/* 文字区域 */}
                      <div className="p-4">
                        <h3 className="text-base font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300 mb-2 line-clamp-1">
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* 底部蓝色进度条 */}
                      <div className="h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                    </div>
                  ))}
                </div>
              )}

              {/* 分页 */}
              <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
                {safePage > 1 ? (
                  <Link
                    href={`/students/showcase?page=${safePage - 1}`}
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
                      href={`/students/showcase?page=${p}`}
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
                    href={`/students/showcase?page=${safePage + 1}`}
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
