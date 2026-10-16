'use strict';

const ADMIN_UID = 'api::backend-admin.backend-admin';
const ROLE_PERMISSION_UID = 'api::role-permission.role-permission';
const MODULE_UID = 'api::permission-module.permission-module';
const { createCoreController } = require('@strapi/strapi').factories;

function roleOf(admin) {
  return admin?.backend_role?.data || admin?.backend_role || null;
}

function isSuperAdmin(admin) {
  return ['super_admin', 'superadmin', 'super-administrator'].includes(String(roleOf(admin)?.name || '').toLowerCase());
}

async function hasBackupAction(strapi, admin, action) {
  if (isSuperAdmin(admin)) return true;
  const role = roleOf(admin);
  const legacy = Array.isArray(role?.permissions) && role.permissions.includes('manage_backup');
  if (legacy && action !== 'restore') return true;
  if (!role?.id) return false;
  const module = await strapi.db.query(MODULE_UID).findOne({ where: { name: 'backup' } });
  if (!module) return false;
  const grants = await strapi.db.query(ROLE_PERMISSION_UID).findMany({
    where: { backend_role: role.id, permission_module: module.id },
    populate: ['allowed_actions'],
  });
  return grants.some((grant) => {
    const actions = grant.allowed_actions?.data || grant.allowed_actions || [];
    return actions.some((item) => (item?.name || item?.data?.name) === action);
  });
}

async function authorize(strapi, ctx, action) {
  const email = String(ctx.state.user?.email || '').trim().toLowerCase();
  if (!email) return { error: 'unauthorized' };
  const admin = await strapi.db.query(ADMIN_UID).findOne({
    where: { email: { $eqi: email } },
    populate: ['backend_role'],
  });
  if (!admin || admin.is_active !== true) return { error: 'unauthorized' };
  if (!(await hasBackupAction(strapi, admin, action))) return { error: 'forbidden' };
  return { admin };
}

function respondAuthError(ctx, error) {
  if (error === 'unauthorized') return ctx.unauthorized('请先登录后台管理系统。');
  if (error === 'forbidden') return ctx.forbidden('当前角色没有执行此备份操作的权限。');
}

module.exports = createCoreController('api::backup-management.backup-management', ({ strapi }) => ({
  async overview(ctx) {
    const access = await authorize(strapi, ctx, 'view');
    if (access.error) return respondAuthError(ctx, access.error);
    ctx.body = await strapi.service('api::backup-management.backup-management').overview();
  },

  async run(ctx) {
    const access = await authorize(strapi, ctx, 'create');
    if (access.error) return respondAuthError(ctx, access.error);
    try {
      ctx.body = { data: await strapi.service('api::backup-management.backup-management').startManual(access.admin) };
    } catch (error) {
      ctx.status = error.message.includes('正在运行') ? 409 : 400;
      ctx.body = { error: { message: error.message } };
    }
  },

  async updateSettings(ctx) {
    const access = await authorize(strapi, ctx, 'edit');
    if (access.error) return respondAuthError(ctx, access.error);
    try {
      const settings = await strapi.service('api::backup-management.backup-management').saveSettings({
        ...(ctx.request.body || {}), actor: access.admin,
      });
      ctx.body = { data: settings };
    } catch (error) {
      ctx.badRequest(error.message);
    }
  },

  async download(ctx) {
    const access = await authorize(strapi, ctx, 'view');
    if (access.error) return respondAuthError(ctx, access.error);
    const archive = await strapi.service('api::backup-management.backup-management').getArchive(ctx.params.id);
    if (!archive) return ctx.notFound('备份归档不存在或尚未完成。');
    ctx.type = 'application/gzip';
    ctx.set('Content-Disposition', `attachment; filename="${archive.record.id}.tar.gz"`);
    ctx.body = require('fs').createReadStream(archive.file);
  },

  async remove(ctx) {
    const access = await authorize(strapi, ctx, 'delete');
    if (access.error) return respondAuthError(ctx, access.error);
    try {
      const record = await strapi.service('api::backup-management.backup-management').remove(ctx.params.id, access.admin);
      ctx.body = { data: { id: record.id, deleted: true } };
    } catch (error) {
      ctx.badRequest(error.message);
    }
  },

  async restore(ctx) {
    const access = await authorize(strapi, ctx, 'restore');
    if (access.error) return respondAuthError(ctx, access.error);
    try {
      ctx.body = { data: await strapi.service('api::backup-management.backup-management').restore(
        ctx.params.id, access.admin, ctx.request.body?.confirmation,
      ) };
    } catch (error) {
      ctx.status = error.message.includes('找不到') ? 404 : 400;
      ctx.body = { error: { message: error.message } };
    }
  },
}));
