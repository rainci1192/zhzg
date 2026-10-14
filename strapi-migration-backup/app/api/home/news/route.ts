// app/api/home/news/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(
      `
      SELECT
        a.id,
        a.title,
        a.slug,
        a.summary,
        a.publish_time,
        a.cover_image_url,
        a.images,
        c.name AS category_name,
        c.slug AS category_slug
      FROM articles a
      JOIN categories c ON c.id = a.category_id
      WHERE a.status = 'published'
        AND c.slug IN ('news', 'research-news')
      ORDER BY a.is_top DESC, a.publish_time DESC NULLS LAST, a.id DESC
      LIMIT 5
      `
    );

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error('获取新闻失败:', error?.message || error);
    return NextResponse.json(
      { success: false, error: '数据库连接失败' },
      { status: 500 }
    );
  }
}
