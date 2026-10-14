// @ts-nocheck
/* eslint-disable */
// cSpell:disable

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

export interface BannerItem {
  id: number;
  documentId?: string;
  title?: string;
  link?: string | null;
  image?: {
    url: string;
  };
}

export interface LeaderItem {
  id: number;
  title: string;
  name: string;
  intro?: string | null;
  is_active?: boolean;
  sort_order?: number;
}

// ================= API 请求方法 =================

export const getActiveBanners = async (): Promise<BannerItem[]> => {
  const query = new URLSearchParams({
    "filters[is_active][$eq]": "true",
    populate: "*",
    sort: "sort_order:asc",
  }).toString();

  try {
    const res = await request<any>(`/api/banners?${query}`);
    return res.data || [];
  } catch (error) {
    console.error('❌ 获取 Banners 失败:', error);
    return [];
  }
};

export const getActiveLeaders = async (): Promise<LeaderItem[]> => {
  const query = new URLSearchParams({
    "filters[is_active][$eq]": "true",
    sort: "sort_order:asc",
  }).toString();

  try {
    const res = await request<any>(`/api/leaders?${query}`);
    return (res.data || []).map((item: any) => ({
      id: item.id,
      title: item.title || "",
      name: item.name || "",
      intro: item.intro || null,
      is_active: item.is_active,
      sort_order: item.sort_order,
    }));
  } catch (error) {
    console.error('❌ 获取 Leaders 失败:', error);
    return [];
  }
};

