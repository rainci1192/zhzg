import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import Breadcrumb from '@/components/layout/Breadcrumb';

export default function StudentsActivities() {
  const sidebarItems = [
    { name: '学生管理', href: '/students/management' },
    { name: '学生活动', href: '/students/activities' },
    { name: '学生风采', href: '/students/showcase' },
  ];

  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '学生工作', href: '/students/management' },
    { name: '学生活动', href: '/students/activities' },
  ];

  const activities = [
    //{ title: '学院举办科技创新大赛', date: '2026-03-18' },
    //{ title: '开展企业参观实践活动', date: '2026-03-12' },
    //{ title: '组织学术讲座系列活动', date: '2026-03-08' },
    //{ title: '举办师生篮球友谊赛', date: '2026-03-05' },
  {},
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">学生活动</h1>
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-6">
            <aside className="w-64 flex-shrink-0">
              <Sidebar title="学生工作" items={sidebarItems} />
            </aside>
            
            <div className="flex-1 bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-600">学生活动</h2>
              <ul className="space-y-4">
                {activities.map((activity, index) => (
                  <li key={index} className="border-l-4 border-blue-600 pl-4 py-3 hover:bg-blue-50 transition-colors duration-300 cursor-pointer">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{activity.title}</h3>
                    <span className="text-sm text-gray-500">{activity.date}</span>
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

