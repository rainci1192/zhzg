'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { uploadFile } from '@/lib/api';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';

const WordLikeEditor = dynamic(() => import('@/components/editor/WordLikeEditor'), { ssr: false });

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const FRONTEND_URL = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000';

interface CoverMedia {
  id: number;
  url: string;
}

interface Page {
  id: number;
  documentId?: string;
  slug: string;
  title: string;
  subtitle?: string;
  content?: string;
  publish_status: 'draft' | 'published';
  cover?: CoverMedia | null;
}

interface PagesResp {
  data?: Page[];
}

interface UploadedFile {
  id: number;
  url: string;
}

export default function PagesManagement() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const [form, setForm] = useState({
    slug: '',
    title: '',
    subtitle: '',
    content: '',
    publish_status: 'draft' as 'draft' | 'published',
    coverId: '',
    coverPreview: '',
  });

  const [coverFile, setCoverFile] = useState<File | null>(null);

  const getKey = (p: Page) => p.documentId || String(p.id);

  const fetchPages = async () => {
    try {
      const res = await fetch(`${STRAPI_URL}/api/pages?populate=*&sort=createdAt:desc`, {
        headers: { Accept: 'application/json' },
      });
      const json = (await res.json()) as PagesResp;
      setPages(json.data || []);
    } catch (error) {
      console.error('fetchPages error:', error);
      setPages([]);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchPages();
      setLoading(false);
    })();
  }, []);

  const openModal = (page?: Page) => {
    if (page) {
      setEditingKey(getKey(page));
      setForm({
        slug: page.slug || '',
        title: page.title || '',
        subtitle: page.subtitle || '',
        content: page.content || '',
        publish_status: page.publish_status || 'draft',
        coverId: page.cover?.id ? String(page.cover.id) : '',
        coverPreview: page.cover?.url ? `${STRAPI_URL}${page.cover.url}` : '',
      });
    } else {
      setEditingKey(null);
      setForm({
        slug: '',
        title: '',
        subtitle: '',
        content: '',
        publish_status: 'draft',
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

  const savePage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.slug.trim() || !form.title.trim()) {
      alert('Slug 和标题不能为空');
      return;
    }

    try {
      let coverId = form.coverId;
      if (coverFile) {
        const uploaded = (await uploadFile(coverFile)) as UploadedFile[];
        if (uploaded?.[0]?.id) coverId = String(uploaded[0].id);
      }

      const payload: Record<string, unknown> = {
        slug: form.slug,
        title: form.title,
        subtitle: form.subtitle,
        content: form.content,
        publish_status: form.publish_status,
        cover: coverId ? Number(coverId) : null,
      };

      if (editingKey) {
        await fetch(`${STRAPI_URL}/api/pages/${editingKey}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: payload }),
        });
      } else {
        await fetch(`${STRAPI_URL}/api/pages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: payload }),
        });
      }

      closeModal();
      await fetchPages();
      alert('保存成功！');
    } catch (error) {
      console.error('Save error:', error);
      alert('保存失败：' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const handleDelete = async (page: Page) => {
    if (!confirm('确定删除这个页面吗？')) return;
    try {
      await fetch(`${STRAPI_URL}/api/pages/${getKey(page)}`, {
        method: 'DELETE',
      });
      await fetchPages();
    } catch {
      alert('删除失败');
    }
  };

  const getStatusBadge = (publish_status: Page['publish_status']) => {
    const map: Record<Page['publish_status'], { label: string; color: string }> = {
      draft: { label: '草稿', color: 'bg-gray-100 text-gray-600' },
      published: { label: '已发布', color: 'bg-emerald-100 text-emerald-600' },
    };
    const info = map[publish_status];
    return <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${info.color}`}>{info.label}</span>;
  };

  const getPageUrl = (slug: string) => {
    const urlMap: Record<string, string> = {
      'about-intro': '/about/intro',
      'about-leadership': '/about/leadership',
      'about-organization': '/about/organization',
    };
    return urlMap[slug] || `/page/${slug}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">页面管理</h1>
          <p className="text-gray-500 mt-1">共 {pages.length} 个页面</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-medium">
          <Plus className="w-5 h-5" />
          新增页面
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">加载中...</div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Slug</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">标题</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">状态</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">{page.slug}</code>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{page.title}</td>
                  <td className="px-6 py-4">{getStatusBadge(page.publish_status)}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <a href={`${FRONTEND_URL}${getPageUrl(page.slug)}`} target="_blank" rel="noreferrer" className="text-indigo-600">
                        <Eye className="w-5 h-5" />
                      </a>
                      <button onClick={() => openModal(page)} className="text-blue-600">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(page)} className="text-red-500">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr><td colSpan={4} className="p-6 text-center text-gray-400">暂无页面</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl mx-4 p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">{editingKey ? '编辑页面' : '新增页面'}</h2>

            <form onSubmit={savePage} className="space-y-6">
              <div>
                <label className="block mb-2 font-medium">Slug（URL 标识）</label>
                <input
                  className="w-full px-4 py-3 border rounded"
                  placeholder="例如：about-intro"
                  value={form.slug}
                  onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                  required
                  disabled={!!editingKey}
                />
                <p className="text-sm text-gray-500 mt-1">只能包含小写字母、数字、连字符</p>
              </div>

              <input
                className="w-full px-4 py-3 border rounded"
                placeholder="标题"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                required
              />

              <input
                className="w-full px-4 py-3 border rounded"
                placeholder="副标题（可选）"
                value={form.subtitle}
                onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
              />

              <div>
                <label className="block mb-2 font-medium">正文内容</label>
                <WordLikeEditor
                  value={form.content}
                  onChange={(html) => setForm((p) => ({ ...p, content: html }))}
                  uploadImage={handleEditorUpload}
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">状态</label>
                <select
                  value={form.publish_status}
                  onChange={(e) => setForm((p) => ({ ...p, publish_status: e.target.value as 'draft' | 'published' }))}
                  className="w-full px-4 py-3 border rounded"
                >
                  <option value="draft">草稿</option>
                  <option value="published">已发布</option>
                </select>
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
                    unoptimized={true}
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
