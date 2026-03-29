import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import Breadcrumb from '@/components/layout/Breadcrumb';

export default function StudentsShowcase() {
  const sidebarItems = [
    { name: '学生管理', href: '/students/management' },
    { name: '学生活动', href: '/students/activities' },
    { name: '学生风采', href: '/students/showcase' },
  ];

  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '学生工作', href: '/students/management' },
    { name: '学生风采', href: '/students/showcase' },
  ];

  const students = [
    //{ name: '张同学', achievement: '获国家奖学金，发表SCI论文2篇' },
    //{ name: '李同学', achievement: '获全国大学生创新创业大赛一等奖' },
    //{ name: '王同学', achievement: '获省级优秀毕业生称号' },
  {},
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">学生风采</h1>
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-6">
            <aside className="w-64 flex-shrink-0">
              <Sidebar title="学生工作" items={sidebarItems} />
            </aside>
            
            <div className="flex-1 bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-600">学生风采</h2>
              {/* <div className="grid gap-6">
                {students.map((student, index) => (
                  <div key={index} className="bg-gradient-to-r from-blue-50 to-white rounded-lg p-6 border-l-4 border-blue-600 hover:shadow-lg transition-all duration-300">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">{student.name}</h3>
                    <p className="text-gray-600">{student.achievement}</p>
                  </div>
                ))}
              </div> */}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

