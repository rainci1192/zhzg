'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/backend-admins/auth/login',
      handler: 'api::backend-admin.backend-admin.login',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
