import { NextResponse } from 'next/server';
import { getContentByDocumentId, mediaUrl, type StrapiMedia } from '@/lib/strapi-content';

type Resource = 'student-documents' | 'policy-documents' | 'download-files';
type Item = { documentId: string; attachments?: StrapiMedia[] | null; file?: StrapiMedia | null };

function disposition(name: string): string {
  const fallback = name.replace(/[^\x20-\x7e]/g, '_').replace(/[\\/:*?"<>|]/g, '_').slice(0, 120) || 'download';
  const encoded = encodeURIComponent(name).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
  return `attachment; filename="${fallback}"; filename*=UTF-8''${encoded}`;
}

export async function GET(_request: Request, { params }: { params: Promise<{ resource: string; documentId: string; fileId: string }> }) {
  const { resource, documentId, fileId } = await params;
  if (!['student-documents', 'policy-documents', 'download-files'].includes(resource)
    || !/^[a-zA-Z0-9]{1,64}$/.test(documentId) || !/^[a-zA-Z0-9]{1,128}$/.test(fileId)) {
    return NextResponse.json({ error: '无效的附件链接' }, { status: 400 });
  }

  try {
    // Only public, active, published entries can expose a file. Check the
    // attachment relation before fetching the media so IDs cannot be guessed.
    const type = resource as Resource;
    const item = await getContentByDocumentId<Item>(type, documentId);
    if (!item || item.documentId !== documentId) return NextResponse.json({ error: '资料不存在' }, { status: 404 });
    const attachments = type === 'download-files' ? [item.file] : item.attachments || [];
    const file = attachments.find((media) => media && String(media.documentId || media.id) === fileId);
    const url = mediaUrl(file);
    if (!file || !url) return NextResponse.json({ error: '附件不存在' }, { status: 404 });
    const response = await fetch(url, { cache: 'no-store', redirect: 'error' });
    if (!response.ok || !response.body) return NextResponse.json({ error: '附件文件暂不可用' }, { status: 502 });
    const headers = new Headers({
      'Content-Type': response.headers.get('content-type') || 'application/octet-stream',
      'Content-Disposition': disposition(file.name || 'download'),
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    if (response.headers.get('content-length')) headers.set('Content-Length', response.headers.get('content-length')!);
    return new Response(response.body, { headers });
  } catch (error) {
    console.error('[content-downloads] Download failed', { resource, documentId, message: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: '附件下载服务暂不可用' }, { status: 502 });
  }
}
