'use strict';

/**
 * backend-admin service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::backend-admin.backend-admin');
