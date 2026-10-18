import 'server-only';
import { resolveMediaUrl } from './public-urls';

// The public website reads Strapi 5 content types only. A server-side token is
// optional when the relevant Public role has find and findOne permissions.
const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337').replace(/\/$/, '');

export type ContentResource =
  | 'leaders'
  | 'departments'
  | 'supervisors'
  | 'research-institutions'
  | 'student-documents'
  | 'student-showcases'
  | 'policy-documents'
  | 'download-files'
  | 'research-transfers';

const mediaField: Partial<Record<ContentResource, string>> = {
  supervisors: 'photo',
  'research-institutions': 'cover_image',
  'student-documents': 'attachments',
  'student-showcases': 'image',
  'policy-documents': 'attachments',
  'download-files': 'file',
  'research-transfers': 'attachments',
};

export type StrapiMedia = {
  id: number;
  name: string;
  url: string;
  size?: number; // Strapi media sizes are in KB.
};

export type ContentPage<T> = {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
};

function query(resource: ContentResource, category?: 'internal' | 'enterprise') {
  const params = new URLSearchParams({
    status: 'published',
    'filters[is_active][$eq]': 'true',
    'sort[0]': 'sort_order:asc',
    'sort[1]': 'id:asc',
  });
  if (mediaField[resource]) params.set('populate', mediaField[resource]);
  if (category) {
    if (resource !== 'supervisors') throw new Error('Only supervisors have a category');
    params.set('filters[category][$eq]', category);
  }
  return params;
}

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      ...(process.env.STRAPI_READ_TOKEN
        ? { Authorization: `Bearer ${process.env.STRAPI_READ_TOKEN}` }
        : {}),
    },
  });
  if (!response.ok) {
    throw new Error(`Strapi GET ${path} failed (${response.status}); check content type and read permissions`);
  }
  return response.json() as Promise<T>;
}

function positiveInteger(value: number, fallback: number, maximum: number) {
  return Number.isSafeInteger(value) && value > 0 ? Math.min(value, maximum) : fallback;
}

export async function getContentPage<T>(
  resource: ContentResource,
  page = 1,
  pageSize = 10,
  category?: 'internal' | 'enterprise'
): Promise<ContentPage<T>> {
  const params = query(resource, category);
  const requestedPage = positiveInteger(page, 1, 1000000);
  params.set('pagination[page]', String(requestedPage));
  params.set('pagination[pageSize]', String(positiveInteger(pageSize, 10, 100)));
  const fetchPage = () => request<ContentPage<T>>(`/api/${resource}?${params}`);
  let result = await fetchPage();
  if (!result.meta?.pagination || !Array.isArray(result.data)) {
    throw new Error(`Unexpected Strapi response for ${resource}`);
  }
  const lastPage = Math.max(1, result.meta.pagination.pageCount);
  if (requestedPage > lastPage) {
    params.set('pagination[page]', String(lastPage));
    result = await fetchPage();
  }
  return result;
}

export async function getContentAll<T>(
  resource: ContentResource,
  category?: 'internal' | 'enterprise'
): Promise<T[]> {
  const first = await getContentPage<T>(resource, 1, 100, category);
  const items = [...first.data];
  for (let page = 2; page <= first.meta.pagination.pageCount; page++) {
    const next = await getContentPage<T>(resource, page, 100, category);
    items.push(...next.data);
  }
  return items;
}

export async function getContentDetail<T>(
  resource: 'supervisors' | 'research-institutions' | 'student-documents' | 'policy-documents' | 'research-transfers',
  slug: string
): Promise<T | null> {
  if (!slug || slug.length > 255) return null;
  const params = query(resource);
  params.set('filters[slug][$eq]', slug);
  params.set('pagination[pageSize]', '1');
  const result = await request<{ data: T[] }>(`/api/${resource}?${params}`);
  if (!Array.isArray(result.data)) throw new Error(`Unexpected Strapi response for ${resource}`);
  return result.data[0] ?? null;
}

export function mediaUrl(media: StrapiMedia | null | undefined): string | null {
  return resolveMediaUrl(media?.url);
}

export function mediaSize(media: StrapiMedia): string {
  return typeof media.size === 'number' && Number.isFinite(media.size)
    ? `${media.size.toFixed(1)} KB`
    : '';
}
