import { NextRequest, NextResponse } from 'next/server';

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337').replace(/\/$/, '');

async function forward(method: 'GET' | 'POST', params: Promise<{ slug: string }>) {
  const { slug } = await params;
  if (!slug || slug.length > 180 || slug.includes('/')) {
    return NextResponse.json({ error: '无效的文章链接' }, { status: 400 });
  }
  try {
    const response = await fetch(`${API}/api/article-views/${encodeURIComponent(slug)}`, {
      method,
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      return NextResponse.json({ error: response.status === 404 ? '文章不存在' : '读取点击数失败' }, {
        status: response.status === 404 ? 404 : 502,
      });
    }
    const result = await response.json();
    return NextResponse.json({ data: { view_count: Number(result?.data?.view_count) || 0 } }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json({ error: '点击数服务暂不可用' }, { status: 502 });
  }
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  return forward('GET', params);
}

export async function POST(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  return forward('POST', params);
}
