import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Link from 'next/link';

type Item = {
  id: number;
  title: string;
  slug: string;
  publish_time: string;
};

export default function AdmissionListPage({
  pageTitle,
  currentPath,
  items,
}: {
  pageTitle: '工程硕士' | '工程博士';
  currentPath: '/admission/master' | '/admission/doctor';
  items: Item[];
}) {
  const sidebarItems = [
    { name: '工程硕士', href: '/admission/master' },
    { name: '工程博士', href: '/admission/doctor' },
  ];

  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '招生信息', href: '/admission/master' },
    { name: pageTitle, href: currentPath },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">{pageTitle}</h1>
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-6">
            <aside className="w-64 flex-shrink-0">
              <Sidebar title="招生信息" items={sidebarItems} />
            </aside>

            <div className="flex-1 bg-white rounded-lg shadow-sm p-8">
              {items.length === 0 ? (
                <div className="text-gray-500">暂无相关招生信息</div>
              ) : (
                <ul className="space-y-1">
                  {items.map((news) => (
                    <li
                      key={news.id}
                      className="flex items-center justify-between py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-gray-400">•</span>
                        <Link
                          href={`/article/${news.slug}`}
                          className="text-gray-800 hover:text-blue-600 transition-colors line-clamp-1"
                        >
                          {news.title}
                        </Link>
                      </div>
                      <span className="text-gray-500 text-sm whitespace-nowrap ml-4">
                        {new Date(news.publish_time).toLocaleDateString('zh-CN')}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
