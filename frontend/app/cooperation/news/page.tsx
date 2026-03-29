import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import Breadcrumb from '@/components/layout/Breadcrumb';

export default function CooperationNews() {
  const sidebarItems = [
    { name: '合作项目', href: '/cooperation/projects' },
    { name: '合作单位', href: '/cooperation/partners' },
    { name: '理事单位动态', href: '/cooperation/news' },
  ];

  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '校企合作', href: '/cooperation/projects' },
    { name: '理事单位动态', href: '/cooperation/news' },
  ];

  const newsList = [
   // { title: '航空工业集团与学院签署战略合作协议', date: '2026-03-15', source: '航空工业集团' },
   // { title: '航天科技集团专家来院开展技术交流', date: '2026-03-10', source: '航天科技集团' },
   // { title: '中国商飞设立专项奖学金', date: '2026-03-05', source: '中国商飞' },
   // { title: '中国电科共建联合实验室', date: '2026-02-28', source: '中国电科' },
  {},
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">理事单位动态</h1>
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-6">
            <aside className="w-64 flex-shrink-0">
              <Sidebar title="校企合作" items={sidebarItems} />
            </aside>
            
            <div className="flex-1 bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-600">理事单位动态</h2>
              <ul className="space-y-4">
                {newsList.map((news, index) => (
                  <li key={index} className="border-l-4 border-blue-600 pl-4 py-3 hover:bg-blue-50 transition-colors duration-300 cursor-pointer">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{news.title}</h3>
{/*                     <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{news.date}</span>
                      <span>来源：{news.source}</span>
                    </div>
 */}                  </li>
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

