'use client';

import { useEffect, useState } from 'react';

interface Leader {
  id: number;
  documentId: string;
  title: string;
  name: string;
  intro?: string | null;
  is_active: boolean;
  sort_order: number;
}

interface StrapiResponse {
  data: Array<{
    id: number;
    documentId: string;
    title: string;
    name: string;
    intro?: string | null;
    is_active: boolean;
    sort_order: number;
  }>;
}

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export default function LeadersManagement() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLeader, setEditingLeader] = useState<Leader | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    name: '',
    intro: '',
    is_active: true,
    sort_order: 0,
  });

  useEffect(() => {
    fetchLeaders();
  }, []);

  const fetchLeaders = async () => {
    try {
      const response = await fetch(`${STRAPI_URL}/api/leaders?sort=sort_order:asc`);
      const data: StrapiResponse = await response.json();
      setLeaders(data.data.map((item) => ({
        id: item.id,
        documentId: item.documentId,
        title: item.title,
        name: item.name,
        intro: item.intro,
        is_active: item.is_active,
        sort_order: item.sort_order,
      })));
    } catch (error) {
      console.error('获取领导列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingLeader
        ? `${STRAPI_URL}/api/leaders/${editingLeader.documentId}`
        : `${STRAPI_URL}/api/leaders`;
      
      const method = editingLeader ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: formData }),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingLeader(null);
        setFormData({
          title: '',
          name: '',
          intro: '',
          is_active: true,
          sort_order: 0,
        });
        fetchLeaders();
      } else {
        const errorData = await response.json();
        console.error('保存失败:', errorData);
        alert('保存失败，请重试');
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    }
  };

  const handleEdit = (leader: Leader) => {
    setEditingLeader(leader);
    setFormData({
      title: leader.title,
      name: leader.name,
      intro: leader.intro || '',
      is_active: leader.is_active,
      sort_order: leader.sort_order,
    });
    setShowModal(true);
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('确定要删除这条领导信息吗？')) return;

    try {
      const response = await fetch(`${STRAPI_URL}/api/leaders/${documentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchLeaders();
      } else {
        const errorData = await response.json();
        console.error('删除失败:', errorData);
        alert('删除失败，请重试');
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请重试');
    }
  };

  const handleAdd = () => {
    setEditingLeader(null);
    setFormData({
      title: '',
      name: '',
      intro: '',
      is_active: true,
      sort_order: 0,
    });
    setShowModal(true);
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
        <h1 className="text-3xl font-bold text-gray-800">现任领导管理</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          添加领导
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                排序
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                职务
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                姓名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                简介
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaders.map((leader) => (
              <tr key={leader.documentId}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {leader.sort_order}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {leader.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {leader.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                  {leader.intro || '暂无简介'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      leader.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {leader.is_active ? '启用' : '禁用'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                  <button
                    onClick={() => handleEdit(leader)}
                    className="text-blue-600 hover:text-blue-900"
                    title="编辑"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(leader.documentId)}
                    className="text-red-600 hover:text-red-900"
                    title="删除"
                  >
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
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingLeader ? '编辑领导信息' : '添加领导信息'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    职务 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例如：院长"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    姓名 *
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    简介
                  </label>
                  <textarea
                    value={formData.intro}
                    onChange={(e) => setFormData({ ...formData, intro: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入简介"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    排序
                  </label>
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
                  <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                    启用显示
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingLeader(null);
                  }}
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
