import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Link from 'next/link';
import pool from '@/lib/db';

type AdmissionItem = {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  publish_time: string | null;
};

export default async function AdmissionDoctor() {
  const sidebarItems = [
    { name: '工程硕士', href: '/admission/master' },
    { name: '工程博士', href: '/admission/doctor' },
  ];

  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '招生信息', href: '/admission/master' },
    { name: '工程博士', href: '/admission/doctor' },
  ];

  const result = await pool.query(
    `
    SELECT DISTINCT a.id, a.title, a.slug, a.summary, a.publish_time
    FROM articles a
    JOIN article_tags at ON at.article_id = a.id
    JOIN tags t ON t.id = at.tag_id
    WHERE a.status = 'published'
      AND a.category_id = 3
      AND t.slug = 'doctor-admission'
    ORDER BY a.publish_time DESC NULLS LAST, a.id DESC
    LIMIT 100
    `
  );

  const newsList: AdmissionItem[] = result.rows;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">工程博士</h1>
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-6">
            <aside className="w-64 flex-shrink-0">
              <Sidebar title="招生信息" items={sidebarItems} />
            </aside>

            <div className="flex-1">
              {newsList.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-gray-500">暂无工程博士招生信息</div>
              ) : (
                <div className="space-y-4">
                  {newsList.map((item) => {
                    const date = item.publish_time ? new Date(item.publish_time) : null;
                    const day = date ? String(date.getDate()).padStart(2, '0') : '--';
                    const month = date ? String(date.getMonth() + 1).padStart(2, '0') : '--';
                    const year = date ? date.getFullYear() : '--';

                    return (
                      <Link
                        key={item.id}
                        href={`/article/${item.slug}`}
                        className="group block bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                      >
                        <div className="flex items-stretch">
                          {/* 蓝色主调日期卡片 */}
                          <div className="relative w-20 flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-500">
                            <div className="h-full flex flex-col items-center justify-center p-3 relative overflow-hidden">
                              {/* 背景光效 */}
                              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                              
                              {/* 日期内容 */}
                              <div className="relative z-10 text-center">
                                <div className="text-3xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                                  {day}
                                </div>
                                <div className="text-xs text-blue-100 mt-0.5">
                                  {year}
                                </div>
                                <div className="text-xs font-semibold text-white mt-0.5">
                                  {month}月
                                </div>
                              </div>

                              {/* 装饰性光点 */}
                              <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-white/60 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                              <div className="absolute bottom-2 left-2 w-1 h-1 bg-white/40 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                            </div>
                          </div>

                          {/* 内容区域 */}
                          <div className="flex-1 p-5 relative">
                            <div className="relative z-10">
                              <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300 mb-2 leading-relaxed">
                                {item.title}
                              </h3>
                              {item.summary && (
                                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                  {item.summary}
                                </p>
                              )}
                            </div>

                            {/* 右侧箭头 */}
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* 底部蓝色进度条 */}
                        <div className="h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
