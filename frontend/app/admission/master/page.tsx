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
    title: '工程硕士 - 国家卓越工程师学院',
    description: '国家卓越工程师学院工程硕士招生信息栏目，发布招生政策、通知与培养动态。',
    basePath: '/admission/master',
    page: sp?.page,
  });
}

export default async function AdmissionMaster({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;

  return (
    <SecondaryCategoryListPage
      searchParams={sp}
      pageTitle="工程硕士"
      emptyText="暂无工程硕士招生信息"
      secondaryCategoryName="工程硕士"
      sidebarTitle="招生信息"
      sidebarItems={[
        { name: '工程硕士', href: '/admission/master' },
        { name: '工程博士', href: '/admission/doctor' },
      ]}
      breadcrumbItems={[
        { name: '首页', href: '/' },
        { name: '招生信息', href: '/admission/master' },
        { name: '工程硕士', href: '/admission/master' },
      ]}
      listPath="/admission/master"
      pageSize={PAGE_SIZE.ADMISSION_MASTER}
    />
  );
}
