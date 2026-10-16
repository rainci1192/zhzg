'use strict';

const ADMIN_UID = 'api::backend-admin.backend-admin';
const ROLE_PERMISSION_UID = 'api::role-permission.role-permission';
const MODULE_UID = 'api::permission-module.permission-module';

const ACTION_ALIASES = {
  update: ['update', 'edit'],
  edit: ['edit', 'update'],
};

function relation(value) {
  return value?.data || value || null;
}

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object || {}, key);
}

function relationKey(value) {
  if (value === null) return null;
  if (Array.isArray(value)) return relationKey(value[0]);
  if (!value || typeof value !== 'object') return value;
  if (value.connect !== undefined) return relationKey(value.connect);
  return value.documentId ?? value.id ?? value.data?.documentId ?? value.data?.id;
}

function isPrivilegedRole(role) {
  return ['super_admin', 'superadmin', 'super-administrator'].includes(String(role?.name || '').toLowerCase());
}

async function findByKey(strapi, uid, key, populate = []) {
  if (key === null || key === undefined || key === '') return null;
  const where = /^\d+$/.test(String(key)) ? { id: Number(key) } : { documentId: String(key) };
  return strapi.db.query(uid).findOne({ where, populate });
}

async function protectPrivilegeBoundary(strapi, policyContext, config, actor) {
  const uid = String(config.uid || '');
  const data = policyContext.request.body?.data || {};
  const isWrite = ['create', 'update', 'delete'].includes(config.action);
  if (!isWrite) return true;
  const superAdmin = isPrivilegedRole(relation(actor.backend_role));

  // Only a super administrator may change the permission catalog, edit
  // system roles, change role grants, or assign backend roles to accounts.
  if (uid === 'api::permission-module.permission-module' || uid === 'api::permission-action.permission-action') {
    return superAdmin;
  }

  if (uid === 'api::backend-role.backend-role') {
    const existing = config.action === 'create'
      ? null
      : await findByKey(strapi, uid, policyContext.params?.id);
    if (!superAdmin && (existing?.is_system || String(existing?.id) === String(relation(actor.backend_role)?.id) || ['super_admin', 'superadmin', 'super-administrator'].includes(String(existing?.name || '').toLowerCase()))) return false;
    if (!superAdmin && (data.is_system === true || ['super_admin', 'superadmin', 'super-administrator'].includes(String(data.name || '').toLowerCase()))) return false;
  }

  if (uid === 'api::backend-admin.backend-admin' && hasOwn(data, 'backend_role')) {
    if (!superAdmin) return false;
    const target = config.action === 'create'
      ? null
      : await findByKey(strapi, uid, policyContext.params?.id);
    const currentEmail = String(policyContext.state?.user?.email || '').trim().toLowerCase();
    if (target && String(target.email || '').trim().toLowerCase() === currentEmail) return false;
    const roleKey = relationKey(data.backend_role);
    const role = await findByKey(strapi, 'api::backend-role.backend-role', roleKey);
    if (!role) return false;
  }

  if (uid === 'api::role-permission.role-permission') {
    const existing = config.action === 'create'
      ? null
      : await findByKey(strapi, uid, policyContext.params?.id, ['backend_role']);
    const currentRole = relation(existing?.backend_role);
    const requestedRoleKey = hasOwn(data, 'backend_role') ? relationKey(data.backend_role) : currentRole?.documentId ?? currentRole?.id;
    const targetRole = await findByKey(strapi, 'api::backend-role.backend-role', requestedRoleKey);
    if (!targetRole) return false;
    if (!superAdmin && (targetRole.is_system || String(targetRole.id) === String(relation(actor.backend_role)?.id))) return false;
  }

  return true;
}

async function findBackendAdmin(strapi, identity) {
  const email = String(identity?.email || '').trim().toLowerCase();
  if (!email) return null;
  return strapi.db.query(ADMIN_UID).findOne({
    where: { email: { $eqi: email } },
    populate: ['backend_role'],
  });
}

