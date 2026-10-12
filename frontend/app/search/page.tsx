import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: '站内搜索 - 吉林大学国家卓越工程师学院(珠海)',
  description: '搜索学院网站文章',
};

type SearchResult = {
  id: number;
  title: string;
  slug: string;
  summary?: string | null;
  publish_time?: string | null;
};

type SearchResponse = {
  data?: SearchResult[];
  meta?: { pagination?: { pageCount?: number; total?: number } };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
const PAGE_SIZE = 10;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; page?: string | string[] }>;
}) {
  const params = await searchParams;
  const query = (typeof params.q === 'string' ? params.q : '').trim().slice(0, 100);
  const rawPage = typeof params.page === 'string' ? params.page : '1';
  const page = Math.min(10000, Math.max(1, Number.parseInt(rawPage, 10) || 1));
  let results: SearchResult[] = [];
  let pageCount = 0;
  let total = 0;
  let failed = false;

  if (query) {
    const qs = new URLSearchParams({ q: query, page: String(page), pageSize: String(PAGE_SIZE) });
    try {
      const response = await fetch(`${API_URL}/api/search?${qs}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = (await response.json()) as SearchResponse;
      results = Array.isArray(body.data) ? body.data : [];
      pageCount = body.meta?.pagination?.pageCount || 0;
      total = body.meta?.pagination?.total || 0;
    } catch (error) {
      console.error('搜索失败:', error);
      failed = true;
    }
  }

  const pageUrl = (target: number) =>
    `/search?${new URLSearchParams({ q: query, page: String(target) })}`;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50 px-4 py-10">
        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-sm p-6 md:p-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">站内搜索</h1>
          <form action="/search" role="search" className="flex gap-3 mb-8">
            <input
              name="q"
              type="search"
              defaultValue={query}
              maxLength={100}
              aria-label="搜索文章"
              placeholder="输入文章标题或关键词"
              className="min-w-0 flex-1 border rounded-md px-4 py-3"
            />
            <button type="submit" className="bg-blue-700 text-white rounded-md px-6 py-3">
              搜索
            </button>
          </form>

          {!query ? (
            <p className="text-gray-500">请输入关键词开始搜索。</p>
          ) : failed ? (
            <p role="alert" className="text-red-700">搜索暂时不可用，请稍后重试。</p>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-5">“{query}”的搜索结果：{total} 条</p>
              {results.length === 0 ? (
                <p className="text-gray-500">没有找到相关文章。</p>
              ) : (
                <ul className="divide-y">
                  {results.map((item) => (
                    <li key={item.id} className="py-5">
                      <Link href={`/article/${item.slug}`} className="text-lg font-semibold text-blue-800 hover:underline">
                        {item.title}
                      </Link>
                      {item.summary && <p className="text-gray-600 mt-2">{item.summary}</p>}
                      {item.publish_time && (
                        <time className="text-sm text-gray-400 mt-2 block" dateTime={item.publish_time}>
                          {new Date(item.publish_time).toLocaleDateString('zh-CN')}
                        </time>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {pageCount > 1 && (
                <nav aria-label="搜索结果分页" className="flex items-center gap-4 mt-8">
                  {page > 1 && <Link href={pageUrl(page - 1)} className="text-blue-700 hover:underline">上一页</Link>}
                  <span className="text-gray-500">第 {page} / {pageCount} 页</span>
                  {page < pageCount && <Link href={pageUrl(page + 1)} className="text-blue-700 hover:underline">下一页</Link>}
                </nav>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}