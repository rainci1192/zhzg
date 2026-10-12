'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { api, uploadFile } from '@/lib/api';
import { Plus, Edit, Trash2, Eye, Send, CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const WordLikeEditor = dynamic(() => import('@/components/editor/WordLikeEditor'), { ssr: false });

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const FRONTEND_URL = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000';

interface Category {
  id: number;
  documentId?: string;
  name: string;
  slug?: string;
  level?: number;
  parentCategory?: { id: number; name: string } | null;
}

interface CoverMedia {
  id: number;
  url: string;
}

interface Article {
  id: number;
  documentId?: string;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  review_status: 'draft' | 'pending_admin' | 'rejected_admin' | 'pending_leader' | 'rejected_leader' | 'approved' | 'published';
  publish_time?: string;
  primary_category?: { id: number; name: string } | null;
  secondary_category?: { id: number; name: string } | null;
  cover?: CoverMedia | null;
  rejection_reason?: string;
  admin_review_comment?: string;
  leader_review_comment?: string;
}

interface ArticlesResp {
  data?: Article[];
}

interface CategoriesResp {
  data?: Category[];
}

interface UploadedFile {
  id: number;
  url: string;
}

export default function ArticlesPage() {
  const { user } = useAuth();
  const userRole = (user?.role && typeof user.role === 'object' && 'name' in user.role 
    ? (user.role as { name: string }).name 
    : '') as string;

  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewingArticle, setReviewingArticle] = useState<Article | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');

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

  const getKey = (a: Article) => a.documentId || String(a.id);

  const fetchArticles = async () => {
    try {
      const res = (await api.getArticles('?populate=*&sort=createdAt:desc')) as ArticlesResp;
      setArticles(res.data || []);
    } catch (error) {
      console.error('fetchArticles error:', error);
      setArticles([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = (await api.getCategories('?populate=*&sort=sort_order:asc')) as CategoriesResp;
      setCategories(res.data || []);
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
    () => categories.filter((c) => !c.parentCategory || c.level === 1),
    [categories]
  );

  const secondaryOptions = useMemo(() => {
    const pid = Number(form.primaryCategoryId);
    if (!pid) return [];

    return categories.filter((c) => {
      const parentId =
        c.parentCategory?.id ??
        (c as unknown as { parent?: { id?: number } }).parent?.id ??
        null;

      return parentId === pid;
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
      setForm({
        title: '',
        summary: '',
        content: '',
        primaryCategoryId: '',
        secondaryCategoryId: '',
        coverId: '',
        coverPreview: '',
      });
    }
    setCoverFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleEditorUpload = async (file: File): Promise<string> => {
    const uploaded = (await uploadFile(file)) as UploadedFile[];
    const url = uploaded?.[0]?.url || '';
    return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
  };

  const saveArticle = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      alert('标题不能为空');
      return;
    }

    if (!form.primaryCategoryId) {
      alert('请选择一级分类');
      return;
    }

    try {
      const generateSlug = (title: string): string => {
        let slug = title
          .trim()
          .toLowerCase()
          .replace(/[\s\u3000]+/g, '-')
          .replace(/[^a-z0-9_-]/g, '')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');

        if (!slug) {
          slug = `article-${Date.now()}`;
        }
        return slug;
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
        review_status: 'draft',
        primary_category: Number(form.primaryCategoryId),
        secondary_category: form.secondaryCategoryId ? Number(form.secondaryCategoryId) : null,
        cover: coverId ? Number(coverId) : null,
      };

      if (editingKey) {
        await api.updateArticle(editingKey, payload);
      } else {
        await api.createArticle(payload);
      }

      closeModal();
      await fetchArticles();
      alert('保存成功!');
    } catch (error) {
      console.error('Save error:', error);
      alert('保存失败:' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  // 编辑提交审核
  const submitForReview = async (article: Article) => {
    if (!confirm('确定提交审核吗?')) return;
    try {
      await api.updateArticle(getKey(article), { 
        review_status: 'pending_admin',
        rejection_reason: null,
        admin_review_comment: null,
        leader_review_comment: null,
      });
      await fetchArticles();
      alert('已提交管理员审核');
    } catch {
      alert('提交审核失败');
    }
  };

  // 打开审核弹窗
  const openReviewModal = (article: Article, action: 'approve' | 'reject') => {
    setReviewingArticle(article);
    setReviewAction(action);
    setReviewComment('');
    setIsReviewModalOpen(true);
  };

  // 管理员审核
  const handleAdminReview = async () => {
    if (!reviewingArticle) return;

    try {
      const payload: Record<string, unknown> = {
        admin_review_comment: reviewComment,
        admin_review_date: new Date().toISOString(),
      };

      if (reviewAction === 'approve') {
        payload.review_status = 'pending_leader';
      } else {
        payload.review_status = 'rejected_admin';
        payload.rejection_reason = reviewComment;
      }

      await api.updateArticle(getKey(reviewingArticle), payload);
      setIsReviewModalOpen(false);
      await fetchArticles();
      alert(reviewAction === 'approve' ? '已提交院领导审核' : '已退回编辑');
    } catch {
      alert('操作失败');
    }
  };

  // 院领导审核
  const handleLeaderReview = async () => {
    if (!reviewingArticle) return;

    try {
      const payload: Record<string, unknown> = {
        leader_review_comment: reviewComment,
        leader_review_date: new Date().toISOString(),
      };

      if (reviewAction === 'approve') {
        payload.review_status = 'approved';
      } else {
        payload.review_status = 'rejected_leader';
        payload.rejection_reason = reviewComment;
      }

      await api.updateArticle(getKey(reviewingArticle), payload);
      setIsReviewModalOpen(false);
      await fetchArticles();
      alert(reviewAction === 'approve' ? '审核通过,待发布' : '已退回管理员');
    } catch {
      alert('操作失败');
    }
  };

  // 管理员退回给编辑
  const returnToEditor = async (article: Article) => {
    const reason = prompt('请输入退回原因:');
    if (!reason) return;

    try {
      await api.updateArticle(getKey(article), {
        review_status: 'rejected_admin',
        rejection_reason: reason,
      });
      await fetchArticles();
      alert('已退回编辑');
    } catch {
      alert('操作失败');
    }
  };

  // 管理员发布
  const publish = async (article: Article) => {
    if (!confirm('确定发布吗?')) return;
    try {
      await api.updateArticle(getKey(article), {
        review_status: 'published',
        publish_time: new Date().toISOString(),
      });
      await fetchArticles();
      alert('发布成功');
    } catch {
      alert('发布失败');
    }
  };

  const handleDelete = async (article: Article) => {
    if (!confirm('确定删除这篇文章吗?')) return;
    try {
      await api.deleteArticle(getKey(article));
      await fetchArticles();
    } catch {
      alert('删除失败');
    }
  };

  const getStatusBadge = (status: Article['review_status']) => {
    const map: Record<Article['review_status'], { label: string; color: string; icon: React.ReactNode }> = {
      draft: { label: '草稿', color: 'bg-gray-100 text-gray-600', icon: <Edit className="w-3 h-3" /> },
      pending_admin: { label: '待管理员审核', color: 'bg-amber-100 text-amber-600', icon: <Clock className="w-3 h-3" /> },
      rejected_admin: { label: '管理员退回', color: 'bg-red-100 text-red-600', icon: <XCircle className="w-3 h-3" /> },
      pending_leader: { label: '待院领导审核', color: 'bg-blue-100 text-blue-600', icon: <Clock className="w-3 h-3" /> },
      rejected_leader: { label: '院领导退回', color: 'bg-orange-100 text-orange-600', icon: <XCircle className="w-3 h-3" /> },
      approved: { label: '待发布', color: 'bg-purple-100 text-purple-600', icon: <CheckCircle className="w-3 h-3" /> },
      published: { label: '已发布', color: 'bg-emerald-100 text-emerald-600', icon: <CheckCircle className="w-3 h-3" /> },
    };
    const info = map[status];
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${info.color}`}>
        {info.icon}
        {info.label}
      </span>
    );
  };

  // 根据角色和状态显示操作按钮
  const renderActions = (article: Article) => {
    const isEditor = userRole === 'editor';
    const isAdmin = userRole === 'admin' || userRole === 'super_admin';
    const isLeader = userRole === 'leader';

    return (
      <div className="flex items-center justify-center gap-2">
        {/* 预览 */}
        <a href={`${FRONTEND_URL}/article/${article.slug}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800" title="预览">
          <Eye className="w-4 h-4" />
        </a>

        {/* 编辑 - 草稿和退回状态可编辑 */}
        {(article.review_status === 'draft' || article.review_status === 'rejected_admin') && (
          <button onClick={() => openModal(article)} className="text-blue-600 hover:text-blue-800" title="编辑">
            <Edit className="w-4 h-4" />
          </button>
        )}

        {/* 编辑提交审核 */}
        {isEditor && (article.review_status === 'draft' || article.review_status === 'rejected_admin') && (
          <button onClick={() => submitForReview(article)} className="text-amber-600 hover:text-amber-800" title="提交审核">
            <Send className="w-4 h-4" />
          </button>
        )}

        {/* 管理员审核 */}
        {isAdmin && article.review_status === 'pending_admin' && (
          <>
            <button onClick={() => openReviewModal(article, 'approve')} className="text-green-600 hover:text-green-800" title="通过">
              <CheckCircle className="w-4 h-4" />
            </button>
            <button onClick={() => openReviewModal(article, 'reject')} className="text-red-600 hover:text-red-800" title="退回">
              <XCircle className="w-4 h-4" />
            </button>
          </>
        )}

        {/* 管理员退回给编辑 */}
        {isAdmin && article.review_status === 'rejected_leader' && (
          <button onClick={() => returnToEditor(article)} className="text-orange-600 hover:text-orange-800" title="退回编辑">
            <XCircle className="w-4 h-4" />
          </button>
        )}

        {/* 院领导审核 */}
        {isLeader && article.review_status === 'pending_leader' && (
          <>
            <button onClick={() => openReviewModal(article, 'approve')} className="text-green-600 hover:text-green-800" title="通过">
              <CheckCircle className="w-4 h-4" />
            </button>
            <button onClick={() => openReviewModal(article, 'reject')} className="text-red-600 hover:text-red-800" title="退回">
              <XCircle className="w-4 h-4" />
            </button>
          </>
        )}

        {/* 管理员发布 */}
        {isAdmin && article.review_status === 'approved' && (
          <button onClick={() => publish(article)} className="text-purple-600 hover:text-purple-800" title="发布">
            <CheckCircle className="w-4 h-4" />
          </button>
        )}

        {/* 查看审核意见 */}
        {(article.rejection_reason || article.admin_review_comment || article.leader_review_comment) && (
          <button 
            onClick={() => alert(
              `审核意见:\n${article.rejection_reason || ''}\n${article.admin_review_comment || ''}\n${article.leader_review_comment || ''}`
            )} 
            className="text-gray-600 hover:text-gray-800" 
            title="查看意见"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        )}

        {/* 删除 - 草稿和退回状态可删除 */}
        {(article.review_status === 'draft' || article.review_status === 'rejected_admin') && (
          <button onClick={() => handleDelete(article)} className="text-red-500 hover:text-red-700" title="删除">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">文章管理</h1>
          <p className="text-gray-500 mt-1">共 {articles.length} 条文章</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-medium">
          <Plus className="w-5 h-5" />
          新增文章
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">加载中...</div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">标题</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">一级分类</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">二级分类</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">状态</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{article.title}</div>
                    <div className="text-xs text-gray-400">slug: {article.slug}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">{article.primary_category?.name || '-'}</td>
                  <td className="px-6 py-4 text-sm">{article.secondary_category?.name || '不分类'}</td>
                  <td className="px-6 py-4">{getStatusBadge(article.review_status)}</td>
                  <td className="px-6 py-4">{renderActions(article)}</td>
                </tr>
              ))}
              {articles.length === 0 && (
                <tr><td colSpan={5} className="p-6 text-center text-gray-400">暂无文章</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 编辑文章弹窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl mx-4 p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">{editingKey ? '编辑文章' : '新增文章'}</h2>

            <form onSubmit={saveArticle} className="space-y-6">
              <input
                className="w-full px-4 py-3 border rounded"
                placeholder="标题"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                required
              />

              <textarea
                className="w-full px-4 py-3 border rounded"
                placeholder="摘要"
                rows={2}
                value={form.summary}
                onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))}
              />

              <div>
                <label className="block mb-2 font-medium">正文内容</label>
                <WordLikeEditor
                  value={form.content}
                  onChange={(html) => setForm((p) => ({ ...p, content: html }))}
                  uploadImage={handleEditorUpload}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-medium">一级分类（必选）</label>
                  <select
                    value={form.primaryCategoryId}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        primaryCategoryId: e.target.value,
                        secondaryCategoryId: '',
                      }))
                    }
                    className="w-full px-4 py-3 border rounded"
                  >
                    <option value="">请选择一级分类</option>
                    {primaryOptions.map((c) => (
                      <option key={c.id} value={String(c.id)}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-medium">二级分类（可选）</label>
                  <select
                    value={form.secondaryCategoryId}
                    onChange={(e) => setForm((p) => ({ ...p, secondaryCategoryId: e.target.value }))}
                    className="w-full px-4 py-3 border rounded"
                    disabled={!form.primaryCategoryId}
                  >
                    <option value="">不分类</option>
                    {secondaryOptions.map((c) => (
                      <option key={c.id} value={String(c.id)}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium">封面图</label>
                {form.coverPreview && (
                  <Image 
                    src={form.coverPreview} 
                    width={160} 
                    height={96} 
                    className="w-40 h-24 object-cover rounded mb-2" 
                    alt="cover"
                    unoptimized
                  />
                )}
                <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
              </div>

              <div className="flex justify-end gap-4">
                <button type="button" onClick={closeModal} className="px-6 py-3 border rounded">取消</button>
                <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 审核弹窗 */}
      {isReviewModalOpen && reviewingArticle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h3 className="text-xl font-bold mb-4">
              {reviewAction === 'approve' ? '审核通过' : '审核退回'}
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">文章标题:</p>
              <p className="font-medium">{reviewingArticle.title}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                审核意见 {reviewAction === 'reject' && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
                rows={4}
                placeholder={reviewAction === 'approve' ? '可选填审核意见' : '请填写退回原因'}
                required={reviewAction === 'reject'}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={userRole === 'leader' ? handleLeaderReview : handleAdminReview}
                className={`px-4 py-2 rounded-lg text-white ${
                  reviewAction === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                确认{reviewAction === 'approve' ? '通过' : '退回'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
