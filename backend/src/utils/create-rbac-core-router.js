'use strict';

const { createCoreRouter } = require('@strapi/strapi').factories;

const CORE_ACTIONS = {
  find: 'view',
  findOne: 'view',
  create: 'create',
  update: 'update',
  delete: 'delete',
};

/**
 * Add server-side custom-role authorization to Strapi's generated CRUD routes.
 * The website's anonymous reads still pass through the normal Users &
 * Permissions role checks. Writes require an active custom backend account.
 */
module.exports = function createRbacCoreRouter(uid, moduleName) {
  const config = {};
  for (const [handler, action] of Object.entries(CORE_ACTIONS)) {
    config[handler] = {
      policies: [{
        name: 'global::backend-rbac',
        config: {
          moduleName,
          action,
          uid,
          publicRead: !['users', 'roles'].includes(moduleName),
        },
      }],
    };
  }
  return createCoreRouter(uid, { config });
};
