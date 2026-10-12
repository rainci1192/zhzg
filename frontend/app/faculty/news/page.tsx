import type { Metadata } from 'next';
import SecondaryCategoryListPage from '@/components/list/SecondaryCategoryListPage';

export const metadata: Metadata = {
  title: '师资动态 - 吉林大学国家卓越工程师学院(珠海)',
  description: '学院师资队伍动态信息',
};

export default async function FacultyNews({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return (
    <SecondaryCategoryListPage
      searchParams={await searchParams}
      pageTitle="师资动态"
      emptyText="暂无师资动态"
      secondaryCategoryName="师资动态"
      sidebarTitle="师资队伍"
      sidebarItems={[
        { name: '师资动态', href: '/faculty/news' },
        { name: '校内培养导师', href: '/faculty/internal' },
        { name: '企业培养导师', href: '/faculty/enterprise' },
      ]}
      breadcrumbItems={[
        { name: '首页', href: '/' },
        { name: '师资队伍', href: '/faculty/internal' },
        { name: '师资动态', href: '/faculty/news' },
      ]}
      listPath="/faculty/news"
      pageSize={5}
    />
  );
}