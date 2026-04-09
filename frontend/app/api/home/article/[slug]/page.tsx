// app/article/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { Pool } from 'pg';
import pool from '@/lib/db';




export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  // 🔥 Next.js 15 必须 await（已修复）
  const { slug } = await params;

  try {
    const result = await pool.query(`
      SELECT 
        id, title, subtitle, summary, content_html, 
        publish_time, cover_image_url, images, author_name, source
      FROM articles 
      WHERE slug = $1 AND status = 'published'
      LIMIT 1
    `, [slug]);

    if (result.rows.length === 0) {
      notFound();
    }

    const article = result.rows[0];

    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
        <div className="flex gap-4 text-sm text-gray-500 mb-8">
          <span>{new Date(article.publish_time).toLocaleDateString('zh-CN')}</span>
          {article.author_name && <span>作者：{article.author_name}</span>}
        </div>
        
        {/* 图片展示（优先使用 images 第1张） */}
        {(article.images && article.images.length > 0 ? article.images[0] : article.cover_image_url) && (
          <img 
            src={article.images && article.images.length > 0 ? article.images[0] : article.cover_image_url} 
            alt={article.title}
            className="w-full rounded-xl mb-8 object-cover"
          />
        )}
        
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: article.content_html || '' }}
        />
      </div>
    );
  } catch (error) {
    console.error('详情页错误:', error);
    notFound();
  }
}
