'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/categories/tree',
      handler: 'custom.categoryTree',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/search',
      handler: 'custom.search',
      config: {
        auth: false,
      },
    },
  ],
};
