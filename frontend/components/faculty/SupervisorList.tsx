import Link from 'next/link';
import { GroupedSupervisors } from '@/lib/api';

interface SupervisorListProps {
  grouped: GroupedSupervisors;
}

export default function SupervisorList({ grouped }: SupervisorListProps) {
  if (Object.keys(grouped).length === 0) {
    return <div className="text-gray-500">暂无导师数据</div>;
  }

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([college, majors]) => (
        <div key={college}>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-600">
            {college}
          </h2>
          {Object.entries(majors).map(([major, sups]) => (
            <div key={major} className="mb-6">
              <h3 className="text-xl font-semibold text-gray-700 mb-3">{major}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sups.map((sup) => (
                  <Link
                    key={sup.id}
                    href={
                      sup.personal_website
                        ? sup.personal_website
                        : `/faculty/supervisor/${sup.slug}`
                    }
                    target={sup.personal_website ? '_blank' : '_self'}
                    rel={sup.personal_website ? 'noopener noreferrer' : undefined}
                    className="group p-4 bg-gray-50 rounded-lg hover:bg-blue-50 hover:shadow-md transition-all duration-300"
                  >
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {sup.name}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{sup.title}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
