'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchRoles, StrapiRole } from '@/lib/permissions';
import { Shield, Plus, Edit2, Trash2, Settings, Users, Eye } from 'lucide-react';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export default function RolesPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<StrapiRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<StrapiRole | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    color: 'blue',
    is_system: false,
  });

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const rolesData = await fetchRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error('加载角色失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      display_name: '',
      description: '',
      color: 'blue',
      is_system: false,
    });
    setShowModal(true);
  };

  const handleEdit = (role: StrapiRole) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      display_name: role.display_name,
      description: role.description,
      color: role.color,
      is_system: role.is_system,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        data: {
          name: formData.name,
          display_name: formData.display_name,
          description: formData.description,
          color: formData.color,
          is_system: formData.is_system,
          permissions: [], // 初始化为空权限
        },
      };

      const url = editingRole
        ? `${STRAPI_URL}/api/backend-roles/${editingRole.documentId}`
        : `${STRAPI_URL}/api/backend-roles`;

      const method = editingRole ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await loadRoles();
        setShowModal(false);
        alert(editingRole ? '角色更新成功' : '角色创建成功');
      } else {
        const errorData = await response.json();
        alert(`保存失败: ${errorData.error?.message || '未知错误'}`);
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    }
  };

  const handleDelete = async (role: StrapiRole) => {
    if (role.is_system) {
      alert('系统角色不能删除');
      return;
    }

    if (!confirm(`确定要删除角色"${role.display_name}"吗？`)) return;

    try {
      const response = await fetch(`${STRAPI_URL}/api/backend-roles/${role.documentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadRoles();
        alert('删除成功');
      } else {
        alert('删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请重试');
    }
  };

  const getRoleColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      green: 'bg-green-100 text-green-700 border-green-200',
      orange: 'bg-orange-100 text-orange-700 border-orange-200',
      gray: 'bg-gray-100 text-gray-700 border-gray-200',
      red: 'bg-red-100 text-red-700 border-red-200',
      yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    };
    return colorMap[color] || colorMap.blue;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">角色管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理系统角色和权限配置</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          添加角色
        </button>
      </div>

      {/* 角色卡片列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div
            key={role.id}
            className={`p-6 rounded-lg border-2 ${getRoleColorClass(role.color)} hover:shadow-lg transition-all`}
          >
            {/* 角色头部 */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8" />
                <div>
                  <h3 className="text-lg font-bold">{role.display_name}</h3>
                  {role.is_system && (
                    <span className="text-xs bg-white/50 px-2 py-0.5 rounded">系统角色</span>
                  )}
                </div>
              </div>
            </div>

            {/* 角色描述 */}
            <p className="text-sm opacity-80 mb-4 min-h-[40px]">{role.description}</p>

            {/* 权限统计 */}
            <div className="flex items-center justify-between text-sm mb-4 pb-4 border-b border-current/20">
              <span>权限数量</span>
              <span className="font-bold">{role.permissions?.length || 0}</span>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/dashboard/roles/${role.id}/permissions`)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/50 hover:bg-white/80 rounded-lg transition-colors text-sm font-medium"
                title="配置权限"
              >
                <Settings className="w-4 h-4" />
                配置权限
              </button>
              <button
                onClick={() => router.push(`/dashboard/roles/${role.id}/users`)}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-white/50 hover:bg-white/80 rounded-lg transition-colors text-sm"
                title="查看用户"
              >
                <Users className="w-4 h-4" />
              </button>
              {!role.is_system && (
                <>
                  <button
                    onClick={() => handleEdit(role)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-white/50 hover:bg-white/80 rounded-lg transition-colors text-sm"
                    title="编辑"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(role)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-white/50 hover:bg-white/80 rounded-lg transition-colors text-sm"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 快捷入口 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => router.push('/dashboard/roles/permissions')}
          className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all text-left"
        >
          <Settings className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="font-bold text-gray-900 mb-1">权限配置中心</h3>
          <p className="text-sm text-gray-500">统一配置所有角色的权限</p>
        </button>

        <button
          onClick={() => router.push('/dashboard/users/roles')}
          className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-green-500 hover:shadow-lg transition-all text-left"
        >
          <Eye className="w-8 h-8 text-green-600 mb-3" />
          <h3 className="font-bold text-gray-900 mb-1">权限说明</h3>
          <p className="text-sm text-gray-500">查看各角色的权限对照表</p>
        </button>

        <button
          onClick={() => router.push('/dashboard/users')}
          className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-lg transition-all text-left"
        >
          <Users className="w-8 h-8 text-purple-600 mb-3" />
          <h3 className="font-bold text-gray-900 mb-1">用户管理</h3>
          <p className="text-sm text-gray-500">管理用户并分配角色</p>
        </button>
      </div>

      {/* 添加/编辑角色模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingRole ? '编辑角色' : '添加角色'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  角色标识 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="例如: content_manager"
                  disabled={!!editingRole}
                />
                {editingRole && (
                  <p className="text-xs text-gray-500 mt-1">角色标识创建后不可修改</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  显示名称 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="例如: 内容管理员"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  角色描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="描述该角色的职责和权限范围"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  颜色标识
                </label>
                <select
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="blue">蓝色</option>
                  <option value="green">绿色</option>
                  <option value="purple">紫色</option>
                  <option value="orange">橙色</option>
                  <option value="red">红色</option>
                  <option value="yellow">黄色</option>
                  <option value="gray">灰色</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_system"
                  checked={formData.is_system}
                  onChange={(e) => setFormData({ ...formData, is_system: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_system" className="ml-2 text-sm text-gray-700">
                  系统角色（不可删除）
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
