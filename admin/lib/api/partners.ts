const STRAPI_BASE_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  process.env.STRAPI_URL ||
  'http://localhost:1337';

const STRAPI_API_TOKEN =
  process.env.STRAPI_API_TOKEN ||
  process.env.NEXT_PUBLIC_STRAPI_API_TOKEN ||
  '';

function authHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    ...(STRAPI_API_TOKEN ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` } : {}),
  };
}

export type PartnerLogo = {
  id: number;
  url: string;
  name: string;
};

export type Partner = {
  id: number;
  name: string;
  logo: PartnerLogo | null;
  intro: string | null;
  website: string | null;
  is_active: boolean;
  is_council: boolean;
  sort_order: number;
};

export type PartnerPayload = {
  name: string;
  intro?: string;
  website?: string;
  is_active: boolean;
  is_council: boolean;
  sort_order: number;
  logo?: number | null;
};

type StrapiLogoAttributes = { url?: string; name?: string };

type StrapiLogoData = {
  id?: number;
  attributes?: StrapiLogoAttributes;
  url?: string;
  name?: string;
};

type StrapiLogoField =
  | { data?: StrapiLogoData | null; url?: string; name?: string }
  | null
  | undefined;

type StrapiPartnerAttributes = {
  name?: string;
  intro?: string | null;
  website?: string | null;
  is_active?: boolean;
  is_council?: boolean;
  sort_order?: number;
  logo?: StrapiLogoField;
};

type StrapiPartnerEntity = {
  id?: number;
  attributes?: StrapiPartnerAttributes;
} & Partial<StrapiPartnerAttributes>;

type StrapiListResponse = { data?: StrapiPartnerEntity[] };

type StrapiSingleResponse = {
  data?: StrapiPartnerEntity;
} & Partial<StrapiPartnerEntity>;

type StrapiErrorResponse = { error?: { message?: string } };

type StrapiUploadResult = { id: number; url: string; name: string };

function unwrap(entity: StrapiPartnerEntity): Partner {
  const d = (entity.attributes ?? entity) as StrapiPartnerAttributes;

  let logo: PartnerLogo | null = null;
  const logoField = d.logo;
  if (logoField) {
    if (logoField.data) {
      const data = logoField.data;
      const attrs = data.attributes ?? data;
      if (attrs?.url) {
        logo = { id: data.id ?? 0, url: attrs.url, name: attrs.name ?? '' };
      }
    } else if ((logoField as StrapiLogoData).url) {
      const lf = logoField as StrapiLogoData;
      logo = { id: lf.id ?? 0, url: lf.url ?? '', name: lf.name ?? '' };
    }
  }

  return {
    id: entity.id ?? 0,
    name: d.name ?? '',
    logo,
    intro: d.intro ?? null,
    website: d.website ?? null,
    is_active: d.is_active ?? true,
    is_council: d.is_council ?? false,
    sort_order: d.sort_order ?? 0,
  };
}

export function toAbsoluteUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${STRAPI_BASE_URL}${url}`;
}

export { STRAPI_BASE_URL };

export async function fetchPartners(): Promise<Partner[]> {
  const params = new URLSearchParams({
    'populate[logo][fields][0]': 'url',
    'populate[logo][fields][1]': 'name',
    'sort[0]': 'sort_order:asc',
    'sort[1]': 'id:asc',
    'pagination[pageSize]': '200',
  });
  const res = await fetch(
    `${STRAPI_BASE_URL}/api/council-members?${params}`,
    { headers: authHeaders(), cache: 'no-store' }
  );
  if (!res.ok) throw new Error(`获取合作单位失败: ${res.status}`);
  const json = (await res.json()) as StrapiListResponse;
  return (json.data ?? []).map(unwrap);
}

export async function fetchPartner(id: number): Promise<Partner> {
  const params = new URLSearchParams({
    'populate[logo][fields][0]': 'url',
    'populate[logo][fields][1]': 'name',
  });
  const res = await fetch(
    `${STRAPI_BASE_URL}/api/council-members/${id}?${params}`,
    { headers: authHeaders(), cache: 'no-store' }
  );
  if (!res.ok) throw new Error(`获取合作单位失败: ${res.status}`);
  const json = (await res.json()) as StrapiSingleResponse;
  return unwrap(json.data ?? (json as StrapiPartnerEntity));
}

export async function createPartner(payload: PartnerPayload): Promise<Partner> {
  const res = await fetch(`${STRAPI_BASE_URL}/api/council-members`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ data: payload }),
  });
  if (!res.ok) {
    const err = (await res
      .json()
      .catch(() => ({ error: { message: '' } }))) as StrapiErrorResponse;
    throw new Error(err?.error?.message ?? `创建失败: ${res.status}`);
  }
  const json = (await res.json()) as StrapiSingleResponse;
  return unwrap(json.data ?? (json as StrapiPartnerEntity));
}

export async function updatePartner(
  id: number,
  payload: PartnerPayload
): Promise<Partner> {
  const res = await fetch(`${STRAPI_BASE_URL}/api/council-members/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ data: payload }),
  });
  if (!res.ok) {
    const err = (await res
      .json()
      .catch(() => ({ error: { message: '' } }))) as StrapiErrorResponse;
    throw new Error(err?.error?.message ?? `更新失败: ${res.status}`);
  }
  const json = (await res.json()) as StrapiSingleResponse;
  return unwrap(json.data ?? (json as StrapiPartnerEntity));
}

export async function deletePartner(id: number): Promise<void> {
  const res = await fetch(`${STRAPI_BASE_URL}/api/council-members/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`删除失败: ${res.status}`);
}

export async function uploadLogo(file: File): Promise<StrapiUploadResult> {
  const formData = new FormData();
  formData.append('files', file);
  const res = await fetch(`${STRAPI_BASE_URL}/api/upload`, {
    method: 'POST',
    headers: STRAPI_API_TOKEN
      ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
      : {},
    body: formData,
  });
  if (!res.ok) throw new Error(`上传失败: ${res.status}`);
  const json = (await res.json()) as StrapiUploadResult[];
  const f = json[0];
  return {
    id: f.id,
    url: f.url.startsWith('http') ? f.url : `${STRAPI_BASE_URL}${f.url}`,
    name: f.name,
  };
}

