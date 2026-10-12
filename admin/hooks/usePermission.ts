import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Permission, hasPermission, canAccessPath } from '@/lib/permissions';

export function usePermission() {
  const { user } = useAuth();

  const checkPermission = useMemo(() => {
    return (permission: Permission): boolean => {
      if (!user) return false;
      return hasPermission(user.role, permission);
    };
  }, [user]);

  const checkPath = useMemo(() => {
    return (path: string): boolean => {
      if (!user) return false;
      return canAccessPath(user.role, path);
    };
  }, [user]);

  return {
    hasPermission: checkPermission,
    canAccessPath: checkPath,
    userRole: user?.role,
  };
}
