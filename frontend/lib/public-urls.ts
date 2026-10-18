/** URLs from Strapi are untrusted content, even when the record is published. */
const STRAPI_ORIGIN = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

function httpUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
    return url;
  } catch {
    return null;
  }
}

export function safeExternalUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const url = httpUrl(value.trim());
  return url?.href || null;
}

export function safeBannerHref(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const link = value.trim();
  if (link.startsWith('/') && !link.startsWith('//') && !/[\\\u0000-\u001f]/.test(link)) {
    const parsed = new URL(link, 'https://example.invalid');
    if (parsed.origin === 'https://example.invalid') return parsed.pathname + parsed.search + parsed.hash;
  }
  return safeExternalUrl(link);
}

export function resolveMediaUrl(value: unknown, allowLocalAsset = false): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const raw = value.trim();
  if (allowLocalAsset && /^\/images\/[a-zA-Z0-9_./-]+$/.test(raw) && !raw.includes('..')) return raw;
  const base = httpUrl(STRAPI_ORIGIN);
  if (!base) return null;
  const extra = (process.env.NEXT_PUBLIC_MEDIA_ORIGINS || '').split(',').map((entry) => httpUrl(entry.trim())?.origin).filter(Boolean);
  const allowedOrigins = new Set([base.origin, ...extra]);
  try {
    const url = new URL(raw, base.href + '/');
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password && allowedOrigins.has(url.origin)
      ? url.href
      : null;
  } catch {
    return null;
  }
}
