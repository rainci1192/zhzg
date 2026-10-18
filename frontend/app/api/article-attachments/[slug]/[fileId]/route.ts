import { NextResponse } from 'next/server';

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337').replace(/\/$/, '');

type MediaFile = {
  id?: number;
  documentId?: string;
  name?: string;
  url?: string;
};

function mediaItems(value: unknown): MediaFile[] {
  if (Array.isArray(value)) return value as MediaFile[];
  if (value && typeof value === 'object' && 'data' in value) {
    const data = (value as { data?: unknown }).data;
    if (Array.isArray(data)) return data as MediaFile[];
    if (data && typeof data === 'object') return [data as MediaFile];
  }
  return [];
}

function encodeFilename(name: string) {
  const safeFallback = name.replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_').replace(/[. ]+$/g, '').slice(0, 150) || 'article-attachment';
  const encoded = encodeURIComponent(name).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
  return `attachment; filename="${safeFallback.replace(/"/g, '_')}"; filename*=UTF-8''${encoded}`;
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string; fileId: string }> }) {
  const { slug, fileId } = await params;
  if (!slug || slug.length > 180 || slug.includes('/') || !fileId || fileId.length > 128) {
    return NextResponse.json({ error: '无效的附件链接' }, { status: 400 });
  }

  try {
    const query = new URLSearchParams({
      'filters[slug][$eq]': slug,
      'filters[review_status][$eq]': 'published',
      status: 'published',
      'populate[0]': 'attachments',
      'pagination[pageSize]': '1',
    });
    const articleResponse = await fetch(`${API}/api/articles?${query}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (!articleResponse.ok) return NextResponse.json({ error: '无法读取文章附件' }, { status: 502 });
    const articleResult = await articleResponse.json();
    const article = articleResult?.data?.[0];
    if (!article) return NextResponse.json({ error: '文章不存在' }, { status: 404 });

    const file = mediaItems(article.attachments).find((item) =>
      String(item.documentId || item.id || '') === fileId
    );
    if (!file?.url) return NextResponse.json({ error: '该附件不属于此已发布文章' }, { status: 404 });

    const fileUrl = new URL(file.url, API);
    if (fileUrl.origin !== new URL(API).origin) {
      return NextResponse.json({ error: '不支持此附件存储地址' }, { status: 502 });
    }
    const fileResponse = await fetch(fileUrl, { cache: 'no-store' });
    if (!fileResponse.ok || !fileResponse.body) {
      return NextResponse.json({ error: '附件文件暂不可用' }, { status: 502 });
    }

    const headers = new Headers({
      'Content-Type': fileResponse.headers.get('content-type') || 'application/octet-stream',
      'Content-Disposition': encodeFilename(file.name || 'article-attachment'),
      'Cache-Control': 'public, max-age=300',
      'X-Content-Type-Options': 'nosniff',
    });
    const contentLength = fileResponse.headers.get('content-length');
    if (contentLength) headers.set('Content-Length', contentLength);
    return new Response(fileResponse.body, { status: 200, headers });
  } catch {
    return NextResponse.json({ error: '附件下载服务暂不可用' }, { status: 502 });
  }
}
