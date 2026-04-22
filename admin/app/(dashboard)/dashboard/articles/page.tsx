'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image'; // ✅ 新增：导入 Next.js Image 组件
import { api, uploadFile } from '@/lib/api';
import { Plus, Edit, Trash2, Eye, Send, CheckCircle } from 'lucide-react';

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
  review_status: 'draft' | 'pending' | 'approved' | 'published' | 'rejected';
  publish_time?: string;
  primary_category?: { id: number; name: string } | null;
  secondary_category?: { id: number; name: string } | null;
  cover?: CoverMedia | null;
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
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);

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

  // 一级：无 parentCategory 的分类（或 level=1）
  const primaryOptions = useMemo(
    () => categories.filter((c) => !c.parentCategory || c.level === 1),
    [categories]
  );

  // 二级：parentCategory.id = 选中的一级 id
  const secondaryOptions = useMemo(() => {
    const pid = Number(form.primaryCategoryId);
    if (!pid) return [];

    return categories.filter((c) => {
      const parentId =
        c.parentCategory?.id ??
        // 兼容历史字段
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
      // ==================== 优化后的 slug 生成（严格符合 Strapi 正则） ====================
      const generateSlug = (title: string): string => {
        let slug = title
          .trim()
          .toLowerCase()
          .replace(/[\s\u3000]+/g, '-')                    // 空格 → -
          .replace(/[^a-z0-9_-]/g, '')                     // 严格移除所有不符合正则的字符（包括中文）
          .replace(/-+/g, '-')                             // 连续 - 合并
          .replace(/^-|-$/g, '');                          // 去掉首尾 -

        // 如果全是中文导致 slug 为空，自动生成一个合法后备 slug
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
        slug: generateSlug(form.title),           // ← 关键修复：强制生成合法 slug
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
      alert('保存成功！');
    } catch (error) {
      console.error('Save error:', error);
      alert('保存失败：' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const submitForReview = async (article: Article) => {
    try {
      await api.updateArticle(getKey(article), { review_status: 'pending' });
      await fetchArticles();
    } catch {
      alert('提交审核失败');
    }
  };

  const publish = async (article: Article) => {
    try {
      await api.updateArticle(getKey(article), {
        review_status: 'published',
        publish_time: new Date().toISOString(),
      });
      await fetchArticles();
    } catch {
      alert('发布失败');
    }
  };

  const handleDelete = async (article: Article) => {
    if (!confirm('确定删除这篇文章吗？')) return;
    try {
      await api.deleteArticle(getKey(article));
      await fetchArticles();
    } catch {
      alert('删除失败');
    }
  };

  const getStatusBadge = (status: Article['review_status']) => {
    const map: Record<Article['review_status'], { label: string; color: string }> = {
      draft: { label: '草稿', color: 'bg-gray-100 text-gray-600' },
      pending: { label: '待审核', color: 'bg-amber-100 text-amber-600' },
      approved: { label: '已通过', color: 'bg-blue-100 text-blue-600' },
      published: { label: '已发布', color: 'bg-emerald-100 text-emerald-600' },
      rejected: { label: '已驳回', color: 'bg-red-100 text-red-600' },
    };
    const info = map[status];
    return <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${info.color}`}>{info.label}</span>;
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
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <a href={`${FRONTEND_URL}/article/${article.slug}`} target="_blank" rel="noreferrer" className="text-indigo-600"><Eye className="w-5 h-5" /></a>
                      <button onClick={() => openModal(article)} className="text-blue-600"><Edit className="w-5 h-5" /></button>
                      {(article.review_status === 'draft' || article.review_status === 'rejected') && (
                        <button onClick={() => submitForReview(article)} className="text-amber-600"><Send className="w-5 h-5" /></button>
                      )}
                      {article.review_status === 'approved' && (
                        <button onClick={() => publish(article)} className="text-green-600"><CheckCircle className="w-5 h-5" /></button>
                      )}
                      <button onClick={() => handleDelete(article)} className="text-red-500"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {articles.length === 0 && (
                <tr><td colSpan={5} className="p-6 text-center text-gray-400">暂无文章</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

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
                {/* ✅ 核心修改：将 <img> 替换为 Next.js <Image /> 组件 */}
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
    </div>
  );
}
