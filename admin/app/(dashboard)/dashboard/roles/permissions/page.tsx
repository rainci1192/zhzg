'use client';

import { strapiFetch } from '@/lib/strapi-fetch';

import { useState, useEffect, useCallback } from 'react';
import { fetchRoles, StrapiRole } from '@/lib/permissions';
import { Shield, Save, AlertCircle, CheckSquare, Square } from 'lucide-react';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

interface PermissionModule {
  id: number;
  documentId: string;
  name: string;
  display_name: string;
  description: string;
  category: string;
  icon: string;
}

interface PermissionAction {
  id: number;
  documentId: string;
  name: string;
  display_name: string;
  color: string;
  icon: string;
}

interface RolePermission {
  id: number;
  documentId: string;
  permission_module: PermissionModule;
  allowed_actions: PermissionAction[];
  data_scope: string;
}

export default function RolePermissionsPage() {
  const [roles, setRoles] = useState<StrapiRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<StrapiRole | null>(null);
  const [modules, setModules] = useState<PermissionModule[]>([]);
  const [actions, setActions] = useState<PermissionAction[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [permissionMatrix, setPermissionMatrix] = useState<Record<number, Record<number, boolean>>>({});
  const [dataScopeMatrix, setDataScopeMatrix] = useState<Record<number, string>>({});

  // 加载角色权限
  const loadRolePermissions = useCallback(async (roleId: number) => {
  try {
    const url = `${STRAPI_URL}/api/role-permissions?filters[backend_role][id][$eq]=${roleId}&populate=*`;
    console.log('请求 URL:', url);

    const response = await strapiFetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API 错误响应:', errorText);

      if (response.status === 400 || response.status === 404) {
        console.warn('没有找到权限数据，初始化为空');
        setRolePermissions([]);
        setPermissionMatrix({});
        setDataScopeMatrix({});
        return;
      }

      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('成功加载权限数据:', data);

    const permissions = data.data || [];
    setRolePermissions(permissions);

    const matrix: Record<number, Record<number, boolean>> = {};
    const scopeMatrix: Record<number, string> = {};

    // ✅ 使用正确的类型
    permissions.forEach((rp: RolePermission) => {
      const permModule = rp.permission_module;
      const actions = rp.allowed_actions || [];
      
      if (!permModule?.id) {
        console.warn('权限数据缺少 permission_module:', rp);
        return;
      }

      const moduleId = permModule.id;
      matrix[moduleId] = {};
      scopeMatrix[moduleId] = rp.data_scope || 'all';

      if (Array.isArray(actions)) {
        actions.forEach((action: PermissionAction) => {
          if (action?.id) {
            matrix[moduleId][action.id] = true;
          }
        });
      }
    });

    console.log('构建的权限矩阵:', matrix);
    setPermissionMatrix(matrix);
    setDataScopeMatrix(scopeMatrix);
  } catch (error) {
    console.error('加载角色权限失败:', error);
    setRolePermissions([]);
    setPermissionMatrix({});
    setDataScopeMatrix({});
  }
}, []);


  // 加载初始数据
  const loadData = useCallback(async () => {
    try {
      const [rolesData, modulesRes, actionsRes] = await Promise.all([
        fetchRoles(),
        strapiFetch(`${STRAPI_URL}/api/permission-modules?sort=category:asc,sort_order:asc`),
        strapiFetch(`${STRAPI_URL}/api/permission-actions?sort=sort_order:asc`),
      ]);

      setRoles(rolesData);
      if (rolesData.length > 0) {
        setSelectedRole(rolesData[0]);
      }

      const modulesData = await modulesRes.json();
      setModules(modulesData.data || []);

      const actionsData = await actionsRes.json();
      setActions(actionsData.data || []);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (selectedRole) {
      loadRolePermissions(selectedRole.id);
    }
  }, [selectedRole, loadRolePermissions]);

  const togglePermission = (moduleId: number, actionId: number) => {
    setPermissionMatrix((prev) => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [actionId]: !prev[moduleId]?.[actionId],
      },
    }));
  };

  const toggleAllActions = (moduleId: number, enable: boolean) => {
    setPermissionMatrix((prev) => {
      const newModulePerms: Record<number, boolean> = {};
      actions.forEach((action) => {
        newModulePerms[action.id] = enable;
      });
      return {
        ...prev,
        [moduleId]: newModulePerms,
      };
    });
  };

  const setDataScope = (moduleId: number, scope: string) => {
    setDataScopeMatrix((prev) => ({
      ...prev,
      [moduleId]: scope,
    }));
  };

  const savePermissions = async () => {
    if (!selectedRole) return;

    setSaving(true);
    try {
      console.log('开始保存权限...');

      // 删除现有权限
      if (rolePermissions.length > 0) {
        console.log('删除现有权限:', rolePermissions.length, '条');
        const deletePromises = rolePermissions.map((rp) =>
          strapiFetch(`${STRAPI_URL}/api/role-permissions/${rp.documentId}`, {
            method: 'DELETE',
          })
        );
        await Promise.all(deletePromises);
      }

      // 创建新权限
      const createPromises: Promise<Response>[] = [];

      Object.entries(permissionMatrix).forEach(([moduleId, actionMap]) => {
        const allowedActionIds = Object.entries(actionMap)
          .filter(([, allowed]) => allowed)
          .map(([actionId]) => Number(actionId));

        if (allowedActionIds.length === 0) return;

        const payload = {
          data: {
            backend_role: selectedRole.id,
            permission_module: Number(moduleId),
            allowed_actions: allowedActionIds,
            data_scope: dataScopeMatrix[Number(moduleId)] || 'all',
          },
        };

        console.log('创建权限 payload:', payload);

        const promise = strapiFetch(`${STRAPI_URL}/api/role-permissions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        createPromises.push(promise);
      });

      if (createPromises.length > 0) {
        const results = await Promise.all(createPromises);
        console.log('创建成功:', results.length, '条权限');
      }

      alert('权限保存成功');
      await loadRolePermissions(selectedRole.id);
    } catch (error) {
      console.error('保存权限失败:', error);
      alert('保存权限失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setSaving(false);
    }
  };

  const groupedModules = modules.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, PermissionModule[]>);

  const categoryNames: Record<string, string> = {
    content: '内容管理',
    organization: '组织管理',
    website: '网站设置',
    system: '系统管理',
  };

  const getActionColor = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      green: 'bg-green-100 text-green-700 hover:bg-green-200',
      orange: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
      red: 'bg-red-100 text-red-700 hover:bg-red-200',
      purple: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
      yellow: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
      gray: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    };
    return colorMap[color] || 'bg-gray-100 text-gray-700';
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
          <h1 className="text-2xl font-bold text-gray-900">权限配置</h1>
          <p className="text-sm text-gray-500 mt-1">为不同角色配置详细的功能权限</p>
        </div>
        <button
          onClick={savePermissions}
          disabled={saving || !selectedRole}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {saving ? '保存中...' : '保存权限'}
        </button>
      </div>

      {/* 角色选择 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">选择角色</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedRole?.id === role.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Shield className="w-6 h-6 mx-auto mb-2 text-gray-600" />
              <div className="text-sm font-medium text-gray-900">{role.display_name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 权限配置表 */}
      {selectedRole && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-blue-50">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {selectedRole.display_name} - 权限配置
                </h2>
                <p className="text-sm text-gray-600">{selectedRole.description}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {Object.entries(groupedModules).map(([category, categoryModules]) => (
              <div key={category}>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-blue-600 rounded" />
                  {categoryNames[category] || category}
                </h3>

                <div className="space-y-4">
                  {categoryModules.map((module) => {
                    const hasAnyPermission = Object.values(permissionMatrix[module.id] || {}).some(Boolean);
                    const hasAllPermissions = actions.every((action) => permissionMatrix[module.id]?.[action.id]);

                    return (
                      <div
                        key={module.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium text-gray-900">{module.display_name}</h4>
                              <button
                                onClick={() => toggleAllActions(module.id, !hasAllPermissions)}
                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              >
                                {hasAllPermissions ? (
                                  <>
                                    <CheckSquare className="w-3 h-3" />
                                    全部取消
                                  </>
                                ) : (
                                  <>
                                    <Square className="w-3 h-3" />
                                    全部选中
                                  </>
                                )}
                              </button>
                            </div>
                            <p className="text-sm text-gray-500">{module.description}</p>
                          </div>
                        </div>

                        {/* 操作权限 */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {actions.map((action) => {
                            const isChecked = permissionMatrix[module.id]?.[action.id] || false;
                            return (
                              <button
                                key={action.id}
                                onClick={() => togglePermission(module.id, action.id)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                  isChecked
                                    ? getActionColor(action.color)
                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                }`}
                              >
                                {action.display_name}
                              </button>
                            );
                          })}
                        </div>

                        {/* 数据范围 */}
                        {hasAnyPermission && (
                          <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                            <span className="text-sm text-gray-600">数据范围:</span>
                            <select
                              value={dataScopeMatrix[module.id] || 'all'}
                              onChange={(e) => setDataScope(module.id, e.target.value)}
                              className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="all">所有数据</option>
                              <option value="own">仅自己创建的</option>
                              <option value="department">本部门的</option>
                            </select>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* 提示信息 */}
          <div className="p-4 bg-yellow-50 border-t border-yellow-100">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">权限配置说明:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>点击操作按钮可以启用/禁用该权限</li>
                  <li>使用全部选中/取消快速配置模块权限</li>
                  <li>数据范围控制用户可以访问的数据范围</li>
                  <li>修改后请点击右上角保存权限按钮</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
