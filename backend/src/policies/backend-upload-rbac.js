'use strict';

const ADMIN_UID = 'api::backend-admin.backend-admin';
const ROLE_PERMISSION_UID = 'api::role-permission.role-permission';
const CONTENT_MODULES = new Set([
  'articles', 'categories', 'pages', 'leaders', 'departments', 'research_institutions',
  'research_transfers', 'supervisors', 'partners', 'student_documents', 'student_showcases',
  'policy_documents', 'download_files', 'banners', 'links', 'settings',
]);

module.exports = async (policyContext, config = {}, { strapi } = {}) => {
  const method = policyContext.request.method;
  if (['GET', 'HEAD'].includes(method)) return true;

  const email = String(policyContext.state?.user?.email || '').trim().toLowerCase();
  if (!email || !strapi) return false;
  const admin = await strapi.db.query(ADMIN_UID).findOne({
    where: { email: { $eqi: email } },
    populate: ['backend_role'],
  });
  if (!admin || admin.is_active !== true) return false;
  const role = admin.backend_role?.data || admin.backend_role;
  if (!role) return false;
  if (['super_admin', 'superadmin', 'super-administrator'].includes(String(role.name || '').toLowerCase())) return true;
  // Deleting from Strapi's media library can break unrelated pages, so keep
  // permanent media deletion exclusive to super administrators.
  if (method === 'DELETE') return false;

  const grants = await strapi.db.query(ROLE_PERMISSION_UID).findMany({
    where: { backend_role: role.id },
    populate: ['permission_module', 'allowed_actions'],
  });
  const action = config.action || 'create';
  const acceptedActions = ['create', 'update', 'edit'];
  return (grants || []).some((grant) => {
    const module = grant.permission_module?.data || grant.permission_module;
    const actionsValue = grant.allowed_actions?.data || grant.allowed_actions;
    const actions = Array.isArray(actionsValue) ? actionsValue : actionsValue ? [actionsValue] : [];
    return CONTENT_MODULES.has(String(module?.name || '')) && actions.some((item) =>
      acceptedActions.includes(String(item?.name || ''))
    );
  });
};
