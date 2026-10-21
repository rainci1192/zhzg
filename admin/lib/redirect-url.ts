/** Accept only absolute web URLs for public content redirects. */
export function normalizeRedirectUrl(value: string): string | null {
  const raw = value.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return (url.protocol === 'http:' || url.protocol === 'https:') && !url.username && !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}
