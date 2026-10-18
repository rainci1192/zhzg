'use strict';

module.exports = {
  register({ strapi }) {
    require('./utils/slug-lifecycle')(strapi);

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
    try {
      const moduleUid = 'api::permission-module.permission-module';
      const actionUid = 'api::permission-action.permission-action';
      let logsModule = await strapi.db.query(moduleUid).findOne({ where: { name: 'logs' } });
      if (!logsModule) {
        logsModule = await strapi.db.query(moduleUid).create({
          data: {
            name: 'logs',
            display_name: '操作日志',
            description: '查看后台用户操作和审计记录',
            category: 'system',
            sort_order: 90,
            is_active: true,
            publishedAt: new Date().toISOString(),
          },
        });
      }
      let viewAction = await strapi.db.query(actionUid).findOne({ where: { name: 'view' } });
      if (!viewAction) {
        viewAction = await strapi.db.query(actionUid).create({
          data: {
            name: 'view',
            display_name: '查看',
            description: '查看操作日志列表和详情',
            color: 'blue',
            icon: 'Eye',
            sort_order: 1,
            publishedAt: new Date().toISOString(),
          },
        });
      }
    } catch (error) {
      strapi.log.warn(`操作日志权限模块初始化失败: ${error.message}`);
    }

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

        // Ensure the article module and the two actions exist. Older installs
        // may have the role rows but no fine-grained module row yet.
        const moduleUid = 'api::permission-module.permission-module';
        const actionUid = 'api::permission-action.permission-action';
        const rolePermissionUid = 'api::role-permission.role-permission';
        let module = await strapi.db.query(moduleUid).findOne({
          where: { name: 'articles' },
        });

        if (!module) {
          module = await strapi.db.query(moduleUid).create({
            data: {
              name: 'articles',
              display_name: '文章',
              description: '文章内容和审核流程',
              category: 'content',
              sort_order: 1,
              is_active: true,
              publishedAt: new Date().toISOString(),
            },
          });
        }

        const actionDefinitions = {
          view: { display_name: '查看', description: '查看文章列表和详情', color: 'blue', icon: 'Eye', sort_order: 1 },
          review: { display_name: '审核', description: '处理文章审核流程', color: 'yellow', icon: 'CheckCircle', sort_order: 6 },
        };
        const actions = [];
        for (const name of Object.keys(actionDefinitions)) {
          let action = await strapi.db.query(actionUid).findOne({ where: { name } });
          if (!action) {
            action = await strapi.db.query(actionUid).create({
              data: {
                name,
                ...actionDefinitions[name],
                publishedAt: new Date().toISOString(),
              },
            });
          }
          actions.push(action);
        }

        const grants = (await strapi.db.query(rolePermissionUid).findMany({
          where: { backend_role: role.id },
          populate: ['permission_module', 'allowed_actions'],
        })) || [];

        // Repair rows created by an earlier bootstrap that contain the
        // actions but lost their permission_module relation.
        for (const grant of grants) {
          if (!grant.permission_module) {
            await strapi.db.query(rolePermissionUid).update({
              where: { id: grant.id },
              data: { permission_module: module.id },
            });
          }
        }

        const hasArticleGrant = grants.some((grant) => {
          const moduleId = grant.permission_module?.id ?? grant.permission_module;
          return String(moduleId) === String(module.id);
        });

        if (!hasArticleGrant) {
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
      } catch (error) {
        strapi.log.warn(`文章审核角色初始化失败（可在后台角色管理中手动创建）: ${error.message}`);
      }
    }

    // Register the backup module/actions for the custom role-permission editor.
    // No role is granted backup access implicitly; administrators must assign it.
    try {
      const moduleUid = 'api::permission-module.permission-module';
      const actionUid = 'api::permission-action.permission-action';
      let module = await strapi.db.query(moduleUid).findOne({ where: { name: 'backup' } });
      if (!module) {
        module = await strapi.db.query(moduleUid).create({
          data: {
            name: 'backup',
            display_name: '备份管理',
            description: '创建、下载、清理和恢复网站备份',
            category: 'system',
            sort_order: 95,
            is_active: true,
            publishedAt: new Date().toISOString(),
          },
        });
      }
      const actionDefinitions = [
        ['view', '查看', '查看备份记录和计划'],
        ['create', '创建', '执行手动备份'],
        ['edit', '配置', '修改定时计划和保留策略'],
        ['delete', '删除', '删除备份文件'],
        ['restore', '恢复', '恢复网站数据库和本地媒体文件'],
      ];
      const actionRows = [];
      for (const [name, display_name, description] of actionDefinitions) {
        let action = await strapi.db.query(actionUid).findOne({ where: { name } });
        if (!action) {
          action = await strapi.db.query(actionUid).create({
            data: { name, display_name, description, color: 'blue', icon: 'Database', sort_order: 90, publishedAt: new Date().toISOString() },
          });
        }
        actionRows.push(action);
      }

      // The designated super administrator must always be able to reach and
      // operate this page, including from the fine-grained sidebar.
      const superRole = await strapi.db.query('api::backend-role.backend-role').findOne({ where: { name: 'super_admin' } });
      if (superRole) {
        const rolePermissionUid = 'api::role-permission.role-permission';
        const grants = await strapi.db.query(rolePermissionUid).findMany({
          where: { backend_role: superRole.id },
          populate: ['permission_module', 'allowed_actions'],
        });
        const backupGrant = grants.find((grant) => String(grant.permission_module?.id ?? grant.permission_module) === String(module.id));
        if (backupGrant) {
          await strapi.db.query(rolePermissionUid).update({
            where: { id: backupGrant.id },
            data: { allowed_actions: actionRows.map((action) => action.id), data_scope: 'all' },
          });
        } else {
          await strapi.db.query(rolePermissionUid).create({
            data: { backend_role: superRole.id, permission_module: module.id, allowed_actions: actionRows.map((action) => action.id), data_scope: 'all', publishedAt: new Date().toISOString() },
          });
        }
      }

      // Migrate the existing coarse manage_backup flag to equivalent
      // fine-grained actions for legacy roles, without granting restore.
      const allRoles = await strapi.db.query('api::backend-role.backend-role').findMany();
      const rolePermissionUid = 'api::role-permission.role-permission';
      const legacyActions = actionRows.filter((action) => ['view', 'create', 'edit', 'delete'].includes(action.name));
      for (const role of allRoles) {
        if (role.name === 'super_admin' || !Array.isArray(role.permissions) || !role.permissions.includes('manage_backup')) continue;
        const grants = await strapi.db.query(rolePermissionUid).findMany({
          where: { backend_role: role.id },
          populate: ['permission_module'],
        });
        const alreadyConfigured = grants.some((grant) => String(grant.permission_module?.id ?? grant.permission_module) === String(module.id));
        if (!alreadyConfigured) {
          await strapi.db.query(rolePermissionUid).create({
            data: { backend_role: role.id, permission_module: module.id, allowed_actions: legacyActions.map((action) => action.id), data_scope: 'all', publishedAt: new Date().toISOString() },
          });
        }
      }
    } catch (error) {
      strapi.log.warn(`备份管理权限初始化失败：${error.message}`);
    }
  },
};
