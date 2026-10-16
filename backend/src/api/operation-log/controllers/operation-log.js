'use strict';

const UID = 'api::operation-log.operation-log';
const ADMIN_UID = 'api::backend-admin.backend-admin';
const { createCoreController } = require('@strapi/strapi').factories;

function roleName(admin) {
  const relation = admin?.backend_role?.data || admin?.backend_role;
  return String(relation?.name || '').trim().toLowerCase();
}

async function canViewLogs(strapi, admin) {
  if (roleName(admin) === 'super_admin') return true;
  const role = admin?.backend_role?.data || admin?.backend_role;
  if (!role?.id) return false;
  const module = await strapi.db.query('api::permission-module.permission-module').findOne({ where: { name: 'logs' } });
  if (!module) return false;
  const grants = await strapi.db.query('api::role-permission.role-permission').findMany({
    where: { backend_role: role.id, permission_module: module.id },
    populate: ['allowed_actions'],
  });
  return grants.some((grant) => {
    const actions = grant.allowed_actions?.data || grant.allowed_actions || [];
    return actions.some((action) => (action?.name || action?.data?.name) === 'view');
  });
}

function dateFilter(value, operator) {
  if (!value) return null;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(value))
    ? new Date(`${value}T${operator === '$lte' ? '23:59:59.999' : '00:00:00.000'}Z`)
    : new Date(value);
  return Number.isNaN(date.getTime()) ? null : { [operator]: date.toISOString() };
}

module.exports = createCoreController(UID, ({ strapi }) => ({
  async find(ctx) {
    const identity = ctx.state.user;
    const email = String(identity?.email || '').trim().toLowerCase();
    if (!email) return ctx.unauthorized('请先登录后台管理系统。');

    const admin = await strapi.db.query(ADMIN_UID).findOne({
      where: { email: { $eqi: email } },
      populate: ['backend_role'],
    });
    if (!admin || admin.is_active !== true || !(await canViewLogs(strapi, admin))) {
      return ctx.forbidden('当前角色没有查看操作日志的权限。');
    }

    const query = ctx.query || {};
    const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, Number.parseInt(query.pageSize, 10) || 20));
    const where = {};
    const from = dateFilter(query.from, '$gte');
    const to = dateFilter(query.to, '$lte');
    if (query.action) where.action = query.action;
    if (query.module) where.module = query.module;
    if (query.result === 'success' || query.result === 'failed') where.result = query.result;
    if (from || to) where.createdAt = { ...(from || {}), ...(to || {}) };
    if (query.q && String(query.q).trim()) {
      const term = String(query.q).trim().slice(0, 120);
      where.$or = ['actor_name', 'actor_email', 'actor_role', 'action', 'module', 'target_type', 'target_id', 'target_label', 'ip_address']
        .map((field) => ({ [field]: { $containsi: term } }));
    }

    const [total, rows] = await Promise.all([
      strapi.db.query(UID).count({ where }),
      strapi.db.query(UID).findMany({
        where,
        orderBy: { createdAt: 'desc' },
        offset: (page - 1) * pageSize,
        limit: pageSize,
      }),
    ]);

    ctx.body = {
      data: rows,
      meta: { pagination: { page, pageSize, pageCount: Math.ceil(total / pageSize), total } },
    };
  },
}));
