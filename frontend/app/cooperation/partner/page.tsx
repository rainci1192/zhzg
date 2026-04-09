// app/cooperation/partners/page.tsx
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Link from 'next/link';
import pool from '@/lib/db';

type Partner = {
  id: number;
  name: string;
  slug: string;
  website: string | null;
};

export default async function CooperationPartners() {
  const sidebarItems = [
    { name: '合作动态', href: '/cooperation/news' },
    { name: '合作单位', href: '/cooperation/partner' },
  ];

  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '校企合作', href: '/cooperation/news' },
    { name: '合作单位', href: '/cooperation/partners' },
  ];

  const result = await pool.query(
    `
    SELECT id, name, slug, website
    FROM partners
    WHERE is_active = true
    ORDER BY sort_order, name
    `
  );

  const partners: Partner[] = result.rows;

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
              <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-600">
                合作单位
              </h2>
              {partners.length === 0 ? (
                <div className="text-gray-500">暂无合作单位数据</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {partners.map((partner) => {
                    const href = partner.website || `/cooperation/partner/${partner.slug}`;
                    const isExternal = !!partner.website;

                    return (
                      <Link
                        key={partner.id}
                        href={href}
                        target={isExternal ? '_blank' : '_self'}
                        rel={isExternal ? 'noopener noreferrer' : undefined}
                        className="bg-blue-50 rounded-lg p-6 text-center hover:bg-blue-100 hover:shadow-md transition-all duration-300"
                      >
                        <p className="text-gray-800 font-medium">{partner.name}</p>
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
