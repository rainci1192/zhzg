import { NextResponse } from 'next/server';
import { getHomeNews } from '@/lib/api';

export async function GET() {
  try {
    const result = await getHomeNews();
    return NextResponse.json({ success: true, data: result.data.slice(0, 5) });
  } catch (error) {
    console.error('获取新闻失败:', error);
    return NextResponse.json(
      { success: false, error: 'Strapi 服务暂不可用' },
      { status: 502 }
    );
  }
}
