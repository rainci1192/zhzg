const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337";

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    cache: "no-store", // 这里默认不缓存，保证每次能拿到最新数据
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

// ================= 类型定义 =================

export interface ArticleItem {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  publish_time?: string;
  is_top?: boolean;
  content?: unknown;
  cover?: { url?: string } | null;
}

export interface ListResp<T> {
  data: T[];
  meta?: unknown;
}

export interface DetailResp<T> {
  data: T | null;
  meta?: unknown;
}

export interface PagedListResp<T> {
  data: T[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface ListArticleItem {
  id: number;
  title: string;
  slug: string;
  summary?: string | null;
  publish_time?: string | null;
  category_slug?: string;
}

// ✅ 新增：Banner 轮播图的数据类型
export interface BannerItem {
  id: number;
  documentId?: string;
  title?: string;
  link?: string | null;
  image?: {
    url: string;
  };
}

// ================= API 请求方法 =================

/** ✅ 新增：获取「已启用」的轮播图列表 */
export const getActiveBanners = async (): Promise<BannerItem[]> => {
  const query = new URLSearchParams({
    "filters[is_active][$eq]": "true", // 只查询被激活的 Banner
    populate: "*",                     // 填充关联的图片数据
    sort: "sort_order:asc",            // 按照排序字段升序排列
  }).toString();

  try {
    // 复用你的 request 封装
    const res = await request<any>(`/api/banners?${query}`);
    return res.data || [];
  } catch (error) {
    console.error('❌ 获取 Banners 失败:', error);
    return []; // 发生错误时返回空数组，防止前端崩溃
  }
};

/** 获取「新闻动态」（一级分类 name = 学院新闻） */
export const getHomeNews = async (): Promise<ListResp<ArticleItem>> => {
  const query = new URLSearchParams({
    "filters[review_status][$eq]": "published",
    "filters[primary_category][name][$eq]": "学院新闻",
    populate: "cover",
    sort: "publish_time:desc",
    "pagination[limit]": "10",
  }).toString();

  const res = await request<any>(`/api/articles?${query}`);

  const flatData = (res.data || []).map((item: any) => ({
    id: item.id,
    title: item.title || "",
    slug: item.slug || "",
    summary: item.summary || "",
    publish_time: item.publish_time || "",
    is_top: item.is_top || false,
    content: item.content,
    cover: item.cover || null,
  }));

  return { data: flatData, meta: res.meta };
};

/** 获取「通知公告」（一级分类 name = 通知公告） */
export const getHomeNotices = async (): Promise<ListResp<ArticleItem>> => {
  const query = new URLSearchParams({
    "filters[review_status][$eq]": "published",
    "filters[primary_category][name][$eq]": "通知公告",
    populate: "cover",
    sort: "publish_time:desc",
    "pagination[limit]": "10",
  }).toString();

  const res = await request<any>(`/api/articles?${query}`);

  const flatData = (res.data || []).map((item: any) => ({
    id: item.id,
    title: item.title || "",
    slug: item.slug || "",
    summary: item.summary || "",
    publish_time: item.publish_time || "",
    is_top: item.is_top || false,
    content: item.content,
    cover: item.cover || null,
  }));

  return { data: flatData, meta: res.meta };
};

/** 二级分类文章获取方法（保留） */
export const getCategoryArticles = (slug: string, page = 1, pageSize = 10) =>
  request<ListResp<ArticleItem>>(`/api/categories/${slug}/articles?page=${page}&pageSize=${pageSize}`);

/** 获取文章详情（支持 slug 查询，适配 Strapi 扁平结构） */
export const getArticleBySlug = async (slug: string): Promise<DetailResp<ArticleItem>> => {
  const query = new URLSearchParams({
    "filters[slug][$eq]": slug,
    populate: "cover",
  }).toString();

  const res = await request<any>(`/api/articles?${query}`);
  const item = res.data?.[0] || null;

  if (!item) {
    return { data: null, meta: res.meta };
  }

  const flatItem: ArticleItem = {
    id: item.id,
    title: item.title || "",
    slug: item.slug || "",
    summary: item.summary || "",
    publish_time: item.publish_time || "",
    is_top: item.is_top || false,
    content: item.content,
    cover: item.cover || null,
  };

  return { data: flatItem, meta: res.meta };
};

type ListFilterRule = {
  reviewStatus?: string;
  sort?: string[];
  page?: number;
  pageSize?: number;
  populate?: string[];
  filters?: Record<string, string>;
};

/**
 * 通用文章列表查询（分页）
 */
export async function getArticleListByRule(
  rule: ListFilterRule
): Promise<PagedListResp<ListArticleItem>> {
  const {
    reviewStatus = "published",
    sort = ["is_top:desc", "publish_time:desc", "id:desc"],
    page = 1,
    pageSize = 10,
    populate = [],
    filters = {},
  } = rule;

  const qs = new URLSearchParams();
  qs.append("filters[review_status][$eq]", reviewStatus);

  Object.entries(filters).forEach(([k, v]) => {
    qs.append(k, v);
  });

  sort.forEach((s, i) => {
    qs.append(`sort[${i}]`, s);
  });

  populate.forEach((p, i) => {
    qs.append(`populate[${i}]`, p);
  });

  qs.append("pagination[page]", String(page));
  qs.append("pagination[pageSize]", String(pageSize));

  const res = await request<any>(`/api/articles?${qs.toString()}`);
  const rows = res?.data || [];

  const data: ListArticleItem[] = rows.map((item: any) => ({
    id: item.id,
    title: item.title || "",
    slug: item.slug || "",
    summary: item.summary || null,
    publish_time: item.publish_time || null,
    category_slug: item.secondary_category?.slug || item.primary_category?.slug || "",
  }));

  return { data, meta: res?.meta };
}

/**
 * 新闻列表页（新闻动态 + 科研动态）
 */
export const getNewsPageList = async (
  page = 1,
  pageSize = 6
): Promise<PagedListResp<ListArticleItem>> => {
  return getArticleListByRule({
    page,
    pageSize,
    populate: ["primary_category", "secondary_category"],
    filters: {
      "filters[$or][0][primary_category][name][$eq]": "学院新闻",
      "filters[$or][1][secondary_category][name][$eq]": "科研动态",
    },
  });
};

/**
 * 通知公告列表页
 */
export const getNoticePageList = async (
  page = 1,
  pageSize = 5
): Promise<PagedListResp<ListArticleItem>> => {
  return getArticleListByRule({
    page,
    pageSize,
    filters: {
      "filters[primary_category][name][$eq]": "通知公告",
    },
  });
};

/**
 * 二级分类列表页（通用）
 */
export const getSecondaryCategoryPageList = async (
  secondaryCategoryName: string,
  page = 1,
  pageSize = 5,
  options?: {
    primaryCategoryName?: string;
  } // ✅ 这里新增了第 4 个可选参数
): Promise<PagedListResp<ListArticleItem>> => {
  const filters: Record<string, string> = {
    'filters[secondary_category][name][$eq]': secondaryCategoryName,
  };

  // ✅ 如果传入了一级分类，则加入联合过滤条件
  if (options?.primaryCategoryName) {
    filters['filters[primary_category][name][$eq]'] = options.primaryCategoryName;
  }

  return getArticleListByRule({
    page,
    pageSize,
    populate: ['primary_category', 'secondary_category'],
    filters,
  });
};

/**
 * 合作动态列表页（一级分类=学院新闻 且 二级分类=合作动态）
 */
export const getCooperationNewsPageList = async (
  page = 1,
  pageSize = 5
): Promise<PagedListResp<ListArticleItem>> => {
  return getArticleListByRule({
    page,
    pageSize,
    populate: ['primary_category', 'secondary_category'],
    filters: {
      'filters[primary_category][name][$eq]': '学院新闻',
      'filters[secondary_category][name][$eq]': '合作动态',
    },
  });
};
