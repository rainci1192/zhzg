import { notFound } from 'next/navigation';
import pool from '@/lib/db';
import AboutSingleLayout from '@/components/about/AboutSingleLayout';

export default async function AboutIntro() {
  const breadcrumbItems = [
    { name: '首页', href: '/' },
    { name: '学院概况', href: '/about/intro' },
    { name: '学院简介', href: '/about/intro' },
  ];

  // 按栏目 slug=about-intro 查询最新已发布文章
  const catRes = await pool.query(
    `SELECT id FROM categories WHERE slug = $1 LIMIT 1`,
    ['about-intro']
  );
  if (catRes.rows.length === 0) notFound();

  const categoryId = catRes.rows[0].id;

  const articleRes = await pool.query(
    `
    SELECT id, title, subtitle, content_html, cover_image_url, images
    FROM articles
    WHERE category_id = $1 AND status = 'published'
    ORDER BY publish_time DESC NULLS LAST, id DESC
    LIMIT 1
    `,
    [categoryId]
  );

  if (articleRes.rows.length === 0) notFound();

  const article = articleRes.rows[0];
  const coverImage =
    (article.images && article.images.length > 0 ? article.images[0] : article.cover_image_url) || null;

  return (
    <AboutSingleLayout
      pageTitle="学院简介"
      sectionTitle={article.title || '学院简介'}
      breadcrumbItems={breadcrumbItems}
    >
      {article.subtitle && (
        <p className="text-xl text-gray-600 mb-6">{article.subtitle}</p>
      )}

      <div
        className="prose prose-gray max-w-none text-[21px] leading-10 md:text-[22px] md:leading-[2.2]"
        dangerouslySetInnerHTML={{ __html: article.content_html || '' }}
      />

      {coverImage && (
        <div className="mt-10">
          <img
            src={coverImage}
            alt={article.title || '学院简介图片'}
            className="w-full rounded-lg shadow-md"
          />
        </div>
      )}
    </AboutSingleLayout>
  );
}
