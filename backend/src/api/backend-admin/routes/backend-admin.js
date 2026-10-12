'use strict';

/**
 * backend-admin router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::backend-admin.backend-admin');
