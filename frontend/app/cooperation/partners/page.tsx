import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import Breadcrumb from '@/components/layout/Breadcrumb';

export default function CooperationPartners() {
  const sidebarItems = [
    { name: '合作项目', href: '/cooperation/projects' },
    { name: '合作单位', href: '/cooperation/partners' },
    { name: '理事单位动态', href: '/cooperation/news' },
  ];

  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '校企合作', href: '/cooperation/projects' },
    { name: '合作单位', href: '/cooperation/partners' },
  ];

  const partners = [
     '珠海金山办公软件有限公司',
    '远光软件股份有限公司',
    '珠海翔翼航空技术有限公司',
    '杰理科技股份有限公司',
    '珠海市规划设计研究院',
    '健帆生物科技集团股份有限公司',
    '深圳市雄帝科技股份有限公司',
    '深圳适创腾扬科技有限公司',
    '广东树米科技有限公司',
    '深圳华大基因股份有限公司',
    '东莞市辉晟智能科技公司',
    '广东鸿劲新材料集团有限公司',
    '广东隆达铝业有限公司',
    '水发兴业能源（珠海）有限公司',
    '欣旺达动力科技股份有限公司',
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">合作单位</h1>
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-6">
            <aside className="w-64 flex-shrink-0">
              <Sidebar title="校企合作" items={sidebarItems} />
            </aside>
            
            <div className="flex-1 bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-600">合作单位</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {partners.map((partner, index) => (
                  <div key={index} className="bg-blue-50 rounded-lg p-6 text-center hover:bg-blue-100 hover:shadow-md transition-all duration-300">
                    <p className="text-gray-800 font-medium">{partner}</p>
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

