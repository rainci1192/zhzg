import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/layout/Breadcrumb';

const STRAPI_BASE_URL = (
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  process.env.STRAPI_URL ||
  'http://localhost:1337'
).replace(/\/$/, '');

const STRAPI_API_TOKEN =
  process.env.STRAPI_API_TOKEN ||
  '';

function toAbsoluteUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${STRAPI_BASE_URL}${url}`;
}

type PartnerDetail = {
  id: number;
  name: string;
  logo_url: string | null;
  website: string | null;
  intro: string | null;
};

async function getPartner(id: number): Promise<PartnerDetail | null> {
  try {
    const params = new URLSearchParams({
      'populate[logo][fields][0]': 'url',
    });
    const res = await fetch(
      `${STRAPI_BASE_URL}/api/council-members/${id}?${params}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(STRAPI_API_TOKEN ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` } : {}),
        },
        next: { revalidate: 300 },
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const entity = json?.data ?? json;
    const d = entity?.attributes ?? entity;

    const rawLogoUrl: string =
      d?.logo?.url ||
      d?.logo?.data?.attributes?.url ||
      d?.logo?.data?.url ||
      '';

    return {
      id: entity?.id ?? 0,
      name: d?.name ?? '',
      logo_url: toAbsoluteUrl(rawLogoUrl) || null,
      website: d?.website ?? null,
      intro: d?.intro ?? null,
    };
  } catch {
    return null;
  }
}

export default async function PartnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = await params;
  const id = Number(idStr);

  if (isNaN(id) || id <= 0) notFound();

  const partner = await getPartner(id);

  if (!partner || !partner.intro) notFound();

  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '校企合作', href: '/cooperation/news' },
    { name: '合作单位', href: '/cooperation/partner' },
    { name: partner.name, href: `/cooperation/partner/${id}` },
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
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-600">
              企业简介
            </h2>
            <div className="prose prose-gray max-w-none text-lg leading-relaxed whitespace-pre-wrap">
              {partner.intro}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
