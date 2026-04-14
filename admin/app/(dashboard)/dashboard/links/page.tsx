'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Plus, Edit, Trash2, Link as LinkIcon } from 'lucide-react';

interface LinkItem {
  id: string;
  documentId: string;
  name: string;
  url: string;
  sort_order: number;
  is_active: boolean;
  logo?: {
    url: string;
    name?: string;
  } | null;
}

export default function LinksPage() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 新增/编辑弹窗状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    sort_order: 0,
    is_active: true,
    logo: null as File | null,
  });

  const fetchLinks = async () => {
    try {
      setError(null);
      const response = await api.getLinks();

      let linkList: LinkItem[] = [];
      if (response && typeof response === 'object' && 'data' in response) {
        if (Array.isArray(response.data)) {
          linkList = response.data as LinkItem[];
        }
      } else if (Array.isArray(response)) {
        linkList = response as LinkItem[];
      }

      setLinks(linkList);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '获取友情链接列表失败';
      console.error('❌ 获取友情链接失败', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const openModal = (link: LinkItem | null = null) => {
    if (link) {
      setEditingLink(link);
      setFormData({
        name: link.name,
        url: link.url,
        sort_order: link.sort_order,
        is_active: link.is_active,
        logo: null,
      });
    } else {
      setEditingLink(null);
      setFormData({ name: '', url: '', sort_order: 0, is_active: true, logo: null });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLink(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        url: formData.url,
        sort_order: formData.sort_order,
        is_active: formData.is_active,
      };

      if (editingLink) {
        // 编辑
        await api.updateLink(editingLink.documentId, payload);
        alert('友情链接更新成功');
      } else {
        // 新增
        await api.createLink(payload);
        alert('友情链接创建成功');
      }
      closeModal();
      fetchLinks();
    } catch (err: unknown) {
      alert('操作失败，请检查控制台');
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该友情链接吗？')) return;
    try {
      await api.deleteLink(id);
      alert('删除成功');
      fetchLinks();
    } catch (err) {
      alert('删除失败');
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* 标题 + 操作按钮 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <LinkIcon className="w-8 h-8" />
            友情链接管理
          </h1>
          <p className="text-gray-500 mt-1">共 {links.length} 个友情链接</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-medium transition-all"
        >
          <Plus className="w-5 h-5" />
          新增链接
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-2xl">
          {error}
        </div>
      )}

      {/* 列表 */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">加载中...</div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Logo</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">网站名称</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">跳转链接</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">排序</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">状态</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {links.map((link) => (
                <tr key={link.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    {link.logo?.url ? (
                      <img
                        src={link.logo.url}
                        alt={link.name}
                        className="w-12 h-12 object-contain rounded-xl border"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-xs">无图</div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{link.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 break-all">{link.url}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{link.sort_order}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${link.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>
                      {link.is_active ? '显示' : '隐藏'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => openModal(link)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(link.documentId)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 新增/编辑弹窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4">
            <div className="px-8 pt-6 pb-4 border-b">
              <h2 className="text-2xl font-bold">
                {editingLink ? '编辑友情链接' : '新增友情链接'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">网站名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">跳转链接</label>
                <input
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500"
                  placeholder="https://..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">排序值</label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
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

              {/* Logo 上传（简化版） */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo（可选）</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, logo: e.target.files?.[0] || null })}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:bg-blue-50 file:text-blue-700"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-8 py-4 text-gray-500 hover:text-gray-700 font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-2xl"
                >
                  {editingLink ? '保存修改' : '创建链接'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
