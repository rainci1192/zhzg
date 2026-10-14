import { strapiFetch } from '../strapi-fetch';
const STRAPI_BASE_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  process.env.STRAPI_URL ||
  'http://localhost:1337';

function authHeaders(): Record<string, string> {
  return { 'Content-Type': 'application/json' };
}

export type LeaderPhoto = { id: number; url: string; name: string };

export type Leader = {
  id: number;
  documentId: string;
  name: string;
  title: string;
  department: string | null;
  bio: string | null;
  photo: LeaderPhoto | null;
  sort_order: number;
  is_active: boolean;
};

export type LeaderPayload = {
  name: string;
  title: string;
  department?: string;
  bio?: string;
  sort_order: number;
  is_active: boolean;
  photo?: number | null;
};

type StrapiPhotoData = { id?: number; attributes?: { url?: string; name?: string }; url?: string; name?: string };
type StrapiLeaderAttributes = {
  name?: string; title?: string; department?: string | null; bio?: string | null;
  is_active?: boolean; sort_order?: number; documentId?: string;
  photo?: { data?: StrapiPhotoData | null; url?: string; name?: string } | null;
};
type StrapiEntity = { id?: number; documentId?: string; attributes?: StrapiLeaderAttributes } & Partial<StrapiLeaderAttributes>;
type StrapiListResponse = { data?: StrapiEntity[] };
type StrapiSingleResponse = { data?: StrapiEntity } & Partial<StrapiEntity>;
type StrapiErrorResponse = { error?: { message?: string } };
type StrapiUploadResult = { id: number; url: string; name: string };

function unwrap(entity: StrapiEntity): Leader {
  const d = (entity.attributes ?? entity) as StrapiLeaderAttributes;
  let photo: LeaderPhoto | null = null;
  const pf = d.photo;
  if (pf) {
    if (pf.data) {
      const data = pf.data;
      const attrs = data.attributes ?? data;
      if (attrs?.url) photo = { id: data.id ?? 0, url: attrs.url, name: attrs.name ?? '' };
    } else if ((pf as StrapiPhotoData).url) {
      const lf = pf as StrapiPhotoData;
      photo = { id: lf.id ?? 0, url: lf.url ?? '', name: lf.name ?? '' };
    }
  }
  return {
    id: entity.id ?? 0,
    documentId: entity.documentId ?? (d.documentId as string) ?? '',
    name: d.name ?? '',
    title: d.title ?? '',
    department: d.department ?? null,
    bio: d.bio ?? null,
    photo,
    sort_order: d.sort_order ?? 0,
    is_active: d.is_active ?? true,
  };
}

export function toAbsoluteUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${STRAPI_BASE_URL}${url}`;
}

export { STRAPI_BASE_URL };

export async function fetchLeaders(): Promise<Leader[]> {
  const params = new URLSearchParams({
    'populate': 'photo',
    'sort[0]': 'sort_order:asc',
    'sort[1]': 'id:asc',
    'pagination[pageSize]': '50',
  });
  const res = await strapiFetch(`${STRAPI_BASE_URL}/api/leaders?${params}`, { headers: authHeaders(), cache: 'no-store' });
  if (!res.ok) throw new Error(`获取领导信息失败: ${res.status}`);
  const json = (await res.json()) as StrapiListResponse;
  return (json.data ?? []).map(unwrap);
}

export async function fetchLeader(documentId: string): Promise<Leader> {
  const res = await strapiFetch(`${STRAPI_BASE_URL}/api/leaders/${documentId}?populate=photo`, { headers: authHeaders(), cache: 'no-store' });
  if (!res.ok) throw new Error(`获取领导信息失败: ${res.status}`);
  const json = (await res.json()) as StrapiSingleResponse;
  return unwrap(json.data ?? (json as StrapiEntity));
}

export async function createLeader(payload: LeaderPayload): Promise<Leader> {
  const res = await strapiFetch(`${STRAPI_BASE_URL}/api/leaders`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify({ data: payload }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({ error: { message: '' } }))) as StrapiErrorResponse;
    throw new Error(err?.error?.message ?? `创建失败: ${res.status}`);
  }
  const json = (await res.json()) as StrapiSingleResponse;
  return unwrap(json.data ?? (json as StrapiEntity));
}

export async function updateLeader(documentId: string, payload: LeaderPayload): Promise<Leader> {
  const res = await strapiFetch(`${STRAPI_BASE_URL}/api/leaders/${documentId}`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify({ data: payload }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({ error: { message: '' } }))) as StrapiErrorResponse;
    throw new Error(err?.error?.message ?? `更新失败: ${res.status}`);
  }
  const json = (await res.json()) as StrapiSingleResponse;
  return unwrap(json.data ?? (json as StrapiEntity));
}

export async function deleteLeader(documentId: string): Promise<void> {
  const res = await strapiFetch(`${STRAPI_BASE_URL}/api/leaders/${documentId}`, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) throw new Error(`删除失败: ${res.status}`);
}

export async function uploadPhoto(file: File): Promise<StrapiUploadResult> {
  const formData = new FormData();
  formData.append('files', file);
  const res = await strapiFetch(`${STRAPI_BASE_URL}/api/upload`, {
    method: 'POST',
    headers: {},
    body: formData,
  });
  if (!res.ok) throw new Error(`上传失败: ${res.status}`);
  const json = (await res.json()) as StrapiUploadResult[];
  const f = json[0];
  return { id: f.id, url: f.url.startsWith('http') ? f.url : `${STRAPI_BASE_URL}${f.url}`, name: f.name };
}
