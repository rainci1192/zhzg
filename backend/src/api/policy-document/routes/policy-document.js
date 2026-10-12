'use strict';

/**
 * policy-document router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::policy-document.policy-document');
