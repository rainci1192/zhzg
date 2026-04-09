// app/faculty/supervisor/[slug]/page.tsx
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/layout/Breadcrumb';
import pool from '@/lib/db';

type Education = {
  period: string;
  institution: string;
  department: string;
  degree: string;
};

type WorkExperience = {
  period: string;
  position: string;
  description: string;
};

export default async function SupervisorDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const result = await pool.query(
    `
    SELECT *
    FROM supervisors
    WHERE slug = $1 AND is_active = true
    LIMIT 1
    `,
    [slug]
  );

  if (result.rows.length === 0) notFound();

  const supervisor = result.rows[0];
  const education: Education[] = supervisor.education || [];
  const workExperience: WorkExperience[] = supervisor.work_experience || [];
  const socialPositions: string[] = supervisor.social_positions || [];

  const categoryName = supervisor.category === 'internal' ? '校内培养导师' : '企业培养导师';
  const categoryHref = supervisor.category === 'internal' ? '/faculty/internal' : '/faculty/enterprise';

  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '师资队伍', href: categoryHref },
    { name: categoryName, href: categoryHref },
    { name: supervisor.name, href: `/faculty/supervisor/${slug}` },
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
          {/* 顶部：照片 + 基本信息 */}
          <div className="flex gap-8 mb-8 pb-8 border-b">
            <div className="flex-shrink-0">
              {supervisor.photo_url ? (
                <img
                  src={supervisor.photo_url}
                  alt={supervisor.name}
                  className="w-40 h-52 object-cover rounded-lg shadow-md border-4 border-gray-100"
                />
              ) : (
                <div className="w-40 h-52 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                  暂无照片
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {supervisor.name}
                {supervisor.name_en && (
                  <span className="text-xl text-gray-500 ml-3">({supervisor.name_en})</span>
                )}
              </h1>

              {supervisor.personal_website && (
                <div className="mb-2">
                  <span className="text-gray-600">个人主页：</span>
                  <a
                    href={supervisor.personal_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {supervisor.personal_website}
                  </a>
                </div>
              )}

              <div className="text-lg text-gray-700 mb-2">{supervisor.title}</div>

              {supervisor.college && (
                <div className="text-gray-600 mb-1">
                  <span className="font-semibold">所属单位：</span>
                  {supervisor.college}
                </div>
              )}

              {supervisor.major && (
                <div className="text-gray-600 mb-1">
                  <span className="font-semibold">专业方向：</span>
                  {supervisor.major}
                </div>
              )}

              {supervisor.contact_info && (
                <div className="text-gray-600 mt-3">{supervisor.contact_info}</div>
              )}
            </div>
          </div>

          {/* 个人简介 */}
          {supervisor.bio && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-600">
                个人简介
              </h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {supervisor.bio}
              </div>
            </div>
          )}

          {/* 教育经历 */}
          {education.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-600">
                教育经历
              </h2>
              <div className="space-y-3">
                {education.map((edu, idx) => (
                  <div key={idx} className="text-gray-700">
                    <div className="font-semibold">[{idx + 1}] {edu.period}</div>
                    <div className="ml-4">
                      {edu.institution} › {edu.department} › {edu.degree}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 工作经历 */}
          {workExperience.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-600">
                工作经历
              </h2>
              <div className="space-y-3">
                {workExperience.map((work, idx) => (
                  <div key={idx} className="text-gray-700">
                    <div className="font-semibold">{work.period}</div>
                    <div className="ml-4">
                      {work.position} - {work.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 社会兼职 */}
          {socialPositions.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-600">
                社会兼职
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {socialPositions.map((pos, idx) => (
                  <li key={idx}>{pos}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 研究方向 */}
          {supervisor.research_areas && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-600">
                研究方向
              </h2>
              <div className="text-gray-700 leading-relaxed">{supervisor.research_areas}</div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
