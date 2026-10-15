import { strapiFetch } from './strapi-fetch';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

async function strapiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await strapiFetch(`${STRAPI_URL}${endpoint}`, options);

  if (!res.ok) {
    const errorData: unknown = await res.json().catch(() => ({}));
    let msg = `API Error: ${res.status}`;
    if (
      errorData &&
      typeof errorData === 'object' &&
      'error' in errorData &&
      (errorData as { error?: { message?: string } }).error?.message
    ) {
      msg = (errorData as { error?: { message?: string } }).error!.message!;
    }

    if (res.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('strapi_jwt');
        localStorage.removeItem('strapi_user');
      }
    }

    throw new Error(msg);
  }

  if (res.status === 204) return {} as T;
  return res.json() as Promise<T>;
}

// 将 connect/disconnect 格式的关联字段转换为 Strapi v5 接受的 ID 或 null
 
interface RelationConnectItem {
  id: number;
}

interface RelationObject {
  connect?: RelationConnectItem[];
  disconnect?: boolean;
}

function isRelationObject(value: unknown): value is RelationObject {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const obj = value as Record<string, unknown>;
  return 'connect' in obj || 'disconnect' in obj;
}

function normalizeRelations(data: unknown): Record<string, unknown> {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return {};
  }

  const result: Record<string, unknown> = { ...(data as Record<string, unknown>) };

  for (const key of Object.keys(result)) {
    const val = result[key];

    if (isRelationObject(val)) {
      if (Array.isArray(val.connect)) {
        result[key] = val.connect.length > 0 ? val.connect[0].id : null;
      } else if (val.disconnect) {
        result[key] = null;
      }
    }
  }

  return result;
}

// 登录：users-permissions
export interface LoginResponse {
  jwt: string;
  user: {
    id: number | string;
    username?: string;
    email: string;
  };
}

export async function adminLogin(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${STRAPI_URL}/api/backend-admins/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorData: unknown = await res.json().catch(() => ({}));
    let msg = `Login Error: ${res.status}`;
    if (
      errorData &&
      typeof errorData === 'object' &&
      'error' in errorData &&
      (errorData as { error?: { message?: string } }).error?.message
    ) {
      msg = (errorData as { error?: { message?: string } }).error!.message!;
    }
    throw new Error(msg);
  }

  return res.json() as Promise<LoginResponse>;
}

