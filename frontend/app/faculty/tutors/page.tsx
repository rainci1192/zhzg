import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Link from 'next/link';

export default function FacultyTutors() {
  const sidebarItems = [
    { name: '动态信息', href: '/faculty/news' },
    { name: '导师介绍', href: '/faculty/tutors' },
  ];

  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '师资队伍', href: '/faculty/news' },
    { name: '导师介绍', href: '/faculty/tutors' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">导师介绍</h1>
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-6">
            <aside className="w-64 flex-shrink-0">
              <Sidebar title="师资队伍" items={sidebarItems} />
            </aside>

            <div className="flex-1 bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-600">
                导师介绍
              </h2>
              <p className="text-gray-500 mb-4">导师资料已在以下栏目展示：</p>
              <div className="flex gap-4">
                <Link href="/faculty/internal" className="text-blue-700 hover:underline">
                  校内培养导师
                </Link>
                <Link href="/faculty/enterprise" className="text-blue-700 hover:underline">
                  企业培养导师
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}