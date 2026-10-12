'use client';

import { useState, useEffect } from 'react';
import { fetchRoles, StrapiRole } from '@/lib/permissions';
import { Shield, Check, X } from 'lucide-react';

const PERMISSION_GROUPS = [
  {
    name: '内容管理',
    permissions: [
      { key: 'manage_articles', label: '文章管理' },
      { key: 'manage_categories', label: '分类管理' },
      { key: 'manage_pages', label: '单页管理' },
      { key: 'manage_student_documents', label: '学生文档管理' },
      { key: 'manage_student_showcases', label: '学生风采管理' },
      { key: 'manage_policy_documents', label: '政策文件管理' },
      { key: 'manage_download_files', label: '资料下载管理' },
    ],
  },
  {
    name: '组织管理',
    permissions: [
      { key: 'manage_leaders', label: '领导管理' },
      { key: 'manage_departments', label: '机构管理' },
      { key: 'manage_research_institutions', label: '科研机构管理' },
      { key: 'manage_research_transfers', label: '成果转化管理' },
      { key: 'manage_supervisors', label: '导师管理' },
      { key: 'manage_partners', label: '合作单位管理' },
    ],
  },
  {
    name: '网站设置',
    permissions: [
      { key: 'manage_banners', label: 'Banner管理' },
      { key: 'manage_links', label: '友情链接管理' },
      { key: 'manage_settings', label: '站点设置' },
    ],
  },
  {
    name: '系统管理',
    permissions: [
      { key: 'manage_users', label: '用户管理' },
      { key: 'manage_review', label: '审核管理' },
      { key: 'view_logs', label: '日志查看' },
      { key: 'manage_backup', label: '备份管理' },
    ],
  },
];

export default function RolesPage() {
  const [roles, setRoles] = useState<StrapiRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    loadRoles();
  }, []);

  const hasPermission = (role: StrapiRole, permissionKey: string) => {
    return role.permissions.includes(permissionKey);
  };

  const getRoleColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      green: 'bg-green-100 text-green-700 border-green-200',
      orange: 'bg-orange-100 text-orange-700 border-orange-200',
      gray: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colorMap[color] || colorMap.gray;
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">角色权限说明</h1>
        <p className="text-sm text-gray-500 mt-1">查看各角色的权限配置</p>
      </div>

      {/* 角色卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <div
            key={role.id}
            className={`p-6 rounded-lg border-2 ${getRoleColorClass(role.color)}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-6 h-6" />
              <h3 className="text-lg font-bold">{role.display_name}</h3>
            </div>
            <p className="text-sm opacity-80 mb-4">{role.description}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">权限数量</span>
              <span className="font-bold">{role.permissions.length}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 权限对照表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">权限对照表</h2>
          <p className="text-sm text-gray-500 mt-1">✓ 表示拥有该权限，✗ 表示无权限</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 sticky left-0 bg-gray-50 z-10">
                  权限
                </th>
                {roles.map((role) => (
                  <th
                    key={role.id}
                    className="text-center py-3 px-4 text-sm font-medium text-gray-700 min-w-[120px]"
                  >
                    {role.display_name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* 基础权限 */}
              <tr className="bg-gray-100">
                <td
                  colSpan={roles.length + 1}
                  className="py-2 px-4 text-sm font-semibold text-gray-700 sticky left-0 bg-gray-100"
                >
                  基础权限
                </td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-sm text-gray-700 sticky left-0 bg-white">
                  查看仪表盘
                </td>
                {roles.map((role) => (
                  <td key={role.id} className="py-3 px-4 text-center">
                    {hasPermission(role, 'view_dashboard') ? (
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>

              {/* 权限分组 */}
              {PERMISSION_GROUPS.map((group) => (
                <tbody key={group.name}>
                  <tr className="bg-gray-100">
                    <td
                      colSpan={roles.length + 1}
                      className="py-2 px-4 text-sm font-semibold text-gray-700 sticky left-0 bg-gray-100"
                    >
                      {group.name}
                    </td>
                  </tr>
                  {group.permissions.map((permission) => (
                    <tr key={permission.key} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-700 sticky left-0 bg-white">
                        {permission.label}
                      </td>
                      {roles.map((role) => (
                        <td key={role.id} className="py-3 px-4 text-center">
                          {hasPermission(role, permission.key) ? (
                            <Check className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-gray-300 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 权限说明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">权限说明</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• <strong>超级管理员</strong>：拥有系统所有权限，可以管理所有功能和用户</li>
          <li>• <strong>管理员</strong>：拥有大部分管理权限，可以管理内容和用户（除超级管理员功能外）</li>
          <li>• <strong>编辑</strong>：可以管理网站内容，包括文章、页面、文档等</li>
          <li>• <strong>审核员</strong>：可以审核内容和查看日志</li>
          <li>• <strong>查看者</strong>：只能查看仪表盘，无法进行任何修改操作</li>
        </ul>
      </div>
    </div>
  );
}
