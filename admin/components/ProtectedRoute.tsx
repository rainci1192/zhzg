'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { usePermission } from '@/hooks/usePermission';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { canAccessPath } = usePermission();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      // 未登录，跳转到登录页（如果有的话）
      // router.push('/login');
      return;
    }

    // 检查当前路径权限
    if (!canAccessPath(pathname)) {
      // 无权限，跳转到仪表盘或显示无权限页面
      router.push('/dashboard');
    }
  }, [user, isLoading, pathname, canAccessPath, router]);

  // 加载中
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  // 无权限
  if (user && !canAccessPath(pathname)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">无访问权限</h1>
          <p className="text-gray-500 mb-6">
            您当前的角色没有权限访问此页面。如需访问，请联系管理员。
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回仪表盘
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
