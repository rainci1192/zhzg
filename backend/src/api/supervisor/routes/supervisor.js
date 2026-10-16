'use strict';

const createRbacCoreRouter = require('../../../utils/create-rbac-core-router');

module.exports = createRbacCoreRouter('api::supervisor.supervisor', 'supervisors');
