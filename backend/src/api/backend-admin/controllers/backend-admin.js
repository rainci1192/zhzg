'use strict';

/**
 * backend-admin controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::backend-admin.backend-admin', ({ strapi }) => ({
  async login(ctx) {
    const body = ctx.request.body || {};
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password || password.length > 1024) {
      return ctx.badRequest('请输入有效的邮箱和密码。');
    }

    const admin = await strapi.db.query('api::backend-admin.backend-admin').findOne({
      where: { email: { $eqi: email }, publishedAt: { $notNull: true } },
      populate: ['backend_role'],
    });

    // Use the same response for unknown, disabled, and invalid-password accounts.
    if (!admin || admin.is_active !== true || !admin.backend_role || !admin.password) {
      return ctx.unauthorized('邮箱或密码错误，或账号尚未启用。');
    }

    const userService = strapi.plugin('users-permissions').service('user');
    let validPassword = false;
    if (/^\$2[aby]\$\d{2}\$/.test(admin.password)) {
      validPassword = await userService.validatePassword(password, admin.password);
    } else {
      // Upgrade legacy records created before password hashing was added.
      const stored = Buffer.from(String(admin.password));
      const supplied = Buffer.from(password);
      validPassword = stored.length === supplied.length && require('crypto').timingSafeEqual(stored, supplied);
      if (validPassword) {
        const hashed = await userService.ensureHashedPasswords({ password });
        await strapi.db.query('api::backend-admin.backend-admin').update({
          where: { id: admin.id },
          data: { password: hashed.password },
        });
      }
    }

    if (!validPassword) {
      return ctx.unauthorized('邮箱或密码错误，或账号尚未启用。');
    }

    const emailLower = admin.email.trim().toLowerCase();
    const userUid = 'plugin::users-permissions.user';
    const userRole = await strapi.db.query('plugin::users-permissions.role').findOne({
      where: { type: 'authenticated' },
    });
    if (!userRole) {
      strapi.log.error('后台管理员登录失败：Users & Permissions 的 Authenticated 角色不存在。');
      return ctx.internalServerError('登录服务暂不可用，请联系管理员。');
    }

    let user = await strapi.db.query(userUid).findOne({
      where: { email: { $eqi: emailLower } },
    });

    if (user?.blocked === true) {
      return ctx.unauthorized('邮箱或密码错误，或账号尚未启用。');
    }

    if (user && user.provider && user.provider !== 'local') {
      return ctx.throw(409, '此邮箱已绑定其他登录方式，请联系管理员。');
    }

    if (!user) {
      const baseUsername = String(admin.username || emailLower).trim().slice(0, 90) || `admin-${admin.id}`;
      let username = baseUsername;
      let suffix = 1;
      while (await strapi.db.query(userUid).findOne({ where: { username: { $eqi: username } } })) {
        username = `${baseUsername.slice(0, 90 - String(suffix).length - 1)}-${suffix++}`;
      }

      user = await userService.add({
        username,
        email: emailLower,
        password,
        provider: 'local',
        confirmed: true,
        blocked: false,
        name: admin.name,
        role: userRole.id,
      });
    }

    const jwt = await strapi.plugin('users-permissions').service('jwt').issue({ id: user.id });
    await strapi.db.query('api::backend-admin.backend-admin').update({
      where: { id: admin.id },
      data: { last_login: new Date().toISOString() },
    });

    ctx.body = {
      jwt,
      user: { id: user.id, username: user.username, email: user.email },
    };
  },
}));
