'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/article-workflow/:id/preview',
      handler: 'api::article.article.preview',
      config: {
        auth: { scope: ['api::article.article.find'] },
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/article-workflow/tasks',
      handler: 'api::article.article.tasks',
      config: {
        auth: { scope: ['api::article.article.find'] },
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/article-workflow/level1-reviewers',
      handler: 'api::article.article.listLevel1Reviewers',
      config: {
        auth: { scope: ['api::article.article.find'] },
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/article-workflow/:id/submit',
      handler: 'api::article.article.submit',
      config: {
        // Workflow authorization is enforced by the controller against the
        // custom backend-admin role and the assigned reviewer. Requiring the
        // generic article.update permission here incorrectly blocks reviewer
        // roles that only have the custom `review` action.
        auth: { scope: [] },
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/article-workflow/:id/level1-review',
      handler: 'api::article.article.level1Review',
      config: {
        auth: { scope: [] },
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/article-workflow/:id/level2-review',
      handler: 'api::article.article.level2Review',
      config: {
        auth: { scope: [] },
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/article-workflow/:id/publish',
      handler: 'api::article.article.publish',
      config: {
        auth: { scope: [] },
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/article-workflow/:id/unpublish',
      handler: 'api::article.article.unpublish',
      config: {
        auth: { scope: [] },
        policies: [],
        middlewares: [],
      },
    },
  ],
};
