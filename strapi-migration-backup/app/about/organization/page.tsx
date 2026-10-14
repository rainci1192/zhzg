import AboutSingleLayout from '@/components/about/AboutSingleLayout';
import { getActiveDepartments } from '@/lib/api';

export default async function AboutOrganization() {
  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '学院概况', href: '/about/intro' },
    { name: '机构设置', href: '/about/organization' },
  ];

  const departments = await getActiveDepartments();

  return (
    <AboutSingleLayout
      pageTitle="机构设置"
      sectionTitle="机构设置"
      breadcrumbItems={breadcrumbItems}
    >
      {departments.length === 0 ? (
        <div className="text-gray-500">暂无机构设置信息</div>
      ) : (
        <div className="grid gap-6">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-gradient-to-r from-blue-50 to-white rounded-lg p-6 border-l-4 border-blue-600 hover:shadow-lg transition-all duration-300"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-3">{dept.name}</h3>
              <p className="text-gray-600">{dept.description || '暂无描述'}</p>
            </div>
          ))}
        </div>
      )}
    </AboutSingleLayout>
  );
}
