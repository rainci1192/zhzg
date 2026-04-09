// app/documents/policies/page.tsx
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Link from 'next/link';
import pool from '@/lib/db';

const PAGE_SIZE = 5;

type PolicyDocument = {
  id: number;
  title: string;
  slug: string;
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

export default async function DocumentsPolicies({
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
    { name: '政策文件', href: '/documents/policies' },
  ];

  const countRes = await pool.query(
    `SELECT COUNT(*)::int AS total FROM policy_documents WHERE is_active = true`
  );

  const total = countRes.rows[0]?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const safeOffset = (safePage - 1) * PAGE_SIZE;

  const listRes = await pool.query(
    `
    SELECT id, title, slug, publish_time
    FROM policy_documents
    WHERE is_active = true
    ORDER BY sort_order, publish_time DESC NULLS LAST, id DESC
    LIMIT $1 OFFSET $2
    `,
    [PAGE_SIZE, safeOffset]
  );

  const documents: PolicyDocument[] = listRes.rows;
  const pageNumbers = getPageNumbers(safePage, totalPages);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">政策文件</h1>
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-6">
            <aside className="w-64 flex-shrink-0">
              <Sidebar title="管理文件" items={sidebarItems} />
            </aside>

            <div className="flex-1 bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-600">政策文件</h2>

              {documents.length === 0 ? (
                <div className="text-gray-500">暂无政策文件</div>
              ) : (
                <ul className="space-y-4">
                  {documents.map((doc) => (
                    <li
                      key={doc.id}
                      className="border-l-4 border-blue-600 pl-4 py-3 hover:bg-blue-50 transition-colors duration-300"
                    >
                      <Link href={`/documents/policies/${doc.slug}`} className="block">
                        <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors mb-2">
                          {doc.title}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {doc.publish_time
                            ? new Date(doc.publish_time).toLocaleDateString('zh-CN')
                            : '--'}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              {/* 分页 */}
              <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
                {safePage > 1 ? (
                  <Link
                    href={`/documents/policies?page=${safePage - 1}`}
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
                      href={`/documents/policies?page=${p}`}
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
                    href={`/documents/policies?page=${safePage + 1}`}
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
