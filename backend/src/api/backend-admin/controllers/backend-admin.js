'use strict';

/**
 * backend-admin controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::backend-admin.backend-admin');
