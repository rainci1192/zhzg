'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { api, uploadFile, uploadFiles } from '@/lib/api';
import { Plus, Edit, Trash2, Eye, Send, CheckCircle, XCircle, Clock, MessageSquare, User, ChevronDown, ChevronUp, Filter, RotateCcw, CalendarClock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useModulePermission } from '@/hooks/useModulePermission';

const WordLikeEditor = dynamic(() => import('@/components/editor/WordLikeEditor'), { ssr: false });

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const FRONTEND_URL = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000';

type ReviewStatus =
  | 'draft'
  | 'pending_level1'
  | 'rejected_level1'
  | 'pending_level2'
  | 'rejected_level2'
  | 'pending_republish'
  | 'rejected_republish'
  | 'approved_pending_publish'
  | 'published'
  | 'unpublished'
  | 'pending_admin'
  | 'rejected_admin'
  | 'pending_leader'
  | 'rejected_leader'
  | 'approved';

interface Category {
  id: number;
  documentId?: string;
  name: string;
  level?: number;
  parentCategory?: { id: number; name: string } | null;
}

interface CoverMedia {
  id: number;
  url: string;
}

interface AdminRelation {
  id?: number | string;
  documentId?: string;
  name?: string;
  email?: string;
  role?: string;
  role_display_name?: string;
}

interface Article {
  id: number;
  documentId?: string;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  review_status: ReviewStatus;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  publish_time?: string;
  hasPublishedVersion?: boolean;
  primary_category?: { id: number; name: string } | null;
  secondary_category?: { id: number; name: string } | null;
  cover?: CoverMedia | null;
  attachments?: UploadedFile[] | null;
  attachment_names?: Record<string, string> | null;
  created_by_admin?: AdminRelation | null;
  level1_reviewer?: AdminRelation | null;
  level2_reviewer?: AdminRelation | null;
  rejection_reason?: string;
  level1_review_comment?: string;
  level2_review_comment?: string;
  admin_review_comment?: string;
  leader_review_comment?: string;
}

interface Reviewer {
  id: number;
  documentId?: string;
  name: string;
  email: string;
  role?: string;
  role_display_name?: string;
}

function relationName(relation: AdminRelation | { data?: AdminRelation } | null | undefined) {
  const value: AdminRelation | null | undefined = relation && typeof relation === 'object' && 'data' in relation
    ? relation.data
    : relation as AdminRelation | null | undefined;
  return value?.name || value?.email || '未记录';
}

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('zh-CN', { hour12: false });
}

function toLocalDateTime(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 19);
}

function localDateBoundary(value: string, endOfDay = false) {
  if (!value) return '';
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day, endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0, endOfDay ? 999 : 0);
  return date.toISOString();
}

interface UploadedFile {
  id: number;
  documentId?: string;
  name?: string;
  url: string;
  size?: number;
  mime?: string;
}

const LEVEL1_ROLES = new Set(['article_level1_reviewer', 'level1_reviewer', 'reviewer_level1']);
const LEVEL2_ROLES = new Set(['article_level2_reviewer', 'level2_reviewer', 'reviewer_level2']);
const EDITABLE_STATUSES = new Set(['draft', 'rejected_level1', 'rejected_level2', 'rejected_republish', 'rejected_admin', 'rejected_leader', 'unpublished', 'published']);
const STATUS_OPTIONS: Array<{ value: ReviewStatus; label: string }> = [
  { value: 'draft', label: '草稿' },
  { value: 'pending_level1', label: '待一级审核' },
  { value: 'rejected_level1', label: '一级审核退回' },
  { value: 'pending_level2', label: '待二级审核' },
  { value: 'rejected_level2', label: '二级审核退回' },
  { value: 'pending_republish', label: '修改待二级审核' },
  { value: 'rejected_republish', label: '修改审核退回' },
  { value: 'approved_pending_publish', label: '待发布' },
  { value: 'published', label: '已发布' },
  { value: 'unpublished', label: '已取消发布' },
  { value: 'pending_admin', label: '待一级审核（旧状态）' },
  { value: 'rejected_admin', label: '一级审核退回（旧状态）' },
  { value: 'pending_leader', label: '待二级审核（旧状态）' },
  { value: 'rejected_leader', label: '二级审核退回（旧状态）' },
  { value: 'approved', label: '待发布（旧状态）' },
];

type SortField = 'title' | 'created_by_admin.name' | 'primary_category.name' | 'secondary_category.name' | 'review_status' | 'publish_time' | 'updatedAt' | 'createdAt';

interface ArticleFilters {
  publisherId: string;
  primaryCategoryId: string;
  secondaryCategoryId: string;
  status: string;
  publishFrom: string;
  publishTo: string;
  updatedFrom: string;
  updatedTo: string;
}

const EMPTY_FILTERS: ArticleFilters = {
  publisherId: '',
  primaryCategoryId: '',
  secondaryCategoryId: '',
  status: '',
  publishFrom: '',
  publishTo: '',
  updatedFrom: '',
  updatedTo: '',
};

