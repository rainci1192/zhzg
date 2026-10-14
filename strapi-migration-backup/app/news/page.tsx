import type { Metadata } from 'next';
import { buildPagedMetadata } from '@/lib/seo/metadata';
import { getNewsPageList, type ListArticleItem } from '@/lib/api';
import { getPageNumbers } from '@/lib/pagination';
import { PAGE_SIZE } from '@/lib/constants';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Link from 'next/link';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const sp = await searchParams;
  return buildPagedMetadata({
    title: '新闻动态 - 国家卓越工程师学院',
    description: '国家卓越工程师学院新闻动态栏目，发布学院新闻、活动与重要资讯。',
    basePath: '/news',
    page: sp?.page,
  });
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const currentPage = Math.max(1, Number(sp?.page || '1') || 1);

  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '新闻动态', href: '/news' },
  ];

  const resp = await getNewsPageList(currentPage, PAGE_SIZE.NEWS);
  const newsItems: ListArticleItem[] = resp.data || [];

  const total = resp.meta?.pagination?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE.NEWS));
  const safePage = Math.min(currentPage, totalPages);
  const pageNumbers = getPageNumbers(safePage, totalPages);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">新闻动态</h1>
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {newsItems.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-gray-500">暂无新闻数据</div>
          ) : (
            <div className="space-y-4">
              {newsItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/article/${item.slug}?from=news`}
                  className="group block bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-sm text-gray-400 flex-shrink-0">
                        TIME:{' '}
                        {item.publish_time
                          ? new Date(item.publish_time).toLocaleDateString('zh-CN')
                          : '--'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors mb-2">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {item.summary || '暂无摘要'}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
            {safePage > 1 ? (
              <Link
                href={`/news?page=${safePage - 1}`}
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
                  href={`/news?page=${p}`}
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
                href={`/news?page=${safePage + 1}`}
                className="px-4 py-2 bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
              >
                下一页
              </Link>
            ) : (
              <span className="px-4 py-2 bg-gray-100 text-gray-400 rounded cursor-not-allowed">下一页</span>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