export const getHomeNews = async (): Promise<ListResp<ArticleItem>> => {
  const query = new URLSearchParams({
    "filters[review_status][$eq]": "published",
    "filters[primary_category][name][$eq]": "学院新闻",
    populate: "cover",
    sort: "publish_time:desc",
    "pagination[limit]": "5",
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

export const getCategoryArticles = (slug: string, page = 1, pageSize = 10) =>
  request<ListResp<ArticleItem>>(`/api/categories/${slug}/articles?page=${page}&pageSize=${pageSize}`);

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

export const getSecondaryCategoryPageList = async (
  secondaryCategoryName: string,
  page = 1,
  pageSize = 5,
  options?: {
    primaryCategoryName?: string;
  }
): Promise<PagedListResp<ListArticleItem>> => {
  const filters: Record<string, string> = {
    'filters[secondary_category][name][$eq]': secondaryCategoryName,
  };

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
// ✅ 新增：Department 机构设置的数据类型
export interface DepartmentItem {
  id: number;
  name: string;
  description?: string | null;
  is_active?: boolean;
  sort_order?: number;
}

/** ✅ 新增：获取「机构设置」列表 */
export const getActiveDepartments = async (): Promise<DepartmentItem[]> => {
  const query = new URLSearchParams({
    "filters[is_active][$eq]": "true",
    "sort": "sort_order:asc",
  }).toString();

  try {
    const res = await request<any>(`/api/departments?${query}`);
    return (res.data || []).map((item: any) => ({
      id: item.id,
      name: item.name || "",
      description: item.description || null,
      is_active: item.is_active,
      sort_order: item.sort_order,
    }));
  } catch (error) {
    console.error('❌ 获取 Departments 失败:', error);
    return [];
  }
};
// ✅ 新增：Research Institution 科研机构的数据类型
export interface ResearchInstitutionItem {
  id: number;
  name: string;
  slug: string;
  summary?: string | null;
  cover_image?: { url?: string } | null;
  is_active?: boolean;
  sort_order?: number;
}

/** ✅ 新增：获取「科研机构」列表 */
export const getActiveResearchInstitutions = async (): Promise<ResearchInstitutionItem[]> => {
  const query = new URLSearchParams({
    "filters[is_active][$eq]": "true",
    "populate": "cover_image",
    "sort": "sort_order:asc",
  }).toString();

  try {
    const res = await request<any>(`/api/research-institutions?${query}`);
    return (res.data || []).map((item: any) => ({
      id: item.id,
      name: item.name || "",
      slug: item.slug || "",
      summary: item.summary || null,
      cover_image: item.cover_image || null,
      is_active: item.is_active,
      sort_order: item.sort_order,
    }));
  } catch (error) {
    console.error('❌ 获取 Research Institutions 失败:', error);
    return [];
  }
};
// ✅ 新增：Research Transfer 成果转化的数据类型
export interface ResearchTransferItem {
  id: number;
  title: string;
  slug: string;
  summary?: string | null;
  content?: string | null;
  attachments?: Array<{
    id: number;
    name: string;
    url: string;
    ext: string;
    size: number;
  }> | null;
  publish_time?: string | null;
  is_active?: boolean;
  is_top?: boolean;
  sort_order?: number;
}

/** ✅ 新增：获取「成果转化」列表（分页） */
export const getResearchTransfers = async (
  page = 1,
  pageSize = 5
): Promise<PagedListResp<ResearchTransferItem>> => {
  const query = new URLSearchParams({
    "filters[is_active][$eq]": "true",
    "populate": "attachments",
    "sort[0]": "is_top:desc",
    "sort[1]": "publish_time:desc",
    "sort[2]": "id:desc",
    "pagination[page]": String(page),
    "pagination[pageSize]": String(pageSize),
  }).toString();

  try {
    const res = await request<any>(`/api/research-transfers?${query}`);
    const data: ResearchTransferItem[] = (res.data || []).map((item: any) => ({
      id: item.id,
      title: item.title || "",
      slug: item.slug || "",
      summary: item.summary || null,
      content: item.content || null,
      attachments: item.attachments || null,
      publish_time: item.publish_time || null,
      is_active: item.is_active,
      is_top: item.is_top,
      sort_order: item.sort_order,
    }));

    return { data, meta: res.meta };
  } catch (error) {
    console.error('❌ 获取 Research Transfers 失败:', error);
    return { data: [], meta: {} };
  }
};

/** ✅ 新增：根据 slug 获取成果转化详情 */
export const getResearchTransferBySlug = async (slug: string): Promise<ResearchTransferItem | null> => {
  const query = new URLSearchParams({
    "filters[slug][$eq]": slug,
    "populate": "attachments",
  }).toString();

  try {
    const res = await request<any>(`/api/research-transfers?${query}`);
    const item = res.data?.[0];
    if (!item) return null;

    return {
      id: item.id,
      title: item.title || "",
      slug: item.slug || "",
      summary: item.summary || null,
      content: item.content || null,
      attachments: item.attachments || null,
      publish_time: item.publish_time || null,
      is_active: item.is_active,
      is_top: item.is_top,
      sort_order: item.sort_order,
    };
  } catch (error) {
    console.error('❌ 获取 Research Transfer 详情失败:', error);
    return null;
  }
};
// ✅ 新增：Supervisor 培养导师的数据类型
export interface SupervisorItem {
  id: number;
  name: string;
  slug: string;
  title: string;
  category: 'internal' | 'enterprise';
  college: string;
  major: string;
  personal_website?: string | null;
  bio?: string | null;
  photo?: { url?: string } | null;
  is_active?: boolean;
  sort_order?: number;
}

export interface GroupedSupervisors {
  [college: string]: {
    [major: string]: SupervisorItem[];
  };
}

/** ✅ 新增：获取「培养导师」列表（按类型） */
export const getSupervisorsByCategory = async (
  category: 'internal' | 'enterprise'
): Promise<SupervisorItem[]> => {
  const query = new URLSearchParams({
    "filters[is_active][$eq]": "true",
    "filters[category][$eq]": category,
    "populate": "photo",
    "sort[0]": "college:asc",
    "sort[1]": "major:asc",
    "sort[2]": "sort_order:asc",
    "sort[3]": "name:asc",
  }).toString();

  try {
    const res = await request<any>(`/api/supervisors?${query}`);
    return (res.data || []).map((item: any) => ({
      id: item.id,
      name: item.name || "",
      slug: item.slug || "",
      title: item.title || "",
      category: item.category || "internal",
      college: item.college || "其他",
      major: item.major || "其他",
      personal_website: item.personal_website || null,
      bio: item.bio || null,
      photo: item.photo || null,
      is_active: item.is_active,
      sort_order: item.sort_order,
    }));
  } catch (error) {
    console.error('❌ 获取 Supervisors 失败:', error);
    return [];
  }
};

/** ✅ 新增：按学院和专业分组导师 */
export const groupSupervisorsByCollegeAndMajor = (
  supervisors: SupervisorItem[]
): GroupedSupervisors => {
  const grouped: GroupedSupervisors = {};
  
  supervisors.forEach((sup) => {
    const college = sup.college || '其他';
    const major = sup.major || '其他';
    
    if (!grouped[college]) grouped[college] = {};
    if (!grouped[college][major]) grouped[college][major] = [];
    
    grouped[college][major].push(sup);
  });
  
  return grouped;
};

/** ✅ 新增：根据 slug 获取导师详情 */
export const getSupervisorBySlug = async (slug: string): Promise<SupervisorItem | null> => {
  const query = new URLSearchParams({
    "filters[slug][$eq]": slug,
    "populate": "photo",
  }).toString();

  try {
    const res = await request<any>(`/api/supervisors?${query}`);
    const item = res.data?.[0];
    if (!item) return null;

    return {
      id: item.id,
      name: item.name || "",
      slug: item.slug || "",
      title: item.title || "",
      category: item.category || "internal",
      college: item.college || "",
      major: item.major || "",
      personal_website: item.personal_website || null,
      bio: item.bio || null,
      photo: item.photo || null,
      is_active: item.is_active,
      sort_order: item.sort_order,
    };
  } catch (error) {
    console.error('❌ 获取 Supervisor 详情失败:', error);
    return null;
  }
};
// ✅ 新增：Student Document 学生文档的数据类型
export interface StudentDocumentItem {
  id: number;
  title: string;
  slug: string;
  content?: string | null;
  attachments?: Array<{
    id: number;
    name: string;
    url: string;
    ext: string;
    size: number;
  }> | null;
  publish_time?: string | null;
  is_active?: boolean;
  sort_order?: number;
}

/** ✅ 新增：获取「学生文档」列表（分页） */
export const getStudentDocuments = async (
  page = 1,
  pageSize = 5
): Promise<PagedListResp<StudentDocumentItem>> => {
  const query = new URLSearchParams({
    "filters[is_active][$eq]": "true",
    "populate": "attachments",
    "sort[0]": "sort_order:asc",
    "sort[1]": "publish_time:desc",
    "sort[2]": "id:desc",
    "pagination[page]": String(page),
    "pagination[pageSize]": String(pageSize),
  }).toString();

  try {
    const res = await request<any>(`/api/student-documents?${query}`);
    const data: StudentDocumentItem[] = (res.data || []).map((item: any) => ({
      id: item.id,
      title: item.title || "",
      slug: item.slug || "",
      content: item.content || null,
      attachments: item.attachments || null,
      publish_time: item.publish_time || null,
      is_active: item.is_active,
      sort_order: item.sort_order,
    }));

    return { data, meta: res.meta };
  } catch (error) {
    console.error('❌ 获取 Student Documents 失败:', error);
    return { data: [], meta: {} };
  }
};

/** ✅ 新增：根据 slug 获取学生文档详情 */
export const getStudentDocumentBySlug = async (slug: string): Promise<StudentDocumentItem | null> => {
  const query = new URLSearchParams({
    "filters[slug][$eq]": slug,
    "populate": "attachments",
  }).toString();

  try {
    const res = await request<any>(`/api/student-documents?${query}`);
    const item = res.data?.[0];
    if (!item) return null;

    return {
      id: item.id,
      title: item.title || "",
      slug: item.slug || "",
      content: item.content || null,
      attachments: item.attachments || null,
      publish_time: item.publish_time || null,
      is_active: item.is_active,
      sort_order: item.sort_order,
    };
  } catch (error) {
    console.error('❌ 获取 Student Document 详情失败:', error);
    return null;
  }
};
// ✅ 新增：Student Showcase 学生风采的数据类型
export interface StudentShowcaseItem {
  id: number;
  name: string;
  description?: string | null;
  image?: { url?: string } | null;
  is_active?: boolean;
  sort_order?: number;
}

/** ✅ 新增：获取「学生风采」列表（分页） */
export const getStudentShowcases = async (
  page = 1,
  pageSize = 6
): Promise<PagedListResp<StudentShowcaseItem>> => {
  const query = new URLSearchParams({
    "filters[is_active][$eq]": "true",
    "populate": "image",
    "sort[0]": "sort_order:asc",
    "sort[1]": "id:asc",
    "pagination[page]": String(page),
    "pagination[pageSize]": String(pageSize),
  }).toString();

  try {
    const res = await request<any>(`/api/student-showcases?${query}`);
    const data: StudentShowcaseItem[] = (res.data || []).map((item: any) => ({
      id: item.id,
      name: item.name || "",
      description: item.description || null,
      image: item.image || null,
      is_active: item.is_active,
      sort_order: item.sort_order,
    }));

    return { data, meta: res.meta };
  } catch (error) {
    console.error('❌ 获取 Student Showcases 失败:', error);
    return { data: [], meta: {} };
  }
};
// ✅ 新增：Policy Document 政策文件的数据类型
export interface PolicyDocumentItem {
  id: number;
  title: string;
  slug: string;
  content?: string | null;
  attachments?: Array<{
    id: number;
    name: string;
    url: string;
    ext: string;
    size: number;
  }> | null;
  publish_time?: string | null;
  is_active?: boolean;
  sort_order?: number;
}

/** ✅ 新增：获取「政策文件」列表（分页） */
export const getPolicyDocuments = async (
  page = 1,
  pageSize = 5
): Promise<PagedListResp<PolicyDocumentItem>> => {
  const query = new URLSearchParams({
    "filters[is_active][$eq]": "true",
    "populate": "attachments",
    "sort[0]": "sort_order:asc",
    "sort[1]": "publish_time:desc",
    "sort[2]": "id:desc",
    "pagination[page]": String(page),
    "pagination[pageSize]": String(pageSize),
  }).toString();

  try {
    const res = await request<any>(`/api/policy-documents?${query}`);
    const data: PolicyDocumentItem[] = (res.data || []).map((item: any) => ({
      id: item.id,
      title: item.title || "",
      slug: item.slug || "",
      content: item.content || null,
      attachments: item.attachments || null,
      publish_time: item.publish_time || null,
      is_active: item.is_active,
      sort_order: item.sort_order,
    }));

    return { data, meta: res.meta };
  } catch (error) {
    console.error('❌ 获取 Policy Documents 失败:', error);
    return { data: [], meta: {} };
  }
};

/** ✅ 新增：根据 slug 获取政策文件详情 */
export const getPolicyDocumentBySlug = async (slug: string): Promise<PolicyDocumentItem | null> => {
  const query = new URLSearchParams({
    "filters[slug][$eq]": slug,
    "populate": "attachments",
  }).toString();

  try {
    const res = await request<any>(`/api/policy-documents?${query}`);
    const item = res.data?.[0];
    if (!item) return null;

    return {
      id: item.id,
      title: item.title || "",
      slug: item.slug || "",
      content: item.content || null,
      attachments: item.attachments || null,
      publish_time: item.publish_time || null,
      is_active: item.is_active,
      sort_order: item.sort_order,
    };
  } catch (error) {
    console.error('❌ 获取 Policy Document 详情失败:', error);
    return null;
  }
};
// ✅ 新增：Download File 资料下载的数据类型
export interface DownloadFileItem {
  id: number;
  title: string;
  description?: string | null;
  file?: {
    id: number;
    name: string;
    url: string;
    ext: string;
    size: number;
  } | null;
  is_active?: boolean;
  sort_order?: number;
}

/** ✅ 新增：获取「资料下载」列表（分页） */
export const getDownloadFiles = async (
  page = 1,
  pageSize = 5
): Promise<PagedListResp<DownloadFileItem>> => {
  const query = new URLSearchParams({
    "filters[is_active][$eq]": "true",
    "populate": "file",
    "sort[0]": "sort_order:asc",
    "sort[1]": "id:asc",
    "pagination[page]": String(page),
    "pagination[pageSize]": String(pageSize),
  }).toString();

  try {
    const res = await request<any>(`/api/download-files?${query}`);
    const data: DownloadFileItem[] = (res.data || []).map((item: any) => ({
      id: item.id,
      title: item.title || "",
      description: item.description || null,
      file: item.file || null,
      is_active: item.is_active,
      sort_order: item.sort_order,
    }));

    return { data, meta: res.meta };
  } catch (error) {
    console.error('❌ 获取 Download Files 失败:', error);
    return { data: [], meta: {} };
  }
};
// ✅ 新增：搜索结果类型
export interface SearchResultItem {
  id: number;
  title: string;
  slug: string;
  type: 'article' | 'policy' | 'student-document' | 'research-transfer' | 'supervisor' | 'research-institution';
  summary?: string | null;
  publish_time?: string | null;
  url: string;
}

/** ✅ 修复：全站搜索 */
export const searchAll = async (
  keyword: string,
  page = 1,
  pageSize = 10
): Promise<PagedListResp<SearchResultItem>> => {
  if (!keyword || keyword.trim() === '') {
    return { data: [], meta: {} };
  }

  try {
    const results: SearchResultItem[] = [];

    // 1. 搜索文章
    try {
      const articlesQuery = new URLSearchParams({
        "filters[$or][0][title][$containsi]": keyword,
        "filters[$or][1][summary][$containsi]": keyword,
        "filters[$or][2][content][$containsi]": keyword,  // ✅ 添加内容搜索
        // ❌ 移除 is_active 过滤
        "fields[0]": "title",
        "fields[1]": "slug",
        "fields[2]": "summary",
        "fields[3]": "publish_time",
        "pagination[pageSize]": "10",
      }).toString();

      const articlesRes = await request<any>(`/api/articles?${articlesQuery}`);
      
      (articlesRes.data || []).forEach((item: any) => {
        results.push({
          id: item.id,
          title: item.title || "",
          slug: item.slug || "",
          type: 'article',
          summary: item.summary || null,
          publish_time: item.publish_time || null,
          url: `/article/${item.slug}`,
        });
      });
    } catch (error) {
      console.error('搜索文章失败:', error);
    }

    // 2. 搜索政策文件
    try {
      const policiesQuery = new URLSearchParams({
        "filters[title][$containsi]": keyword,
        // ❌ 移除 is_active 过滤
        "fields[0]": "title",
        "fields[1]": "slug",
        "fields[2]": "publish_time",
        "pagination[pageSize]": "10",
      }).toString();

      const policiesRes = await request<any>(`/api/policy-documents?${policiesQuery}`);
      (policiesRes.data || []).forEach((item: any) => {
        results.push({
          id: item.id,
          title: item.title || "",
          slug: item.slug || "",
          type: 'policy',
          summary: null,
          publish_time: item.publish_time || null,
          url: `/documents/policies/${item.slug}`,
        });
      });
    } catch (error) {
      console.error('搜索政策文件失败:', error);
    }

    // 3. 搜索学生文档
    try {
      const studentDocsQuery = new URLSearchParams({
        "filters[title][$containsi]": keyword,
        // ❌ 移除 is_active 过滤
        "fields[0]": "title",
        "fields[1]": "slug",
        "fields[2]": "publish_time",
        "pagination[pageSize]": "10",
      }).toString();

      const studentDocsRes = await request<any>(`/api/student-documents?${studentDocsQuery}`);
      (studentDocsRes.data || []).forEach((item: any) => {
        results.push({
          id: item.id,
          title: item.title || "",
          slug: item.slug || "",
          type: 'student-document',
          summary: null,
          publish_time: item.publish_time || null,
          url: `/students/document/${item.slug}`,
        });
      });
    } catch (error) {
      console.error('搜索学生文档失败:', error);
    }

    // 4. 搜索成果转化
    try {
      const transfersQuery = new URLSearchParams({
        "filters[$or][0][title][$containsi]": keyword,
        "filters[$or][1][summary][$containsi]": keyword,
        // ❌ 移除 is_active 过滤
        "fields[0]": "title",
        "fields[1]": "slug",
        "fields[2]": "summary",
        "fields[3]": "publish_time",
        "pagination[pageSize]": "10",
      }).toString();

      const transfersRes = await request<any>(`/api/research-transfers?${transfersQuery}`);
      (transfersRes.data || []).forEach((item: any) => {
        results.push({
          id: item.id,
          title: item.title || "",
          slug: item.slug || "",
          type: 'research-transfer',
          summary: item.summary || null,
          publish_time: item.publish_time || null,
          url: `/research/transfer/${item.slug}`,
        });
      });
    } catch (error) {
      console.error('搜索成果转化失败:', error);
    }

    // 5. 搜索科研机构
    try {
      const institutionsQuery = new URLSearchParams({
        "filters[$or][0][name][$containsi]": keyword,
        "filters[$or][1][description][$containsi]": keyword,
        // ❌ 移除 is_active 过滤
        "fields[0]": "name",
        "fields[1]": "slug",
        "fields[2]": "description",
        "pagination[pageSize]": "10",
      }).toString();

      const institutionsRes = await request<any>(`/api/research-institutions?${institutionsQuery}`);
      (institutionsRes.data || []).forEach((item: any) => {
        results.push({
          id: item.id,
          title: item.name || "",
          slug: item.slug || "",
          type: 'research-institution',
          summary: item.description || null,
          publish_time: null,
          url: `/research/institutions/${item.slug}`,
        });
      });
    } catch (error) {
      console.error('搜索科研机构失败:', error);
    }

    // 6. 搜索导师
    try {
      const supervisorsQuery = new URLSearchParams({
        "filters[$or][0][name][$containsi]": keyword,
        "filters[$or][1][title][$containsi]": keyword,
        "filters[$or][2][college][$containsi]": keyword,
        "filters[$or][3][major][$containsi]": keyword,
        // ❌ 移除 is_active 过滤
        "fields[0]": "name",
        "fields[1]": "slug",
        "fields[2]": "title",
        "fields[3]": "college",
        "fields[4]": "major",
        "pagination[pageSize]": "10",
      }).toString();

      const supervisorsRes = await request<any>(`/api/supervisors?${supervisorsQuery}`);
      (supervisorsRes.data || []).forEach((item: any) => {
        results.push({
          id: item.id,
          title: `${item.name || ""} - ${item.title || ""}`,
          slug: item.slug || "",
          type: 'supervisor',
          summary: `${item.college || ""} ${item.major || ""}`,
          publish_time: null,
          url: `/faculty/supervisor/${item.slug}`,
        });
      });
    } catch (error) {
      console.error('搜索导师失败:', error);
    }

    // 按发布时间排序
    results.sort((a, b) => {
      if (!a.publish_time) return 1;
      if (!b.publish_time) return -1;
      return new Date(b.publish_time).getTime() - new Date(a.publish_time).getTime();
    });

    // 分页
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedResults = results.slice(start, end);

    return {
      data: paginatedResults,
      meta: {
        pagination: {
          page,
          pageSize,
          total: results.length,
          pageCount: Math.ceil(results.length / pageSize),
        },
      },
    };
  } catch (error) {
    console.error('❌ 搜索失败:', error);
    return { data: [], meta: {} };
  }
};
