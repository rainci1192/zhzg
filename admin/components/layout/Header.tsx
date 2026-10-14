'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <header className="h-16 border-b border-gray-200 bg-white px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-800">仪表盘</h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-sm">
          <span className="text-gray-400">当前用户：</span>
          <span className="font-medium text-gray-700">{user?.name || user?.username || user?.email}</span>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          退出
        </button>
      </div>
    </header>
  );
}
