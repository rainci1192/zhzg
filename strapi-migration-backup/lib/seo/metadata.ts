import type { Metadata } from 'next';

type BuildPagedMetadataOptions = {
  title: string;
  description: string;
  page?: string;
  basePath: string; // 必填，统一生成 canonical
};

export function buildPagedMetadata({
  title,
  description,
  page,
  basePath,
}: BuildPagedMetadataOptions): Metadata {
  const currentPage = Math.max(1, Number(page || '1') || 1);
  const siteUrl = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000';

  const canonical =
    currentPage > 1
      ? `${siteUrl}${basePath}?page=${currentPage}`
      : `${siteUrl}${basePath}`;

  return {
    title,
    description,
    alternates: { canonical },
    robots:
      currentPage > 1
        ? { index: false, follow: true }
        : { index: true, follow: true },
  };
}
