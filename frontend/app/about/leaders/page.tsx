import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import Breadcrumb from '@/components/layout/Breadcrumb';

export default function AboutLeaders() {
  const sidebarItems = [
    { name: '学院简介', href: '/about/intro' },
    { name: '理事会', href: '/about/council' },
    { name: '现任领导', href: '/about/leaders' },
    { name: '机构设置', href: '/about/organization' },
  ];

  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '学院概况', href: '/about/intro' },
    { name: '现任领导', href: '/about/leaders' },
  ];

  const leaders = [
    { title: '院长', name: '蔡立东', intro: '统筹负责卓越工程师培养改革和学院建设工作' },
    { title: '执行院长', name: '王东', intro: '主持学院行政各项工作' },
    { title: '业务副院长', name: '于志泳', intro: '分管财务、采购、资产、后勤、安全、综合及党务等工作' },
    { title: '业务副院长', name: '秦博', intro: '分管国家卓越工程师学院（珠海）建设、研究生、科研、成果转化、中外合作办学、校友、培训等工作' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">现任领导</h1>
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-6">
            <aside className="w-64 flex-shrink-0">
              <Sidebar title="学院概况" items={sidebarItems} />
            </aside>
            
            <div className="flex-1 bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-600">现任领导</h2>
              <div className="space-y-6">
                {leaders.map((leader, index) => (
                  <div key={index} className="border-l-4 border-blue-600 pl-6 py-4 bg-gray-50 rounded-r-lg hover:bg-blue-50 transition-colors duration-300">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{leader.title}：{leader.name}</h3>
                    <p className="text-gray-600">{leader.intro}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

