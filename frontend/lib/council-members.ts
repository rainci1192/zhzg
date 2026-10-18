import 'server-only';
import { resolveMediaUrl, safeExternalUrl } from './public-urls';

export type CouncilMember = {
  id: number;
  name: string;
  logo_url: string | null;
  website: string | null;
  intro: string | null;
};

type Entity = {
  id?: number;
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
};

const API = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_STRAPI_URL || process.env.STRAPI_URL || 'http://localhost:1337').replace(/\/$/, '');

function unwrap(entity: Entity): Record<string, unknown> {
  return (entity.attributes || entity) as Record<string, unknown>;
}

function logoUrl(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null;
  const logo = value as Record<string, unknown>;
  const nested = logo.data && typeof logo.data === 'object' ? unwrap(logo.data as Entity) : logo;
  return resolveMediaUrl(nested.url);
}

export async function getCouncilMembers(options: { councilOnly?: boolean; id?: number } = {}): Promise<CouncilMember[]> {
  const params = new URLSearchParams({
    status: 'published',
    'filters[is_active][$eq]': 'true',
    'sort[0]': 'sort_order:asc',
    'sort[1]': 'id:asc',
    'populate[logo][fields][0]': 'url',
    'pagination[pageSize]': options.id ? '1' : '200',
  });
  if (options.councilOnly) params.set('filters[is_council][$eq]', 'true');
  if (options.id) params.set('filters[id][$eq]', String(options.id));
  try {
    const response = await fetch(`${API}/api/council-members?${params}`, {
      next: { revalidate: 300 },
      headers: {
        Accept: 'application/json',
        ...((process.env.STRAPI_READ_TOKEN || process.env.STRAPI_API_TOKEN)
          ? { Authorization: `Bearer ${process.env.STRAPI_READ_TOKEN || process.env.STRAPI_API_TOKEN}` }
          : {}),
      },
    });
    if (!response.ok) throw new Error(`Council members HTTP ${response.status}`);
    const result = (await response.json()) as { data?: Entity[] };
    return (Array.isArray(result.data) ? result.data : []).map((entity) => {
      const item = unwrap(entity);
      return {
        id: Number(entity.id || item.id) || 0,
        name: typeof item.name === 'string' ? item.name : '',
        logo_url: logoUrl(item.logo),
        website: safeExternalUrl(item.website),
        intro: typeof item.intro === 'string' ? item.intro : null,
      };
    }).filter((item) => item.id > 0 && item.name);
  } catch (error) {
    console.error('读取合作单位失败:', error);
    return [];
  }
}
