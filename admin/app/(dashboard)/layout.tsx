import Sidebar from '@/components/layout/Sidebar';
import RoleSwitcher from '@/components/RoleSwitcher';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部栏 */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">工作台</h2>
          </div>
          <div className="flex items-center gap-4">
            {/* 角色切换器（演示用） */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">演示切换角色：</span>
              <RoleSwitcher />
            </div>
          </div>
        </header>

        {/* 主内容区 */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
