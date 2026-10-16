'use strict';

module.exports = {
  'backup-management-scheduler': {
    task: async ({ strapi }) => {
      try {
        await strapi.service('api::backup-management.backup-management').runScheduled();
      } catch (error) {
        strapi.log.error(`定时备份任务执行失败：${error.message}`);
      }
    },
    options: { rule: '0 * * * * *' },
  },
};
