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
    ()=>hasPermission
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
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$strapi$2d$fetch$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["strapiFetch"])(`${STRAPI_URL}/api/role-permissions?filters[backend_role][id][$eq]=${roleId}&populate[permission_module]=*&populate[allowed_actions]=*`);
        const data = await response.json();
        detailedPermissionsCache[roleId] = data.data || [];
        return detailedPermissionsCache[roleId];
    } catch (error) {
        console.error('获取角色权限失败:', error);
        return [];
    }
}
function getRolePermissions(roleName) {
    return rolePermissionsCache[roleName] || [];
}
function hasPermission(userRole, permission) {
    const rolePermissions = getRolePermissions(userRole);
    return rolePermissions.includes(permission);
}
async function hasModulePermission(roleId, moduleName, actionName) {
    const permissions = await fetchRolePermissions(roleId);
    const modulePermission = permissions.find((p)=>p.permission_module.name === moduleName);
    if (!modulePermission) return false;
    return modulePermission.allowed_actions.some((action)=>action.name === actionName);
}
async function getModuleActions(roleId, moduleName) {
    const permissions = await fetchRolePermissions(roleId);
    const modulePermission = permissions.find((p)=>p.permission_module.name === moduleName);
    if (!modulePermission) return [];
    return modulePermission.allowed_actions.map((action)=>action.name);
}
async function getDataScope(roleId, moduleName) {
    const permissions = await fetchRolePermissions(roleId);
    const modulePermission = permissions.find((p)=>p.permission_module.name === moduleName);
    return modulePermission?.data_scope || 'none';
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
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$strapi$2d$fetch$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/strapi-fetch.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$permissions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/permissions.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
const STRAPI_URL = ("TURBOPACK compile-time value", "http://localhost:1337") || 'http://localhost:1337';
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function AuthProvider({ children }) {
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    // 初始化：从 localStorage 加载用户信息并获取角色数据
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const loadUser = async ()=>{
            try {
                // 先加载角色数据
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$permissions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fetchRoles"])();
                const savedUser = localStorage.getItem('auth_user');
                if (savedUser) {
                    setUser(JSON.parse(savedUser));
                } else {
                    // 默认用户（用于演示）
                    const defaultUser = {
                        id: '1',
                        name: '超级管理员',
                        // cspell:disable-next-line
                        username: 'superadmin',
                        email: 'super@example.com',
                        role: 'super_admin'
                    };
                    setUser(defaultUser);
                    localStorage.setItem('auth_user', JSON.stringify(defaultUser));
                }
            } catch (error) {
                console.error('加载用户信息失败:', error);
            } finally{
                setIsLoading(false);
            }
        };
        loadUser();
    }, []);
    const login = async (email, password)=>{
        setIsLoading(true);
        try {
            // 调用 Strapi API 登录
            const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$strapi$2d$fetch$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["strapiFetch"])(`${STRAPI_URL}/api/backend-admins?filters[email][$eq]=${email}&populate=backend_role`);
            const data = await response.json();
            if (data.data && data.data.length > 0) {
                const userData = data.data[0];
                // TODO: 实际项目中应该验证密码
                // 这里只是演示，实际应该调用 Strapi 的认证 API
                console.log('登录密码:', password);
                // 检查用户是否被禁用
                if (!userData.is_active) {
                    throw new Error('账户已被禁用');
                }
                const newUser = {
                    id: userData.id.toString(),
                    documentId: userData.documentId,
                    name: userData.name,
                    username: userData.username,
                    email: userData.email,
                    role: userData.backend_role?.name || 'viewer',
                    roleId: userData.backend_role?.id,
                    avatar: userData.avatar?.url,
                    is_active: userData.is_active
                };
                setUser(newUser);
                localStorage.setItem('auth_user', JSON.stringify(newUser));
                // 更新最后登录时间
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$strapi$2d$fetch$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["strapiFetch"])(`${STRAPI_URL}/api/backend-admins/${userData.documentId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        data: {
                            last_login: new Date().toISOString()
                        }
                    })
                });
            } else {
                throw new Error('用户不存在');
            }
        } catch (error) {
            console.error('登录失败:', error);
            throw error;
        } finally{
            setIsLoading(false);
        }
    };
    const logout = ()=>{
        setUser(null);
        localStorage.removeItem('auth_user');
    };
    const updateUserRole = (roleId, roleName)=>{
        if (user) {
            const updatedUser = {
                ...user,
                role: roleName,
                roleId
            };
            setUser(updatedUser);
            localStorage.setItem('auth_user', JSON.stringify(updatedUser));
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$permissions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clearRolesCache"])(); // 清除缓存以重新加载权限
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            isLoading,
            login,
            logout,
            updateUserRole
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/contexts/AuthContext.tsx",
        lineNumber: 141,
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

//# sourceMappingURL=%5Broot-of-the-server%5D__01ka15u._.js.map