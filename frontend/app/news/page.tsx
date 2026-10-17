import type { Metadata } from 'next';
import { buildPagedMetadata } from '@/lib/seo/metadata';
import { getNewsPageList, type ListArticleItem } from '@/lib/api';
import { PAGE_SIZE } from '@/lib/constants';
import EditorialListing from '@/components/list/EditorialListing';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const sp = await searchParams;
  return buildPagedMetadata({
    title: '新闻动态 - 国家卓越工程师学院',
    description: '国家卓越工程师学院新闻动态栏目，发布学院新闻、活动与重要资讯。',
    basePath: '/news',
    page: sp?.page,
  });
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const currentPage = Math.max(1, Number(sp?.page || '1') || 1);
  const resp = await getNewsPageList(currentPage, PAGE_SIZE.NEWS);
  const items: ListArticleItem[] = resp.data || [];
  const total = resp.meta?.pagination?.total || 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE.NEWS));
  return <EditorialListing title="新闻动态" path="/news" from="news" items={items} page={Math.min(currentPage, pageCount)} pageCount={pageCount} total={total} />;
}
