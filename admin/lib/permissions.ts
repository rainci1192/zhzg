import { strapiFetch } from './strapi-fetch';

/**
 * 权限管理系统 - Strapi 驱动版本（细粒度权限）
 */

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// 用户角色枚举（保留用于类型检查）
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  EDITOR = 'editor',
  REVIEWER = 'reviewer',
  ARTICLE_LEVEL1_REVIEWER = 'article_level1_reviewer',
  ARTICLE_LEVEL2_REVIEWER = 'article_level2_reviewer',
  VIEWER = 'viewer',
}

// 权限枚举（保留用于类型检查）
export enum Permission {
  VIEW_DASHBOARD = 'view_dashboard',
  MANAGE_ARTICLES = 'manage_articles',
  MANAGE_CATEGORIES = 'manage_categories',
  MANAGE_PAGES = 'manage_pages',
  MANAGE_LEADERS = 'manage_leaders',
  MANAGE_DEPARTMENTS = 'manage_departments',
  MANAGE_RESEARCH_INSTITUTIONS = 'manage_research_institutions',
  MANAGE_RESEARCH_TRANSFERS = 'manage_research_transfers',
  MANAGE_SUPERVISORS = 'manage_supervisors',
  MANAGE_PARTNERS = 'manage_partners',
  MANAGE_STUDENT_DOCUMENTS = 'manage_student_documents',
  MANAGE_STUDENT_SHOWCASES = 'manage_student_showcases',
  MANAGE_POLICY_DOCUMENTS = 'manage_policy_documents',
  MANAGE_DOWNLOAD_FILES = 'manage_download_files',
  MANAGE_BANNERS = 'manage_banners',
  MANAGE_LINKS = 'manage_links',
  MANAGE_SETTINGS = 'manage_settings',
  MANAGE_USERS = 'manage_users',
  MANAGE_REVIEW = 'manage_review',
  VIEW_LOGS = 'view_logs',
  MANAGE_BACKUP = 'manage_backup',
}

// Strapi 角色数据结构
export interface StrapiRole {
  id: number;
  documentId: string;
  name: string;
  display_name: string;
  description: string;
  permissions: string[];
  color: string;
  is_system: boolean;
}

// 细粒度权限数据结构
export interface RolePermission {
  id: number;
  documentId: string;
  permission_module: {
    id: number;
    name: string;
    display_name: string;
  };
  allowed_actions: Array<{
    id: number;
    name: string;
    display_name: string;
  }>;
  data_scope: string;
}

// 缓存
let rolesCache: StrapiRole[] | null = null;
let rolePermissionsCache: Record<string, Permission[]> = {};
let detailedPermissionsCache: Record<number, RolePermission[]> = {};
let permissionModulesCache: Array<Record<string, unknown>> | null = null;
let permissionActionsCache: Array<Record<string, unknown>> | null = null;

type PermissionRecord = Record<string, unknown>;

function unwrapPermissionRecord(value: unknown): PermissionRecord | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as PermissionRecord;
  const data = record.data && typeof record.data === 'object'
    ? record.data as PermissionRecord
    : record;
  const attributes = data.attributes && typeof data.attributes === 'object'
    ? data.attributes as PermissionRecord
    : data;
  return { ...attributes, id: data.id ?? attributes.id, documentId: data.documentId ?? attributes.documentId };
}

function permissionRelationItems(value: unknown): Array<{ raw: unknown; record: PermissionRecord | null }> {
  const wrapped = value && typeof value === 'object' && 'data' in value
    ? (value as { data?: unknown }).data
    : value;
  const values = Array.isArray(wrapped) ? wrapped : wrapped == null ? [] : [wrapped];
  return values.map((raw) => ({ raw, record: unwrapPermissionRecord(raw) }));
}

function findPermissionReference(
  raw: unknown,
  record: PermissionRecord | null,
  candidates: Array<Record<string, unknown>>,
) {
  if (record?.name) return record;
  const id = record?.id ?? (typeof raw === 'number' || typeof raw === 'string' ? raw : undefined);
  const documentId = record?.documentId;
  return candidates.find((candidate) =>
    (id != null && String(candidate.id) === String(id)) ||
    (documentId != null && String(candidate.documentId) === String(documentId))
  ) || null;
}

