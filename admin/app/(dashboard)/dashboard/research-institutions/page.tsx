'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const WordLikeEditor = dynamic(() => import('@/components/editor/WordLikeEditor'), { ssr: false });

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

interface UploadedFile {
  id: number;
  url: string;
}

interface ResearchInstitution {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  summary?: string | null;
  cover_image?: {
    id: number;
    url: string;
  } | null;
  is_active: boolean;
  sort_order: number;
}

interface StrapiResponse {
  data: Array<{
    id: number;
    documentId: string;
    name: string;
    slug: string;
    summary?: string | null;
    cover_image?: {
      id: number;
      url: string;
    } | null;
    is_active: boolean;
    sort_order: number;
  }>;
}

interface FormDataType {
  name: string;
  slug: string;
  summary: string;
  is_active: boolean;
  sort_order: number;
}

export default function ResearchInstitutionsManagement() {
  const [institutions, setInstitutions] = useState<ResearchInstitution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<ResearchInstitution | null>(null);
  const [formData, setFormData] = useState<FormDataType>({
    name: '',
    slug: '',
    summary: '',
    is_active: true,
    sort_order: 0,
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      const response = await fetch(`${STRAPI_URL}/api/research-institutions?populate=cover_image&sort=sort_order:asc`);
      const data: StrapiResponse = await response.json();
      setInstitutions(data.data.map((item) => ({
        id: item.id,
        documentId: item.documentId,
        name: item.name,
        slug: item.slug,
        summary: item.summary,
        cover_image: item.cover_image,
        is_active: item.is_active,
        sort_order: item.sort_order,
      })));
    } catch (error) {
      console.error('获取科研机构列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadCover = async (file: File): Promise<number | null> => {
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('files', file);
      const response = await fetch(`${STRAPI_URL}/api/upload`, {
        method: 'POST',
        body: uploadFormData,
      });
      if (response.ok) {
        const data: Array<{ id: number }> = await response.json();
        return data[0]?.id || null;
      }
      return null;
    } catch (error) {
      console.error('上传封面失败:', error);
      return null;
    }
  };

  const handleEditorUpload = async (file: File): Promise<string> => {
    const uploadFormData = new FormData();
    uploadFormData.append('files', file);
    const response = await fetch(`${STRAPI_URL}/api/upload`, {
      method: 'POST',
      body: uploadFormData,
    });
    if (!response.ok) throw new Error('图片上传失败');
    const data: UploadedFile[] = await response.json();
    const url = data[0]?.url || '';
    return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let coverId = editingInstitution?.cover_image?.id || null;
      if (coverFile) {
        coverId = await uploadCover(coverFile);
        if (!coverId) {
          alert('封面上传失败，请重试');
          return;
        }
      }

      const payload = {
        data: {
          ...formData,
          ...(coverId ? { cover_image: coverId } : {}),
        },
      };

      const url = editingInstitution
        ? `${STRAPI_URL}/api/research-institutions/${editingInstitution.documentId}`
        : `${STRAPI_URL}/api/research-institutions`;

      const method = editingInstitution ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingInstitution(null);
        setFormData({ name: '', slug: '', summary: '', is_active: true, sort_order: 0 });
        setCoverFile(null);
        setCoverPreview(null);
        fetchInstitutions();
      } else {
        const errorData: { error?: { message?: string } } = await response.json();
        console.error('保存失败:', errorData);
        alert('保存失败，请重试');
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    }
  };

  const handleEdit = (institution: ResearchInstitution) => {
    setEditingInstitution(institution);
    setFormData({
      name: institution.name,
      slug: institution.slug,
      summary: institution.summary || '',
      is_active: institution.is_active,
      sort_order: institution.sort_order,
    });
    setCoverFile(null);
    setCoverPreview(institution.cover_image ? `${STRAPI_URL}${institution.cover_image.url}` : null);
    setShowModal(true);
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('确定要删除这个科研机构吗？')) return;
    try {
      const response = await fetch(`${STRAPI_URL}/api/research-institutions/${documentId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchInstitutions();
      } else {
        const errorData: { error?: { message?: string } } = await response.json();
        console.error('删除失败:', errorData);
        alert('删除失败，请重试');
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请重试');
    }
  };

  const handleAdd = () => {
    setEditingInstitution(null);
    setFormData({ name: '', slug: '', summary: '', is_active: true, sort_order: 0 });
    setCoverFile(null);
    setCoverPreview(null);
    setShowModal(true);
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">加载中...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">科研机构管理</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          添加科研机构
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">封面</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">简介</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">排序</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {institutions.map((inst) => (
              <tr key={inst.documentId}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {inst.cover_image ? (
                    <div className="relative w-16 h-16">
                      <Image src={`${STRAPI_URL}${inst.cover_image.url}`} alt={inst.name} fill className="object-cover rounded" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">无封面</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{inst.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inst.slug}</td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {inst.summary ? inst.summary.replace(/<[^>]*>/g, '').slice(0, 50) + '…' : '无'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inst.sort_order}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${inst.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {inst.is_active ? '启用' : '禁用'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                  <button onClick={() => handleEdit(inst)} className="text-blue-600 hover:text-blue-900" title="编辑">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(inst.documentId)} className="text-red-600 hover:text-red-900" title="删除">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingInstitution ? '编辑科研机构' : '添加科研机构'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">名称 *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入科研机构名称"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例如：ai-lab"
                  />
                  <p className="text-xs text-gray-500 mt-1">用于 URL，只能包含小写字母、数字和连字符</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">封面图片</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {coverPreview && (
                    <div className="mt-2 relative w-full h-48">
                      <Image src={coverPreview} alt="封面预览" fill className="object-cover border border-gray-200 rounded" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">简介</label>
                  <WordLikeEditor
                    value={formData.summary}
                    onChange={(html) => setFormData({ ...formData, summary: html })}
                    uploadImage={handleEditorUpload}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="数字越小越靠前"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">启用显示</label>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingInstitution(null); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
