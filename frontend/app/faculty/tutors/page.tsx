import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import Breadcrumb from '@/components/layout/Breadcrumb';

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

  const tutors = [
    //{ name: '张教授', title: '教授、博士生导师', field: '航空发动机' },
    //{ name: '李教授', title: '教授、博士生导师', field: '飞行器设计' },
    //{ name: '王教授', title: '教授、博士生导师', field: '航空材料' },
    //{ name: '赵教授', title: '教授、博士生导师', field: '航空电子' },
  {},
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
              <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-600">导师介绍</h2>
              {/* <div className="grid md:grid-cols-2 gap-6">
                {tutors.map((tutor, index) => (
                  <div key={index} className="bg-gradient-to-r from-blue-50 to-white rounded-lg p-6 border-l-4 border-blue-600 hover:shadow-lg transition-all duration-300">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{tutor.name}</h3>
                    <p className="text-blue-600 text-sm mb-2">{tutor.title}</p>
                    <p className="text-gray-600">研究方向：{tutor.field}</p>
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

