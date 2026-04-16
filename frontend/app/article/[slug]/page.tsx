import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const dynamic = 'force-dynamic';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

type PrevNextItem = {
  id: number;
  slug: string;
  title: string;
  publish_time?: string;
  is_top?: boolean;
};

type FullArticle = {
  id: number;
  slug: string;
  title: string;
  content?: string;
  summary?: string;
  publish_time?: string;
  is_top?: boolean;
  cover?: { url?: string } | null;
  primary_category?: { name?: string } | null;
  secondary_category?: { name?: string } | null;
};

type FromType =
  | 'news'
  | 'notice'
  | 'research'
  | 'activities'
  | 'transfer'
  | 'cooperation';

function htmlToPlainText(html?: string) {
  if (!html) return '';
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function ellipsis(text: string, max = 120) {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

async function getArticleFullBySlug(slug: string): Promise<FullArticle | null> {
  const qs = new URLSearchParams({
    'filters[slug][$eq]': slug,
    'populate[0]': 'cover',
    'populate[1]': 'primary_category',
    'populate[2]': 'secondary_category',
  }).toString();

  const res = await fetch(`${API}/api/articles?${qs}`, {
    next: { revalidate: 30 },
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) return null;

  const json = await res.json();
  const item = json?.data?.[0];
  if (!item) return null;

  return {
    id: item.id,
    slug: item.slug || '',
    title: item.title || '',
    content: item.content || '',
    summary: item.summary || '',
    publish_time: item.publish_time || '',
    is_top: Boolean(item.is_top),
    cover: item.cover || null,
    primary_category: item.primary_category || null,
    secondary_category: item.secondary_category || null,
  };
}

function inferFromByArticle(article: FullArticle): FromType {
  const p = article.primary_category?.name || '';
  const s = article.secondary_category?.name || '';

  if (p === '学院新闻' && s === '合作动态') return 'cooperation';
  if (s === '科研动态') return 'research';
  if (s === '学生活动') return 'activities';
  if (s === '成果转化') return 'transfer';
  if (p === '通知公告') return 'notice';
  return 'news';
}

function resolveFrom(inputFrom: string | undefined, article: FullArticle): FromType {
  const legal = new Set<FromType>([
    'news',
    'notice',
    'research',
    'activities',
    'transfer',
    'cooperation',
  ]);
  if (inputFrom && legal.has(inputFrom as FromType)) return inputFrom as FromType;
  return inferFromByArticle(article);
}

function appendFiltersByRule(qs: URLSearchParams, rule: FromType) {
  if (rule === 'news') {
    qs.append('filters[$or][0][primary_category][name][$eq]', '学院新闻');
    qs.append('filters[$or][1][secondary_category][name][$eq]', '科研动态');
  } else if (rule === 'notice') {
    qs.append('filters[primary_category][name][$eq]', '通知公告');
  } else if (rule === 'research') {
    qs.append('filters[secondary_category][name][$eq]', '科研动态');
  } else if (rule === 'activities') {
    qs.append('filters[secondary_category][name][$eq]', '学生活动');
  } else if (rule === 'transfer') {
    qs.append('filters[secondary_category][name][$eq]', '成果转化');
  } else if (rule === 'cooperation') {
    qs.append('filters[primary_category][name][$eq]', '学院新闻');
    qs.append('filters[secondary_category][name][$eq]', '合作动态');
  }
}

function mapCrumbByFrom(from: FromType): { listHref: string; listName: string } {
  if (from === 'research') return { listHref: '/research/news', listName: '科研动态' };
  if (from === 'activities') return { listHref: '/students/activities', listName: '学生活动' };
  if (from === 'transfer') return { listHref: '/research/transfer', listName: '成果转化' };
  if (from === 'notice') return { listHref: '/notice', listName: '通知公告' };
  if (from === 'cooperation') return { listHref: '/cooperation/news', listName: '合作动态' };
  return { listHref: '/news', listName: '新闻动态' };
}

async function fetchArticlesForPrevNext(rule: FromType): Promise<PrevNextItem[]> {
  const qs = new URLSearchParams();
  qs.append('filters[review_status][$eq]', 'published');
  qs.append('pagination[limit]', '400');
  qs.append('sort[0]', 'is_top:desc');
  qs.append('sort[1]', 'publish_time:desc');
  qs.append('sort[2]', 'id:desc');

  appendFiltersByRule(qs, rule);

  const res = await fetch(`${API}/api/articles?${qs.toString()}`, {
    next: { revalidate: 30 },
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) return [];

  const json = await res.json();
  const data = json?.data || [];

  return data.map((item: any) => ({
    id: item.id,
    slug: item.slug || '',
    title: item.title || '',
    publish_time: item.publish_time || '',
    is_top: Boolean(item.is_top),
  }));
}

function getPrevNextByOrderedList(
  orderedList: PrevNextItem[],
  currentSlug: string
): { prev: PrevNextItem | null; next: PrevNextItem | null } {
  const idx = orderedList.findIndex((x) => x.slug === currentSlug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? orderedList[idx - 1] : null,
    next: idx < orderedList.length - 1 ? orderedList[idx + 1] : null,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleFullBySlug(slug);

  if (!article) {
    return {
      title: '文章详情 - 国家卓越工程师学院',
      description: '文章详情页',
      robots: { index: false, follow: true },
    };
  }

  const contentText = htmlToPlainText(article.content || '');
  const description = ellipsis(contentText, 120);

  const siteUrl = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000';
  const url = `${siteUrl}/article/${article.slug}`;

  return {
    title: `${article.title} - 国家卓越工程师学院`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description,
      url,
      type: 'article',
    },
    robots: { index: true, follow: true },
  };
}

export default async function ArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const article = await getArticleFullBySlug(slug);
  if (!article) notFound();

  const effectiveFrom = resolveFrom(sp?.from, article);
  const { listHref, listName } = mapCrumbByFrom(effectiveFrom);

  const ordered = await fetchArticlesForPrevNext(effectiveFrom);
  const { prev, next } = getPrevNextByOrderedList(ordered, article.slug);

  const fromQuery = `?from=${effectiveFrom}`;
  const coverImage = article.cover?.url ? `${API}${article.cover.url}` : null;

  return (
    <>
      <Header />

      <div className="bg-gray-100 py-3">
        <div className="max-w-5xl mx-auto px-6">
          <nav className="flex text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">首页</Link>
            <span className="mx-2">›</span>
            <Link href={listHref} className="hover:text-blue-600">{listName}</Link>
            <span className="mx-2">›</span>
            <span className="text-blue-600 line-clamp-1">{article.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 leading-tight">
          {article.title}
        </h1>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-base text-gray-500 mb-8 border-b pb-6">
          <span>
            {article.publish_time
              ? new Date(article.publish_time).toLocaleDateString('zh-CN')
              : '--'}
          </span>
          {article.is_top && (
            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
              置顶
            </span>
          )}
        </div>

        <div
          className="prose prose-gray max-w-none text-xl leading-9 md:text-[22px] md:leading-10
                     prose-table:border prose-table:border-gray-400 prose-table:border-collapse
                     prose-table:w-full prose-table:table-auto
                     prose-th:border prose-th:border-gray-400 prose-th:bg-gray-100
                     prose-th:font-semibold prose-th:p-4 prose-th:text-left prose-th:align-middle
                     prose-td:border prose-td:border-gray-400 prose-td:p-4 prose-td:text-left prose-td:align-middle
                     prose-headings:font-bold prose-headings:text-gray-900
                     prose-strong:font-semibold"
          dangerouslySetInnerHTML={{ __html: article.content || '<p>暂无内容</p>' }}
        />

        {coverImage && (
          <div className="relative w-full mt-10 rounded-xl overflow-hidden shadow-md aspect-[16/9]">
            <Image
              src={coverImage}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 80vw"
              priority
            />
          </div>
        )}
      </div>

      <div className="w-full border-t border-gray-200 bg-white py-12">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-stretch gap-8 text-base">
            {prev ? (
              <Link
                href={`/article/${prev.slug}${fromQuery}`}
                className="group flex-1 flex items-start gap-5 p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/80 transition-all shadow-sm"
              >
                <div className="text-4xl text-blue-500 font-light leading-none mt-0.5">←</div>
                <div className="flex-1">
                  <span className="text-blue-600 text-sm font-medium tracking-widest">上一条</span>
                  <p className="mt-2 text-lg font-medium text-gray-800 group-hover:text-blue-700 line-clamp-2 leading-snug">
                    {prev.title}
                  </p>
                </div>
              </Link>
            ) : (
              <div className="flex-1 p-6 text-gray-400 text-base">没有更多了</div>
            )}

            {next ? (
              <Link
                href={`/article/${next.slug}${fromQuery}`}
                className="group flex-1 flex items-start gap-5 p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/80 transition-all shadow-sm text-right"
              >
                <div className="flex-1">
                  <span className="text-blue-600 text-sm font-medium tracking-widest">下一条</span>
                  <p className="mt-2 text-lg font-medium text-gray-800 group-hover:text-blue-700 line-clamp-2 leading-snug">
                    {next.title}
                  </p>
                </div>
                <div className="text-4xl text-blue-500 font-light leading-none mt-0.5">→</div>
              </Link>
            ) : (
              <div className="flex-1 p-6 text-gray-400 text-base text-right">没有更多了</div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
