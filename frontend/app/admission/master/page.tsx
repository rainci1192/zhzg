import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import Breadcrumb from '@/components/layout/Breadcrumb';

export default function AdmissionMaster() {
  const sidebarItems = [
    { name: '工程硕士', href: '/admission/master' },
    { name: '工程博士', href: '/admission/doctor' },
  ];

  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '招生信息', href: '/admission/master' },
    { name: '工程硕士', href: '/admission/master' },
  ];

  const newsList = [
    { title: '吉林大学卓越工程师学院（珠海）2025年硕士研究生招生调剂办法', date: '2025-05-19' },
    { title: '吉林大学卓越工程师学院（珠海）2025年硕士研究生拟录取名单公示（第二批-材料与化工专业）', date: '2025-04-16' },
    { title: '吉林大学卓越工程师学院（珠海）2025年硕士研究生拟录取名单公示（第三批）', date: '2025-04-14' },
    { title: '关于吉林大学卓越工程师学院（珠海）2025年硕士研究生招生调剂工作的通知', date: '2025-04-11' },
    { title: '关于吉林大学卓越工程师学院（珠海）2025年硕士研究生招生调剂考试的通知', date: '2025-04-10' },
    { title: '吉林大学卓越工程师学院（珠海）2025年硕士研究生招生复试录取实施细则', date: '2025-03-20', link: true },
    { title: '关于发布吉林大学卓越工程师学院（珠海）2025年硕士研究生复试分数线的通知', date: '2025-03-14' },
    { title: '吉林大学2024年工程类校企联合培养专项推免研究生招生公告', date: '2023-09-26' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">工程硕士</h1>
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-6">
            <aside className="w-64 flex-shrink-0">
              <Sidebar title="招生信息" items={sidebarItems} />
            </aside>

            <div className="flex-1 bg-white rounded-lg shadow-sm p-8">
              <ul className="space-y-1">
                {newsList.map((news, index) => (
                  <li key={index} className="flex items-center justify-between py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">•</span>
                      <a href="#" className={`${news.link ? 'text-blue-600' : 'text-gray-800'} hover:text-blue-600 transition-colors`}>
                        {news.title}
                      </a>
                    </div>
                    <span className="text-gray-500 text-sm whitespace-nowrap ml-4">{news.date}</span>
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

