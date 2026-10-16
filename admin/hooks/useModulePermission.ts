import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  hasModulePermission, 
  getModuleActions, 
  getDataScope,
  
} from '@/lib/permissions';

export function useModulePermission(moduleName: string) {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<{
    canView: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    canPublish: boolean;
    canUnpublish: boolean;
    canReview: boolean;
    canExport: boolean;
    canImport: boolean;
    dataScope: string;
    allowedActions: string[];
    loading: boolean;
  }>({
    canView: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canPublish: false,
    canUnpublish: false,
    canReview: false,
    canExport: false,
    canImport: false,
    dataScope: 'none',
    allowedActions: [],
    loading: true,
  });

  useEffect(() => {
    const loadPermissions = async () => {
      if (!user?.roleId) {
        setPermissions((prev) => ({ ...prev, loading: false }));
        return;
      }

      try {
        const [
          canView,
          canCreate,
          canUpdate,
          canDelete,
          canPublish,
          canUnpublish,
          canReview,
          canExport,
          canImport,
          dataScope,
          allowedActions,
        ] = await Promise.all([
          hasModulePermission(user.roleId, moduleName, 'view'),
          hasModulePermission(user.roleId, moduleName, 'create'),
          hasModulePermission(user.roleId, moduleName, 'update'),
          hasModulePermission(user.roleId, moduleName, 'delete'),
          hasModulePermission(user.roleId, moduleName, 'publish'),
          hasModulePermission(user.roleId, moduleName, 'unpublish'),
          hasModulePermission(user.roleId, moduleName, 'review'),
          hasModulePermission(user.roleId, moduleName, 'export'),
          hasModulePermission(user.roleId, moduleName, 'import'),
          getDataScope(user.roleId, moduleName),
          getModuleActions(user.roleId, moduleName),
        ]);

        setPermissions({
          canView,
          canCreate,
          canUpdate,
          canDelete,
          canPublish,
          canUnpublish,
          canReview,
          canExport,
          canImport,
          dataScope,
          allowedActions,
          loading: false,
        });
      } catch (error) {
        console.error('加载权限失败:', error);
        setPermissions((prev) => ({ ...prev, loading: false }));
      }
    };

    loadPermissions();
  }, [user?.roleId, moduleName]);

  return permissions;
}
