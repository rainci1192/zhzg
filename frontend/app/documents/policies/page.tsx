import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import Breadcrumb from '@/components/layout/Breadcrumb';

export default function DocumentsPolicies() {
  const sidebarItems = [
    { name: '政策文件', href: '/documents/policies' },
    { name: '资料下载', href: '/documents/downloads' },
  ];

  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '管理文件', href: '/documents/policies' },
    { name: '政策文件', href: '/documents/policies' },
  ];

  const policies = [
    { title: '国家卓越工程师学院管理办法', date: '2026-01-15' },
    { title: '研究生培养方案', date: '2025-12-20' },
    { title: '学位授予工作细则', date: '2025-11-10' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">政策文件</h1>
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-6">
            <aside className="w-64 flex-shrink-0">
              <Sidebar title="管理文件" items={sidebarItems} />
            </aside>
            
            <div className="flex-1 bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-600">政策文件</h2>
              <ul className="space-y-4">
                {policies.map((policy, index) => (
                  <li key={index} className="border-l-4 border-blue-600 pl-4 py-3 hover:bg-blue-50 transition-colors duration-300 cursor-pointer">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{policy.title}</h3>
                    <span className="text-sm text-gray-500">{policy.date}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

