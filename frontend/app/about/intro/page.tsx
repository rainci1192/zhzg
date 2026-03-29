import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import Breadcrumb from '@/components/layout/Breadcrumb';

export default function AboutIntro() {
  const sidebarItems = [
    { name: '学院简介', href: '/about/intro' },
    { name: '理事会', href: '/about/council' },
    { name: '现任领导', href: '/about/leaders' },
    { name: '机构设置', href: '/about/organization' },
  ];

  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '学院概况', href: '/about/intro' },
    { name: '学院简介', href: '/about/intro' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">学院简介</h1>
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-6">
            <aside className="w-64 flex-shrink-0">
              <Sidebar title="学院概况" items={sidebarItems} />
            </aside>

            <div className="flex-1 bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-600">学院简介</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed mb-6 text-justify indent-8">
                  吉林大学国家卓越工程师学院依托珠海研究院设立分支机构—国家卓越工程师学院（珠海），充分发挥吉林大学本部新工科优势，聚焦珠海市及大湾区战略产业布局、高素质人才和催生新质生产力需求及高端产业聚集、科研成果转化环境优越等地缘优势，与重点企业联合培养工程硕博人才，建立校企协同育人机制，打造吉林大学“新工科”建设南方基地，持续提升吉林大学服务国家和区域经济社会发展能力和水平。<br></br>
                </p>

                <div className="my-8">
                  <img src="/images/zhzg001.png" alt="学院图片" className="w-full rounded-lg shadow-md" />
                </div>

                <p className="text-gray-700 leading-relaxed text-justify indent-8">
                  国家卓越工程师学院（珠海）将与学校本部国家卓越工程师学院形成双核驱动的一体两地产学研协同育人实体平台，提升吉林大学办学影响力和展现“国家队”的使命感，同时为珠海市引进人才提供具有竞争力的载体，以双方协调的配套人才政策为吸引，引进双方所需的高端人才，形成人才增量，留住国家卓越工程师学院培养的产业所需的人才，形成人才引进、人才培养和人才使用的良性循环，进而推动珠海产业发展，催生新兴产业。
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

