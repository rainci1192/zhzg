/** Public Strapi data used by the homepage, article lists and compatibility API routes. */
const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337').replace(/\/$/, '');

type Pagination = { page: number; pageSize: number; pageCount: number; total: number };
type Response<T> = { data: T[]; meta?: { pagination?: Pagination } };

type StrapiArticle = {
  id: number;
  title?: string;
  slug?: string;
  summary?: string | null;
  publish_time?: string | null;
  is_top?: boolean;
  content?: unknown;
  cover?: { url?: string } | null;
  primary_category?: { slug?: string } | null;
  secondary_category?: { slug?: string } | null;
};

export type ArticleItem = {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  publish_time?: string;
  is_top?: boolean;
  content?: unknown;
  cover?: { url?: string } | null;
};
export type ListArticleItem = {
  id: number;
  title: string;
  slug: string;
  summary?: string | null;
  publish_time?: string | null;
  category_slug?: string;
};
export type BannerItem = {
  id: number;
  documentId?: string;
  title?: string;
  link?: string | null;
  image?: { url: string };
};
export type PagedListResp<T> = Response<T>;

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Strapi request failed (${response.status})`);
  return response.json() as Promise<T>;
}

function positiveInteger(value: number, fallback: number, max: number): number {
  return Number.isSafeInteger(value) && value > 0 ? Math.min(value, max) : fallback;
}

function article(item: StrapiArticle): ArticleItem {
  return {
    id: item.id,
    title: item.title || '',
    slug: item.slug || '',
    summary: item.summary || '',
    publish_time: item.publish_time || '',
    is_top: Boolean(item.is_top),
    content: item.content,
    cover: item.cover || null,
  };
}

export async function getActiveBanners(): Promise<BannerItem[]> {
  const query = new URLSearchParams({
    'filters[is_active][$eq]': 'true',
    'populate': 'image',
    'sort': 'sort_order:asc',
    'pagination[pageSize]': '50',
  });
  try {
    const result = await request<Response<BannerItem>>(`/api/banners?${query}`);
    return Array.isArray(result.data) ? result.data : [];
  } catch (error) {
    console.error('获取轮播图失败:', error);
    return [];
  }
}

async function homeArticles(primaryCategory: string, limit: number): Promise<Response<ArticleItem>> {
  const query = new URLSearchParams({
    'filters[review_status][$eq]': 'published',
    'status': 'published',
    'filters[primary_category][name][$eq]': primaryCategory,
    'populate': 'cover',
    'sort': 'publish_time:desc',
    'pagination[pageSize]': String(limit),
  });
  const result = await request<Response<StrapiArticle>>(`/api/articles?${query}`);
  return { data: (Array.isArray(result.data) ? result.data : []).map(article), meta: result.meta };
}

export function getHomeNews(): Promise<Response<ArticleItem>> {
  return homeArticles('学院新闻', 5);
}

export function getHomeNotices(): Promise<Response<ArticleItem>> {
  return homeArticles('通知公告', 10);
}

/** Compatibility API: never return a draft or an article awaiting review. */
export async function getArticleBySlug(slug: string): Promise<{ data: ArticleItem | null }> {
  if (!slug || slug.length > 255) return { data: null };
  const query = new URLSearchParams({
    'filters[slug][$eq]': slug,
    'filters[review_status][$eq]': 'published',
    'status': 'published',
    'populate': 'cover',
    'pagination[pageSize]': '1',
  });
  const result = await request<Response<StrapiArticle>>(`/api/articles?${query}`);
  return { data: result.data?.[0] ? article(result.data[0]) : null };
}

type ListRule = { page: number; pageSize: number; filters: Record<string, string>; populate?: string[] };

async function getArticleListByRule({ page, pageSize, filters, populate = [] }: ListRule): Promise<PagedListResp<ListArticleItem>> {
  const query = new URLSearchParams({
    'filters[review_status][$eq]': 'published',
    'status': 'published',
    'pagination[page]': String(positiveInteger(page, 1, 1000000)),
    'pagination[pageSize]': String(positiveInteger(pageSize, 10, 100)),
  });
  Object.entries(filters).forEach(([key, value]) => query.set(key, value));
  ['is_top:desc', 'publish_time:desc', 'id:desc'].forEach((sort, index) => query.set(`sort[${index}]`, sort));
  populate.forEach((relation, index) => query.set(`populate[${index}]`, relation));
  const result = await request<Response<StrapiArticle>>(`/api/articles?${query}`);
  const data = (Array.isArray(result.data) ? result.data : []).map((item) => ({
    id: item.id,
    title: item.title || '',
    slug: item.slug || '',
    summary: item.summary || null,
    publish_time: item.publish_time || null,
    category_slug: item.secondary_category?.slug || item.primary_category?.slug || '',
  }));
  return { data, meta: result.meta };
}

export function getNewsPageList(page = 1, pageSize = 6): Promise<PagedListResp<ListArticleItem>> {
  return getArticleListByRule({ page, pageSize, populate: ['primary_category', 'secondary_category'], filters: {
    'filters[$or][0][primary_category][name][$eq]': '学院新闻',
    'filters[$or][1][secondary_category][name][$eq]': '科研动态',
  } });
}

export function getNoticePageList(page = 1, pageSize = 5): Promise<PagedListResp<ListArticleItem>> {
  return getArticleListByRule({ page, pageSize, filters: {
    'filters[primary_category][name][$eq]': '通知公告',
  } });
}

export function getSecondaryCategoryPageList(
  secondaryCategoryName: string,
  page = 1,
  pageSize = 5,
  options?: { primaryCategoryName?: string }
): Promise<PagedListResp<ListArticleItem>> {
  const filters: Record<string, string> = { 'filters[secondary_category][name][$eq]': secondaryCategoryName };
  if (options?.primaryCategoryName) filters['filters[primary_category][name][$eq]'] = options.primaryCategoryName;
  return getArticleListByRule({ page, pageSize, populate: ['primary_category', 'secondary_category'], filters });
}
