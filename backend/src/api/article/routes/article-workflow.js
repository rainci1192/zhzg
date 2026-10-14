'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/article-workflow/level1-reviewers',
      handler: 'api::article.article.listLevel1Reviewers',
      config: { auth: true, policies: [], middlewares: [] },
    },
    {
      method: 'POST',
      path: '/article-workflow/:id/submit',
      handler: 'api::article.article.submit',
      config: { auth: true, policies: [], middlewares: [] },
    },
    {
      method: 'POST',
      path: '/article-workflow/:id/level1-review',
      handler: 'api::article.article.level1Review',
      config: { auth: true, policies: [], middlewares: [] },
    },
    {
      method: 'POST',
      path: '/article-workflow/:id/level2-review',
      handler: 'api::article.article.level2Review',
      config: { auth: true, policies: [], middlewares: [] },
    },
    {
      method: 'POST',
      path: '/article-workflow/:id/publish',
      handler: 'api::article.article.publish',
      config: { auth: true, policies: [], middlewares: [] },
    },
  ],
};
