import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import PageHero from '@/components/layout/PageHero';
import Link from 'next/link';
import { getCouncilMembers } from '@/lib/council-members';

export default async function CooperationPartners() {
  const sidebarItems = [
    { name: '合作动态', href: '/cooperation/news' },
    { name: '合作单位', href: '/cooperation/partner' },
  ];

  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '校企合作', href: '/cooperation/news' },
    { name: '合作单位', href: '/cooperation/partner' },
  ];

  const partners = await getCouncilMembers();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50 site-subpage">
        <PageHero title="合作单位" items={breadcrumbItems} />

        <div className="max-w-7xl mx-auto px-4 py-8 site-page-body">
          <div className="flex gap-6 site-column-layout">
            <aside className="w-64 flex-shrink-0 site-column-aside">
              <Sidebar title="校企合作" items={sidebarItems} />
            </aside>

            <div className="flex-1 bg-white rounded-lg shadow-lg p-8 site-content-panel">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-600">
                合作单位
              </h2>

              {partners.length === 0 ? (
                <div className="text-gray-500">暂无合作单位数据</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {partners.map((partner) => {
                    const href = partner.website || (partner.intro ? `/cooperation/partner/${partner.id}` : null);
                    const isExternal = !!partner.website;
                    const card = <p className="text-gray-800 font-medium">{partner.name}</p>;

                    return href ? (
                      <Link
                        key={partner.id}
                        href={href}
                        target={isExternal ? '_blank' : '_self'}
                        rel={isExternal ? 'noopener noreferrer' : undefined}
                        className="bg-blue-50 rounded-lg p-6 text-center hover:bg-blue-100 hover:shadow-md transition-all duration-300"
                      >
                        {card}
                      </Link>
                    ) : <div key={partner.id} className="bg-blue-50 rounded-lg p-6 text-center">{card}</div>;
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
