// app/article/[slug]/page.tsx
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import pool from '@/lib/db';

export default async function ArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const from = sp?.from; // 'news' | 'research' | undefined

  try {
    // 1. 查询当前文章（含分类）
    const articleResult = await pool.query(
      `
      SELECT 
        a.id, a.title, a.subtitle, a.summary, a.content_html, a.publish_time, 
        a.cover_image_url, a.images, a.author_name, a.source, a.view_count, a.category_id,
        c.name AS category_name,
        c.slug AS category_slug
      FROM articles a
      LEFT JOIN categories c ON c.id = a.category_id
      WHERE a.slug = $1 AND a.status = 'published'
      LIMIT 1
      `,
      [slug]
    );

    if (articleResult.rows.length === 0) notFound();
    const article = articleResult.rows[0];

    // 2. 来源优先决定：面包屑 + 上下篇联动范围
    let listHref = '/news';
    let listName = '新闻动态';
    let linkedCategorySlugs: string[] = ['news', 'research-news'];

    if (from === 'research') {
      // 来自“科研动态”
      listHref = '/research/news';
      listName = '科研动态';
      linkedCategorySlugs = ['research-news'];
    } else if (from === 'news') {
      // 来自“新闻动态”（新闻动态包含科研动态）
      listHref = '/news';
      listName = '新闻动态';
      linkedCategorySlugs = ['news', 'research-news'];
    }else if (from === 'transfer') {
      listHref = '/research/transfer';
      listName = '成果转化';
      linkedCategorySlugs = ['research-transfer'];
    } else if (from === 'activities') {
      listHref = '/students/activities';
      listName = '学生活动';
      linkedCategorySlugs = ['student-activities'];
    }else if (from === 'notice') {
      listHref = '/notice';
      listName = '通知公告';
    }else {
      // 无 from 参数时兜底：按文章实际分类
      const isResearchNews = article.category_slug === 'research-news';
      listHref = isResearchNews ? '/research/news' : '/news';
      listName = isResearchNews ? '科研动态' : '新闻动态';
      linkedCategorySlugs = isResearchNews ? ['research-news'] : ['news', 'research-news'];
    }

    // 3. 查询上一篇（按联动范围）
    const prevResult = await pool.query(
      `
      SELECT a.slug, a.title
      FROM articles a
      JOIN categories c ON c.id = a.category_id
      WHERE a.status = 'published'
        AND c.slug = ANY($1::text[])
        AND a.publish_time < $2
        AND a.id != $3
      ORDER BY a.publish_time DESC, a.id DESC
      LIMIT 1
      `,
      [linkedCategorySlugs, article.publish_time, article.id]
    );

    // 4. 查询下一篇（按联动范围）
    const nextResult = await pool.query(
      `
      SELECT a.slug, a.title
      FROM articles a
      JOIN categories c ON c.id = a.category_id
      WHERE a.status = 'published'
        AND c.slug = ANY($1::text[])
        AND a.publish_time > $2
        AND a.id != $3
      ORDER BY a.publish_time ASC, a.id ASC
      LIMIT 1
      `,
      [linkedCategorySlugs, article.publish_time, article.id]
    );

    const prevArticle = prevResult.rows[0] || null;
    const nextArticle = nextResult.rows[0] || null;

    const coverImage =
      (article.images && article.images.length > 0
        ? article.images[0]
        : article.cover_image_url) || null;

    const fromQuery = from ? `?from=${from}` : '';

    return (
      <>
        <Header />

        {/* 面包屑 */}
        <div className="bg-gray-100 py-3">
          <div className="max-w-5xl mx-auto px-6">
            <nav className="flex text-sm text-gray-600">
              <a href="/" className="hover:text-blue-600">首页</a>
              <span className="mx-2">›</span>
              <a href={listHref} className="hover:text-blue-600">{listName}</a>
              <span className="mx-2">›</span>
              <span className="text-blue-600 line-clamp-1">{article.title}</span>
            </nav>
          </div>
        </div>

        {/* 主内容 */}
        <div className="max-w-5xl mx-auto px-6 py-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 leading-tight">
            {article.title}
          </h1>

          {article.subtitle && (
            <p className="text-2xl text-gray-600 mb-6">{article.subtitle}</p>
          )}

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-base text-gray-500 mb-8 border-b pb-6">
            <span>
              {article.publish_time
                ? new Date(article.publish_time).toLocaleDateString('zh-CN')
                : '--'}
            </span>
            {article.author_name && <span>作者：{article.author_name}</span>}
            {article.source && <span>来源：{article.source}</span>}
            <span>浏览量：{article.view_count || 0}</span>
          </div>

          <div
            className="prose prose-gray max-w-none text-xl leading-9 md:text-[22px] md:leading-10"
            dangerouslySetInnerHTML={{ __html: article.content_html || '' }}
          />

          {coverImage && (
            <img
              src={coverImage}
              alt={article.title}
              className="w-full rounded-xl mt-10 object-cover shadow-md"
            />
          )}
        </div>

        {/* 上一条 / 下一条（保留 from 参数） */}
        <div className="w-full border-t border-gray-200 bg-white py-12">
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-stretch gap-8 text-base">
              {prevArticle ? (
                <a
                  href={`/article/${prevArticle.slug}${fromQuery}`}
                  className="group flex-1 flex items-start gap-5 p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/80 transition-all shadow-sm"
                >
                  <div className="text-4xl text-blue-500 font-light leading-none mt-0.5">←</div>
                  <div className="flex-1">
                    <span className="text-blue-600 text-sm font-medium tracking-widest">上一条</span>
                    <p className="mt-2 text-lg font-medium text-gray-800 group-hover:text-blue-700 line-clamp-2 leading-snug">
                      {prevArticle.title}
                    </p>
                  </div>
                </a>
              ) : (
                <div className="flex-1 p-6 text-gray-400 text-base">没有更多了</div>
              )}

              {nextArticle ? (
                <a
                  href={`/article/${nextArticle.slug}${fromQuery}`}
                  className="group flex-1 flex items-start gap-5 p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/80 transition-all shadow-sm text-right"
                >
                  <div className="flex-1">
                    <span className="text-blue-600 text-sm font-medium tracking-widest">下一条</span>
                    <p className="mt-2 text-lg font-medium text-gray-800 group-hover:text-blue-700 line-clamp-2 leading-snug">
                      {nextArticle.title}
                    </p>
                  </div>
                  <div className="text-4xl text-blue-500 font-light leading-none mt-0.5">→</div>
                </a>
              ) : (
                <div className="flex-1 p-6 text-gray-400 text-base text-right">没有更多了</div>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </>
    );
  } catch (error) {
    console.error('详情页错误:', error);
    notFound();
  }
}
