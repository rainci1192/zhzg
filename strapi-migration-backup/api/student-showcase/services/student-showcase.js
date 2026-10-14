'use strict';

/**
 * student-showcase service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::student-showcase.student-showcase');
