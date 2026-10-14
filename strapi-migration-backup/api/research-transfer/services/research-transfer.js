'use strict';

/**
 * research-transfer service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::research-transfer.research-transfer');
