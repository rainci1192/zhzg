'use client';

import { strapiFetch } from '@/lib/strapi-fetch';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { fetchRoles, StrapiRole } from '@/lib/permissions';
import { Users as UsersIcon, Plus, Edit2, Trash2, Shield, Search, Eye, EyeOff, Settings } from 'lucide-react';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

interface BackendAdmin {
  id: number;
  documentId: string;
  name: string;
  username: string;
  email: string;
  backend_role: {
    id: number;
    name: string;
    display_name: string;
  };
  is_active: boolean;
  last_login: string | null;
  createdAt: string;
}

export default function UsersManagement() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<BackendAdmin[]>([]);
  const [roles, setRoles] = useState<StrapiRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<BackendAdmin | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    roleId: 0,
    is_active: true,
  });

  // 加载角色和用户数据
  useEffect(() => {
    const loadData = async () => {
      try {
        // 加载角色
        const rolesData = await fetchRoles();
        setRoles(rolesData);

        // 加载用户
        const response = await strapiFetch(`${STRAPI_URL}/api/backend-admins?populate=backend_role&sort=createdAt:desc`);
        const data = await response.json();
        setUsers(data.data || []);
      } catch (error) {
        console.error('加载数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      username: '',
      email: '',
      password: '',
      roleId: roles[0]?.id || 0,
      is_active: true,
    });
    setShowPassword(false);
    setShowModal(true);
  };

  const handleEdit = (user: BackendAdmin) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
      password: '',
      roleId: user.backend_role.id,
      is_active: user.is_active,
    });
    setShowPassword(false);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证
    if (!formData.roleId || formData.roleId === 0) {
      alert('请选择角色');
      return;
    }

    if (!editingUser && formData.password.length < 6) {
      alert('密码长度至少 6 位');
      return;
    }

    try {
      const payload = {
        data: {
          name: formData.name,
          username: formData.username,
          email: formData.email,
          ...(formData.password ? { password: formData.password } : {}),
          backend_role: formData.roleId,
          is_active: formData.is_active,
        },
      };

      const url = editingUser
        ? `${STRAPI_URL}/api/backend-admins/${editingUser.documentId}`
        : `${STRAPI_URL}/api/backend-admins`;
      
      const method = editingUser ? 'PUT' : 'POST';

      const response = await strapiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // 重新加载用户列表
        const usersResponse = await strapiFetch(`${STRAPI_URL}/api/backend-admins?populate=backend_role&sort=createdAt:desc`);
        const usersData = await usersResponse.json();
        setUsers(usersData.data || []);
        setShowModal(false);
        alert(editingUser ? '用户更新成功' : '用户创建成功');
      } else {
        const errorData = await response.json();
        console.error('保存失败:', errorData);
        alert(`保存失败: ${errorData.error?.message || '未知错误'}`);
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('确定要删除这个用户吗？此操作不可恢复。')) return;

    try {
      const response = await strapiFetch(`${STRAPI_URL}/api/backend-admins/${documentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter(u => u.documentId !== documentId));
        alert('用户删除成功');
      } else {
        alert('删除失败，请重试');
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请重试');
    }
  };

  const toggleUserStatus = async (user: BackendAdmin) => {
    try {
      const response = await strapiFetch(`${STRAPI_URL}/api/backend-admins/${user.documentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: { is_active: !user.is_active },
        }),
      });

      if (response.ok) {
        setUsers(users.map(u => 
          u.documentId === user.documentId 
            ? { ...u, is_active: !u.is_active }
            : u
        ));
      }
    } catch (error) {
      console.error('更新状态失败:', error);
    }
  };

  const getRoleColor = (roleName: string) => {
    const role = roles.find(r => r.name === roleName);
    const colorMap: Record<string, string> = {
      purple: 'bg-purple-100 text-purple-700',
      blue: 'bg-blue-100 text-blue-700',
      green: 'bg-green-100 text-green-700',
      orange: 'bg-orange-100 text-orange-700',
      gray: 'bg-gray-100 text-gray-700',
    };
    return colorMap[role?.color || 'gray'];
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理后台管理员用户和角色权限</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          添加用户
        </button>
      </div>

      {/* 快捷入口 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => router.push('/dashboard/roles')}
          className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all text-left group"
        >
          <Shield className="w-6 h-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
          <h3 className="font-medium text-gray-900 mb-1">角色管理</h3>
          <p className="text-xs text-gray-500">管理角色和权限配置</p>
        </button>

        <button
          onClick={() => router.push('/dashboard/roles/permissions')}
          className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-green-500 hover:shadow-lg transition-all text-left group"
        >
          <Settings className="w-6 h-6 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
          <h3 className="font-medium text-gray-900 mb-1">权限配置</h3>
          <p className="text-xs text-gray-500">统一配置所有角色权限</p>
        </button>

        <button
          onClick={() => router.push('/dashboard/users/roles')}
          className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-lg transition-all text-left group"
        >
          <Eye className="w-6 h-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
          <h3 className="font-medium text-gray-900 mb-1">权限说明</h3>
          <p className="text-xs text-gray-500">查看权限对照表</p>
        </button>
      </div>

      {/* 搜索和统计 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索用户名、姓名或邮箱..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>总用户数: <strong>{users.length}</strong></span>
            <span>活跃: <strong className="text-green-600">{users.filter(u => u.is_active).length}</strong></span>
            <span>禁用: <strong className="text-red-600">{users.filter(u => !u.is_active).length}</strong></span>
          </div>
        </div>

        {/* 用户列表 */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">用户</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">角色</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">最后登录</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">创建时间</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">状态</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.documentId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.backend_role.name)}`}>
                      <Shield className="w-3 h-3" />
                      {user.backend_role.display_name}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {user.last_login 
                      ? new Date(user.last_login).toLocaleString('zh-CN')
                      : '从未登录'
                    }
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => toggleUserStatus(user)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        user.is_active
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {user.is_active ? '活跃' : '禁用'}
                    </button>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="编辑"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.documentId)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="删除"
                        disabled={user.id.toString() === currentUser?.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <UsersIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>未找到匹配的用户</p>
            </div>
          )}
        </div>
      </div>

      {/* 添加/编辑用户模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingUser ? '编辑用户' : '添加用户'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  用户名 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="用于登录的用户名"
                  disabled={!!editingUser}
                />
                {editingUser && (
                  <p className="text-xs text-gray-500 mt-1">用户名创建后不可修改</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  邮箱 *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  密码 {editingUser ? '(留空则不修改)' : '*'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入密码"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {!editingUser && (
                  <p className="text-xs text-gray-500 mt-1">密码长度至少 6 位</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  角色 *
                </label>
                <select
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value={0} disabled>请选择角色</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.display_name}
                    </option>
                  ))}
                </select>
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
                  启用账户
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
                  {editingUser ? '保存' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
