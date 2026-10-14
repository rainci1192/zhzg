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

  async bootstrap({ strapi }) {
    // Create the two workflow roles once, so an existing installation does not
    // need to recreate them by hand after the patch is installed. Existing
    // roles and their custom permissions are left untouched.
    const roleUid = 'api::backend-role.backend-role';
    const roleDefinitions = [
      {
        name: 'article_level1_reviewer',
        display_name: '一级审核',
        description: '负责文章一级审核，可通过或退回指定给自己的文章。',
        color: 'blue',
      },
      {
        name: 'article_level2_reviewer',
        display_name: '二级审核',
        description: '负责文章二级审核，可通过或退回进入二审的文章。',
        color: 'orange',
      },
    ];

    for (const definition of roleDefinitions) {
      try {
        let role = await strapi.db.query(roleUid).findOne({
          where: { name: definition.name },
        });

        if (!role) {
          role = await strapi.db.query(roleUid).create({
            data: {
              ...definition,
              permissions: ['view_dashboard', 'manage_articles', 'manage_review'],
              is_system: true,
              publishedAt: new Date().toISOString(),
            },
          });
          strapi.log.info(`已创建文章审核角色: ${definition.display_name}`);
        }

        // If the fine-grained permission records already exist, grant the new
        // role the minimum permissions needed for the article menu and review.
        const module = await strapi.db.query('api::permission-module.permission-module').findOne({
          where: { name: 'articles' },
        });
        const actions = (await strapi.db.query('api::permission-action.permission-action').findMany({
          where: { name: { $in: ['view', 'review'] } },
        })) || [];

        if (module && actions.length > 0) {
          const rolePermissionUid = 'api::role-permission.role-permission';
          const existing = await strapi.db.query(rolePermissionUid).findOne({
            where: {
              backend_role: role.id,
              permission_module: module.id,
            },
          });

          if (!existing) {
            await strapi.db.query(rolePermissionUid).create({
              data: {
                backend_role: role.id,
                permission_module: module.id,
                allowed_actions: actions.map((action) => action.id),
                data_scope: 'all',
                publishedAt: new Date().toISOString(),
              },
            });
          }
        }
      } catch (error) {
        strapi.log.warn(`文章审核角色初始化失败（可在后台角色管理中手动创建）: ${error.message}`);
      }
    }
  },
};
