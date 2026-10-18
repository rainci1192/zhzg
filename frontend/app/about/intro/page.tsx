import { sanitizeRichHtml } from '@/lib/sanitize-html';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import AboutSingleLayout from '@/components/about/AboutSingleLayout';
import { resolveMediaUrl } from '@/lib/public-urls';

export const dynamic = 'force-dynamic';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

interface PageData {
  id: number;
  slug: string;
  title: string;
  subtitle?: string;
  content?: string;
  publish_status: 'draft' | 'published';
  cover?: { url?: string } | null;
}

interface PagesResp {
  data?: PageData[];
}

async function getPageBySlug(slug: string): Promise<PageData | null> {
  const qs = new URLSearchParams({
    'filters[slug][$eq]': slug,
    'filters[publish_status][$eq]': 'published',
    'status': 'published',
    'populate[0]': 'cover',
  }).toString();

  try {
    const res = await fetch(`${API}/api/pages?${qs}`, {
      next: { revalidate: 30 },
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) return null;

    const json = (await res.json()) as PagesResp;
    const item = json?.data?.[0];
    if (!item) return null;

    return {
      id: item.id,
      slug: item.slug || '',
      title: item.title || '',
      subtitle: item.subtitle || '',
      content: item.content || '',
      publish_status: item.publish_status,
      cover: item.cover || null,
    };
  } catch (error) {
    console.error('getPageBySlug error:', error);
    return null;
  }
}

export default async function AboutIntro() {
  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '学院概况', href: '/about/intro' },
    { name: '学院简介', href: '/about/intro' },
  ];

  const page = await getPageBySlug('about-intro');
  if (!page) notFound();

  const coverImage = resolveMediaUrl(page.cover?.url);

  return (
    <AboutSingleLayout
      pageTitle="学院简介"
      sectionTitle={page.title || '学院简介'}
      breadcrumbItems={breadcrumbItems}
    >
      {page.subtitle && (
        <p className="text-xl text-gray-600 mb-6">{page.subtitle}</p>
      )}

      <div
        className="article-content max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(page.content || '') }}
      />

      {coverImage && (
        <div className="mt-10 relative w-full rounded-lg overflow-hidden shadow-md">
          <Image
            src={coverImage}
            alt={page.title || '学院简介图片'}
            width={1200}
            height={600}
            className="w-full h-auto"
            priority
          />
        </div>
      )}
    </AboutSingleLayout>
  );
}
