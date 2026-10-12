'use client';

import { useEffect, useState } from 'react';

interface Department {
  id: number;
  documentId: string;
  name: string;
  description?: string | null;
  is_active: boolean;
  sort_order: number;
}

interface StrapiResponse {
  data: Array<{
    id: number;
    documentId: string;
    name: string;
    description?: string | null;
    is_active: boolean;
    sort_order: number;
  }>;
}

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export default function DepartmentsManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
    sort_order: 0,
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${STRAPI_URL}/api/departments?sort=sort_order:asc`);
      const data: StrapiResponse = await response.json();
      setDepartments(data.data.map((item) => ({
        id: item.id,
        documentId: item.documentId,
        name: item.name,
        description: item.description,
        is_active: item.is_active,
        sort_order: item.sort_order,
      })));
    } catch (error) {
      console.error('获取机构列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingDepartment
        ? `${STRAPI_URL}/api/departments/${editingDepartment.documentId}`
        : `${STRAPI_URL}/api/departments`;
      
      const method = editingDepartment ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: formData }),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingDepartment(null);
        setFormData({
          name: '',
          description: '',
          is_active: true,
          sort_order: 0,
        });
        fetchDepartments();
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

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      description: department.description || '',
      is_active: department.is_active,
      sort_order: department.sort_order,
    });
    setShowModal(true);
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('确定要删除这个机构吗？')) return;

    try {
      const response = await fetch(`${STRAPI_URL}/api/departments/${documentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchDepartments();
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
    setEditingDepartment(null);
    setFormData({
      name: '',
      description: '',
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
        <h1 className="text-3xl font-bold text-gray-800">机构设置管理</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          添加机构
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
                机构名称
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                描述
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
            {departments.map((dept) => (
              <tr key={dept.documentId}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {dept.sort_order}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {dept.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                  {dept.description || '暂无描述'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      dept.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {dept.is_active ? '启用' : '禁用'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                  <button
                    onClick={() => handleEdit(dept)}
                    className="text-blue-600 hover:text-blue-900"
                    title="编辑"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(dept.documentId)}
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
              {editingDepartment ? '编辑机构信息' : '添加机构信息'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    机构名称 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例如：教务处"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    描述
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入机构描述"
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
                    setEditingDepartment(null);
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
