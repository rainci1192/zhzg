'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/operation-logs',
      handler: 'operation-log.find',
      config: {
        auth: { scope: ['api::article.article.find'] },
        policies: [],
        middlewares: [],
      },
    },
  ],
};
