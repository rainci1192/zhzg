import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import Breadcrumb from '@/components/layout/Breadcrumb';

export default function FacultyEnterprise() {
  const sidebarItems = [
    { name: '校内导师', href: '/faculty/internal' },
    { name: '企业导师', href: '/faculty/enterprise' },
  ];

  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '师资队伍', href: '/faculty/enterprise' },
    { name: '企业导师', href: '/faculty/enterprise' },
  ];

  const tutorsByMajor = {
    '': []
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">企业导师</h1>
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-6">
            <aside className="w-64 flex-shrink-0">
              <Sidebar title="师资队伍" items={sidebarItems} />
            </aside>
            
            <div className="flex-1 bg-white rounded-lg shadow-sm p-8">
              

              {Object.entries(tutorsByMajor).map(([major, tutors]) => (
                <div key={major} className="mb-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">{major}</h2>
                  <div className="grid grid-cols-9 gap-4">
                    {tutors.map((name, index) => (
                      <div key={index} className="text-center text-gray-700 hover:text-blue-600 cursor-pointer transition-colors">
                        {name}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

