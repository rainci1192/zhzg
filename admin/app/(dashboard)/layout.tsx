import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';
import DashboardTopbar from '@/components/layout/DashboardTopbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <DashboardTopbar />
          <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
