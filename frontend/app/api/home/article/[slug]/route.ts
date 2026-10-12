import { NextResponse } from "next/server";
import { getArticleBySlug } from '@/lib/api';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const result = await getArticleBySlug(slug);
    if (!result.data) {
      return NextResponse.json({ code: 404, message: "not found" }, { status: 404 });
    }
    return NextResponse.json({
      code: 0,
      data: { ...result.data, content_html: result.data.content || '' },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ code: 502, message: "Strapi 服务暂不可用" }, { status: 502 });
  }
}