async function fetchPermissionCatalogs() {
  if (permissionModulesCache && permissionActionsCache) {
    return { modules: permissionModulesCache, actions: permissionActionsCache };
  }
  const [modulesResponse, actionsResponse] = await Promise.all([
    strapiFetch(`${STRAPI_URL}/api/permission-modules?pagination[pageSize]=100`),
    strapiFetch(`${STRAPI_URL}/api/permission-actions?pagination[pageSize]=100`),
  ]);
  if (!modulesResponse.ok || !actionsResponse.ok) {
    return { modules: [], actions: [] };
  }
  const [modulesPayload, actionsPayload] = await Promise.all([
    modulesResponse.json() as Promise<{ data?: unknown[] }>,
    actionsResponse.json() as Promise<{ data?: unknown[] }>,
  ]);
  permissionModulesCache = (modulesPayload.data || []).map(unwrapPermissionRecord).filter((item): item is PermissionRecord => Boolean(item));
  permissionActionsCache = (actionsPayload.data || []).map(unwrapPermissionRecord).filter((item): item is PermissionRecord => Boolean(item));
  return { modules: permissionModulesCache, actions: permissionActionsCache };
}

// 从 Strapi 获取所有角色
export async function fetchRoles(): Promise<StrapiRole[]> {
  if (rolesCache) {
    return rolesCache;
  }

  try {
    const response = await strapiFetch(`${STRAPI_URL}/api/backend-roles?sort=name:asc`);
    const data = await response.json();
    rolesCache = data.data;

    rolesCache?.forEach((role) => {
      rolePermissionsCache[role.name] = role.permissions as Permission[];
    });

    return rolesCache || [];
  } catch (error) {
    console.error('获取角色列表失败:', error);
    return [];
  }
}

// 获取角色的详细权限配置
export async function fetchRolePermissions(roleId: number): Promise<RolePermission[]> {
  if (detailedPermissionsCache[roleId]) {
    return detailedPermissionsCache[roleId];
  }

  try {
    const response = await strapiFetch(
      `${STRAPI_URL}/api/role-permissions?filters[backend_role][id][$eq]=${roleId}&populate=permission_module&populate=allowed_actions&pagination[pageSize]=100`
    );
    if (!response.ok) throw new Error(`加载角色权限失败: ${response.status}`);
    const data = await response.json() as { data?: unknown[] };
    const rawRecords = (data.data || []).map(unwrapPermissionRecord).filter((item): item is PermissionRecord => Boolean(item));
    const needsCatalogs = rawRecords.some((raw) => {
      const module = permissionRelationItems(raw.permission_module)[0];
      const actions = permissionRelationItems(raw.allowed_actions);
      return !module?.record?.name || actions.some(({ record }) => !record?.name);
    });
    const catalogs = needsCatalogs
      ? await fetchPermissionCatalogs().catch(() => ({ modules: [], actions: [] }))
      : { modules: [], actions: [] };
    detailedPermissionsCache[roleId] = rawRecords.flatMap((raw) => {
      const moduleItems = permissionRelationItems(raw.permission_module);
      const module = moduleItems.length
        ? findPermissionReference(moduleItems[0].raw, moduleItems[0].record, catalogs.modules)
        : null;
      if (!module?.name) return [];

      const allowedActions = permissionRelationItems(raw.allowed_actions)
        .map(({ raw: actionRaw, record: actionRecord }) => findPermissionReference(actionRaw, actionRecord, catalogs.actions))
        .filter((action): action is Record<string, unknown> => Boolean(action?.name));

      return [{
        id: Number(raw.id || 0),
        documentId: String(raw.documentId || ''),
        permission_module: module as RolePermission['permission_module'],
        allowed_actions: allowedActions as RolePermission['allowed_actions'],
        data_scope: String(raw.data_scope || 'all'),
      }];
    });
    return detailedPermissionsCache[roleId];
  } catch (error) {
    console.error('获取角色权限失败:', error);
    return [];
  }
}

// 获取角色的权限列表（旧版兼容）
export function getRolePermissions(roleName: string): Permission[] {
  return rolePermissionsCache[roleName] || [];
}

// 权限检查函数（旧版兼容）
export function isSuperAdminRole(roleName: string): boolean {
  return ['super_admin', 'superadmin', 'super-administrator'].includes(roleName.trim().toLowerCase());
}

export function hasPermission(userRole: string, permission: Permission): boolean {
  if (isSuperAdminRole(userRole)) return true;
  const rolePermissions = getRolePermissions(userRole);
  return rolePermissions.includes(permission);
}

// 检查用户是否有特定模块的特定操作权限（新版细粒度）
export async function hasModulePermission(
  roleId: number,
  moduleName: string,
  actionName: string
): Promise<boolean> {
  const permissions = await fetchRolePermissions(roleId);
  return permissions
    .filter((permission) => permission.permission_module.name === moduleName)
    .some((permission) => permission.allowed_actions.some((action) => action.name === actionName));
}

// 获取用户对某个模块的所有允许操作
export async function getModuleActions(
  roleId: number,
  moduleName: string
): Promise<string[]> {
  const permissions = await fetchRolePermissions(roleId);
  return [...new Set(permissions
    .filter((permission) => permission.permission_module.name === moduleName)
    .flatMap((permission) => permission.allowed_actions.map((action) => action.name)))];
}