// 上传
export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('files', file);

  const res = await strapiFetch(`${STRAPI_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json();
}

export const api = {
  // categories
  getCategories: (q = '') => strapiRequest<unknown>(`/api/categories${q}`),
  createCategory: (data: unknown) =>
    strapiRequest<unknown>('/api/categories', { method: 'POST', body: JSON.stringify({ data }) }),
  updateCategory: (id: string, data: unknown) =>
    strapiRequest<unknown>(`/api/categories/${id}`, { method: 'PUT', body: JSON.stringify({ data }) }),
  deleteCategory: (id: string) =>
    strapiRequest<unknown>(`/api/categories/${id}`, { method: 'DELETE' }),

  // articles（关联字段自动 normalize）
  getArticles: (q = '') => strapiRequest<unknown>(`/api/articles${q}`),
  getArticle: (id: string) =>
    strapiRequest<unknown>(`/api/articles/${id}?populate=*`),
  createArticle: (data: unknown) => {
    const payload = normalizeRelations(data);
    return strapiRequest<unknown>('/api/articles', { method: 'POST', body: JSON.stringify({ data: payload }) });
  },
  updateArticle: (id: string, data: unknown) => {
    const payload = normalizeRelations(data);
    return strapiRequest<unknown>(`/api/articles/${id}`, { method: 'PUT', body: JSON.stringify({ data: payload }) });
  },
  getLevel1Reviewers: () =>
    strapiRequest<unknown>('/api/article-workflow/level1-reviewers'),
  getWorkflowTasks: () =>
    strapiRequest<unknown>('/api/article-workflow/tasks'),
  submitArticleForReview: (id: string, level1ReviewerId?: string | number) =>
    strapiRequest<unknown>(`/api/article-workflow/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(level1ReviewerId ? { level1_reviewer_id: level1ReviewerId } : {}),
    }),
  reviewArticleLevel1: (id: string, decision: 'approve' | 'reject', comment: string) =>
    strapiRequest<unknown>(`/api/article-workflow/${id}/level1-review`, {
      method: 'POST',
      body: JSON.stringify({ decision, comment }),
    }),
  reviewArticleLevel2: (id: string, decision: 'approve' | 'reject', comment: string) =>
    strapiRequest<unknown>(`/api/article-workflow/${id}/level2-review`, {
      method: 'POST',
      body: JSON.stringify({ decision, comment }),
    }),
  publishArticle: (id: string) =>
    strapiRequest<unknown>(`/api/article-workflow/${id}/publish`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),
  unpublishArticle: (id: string, comment = '') =>
    strapiRequest<unknown>(`/api/article-workflow/${id}/unpublish`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    }),
  deleteArticle: (id: string) =>
    strapiRequest<unknown>(`/api/articles/${id}`, { method: 'DELETE' }),

  // banners (✅ 此处加入了 &populate=* 以便请求图片媒体数据)
  getBanners: (q = '?sort=sort_order:asc&populate=*') => strapiRequest<unknown>(`/api/banners${q}`),
  createBanner: (data: unknown) =>
    strapiRequest<unknown>('/api/banners', { method: 'POST', body: JSON.stringify({ data }) }),
  updateBanner: (id: string, data: unknown) =>
    strapiRequest<unknown>(`/api/banners/${id}`, { method: 'PUT', body: JSON.stringify({ data }) }),
  deleteBanner: (id: string) =>
    strapiRequest<unknown>(`/api/banners/${id}`, { method: 'DELETE' }),

  // links
  getLinks: (q = '?sort=sort_order:asc') => strapiRequest<unknown>(`/api/links${q}`),
  createLink: (data: unknown) =>
    strapiRequest<unknown>('/api/links', { method: 'POST', body: JSON.stringify({ data }) }),
  updateLink: (id: string, data: unknown) =>
    strapiRequest<unknown>(`/api/links/${id}`, { method: 'PUT', body: JSON.stringify({ data }) }),
  deleteLink: (id: string) =>
    strapiRequest<unknown>(`/api/links/${id}`, { method: 'DELETE' }),

  // attachments
  getAttachments: (q = '') => strapiRequest<unknown>(`/api/attachments${q}`),
  createAttachment: (data: unknown) =>
    strapiRequest<unknown>('/api/attachments', { method: 'POST', body: JSON.stringify({ data }) }),
  updateAttachment: (id: string, data: unknown) =>
    strapiRequest<unknown>(`/api/attachments/${id}`, { method: 'PUT', body: JSON.stringify({ data }) }),
  deleteAttachment: (id: string) =>
    strapiRequest<unknown>(`/api/attachments/${id}`, { method: 'DELETE' }),

  // site-configs
  getSiteSetting: () => strapiRequest<unknown>('/api/site-configs?pagination[pageSize]=1'),
  createSiteSetting: (data: unknown) =>
    strapiRequest<unknown>('/api/site-configs', { method: 'POST', body: JSON.stringify({ data }) }),
  updateSiteSetting: (id: string, data: unknown) =>
    strapiRequest<unknown>(`/api/site-configs/${id}`, { method: 'PUT', body: JSON.stringify({ data }) }),

  // custom
  getCategoryTree: () => strapiRequest<unknown>('/api/categories/tree'),
  searchArticles: (q: string, page = 1, pageSize = 10) =>
    strapiRequest<unknown>(`/api/search?q=${encodeURIComponent(q)}&page=${page}&pageSize=${pageSize}`),
};
