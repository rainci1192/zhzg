'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/article-views/:slug',
      handler: 'api::article.article-views.count',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/article-views/:slug',
      handler: 'api::article.article-views.record',
      config: { auth: false },
    },
  ],
};
