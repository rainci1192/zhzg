'use client';

import { ReactNode } from 'react';
import { useModulePermission } from '@/hooks/useModulePermission';
import { Lock } from 'lucide-react';

interface PermissionGuardProps {
  moduleName: string;
  action: 'view' | 'create' | 'update' | 'delete' | 'publish' | 'review' | 'export' | 'import';
  children: ReactNode;
  fallback?: ReactNode;
  showMessage?: boolean;
}

export default function PermissionGuard({
  moduleName,
  action,
  children,
  fallback,
  showMessage = false,
}: PermissionGuardProps) {
  const permissions = useModulePermission(moduleName);

  if (permissions.loading) {
    return null;
  }

  const actionMap = {
    view: permissions.canView,
    create: permissions.canCreate,
    update: permissions.canUpdate,
    delete: permissions.canDelete,
    publish: permissions.canPublish,
    review: permissions.canReview,
    export: permissions.canExport,
    import: permissions.canImport,
  };

  const hasPermission = actionMap[action];

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showMessage) {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Lock className="w-4 h-4" />
          <span>无权限</span>
        </div>
      );
    }

    return null;
  }

  return <>{children}</>;
}
