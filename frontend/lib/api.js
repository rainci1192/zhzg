const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

async function request(path) {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// 已有接口（示例）
export const getCategoryTree = () => request('/api/categories/tree');
export const getHomeNews = () => request('/api/articles/home-news');
export const getHomeNotices = () => request('/api/articles/home-notices');

// 你刚新增的两个接口
export const getArticleBySlug = (slug) =>
  request(`/api/articles/${slug}`);

export const getCategoryArticles = (slug, page = 1, pageSize = 10) =>
  request(`/api/categories/${slug}/articles?page=${page}&pageSize=${pageSize}`);
