import type { Metadata } from 'next';
import SecondaryCategoryListPage from '@/components/list/SecondaryCategoryListPage';
import { PAGE_SIZE } from '@/lib/constants';
import { buildPagedMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const sp = await searchParams;
  return buildPagedMetadata({
    title: '学生活动 - 国家卓越工程师学院',
    description: '国家卓越工程师学院学生活动栏目，展示学生实践、竞赛、讲座及校园活动。',
    basePath: '/students/activities',
    page: sp?.page,
  });
}

export default async function StudentsActivities({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;

  return (
    <SecondaryCategoryListPage
      searchParams={sp}
      pageTitle="学生活动"
      emptyText="暂无学生活动"
      secondaryCategoryName="学生活动"
      articleFrom="activities"
      sidebarTitle="学生工作"
      sidebarItems={[
        { name: '学生管理', href: '/students/management' },
        { name: '学生活动', href: '/students/activities' },
        { name: '学生风采', href: '/students/showcase' },
      ]}
      breadcrumbItems={[
        { name: '首页', href: '/' },
        { name: '学生工作', href: '/students/management' },
        { name: '学生活动', href: '/students/activities' },
      ]}
      listPath="/students/activities"
      pageSize={PAGE_SIZE.STUDENT_ACTIVITIES}
    />
  );
}
