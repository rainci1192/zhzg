'use strict';

const BCRYPT_HASH = /^\$2[aby]\$\d{2}\$/;

async function hashPlainPassword(data) {
  if (!data || typeof data.password !== 'string' || data.password.length === 0) return;
  if (BCRYPT_HASH.test(data.password)) return;

  const userService = strapi.plugin('users-permissions').service('user');
  const hashed = await userService.ensureHashedPasswords({ password: data.password });
  data.password = hashed.password;
}

module.exports = {
  async beforeCreate(event) {
    await hashPlainPassword(event.params.data);
  },
  async beforeUpdate(event) {
    await hashPlainPassword(event.params.data);
  },
};
