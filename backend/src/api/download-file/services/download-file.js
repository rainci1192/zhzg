'use strict';

/**
 * download-file service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::download-file.download-file');
