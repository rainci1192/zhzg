'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardTopbar() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <h2 className="text-lg font-semibold text-gray-800">工作台</h2>
      <div className="flex items-center gap-5">
        <div className="text-right text-sm">
          <div className="font-medium text-gray-800">{user?.name || user?.username}</div>
          <div className="text-gray-500">{user?.email}</div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          退出登录
        </button>
      </div>
    </header>
  );
}