async function hasActions(strapi, roleId, moduleId, actions, enforceScope = false, moduleName = '') {
  const grants = await strapi.db.query(ROLE_PERMISSION_UID).findMany({
    where: { backend_role: roleId, permission_module: moduleId },
    populate: ['allowed_actions'],
  });
  const granted = new Set();
  for (const grant of grants || []) {
    const allowed = relation(grant.allowed_actions);
    for (const item of (Array.isArray(allowed) ? allowed : allowed ? [allowed] : [])) {
      if (item?.name) granted.add(String(item.name));
    }
  }
  const allowed = actions.every((action) => (ACTION_ALIASES[action] || [action]).some((name) => granted.has(name)));
  if (!allowed) return false;
  if (enforceScope && moduleName !== 'articles' && (grants || []).some((grant) => grant.data_scope && grant.data_scope !== 'all')) {
    // These content types do not have a consistent owner/department relation.
    // Until a module-specific scope adapter is configured, fail closed instead
    // of trusting the front-end filter and accidentally exposing all records.
    return false;
  }
  return true;
}

module.exports = async (policyContext, config = {}) => {
  const { strapi } = policyContext;
  const action = String(config.action || '').trim();
  const moduleName = String(config.moduleName || '').trim();
  if (!action || !moduleName) return false;

  const admin = await findBackendAdmin(strapi, policyContext.state?.user);
  if (!admin) {
    // Public website content is read-only. Do not let ordinary Users &
    // Permissions accounts or API identities mutate CMS-managed records.
    return config.publicRead === true && action === 'view' && ['GET', 'HEAD'].includes(policyContext.request.method);
  }
  if (admin.is_active !== true) return false;

  const role = relation(admin.backend_role);
  if (!role) return false;
  if (isPrivilegedRole(role)) return true;

  if (action === 'view' && config.uid === 'api::backend-admin.backend-admin') {
    const usersModule = await strapi.db.query(MODULE_UID).findOne({ where: { name: 'users', is_active: true } });
    const mayViewAllUsers = usersModule && await hasActions(strapi, role.id, usersModule.id, ['view']);
    if (!mayViewAllUsers && policyContext.request.method === 'GET') {
      const id = policyContext.params?.id;
      if (id) return String(id) === String(admin.id) || String(id) === String(admin.documentId);
      policyContext.query = {
        ...(policyContext.query || {}),
        filters: { ...(policyContext.query?.filters || {}), email: { $eqi: admin.email } },
      };
      return true;
    }
  }

  // Permission module/action records are display metadata. Let an active
  // backend user read these catalogs so permission UIs can resolve relations.
  if (action === 'view' && ['api::permission-module.permission-module', 'api::permission-action.permission-action'].includes(config.uid)) {
    return true;
  }

  if (action === 'view' && config.uid === 'api::role-permission.role-permission') {
    const canManageRoles = await strapi.db.query(MODULE_UID).findOne({ where: { name: 'roles', is_active: true } });
    const mayViewAllRoleGrants = canManageRoles && await hasActions(strapi, role.id, canManageRoles.id, ['view']);
    if (!mayViewAllRoleGrants) {
      // All admin accounts may load their own permission grants; querying a
      // different role still requires the explicit roles.view permission.
      policyContext.query = {
        ...(policyContext.query || {}),
        filters: {
          ...(policyContext.query?.filters || {}),
          backend_role: { id: { $eq: role.id } },
        },
      };
      return true;
    }
  }

  const module = await strapi.db.query(MODULE_UID).findOne({ where: { name: moduleName, is_active: true } });
  if (!module) return false;

  const data = policyContext.request.body?.data;
  const requiredActions = [action];
  if (action === 'update' && data && hasOwn(data, 'publishedAt')) {
    requiredActions.push(data.publishedAt ? 'publish' : 'unpublish');
  } else if (action === 'create' && data?.publishedAt) {
    requiredActions.push('publish');
  }

  if (!(await hasActions(strapi, role.id, module.id, requiredActions, true, moduleName))) return false;
  return protectPrivilegeBoundary(strapi, policyContext, config, admin);
};
