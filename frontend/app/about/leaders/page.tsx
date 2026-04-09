import pool from '@/lib/db';
import AboutSingleLayout from '@/components/about/AboutSingleLayout';

type Leader = {
  id: number;
  title: string;
  name: string;
  intro: string | null;
};

export default async function AboutLeaders() {
  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '学院概况', href: '/about/intro' },
    { name: '现任领导', href: '/about/leaders' },
  ];

  const result = await pool.query(
    `
    SELECT id, title, name, intro
    FROM leaders
    WHERE is_active = true
    ORDER BY sort_order ASC, id ASC
    `
  );

  const leaders: Leader[] = result.rows;

  return (
    <AboutSingleLayout
      pageTitle="现任领导"
      sectionTitle="现任领导"
      breadcrumbItems={breadcrumbItems}
    >
      {leaders.length === 0 ? (
        <div className="text-gray-500">暂无领导信息</div>
      ) : (
        <div className="space-y-6">
          {leaders.map((leader) => (
            <div
              key={leader.id}
              className="border-l-4 border-blue-600 pl-6 py-4 bg-gray-50 rounded-r-lg hover:bg-blue-50 transition-colors duration-300"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {leader.title}：{leader.name}
              </h3>
              <p className="text-gray-600">{leader.intro || '暂无简介'}</p>
            </div>
          ))}
        </div>
      )}
    </AboutSingleLayout>
  );
}
