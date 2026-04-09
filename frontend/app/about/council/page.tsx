import pool from '@/lib/db';
import AboutSingleLayout from '@/components/about/AboutSingleLayout';

type CouncilMember = {
  id: number;
  name: string;
  logo_url: string;
};

export default async function AboutCouncil() {
  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '学院概况', href: '/about/intro' },
    { name: '理事会', href: '/about/council' },
  ];

  // 理事会正文（slug 可按你实际调整）
  const articleRes = await pool.query(
    `
    SELECT id, title, content_html
    FROM articles
    WHERE slug = $1 AND status = 'published'
    LIMIT 1
    `,
    ['about-council-content']
  );

  const article = articleRes.rows[0] || {
    title: '理事会',
    content_html: '<p>暂无理事会介绍内容，请在后台补充。</p>',
  };

  // 理事会成员单位
  const membersRes = await pool.query(
    `
    SELECT id, name, logo_url
    FROM council_members
    WHERE is_active = true
    ORDER BY sort_order ASC, id ASC
    `
  );

  const councilMembers: CouncilMember[] = membersRes.rows;

  return (
    <AboutSingleLayout
      pageTitle="理事会"
      sectionTitle={article.title || '理事会'}
      breadcrumbItems={breadcrumbItems}
    >
      <div
        className="prose prose-gray max-w-none text-[21px] leading-10 md:text-[22px] md:leading-[2.2]"
        dangerouslySetInnerHTML={{ __html: article.content_html || '' }}
      />

      <h3 className="text-3xl font-bold text-blue-800 mt-10 mb-6">理事会成员单位</h3>

      {councilMembers.length === 0 ? (
        <div className="text-gray-500">暂无理事会成员单位数据</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {councilMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-lg transition-all duration-300"
            >
              <img
                src={member.logo_url}
                alt={member.name}
                className="w-full h-24 object-contain mb-3"
              />
              <p className="text-gray-700 text-sm text-center leading-6">{member.name}</p>
            </div>
          ))}
        </div>
      )}
    </AboutSingleLayout>
  );
}
