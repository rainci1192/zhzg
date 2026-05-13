'use strict';

/**
 * council-member service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::council-member.council-member');
