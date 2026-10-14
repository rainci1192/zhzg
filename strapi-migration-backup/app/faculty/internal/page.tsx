import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import Breadcrumb from '@/components/layout/Breadcrumb';
import SupervisorList from '@/components/faculty/SupervisorList';
import { getSupervisorsByCategory, groupSupervisorsByCollegeAndMajor } from '@/lib/api';

export default async function InternalSupervisors() {
  const sidebarItems = [
    { name: '校内培养导师', href: '/faculty/internal' },
    { name: '企业培养导师', href: '/faculty/enterprise' },
  ];

  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '师资队伍', href: '/faculty/internal' },
    { name: '校内培养导师', href: '/faculty/internal' },
  ];

  const supervisors = await getSupervisorsByCategory('internal');
  const grouped = groupSupervisorsByCollegeAndMajor(supervisors);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">校内培养导师</h1>
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-6">
            <aside className="w-64 flex-shrink-0">
              <Sidebar title="师资队伍" items={sidebarItems} />
            </aside>

            <div className="flex-1 bg-white rounded-lg shadow-sm p-8">
              <SupervisorList grouped={grouped} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