function uniqueReviewers(items: Reviewer[]) {
  const seen = new Set<string>();
  return (items || []).filter((item) => {
    const key = String(item.email || item.documentId || item.id || '').trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function relationMatches(relation: AdminRelation | { data?: AdminRelation } | null | undefined, user: { id?: string; documentId?: string; email?: string } | null) {
  if (!relation || !user) return false;
  const raw = relation as AdminRelation & {
    data?: AdminRelation & { attributes?: AdminRelation };
    attributes?: AdminRelation;
  };
  const nested = raw.data || raw;
  const attributes = nested.attributes || nested;
  const normalized = { ...attributes, id: nested.id ?? attributes.id, documentId: nested.documentId ?? attributes.documentId };
  return (
    (normalized.id != null && String(normalized.id) === String(user.id)) ||
    Boolean(normalized.documentId && user.documentId && normalized.documentId === user.documentId) ||
    Boolean(normalized.email && user.email && normalized.email.trim().toLowerCase() === user.email.trim().toLowerCase())
  );
}

export default function ArticlesPage() {
  const { user } = useAuth();
  const articlePermissions = useModulePermission('articles');
  const userRole = user?.role || '';
  const isSuperAdmin = userRole === 'super_admin';
  const isLevel1 = isSuperAdmin || LEVEL1_ROLES.has(userRole);
  const isLevel2 = isSuperAdmin || LEVEL2_ROLES.has(userRole);
  const canCreateArticle = isSuperAdmin || (!articlePermissions.loading && articlePermissions.canCreate);
  const canUpdateArticle = isSuperAdmin || (!articlePermissions.loading && articlePermissions.canUpdate);
  const canDeleteArticle = isSuperAdmin || (!articlePermissions.loading && articlePermissions.canDelete);
  const canPublishArticle = isSuperAdmin || (!articlePermissions.loading && articlePermissions.canPublish);
  const canUnpublishArticle = isSuperAdmin || (!articlePermissions.loading && articlePermissions.canUnpublish);
  const canReviewArticle = isSuperAdmin || (!articlePermissions.loading && articlePermissions.canReview);

  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [publishers, setPublishers] = useState<Reviewer[]>([]);
  const [level1Reviewers, setLevel1Reviewers] = useState<Reviewer[]>([]);
  const [level2Reviewers, setLevel2Reviewers] = useState<Reviewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;
  const [filterDraft, setFilterDraft] = useState<ArticleFilters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<ArticleFilters>(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewingArticle, setReviewingArticle] = useState<Article | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [selectedLevel2Reviewer, setSelectedLevel2Reviewer] = useState('');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [timeArticle, setTimeArticle] = useState<Article | null>(null);
  const [timeField, setTimeField] = useState<'publish' | 'updated'>('publish');
  const [timeValue, setTimeValue] = useState('');
  const [timeSaving, setTimeSaving] = useState(false);
  const [submittingArticle, setSubmittingArticle] = useState<Article | null>(null);
  const [selectedLevel1Reviewer, setSelectedLevel1Reviewer] = useState('');
  const [form, setForm] = useState({
    title: '',
    summary: '',
    content: '',
    primaryCategoryId: '',
    secondaryCategoryId: '',
    coverId: '',
    coverPreview: '',
    attachments: [] as UploadedFile[],
    attachmentNames: {} as Record<string, string>,
    publisherId: '',
    publisherLabel: '',
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const editorImageUploads = useRef(new Map<string, UploadedFile>());
  const manualCoverSelection = useRef(false);
  const latestContentRef = useRef('');
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [newAttachmentIds, setNewAttachmentIds] = useState<number[]>([]);
  const [attachmentUploading, setAttachmentUploading] = useState(false);
  const [attachmentError, setAttachmentError] = useState('');
  const [attachmentMessage, setAttachmentMessage] = useState('');

  const getKey = (article: Article) => article.documentId || String(article.id);

  const mediaPath = (url: string) => {
    if (!url || /^(?:data|blob):/i.test(url)) return '';
    try {
      const parsed = new URL(url, STRAPI_URL);
      if (parsed.origin !== new URL(STRAPI_URL).origin) return '';
      return parsed.pathname;
    } catch { return ''; }
  };

  const firstBodyImage = (html: string) => {
    if (typeof DOMParser === 'undefined') return '';
    return new DOMParser().parseFromString(html || '', 'text/html').querySelector('img')?.getAttribute('src') || '';
  };

  const applyDefaultCoverFromContent = async (html: string) => {
    const source = firstBodyImage(html);
    if (!source || manualCoverSelection.current) return;
    const path = mediaPath(source);
    if (!path) return;
    let media = editorImageUploads.current.get(path);
    if (!media) {
      try {
        const result = await api.getUploadedFileByUrl(path) as UploadedFile[] | { data?: UploadedFile | UploadedFile[] | null };
        media = Array.isArray(result)
          ? result[0]
          : Array.isArray(result?.data)
            ? result.data[0]
            : result?.data || undefined;
      } catch {
        // Existing content images may be remote or unavailable to this role;
        // keep the article editable and leave its cover unchanged in that case.
        return;
      }
    }
    if (!media?.id || manualCoverSelection.current || mediaPath(firstBodyImage(latestContentRef.current)) !== path) return;
    editorImageUploads.current.set(path, media);
    setForm((current) => manualCoverSelection.current ? current : {
      ...current,
      coverId: String(media!.id),
      coverPreview: media!.url.startsWith('http') ? media!.url : `${STRAPI_URL}${media!.url}`,
    });
  };

  const fetchArticles = async (
    targetPage = page,
    targetFilters = appliedFilters,
    targetSortField = sortField,
    targetSortDirection = sortDirection,
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('populate', '*');
      params.set('pagination[page]', String(targetPage));
      params.set('pagination[pageSize]', String(pageSize));
      params.set('sort', `${targetSortField}:${targetSortDirection}`);
      if (targetFilters.publisherId) params.set('filters[created_by_admin][id][$eq]', targetFilters.publisherId);
      if (targetFilters.primaryCategoryId) params.set('filters[primary_category][id][$eq]', targetFilters.primaryCategoryId);
      if (targetFilters.secondaryCategoryId) params.set('filters[secondary_category][id][$eq]', targetFilters.secondaryCategoryId);
      if (targetFilters.status) params.set('filters[review_status][$eq]', targetFilters.status);
      if (targetFilters.publishFrom) params.set('filters[publish_time][$gte]', localDateBoundary(targetFilters.publishFrom));
      if (targetFilters.publishTo) params.set('filters[publish_time][$lte]', localDateBoundary(targetFilters.publishTo, true));
      if (targetFilters.updatedFrom) params.set('filters[updatedAt][$gte]', localDateBoundary(targetFilters.updatedFrom));
      if (targetFilters.updatedTo) params.set('filters[updatedAt][$lte]', localDateBoundary(targetFilters.updatedTo, true));

      const response = (await api.getWorkflowArticles(`?${params.toString()}`)) as {
        data?: Article[];
        meta?: { pagination?: { total?: number } };
      };
      setArticles(response.data || []);
      setTotal(Number(response.meta?.pagination?.total || 0));
    } catch (error) {
      console.error('fetchArticles error:', error);
      setArticles([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = (await api.getArticleCategoryOptions()) as { data?: Category[] };
      setCategories(response.data || []);
    } catch (error) {
      console.error('fetchCategories error:', error);
      setCategories([]);
    }
  };

  useEffect(() => {
    void fetchCategories();
  }, []);

  useEffect(() => {
    void fetchArticles(page, appliedFilters, sortField, sortDirection);
  }, [page, appliedFilters, sortField, sortDirection]);

  useEffect(() => {
    void (async () => {
      try {
        if (!user?.id) return;
        const response = (await (isSuperAdmin
          ? api.getArticlePublishers()
          : api.getArticlePublisherFilterOptions())) as { data?: Reviewer[] };
        setPublishers(uniqueReviewers(response.data || []));
      } catch (error) {
        console.error('fetch article publishers error:', error);
        setPublishers([]);
      }
    })();
  }, [isSuperAdmin, user?.id]);

  const primaryOptions = useMemo(
    () => categories.filter((category) => !category.parentCategory || category.level === 1),
    [categories]
  );

  const secondaryOptions = useMemo(() => {
    const primaryId = Number(form.primaryCategoryId);
    if (!primaryId) return [];
    return categories.filter((category) => {
      const parentId = category.parentCategory?.id ?? (category as Category & { parent?: { id?: number } }).parent?.id ?? null;
      return parentId === primaryId;
    });
  }, [categories, form.primaryCategoryId]);

  const filterSecondaryOptions = useMemo(() => {
    const primaryId = Number(filterDraft.primaryCategoryId);
    return categories.filter((category) => {
      const parentId = category.parentCategory?.id ?? (category as Category & { parent?: { id?: number } }).parent?.id ?? null;
      return primaryId ? parentId === primaryId : Boolean(parentId) || category.level === 2;
    });
  }, [categories, filterDraft.primaryCategoryId]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const applyFilters = () => {
    if (filterDraft.publishFrom && filterDraft.publishTo && filterDraft.publishFrom > filterDraft.publishTo) {
      alert('发布时间的开始日期不能晚于结束日期。');
      return;
    }
    if (filterDraft.updatedFrom && filterDraft.updatedTo && filterDraft.updatedFrom > filterDraft.updatedTo) {
      alert('修改时间的开始日期不能晚于结束日期。');
      return;
    }
    setPage(1);
    setAppliedFilters({ ...filterDraft });
  };

  const resetFilters = () => {
    setFilterDraft(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const toggleSort = (field: SortField) => {
    setPage(1);
    if (sortField === field) {
      setSortDirection((current) => current === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <span className="ml-1 text-gray-300">↕</span>;
    return sortDirection === 'asc' ? <ChevronUp className="ml-1 inline h-3.5 w-3.5" /> : <ChevronDown className="ml-1 inline h-3.5 w-3.5" />;
  };

  const openModal = (article?: Article) => {
    if (article) {
      latestContentRef.current = article.content || '';
      manualCoverSelection.current = Boolean(article.cover?.id);
      setEditingKey(getKey(article));
      setForm({
        title: article.title || '',
        summary: article.summary || '',
        content: article.content || '',
        primaryCategoryId: article.primary_category?.id ? String(article.primary_category.id) : '',
        secondaryCategoryId: article.secondary_category?.id ? String(article.secondary_category.id) : '',
        coverId: article.cover?.id ? String(article.cover.id) : '',
        coverPreview: article.cover?.url ? `${STRAPI_URL}${article.cover.url}` : '',
        attachments: Array.isArray(article.attachments) ? article.attachments : [],
        attachmentNames: article.attachment_names || {},
        publisherId: article.created_by_admin?.documentId || (article.created_by_admin?.id != null ? String(article.created_by_admin.id) : ''),
        publisherLabel: relationName(article.created_by_admin),
      });
    } else {
      latestContentRef.current = '';
      manualCoverSelection.current = false;
      setEditingKey(null);
      setForm({
        title: '',
        summary: '',
        content: '',
        primaryCategoryId: '',
        secondaryCategoryId: '',
        coverId: '',
        coverPreview: '',
        attachments: [],
        attachmentNames: {},
        publisherId: user?.documentId || user?.id || '',
        publisherLabel: user?.name || user?.email || '',
      });
    }
    setCoverFile(null);
    setAttachmentFiles([]);
    setNewAttachmentIds([]);
    setAttachmentError('');
    setAttachmentMessage('');
    setIsModalOpen(true);
    if (article && !article.cover?.id) void applyDefaultCoverFromContent(article.content || '');
  };

  const handleAttachmentSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.currentTarget.files || []);
    event.currentTarget.value = '';
    if (selectedFiles.length === 0) return;

    setAttachmentFiles(selectedFiles);
    setAttachmentError('');
    setAttachmentMessage('');
    setAttachmentUploading(true);
    try {
      const uploaded = (await uploadFiles(selectedFiles)) as UploadedFile[];
      if (!Array.isArray(uploaded) || uploaded.length !== selectedFiles.length || uploaded.some((file) => !file?.id)) {
        throw new Error('Strapi 未返回完整的附件记录，请检查上传权限和服务端日志。');
      }
      setForm((current) => ({ ...current, attachments: [...current.attachments, ...uploaded] }));
      setNewAttachmentIds((current) => [...current, ...uploaded.map((file) => file.id)]);
      setAttachmentFiles([]);
      setAttachmentMessage(`已成功上传 ${uploaded.length} 个附件；点击“保存”后将关联到文章。`);
    } catch (error) {
      const detail = error instanceof Error ? error.message : '未知错误';
      setAttachmentError(`附件上传失败：${detail.includes('Failed to fetch') ? '无法连接 Strapi，请确认 backend 正在运行且 NEXT_PUBLIC_STRAPI_URL 配置正确。' : detail}`);
      console.error('article attachment upload failed:', error);
    } finally {
      setAttachmentUploading(false);
    }
  };

  const handleEditorUpload = async (file: File): Promise<{ url: string; id?: number }> => {
    const uploaded = (await uploadFile(file)) as UploadedFile[];
    const media = uploaded?.[0];
    const path = media?.url ? mediaPath(media.url) : '';
    const url = media?.url || '';
    if (!media?.id || !url) throw new Error('图片上传未返回有效的媒体记录。');
    editorImageUploads.current.set(path, media);
    return { id: media.id, url: url.startsWith('http') ? url : `${STRAPI_URL}${url}` };
  };

  const handleArticleContentChange = (html: string) => {
    latestContentRef.current = html;
    setForm((previous) => ({ ...previous, content: html }));
    void applyDefaultCoverFromContent(html);
  };

  const saveArticle = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title.trim()) return alert('标题不能为空');
    if (!form.primaryCategoryId) return alert('请选择一级分类');
    if (attachmentUploading || attachmentFiles.length > 0) return alert('请先完成附件上传，或移除上传失败的文件。');

    try {
      let coverId = form.coverId;
      if (coverFile) {
        const uploaded = (await uploadFile(coverFile)) as UploadedFile[];
        if (uploaded?.[0]?.id) coverId = String(uploaded[0].id);
      }
      const attachmentIds = form.attachments.map((file) => file.id);

      const payload: Record<string, unknown> = {
        title: form.title,
        summary: form.summary,
        content: form.content,
        primary_category: Number(form.primaryCategoryId),
        secondary_category: form.secondaryCategoryId ? Number(form.secondaryCategoryId) : null,
        cover: coverId ? Number(coverId) : null,
        attachments: attachmentIds,
        attachment_names: Object.fromEntries(form.attachments
          .map((file) => [String(file.documentId || file.id), String(form.attachmentNames[String(file.documentId || file.id)] || '').trim()] as const)
          .filter(([, name]) => name.length > 0)),
      };

      if (isSuperAdmin && form.publisherId) {
        payload.created_by_admin = form.publisherId;
      }

      if (editingKey) await api.updateArticle(editingKey, payload);
      else await api.createArticle(payload);

      setIsModalOpen(false);
      await fetchArticles();
      alert('保存成功！');
    } catch (error) {
      alert(`保存失败：${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const openSubmitModal = async (article: Article) => {
    if (article.review_status === 'rejected_republish') {
      setSubmittingArticle(article);
      setSelectedLevel1Reviewer('__republish__');
      setIsSubmitModalOpen(true);
      return;
    }
    try {
      const response = (await api.getLevel1Reviewers()) as { data?: Reviewer[] };
      const reviewers = uniqueReviewers(response.data || []);
      if (reviewers.length === 0) return alert('当前没有可选的一级审核人员，请先配置一级审核角色用户。');
      setLevel1Reviewers(reviewers);
      setSubmittingArticle(article);
      setSelectedLevel1Reviewer(reviewers.length === 1 ? String(reviewers[0].documentId || reviewers[0].id) : '');
      setIsSubmitModalOpen(true);
    } catch (error) {
      alert(`读取一级审核人员失败：${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const submitForReview = async () => {
    if (!submittingArticle || !selectedLevel1Reviewer) return alert('请选择审核人员。');
    try {
      await api.submitArticleForReview(
        getKey(submittingArticle),
        selectedLevel1Reviewer === '__republish__' ? undefined : selectedLevel1Reviewer
      );
      setIsSubmitModalOpen(false);
      setSubmittingArticle(null);
      await fetchArticles();
      alert('文章已提交给一级审核人员。');
    } catch (error) {
      alert(`提交审核失败：${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const openReviewModal = async (article: Article, action: 'approve' | 'reject') => {
    setReviewingArticle(article);
    setReviewAction(action);
    setReviewComment('');
    setSelectedLevel2Reviewer('');
    if (action === 'approve' && (article.review_status === 'pending_level1' || article.review_status === 'pending_admin')) {
      try {
        const response = (await api.getLevel2Reviewers()) as { data?: Reviewer[] };
        const reviewers = uniqueReviewers(response.data || []);
        if (reviewers.length === 0) {
          alert('当前没有可选的二级审核人员，请先配置二级审核角色用户。');
          return;
        }
        setLevel2Reviewers(reviewers);
        setSelectedLevel2Reviewer(reviewers.length === 1 ? String(reviewers[0].documentId || reviewers[0].id) : '');
      } catch (error) {
        alert(`读取二级审核人员失败：${error instanceof Error ? error.message : '未知错误'}`);
        return;
      }
    }
    setIsReviewModalOpen(true);
  };

  const handleReview = async () => {
    if (!reviewingArticle) return;
    try {
      if (reviewingArticle.review_status === 'pending_level1' || reviewingArticle.review_status === 'pending_admin') {
        if (reviewAction === 'approve' && !selectedLevel2Reviewer) return alert('请选择二级审核人员。');
        await api.reviewArticleLevel1(getKey(reviewingArticle), reviewAction, reviewComment, selectedLevel2Reviewer);
      } else {
        await api.reviewArticleLevel2(getKey(reviewingArticle), reviewAction, reviewComment);
      }
      setIsReviewModalOpen(false);
      await fetchArticles();
      alert(reviewAction === 'approve'
        ? (reviewingArticle.review_status === 'pending_level1' || reviewingArticle.review_status === 'pending_admin' ? '一级审核通过，已提交二级审核。' : '二级审核通过。')
        : '文章已退回发布者。');
    } catch (error) {
      alert(`审核操作失败：${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const publish = async (article: Article) => {
    if (!confirm(isSuperAdmin && article.review_status !== 'approved_pending_publish' ? '超级管理员可直接发布，确定现在发布吗？' : '二级审核已通过，确定现在发布吗？')) return;
    try {
      await api.publishArticle(getKey(article));
      await fetchArticles();
      alert('发布成功。');
    } catch (error) {
      alert(`发布失败：${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const openTimeModal = (article: Article, field: 'publish' | 'updated') => {
    if (!isSuperAdmin || (field === 'publish' && article.review_status !== 'published' && !article.hasPublishedVersion)) return;
    setTimeField(field);
    setTimeArticle(article);
    setTimeValue(toLocalDateTime(field === 'publish' ? article.publish_time || article.publishedAt : article.updatedAt));
  };

  const saveTime = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isSuperAdmin || !timeArticle || timeSaving) return;
    const label = timeField === 'publish' ? '发布时间' : '修改时间';
    const date = new Date(timeValue);
    if (!timeValue || Number.isNaN(date.getTime())) return alert(`请选择有效的${label}。`);
    if (date.getTime() > Date.now() + 60_000) return alert(`${label}不能晚于当前时间。`);

    setTimeSaving(true);
    try {
      if (timeField === 'publish') await api.changeArticlePublishTime(getKey(timeArticle), date.toISOString());
      else await api.changeArticleUpdatedTime(getKey(timeArticle), date.toISOString());
      setTimeArticle(null);
      await fetchArticles();
      alert(`${label}已更新。`);
    } catch (error) {
      alert(`修改${label}失败：${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setTimeSaving(false);
    }
  };

  const renderPublishTime = (article: Article) => (
    <div className="flex flex-wrap items-center gap-1">
      <span>{formatDate(article.publish_time || article.publishedAt)}</span>
      {isSuperAdmin && (article.review_status === 'published' || article.hasPublishedVersion) && (
        <button type="button" onClick={() => openTimeModal(article, 'publish')}
          className="rounded p-1 text-blue-600 hover:bg-blue-50 hover:text-blue-800"
          aria-label={`修改《${article.title}》的发布时间`} title="修改发布时间">
          <CalendarClock className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  const renderUpdatedTime = (article: Article) => (
    <div className="flex flex-wrap items-center gap-1">
      <span>{formatDate(article.updatedAt)}</span>
      {isSuperAdmin && (
        <button type="button" onClick={() => openTimeModal(article, 'updated')}
          className="rounded p-1 text-blue-600 hover:bg-blue-50 hover:text-blue-800"
          aria-label={`修改《${article.title}》的修改时间`} title="修改时间">
          <CalendarClock className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  const handleDelete = async (article: Article) => {
    if (!confirm('确定删除这篇文章吗？')) return;
    try {
      await api.deleteArticle(getKey(article));
      await fetchArticles();
    } catch (error) {
      alert(`删除失败：${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const getStatusBadge = (status: ReviewStatus) => {
    const map: Record<ReviewStatus, { label: string; color: string; icon: React.ReactNode }> = {
      draft: { label: '草稿', color: 'bg-gray-100 text-gray-600', icon: <Edit className="w-3 h-3" /> },
      pending_level1: { label: '待一级审核', color: 'bg-amber-100 text-amber-600', icon: <Clock className="w-3 h-3" /> },
      rejected_level1: { label: '一级审核退回', color: 'bg-red-100 text-red-600', icon: <XCircle className="w-3 h-3" /> },
      pending_level2: { label: '待二级审核', color: 'bg-blue-100 text-blue-600', icon: <Clock className="w-3 h-3" /> },
      rejected_level2: { label: '二级审核退回', color: 'bg-orange-100 text-orange-600', icon: <XCircle className="w-3 h-3" /> },
      pending_republish: { label: '修改待二级审核', color: 'bg-indigo-100 text-indigo-600', icon: <Clock className="w-3 h-3" /> },
      rejected_republish: { label: '修改审核退回', color: 'bg-red-100 text-red-600', icon: <XCircle className="w-3 h-3" /> },
      approved_pending_publish: { label: '待发布者发布', color: 'bg-purple-100 text-purple-600', icon: <CheckCircle className="w-3 h-3" /> },
      published: { label: '已发布', color: 'bg-emerald-100 text-emerald-600', icon: <CheckCircle className="w-3 h-3" /> },
      unpublished: { label: '已取消发布', color: 'bg-gray-100 text-gray-600', icon: <XCircle className="w-3 h-3" /> },
      pending_admin: { label: '待一级审核（旧状态）', color: 'bg-amber-100 text-amber-600', icon: <Clock className="w-3 h-3" /> },
      rejected_admin: { label: '一级审核退回（旧状态）', color: 'bg-red-100 text-red-600', icon: <XCircle className="w-3 h-3" /> },
      pending_leader: { label: '待二级审核（旧状态）', color: 'bg-blue-100 text-blue-600', icon: <Clock className="w-3 h-3" /> },
      rejected_leader: { label: '二级审核退回（旧状态）', color: 'bg-orange-100 text-orange-600', icon: <XCircle className="w-3 h-3" /> },
      approved: { label: '待发布者发布（旧状态）', color: 'bg-purple-100 text-purple-600', icon: <CheckCircle className="w-3 h-3" /> },
    };
    const info = map[status] || map.draft;
    return <span className={`inline-flex max-w-full flex-wrap items-center justify-center gap-1 break-words whitespace-normal px-2 py-1 text-center text-xs font-medium leading-4 rounded-full ${info.color}`}>{info.icon}{info.label}</span>;
  };

  const renderActions = (article: Article) => {
    const editable = EDITABLE_STATUSES.has(article.review_status);
    const owner = isSuperAdmin || relationMatches(article.created_by_admin, user);
    const canEdit = owner && canUpdateArticle && editable;
    const canDelete = owner && canDeleteArticle && editable;
    const canSubmit = owner && canUpdateArticle && editable && article.review_status !== 'published';
    const level1Status = article.review_status === 'pending_level1' || article.review_status === 'pending_admin';
    const level2Status = article.review_status === 'pending_level2' || article.review_status === 'pending_leader' || article.review_status === 'pending_republish';
    const canReviewLevel1 = isLevel1 && canReviewArticle && level1Status && (isSuperAdmin || article.review_status === 'pending_admin' || relationMatches(article.level1_reviewer, user));
    const canReviewLevel2 = isLevel2 && canReviewArticle && level2Status && (isSuperAdmin || !article.level2_reviewer || relationMatches(article.level2_reviewer, user));
    const canPublish = canPublishArticle && (isSuperAdmin ? article.review_status !== 'published' : article.review_status === 'approved_pending_publish' && owner && !article.hasPublishedVersion);
    const canUnpublish = canUnpublishArticle && article.review_status === 'published' && owner;
    const canViewReviewMessages = isSuperAdmin ||
      relationMatches(article.created_by_admin, user) ||
      relationMatches(article.level1_reviewer, user) ||
      relationMatches(article.level2_reviewer, user);
    const actionClass = (enabled: boolean, activeClass: string) => enabled ? activeClass : 'cursor-not-allowed text-gray-300';
    const actionTitle = (enabled: boolean, title: string) => enabled ? title : `${title}（无权限或非本人文章）`;

    return (
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <a href={`${FRONTEND_URL}/article/${article.slug}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800" title="预览"><Eye className="w-4 h-4" /></a>
        <button disabled={!canEdit} onClick={() => { if (canEdit) openModal(article); }} className={actionClass(canEdit, 'text-blue-600 hover:text-blue-800')} title={actionTitle(canEdit, '编辑')}><Edit className="w-4 h-4" /></button>
        {editable && article.review_status !== 'published' && <button disabled={!canSubmit} onClick={() => { if (canSubmit) void openSubmitModal(article); }} className={actionClass(canSubmit, 'text-amber-600 hover:text-amber-800')} title={actionTitle(canSubmit, article.review_status === 'rejected_republish' ? '提交二级审核' : '提交一级审核')}><Send className="w-4 h-4" /></button>}
        {level1Status && <><button disabled={!canReviewLevel1} onClick={() => { if (canReviewLevel1) void openReviewModal(article, 'approve'); }} className={actionClass(canReviewLevel1, 'text-green-600 hover:text-green-800')} title={actionTitle(canReviewLevel1, '一级审核通过')}><CheckCircle className="w-4 h-4" /></button><button disabled={!canReviewLevel1} onClick={() => { if (canReviewLevel1) void openReviewModal(article, 'reject'); }} className={actionClass(canReviewLevel1, 'text-red-600 hover:text-red-800')} title={actionTitle(canReviewLevel1, '一级审核退回')}><XCircle className="w-4 h-4" /></button></>}
        {level2Status && <><button disabled={!canReviewLevel2} onClick={() => { if (canReviewLevel2) void openReviewModal(article, 'approve'); }} className={actionClass(canReviewLevel2, 'text-green-600 hover:text-green-800')} title={actionTitle(canReviewLevel2, '二级审核通过')}><CheckCircle className="w-4 h-4" /></button><button disabled={!canReviewLevel2} onClick={() => { if (canReviewLevel2) void openReviewModal(article, 'reject'); }} className={actionClass(canReviewLevel2, 'text-red-600 hover:text-red-800')} title={actionTitle(canReviewLevel2, '二级审核退回')}><XCircle className="w-4 h-4" /></button></>}
        {(article.review_status === 'approved_pending_publish' && !article.hasPublishedVersion || isSuperAdmin && article.review_status !== 'published') && <button disabled={!canPublish} onClick={() => { if (canPublish) void publish(article); }} className={actionClass(canPublish, 'text-purple-600 hover:text-purple-800')} title={actionTitle(canPublish, isSuperAdmin && article.review_status !== 'approved_pending_publish' ? '超级管理员直接发布' : '发布')}><CheckCircle className="w-4 h-4" /></button>}
        {article.review_status === 'published' && <button disabled={!canUnpublish} onClick={async () => { if (!canUnpublish || !confirm('确定取消发布这篇文章吗？')) return; try { await api.unpublishArticle(getKey(article)); await fetchArticles(); } catch (error) { alert(`取消发布失败：${error instanceof Error ? error.message : '未知错误'}`); } }} className={actionClass(canUnpublish, 'text-orange-600 hover:text-orange-800')} title={actionTitle(canUnpublish, '取消发布')}><XCircle className="w-4 h-4" /></button>}
        {canViewReviewMessages && (article.rejection_reason || article.level1_review_comment || article.level2_review_comment || article.admin_review_comment || article.leader_review_comment) && <button onClick={() => alert(`审核意见：\n${article.rejection_reason || ''}\n${article.level1_review_comment || ''}\n${article.level2_review_comment || ''}`)} className="text-gray-600 hover:text-gray-800" title="查看意见"><MessageSquare className="w-4 h-4" /></button>}
        <button disabled={!canDelete} onClick={() => { if (canDelete) void handleDelete(article); }} className={actionClass(canDelete, 'text-red-500 hover:text-red-700')} title={actionTitle(canDelete, '删除')}><Trash2 className="w-4 h-4" /></button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-bold text-gray-900">文章管理</h1><p className="mt-1 text-gray-500">共 {total} 条文章</p></div><div className="flex items-center gap-3"><button type="button" onClick={() => setFiltersOpen((open) => !open)} className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium ${filtersOpen || Object.values(appliedFilters).some(Boolean) ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}><Filter className="h-4 w-4" />筛选显示</button><button disabled={!canCreateArticle} onClick={() => { if (canCreateArticle) openModal(); }} className={`flex items-center gap-2 rounded-2xl px-6 py-3 font-medium ${canCreateArticle ? 'bg-blue-600 text-white hover:bg-blue-700' : 'cursor-not-allowed bg-gray-100 text-gray-400'}`} title={canCreateArticle ? '新增文章' : '当前角色没有创建文章权限'}><Plus className="h-5 w-5" />新增文章</button></div></div>
      {filtersOpen && <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"><label className="text-sm text-gray-600">发布者<select value={filterDraft.publisherId} onChange={(event) => setFilterDraft((current) => ({ ...current, publisherId: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-gray-800"><option value="">全部用户</option>{publishers.map((publisher) => <option key={String(publisher.id)} value={String(publisher.id)}>{publisher.name}（{publisher.email}）</option>)}</select></label><label className="text-sm text-gray-600">一级分类<select value={filterDraft.primaryCategoryId} onChange={(event) => setFilterDraft((current) => ({ ...current, primaryCategoryId: event.target.value, secondaryCategoryId: '' }))} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-gray-800"><option value="">全部分类</option>{primaryOptions.map((category) => <option key={category.id} value={String(category.id)}>{category.name}</option>)}</select></label><label className="text-sm text-gray-600">二级分类<select value={filterDraft.secondaryCategoryId} onChange={(event) => setFilterDraft((current) => ({ ...current, secondaryCategoryId: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-gray-800"><option value="">全部分类</option>{filterSecondaryOptions.map((category) => <option key={category.id} value={String(category.id)}>{category.name}</option>)}</select></label><label className="text-sm text-gray-600">状态<select value={filterDraft.status} onChange={(event) => setFilterDraft((current) => ({ ...current, status: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-gray-800"><option value="">全部状态</option>{STATUS_OPTIONS.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></label><label className="text-sm text-gray-600">发布时间（开始）<input type="date" value={filterDraft.publishFrom} onChange={(event) => setFilterDraft((current) => ({ ...current, publishFrom: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-gray-800" /></label><label className="text-sm text-gray-600">发布时间（结束）<input type="date" value={filterDraft.publishTo} onChange={(event) => setFilterDraft((current) => ({ ...current, publishTo: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-gray-800" /></label><label className="text-sm text-gray-600">修改时间（开始）<input type="date" value={filterDraft.updatedFrom} onChange={(event) => setFilterDraft((current) => ({ ...current, updatedFrom: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-gray-800" /></label><label className="text-sm text-gray-600">修改时间（结束）<input type="date" value={filterDraft.updatedTo} onChange={(event) => setFilterDraft((current) => ({ ...current, updatedTo: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-gray-800" /></label></div><div className="mt-4 flex justify-end gap-3"><button type="button" onClick={resetFilters} className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"><RotateCcw className="h-4 w-4" />重置</button><button type="button" onClick={applyFilters} className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700">应用筛选</button></div></div>}
      {loading ? <div className="py-12 text-center text-gray-400">加载中...</div> : <><div className="w-full overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"><table className="w-full table-fixed"><thead className="border-b bg-gray-50"><tr><th className="w-[25%] px-3 py-4 text-left text-sm font-medium text-gray-500"><button type="button" onClick={() => toggleSort('title')} className="inline-flex items-center hover:text-blue-600">标题{renderSortIcon('title')}</button></th><th className="w-[11%] px-3 py-4 text-left text-sm font-medium text-gray-500"><button type="button" onClick={() => toggleSort('created_by_admin.name')} className="inline-flex items-center hover:text-blue-600">发布者{renderSortIcon('created_by_admin.name')}</button></th><th className="w-[8%] px-2 py-4 text-left text-sm font-medium text-gray-500"><button type="button" onClick={() => toggleSort('primary_category.name')} className="inline-flex items-center hover:text-blue-600">一级分类{renderSortIcon('primary_category.name')}</button></th><th className="w-[8%] px-2 py-4 text-left text-sm font-medium text-gray-500"><button type="button" onClick={() => toggleSort('secondary_category.name')} className="inline-flex items-center hover:text-blue-600">二级分类{renderSortIcon('secondary_category.name')}</button></th><th className="w-[10%] px-2 py-4 text-left text-sm font-medium text-gray-500"><button type="button" onClick={() => toggleSort('review_status')} className="inline-flex items-center hover:text-blue-600">状态{renderSortIcon('review_status')}</button></th><th className="w-[12%] px-2 py-4 text-left text-sm font-medium text-gray-500"><button type="button" onClick={() => toggleSort('publish_time')} className="inline-flex items-center hover:text-blue-600">发布时间{renderSortIcon('publish_time')}</button></th><th className="w-[12%] px-2 py-4 text-left text-sm font-medium text-gray-500"><button type="button" onClick={() => toggleSort('updatedAt')} className="inline-flex items-center hover:text-blue-600">最后修改{renderSortIcon('updatedAt')}</button></th><th className="w-[14%] px-2 py-4 text-center text-sm font-medium text-gray-500">操作</th></tr></thead><tbody className="divide-y">{articles.map((article) => <tr key={article.id} className="hover:bg-gray-50"><td className="break-words px-3 py-4"><div className="font-medium leading-5 text-gray-900">{article.title}</div><div className="break-all text-xs text-gray-400">slug: {article.slug}</div></td><td className="break-words px-3 py-4 text-sm"><span className="inline-flex max-w-full break-all items-center gap-1.5"><User className="h-3.5 w-3.5 shrink-0 text-gray-400" />{relationName(article.created_by_admin)}</span></td><td className="break-words px-2 py-4 text-sm">{article.primary_category?.name || '-'}</td><td className="break-words px-2 py-4 text-sm">{article.secondary_category?.name || '不分类'}</td><td className="px-2 py-4">{getStatusBadge(article.review_status)}</td><td className="break-words px-2 py-4 text-xs text-gray-500">{renderPublishTime(article)}</td><td className="break-words px-2 py-4 text-xs text-gray-500">{renderUpdatedTime(article)}</td><td className="px-2 py-4">{renderActions(article)}</td></tr>)}{articles.length === 0 && <tr><td colSpan={8} className="p-6 text-center text-gray-400">暂无符合条件的文章</td></tr>}</tbody></table></div><div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-600"><span>第 {page} / {totalPages} 页，每页 {pageSize} 篇，共 {total} 篇</span><div className="flex items-center gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-300">上一页</button><button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-300">下一页</button></div></div></>}

      {isModalOpen && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white rounded-3xl shadow-2xl w-full max-w-[min(96vw,1500px)] mx-4 p-8 max-h-[90vh] overflow-y-auto"><h2 className="text-2xl font-bold mb-6">{editingKey ? '编辑文章' : '新增文章'}</h2><form onSubmit={saveArticle} className="space-y-6"><div><label className="mb-2 block font-medium">发布者</label>{isSuperAdmin ? <select value={form.publisherId} onChange={(event) => { const selected = publishers.find((publisher) => String(publisher.documentId || publisher.id) === event.target.value); setForm((previous) => ({ ...previous, publisherId: event.target.value, publisherLabel: selected ? `${selected.name}（${selected.email}）` : '' })); }} className="w-full rounded border px-4 py-3"><option value="">请选择发布者</option>{publishers.map((publisher) => { const key = String(publisher.documentId || publisher.id); return <option key={key} value={key}>{publisher.name}（{publisher.email}）</option>; })}</select> : <input value={form.publisherLabel || user?.name || user?.email || ''} readOnly disabled className="w-full cursor-not-allowed rounded border bg-gray-50 px-4 py-3 text-gray-500" />}<p className="mt-1 text-xs text-gray-400">普通用户只能使用本人账号发布；超级管理员可以指定其他有效后台用户。</p></div><input className="w-full px-4 py-3 border rounded" placeholder="标题" value={form.title} onChange={(event) => setForm((previous) => ({ ...previous, title: event.target.value }))} required /><textarea className="w-full px-4 py-3 border rounded" placeholder="摘要" rows={2} value={form.summary} onChange={(event) => setForm((previous) => ({ ...previous, summary: event.target.value }))} /><div><label className="block mb-2 font-medium">正文内容</label><WordLikeEditor value={form.content} onChange={handleArticleContentChange} uploadImage={handleEditorUpload} /></div><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label className="block mb-2 font-medium">一级分类（必选）</label><select value={form.primaryCategoryId} onChange={(event) => setForm((previous) => ({ ...previous, primaryCategoryId: event.target.value, secondaryCategoryId: '' }))} className="w-full px-4 py-3 border rounded"><option value="">请选择一级分类</option>{primaryOptions.map((category) => <option key={category.id} value={String(category.id)}>{category.name}</option>)}</select></div><div><label className="block mb-2 font-medium">二级分类（可选）</label><select value={form.secondaryCategoryId} onChange={(event) => setForm((previous) => ({ ...previous, secondaryCategoryId: event.target.value }))} className="w-full px-4 py-3 border rounded" disabled={!form.primaryCategoryId}><option value="">不分类</option>{secondaryOptions.map((category) => <option key={category.id} value={String(category.id)}>{category.name}</option>)}</select></div></div><div><label className="block mb-2 font-medium">封面图</label>{form.coverPreview && <Image src={form.coverPreview} width={160} height={96} className="w-40 h-24 object-cover rounded mb-2" alt="cover" unoptimized />}<input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0] || null; if (file) manualCoverSelection.current = true; setCoverFile(file); }} /><p className="mt-1 text-xs text-gray-500">默认使用正文中的第一张图片；选择文件可手动更换封面图。</p></div><section className="rounded-xl border border-gray-200 p-4">
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div>
      <h3 className="font-medium text-gray-900">文章附件</h3>
      <p className="mt-1 text-xs text-gray-500">可选择多个 Word、Excel、PPT、PDF、压缩包、文本或常见图片文件。选中文件后会立即上传，保存文章后关联。</p>
    </div>
    <input type="file" multiple disabled={attachmentUploading}
      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z,.txt,.csv,.jpg,.jpeg,.png,.gif,.webp"
      className="block max-w-full text-sm file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-medium file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
      onChange={handleAttachmentSelection} />
  </div>
  {attachmentUploading && <p role="status" className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">正在上传 {attachmentFiles.length} 个附件，请稍候…</p>}
  {attachmentMessage && <p role="status" className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{attachmentMessage}</p>}
  {attachmentError && <div role="alert" className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"><span>{attachmentError}</span><button type="button" onClick={() => setAttachmentFiles([])} className="shrink-0 font-medium underline">清除失败文件</button></div>}
  {(form.attachments.length > 0 || attachmentFiles.length > 0) ? <ul className="mt-3 divide-y divide-gray-100">
    {form.attachments.map((file) => { const fileKey = String(file.documentId || file.id); return <li key={`existing-${fileKey}`} className="flex flex-wrap items-center gap-3 py-2 text-sm">
      <label className="min-w-0 flex-1"><span className="mb-1 block text-xs text-gray-500">官网显示名称</span><input value={form.attachmentNames[fileKey] ?? file.name ?? ''} onChange={(event) => setForm((current) => ({ ...current, attachmentNames: { ...current.attachmentNames, [fileKey]: event.target.value } }))} maxLength={255} placeholder="请输入官网显示名称" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100" /></label>
      <span className="max-w-52 break-all text-xs text-gray-500">源文件：{file.name || `附件 ${file.id}`} <span className={`ml-1 ${newAttachmentIds.includes(file.id) ? 'text-emerald-700' : 'text-gray-500'}`}>{newAttachmentIds.includes(file.id) ? '已上传，保存后关联' : '已关联'}</span></span>
      <button type="button" onClick={() => { setForm((current) => ({ ...current, attachments: current.attachments.filter((item) => item.id !== file.id) })); setNewAttachmentIds((current) => current.filter((id) => id !== file.id)); }} className="shrink-0 text-red-600 hover:text-red-800">移除</button>
    </li>; })}
    {attachmentFiles.map((file, index) => <li key={`failed-${index}-${file.name}`} className={`py-2 text-sm ${attachmentUploading ? 'text-blue-700' : 'text-red-700'}`}>📎 {file.name}（{attachmentUploading ? '上传中…' : '上传未完成，请重新选择此文件重试'}）</li>)}
  </ul> : <p className="mt-3 text-sm text-gray-400">尚未添加附件</p>}
</section><div className="flex justify-end gap-4"><button type="button" disabled={attachmentUploading} onClick={() => setIsModalOpen(false)} className="px-6 py-3 border rounded disabled:opacity-50">取消</button><button type="submit" disabled={attachmentUploading} className="px-6 py-3 bg-blue-600 text-white rounded disabled:cursor-not-allowed disabled:opacity-50">{attachmentUploading ? '附件上传中…' : '保存'}</button></div></form></div></div>}

      {timeArticle && isSuperAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div role="dialog" aria-modal="true" aria-labelledby="article-time-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h2 id="article-time-title" className="text-xl font-bold">修改{timeField === 'publish' ? '发布时间' : '修改时间'}</h2>
            <p className="mt-2 break-words text-sm text-gray-600">{timeArticle.title}</p>
            <form onSubmit={saveTime} className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                {timeField === 'publish' ? '发布时间' : '修改时间'}（当前浏览器时区）
                <input type="datetime-local" step="1" required value={timeValue}
                  onChange={(event) => setTimeValue(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900" />
              </label>
              <p className="text-xs leading-5 text-gray-500">时区：{Intl.DateTimeFormat().resolvedOptions().timeZone}。{timeField === 'publish' ? '仅调整官网及后台展示的发布时间。' : '调整文章修改时间；后续编辑或审核会再次自动更新该时间。'}不会更改文章内容或审核状态。</p>
              <div className="flex justify-end gap-3">
                <button type="button" disabled={timeSaving} onClick={() => setTimeArticle(null)}
                  className="rounded-lg border px-4 py-2 text-gray-600 disabled:opacity-50">取消</button>
                <button type="submit" disabled={timeSaving}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50">
                  {timeSaving ? '保存中…' : `保存${timeField === 'publish' ? '发布时间' : '修改时间'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isSubmitModalOpen && submittingArticle && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6"><h3 className="text-xl font-bold mb-4">{submittingArticle.review_status === 'rejected_republish' ? '提交二级审核' : '选择一级审核人员'}</h3><p className="text-sm text-gray-600 mb-4">文章：{submittingArticle.title}</p>{submittingArticle.review_status === 'rejected_republish' ? <p className="rounded-lg bg-indigo-50 p-3 text-sm text-indigo-700">修改后的已发布文章将直接进入二级审核。</p> : <select value={selectedLevel1Reviewer} onChange={(event) => setSelectedLevel1Reviewer(event.target.value)} className="w-full px-4 py-3 border rounded-lg mb-6"><option value="">请选择</option>{level1Reviewers.map((reviewer) => { const reviewerKey = String(reviewer.documentId || reviewer.email || reviewer.id); return <option key={reviewerKey} value={reviewerKey}>{reviewer.name}（{reviewer.email}）</option>; })}</select>}<div className="flex justify-end gap-3"><button onClick={() => setIsSubmitModalOpen(false)} className="px-4 py-2 border rounded-lg">取消</button><button onClick={submitForReview} className="px-4 py-2 bg-blue-600 text-white rounded-lg">提交审核</button></div></div></div>}

      {isReviewModalOpen && reviewingArticle && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6"><h3 className="text-xl font-bold mb-4">{reviewingArticle.review_status === 'pending_level1' || reviewingArticle.review_status === 'pending_admin' ? '一级审核' : '二级审核'}{reviewAction === 'approve' ? '通过' : '退回'}</h3><p className="text-sm text-gray-600 mb-2">文章标题：</p><p className="font-medium mb-4">{reviewingArticle.title}</p>{reviewAction === 'approve' && (reviewingArticle.review_status === 'pending_level1' || reviewingArticle.review_status === 'pending_admin') && <div className="mb-4"><label className="mb-2 block text-sm font-medium text-gray-700">指定二级审核人员</label><select value={selectedLevel2Reviewer} onChange={(event) => setSelectedLevel2Reviewer(event.target.value)} className="w-full rounded-lg border px-4 py-3"><option value="">请选择二级审核人员</option>{level2Reviewers.map((reviewer) => { const key = String(reviewer.documentId || reviewer.email || reviewer.id); return <option key={key} value={key}>{reviewer.name}（{reviewer.email}）</option>; })}</select></div>}<label className="block text-sm font-medium text-gray-700 mb-2">审核意见 {reviewAction === 'reject' && <span className="text-red-500">*</span>}</label><textarea value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} className="w-full px-4 py-3 border rounded-lg" rows={4} placeholder={reviewAction === 'approve' ? '可选填审核意见' : '请填写退回原因'} /><div className="flex justify-end gap-3 mt-4"><button onClick={() => setIsReviewModalOpen(false)} className="px-4 py-2 border rounded-lg">取消</button><button onClick={handleReview} className={`px-4 py-2 rounded-lg text-white ${reviewAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>确认{reviewAction === 'approve' ? '通过并提交二级审核' : '退回'}</button></div></div></div>}
    </div>
  );
}
