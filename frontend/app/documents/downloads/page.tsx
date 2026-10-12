// app/documents/downloads/page.tsx
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { getContentPage, mediaUrl, mediaSize, type StrapiMedia } from '@/lib/strapi-content';

const PAGE_SIZE = 5;

type DownloadFile = {
  id: number;
  title: string;
  file: StrapiMedia | null;
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

export default async function DocumentsDownloads({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const currentPage = Math.max(1, Number(sp?.page || '1') || 1);

  const sidebarItems = [
    { name: '政策文件', href: '/documents/policies' },
    { name: '资料下载', href: '/documents/downloads' },
  ];

  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '管理文件', href: '/documents/policies' },
    { name: '资料下载', href: '/documents/downloads' },
  ];

  const result = await getContentPage<DownloadFile>('download-files', currentPage, PAGE_SIZE);
  const { page: safePage, pageCount } = result.meta.pagination;
  const totalPages = Math.max(1, pageCount);
  const files = result.data;
  const pageNumbers = getPageNumbers(safePage, totalPages);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">资料下载</h1>
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-6">
            <aside className="w-64 flex-shrink-0">
              <Sidebar title="管理文件" items={sidebarItems} />
            </aside>

            <div className="flex-1 bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-600">资料下载</h2>

              {files.length === 0 ? (
                <div className="text-gray-500">暂无下载资料</div>
              ) : (
                <ul className="space-y-4">
                  {files.filter((file) => mediaUrl(file.file)).map((file) => (
                    <li
                      key={file.id}
                      className="group border-l-4 border-blue-600 pl-4 py-3 hover:bg-blue-50 transition-colors duration-300"
                    >
                      <div className="flex items-center justify-between gap-4">
                        {/* 标题（点击下载） */}
                        <a
                          href={mediaUrl(file.file)!}
                          download={file.file?.name}
                          className="flex-1 min-w-0"
                        >
                          <span className="text-gray-800 font-medium group-hover:text-blue-600 transition-colors duration-300 line-clamp-1">
                            {file.title || file.file?.name}
                          </span>
                          {file.file && (
                            <span className="text-xs text-gray-400 ml-2">({mediaSize(file.file)})</span>
                          )}
                        </a>

                        {/* 下载按钮 */}
                        <a
                          href={mediaUrl(file.file)!}
                          download={file.file?.name}
                          className="flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-full opacity-0 group-hover:opacity-100 hover:bg-blue-700 active:scale-95 transition-all duration-300 translate-x-2 group-hover:translate-x-0"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                          下载
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/* 分页 */}
              <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
                {safePage > 1 ? (
                  <a
                    href={`/documents/downloads?page=${safePage - 1}`}
                    className="px-4 py-2 bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
                  >
                    上一页
                  </a>
                ) : (
                  <span className="px-4 py-2 bg-gray-100 text-gray-400 rounded cursor-not-allowed">
                    上一页
                  </span>
                )}

                {pageNumbers.map((p, idx) =>
                  p === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 py-2 text-gray-400">...</span>
                  ) : (
                    <a
                      key={p}
                      href={`/documents/downloads?page=${p}`}
                      className={`px-4 py-2 rounded transition-colors ${
                        p === safePage
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {p}
                    </a>
                  )
                )}

                {safePage < totalPages ? (
                  <a
                    href={`/documents/downloads?page=${safePage + 1}`}
                    className="px-4 py-2 bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
                  >
                    下一页
                  </a>
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
