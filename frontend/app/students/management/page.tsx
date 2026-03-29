import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import Breadcrumb from '@/components/layout/Breadcrumb';

export default function StudentsManagement() {
  const sidebarItems = [
    { name: '学生管理', href: '/students/management' },
    { name: '学生活动', href: '/students/activities' },
    { name: '学生风采', href: '/students/showcase' },
  ];

  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '学生工作', href: '/students/management' },
    { name: '学生管理', href: '/students/management' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">学生管理</h1>
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-6">
            <aside className="w-64 flex-shrink-0">
              <Sidebar title="学生工作" items={sidebarItems} />
            </aside>
            
            <div className="flex-1 bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-600">学生管理</h2>
              {/* <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed mb-6 text-justify indent-8">
                  学院高度重视学生管理工作，建立健全学生管理制度，为学生成长成才提供全方位服务和保障。
                </p>
                
                <h3 className="text-xl font-bold text-gray-800 mt-6 mb-4">管理制度</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>学生学籍管理规定</li>
                  <li>学生奖学金评定办法</li>
                  <li>学生违纪处分条例</li>
                  <li>学生请假管理规定</li>
                </ul>
              </div> */}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

