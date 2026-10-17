// app/faculty/internal/page.tsx
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import PageHero from '@/components/layout/PageHero';
import Link from 'next/link';
import { getContentAll } from '@/lib/strapi-content';

type Supervisor = {
  id: number;
  name: string;
  slug: string;
  title: string;
  college: string;
  major: string;
  personal_website: string | null;
};

type GroupedSupervisors = {
  [college: string]: {
    [major: string]: Supervisor[];
  };
};

export default async function InternalSupervisors() {
  const sidebarItems = [
    { name: '校内培养导师', href: '/faculty/internal' },
    { name: '企业培养导师', href: '/faculty/enterprise' },
  ];

  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '师资队伍', href: '/faculty/internal' },
    { name: '校内培养导师', href: '/faculty/internal' },
  ];

  const supervisors = await getContentAll<Supervisor>('supervisors', 'internal');

  // 按学院和专业分组
  const grouped: GroupedSupervisors = {};
  supervisors.forEach((sup) => {
    const college = sup.college || '其他';
    const major = sup.major || '其他';
    if (!grouped[college]) grouped[college] = {};
    if (!grouped[college][major]) grouped[college][major] = [];
    grouped[college][major].push(sup);
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50 site-subpage">
        <PageHero title="校内培养导师" items={breadcrumbItems} />

        <div className="max-w-7xl mx-auto px-4 py-8 site-page-body">
          <div className="flex gap-6 site-column-layout">
            <aside className="w-64 flex-shrink-0 site-column-aside">
              <Sidebar title="师资队伍" items={sidebarItems} />
            </aside>

            <div className="flex-1 bg-white rounded-lg shadow-sm p-8">
              {Object.keys(grouped).length === 0 ? (
                <div className="text-gray-500">暂无导师数据</div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(grouped).map(([college, majors]) => (
                    <div key={college}>
                      <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-600">
                        {college}
                      </h2>
                      {Object.entries(majors).map(([major, sups]) => (
                        <div key={major} className="mb-6">
                          <h3 className="text-xl font-semibold text-gray-700 mb-3">{major}</h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {sups.map((sup) => (
                              <Link
                                key={sup.id}
                                href={
                                  sup.personal_website
                                    ? sup.personal_website
                                    : `/faculty/supervisor/${sup.slug}`
                                }
                                target={sup.personal_website ? '_blank' : '_self'}
                                rel={sup.personal_website ? 'noopener noreferrer' : undefined}
                                className="group p-4 bg-gray-50 rounded-lg hover:bg-blue-50 hover:shadow-md transition-all duration-300"
                              >
                                <div className="text-center">
                                  <div className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                    {sup.name}
                                  </div>
                                  <div className="text-sm text-gray-500 mt-1">{sup.title}</div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
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
