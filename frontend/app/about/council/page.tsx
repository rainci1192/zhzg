import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import Breadcrumb from '@/components/layout/Breadcrumb';

export default function AboutCouncil() {
  const sidebarItems = [
    { name: '学院简介', href: '/about/intro' },
    { name: '理事会', href: '/about/council' },
    { name: '现任领导', href: '/about/leaders' },
    { name: '机构设置', href: '/about/organization' },
  ];

  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '学院概况', href: '/about/intro' },
    { name: '理事会', href: '/about/council' },
  ];

  const councilMembers = [
    { name: '珠海金山办公软件有限公司', logo: '/images/logo_jinshanbangong.png' },
    { name: '远光软件股份有限公司', logo: '/images/logo_yuanguangruanjian.png' },
    { name: '珠海翔翼航空技术有限公司', logo: '/images/logo_zhuhaixiangyi.webp' },
    { name: '杰理科技股份有限公司', logo: '/images/logo_jielikeji.png' },
    { name: '珠海市规划设计研究院', logo: '/images/logo_guihuasheji.png' },
    { name: '健帆生物科技集团股份有限公司', logo: '/images/logo_jianfanshengwu.jpg' },
    { name: '深圳市雄帝科技股份有限公司', logo: '/images/logo_xiongdikeji.png' },
    { name: '深圳适创腾扬科技有限公司', logo: '/images/logo_shichuangkeji.webp' },
    { name: '广东树米科技有限公司', logo: '/images/logo_shumikeji.jpg' },
    { name: '深圳华大基因股份有限公司', logo: '/images/logo_huadajiyin.png' },
    { name: '东莞市辉晟智能科技公司', logo: '/images/logo_huishengzhineng.png' },
    { name: '广东鸿劲新材料集团有限公司', logo: '/images/logo_hongjinxincai.png' },
    { name: '广东隆达铝业有限公司', logo: '/images/logo_longdaluye.png' },
    { name: '水发兴业能源（珠海）有限公司', logo: '/images/logo_shuifaxingye.jpg' },
    { name: '欣旺达动力科技股份有限公司', logo: '/images/logo_xinwangda.png' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">理事会</h1>
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-6">
            <aside className="w-64 flex-shrink-0">
              <Sidebar title="学院概况" items={sidebarItems} />
            </aside>
            
            <div className="flex-1 bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-600">理事会</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed mb-6 text-justify indent-8">
                  学院实行理事会负责制，理事会由校企双方共同组成，负责学院的重大决策和发展规划。理事会成员单位包括国内行业龙头企业，共同推进产教融合、协同育人。
                </p>
                
                <h3 className="text-xl font-bold text-gray-800 mt-8 mb-4">理事会成员单位</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {councilMembers.map((member, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-lg transition-all duration-300">
                      <img src={member.logo} alt={member.name} className="w-full h-24 object-contain mb-2" />
                      <p className="text-gray-600 text-sm text-center">{member.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