// 获取用户对某个模块的数据范围
export async function getDataScope(
  roleId: number,
  moduleName: string
): Promise<string> {
  const permissions = await fetchRolePermissions(roleId);
  return permissions.find((permission) => permission.permission_module.name === moduleName)?.data_scope || 'none';
}

// 批量检查多个权限
export async function hasAnyModulePermission(
  roleId: number,
  moduleName: string,
  actionNames: string[]
): Promise<boolean> {
  const allowedActions = await getModuleActions(roleId, moduleName);
  return actionNames.some((action) => allowedActions.includes(action));
}

// 菜单路径与权限映射（旧版兼容）
export const MENU_PERMISSIONS: Record<string, Permission> = {
  '/dashboard': Permission.VIEW_DASHBOARD,
  '/dashboard/articles': Permission.MANAGE_ARTICLES,
  '/dashboard/categories': Permission.MANAGE_CATEGORIES,
  '/dashboard/pages': Permission.MANAGE_PAGES,
  '/dashboard/leaders': Permission.MANAGE_LEADERS,
  '/dashboard/departments': Permission.MANAGE_DEPARTMENTS,
  '/dashboard/research-institutions': Permission.MANAGE_RESEARCH_INSTITUTIONS,
  '/dashboard/research-transfers': Permission.MANAGE_RESEARCH_TRANSFERS,
  '/dashboard/supervisors': Permission.MANAGE_SUPERVISORS,
  '/dashboard/partners': Permission.MANAGE_PARTNERS,
  '/dashboard/student-documents': Permission.MANAGE_STUDENT_DOCUMENTS,
  '/dashboard/student-showcases': Permission.MANAGE_STUDENT_SHOWCASES,
  '/dashboard/policy-documents': Permission.MANAGE_POLICY_DOCUMENTS,
  '/dashboard/download-files': Permission.MANAGE_DOWNLOAD_FILES,
  '/dashboard/banners': Permission.MANAGE_BANNERS,
  '/dashboard/links': Permission.MANAGE_LINKS,
  '/dashboard/settings': Permission.MANAGE_SETTINGS,
  '/dashboard/users': Permission.MANAGE_USERS,
  '/dashboard/review': Permission.MANAGE_REVIEW,
  '/dashboard/logs': Permission.VIEW_LOGS,
  '/dashboard/backup': Permission.MANAGE_BACKUP,
};

// 路径与模块名映射（新版）
export const PATH_MODULE_MAP: Record<string, string> = {
  '/dashboard/articles': 'articles',
  '/dashboard/categories': 'categories',
  '/dashboard/pages': 'pages',
  '/dashboard/leaders': 'leaders',
  '/dashboard/departments': 'departments',
  '/dashboard/research-institutions': 'research_institutions',
  '/dashboard/research-transfers': 'research_transfers',
  '/dashboard/supervisors': 'supervisors',
  '/dashboard/partners': 'partners',
  '/dashboard/student-documents': 'student_documents',
  '/dashboard/student-showcases': 'student_showcases',
  '/dashboard/policy-documents': 'policy_documents',
  '/dashboard/download-files': 'download_files',
  '/dashboard/attachments': 'download_files',
  '/dashboard/banners': 'banners',
  '/dashboard/links': 'links',
  '/dashboard/settings': 'settings',
  '/dashboard/users': 'users',
  '/dashboard/roles': 'roles',
  '/dashboard/review': 'review',
  '/dashboard/logs': 'logs',
  '/dashboard/backup': 'backup',
};

// 检查用户是否可以访问某个路径（旧版兼容）
export function canAccessPath(userRole: string, path: string): boolean {
  const requiredPermission = MENU_PERMISSIONS[path];
  if (!requiredPermission) {
    return true;
  }
  return hasPermission(userRole, requiredPermission);
}

// 检查用户是否可以访问某个路径（新版细粒度）
export async function canAccessPathDetailed(
  roleId: number,
  path: string
): Promise<boolean> {
  const moduleName = PATH_MODULE_MAP[path];
  if (!moduleName) {
    return true; // 没有映射的路径默认允许访问
  }

  // 至少需要 view 权限
  return await hasModulePermission(roleId, moduleName, 'view');
}

// 获取用户可访问的菜单路径列表
export function getAccessiblePaths(userRole: string): string[] {
  return Object.keys(MENU_PERMISSIONS).filter((path) => canAccessPath(userRole, path));
}

// 清除缓存
export function clearRolesCache() {
  rolesCache = null;
  rolePermissionsCache = {};
}

export function clearPermissionsCache() {
  detailedPermissionsCache = {};
  permissionModulesCache = null;
  permissionActionsCache = null;
  clearRolesCache();
}
