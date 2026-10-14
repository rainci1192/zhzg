/**
 * 后台 Strapi 请求统一入口。
 * 从管理员登录时保存的 strapi_jwt 读取 JWT，并为 JSON 与文件上传请求附加认证头。
 */
export async function strapiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  const token =
    typeof window !== 'undefined' ? window.localStorage.getItem('strapi_jwt') : null;

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const isFormData =
    typeof FormData !== 'undefined' && init.body instanceof FormData;
  if (init.body && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(input, { ...init, headers, cache: init.cache ?? 'no-store' });
}
