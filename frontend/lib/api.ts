const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337";

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export interface ArticleItem {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  publish_time?: string;
  is_top?: boolean;
  content?: unknown;
}

export interface ListResp<T> {
  data: T[];
  meta?: unknown;
}

export interface DetailResp<T> {
  data: T | null;
  meta?: unknown;
}

export const getHomeNews = () => request<ListResp<ArticleItem>>("/api/articles/home-news");
export const getHomeNotices = () => request<ListResp<ArticleItem>>("/api/articles/home-notices");

export const getCategoryArticles = (slug: string, page = 1, pageSize = 10) =>
  request<ListResp<ArticleItem>>(`/api/categories/${slug}/articles?page=${page}&pageSize=${pageSize}`);

export const getArticleBySlug = (slug: string) =>
  request<DetailResp<ArticleItem>>(`/api/articles/${slug}`);
