'use strict';

/**
 * permission-module service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::permission-module.permission-module');
