'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { api, uploadFile } from '@/lib/api';
import { Plus, Edit, Trash2, Eye, Send, CheckCircle, XCircle, Clock, MessageSquare, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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
  primary_category?: { id: number; name: string } | null;
  secondary_category?: { id: number; name: string } | null;
  cover?: CoverMedia | null;
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
  const value = relation && typeof relation === 'object' && 'data' in relation ? relation.data : relation;
  return value?.name || value?.email || '未记录';
}

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('zh-CN', { hour12: false });
}

interface UploadedFile {
  id: number;
  url: string;
}

const LEVEL1_ROLES = new Set(['article_level1_reviewer', 'level1_reviewer', 'reviewer_level1']);
const LEVEL2_ROLES = new Set(['article_level2_reviewer', 'level2_reviewer', 'reviewer_level2']);

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
  const normalized = relation && typeof relation === 'object' && 'data' in relation ? relation.data : relation;
  if (!normalized || !user) return false;
  return (
    (normalized.id != null && String(normalized.id) === String(user.id)) ||
    (normalized.documentId && normalized.documentId === user.documentId) ||
    (normalized.email && normalized.email.toLowerCase() === user.email?.toLowerCase())
  );
}

export default function ArticlesPage() {
  const { user } = useAuth();
  const userRole = user?.role || '';
  const isSuperAdmin = userRole === 'super_admin';
  const isLevel1 = isSuperAdmin || LEVEL1_ROLES.has(userRole);
  const isLevel2 = isSuperAdmin || LEVEL2_ROLES.has(userRole);
  const isPublisher = isSuperAdmin || (!isLevel1 && !isLevel2);

  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [level1Reviewers, setLevel1Reviewers] = useState<Reviewer[]>([]);
  const [level2Reviewers, setLevel2Reviewers] = useState<Reviewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewingArticle, setReviewingArticle] = useState<Article | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [selectedLevel2Reviewer, setSelectedLevel2Reviewer] = useState('');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
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
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const getKey = (article: Article) => article.documentId || String(article.id);

  const fetchArticles = async () => {
    try {
      const response = (await api.getArticles('?populate=*&sort=createdAt:desc')) as { data?: Article[] };
      setArticles(response.data || []);
    } catch (error) {
      console.error('fetchArticles error:', error);
      setArticles([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = (await api.getCategories('?populate=*&sort=sort_order:asc')) as { data?: Category[] };
      setCategories(response.data || []);
    } catch (error) {
      console.error('fetchCategories error:', error);
      setCategories([]);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchArticles(), fetchCategories()]);
      setLoading(false);
    })();
  }, []);

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

  const openModal = (article?: Article) => {
    if (article) {
      setEditingKey(getKey(article));
      setForm({
        title: article.title || '',
        summary: article.summary || '',
        content: article.content || '',
        primaryCategoryId: article.primary_category?.id ? String(article.primary_category.id) : '',
        secondaryCategoryId: article.secondary_category?.id ? String(article.secondary_category.id) : '',
        coverId: article.cover?.id ? String(article.cover.id) : '',
        coverPreview: article.cover?.url ? `${STRAPI_URL}${article.cover.url}` : '',
      });
    } else {
      setEditingKey(null);
      setForm({ title: '', summary: '', content: '', primaryCategoryId: '', secondaryCategoryId: '', coverId: '', coverPreview: '' });
    }
    setCoverFile(null);
    setIsModalOpen(true);
  };

  const handleEditorUpload = async (file: File): Promise<string> => {
    const uploaded = (await uploadFile(file)) as UploadedFile[];
    const url = uploaded?.[0]?.url || '';
    return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
  };

  const saveArticle = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title.trim()) return alert('标题不能为空');
    if (!form.primaryCategoryId) return alert('请选择一级分类');

    try {
      const generateSlug = (title: string) => {
        const slug = title.trim().toLowerCase().replace(/[\s\u3000]+/g, '-').replace(/[^a-z0-9_-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
        return slug || `article-${Date.now()}`;
      };

      let coverId = form.coverId;
      if (coverFile) {
        const uploaded = (await uploadFile(coverFile)) as UploadedFile[];
        if (uploaded?.[0]?.id) coverId = String(uploaded[0].id);
      }

      const payload: Record<string, unknown> = {
        title: form.title,
        slug: generateSlug(form.title),
        summary: form.summary,
        content: form.content,
        primary_category: Number(form.primaryCategoryId),
        secondary_category: form.secondaryCategoryId ? Number(form.secondaryCategoryId) : null,
        cover: coverId ? Number(coverId) : null,
      };

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
    if (!confirm('二级审核已通过，确定现在发布吗？')) return;
    try {
      await api.publishArticle(getKey(article));
      await fetchArticles();
      alert('发布成功。');
    } catch (error) {
      alert(`发布失败：${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

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
    const editable = ['draft', 'rejected_level1', 'rejected_level2', 'rejected_republish', 'rejected_admin', 'rejected_leader', 'unpublished', 'published'].includes(article.review_status);
    const canReviewLevel1 = isLevel1 && (article.review_status === 'pending_level1' || article.review_status === 'pending_admin') && (isSuperAdmin || article.review_status === 'pending_admin' || relationMatches(article.level1_reviewer, user));
    const canReviewLevel2 = isLevel2 && (article.review_status === 'pending_level2' || article.review_status === 'pending_leader' || article.review_status === 'pending_republish') && (isSuperAdmin || !article.level2_reviewer || relationMatches(article.level2_reviewer, user));
    const canPublish = isPublisher && article.review_status === 'approved_pending_publish' && (isSuperAdmin || relationMatches(article.created_by_admin, user));

    return (
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <a href={`${FRONTEND_URL}/article/${article.slug}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800" title="预览"><Eye className="w-4 h-4" /></a>
        {isPublisher && editable && <button onClick={() => openModal(article)} className="text-blue-600 hover:text-blue-800" title="编辑"><Edit className="w-4 h-4" /></button>}
        {isPublisher && editable && article.review_status !== 'published' && <button onClick={() => openSubmitModal(article)} className="text-amber-600 hover:text-amber-800" title={article.review_status === 'rejected_republish' ? '提交二级审核' : '提交一级审核'}><Send className="w-4 h-4" /></button>}
        {canReviewLevel1 && <><button onClick={() => openReviewModal(article, 'approve')} className="text-green-600 hover:text-green-800" title="一级审核通过"><CheckCircle className="w-4 h-4" /></button><button onClick={() => openReviewModal(article, 'reject')} className="text-red-600 hover:text-red-800" title="一级审核退回"><XCircle className="w-4 h-4" /></button></>}
        {canReviewLevel2 && <><button onClick={() => openReviewModal(article, 'approve')} className="text-green-600 hover:text-green-800" title="二级审核通过"><CheckCircle className="w-4 h-4" /></button><button onClick={() => openReviewModal(article, 'reject')} className="text-red-600 hover:text-red-800" title="二级审核退回"><XCircle className="w-4 h-4" /></button></>}
        {canPublish && <button onClick={() => publish(article)} className="text-purple-600 hover:text-purple-800" title="发布"><CheckCircle className="w-4 h-4" /></button>}
        {isPublisher && article.review_status === 'published' && <button onClick={async () => { if (!confirm('确定取消发布这篇文章吗？')) return; try { await api.unpublishArticle(getKey(article)); await fetchArticles(); } catch (error) { alert(`取消发布失败：${error instanceof Error ? error.message : '未知错误'}`); } }} className="text-orange-600 hover:text-orange-800" title="取消发布"><XCircle className="w-4 h-4" /></button>}
        {(article.rejection_reason || article.level1_review_comment || article.level2_review_comment || article.admin_review_comment || article.leader_review_comment) && <button onClick={() => alert(`审核意见：\n${article.rejection_reason || ''}\n${article.level1_review_comment || ''}\n${article.level2_review_comment || ''}`)} className="text-gray-600 hover:text-gray-800" title="查看意见"><MessageSquare className="w-4 h-4" /></button>}
        {isPublisher && editable && <button onClick={() => handleDelete(article)} className="text-red-500 hover:text-red-700" title="删除"><Trash2 className="w-4 h-4" /></button>}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-3xl font-bold text-gray-900">文章管理</h1><p className="text-gray-500 mt-1">共 {articles.length} 条文章</p></div><button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-medium"><Plus className="w-5 h-5" />新增文章</button></div>
      {loading ? <div className="text-center py-12 text-gray-400">加载中...</div> : <div className="w-full overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"><table className="w-full table-fixed"><thead className="bg-gray-50 border-b"><tr><th className="w-[25%] px-3 py-4 text-left text-sm font-medium text-gray-500">标题</th><th className="w-[11%] px-3 py-4 text-left text-sm font-medium text-gray-500">发布者</th><th className="w-[8%] px-2 py-4 text-left text-sm font-medium text-gray-500">一级分类</th><th className="w-[8%] px-2 py-4 text-left text-sm font-medium text-gray-500">二级分类</th><th className="w-[10%] px-2 py-4 text-left text-sm font-medium text-gray-500">状态</th><th className="w-[12%] px-2 py-4 text-left text-sm font-medium text-gray-500">发布时间</th><th className="w-[12%] px-2 py-4 text-left text-sm font-medium text-gray-500">最后修改</th><th className="w-[14%] px-2 py-4 text-center text-sm font-medium text-gray-500">操作</th></tr></thead><tbody className="divide-y">{articles.map((article) => <tr key={article.id} className="hover:bg-gray-50"><td className="break-words px-3 py-4"><div className="font-medium leading-5 text-gray-900">{article.title}</div><div className="break-all text-xs text-gray-400">slug: {article.slug}</div></td><td className="break-words px-3 py-4 text-sm"><span className="inline-flex max-w-full break-all items-center gap-1.5"><User className="h-3.5 w-3.5 shrink-0 text-gray-400" />{relationName(article.created_by_admin)}</span></td><td className="break-words px-2 py-4 text-sm">{article.primary_category?.name || '-'}</td><td className="break-words px-2 py-4 text-sm">{article.secondary_category?.name || '不分类'}</td><td className="px-2 py-4">{getStatusBadge(article.review_status)}</td><td className="break-words px-2 py-4 text-xs text-gray-500">{formatDate(article.publish_time || article.publishedAt)}</td><td className="break-words px-2 py-4 text-xs text-gray-500">{formatDate(article.updatedAt)}</td><td className="px-2 py-4">{renderActions(article)}</td></tr>)}{articles.length === 0 && <tr><td colSpan={8} className="p-6 text-center text-gray-400">暂无文章</td></tr>}</tbody></table></div>}

      {isModalOpen && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl mx-4 p-8 max-h-[90vh] overflow-y-auto"><h2 className="text-2xl font-bold mb-6">{editingKey ? '编辑文章' : '新增文章'}</h2><form onSubmit={saveArticle} className="space-y-6"><input className="w-full px-4 py-3 border rounded" placeholder="标题" value={form.title} onChange={(event) => setForm((previous) => ({ ...previous, title: event.target.value }))} required /><textarea className="w-full px-4 py-3 border rounded" placeholder="摘要" rows={2} value={form.summary} onChange={(event) => setForm((previous) => ({ ...previous, summary: event.target.value }))} /><div><label className="block mb-2 font-medium">正文内容</label><WordLikeEditor value={form.content} onChange={(html) => setForm((previous) => ({ ...previous, content: html }))} uploadImage={handleEditorUpload} /></div><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label className="block mb-2 font-medium">一级分类（必选）</label><select value={form.primaryCategoryId} onChange={(event) => setForm((previous) => ({ ...previous, primaryCategoryId: event.target.value, secondaryCategoryId: '' }))} className="w-full px-4 py-3 border rounded"><option value="">请选择一级分类</option>{primaryOptions.map((category) => <option key={category.id} value={String(category.id)}>{category.name}</option>)}</select></div><div><label className="block mb-2 font-medium">二级分类（可选）</label><select value={form.secondaryCategoryId} onChange={(event) => setForm((previous) => ({ ...previous, secondaryCategoryId: event.target.value }))} className="w-full px-4 py-3 border rounded" disabled={!form.primaryCategoryId}><option value="">不分类</option>{secondaryOptions.map((category) => <option key={category.id} value={String(category.id)}>{category.name}</option>)}</select></div></div><div><label className="block mb-2 font-medium">封面图</label>{form.coverPreview && <Image src={form.coverPreview} width={160} height={96} className="w-40 h-24 object-cover rounded mb-2" alt="cover" unoptimized />}<input type="file" accept="image/*" onChange={(event) => setCoverFile(event.target.files?.[0] || null)} /></div><div className="flex justify-end gap-4"><button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 border rounded">取消</button><button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded">保存</button></div></form></div></div>}

      {isSubmitModalOpen && submittingArticle && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6"><h3 className="text-xl font-bold mb-4">{submittingArticle.review_status === 'rejected_republish' ? '提交二级审核' : '选择一级审核人员'}</h3><p className="text-sm text-gray-600 mb-4">文章：{submittingArticle.title}</p>{submittingArticle.review_status === 'rejected_republish' ? <p className="rounded-lg bg-indigo-50 p-3 text-sm text-indigo-700">修改后的已发布文章将直接进入二级审核。</p> : <select value={selectedLevel1Reviewer} onChange={(event) => setSelectedLevel1Reviewer(event.target.value)} className="w-full px-4 py-3 border rounded-lg mb-6"><option value="">请选择</option>{level1Reviewers.map((reviewer) => { const reviewerKey = String(reviewer.documentId || reviewer.email || reviewer.id); return <option key={reviewerKey} value={reviewerKey}>{reviewer.name}（{reviewer.email}）</option>; })}</select>}<div className="flex justify-end gap-3"><button onClick={() => setIsSubmitModalOpen(false)} className="px-4 py-2 border rounded-lg">取消</button><button onClick={submitForReview} className="px-4 py-2 bg-blue-600 text-white rounded-lg">提交审核</button></div></div></div>}

      {isReviewModalOpen && reviewingArticle && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6"><h3 className="text-xl font-bold mb-4">{reviewingArticle.review_status === 'pending_level1' || reviewingArticle.review_status === 'pending_admin' ? '一级审核' : '二级审核'}{reviewAction === 'approve' ? '通过' : '退回'}</h3><p className="text-sm text-gray-600 mb-2">文章标题：</p><p className="font-medium mb-4">{reviewingArticle.title}</p>{reviewAction === 'approve' && (reviewingArticle.review_status === 'pending_level1' || reviewingArticle.review_status === 'pending_admin') && <div className="mb-4"><label className="mb-2 block text-sm font-medium text-gray-700">指定二级审核人员</label><select value={selectedLevel2Reviewer} onChange={(event) => setSelectedLevel2Reviewer(event.target.value)} className="w-full rounded-lg border px-4 py-3"><option value="">请选择二级审核人员</option>{level2Reviewers.map((reviewer) => { const key = String(reviewer.documentId || reviewer.email || reviewer.id); return <option key={key} value={key}>{reviewer.name}（{reviewer.email}）</option>; })}</select></div>}<label className="block text-sm font-medium text-gray-700 mb-2">审核意见 {reviewAction === 'reject' && <span className="text-red-500">*</span>}</label><textarea value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} className="w-full px-4 py-3 border rounded-lg" rows={4} placeholder={reviewAction === 'approve' ? '可选填审核意见' : '请填写退回原因'} /><div className="flex justify-end gap-3 mt-4"><button onClick={() => setIsReviewModalOpen(false)} className="px-4 py-2 border rounded-lg">取消</button><button onClick={handleReview} className={`px-4 py-2 rounded-lg text-white ${reviewAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>确认{reviewAction === 'approve' ? '通过并提交二级审核' : '退回'}</button></div></div></div>}
    </div>
  );
}
