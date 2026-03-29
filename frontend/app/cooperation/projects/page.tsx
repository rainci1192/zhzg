import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import Breadcrumb from '@/components/layout/Breadcrumb';

export default function CooperationProjects() {
  const sidebarItems = [
    { name: '合作项目', href: '/cooperation/projects' },
    { name: '合作单位', href: '/cooperation/partners' },
    { name: '理事单位动态', href: '/cooperation/news' },
  ];

  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '校企合作', href: '/cooperation/projects' },
    { name: '合作项目', href: '/cooperation/projects' },
  ];

  const projects = [
   // { name: '航空发动机关键技术研发', partner: '航空工业集团', desc: '面向航空发动机核心技术攻关，培养高层次工程技术人才' },
   // { name: '卫星导航系统工程', partner: '航天科技集团', desc: '开展卫星导航系统关键技术研究与人才培养' },
   // { name: '大飞机制造工程', partner: '中国商飞', desc: '围绕大型客机研制，培养航空制造领域卓越工程师' },
   // { name: '智能制造技术', partner: '中国电科', desc: '推进智能制造技术创新与应用型人才培养' },
  {},
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">合作项目</h1>
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-6">
            <aside className="w-64 flex-shrink-0">
              <Sidebar title="校企合作" items={sidebarItems} />
            </aside>
            
            <div className="flex-1 bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-600">合作项目</h2>
              {/* <div className="grid gap-6">
                {projects.map((project, index) => (
                  <div key={index} className="bg-gradient-to-r from-blue-50 to-white rounded-lg p-6 border-l-4 border-blue-600 hover:shadow-lg transition-all duration-300">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{project.name}</h3>
                    <p className="text-blue-600 text-sm mb-3">合作单位：{project.partner}</p>
                    <p className="text-gray-600">{project.desc}</p>
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

