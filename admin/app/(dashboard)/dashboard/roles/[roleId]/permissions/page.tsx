'use client';

import { strapiFetch } from '@/lib/strapi-fetch';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchRoles, StrapiRole } from '@/lib/permissions';
import { Save, AlertCircle, ArrowLeft, CheckSquare, Square } from 'lucide-react';

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
  allowed_actions?: PermissionAction | PermissionAction[];
  data_scope?: string;
}

export default function RolePermissionsConfigPage() {
  const params = useParams();
  const router = useRouter();
  const roleId = Number(params.roleId);

  const [role, setRole] = useState<StrapiRole | null>(null);
  const [modules, setModules] = useState<PermissionModule[]>([]);
  const [actions, setActions] = useState<PermissionAction[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [permissionMatrix, setPermissionMatrix] = useState<Record<number, Record<number, boolean>>>({});
  const [dataScopeMatrix, setDataScopeMatrix] = useState<Record<number, string>>({});

  const loadRolePermissions = useCallback(async () => {
    try {
      const permissionsUrl = `${STRAPI_URL}/api/role-permissions?filters[backend_role][id][$eq]=${roleId}&populate=permission_module&populate=allowed_actions`;
      
      const permissionsRes = await strapiFetch(permissionsUrl);
      if (!permissionsRes.ok) {
        throw new Error(`加载权限记录失败: ${permissionsRes.status}`);
      }
      
      const permissionsData = await permissionsRes.json();
      const permissions: Array<{
        id: number;
        documentId: string;
        permission_module: number | unknown;
        allowed_actions: number | number[] | unknown;
        data_scope?: string;
        [key: string]: unknown;
      }> = permissionsData.data || [];
      
      if (permissions.length === 0) {
        setRolePermissions([]);
        setPermissionMatrix({});
        setDataScopeMatrix({});
        return;
      }
      
      const modulesUrl = `${STRAPI_URL}/api/permission-modules`;
      const modulesRes = await strapiFetch(modulesUrl);
      const modulesData = await modulesRes.json();
      const modulesMap = new Map<number, PermissionModule>(
        (modulesData.data || []).map((m: PermissionModule) => [m.id, m])
      );
      
      const actionsUrl = `${STRAPI_URL}/api/permission-actions`;
      const actionsRes = await strapiFetch(actionsUrl);
      const actionsData = await actionsRes.json();
      const actionsMap = new Map<number, PermissionAction>(
        (actionsData.data || []).map((a: PermissionAction) => [a.id, a])
      );
      
      const enrichedPermissions: RolePermission[] = permissions.map((rp) => {
        const rawModule = rp.permission_module as unknown;
        const moduleId = typeof rawModule === 'object' && rawModule !== null && 'id' in rawModule
          ? (rawModule as { id: number }).id
          : typeof rawModule === 'number' ? rawModule : undefined;
        
        let actionIds: number[] = [];
        const rawActions = rp.allowed_actions;
        
        if (Array.isArray(rawActions)) {
          actionIds = rawActions
            .map((item: unknown) => {
              if (typeof item === 'object' && item !== null && 'id' in item) {
                return (item as { id: number }).id;
              }
              return typeof item === 'number' ? item : null;
            })
            .filter((id): id is number => id !== null);
        } else if (rawActions) {
          const item = rawActions as unknown;
          if (typeof item === 'object' && item !== null && 'id' in item) {
            actionIds = [(item as { id: number }).id];
          } else if (typeof item === 'number') {
            actionIds = [item];
          }
        }
        
        const permissionModule = moduleId ? modulesMap.get(moduleId) : undefined;
        const permissionActions = actionIds
          .map((id: number) => actionsMap.get(id))
          .filter((action): action is PermissionAction => action !== undefined);
        
        return {
          id: rp.id,
          documentId: rp.documentId,
          permission_module: permissionModule,
          allowed_actions: permissionActions,
          data_scope: rp.data_scope || 'all',
        } as RolePermission;
      });
      
      setRolePermissions(enrichedPermissions);
      
      const matrix: Record<number, Record<number, boolean>> = {};
      const scopeMatrix: Record<number, string> = {};
      
      enrichedPermissions.forEach((rp: RolePermission) => {
        const permModule = rp.permission_module;
        const actions = Array.isArray(rp.allowed_actions) 
          ? rp.allowed_actions 
          : [];
        
        if (!permModule?.id) return;
        
        const moduleId = permModule.id;
        
        if (!matrix[moduleId]) {
          matrix[moduleId] = {};
        }
        
        if (!scopeMatrix[moduleId]) {
          scopeMatrix[moduleId] = rp.data_scope || 'all';
        }
        
        actions.forEach((action: PermissionAction) => {
          if (action?.id) {
            matrix[moduleId][action.id] = true;
          }
        });
      });
      
      setPermissionMatrix(matrix);
      setDataScopeMatrix(scopeMatrix);
    } catch (error) {
      console.error('加载角色权限失败:', error);
      setRolePermissions([]);
      setPermissionMatrix({});
      setDataScopeMatrix({});
    }
  }, [roleId]);

  const loadData = useCallback(async () => {
    try {
      const [rolesData, modulesRes, actionsRes] = await Promise.all([
        fetchRoles(),
        strapiFetch(`${STRAPI_URL}/api/permission-modules?sort=category:asc,sort_order:asc`),
        strapiFetch(`${STRAPI_URL}/api/permission-actions?sort=sort_order:asc`),
      ]);

      const currentRole = rolesData.find((r) => r.id === roleId);
      setRole(currentRole || null);

      const modulesData = await modulesRes.json();
      setModules(modulesData.data || []);

      const actionsData = await actionsRes.json();
      setActions(actionsData.data || []);

      await loadRolePermissions();
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, [roleId, loadRolePermissions]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
    if (!role) return;

    setSaving(true);
    try {
      if (rolePermissions.length > 0) {
        const deletePromises = rolePermissions.map((rp) =>
          strapiFetch(`${STRAPI_URL}/api/role-permissions/${rp.documentId}`, {
            method: 'DELETE',
          })
        );
        await Promise.all(deletePromises);
      }

      const createPromises: Array<Promise<{ success: boolean; moduleId: number; error?: string }>> = [];

      for (const [moduleId, actionMap] of Object.entries(permissionMatrix)) {
        const allowedActionIds = Object.entries(actionMap)
          .filter(([, allowed]) => allowed)
          .map(([actionId]) => Number(actionId));

        if (allowedActionIds.length === 0) continue;

        const createPayload = {
          data: {
            backend_role: roleId,
            permission_module: Number(moduleId),
            data_scope: dataScopeMatrix[Number(moduleId)] || 'all',
            allowed_actions: allowedActionIds,
          },
        };

        try {
          const createRes = await strapiFetch(`${STRAPI_URL}/api/role-permissions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(createPayload),
          });

          const createData = await createRes.json();

          if (!createRes.ok) {
            createPromises.push(Promise.resolve({
              success: false,
              moduleId: Number(moduleId),
              error: JSON.stringify(createData),
            }));
          } else {
            createPromises.push(Promise.resolve({
              success: true,
              moduleId: Number(moduleId),
            }));
          }
        } catch (error) {
          createPromises.push(Promise.resolve({
            success: false,
            moduleId: Number(moduleId),
            error: error instanceof Error ? error.message : '未知错误',
          }));
        }
      }

      const results = await Promise.all(createPromises);
      
      const successCount = results.filter(r => r.success).length;
      const failedCount = results.filter(r => !r.success).length;
      const failedModules = results.filter(r => !r.success).map(r => r.moduleId);
      
      if (failedCount > 0) {
        alert(`权限保存部分失败!\n成功: ${successCount} 条\n失败: ${failedCount} 条\n失败的模块: ${failedModules.join(', ')}`);
      } else {
        alert('权限保存成功');
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      await loadRolePermissions();
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

  if (!role) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">角色不存在</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          返回
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">配置权限 - {role.display_name}</h1>
            <p className="text-sm text-gray-500 mt-1">{role.description}</p>
          </div>
        </div>
        <button
          onClick={savePermissions}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {saving ? '保存中...' : '保存权限'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
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
    </div>
  );
}
