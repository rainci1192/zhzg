'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Plus, Edit, Trash2, Download, FileText } from 'lucide-react';

interface Attachment {
  id: string;
  documentId: string;
  title: string;
  file?: {
    url: string;
    name?: string;
  } | null;
  download_count: number;
  is_active: boolean;
  category?: { name: string } | null;
}

export default function AttachmentsPage() {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 新增/编辑弹窗状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAttachment, setEditingAttachment] = useState<Attachment | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    is_active: true,
    file: null as File | null,
  });

  const fetchAttachments = async () => {
    try {
      setError(null);
      const response = await api.getAttachments();

      let attachmentList: Attachment[] = [];
      if (response && typeof response === 'object' && 'data' in response) {
        if (Array.isArray(response.data)) {
          attachmentList = response.data as Attachment[];
        }
      } else if (Array.isArray(response)) {
        attachmentList = response as Attachment[];
      }

      setAttachments(attachmentList);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '获取资料下载列表失败';
      console.error('❌ 获取附件失败', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, []);

  const openModal = (attachment: Attachment | null = null) => {
    if (attachment) {
      setEditingAttachment(attachment);
      setFormData({
        title: attachment.title,
        is_active: attachment.is_active,
        file: null,
      });
    } else {
      setEditingAttachment(null);
      setFormData({ title: '', is_active: true, file: null });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAttachment(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        is_active: formData.is_active,
      };

      if (editingAttachment) {
        await api.updateAttachment(editingAttachment.documentId, payload);
        alert('资料更新成功');
      } else {
        await api.createAttachment(payload);
        alert('资料创建成功');
      }
      closeModal();
      fetchAttachments();
    } catch (err: unknown) {
      alert('操作失败，请检查控制台');
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该资料吗？')) return;
    try {
      await api.deleteAttachment(id);
      alert('删除成功');
      fetchAttachments();
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
            <Download className="w-8 h-8" />
            资料下载管理
          </h1>
          <p className="text-gray-500 mt-1">共 {attachments.length} 个附件</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-medium transition-all"
        >
          <Plus className="w-5 h-5" />
          新增资料
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
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">文件名称</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">所属栏目</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">下载次数</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">状态</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {attachments.map((att) => (
                <tr key={att.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-medium text-gray-900">{att.title}</div>
                        {att.file?.name && (
                          <div className="text-xs text-gray-400">{att.file.name}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {att.category?.name || '未分类'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {att.download_count} 次
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        att.is_active
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {att.is_active ? '显示' : '隐藏'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => openModal(att)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(att.documentId)}
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
                {editingAttachment ? '编辑资料' : '新增资料'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">资料标题</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">上传文件</label>
                <input
                  type="file"
                  onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:bg-blue-50 file:text-blue-700"
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
                  <span className="text-gray-700">在前台显示并允许下载</span>
                </label>
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
                  {editingAttachment ? '保存修改' : '创建资料'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
