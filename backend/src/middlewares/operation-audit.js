'use strict';

const LOG_UID = 'api::operation-log.operation-log';
const ADMIN_UID = 'api::backend-admin.backend-admin';
const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const RESOURCE_LABELS = {
  articles: ['文章', '文章'],
  'article-workflow': ['文章审核', '文章'],
  categories: ['分类管理', '分类'],
  pages: ['页面管理', '页面'],
  supervisors: ['导师管理', '导师'],
  'student-documents': ['学生资料', '学生资料'],
  'policy-documents': ['政策文件', '政策文件'],
  'research-institutions': ['科研机构', '科研机构'],
  'research-transfers': ['成果转化', '成果'],
  'backend-admins': ['用户管理', '后台用户'],
  'backend-roles': ['角色管理', '后台角色'],
  'role-permissions': ['权限管理', '角色权限'],
  banners: ['Banner 管理', 'Banner'],
  links: ['友情链接', '友情链接'],
  attachments: ['附件管理', '附件'],
  upload: ['附件管理', '附件'],
  'site-configs': ['站点设置', '站点配置'],
};

function routeParts(path) {
  return String(path || '').split('?')[0].split('/').filter(Boolean).slice(1);
}

function operationFrom(method, parts, body) {
  if (parts[1] === 'auth' && parts[2] === 'login') return '登录';
  const special = parts.find((part) => ['submit', 'level1-review', 'level2-review', 'publish', 'publish-time', 'unpublish'].includes(part));
  const decision = String(body?.decision || body?.action || '').toLowerCase();
  if (special === 'submit') return '提交审核';
  if (special === 'level1-review') return decision === 'reject' ? '一级审核退回' : '一级审核通过';
  if (special === 'level2-review') return decision === 'reject' ? '二级审核退回' : '二级审核通过';
  if (special === 'publish') return '发布';
  if (special === 'publish-time') return '调整发布时间';
  if (special === 'unpublish') return '取消发布';
  if (method === 'POST') return '创建';
  if (method === 'DELETE') return '删除';
  return '修改';
}

function requestTarget(parts, body, resourceLabel) {
  const id = parts[1] === 'auth' ? '' : parts.slice(1).find((part) => !['submit', 'level1-review', 'level2-review', 'publish', 'publish-time', 'unpublish', 'auth'].includes(part)) || '';
  const payload = body?.data && typeof body.data === 'object' ? body.data : body || {};
  const title = ['title', 'name', 'display_name', 'slug', 'email', 'username'].map((key) => payload[key]).find((value) => typeof value === 'string' && value.trim());
  return { id, label: title ? String(title).trim().slice(0, 180) : id ? `${resourceLabel} #${id}` : resourceLabel };
}

function getIp(ctx) {
  // Koa only considers forwarding headers when the server is explicitly
  // configured to trust a proxy. Do not accept arbitrary client-supplied
  // X-Forwarded-For values as audit evidence.
  return String(ctx.request.ip || '').slice(0, 64);
}

module.exports = (_config, { strapi }) => async (ctx, next) => {
  const method = String(ctx.method || '').toUpperCase();
  const requestPath = String(ctx.path || '');
  const isBackendApi = requestPath.startsWith('/api/');
  if (!isBackendApi || !WRITE_METHODS.has(method) || requestPath.startsWith('/api/operation-logs')) return next();

  let thrown;
  try {
    await next();
  } catch (error) {
    thrown = error;
    throw error;
  } finally {
    try {
      const body = ctx.request?.body || {};
      const identityEmail = String(ctx.state.user?.email || (requestPath.endsWith('/auth/login') ? body.email : '') || '').trim().toLowerCase();
      if (identityEmail) {
        const admin = await strapi.db.query(ADMIN_UID).findOne({
          where: { email: { $eqi: identityEmail } },
          populate: ['backend_role'],
        });
        if (admin) {
          const parts = routeParts(requestPath);
          const resourceKey = parts[0] || 'system';
          const [moduleLabel, targetType] = RESOURCE_LABELS[resourceKey] || [resourceKey, resourceKey];
          const action = operationFrom(method, parts, body);
          const target = requestTarget(parts, body.data || body, targetType);
          const statusCode = Number(thrown?.status || ctx.status || 200);
          const fields = body.data && typeof body.data === 'object'
            ? Object.keys(body.data).filter((key) => !['password', 'token', 'jwt', 'content', 'summary', 'bio'].includes(key)).slice(0, 40)
            : Object.keys(body).filter((key) => !['password', 'token', 'jwt', 'content', 'summary', 'bio'].includes(key)).slice(0, 40);

          await strapi.db.query(LOG_UID).create({
            data: {
              actor: admin.id,
              actor_name: admin.name || admin.username || admin.email,
              actor_email: admin.email,
              actor_role: admin.backend_role?.display_name || admin.backend_role?.name || '',
              action,
              module: moduleLabel,
              target_type: targetType,
              target_id: target.id || null,
              target_label: target.label,
              method,
              path: requestPath.slice(0, 255),
              ip_address: getIp(ctx),
              user_agent: String(ctx.get('user-agent') || '').slice(0, 1000),
              status_code: statusCode,
              result: thrown || statusCode >= 400 ? 'failed' : 'success',
              details: { fields, queryKeys: Object.keys(ctx.query || {}).slice(0, 30) },
            },
          });
        }
      }
    } catch (logError) {
      strapi.log.error(`操作日志写入失败: ${logError.message}`);
    }
  }
};
