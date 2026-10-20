import { sanitizeRichHtml } from '@/lib/sanitize-html';
import AboutSingleLayout from '@/components/about/AboutSingleLayout';
import Link from 'next/link';
import { getCouncilMembers } from '@/lib/council-members';

type CouncilArticle = {
  title: string;
  content_html: string;
};

type StrapiEntity = {
  id?: number;
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
};

type StrapiListResponse = {
  data?: StrapiEntity[];
};

const STRAPI_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  process.env.STRAPI_URL ||
  'http://localhost:1337';

const STRAPI_API_TOKEN =
  process.env.STRAPI_READ_TOKEN ||
  process.env.STRAPI_API_TOKEN ||
  '';

function unwrap(entity: StrapiEntity): Record<string, unknown> & { id?: number } {
  if (!entity) return {};
  const raw = (entity.attributes ?? entity) as Record<string, unknown>;
  return { ...raw, id: entity.id ?? (raw?.id as number | undefined) };
}

async function fetchFromStrapi<T = unknown>(pathWithQuery: string): Promise<T | null> {
  try {
    const res = await fetch(`${STRAPI_BASE_URL}${pathWithQuery}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(STRAPI_API_TOKEN ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` } : {}),
      },
      // Council intro is edited in the backend. Avoid the 5-minute Data Cache
      // so a successful admin publish is visible on the next page request.
      cache: 'no-store',
    });
    if (!res.ok) {
      console.error(`[Council] Strapi ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (error) {
    console.error('[Council] Strapi error:', error);
    return null;
  }
}

async function getCouncilArticle(): Promise<CouncilArticle> {
  const params = new URLSearchParams({
    'filters[slug][$eq]': 'about-council-content',
    'filters[review_status][$eq]': 'published',
    'status': 'published',
    'sort': 'updatedAt:desc',
    'pagination[pageSize]': '1',
  });
  const json = await fetchFromStrapi<StrapiListResponse>(`/api/articles?${params}`);
  const item = unwrap(json?.data?.[0] ?? {});
  return {
    title: (item?.title as string) || '理事会',
    content_html:
      (item?.content_html as string) ||
      (item?.content as string) ||
      '<p>暂无理事会介绍内容，请在后台补充。</p>',
  };
}

export default async function AboutCouncil() {
  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '学院概况', href: '/about/intro' },
    { name: '理事会', href: '/about/council' },
  ];

  const [article, councilMembers] = await Promise.all([
    getCouncilArticle(),
    getCouncilMembers({ councilOnly: true }),
  ]);

  return (
    <AboutSingleLayout
      pageTitle="理事会"
      sectionTitle={article.title || '理事会'}
      breadcrumbItems={breadcrumbItems}
    >
      {/* 理事会说明 */}
      <div
        className="prose prose-gray max-w-none text-[21px] leading-10 md:text-[22px] md:leading-[2.2]"
        dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(article.content_html || '') }}
      />

      {/* 理事会成员单位 */}
      <h3 className="text-3xl font-bold text-blue-800 mt-10 mb-6">理事会成员单位</h3>

      {councilMembers.length === 0 ? (
        <div className="text-gray-500">暂无理事会成员单位数据</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {councilMembers.map((member) => {
            const href = member.website
              ? member.website
              : member.intro
                ? `/cooperation/partner/${member.id}`
                : null;
            const isExternal = !!member.website;

            const card = (
              <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-lg transition-all duration-300 h-full">
                {member.logo_url ? (
                  <img
                    src={member.logo_url}
                    alt={member.name}
                    className="w-full h-24 object-contain mb-3"
                  />
                ) : (
                  <div className="w-full h-24 mb-3 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-sm">
                    暂无Logo
                  </div>
                )}
                <p className="text-gray-700 text-sm text-center leading-6">{member.name}</p>
              </div>
            );

            if (!href) return <div key={member.id}>{card}</div>;

            return (
              <Link
                key={member.id}
                href={href}
                target={isExternal ? '_blank' : '_self'}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="block"
                title={isExternal ? `访问 ${member.name} 官网` : `查看 ${member.name} 简介`}
              >
                {card}
              </Link>
            );
          })}
        </div>
      )}
    </AboutSingleLayout>
  );
}
