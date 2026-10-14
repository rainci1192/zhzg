'use strict';

/**
 * student-document service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::student-document.student-document');
