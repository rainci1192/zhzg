'use strict';

/**
 * backend-admin controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

// Lightweight per-process protection for local/single-instance deployments.
// Production deployments with multiple workers should also rate-limit this
// endpoint at the reverse proxy or shared edge gateway.
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 5;
const loginAttempts = new Map();

function loginKeys(ctx, email) {
  const ip = String(ctx.request.ip || ctx.ip || 'unknown').slice(0, 100);
  return [`ip:${ip}`, `account:${email}`];
}

function checkLoginLimit(keys) {
  const now = Date.now();
  let retryMs = 0;
  for (const key of keys) {
    const recent = (loginAttempts.get(key) || []).filter((timestamp) => now - timestamp < LOGIN_WINDOW_MS);
    loginAttempts.set(key, recent);
    if (recent.length >= LOGIN_MAX_ATTEMPTS) {
      retryMs = Math.max(retryMs, LOGIN_WINDOW_MS - (now - recent[0]));
    }
  }
  return retryMs;
}

function recordLoginFailure(keys) {
  const now = Date.now();
  for (const key of keys) {
    const recent = (loginAttempts.get(key) || []).filter((timestamp) => now - timestamp < LOGIN_WINDOW_MS);
    recent.push(now);
    loginAttempts.set(key, recent);
  }
  if (loginAttempts.size > 5000) {
    for (const [key, timestamps] of loginAttempts) {
      const recent = timestamps.filter((timestamp) => now - timestamp < LOGIN_WINDOW_MS);
      if (recent.length) loginAttempts.set(key, recent);
      else loginAttempts.delete(key);
    }
    while (loginAttempts.size > 5000) loginAttempts.delete(loginAttempts.keys().next().value);
  }
}

function clearLoginAttempts(keys) {
  for (const key of keys) loginAttempts.delete(key);
}

module.exports = createCoreController('api::backend-admin.backend-admin', ({ strapi }) => ({
  async login(ctx) {
    const body = ctx.request.body || {};
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || email.length > 254 || !password || password.length > 1024) {
      return ctx.badRequest('请输入有效的邮箱和密码。');
    }
    const throttlingKeys = loginKeys(ctx, email);
    const retryMs = checkLoginLimit(throttlingKeys);
    if (retryMs > 0) {
      ctx.set('Retry-After', String(Math.ceil(retryMs / 1000)));
      ctx.status = 429;
      ctx.body = { error: { message: '登录尝试过于频繁，请稍后再试。' } };
      return;
    }

    // Backend Admin records are account records, not public content. The
    // content type currently has Draft & Publish enabled, so users created
    // from the custom management screen can remain drafts. Do not require
    // publishedAt here; is_active is the login access control.
    const admin = await strapi.db.query('api::backend-admin.backend-admin').findOne({
      where: { email: { $eqi: email } },
      populate: ['backend_role'],
    });

    // Use the same response for unknown, disabled, and invalid-password accounts.
    if (!admin || admin.is_active !== true || !admin.backend_role) {
      recordLoginFailure(throttlingKeys);
      return ctx.unauthorized('邮箱或密码错误，或账号尚未启用。');
    }

    const userService = strapi.plugin('users-permissions').service('user');
    let backendPasswordValid = false;
    if (typeof admin.password === 'string' && admin.password.length > 0 && /^\$2[aby]\$\d{2}\$/.test(admin.password)) {
      backendPasswordValid = await userService.validatePassword(password, admin.password);
    } else if (typeof admin.password === 'string' && admin.password.length > 0) {
      // Upgrade legacy records created before password hashing was added.
      const stored = Buffer.from(String(admin.password));
      const supplied = Buffer.from(password);
      backendPasswordValid = stored.length === supplied.length && require('crypto').timingSafeEqual(stored, supplied);
      if (backendPasswordValid) {
        const hashed = await userService.ensureHashedPasswords({ password });
        await strapi.db.query('api::backend-admin.backend-admin').update({
          where: { id: admin.id },
          data: { password: hashed.password },
        });
      }
    }

    const emailLower = admin.email.trim().toLowerCase();
    const userUid = 'plugin::users-permissions.user';
    let user = await strapi.db.query(userUid).findOne({
      where: { email: { $eqi: emailLower } },
    });

    if (user?.blocked === true) {
      recordLoginFailure(throttlingKeys);
      return ctx.unauthorized('邮箱或密码错误，或账号尚未启用。');
    }

    if (user && user.provider && user.provider !== 'local') {
      return ctx.throw(409, '此邮箱已绑定其他登录方式，请联系管理员。');
    }

    // Existing administrators previously authenticated with Users & Permissions.
    // Accept that password as a migration fallback so installing this endpoint
    // does not lock out accounts whose Backend Admin password differs.
    const legacyUsersPermissionsPasswordValid =
      !backendPasswordValid && !!user?.password
        ? await userService.validatePassword(password, user.password)
        : false;

    if (!backendPasswordValid && !legacyUsersPermissionsPasswordValid) {
      recordLoginFailure(throttlingKeys);
      return ctx.unauthorized('邮箱或密码错误，或账号尚未启用。');
    }

    clearLoginAttempts(throttlingKeys);

    if (!user) {
      const userRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'authenticated' },
      });
      if (!userRole) {
        strapi.log.error('后台管理员登录失败：Users & Permissions 的 Authenticated 角色不存在。');
        return ctx.internalServerError('登录服务暂不可用，请联系管理员。');
      }

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
