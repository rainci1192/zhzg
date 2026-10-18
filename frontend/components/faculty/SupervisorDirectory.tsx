import Link from 'next/link';
import { safeExternalUrl } from '@/lib/public-urls';

export type SupervisorCard = {
  id: number;
  name: string;
  slug: string;
  title: string;
  college: string;
  major: string;
  personal_website: string | null;
};

export default function SupervisorDirectory({ supervisors }: { supervisors: SupervisorCard[] }) {
  const grouped = new Map<string, Map<string, SupervisorCard[]>>();
  for (const supervisor of supervisors) {
    const college = supervisor.college || '其他';
    const major = supervisor.major || '其他';
    if (!grouped.has(college)) grouped.set(college, new Map());
    const majors = grouped.get(college)!;
    if (!majors.has(major)) majors.set(major, []);
    majors.get(major)!.push(supervisor);
  }

  if (!grouped.size) return <div className="text-gray-500">暂无导师数据</div>;

  return <div className="space-y-8">{Array.from(grouped, ([college, majors]) => (
    <div key={college}>
      <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-600">{college}</h2>
      {Array.from(majors, ([major, items]) => (
        <div key={major} className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">{major}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((supervisor) => {
              const external = safeExternalUrl(supervisor.personal_website);
              return <Link
                key={supervisor.id}
                href={external || `/faculty/supervisor/${encodeURIComponent(supervisor.slug)}`}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                className="group p-4 bg-gray-50 rounded-lg hover:bg-blue-50 hover:shadow-md transition-all duration-300"
              >
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{supervisor.name}</div>
                  <div className="text-sm text-gray-500 mt-1">{supervisor.title}</div>
                </div>
              </Link>;
            })}
          </div>
        </div>
      ))}
    </div>
  ))}</div>;
}
