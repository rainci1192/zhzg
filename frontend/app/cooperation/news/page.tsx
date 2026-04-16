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
    title: '合作动态 - 国家卓越工程师学院',
    description: '国家卓越工程师学院合作动态栏目，发布校企合作相关资讯与进展。',
    basePath: '/cooperation/news',
    page: sp?.page,
  });
}

export default async function CooperationNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;

  return (
    <SecondaryCategoryListPage
      searchParams={sp}
      pageTitle="合作动态"
      emptyText="暂无合作动态"
      primaryCategoryName="学院新闻" // ✅ 传入一级分类，配合 api.ts 实现联合过滤
      secondaryCategoryName="合作动态"
      articleFrom="cooperation"
      sidebarTitle="校企合作"
      sidebarItems={[
        { name: '合作动态', href: '/cooperation/news' },
        { name: '合作单位', href: '/cooperation/partners' },
      ]}
      breadcrumbItems={[
        { name: '首页', href: '/' },
        { name: '校企合作', href: '/cooperation/news' },
        { name: '合作动态', href: '/cooperation/news' },
      ]}
      listPath="/cooperation/news"
      pageSize={PAGE_SIZE.COOPERATION_NEWS}
    />
  );
}
