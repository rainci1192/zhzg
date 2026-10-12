'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchRoles, StrapiRole } from '@/lib/permissions';
import { ArrowLeft, Users, Mail, CheckCircle, XCircle } from 'lucide-react';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

interface BackendAdmin {
  id: number;
  documentId: string;
  name: string;
  username: string;
  email: string;
  is_active: boolean;
  last_login: string | null;
  createdAt: string;
}

export default function RoleUsersPage() {
  const params = useParams();
  const router = useRouter();
  const roleId = Number(params.roleId);

  const [role, setRole] = useState<StrapiRole | null>(null);
  const [users, setUsers] = useState<BackendAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleId]);

  const loadData = async () => {
    try {
      const rolesData = await fetchRoles();
      const currentRole = rolesData.find((r) => r.id === roleId);
      setRole(currentRole || null);

      // 加载该角色的用户
      const response = await fetch(
        `${STRAPI_URL}/api/backend-admins?filters[backend_role][id][$eq]=${roleId}&populate=backend_role&sort=createdAt:desc`
      );
      const data = await response.json();
      setUsers(data.data || []);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
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

  if (!role) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">角色不存在</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{role.display_name} - 用户列表</h1>
          <p className="text-sm text-gray-500 mt-1">共 {users.length} 个用户拥有此角色</p>
        </div>
      </div>

      {/* 用户列表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">暂无用户拥有此角色</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {users.map((user) => (
              <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-lg">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </span>
                        <span>@{user.username}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <div className="text-gray-500 mb-1">最后登录</div>
                      <div className="text-gray-900">
                        {user.last_login
                          ? new Date(user.last_login).toLocaleDateString('zh-CN')
                          : '从未登录'}
                      </div>
                    </div>
                    <div>
                      {user.is_active ? (
                        <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <CheckCircle className="w-3 h-3" />
                          活跃
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          <XCircle className="w-3 h-3" />
                          禁用
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
