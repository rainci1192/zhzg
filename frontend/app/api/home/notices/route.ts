import { NextResponse } from "next/server";
import pool from '@/lib/db';

export async function GET() {
  try {
    const sql = `
      SELECT a.id, a.title, a.slug, a.publish_time
      FROM articles a
      JOIN categories c ON a.category_id = c.id
      WHERE a.status = 'published' AND c.slug = 'notice'
      ORDER BY a.is_top DESC, a.publish_time DESC NULLS LAST, a.id DESC
      LIMIT 8
    `;
    const { rows } = await pool.query(sql);
    return NextResponse.json({ code: 0, data: rows });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ code: 500, message: "notice api error" }, { status: 500 });
  }
}
