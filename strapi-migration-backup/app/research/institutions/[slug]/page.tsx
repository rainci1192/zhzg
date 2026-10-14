import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import Breadcrumb from '@/components/layout/Breadcrumb';
import pool from '@/lib/db';

export default async function InstitutionDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const sidebarItems = [
    { name: '科研机构', href: '/research/institutions' },
    { name: '科研动态', href: '/research/news' },
    { name: '成果转化', href: '/research/transfer' },
  ];

  const result = await pool.query(
    `
    SELECT id, name, summary, content_html, cover_image_url
    FROM research_institutions
    WHERE slug = $1 AND is_active = true
    LIMIT 1
    `,
    [slug]
  );

  if (result.rows.length === 0) notFound();

  const inst = result.rows[0];

  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '科学研究', href: '/research/institutions' },
    { name: '科研机构', href: '/research/institutions' },
    { name: inst.name, href: `/research/institutions/${slug}` },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
             <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-6">
            <aside className="w-64 flex-shrink-0">
              <Sidebar title="科学研究" items={sidebarItems} />
            </aside>

            <div className="flex-1 bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-600">
                {inst.name}
              </h2>

              {inst.summary && (
                <p className="text-lg text-gray-600 mb-6">{inst.summary}</p>
              )}

              <div
                className="prose prose-gray max-w-none text-[20px] leading-9 md:text-[21px] md:leading-10"
                dangerouslySetInnerHTML={{ __html: inst.content_html || '<p>暂无详细介绍。</p>' }}
              />

              {inst.cover_image_url && (
                <div className="mt-10">
                  <img
                    src={inst.cover_image_url}
                    alt={inst.name}
                    className="w-full rounded-lg shadow-md object-cover"
                  />
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
