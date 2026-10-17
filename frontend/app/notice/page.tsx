import type { Metadata } from 'next';
import { buildPagedMetadata } from '@/lib/seo/metadata';
import { getNoticePageList, type ListArticleItem } from '@/lib/api';
import { PAGE_SIZE } from '@/lib/constants';
import EditorialListing from '@/components/list/EditorialListing';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const sp = await searchParams;
  return buildPagedMetadata({
    title: '通知公告 - 国家卓越工程师学院',
    description: '国家卓越工程师学院通知公告栏目，发布学院通知、公告与相关信息。',
    basePath: '/notice',
    page: sp?.page,
  });
}

export default async function NoticePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const currentPage = Math.max(1, Number(sp?.page || '1') || 1);
  const resp = await getNoticePageList(currentPage, PAGE_SIZE.NOTICE);
  const items: ListArticleItem[] = resp.data || [];
  const total = resp.meta?.pagination?.total || 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE.NOTICE));
  return <EditorialListing title="通知公告" path="/notice" from="notice" items={items} page={Math.min(currentPage, pageCount)} pageCount={pageCount} total={total} />;
}
