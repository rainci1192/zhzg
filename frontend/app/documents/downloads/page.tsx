import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import Breadcrumb from '@/components/layout/Breadcrumb';

export default function DocumentsDownloads() {
  const sidebarItems = [
    { name: '政策文件', href: '/documents/policies' },
    { name: '资料下载', href: '/documents/downloads' },
  ];

  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '管理文件', href: '/documents/policies' },
    { name: '资料下载', href: '/documents/downloads' },
  ];

  const downloads = [
    { title: '研究生入学申请表', size: '200KB' },
    { title: '导师双选表', size: '150KB' },
    { title: '学位论文模板', size: '500KB' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">资料下载</h1>
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-6">
            <aside className="w-64 flex-shrink-0">
              <Sidebar title="管理文件" items={sidebarItems} />
            </aside>
            
            <div className="flex-1 bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-600">资料下载</h2>
              <ul className="space-y-4">
                {downloads.map((file, index) => (
                  <li key={index} className="flex items-center justify-between border-l-4 border-blue-600 pl-4 py-3 hover:bg-blue-50 transition-colors duration-300 cursor-pointer">
                    <span className="text-gray-800 font-medium">{file.title}</span>
                    <span className="text-sm text-gray-500">{file.size}</span>
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

