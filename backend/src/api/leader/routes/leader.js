'use strict';

const createRbacCoreRouter = require('../../../utils/create-rbac-core-router');

module.exports = createRbacCoreRouter('api::leader.leader', 'leaders');
