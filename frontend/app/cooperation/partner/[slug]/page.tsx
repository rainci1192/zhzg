// app/cooperation/partner/[slug]/page.tsx
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/layout/Breadcrumb';
import pool from '@/lib/db';

export default async function PartnerDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const result = await pool.query(
    `
    SELECT *
    FROM partners
    WHERE slug = $1 AND is_active = true
    LIMIT 1
    `,
    [slug]
  );

 
  if (result.rows.length === 0) {
    notFound();
  }

  const partner = result.rows[0];
  

  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '校企合作', href: '/cooperation/news' },
    { name: '合作单位', href: '/cooperation/partner' },
    { name: partner.name, href: `/cooperation/partner/${slug}` },
  ];

  return (
    <>
      <Header />

      <div className="bg-gray-100 py-3">
        <div className="max-w-7xl mx-auto px-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* 顶部：Logo + 基本信息 */}
          <div className="flex gap-8 mb-8 pb-8 border-b">
            {partner.logo_url && (
              <div className="flex-shrink-0">
                <img
                  src={partner.logo_url}
                  alt={partner.name}
                  className="w-40 h-40 object-contain rounded-lg border-2 border-gray-100"
                />
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{partner.name}</h1>

              {partner.summary && (
                <p className="text-lg text-gray-600 mb-4">{partner.summary}</p>
              )}

              {partner.website && (
                <div className="mb-2">
                  <span className="text-gray-600">官方网站：</span>
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {partner.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          

          {/* 企业简介 */}
          {partner.description && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-600">
                企业简介
              </h2>
              <div
                className="prose prose-gray max-w-none text-lg leading-relaxed"
                dangerouslySetInnerHTML={{ __html: partner.description }}
              />
            </div>
          )}

          {/* 企业照片 */}
          {partner.photo_url && (
            <div className="mb-8">
              <img
                src={partner.photo_url}
                alt={partner.name}
                className="w-full rounded-lg shadow-md object-cover"
              />
            </div>
          )}
          
        </div>
      </div>

      <Footer />
    </>
  );
}
