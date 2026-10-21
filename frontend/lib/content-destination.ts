import { safeExternalUrl } from './public-urls';
import type { StrapiMedia } from './strapi-content';

export type LinkedContent = {
  redirect_url?: string | null;
  content?: string | null;
  description?: string | null;
  attachments?: StrapiMedia[] | null;
  file?: StrapiMedia | null;
};

export function hasMeaningfulContent(content: string | null | undefined): boolean {
  if (!content) return false;
  if (/<(?:img|video|iframe|table|hr)\b/i.test(content)) return true;
  return content.replace(/<[^>]*>/g, '').replace(/&(?:nbsp|#160|#x[aA]0);|\u00a0/gi, ' ').trim().length > 0;
}

export function contentDownloadHref(resource: 'student-documents' | 'policy-documents' | 'download-files', documentId: string, file: StrapiMedia): string {
  return `/api/content-downloads/${resource}/${encodeURIComponent(documentId)}/${encodeURIComponent(String(file.documentId || file.id))}`;
}

export function contentDestination(
  resource: 'student-documents' | 'policy-documents' | 'download-files',
  item: LinkedContent & { documentId: string; slug?: string | null },
): { href: string; kind: 'external' | 'download' | 'detail' } {
  const external = safeExternalUrl(item.redirect_url);
  if (external) return { href: external, kind: 'external' };
  const body = resource === 'download-files' ? item.description : item.content;
  const attachment = resource === 'download-files' ? item.file : item.attachments?.[0];
  if (!hasMeaningfulContent(body) && attachment && item.documentId) {
    return { href: contentDownloadHref(resource, item.documentId, attachment), kind: 'download' };
  }
  const href = resource === 'student-documents' ? `/students/document/${encodeURIComponent(item.slug || '')}`
    : resource === 'policy-documents' ? `/documents/policies/${encodeURIComponent(item.slug || '')}`
    : `/documents/downloads/${encodeURIComponent(item.documentId)}`;
  return { href, kind: 'detail' };
}
