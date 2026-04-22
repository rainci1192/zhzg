'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface Banner {
  id: string;
  documentId: string;
  title: string;
  link?: string;
  sort_order: number;
  is_active: boolean;
  image?: {
    url: string;
    name?: string;
  } | null;
}

interface BannerPayload {
  title: string;
  link: string;
  sort_order: number;
  is_active: boolean;
  image?: number;
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    link: '',
    sort_order: 0,
    is_active: true,
    image: null as File | null,
  });
  const [uploading, setUploading] = useState(false);

  // 提取全局 Strapi URL，方便在组件内复用
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

  const fetchBanners = async () => {
    try {
      setError(null);
      const response = await api.getBanners();

      let bannerList: Banner[] = [];
      if (response && typeof response === 'object' && 'data' in response) {
        if (Array.isArray(response.data)) {
          bannerList = response.data as Banner[];
        }
      } else if (Array.isArray(response)) {
        bannerList = response as Banner[];
      }

      setBanners(bannerList);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '获取 Banner 列表失败';
      console.error('❌ 获取 Banner 失败', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openModal = (banner: Banner | null = null) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title,
        link: banner.link || '',
        sort_order: banner.sort_order,
        is_active: banner.is_active,
        image: null, // 打开时默认没有选择新图片
      });
    } else {
      setEditingBanner(null);
      setFormData({ title: '', link: '', sort_order: 0, is_active: true, image: null });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageId: number | null = null;

      if (formData.image) {
        const uploadFormData = new FormData();
        uploadFormData.append('files', formData.image);
        
        const token = localStorage.getItem('strapi_jwt');
        
        if (!token) {
          throw new Error('未找到登录凭证，请重新登录');
        }
        
        console.log('📤 正在上传图片到:', `${strapiUrl}/api/upload`);
        
        const uploadRes = await fetch(`${strapiUrl}/api/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: uploadFormData,
        });

        if (!uploadRes.ok) {
          const errorText = await uploadRes.text();
          console.error('❌ 上传失败响应:', errorText);
          throw new Error(`图片上传失败: ${uploadRes.status} ${uploadRes.statusText}`);
        }

        const uploadedFiles = await uploadRes.json();
        console.log('✅ 上传成功:', uploadedFiles);
        
        if (uploadedFiles && uploadedFiles[0]) {
          imageId = uploadedFiles[0].id;
        }
      }

      const payload: BannerPayload = {
        title: formData.title,
        link: formData.link,
        sort_order: formData.sort_order,
        is_active: formData.is_active,
      };

      if (imageId !== null) {
        payload.image = imageId;
      }

      console.log('📦 提交的 payload:', payload);

      if (editingBanner) {
        await api.updateBanner(editingBanner.documentId, payload);
        alert('Banner 更新成功');
      } else {
        await api.createBanner(payload);
        alert('Banner 创建成功');
      }

      closeModal();
      fetchBanners();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '操作失败';
      alert(message);
      console.error('❌ 提交失败:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该 Banner 吗？')) return;
    try {
      await api.deleteBanner(id);
      alert('删除成功');
      fetchBanners();
    } catch (err) {
      alert('删除失败');
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ImageIcon className="w-8 h-8" />
            Banner 管理
          </h1>
          <p className="text-gray-500 mt-1">共 {banners.length} 个轮播图</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-medium transition-all"
        >
          <Plus className="w-5 h-5" />
          新增 Banner
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-2xl">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">加载中...</div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">预览图</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">标题</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">链接</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">排序</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">状态</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {banners.map((banner) => {
                return (
                  <tr key={banner.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      {banner.image?.url ? (
                        <div className="relative w-16 h-16">
                          <Image
                            src={`${strapiUrl}${banner.image.url}`}
                            alt={banner.title}
                            fill
                            className="object-cover rounded-xl border"
                            sizes="64px"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-xs">
                          无图
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{banner.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 break-all">{banner.link || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{banner.sort_order}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          banner.is_active
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {banner.is_active ? '显示' : '隐藏'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => openModal(banner)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(banner.documentId)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4">
            <div className="px-8 pt-6 pb-4 border-b">
              <h2 className="text-2xl font-bold">
                {editingBanner ? '编辑 Banner' : '新增 Banner'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">标题</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">跳转链接</label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">排序值</label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) =>
                      setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">是否显示</label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="text-gray-700">在前台显示</span>
                  </label>
                </div>
              </div>

              {/* ✅ 修改后的图片上传区域，加入了原图预览功能 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  图片（可选）
                </label>

                {/* 如果处于编辑模式，且本身带有图片，且当前没有选择新图片，则显示当前服务器原图 */}
                {editingBanner?.image?.url && !formData.image && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">当前正在使用的图片：</p>
                    <div className="relative w-32 h-32">
                      <Image
                        src={`${strapiUrl}${editingBanner.image.url}`}
                        alt="Current Banner"
                        fill
                        className="object-cover rounded-xl border border-gray-200 shadow-sm"
                        sizes="128px"
                      />
                    </div>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:bg-blue-50 file:text-blue-700"
                />
                
                {formData.image && (
                  <p className="mt-2 text-sm text-blue-600 font-medium">
                    ✅ 已选择新图片: {formData.image.name}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-8 py-4 text-gray-500 hover:text-gray-700 font-medium"
                  disabled={uploading}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={uploading}
                >
                  {uploading ? '上传中...' : editingBanner ? '保存修改' : '创建 Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
