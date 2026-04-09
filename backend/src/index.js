'use strict';

module.exports = {
  register({ strapi }) {
    // 注册自定义路由
    strapi.server.routes([
      {
        method: 'GET',
        path: '/api/categories/tree',
        handler: async (ctx) => {
          return strapi
            .controller('api::custom.custom')
            .categoryTree(ctx);
        },
        config: { auth: false },
      },
      {
        method: 'GET',
        path: '/api/search',
        handler: async (ctx) => {
          return strapi
            .controller('api::custom.custom')
            .search(ctx);
        },
        config: { auth: false },
      },
      {
        method: 'GET',
        path: '/api/attachments/:id/download',
        handler: async (ctx) => {
          return strapi
            .controller('api::custom.custom')
            .download(ctx);
        },
        config: { auth: false },
      },
            {
        method: 'GET',
        path: '/api/articles/home-news',
        handler: async (ctx) => {
          return strapi.controller('api::custom.custom').homeNews(ctx);
        },
        config: { auth: false },
      },
      {
        method: 'GET',
        path: '/api/articles/home-notices',
        handler: async (ctx) => {
          return strapi.controller('api::custom.custom').homeNotices(ctx);
        },
        config: { auth: false },
      },
            {
        method: 'GET',
        path: '/api/articles/:slug',
        handler: async (ctx) => {
          return strapi.controller('api::custom.custom').articleBySlug(ctx);
        },
        config: { auth: false },
      },
      {
        method: 'GET',
        path: '/api/categories/:slug/articles',
        handler: async (ctx) => {
          return strapi.controller('api::custom.custom').categoryArticles(ctx);
        },
        config: { auth: false },
      },

    ]);
  },

  bootstrap() {},
};
