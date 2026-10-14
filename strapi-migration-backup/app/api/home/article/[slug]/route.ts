import { NextResponse } from "next/server";
import pool from '@/lib/db';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const sql = `
      SELECT a.id, a.title, a.subtitle, a.slug, a.summary, a.content_html,
             a.publish_time, a.source, a.author_name, a.view_count,
             c.name AS category_name, c.slug AS category_slug
      FROM articles a
      JOIN categories c ON c.id = a.category_id
      WHERE a.slug = $1 AND a.status = 'published'
      LIMIT 1
    `;
    const { rows } = await pool.query(sql, [slug]);

    if (!rows.length) {
      return NextResponse.json({ code: 404, message: "not found" }, { status: 404 });
    }

    await pool.query(`UPDATE articles SET view_count = view_count + 1 WHERE id = $1`, [rows[0].id]);

    return NextResponse.json({ code: 0, data: rows[0] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ code: 500, message: "article api error" }, { status: 500 });
  }
}
