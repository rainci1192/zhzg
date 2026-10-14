import { strapiFetch } from '@/lib/strapi-fetch';
/* cSpell:disable */
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

interface Supervisor {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  title: string;
  category: 'internal' | 'enterprise';
  college: string;
  major: string;
  personal_website?: string | null;
  bio?: string | null;
  photo?: {
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
    title: string;
    category: 'internal' | 'enterprise';
    college: string;
    major: string;
    personal_website?: string | null;
    bio?: string | null;
    photo?: {
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
  title: string;
  category: 'internal' | 'enterprise';
  college: string;
  major: string;
  personal_website: string;
  bio: string;
  is_active: boolean;
  sort_order: number;
}

export default function SupervisorsManagement() {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSupervisor, setEditingSupervisor] = useState<Supervisor | null>(null);
  const [formData, setFormData] = useState<FormDataType>({
    name: '',
    slug: '',
    title: '',
    category: 'internal',
    college: '',
    major: '',
    personal_website: '',
    bio: '',
    is_active: true,
    sort_order: 0,
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<'all' | 'internal' | 'enterprise'>('all');

  useEffect(() => {
    fetchSupervisors();
  }, []);

  const fetchSupervisors = async () => {
    try {
      const response = await strapiFetch(`${STRAPI_URL}/api/supervisors?populate=photo&sort[0]=category:asc&sort[1]=college:asc&sort[2]=sort_order:asc`);
      const data: StrapiResponse = await response.json();
      setSupervisors(data.data.map((item) => ({
        id: item.id,
        documentId: item.documentId,
        name: item.name,
        slug: item.slug,
        title: item.title,
        category: item.category,
        college: item.college,
        major: item.major,
        personal_website: item.personal_website,
        bio: item.bio,
        photo: item.photo,
        is_active: item.is_active,
        sort_order: item.sort_order,
      })));
    } catch (error) {
      console.error('获取导师列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadPhoto = async (file: File): Promise<number | null> => {
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('files', file);
      const response = await strapiFetch(`${STRAPI_URL}/api/upload`, {
        method: 'POST',
        body: uploadFormData,
      });
      if (response.ok) {
        const data: Array<{ id: number }> = await response.json();
        return data[0]?.id || null;
      }
      return null;
    } catch (error) {
      console.error('上传照片失败:', error);
      return null;
    }
  };

  const handleEditorUpload = async (file: File): Promise<string> => {
    const uploadFormData = new FormData();
    uploadFormData.append('files', file);
    const response = await strapiFetch(`${STRAPI_URL}/api/upload`, {
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
      let photoId = editingSupervisor?.photo?.id || null;
      if (photoFile) {
        photoId = await uploadPhoto(photoFile);
        if (!photoId) {
          alert('照片上传失败，请重试');
          return;
        }
      }

      const payload = {
        data: {
          ...formData,
          ...(photoId ? { photo: photoId } : {}),
        },
      };

      const url = editingSupervisor
        ? `${STRAPI_URL}/api/supervisors/${editingSupervisor.documentId}`
        : `${STRAPI_URL}/api/supervisors`;
      const method = editingSupervisor ? 'PUT' : 'POST';

      const response = await strapiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingSupervisor(null);
        setFormData({
          name: '',
          slug: '',
          title: '',
          category: 'internal',
          college: '',
          major: '',
          personal_website: '',
          bio: '',
          is_active: true,
          sort_order: 0,
        });
        setPhotoFile(null);
        setPhotoPreview(null);
        fetchSupervisors();
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

  const handleEdit = (supervisor: Supervisor) => {
    setEditingSupervisor(supervisor);
    setFormData({
      name: supervisor.name,
      slug: supervisor.slug,
      title: supervisor.title,
      category: supervisor.category,
      college: supervisor.college,
      major: supervisor.major,
      personal_website: supervisor.personal_website || '',
      bio: supervisor.bio || '',
      is_active: supervisor.is_active,
      sort_order: supervisor.sort_order,
    });
    setPhotoFile(null);
    setPhotoPreview(supervisor.photo ? `${STRAPI_URL}${supervisor.photo.url}` : null);
    setShowModal(true);
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('确定要删除这个导师吗？')) return;
    try {
      const response = await strapiFetch(`${STRAPI_URL}/api/supervisors/${documentId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchSupervisors();
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
    setEditingSupervisor(null);
    setFormData({
      name: '',
      slug: '',
      title: '',
      category: 'internal',
      college: '',
      major: '',
      personal_website: '',
      bio: '',
      is_active: true,
      sort_order: 0,
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setShowModal(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const filteredSupervisors = filterCategory === 'all'
    ? supervisors
    : supervisors.filter(s => s.category === filterCategory);

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
        <h1 className="text-3xl font-bold text-gray-800">培养导师管理</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          添加导师
        </button>
      </div>

      {/* 筛选按钮 */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${filterCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          全部 ({supervisors.length})
        </button>
        <button
          onClick={() => setFilterCategory('internal')}
          className={`px-4 py-2 rounded-lg transition-colors ${filterCategory === 'internal' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          校内导师 ({supervisors.filter(s => s.category === 'internal').length})
        </button>
        <button
          onClick={() => setFilterCategory('enterprise')}
          className={`px-4 py-2 rounded-lg transition-colors ${filterCategory === 'enterprise' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          企业导师 ({supervisors.filter(s => s.category === 'enterprise').length})
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">照片</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">职称</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">学院</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">专业</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSupervisors.map((supervisor) => (
              <tr key={supervisor.documentId}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {supervisor.photo ? (
                    <div className="relative w-12 h-12">
                      <Image src={`${STRAPI_URL}${supervisor.photo.url}`} alt={supervisor.name} fill className="object-cover rounded-full" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 text-xs">无照片</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{supervisor.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supervisor.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${supervisor.category === 'internal' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                    {supervisor.category === 'internal' ? '校内导师' : '企业导师'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supervisor.college}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supervisor.major}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${supervisor.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {supervisor.is_active ? '启用' : '禁用'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                  <button onClick={() => handleEdit(supervisor)} className="text-blue-600 hover:text-blue-900" title="编辑">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(supervisor.documentId)} className="text-red-600 hover:text-red-900" title="删除">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingSupervisor ? '编辑导师' : '添加导师'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">姓名 *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="请输入姓名"
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
                      placeholder="例如：zhang-san"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">职称 *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="例如：教授"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">导师类型 *</label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as 'internal' | 'enterprise' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="internal">校内导师</option>
                      <option value="enterprise">企业导师</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">学院 *</label>
                    <input
                      type="text"
                      required
                      value={formData.college}
                      onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="例如：计算机学院"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">专业 *</label>
                    <input
                      type="text"
                      required
                      value={formData.major}
                      onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="例如：软件工程"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">个人网站</label>
                  <input
                    type="url"
                    value={formData.personal_website}
                    onChange={(e) => setFormData({ ...formData, personal_website: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">照片</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {photoPreview && (
                    <div className="mt-2 relative w-24 h-24">
                      <Image src={photoPreview} alt="照片预览" fill className="object-cover border border-gray-200 rounded-full" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">简介</label>
                  <WordLikeEditor
                    value={formData.bio}
                    onChange={(html) => setFormData({ ...formData, bio: html })}
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
                  onClick={() => { setShowModal(false); setEditingSupervisor(null); }}
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
