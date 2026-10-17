import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import PageHero from '@/components/layout/PageHero';
import Link from 'next/link';

// ─── 类型 ───────────────────────────────────────────────

type Partner = {
  id: number;
  name: string;
  website: string | null;
};

type StrapiPartnerAttributes = {
  name?: string;
  website?: string | null;
  is_active?: boolean;
  sort_order?: number;
};

type StrapiPartnerEntity = {
  id?: number;
  attributes?: StrapiPartnerAttributes;
} & Partial<StrapiPartnerAttributes>;

// ─── Strapi 配置 ─────────────────────────────────────────

const STRAPI_BASE_URL = (
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  process.env.STRAPI_URL ||
  'http://localhost:1337'
).replace(/\/$/, '');

const STRAPI_API_TOKEN =
  process.env.STRAPI_API_TOKEN ||
  '';

// ─── 数据获取 ─────────────────────────────────────────────

async function getPartners(): Promise<Partner[]> {
  try {
    const params = new URLSearchParams({
      'filters[is_active][$eq]': 'true',
      'fields[0]': 'name',
      'fields[1]': 'website',
      'sort[0]': 'sort_order:asc',
      'sort[1]': 'name:asc',
      'pagination[pageSize]': '200',
    });

    const res = await fetch(
      `${STRAPI_BASE_URL}/api/council-members?${params}`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(STRAPI_API_TOKEN
            ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
            : {}),
        },
        next: { revalidate: 300 },
      }
    );

    if (!res.ok) {
      console.error(`[CoopPartners] Strapi ${res.status}`);
      return [];
    }

    const json: { data?: StrapiPartnerEntity[] } = await res.json();
    return (json.data ?? []).map((entity) => {
      const d = (entity.attributes ?? entity) as StrapiPartnerAttributes;
      return {
        id: entity.id ?? 0,
        name: d.name ?? '',
        website: d.website ?? null,
      };
    });
  } catch (e) {
    console.error('[CoopPartners] 获取合作单位失败:', e);
    return [];
  }
}

// ─── 页面组件 ─────────────────────────────────────────────

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

  const partners = await getPartners();

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
                    const href = partner.website ?? '#';
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
