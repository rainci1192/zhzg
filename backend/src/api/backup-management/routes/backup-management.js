'use strict';

const auth = { scope: ['api::article.article.find'] };

module.exports = {
  routes: [
    { method: 'GET', path: '/backup-management', handler: 'backup-management.overview', config: { auth } },
    { method: 'POST', path: '/backup-management/run', handler: 'backup-management.run', config: { auth } },
    { method: 'PUT', path: '/backup-management/settings', handler: 'backup-management.updateSettings', config: { auth } },
    { method: 'GET', path: '/backup-management/:id/download', handler: 'backup-management.download', config: { auth } },
    { method: 'POST', path: '/backup-management/:id/restore', handler: 'backup-management.restore', config: { auth } },
    { method: 'DELETE', path: '/backup-management/:id', handler: 'backup-management.remove', config: { auth } },
  ],
};
