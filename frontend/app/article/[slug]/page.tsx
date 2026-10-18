import { sanitizeRichHtml } from '@/lib/sanitize-html';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import PageHero from '@/components/layout/PageHero';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getContentDetail } from '@/lib/strapi-content';
import { resolveMediaUrl } from '@/lib/public-urls';
import ArticleViewCount from '@/components/article/ArticleViewCount';

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
  view_count?: number;
  is_top?: boolean;
  cover?: { url?: string } | null;
  attachments?: Array<{ id?: number; documentId?: string; name?: string; url?: string; size?: number }>;
  attachment_names?: Record<string, string> | null;
  attachment_download_counts?: Record<string, number> | null;
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
    'filters[review_status][$eq]': 'published',
    'status': 'published',
    'populate[0]': 'cover',
    'populate[1]': 'primary_category',
    'populate[2]': 'secondary_category',
    'populate[3]': 'attachments',
  }).toString();

  const res = await fetch(`${API}/api/articles?${qs}`, {
    cache: 'no-store',
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
    view_count: Number(item.view_count) || 0,
    is_top: Boolean(item.is_top),
    cover: item.cover || null,
    attachments: Array.isArray(item.attachments) ? item.attachments : item.attachments?.data || [],
    attachment_names: item.attachment_names || {},
    attachment_download_counts: item.attachment_download_counts || {},
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
  qs.append('status', 'published');
  qs.append('pagination[pageSize]', '400');
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
  const url = `${siteUrl.replace(/\/$/, '')}/article/${encodeURIComponent(article.slug)}`;

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

  // Keep links shared before the research-transfer migration working.
  if (sp?.from === 'transfer') {
    const transfer = await getContentDetail<{ slug: string }>('research-transfers', slug);
    if (transfer) redirect(`/research/transfer/${encodeURIComponent(slug)}`);
  }

  const article = await getArticleFullBySlug(slug);
  if (!article) notFound();

  const effectiveFrom = resolveFrom(sp?.from, article);
  const { listHref, listName } = mapCrumbByFrom(effectiveFrom);

  const ordered = await fetchArticlesForPrevNext(effectiveFrom);
  const { prev, next } = getPrevNextByOrderedList(ordered, article.slug);

  const fromQuery = `?from=${effectiveFrom}`;
  const coverImage = resolveMediaUrl(article.cover?.url);

  return (
    <>
      <Header />

      <PageHero title={listName} items={[{ name: '首页', href: '/' }, { name: listName, href: listHref }, { name: article.title, href: `/article/${encodeURIComponent(article.slug)}` }]} />

      <div className="site-article-body max-w-5xl mx-auto px-6 py-10">
        <Link href={listHref} className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900 mb-7">← 返回{listName}</Link>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 leading-tight text-center">
          {article.title}
        </h1>


        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm md:text-base text-gray-500 mb-8 border-b pb-6 justify-center" aria-label="文章信息">
          <time dateTime={article.publish_time || undefined}>
            日期：{article.publish_time
              ? new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(article.publish_time))
              : '--'}
          </time>
          <ArticleViewCount slug={article.slug} initialCount={article.view_count || 0} />
          {article.is_top && (
            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
              置顶
            </span>
          )}
        </div>

        {article.summary && (
          <p className="site-article-summary">{article.summary}</p>
        )}

        {/* ✅ 核心修改：简化 className，使用 article-content 类 */}
        <div
          className="article-content prose max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(article.content || '<p>暂无内容</p>') }}
        />

        {article.attachments && article.attachments.length > 0 && (
          <section className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5 md:p-7" aria-labelledby="article-attachments-title">
            <h2 id="article-attachments-title" className="text-lg font-semibold text-slate-900">相关附件</h2>
            <ul className="mt-3 divide-y divide-slate-200">
              {article.attachments.map((attachment) => {
                const fileKey = attachment.documentId || attachment.id;
                if (!fileKey) return null;
                const displayName = article.attachment_names?.[String(fileKey)]?.trim() || attachment.name || '文章附件';
                return (
                  <li key={String(fileKey)} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="break-all text-sm text-slate-700">{displayName}</span>
                      <span className="shrink-0 text-xs text-slate-500">已下载 {Math.max(0, Number(article.attachment_download_counts?.[String(fileKey)]) || 0)} 次</span>
                    </div>
                    <a href={`/api/article-attachments/${encodeURIComponent(article.slug)}/${encodeURIComponent(String(fileKey))}`}
                      className="inline-flex shrink-0 items-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800">
                      下载附件
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

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

      <div className="site-article-navigation w-full border-t border-gray-200 bg-white py-12">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-stretch gap-8 text-base">
            {prev ? (
              <Link
                href={`/article/${encodeURIComponent(prev.slug)}${fromQuery}`}
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
                href={`/article/${encodeURIComponent(next.slug)}${fromQuery}`}
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
