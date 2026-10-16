const cronTasks = require('./cron-tasks');

module.exports = ({ env }) => {
  const isProduction = env('NODE_ENV', 'development') === 'production';
  if (isProduction) {
    const secretNames = ['APP_KEYS', 'API_TOKEN_SALT', 'ADMIN_JWT_SECRET', 'TRANSFER_TOKEN_SALT', 'JWT_SECRET', 'ENCRYPTION_KEY'];
    const placeholders = /^(?:tobemodified|replace-with|changeme|change-me|secret|default)/i;
    for (const name of secretNames) {
      const value = String(env(name, '') || '').trim();
      const parts = name === 'APP_KEYS' ? value.split(',').map((part) => part.trim()) : [value];
      if (!value || parts.some((part) => part.length < 32 || placeholders.test(part))) {
        throw new Error(`生产环境必须为 ${name} 配置足够长度的唯一随机密钥。`);
      }
    }
  }

  return {
    host: env('HOST', '0.0.0.0'),
    port: env.int('PORT', 1337),
    app: {
      keys: env.array('APP_KEYS'),
    },
    webhooks: {
      populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
    },
    cron: {
      enabled: true,
      tasks: cronTasks,
    },
  };
};
