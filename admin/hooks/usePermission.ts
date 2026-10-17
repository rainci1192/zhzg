import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Permission, MENU_PERMISSIONS, isSuperAdminRole } from '@/lib/permissions';

export function usePermission() {
  const { user } = useAuth();

  const checkPermission = useMemo(() => {
    return (permission: Permission): boolean => {
      if (!user) return false;
      return isSuperAdminRole(user.role) || user.permissions.includes(permission);
    };
  }, [user]);

  const checkPath = useMemo(() => {
    return (path: string): boolean => {
      if (!user) return false;
      const requiredPermission = MENU_PERMISSIONS[path];
      return !requiredPermission || checkPermission(requiredPermission);
    };
  }, [user, checkPermission]);

  return {
    hasPermission: checkPermission,
    canAccessPath: checkPath,
    userRole: user?.role,
  };
}
