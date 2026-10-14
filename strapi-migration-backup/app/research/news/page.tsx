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
    title: '科研动态 - 国家卓越工程师学院',
    description: '国家卓越工程师学院科研动态栏目，展示最新科研进展、学术活动与研究成果。',
    basePath: '/research/news',
    page: sp?.page,
  });
}

export default async function ResearchNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;

  return (
    <SecondaryCategoryListPage
      searchParams={sp}
      pageTitle="科研动态"
      emptyText="暂无科研动态"
      secondaryCategoryName="科研动态"
      articleFrom="research"
      sidebarTitle="科学研究"
      sidebarItems={[
        { name: '科研机构', href: '/research/institutions' },
        { name: '科研动态', href: '/research/news' },
        { name: '成果转化', href: '/research/transfer' },
      ]}
      breadcrumbItems={[
        { name: '首页', href: '/' },
        { name: '科学研究', href: '/research/institutions' },
        { name: '科研动态', href: '/research/news' },
      ]}
      listPath="/research/news"
      pageSize={PAGE_SIZE.RESEARCH_NEWS}
    />
  );
}
