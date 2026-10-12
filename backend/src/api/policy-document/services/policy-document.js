'use strict';

/**
 * policy-document service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::policy-document.policy-document');
