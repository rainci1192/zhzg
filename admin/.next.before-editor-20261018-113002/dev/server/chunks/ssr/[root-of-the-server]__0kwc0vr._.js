module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/lib/strapi-fetch.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * 后台 Strapi 请求统一入口。
 * 从管理员登录时保存的 strapi_jwt 读取 JWT，并为 JSON 与文件上传请求附加认证头。
 */ __turbopack_context__.s([
    "strapiFetch",
    ()=>strapiFetch
]);
async function strapiFetch(input, init = {}) {
    const headers = new Headers(init.headers);
    const token = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : null;
    if (token && !headers.has('Authorization')) //TURBOPACK unreachable
    ;
    const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;
    if (init.body && !isFormData && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }
    return fetch(input, {
        ...init,
        headers,
        cache: init.cache ?? 'no-store'
    });
}
}),
"[project]/lib/api.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "adminLogin",
    ()=>adminLogin,
    "api",
    ()=>api,
    "uploadFile",
    ()=>uploadFile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$strapi$2d$fetch$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/strapi-fetch.ts [app-ssr] (ecmascript)");
;
const STRAPI_URL = ("TURBOPACK compile-time value", "http://localhost:1337") || 'http://localhost:1337';
async function strapiRequest(endpoint, options = {}) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$strapi$2d$fetch$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["strapiFetch"])(`${STRAPI_URL}${endpoint}`, options);
    if (!res.ok) {
        const errorData = await res.json().catch(()=>({}));
        let msg = `API Error: ${res.status}`;
        if (errorData && typeof errorData === 'object' && 'error' in errorData && errorData.error?.message) {
            msg = errorData.error.message;
        }
        if (res.status === 401) {
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
        }
        throw new Error(msg);
    }
    if (res.status === 204) return {};
    return res.json();
}
function isRelationObject(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    const obj = value;
    return 'connect' in obj || 'disconnect' in obj;
}
function normalizeRelations(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return {};
    }
    const result = {
        ...data
    };
    for (const key of Object.keys(result)){
        const val = result[key];
        if (isRelationObject(val)) {
            if (Array.isArray(val.connect)) {
                result[key] = val.connect.length > 0 ? val.connect[0].id : null;
            } else if (val.disconnect) {
                result[key] = null;
            }
        }
    }
    return result;
}
async function adminLogin(email, password) {
    const res = await fetch(`${STRAPI_URL}/api/backend-admins/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email,
            password
        }),
        cache: 'no-store'
    });
    if (!res.ok) {
        const errorData = await res.json().catch(()=>({}));
        let msg = `Login Error: ${res.status}`;
        if (errorData && typeof errorData === 'object' && 'error' in errorData && errorData.error?.message) {
            msg = errorData.error.message;
        }
        throw new Error(msg);
    }
    return res.json();
}
async function uploadFile(file) {
    const formData = new FormData();
    formData.append('files', file);
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$strapi$2d$fetch$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["strapiFetch"])(`${STRAPI_URL}/api/upload`, {
        method: 'POST',
        body: formData
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    return res.json();
}
const api = {
    // categories
    getCategories: (q = '')=>strapiRequest(`/api/categories${q}`),
    createCategory: (data)=>strapiRequest('/api/categories', {
            method: 'POST',
            body: JSON.stringify({
                data
            })
        }),
    updateCategory: (id, data)=>strapiRequest(`/api/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                data
            })
        }),
    deleteCategory: (id)=>strapiRequest(`/api/categories/${id}`, {
            method: 'DELETE'
        }),
    // articles（关联字段自动 normalize）
    getArticles: (q = '')=>strapiRequest(`/api/articles${q}`),
    getWorkflowArticles: (q = '')=>strapiRequest(`/api/article-workflow/list${q}`),
    getWorkflowStats: ()=>strapiRequest('/api/article-workflow/stats'),
    getArticleCategoryOptions: ()=>strapiRequest('/api/article-workflow/category-options'),
    getArticlePublisherFilterOptions: ()=>strapiRequest('/api/article-workflow/publisher-filter-options'),
    getArticle: (id)=>strapiRequest(`/api/article-workflow/${encodeURIComponent(id)}/preview`),
    createArticle: (data)=>{
        const payload = normalizeRelations(data);
        return strapiRequest('/api/articles', {
            method: 'POST',
            body: JSON.stringify({
                data: payload
            })
        });
    },
    updateArticle: (id, data)=>{
        const payload = normalizeRelations(data);
        return strapiRequest(`/api/articles/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                data: payload
            })
        });
    },
    getLevel1Reviewers: ()=>strapiRequest('/api/article-workflow/level1-reviewers'),
    getLevel2Reviewers: ()=>strapiRequest('/api/article-workflow/level2-reviewers'),
    getArticlePublishers: ()=>strapiRequest('/api/article-workflow/publishers'),
    getWorkflowTasks: ()=>strapiRequest('/api/article-workflow/tasks'),
    getWorkflowHistory: (limit = 100)=>strapiRequest(`/api/article-workflow/history?limit=${limit}`),
    getOperationLogs: (query = '')=>strapiRequest(`/api/operation-logs${query}`),
    submitArticleForReview: (id, level1ReviewerId)=>strapiRequest(`/api/article-workflow/${id}/submit`, {
            method: 'POST',
            body: JSON.stringify(level1ReviewerId ? {
                level1_reviewer_id: level1ReviewerId
            } : {})
        }),
    reviewArticleLevel1: (id, decision, comment, level2ReviewerId)=>strapiRequest(`/api/article-workflow/${id}/level1-review`, {
            method: 'POST',
            body: JSON.stringify({
                decision,
                comment,
                ...level2ReviewerId ? {
                    level2_reviewer_id: level2ReviewerId
                } : {}
            })
        }),
    reviewArticleLevel2: (id, decision, comment)=>strapiRequest(`/api/article-workflow/${id}/level2-review`, {
            method: 'POST',
            body: JSON.stringify({
                decision,
                comment
            })
        }),
    publishArticle: (id)=>strapiRequest(`/api/article-workflow/${id}/publish`, {
            method: 'POST',
            body: JSON.stringify({})
        }),
    unpublishArticle: (id, comment = '')=>strapiRequest(`/api/article-workflow/${id}/unpublish`, {
            method: 'POST',
            body: JSON.stringify({
                comment
            })
        }),
    deleteArticle: (id)=>strapiRequest(`/api/articles/${id}`, {
            method: 'DELETE'
        }),
    // banners (✅ 此处加入了 &populate=* 以便请求图片媒体数据)
    getBanners: (q = '?sort=sort_order:asc&populate=*')=>strapiRequest(`/api/banners${q}`),
    createBanner: (data)=>strapiRequest('/api/banners', {
            method: 'POST',
            body: JSON.stringify({
                data
            })
        }),
    updateBanner: (id, data)=>strapiRequest(`/api/banners/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                data
            })
        }),
    deleteBanner: (id)=>strapiRequest(`/api/banners/${id}`, {
            method: 'DELETE'
        }),
    // links
    getLinks: (q = '?sort=sort_order:asc')=>strapiRequest(`/api/links${q}`),
    createLink: (data)=>strapiRequest('/api/links', {
            method: 'POST',
            body: JSON.stringify({
                data
            })
        }),
    updateLink: (id, data)=>strapiRequest(`/api/links/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                data
            })
        }),
    deleteLink: (id)=>strapiRequest(`/api/links/${id}`, {
            method: 'DELETE'
        }),
    // attachments
    getAttachments: (q = '')=>strapiRequest(`/api/attachments${q}`),
    createAttachment: (data)=>strapiRequest('/api/attachments', {
            method: 'POST',
            body: JSON.stringify({
                data
            })
        }),
    updateAttachment: (id, data)=>strapiRequest(`/api/attachments/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                data
            })
        }),
    deleteAttachment: (id)=>strapiRequest(`/api/attachments/${id}`, {
            method: 'DELETE'
        }),
    // site-configs
    getSiteSetting: ()=>strapiRequest('/api/site-configs?pagination[pageSize]=1'),
    createSiteSetting: (data)=>strapiRequest('/api/site-configs', {
            method: 'POST',
            body: JSON.stringify({
                data
            })
        }),
    updateSiteSetting: (id, data)=>strapiRequest(`/api/site-configs/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                data
            })
        }),
    // custom
    getCategoryTree: ()=>strapiRequest('/api/categories/tree'),
    searchArticles: (q, page = 1, pageSize = 10)=>strapiRequest(`/api/search?q=${encodeURIComponent(q)}&page=${page}&pageSize=${pageSize}`)
};
}),
"[project]/lib/permissions.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MENU_PERMISSIONS",
    ()=>MENU_PERMISSIONS,
    "PATH_MODULE_MAP",
    ()=>PATH_MODULE_MAP,
    "Permission",
    ()=>Permission,
    "UserRole",
    ()=>UserRole,
    "canAccessPath",
    ()=>canAccessPath,
    "canAccessPathDetailed",
    ()=>canAccessPathDetailed,
    "clearPermissionsCache",
    ()=>clearPermissionsCache,
    "clearRolesCache",
    ()=>clearRolesCache,
    "fetchRolePermissions",
    ()=>fetchRolePermissions,
    "fetchRoles",
    ()=>fetchRoles,
    "getAccessiblePaths",
    ()=>getAccessiblePaths,
    "getDataScope",
    ()=>getDataScope,
    "getModuleActions",
    ()=>getModuleActions,
    "getRolePermissions",
    ()=>getRolePermissions,
    "hasAnyModulePermission",
    ()=>hasAnyModulePermission,
    "hasModulePermission",
    ()=>hasModulePermission,
    "hasPermission",
    ()=>hasPermission,
    "isSuperAdminRole",
    ()=>isSuperAdminRole
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$strapi$2d$fetch$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/strapi-fetch.ts [app-ssr] (ecmascript)");
;
/**
 * 权限管理系统 - Strapi 驱动版本（细粒度权限）
 */ const STRAPI_URL = ("TURBOPACK compile-time value", "http://localhost:1337") || 'http://localhost:1337';
var UserRole = /*#__PURE__*/ function(UserRole) {
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["ADMIN"] = "admin";
    UserRole["EDITOR"] = "editor";
    UserRole["REVIEWER"] = "reviewer";
    UserRole["ARTICLE_LEVEL1_REVIEWER"] = "article_level1_reviewer";
    UserRole["ARTICLE_LEVEL2_REVIEWER"] = "article_level2_reviewer";
    UserRole["VIEWER"] = "viewer";
    return UserRole;
}({});
var Permission = /*#__PURE__*/ function(Permission) {
    Permission["VIEW_DASHBOARD"] = "view_dashboard";
    Permission["MANAGE_ARTICLES"] = "manage_articles";
    Permission["MANAGE_CATEGORIES"] = "manage_categories";
    Permission["MANAGE_PAGES"] = "manage_pages";
    Permission["MANAGE_LEADERS"] = "manage_leaders";
    Permission["MANAGE_DEPARTMENTS"] = "manage_departments";
    Permission["MANAGE_RESEARCH_INSTITUTIONS"] = "manage_research_institutions";
    Permission["MANAGE_RESEARCH_TRANSFERS"] = "manage_research_transfers";
    Permission["MANAGE_SUPERVISORS"] = "manage_supervisors";
    Permission["MANAGE_PARTNERS"] = "manage_partners";
    Permission["MANAGE_STUDENT_DOCUMENTS"] = "manage_student_documents";
    Permission["MANAGE_STUDENT_SHOWCASES"] = "manage_student_showcases";
    Permission["MANAGE_POLICY_DOCUMENTS"] = "manage_policy_documents";
    Permission["MANAGE_DOWNLOAD_FILES"] = "manage_download_files";
    Permission["MANAGE_BANNERS"] = "manage_banners";
    Permission["MANAGE_LINKS"] = "manage_links";
    Permission["MANAGE_SETTINGS"] = "manage_settings";
    Permission["MANAGE_USERS"] = "manage_users";
    Permission["MANAGE_REVIEW"] = "manage_review";
    Permission["VIEW_LOGS"] = "view_logs";
    Permission["MANAGE_BACKUP"] = "manage_backup";
    return Permission;
}({});
// 缓存
let rolesCache = null;
let rolePermissionsCache = {};
let detailedPermissionsCache = {};
let permissionModulesCache = null;
let permissionActionsCache = null;
function unwrapPermissionRecord(value) {
    if (!value || typeof value !== 'object') return null;
    const record = value;
    const data = record.data && typeof record.data === 'object' ? record.data : record;
    const attributes = data.attributes && typeof data.attributes === 'object' ? data.attributes : data;
    return {
        ...attributes,
        id: data.id ?? attributes.id,
        documentId: data.documentId ?? attributes.documentId
    };
}
function permissionRelationItems(value) {
    const wrapped = value && typeof value === 'object' && 'data' in value ? value.data : value;
    const values = Array.isArray(wrapped) ? wrapped : wrapped == null ? [] : [
        wrapped
    ];
    return values.map((raw)=>({
            raw,
            record: unwrapPermissionRecord(raw)
        }));
}
function findPermissionReference(raw, record, candidates) {
    if (record?.name) return record;
    const id = record?.id ?? (typeof raw === 'number' || typeof raw === 'string' ? raw : undefined);
    const documentId = record?.documentId;
    return candidates.find((candidate)=>id != null && String(candidate.id) === String(id) || documentId != null && String(candidate.documentId) === String(documentId)) || null;
}
async function fetchPermissionCatalogs() {
    if (permissionModulesCache && permissionActionsCache) {
        return {
            modules: permissionModulesCache,
            actions: permissionActionsCache
        };
    }
    const [modulesResponse, actionsResponse] = await Promise.all([
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$strapi$2d$fetch$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["strapiFetch"])(`${STRAPI_URL}/api/permission-modules?pagination[pageSize]=100`),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$strapi$2d$fetch$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["strapiFetch"])(`${STRAPI_URL}/api/permission-actions?pagination[pageSize]=100`)
    ]);
    if (!modulesResponse.ok || !actionsResponse.ok) {
        return {
            modules: [],
            actions: []
        };
    }
    const [modulesPayload, actionsPayload] = await Promise.all([
        modulesResponse.json(),
        actionsResponse.json()
    ]);
    permissionModulesCache = (modulesPayload.data || []).map(unwrapPermissionRecord).filter((item)=>Boolean(item));
    permissionActionsCache = (actionsPayload.data || []).map(unwrapPermissionRecord).filter((item)=>Boolean(item));
    return {
        modules: permissionModulesCache,
        actions: permissionActionsCache
    };
}
async function fetchRoles() {
    if (rolesCache) {
        return rolesCache;
    }
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$strapi$2d$fetch$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["strapiFetch"])(`${STRAPI_URL}/api/backend-roles?sort=name:asc`);
        const data = await response.json();
        rolesCache = data.data;
        rolesCache?.forEach((role)=>{
            rolePermissionsCache[role.name] = role.permissions;
        });
        return rolesCache || [];
    } catch (error) {
        console.error('获取角色列表失败:', error);
        return [];
    }
}
async function fetchRolePermissions(roleId) {
    if (detailedPermissionsCache[roleId]) {
        return detailedPermissionsCache[roleId];
    }
    try {
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$strapi$2d$fetch$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["strapiFetch"])(`${STRAPI_URL}/api/role-permissions?filters[backend_role][id][$eq]=${roleId}&populate=permission_module&populate=allowed_actions&pagination[pageSize]=100`);
        if (!response.ok) throw new Error(`加载角色权限失败: ${response.status}`);
        const data = await response.json();
        const rawRecords = (data.data || []).map(unwrapPermissionRecord).filter((item)=>Boolean(item));
        const needsCatalogs = rawRecords.some((raw)=>{
            const module = permissionRelationItems(raw.permission_module)[0];
            const actions = permissionRelationItems(raw.allowed_actions);
            return !module?.record?.name || actions.some(({ record })=>!record?.name);
        });
        const catalogs = needsCatalogs ? await fetchPermissionCatalogs().catch(()=>({
                modules: [],
                actions: []
            })) : {
            modules: [],
            actions: []
        };
        detailedPermissionsCache[roleId] = rawRecords.flatMap((raw)=>{
            const moduleItems = permissionRelationItems(raw.permission_module);
            const module = moduleItems.length ? findPermissionReference(moduleItems[0].raw, moduleItems[0].record, catalogs.modules) : null;
            if (!module?.name) return [];
            const allowedActions = permissionRelationItems(raw.allowed_actions).map(({ raw: actionRaw, record: actionRecord })=>findPermissionReference(actionRaw, actionRecord, catalogs.actions)).filter((action)=>Boolean(action?.name));
            return [
                {
                    id: Number(raw.id || 0),
                    documentId: String(raw.documentId || ''),
                    permission_module: module,
                    allowed_actions: allowedActions,
                    data_scope: String(raw.data_scope || 'all')
                }
            ];
        });
        return detailedPermissionsCache[roleId];
    } catch (error) {
        console.error('获取角色权限失败:', error);
        return [];
    }
}
function getRolePermissions(roleName) {
    return rolePermissionsCache[roleName] || [];
}
function isSuperAdminRole(roleName) {
    return [
        'super_admin',
        'superadmin',
        'super-administrator'
    ].includes(roleName.trim().toLowerCase());
}
function hasPermission(userRole, permission) {
    if (isSuperAdminRole(userRole)) return true;
    const rolePermissions = getRolePermissions(userRole);
    return rolePermissions.includes(permission);
}
async function hasModulePermission(roleId, moduleName, actionName) {
    const permissions = await fetchRolePermissions(roleId);
    return permissions.filter((permission)=>permission.permission_module.name === moduleName).some((permission)=>permission.allowed_actions.some((action)=>action.name === actionName));
}
async function getModuleActions(roleId, moduleName) {
    const permissions = await fetchRolePermissions(roleId);
    return [
        ...new Set(permissions.filter((permission)=>permission.permission_module.name === moduleName).flatMap((permission)=>permission.allowed_actions.map((action)=>action.name)))
    ];
}
async function getDataScope(roleId, moduleName) {
    const permissions = await fetchRolePermissions(roleId);
    return permissions.find((permission)=>permission.permission_module.name === moduleName)?.data_scope || 'none';
}
async function hasAnyModulePermission(roleId, moduleName, actionNames) {
    const allowedActions = await getModuleActions(roleId, moduleName);
    return actionNames.some((action)=>allowedActions.includes(action));
}
const MENU_PERMISSIONS = {
    '/dashboard': "view_dashboard",
    '/dashboard/articles': "manage_articles",
    '/dashboard/categories': "manage_categories",
    '/dashboard/pages': "manage_pages",
    '/dashboard/leaders': "manage_leaders",
    '/dashboard/departments': "manage_departments",
    '/dashboard/research-institutions': "manage_research_institutions",
    '/dashboard/research-transfers': "manage_research_transfers",
    '/dashboard/supervisors': "manage_supervisors",
    '/dashboard/partners': "manage_partners",
    '/dashboard/student-documents': "manage_student_documents",
    '/dashboard/student-showcases': "manage_student_showcases",
    '/dashboard/policy-documents': "manage_policy_documents",
    '/dashboard/download-files': "manage_download_files",
    '/dashboard/banners': "manage_banners",
    '/dashboard/links': "manage_links",
    '/dashboard/settings': "manage_settings",
    '/dashboard/users': "manage_users",
    '/dashboard/review': "manage_review",
    '/dashboard/logs': "view_logs",
    '/dashboard/backup': "manage_backup"
};
const PATH_MODULE_MAP = {
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
    '/dashboard/backup': 'backup'
};
function canAccessPath(userRole, path) {
    const requiredPermission = MENU_PERMISSIONS[path];
    if (!requiredPermission) {
        return true;
    }
    return hasPermission(userRole, requiredPermission);
}
async function canAccessPathDetailed(roleId, path) {
    const moduleName = PATH_MODULE_MAP[path];
    if (!moduleName) {
        return true; // 没有映射的路径默认允许访问
    }
    // 至少需要 view 权限
    return await hasModulePermission(roleId, moduleName, 'view');
}
function getAccessiblePaths(userRole) {
    return Object.keys(MENU_PERMISSIONS).filter((path)=>canAccessPath(userRole, path));
}
function clearRolesCache() {
    rolesCache = null;
    rolePermissionsCache = {};
}
function clearPermissionsCache() {
    detailedPermissionsCache = {};
    permissionModulesCache = null;
    permissionActionsCache = null;
    clearRolesCache();
}
}),
"[project]/contexts/AuthContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$strapi$2d$fetch$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/strapi-fetch.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$permissions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/permissions.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
const STRAPI_URL = ("TURBOPACK compile-time value", "http://localhost:1337") || 'http://localhost:1337';
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function clearStoredSession() {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
}
function unwrapRecord(value) {
    if (!value || typeof value !== 'object') return null;
    const record = value;
    if (record.attributes && typeof record.attributes === 'object') {
        return {
            ...record.attributes,
            id: record.id,
            documentId: record.documentId
        };
    }
    return record;
}
function unwrapRelation(value) {
    if (!value || typeof value !== 'object') return null;
    const relation = value;
    return unwrapRecord(relation.data ?? value);
}
async function fetchCurrentAdmin() {
    const identityResponse = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$strapi$2d$fetch$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["strapiFetch"])(`${STRAPI_URL}/api/users/me?populate=role`);
    if (!identityResponse.ok) {
        throw new Error('登录状态已失效，请重新登录。');
    }
    const identity = await identityResponse.json();
    const email = identity.email?.trim();
    if (!email) {
        throw new Error('Strapi 未返回有效的账号邮箱，请联系管理员检查账号。');
    }
    const profileUrl = `${STRAPI_URL}/api/backend-admins` + `?filters[email][$eq]=${encodeURIComponent(email)}` + '&populate[backend_role]=true&populate[avatar]=true';
    const profileResponse = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$strapi$2d$fetch$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["strapiFetch"])(profileUrl);
    if (!profileResponse.ok) {
        throw new Error(`无法读取后台管理员资料（HTTP ${profileResponse.status}），请联系管理员检查 Strapi API 权限。`);
    }
    const profileResult = await profileResponse.json();
    const profile = unwrapRecord(profileResult.data?.[0]);
    if (!profile) {
        throw new Error('此 Strapi 账号尚未关联后台管理员资料，请联系管理员完成账号绑定。');
    }
    const profileEmail = String(profile.email ?? '').trim().toLowerCase();
    if (profileEmail !== email.toLowerCase()) {
        throw new Error('后台管理员邮箱与 Strapi 登录账号不一致，请联系管理员检查账号绑定。');
    }
    if (profile.is_active !== true) {
        throw new Error('此后台账号已停用，请联系管理员。');
    }
    const role = unwrapRelation(profile.backend_role);
    const roleId = Number(role?.id);
    const roleName = typeof role?.name === 'string' ? role.name : '';
    if (!Number.isFinite(roleId) || roleId <= 0 || !roleName) {
        throw new Error('此后台账号尚未分配有效角色，请联系管理员。');
    }
    const avatar = unwrapRelation(profile.avatar);
    const avatarUrl = typeof avatar?.url === 'string' ? avatar.url : undefined;
    return {
        id: String(profile.id ?? identity.id ?? ''),
        documentId: String(profile.documentId ?? ''),
        name: String(profile.name ?? identity.username ?? email),
        username: String(profile.username ?? identity.username ?? email),
        email,
        role: roleName,
        roleId,
        permissions: Array.isArray(role?.permissions) ? role.permissions.filter((permission)=>typeof permission === 'string') : [],
        avatar: avatarUrl,
        is_active: true
    };
}
function AuthProvider({ children }) {
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let cancelled = false;
        const restoreSession = async ()=>{
            const token = window.localStorage.getItem('strapi_jwt');
            // Never trust the old locally stored demo identity.
            window.localStorage.removeItem('auth_user');
            if (!token) {
                setUser(null);
                setIsLoading(false);
                return;
            }
            try {
                const currentUser = await fetchCurrentAdmin();
                if (!cancelled) setUser(currentUser);
            } catch (error) {
                console.error('恢复后台登录状态失败:', error);
                clearStoredSession();
                if (!cancelled) setUser(null);
            } finally{
                if (!cancelled) setIsLoading(false);
            }
        };
        void restoreSession();
        return ()=>{
            cancelled = true;
        };
    }, []);
    const login = async (email, password)=>{
        setIsLoading(true);
        try {
            const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["adminLogin"])(email.trim(), password);
            window.localStorage.setItem('strapi_jwt', response.jwt);
            window.localStorage.setItem('strapi_user', JSON.stringify(response.user));
            const currentUser = await fetchCurrentAdmin();
            setUser(currentUser);
        } catch (error) {
            clearStoredSession();
            setUser(null);
            throw error;
        } finally{
            setIsLoading(false);
        }
    };
    const logout = ()=>{
        clearStoredSession();
        setUser(null);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            isLoading,
            login,
            logout
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/contexts/AuthContext.tsx",
        lineNumber: 194,
        columnNumber: 5
    }, this);
}
function useAuth() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/dynamic-access-async-storage.external.js [external] (next/dist/server/app-render/dynamic-access-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/dynamic-access-async-storage.external.js", () => require("next/dist/server/app-render/dynamic-access-async-storage.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0kwc0vr._.js.map