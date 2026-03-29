import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import Breadcrumb from '@/components/layout/Breadcrumb';

export default function FacultyNews() {
  const sidebarItems = [
    { name: '动态信息', href: '/faculty/news' },
    { name: '导师介绍', href: '/faculty/tutors' },
  ];

  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '师资队伍', href: '/faculty/news' },
    { name: '动态信息', href: '/faculty/news' },
  ];

  const newsList = [
   // { title: '学院举办青年教师教学能力提升培训', date: '2026-03-20' },
   // { title: '多名教师获评省级教学名师', date: '2026-03-15' },
   // { title: '学院引进海外高层次人才', date: '2026-03-10' },
   // { title: '教师团队获国家级教学成果奖', date: '2026-03-05' },
  {},
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">动态信息</h1>
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-6">
            <aside className="w-64 flex-shrink-0">
              <Sidebar title="师资队伍" items={sidebarItems} />
            </aside>
            
            <div className="flex-1 bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-600">动态信息</h2>
              <ul className="space-y-4">
                {newsList.map((news, index) => (
                  <li key={index} className="border-l-4 border-blue-600 pl-4 py-3 hover:bg-blue-50 transition-colors duration-300 cursor-pointer">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{news.title}</h3>
                    <span className="text-sm text-gray-500">{news.date}</span>
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

