(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/hooks/useModulePermission.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useModulePermission",
    ()=>useModulePermission
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/contexts/AuthContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$permissions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/permissions.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
;
;
function useModulePermission(moduleName) {
    _s();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const [permissions, setPermissions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        canView: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
        canPublish: false,
        canUnpublish: false,
        canReview: false,
        canExport: false,
        canImport: false,
        dataScope: 'none',
        allowedActions: [],
        loading: true
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useModulePermission.useEffect": ()=>{
            const loadPermissions = {
                "useModulePermission.useEffect.loadPermissions": async ()=>{
                    if (!user?.roleId) {
                        setPermissions({
                            "useModulePermission.useEffect.loadPermissions": (prev)=>({
                                    ...prev,
                                    loading: false
                                })
                        }["useModulePermission.useEffect.loadPermissions"]);
                        return;
                    }
                    try {
                        const [canView, canCreate, canUpdate, canDelete, canPublish, canUnpublish, canReview, canExport, canImport, dataScope, allowedActions] = await Promise.all([
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$permissions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasModulePermission"])(user.roleId, moduleName, 'view'),
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$permissions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasModulePermission"])(user.roleId, moduleName, 'create'),
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$permissions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasModulePermission"])(user.roleId, moduleName, 'update'),
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$permissions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasModulePermission"])(user.roleId, moduleName, 'delete'),
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$permissions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasModulePermission"])(user.roleId, moduleName, 'publish'),
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$permissions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasModulePermission"])(user.roleId, moduleName, 'unpublish'),
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$permissions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasModulePermission"])(user.roleId, moduleName, 'review'),
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$permissions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasModulePermission"])(user.roleId, moduleName, 'export'),
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$permissions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasModulePermission"])(user.roleId, moduleName, 'import'),
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$permissions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDataScope"])(user.roleId, moduleName),
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$permissions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getModuleActions"])(user.roleId, moduleName)
                        ]);
                        setPermissions({
                            canView,
                            canCreate,
                            canUpdate,
                            canDelete,
                            canPublish,
                            canUnpublish,
                            canReview,
                            canExport,
                            canImport,
                            dataScope,
                            allowedActions,
                            loading: false
                        });
                    } catch (error) {
                        console.error('加载权限失败:', error);
                        setPermissions({
                            "useModulePermission.useEffect.loadPermissions": (prev)=>({
                                    ...prev,
                                    loading: false
                                })
                        }["useModulePermission.useEffect.loadPermissions"]);
                    }
                }
            }["useModulePermission.useEffect.loadPermissions"];
            loadPermissions();
        }
    }["useModulePermission.useEffect"], [
        user?.roleId,
        moduleName
    ]);
    return permissions;
}
_s(useModulePermission, "FMEPKrqL19bAGao7l1l8tXG4rBs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/(dashboard)/dashboard/articles/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ArticlesPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$pen$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/square-pen.js [app-client] (ecmascript) <export default as Edit>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.js [app-client] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/send.js [app-client] (ecmascript) <export default as Send>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check-big.js [app-client] (ecmascript) <export default as CheckCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-x.js [app-client] (ecmascript) <export default as XCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.js [app-client] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/message-square.js [app-client] (ecmascript) <export default as MessageSquare>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user.js [app-client] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-up.js [app-client] (ecmascript) <export default as ChevronUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$funnel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Filter$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/funnel.js [app-client] (ecmascript) <export default as Filter>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-ccw.js [app-client] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/contexts/AuthContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useModulePermission$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useModulePermission.ts [app-client] (ecmascript)");
;
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
const WordLikeEditor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.A("[project]/components/editor/WordLikeEditor.tsx [app-client] (ecmascript, next/dynamic entry, async loader)"), {
    loadableGenerated: {
        modules: [
            "[project]/components/editor/WordLikeEditor.tsx [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
_c = WordLikeEditor;
const STRAPI_URL = ("TURBOPACK compile-time value", "http://localhost:1337") || 'http://localhost:1337';
const FRONTEND_URL = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000';
function relationName(relation) {
    const value = relation && typeof relation === 'object' && 'data' in relation ? relation.data : relation;
    return value?.name || value?.email || '未记录';
}
function formatDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('zh-CN', {
        hour12: false
    });
}
function localDateBoundary(value, endOfDay = false) {
    if (!value) return '';
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day, endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0, endOfDay ? 999 : 0);
    return date.toISOString();
}
const LEVEL1_ROLES = new Set([
    'article_level1_reviewer',
    'level1_reviewer',
    'reviewer_level1'
]);
const LEVEL2_ROLES = new Set([
    'article_level2_reviewer',
    'level2_reviewer',
    'reviewer_level2'
]);
const EDITABLE_STATUSES = new Set([
    'draft',
    'rejected_level1',
    'rejected_level2',
    'rejected_republish',
    'rejected_admin',
    'rejected_leader',
    'unpublished',
    'published'
]);
const STATUS_OPTIONS = [
    {
        value: 'draft',
        label: '草稿'
    },
    {
        value: 'pending_level1',
        label: '待一级审核'
    },
    {
        value: 'rejected_level1',
        label: '一级审核退回'
    },
    {
        value: 'pending_level2',
        label: '待二级审核'
    },
    {
        value: 'rejected_level2',
        label: '二级审核退回'
    },
    {
        value: 'pending_republish',
        label: '修改待二级审核'
    },
    {
        value: 'rejected_republish',
        label: '修改审核退回'
    },
    {
        value: 'approved_pending_publish',
        label: '待发布'
    },
    {
        value: 'published',
        label: '已发布'
    },
    {
        value: 'unpublished',
        label: '已取消发布'
    },
    {
        value: 'pending_admin',
        label: '待一级审核（旧状态）'
    },
    {
        value: 'rejected_admin',
        label: '一级审核退回（旧状态）'
    },
    {
        value: 'pending_leader',
        label: '待二级审核（旧状态）'
    },
    {
        value: 'rejected_leader',
        label: '二级审核退回（旧状态）'
    },
    {
        value: 'approved',
        label: '待发布（旧状态）'
    }
];
const EMPTY_FILTERS = {
    publisherId: '',
    primaryCategoryId: '',
    secondaryCategoryId: '',
    status: '',
    publishFrom: '',
    publishTo: '',
    updatedFrom: '',
    updatedTo: ''
};
function uniqueReviewers(items) {
    const seen = new Set();
    return (items || []).filter((item)=>{
        const key = String(item.email || item.documentId || item.id || '').trim().toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}
function relationMatches(relation, user) {
    if (!relation || !user) return false;
    const raw = relation;
    const nested = raw.data || raw;
    const attributes = nested.attributes || nested;
    const normalized = {
        ...attributes,
        id: nested.id ?? attributes.id,
        documentId: nested.documentId ?? attributes.documentId
    };
    return normalized.id != null && String(normalized.id) === String(user.id) || Boolean(normalized.documentId && user.documentId && normalized.documentId === user.documentId) || Boolean(normalized.email && user.email && normalized.email.trim().toLowerCase() === user.email.trim().toLowerCase());
}
function ArticlesPage() {
    _s();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const articlePermissions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useModulePermission$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModulePermission"])('articles');
    const userRole = user?.role || '';
    const isSuperAdmin = userRole === 'super_admin';
    const isLevel1 = isSuperAdmin || LEVEL1_ROLES.has(userRole);
    const isLevel2 = isSuperAdmin || LEVEL2_ROLES.has(userRole);
    const canCreateArticle = isSuperAdmin || !articlePermissions.loading && articlePermissions.canCreate;
    const canUpdateArticle = isSuperAdmin || !articlePermissions.loading && articlePermissions.canUpdate;
    const canDeleteArticle = isSuperAdmin || !articlePermissions.loading && articlePermissions.canDelete;
    const canPublishArticle = isSuperAdmin || !articlePermissions.loading && articlePermissions.canPublish;
    const canUnpublishArticle = isSuperAdmin || !articlePermissions.loading && articlePermissions.canUnpublish;
    const canReviewArticle = isSuperAdmin || !articlePermissions.loading && articlePermissions.canReview;
    const [articles, setArticles] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [categories, setCategories] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [publishers, setPublishers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [level1Reviewers, setLevel1Reviewers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [level2Reviewers, setLevel2Reviewers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [page, setPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const [total, setTotal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const pageSize = 10;
    const [filterDraft, setFilterDraft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(EMPTY_FILTERS);
    const [appliedFilters, setAppliedFilters] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(EMPTY_FILTERS);
    const [filtersOpen, setFiltersOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [sortField, setSortField] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('createdAt');
    const [sortDirection, setSortDirection] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('desc');
    const [isModalOpen, setIsModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [editingKey, setEditingKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [reviewingArticle, setReviewingArticle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [reviewComment, setReviewComment] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [reviewAction, setReviewAction] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('approve');
    const [selectedLevel2Reviewer, setSelectedLevel2Reviewer] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [isSubmitModalOpen, setIsSubmitModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [submittingArticle, setSubmittingArticle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedLevel1Reviewer, setSelectedLevel1Reviewer] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [form, setForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        title: '',
        summary: '',
        content: '',
        primaryCategoryId: '',
        secondaryCategoryId: '',
        coverId: '',
        coverPreview: '',
        publisherId: '',
        publisherLabel: ''
    });
    const [coverFile, setCoverFile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const getKey = (article)=>article.documentId || String(article.id);
    const fetchArticles = async (targetPage = page, targetFilters = appliedFilters, targetSortField = sortField, targetSortDirection = sortDirection)=>{
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('populate', '*');
            params.set('pagination[page]', String(targetPage));
            params.set('pagination[pageSize]', String(pageSize));
            params.set('sort', `${targetSortField}:${targetSortDirection}`);
            if (targetFilters.publisherId) params.set('filters[created_by_admin][id][$eq]', targetFilters.publisherId);
            if (targetFilters.primaryCategoryId) params.set('filters[primary_category][id][$eq]', targetFilters.primaryCategoryId);
            if (targetFilters.secondaryCategoryId) params.set('filters[secondary_category][id][$eq]', targetFilters.secondaryCategoryId);
            if (targetFilters.status) params.set('filters[review_status][$eq]', targetFilters.status);
            if (targetFilters.publishFrom) params.set('filters[publish_time][$gte]', localDateBoundary(targetFilters.publishFrom));
            if (targetFilters.publishTo) params.set('filters[publish_time][$lte]', localDateBoundary(targetFilters.publishTo, true));
            if (targetFilters.updatedFrom) params.set('filters[updatedAt][$gte]', localDateBoundary(targetFilters.updatedFrom));
            if (targetFilters.updatedTo) params.set('filters[updatedAt][$lte]', localDateBoundary(targetFilters.updatedTo, true));
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].getWorkflowArticles(`?${params.toString()}`);
            setArticles(response.data || []);
            setTotal(Number(response.meta?.pagination?.total || 0));
        } catch (error) {
            console.error('fetchArticles error:', error);
            setArticles([]);
            setTotal(0);
        } finally{
            setLoading(false);
        }
    };
    const fetchCategories = async ()=>{
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].getArticleCategoryOptions();
            setCategories(response.data || []);
        } catch (error) {
            console.error('fetchCategories error:', error);
            setCategories([]);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ArticlesPage.useEffect": ()=>{
            void fetchCategories();
        }
    }["ArticlesPage.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ArticlesPage.useEffect": ()=>{
            void fetchArticles(page, appliedFilters, sortField, sortDirection);
        }
    }["ArticlesPage.useEffect"], [
        page,
        appliedFilters,
        sortField,
        sortDirection
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ArticlesPage.useEffect": ()=>{
            void ({
                "ArticlesPage.useEffect": async ()=>{
                    try {
                        if (!user?.id) return;
                        const response = await (isSuperAdmin ? __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].getArticlePublishers() : __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].getArticlePublisherFilterOptions());
                        setPublishers(uniqueReviewers(response.data || []));
                    } catch (error) {
                        console.error('fetch article publishers error:', error);
                        setPublishers([]);
                    }
                }
            })["ArticlesPage.useEffect"]();
        }
    }["ArticlesPage.useEffect"], [
        isSuperAdmin,
        user?.id
    ]);
    const primaryOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ArticlesPage.useMemo[primaryOptions]": ()=>categories.filter({
                "ArticlesPage.useMemo[primaryOptions]": (category)=>!category.parentCategory || category.level === 1
            }["ArticlesPage.useMemo[primaryOptions]"])
    }["ArticlesPage.useMemo[primaryOptions]"], [
        categories
    ]);
    const secondaryOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ArticlesPage.useMemo[secondaryOptions]": ()=>{
            const primaryId = Number(form.primaryCategoryId);
            if (!primaryId) return [];
            return categories.filter({
                "ArticlesPage.useMemo[secondaryOptions]": (category)=>{
                    const parentId = category.parentCategory?.id ?? category.parent?.id ?? null;
                    return parentId === primaryId;
                }
            }["ArticlesPage.useMemo[secondaryOptions]"]);
        }
    }["ArticlesPage.useMemo[secondaryOptions]"], [
        categories,
        form.primaryCategoryId
    ]);
    const filterSecondaryOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ArticlesPage.useMemo[filterSecondaryOptions]": ()=>{
            const primaryId = Number(filterDraft.primaryCategoryId);
            return categories.filter({
                "ArticlesPage.useMemo[filterSecondaryOptions]": (category)=>{
                    const parentId = category.parentCategory?.id ?? category.parent?.id ?? null;
                    return primaryId ? parentId === primaryId : Boolean(parentId) || category.level === 2;
                }
            }["ArticlesPage.useMemo[filterSecondaryOptions]"]);
        }
    }["ArticlesPage.useMemo[filterSecondaryOptions]"], [
        categories,
        filterDraft.primaryCategoryId
    ]);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const applyFilters = ()=>{
        if (filterDraft.publishFrom && filterDraft.publishTo && filterDraft.publishFrom > filterDraft.publishTo) {
            alert('发布时间的开始日期不能晚于结束日期。');
            return;
        }
        if (filterDraft.updatedFrom && filterDraft.updatedTo && filterDraft.updatedFrom > filterDraft.updatedTo) {
            alert('修改时间的开始日期不能晚于结束日期。');
            return;
        }
        setPage(1);
        setAppliedFilters({
            ...filterDraft
        });
    };
    const resetFilters = ()=>{
        setFilterDraft(EMPTY_FILTERS);
        setAppliedFilters(EMPTY_FILTERS);
        setPage(1);
    };
    const toggleSort = (field)=>{
        setPage(1);
        if (sortField === field) {
            setSortDirection((current)=>current === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };
    const renderSortIcon = (field)=>{
        if (sortField !== field) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "ml-1 text-gray-300",
            children: "↕"
        }, void 0, false, {
            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
            lineNumber: 362,
            columnNumber: 37
        }, this);
        return sortDirection === 'asc' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__["ChevronUp"], {
            className: "ml-1 inline h-3.5 w-3.5"
        }, void 0, false, {
            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
            lineNumber: 363,
            columnNumber: 38
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
            className: "ml-1 inline h-3.5 w-3.5"
        }, void 0, false, {
            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
            lineNumber: 363,
            columnNumber: 90
        }, this);
    };
    const openModal = (article)=>{
        if (article) {
            setEditingKey(getKey(article));
            setForm({
                title: article.title || '',
                summary: article.summary || '',
                content: article.content || '',
                primaryCategoryId: article.primary_category?.id ? String(article.primary_category.id) : '',
                secondaryCategoryId: article.secondary_category?.id ? String(article.secondary_category.id) : '',
                coverId: article.cover?.id ? String(article.cover.id) : '',
                coverPreview: article.cover?.url ? `${STRAPI_URL}${article.cover.url}` : '',
                publisherId: article.created_by_admin?.documentId || (article.created_by_admin?.id != null ? String(article.created_by_admin.id) : ''),
                publisherLabel: relationName(article.created_by_admin)
            });
        } else {
            setEditingKey(null);
            setForm({
                title: '',
                summary: '',
                content: '',
                primaryCategoryId: '',
                secondaryCategoryId: '',
                coverId: '',
                coverPreview: '',
                publisherId: user?.documentId || user?.id || '',
                publisherLabel: user?.name || user?.email || ''
            });
        }
        setCoverFile(null);
        setIsModalOpen(true);
    };
    const handleEditorUpload = async (file)=>{
        const uploaded = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["uploadFile"])(file);
        const url = uploaded?.[0]?.url || '';
        return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
    };
    const saveArticle = async (event)=>{
        event.preventDefault();
        if (!form.title.trim()) return alert('标题不能为空');
        if (!form.primaryCategoryId) return alert('请选择一级分类');
        try {
            let coverId = form.coverId;
            if (coverFile) {
                const uploaded = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["uploadFile"])(coverFile);
                if (uploaded?.[0]?.id) coverId = String(uploaded[0].id);
            }
            const payload = {
                title: form.title,
                summary: form.summary,
                content: form.content,
                primary_category: Number(form.primaryCategoryId),
                secondary_category: form.secondaryCategoryId ? Number(form.secondaryCategoryId) : null,
                cover: coverId ? Number(coverId) : null
            };
            if (isSuperAdmin && form.publisherId) {
                payload.created_by_admin = form.publisherId;
            }
            if (editingKey) await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].updateArticle(editingKey, payload);
            else await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].createArticle(payload);
            setIsModalOpen(false);
            await fetchArticles();
            alert('保存成功！');
        } catch (error) {
            alert(`保存失败：${error instanceof Error ? error.message : '未知错误'}`);
        }
    };
    const openSubmitModal = async (article)=>{
        if (article.review_status === 'rejected_republish') {
            setSubmittingArticle(article);
            setSelectedLevel1Reviewer('__republish__');
            setIsSubmitModalOpen(true);
            return;
        }
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].getLevel1Reviewers();
            const reviewers = uniqueReviewers(response.data || []);
            if (reviewers.length === 0) return alert('当前没有可选的一级审核人员，请先配置一级审核角色用户。');
            setLevel1Reviewers(reviewers);
            setSubmittingArticle(article);
            setSelectedLevel1Reviewer(reviewers.length === 1 ? String(reviewers[0].documentId || reviewers[0].id) : '');
            setIsSubmitModalOpen(true);
        } catch (error) {
            alert(`读取一级审核人员失败：${error instanceof Error ? error.message : '未知错误'}`);
        }
    };
    const submitForReview = async ()=>{
        if (!submittingArticle || !selectedLevel1Reviewer) return alert('请选择审核人员。');
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].submitArticleForReview(getKey(submittingArticle), selectedLevel1Reviewer === '__republish__' ? undefined : selectedLevel1Reviewer);
            setIsSubmitModalOpen(false);
            setSubmittingArticle(null);
            await fetchArticles();
            alert('文章已提交给一级审核人员。');
        } catch (error) {
            alert(`提交审核失败：${error instanceof Error ? error.message : '未知错误'}`);
        }
    };
    const openReviewModal = async (article, action)=>{
        setReviewingArticle(article);
        setReviewAction(action);
        setReviewComment('');
        setSelectedLevel2Reviewer('');
        if (action === 'approve' && (article.review_status === 'pending_level1' || article.review_status === 'pending_admin')) {
            try {
                const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].getLevel2Reviewers();
                const reviewers = uniqueReviewers(response.data || []);
                if (reviewers.length === 0) {
                    alert('当前没有可选的二级审核人员，请先配置二级审核角色用户。');
                    return;
                }
                setLevel2Reviewers(reviewers);
                setSelectedLevel2Reviewer(reviewers.length === 1 ? String(reviewers[0].documentId || reviewers[0].id) : '');
            } catch (error) {
                alert(`读取二级审核人员失败：${error instanceof Error ? error.message : '未知错误'}`);
                return;
            }
        }
        setIsReviewModalOpen(true);
    };
    const handleReview = async ()=>{
        if (!reviewingArticle) return;
        try {
            if (reviewingArticle.review_status === 'pending_level1' || reviewingArticle.review_status === 'pending_admin') {
                if (reviewAction === 'approve' && !selectedLevel2Reviewer) return alert('请选择二级审核人员。');
                await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].reviewArticleLevel1(getKey(reviewingArticle), reviewAction, reviewComment, selectedLevel2Reviewer);
            } else {
                await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].reviewArticleLevel2(getKey(reviewingArticle), reviewAction, reviewComment);
            }
            setIsReviewModalOpen(false);
            await fetchArticles();
            alert(reviewAction === 'approve' ? reviewingArticle.review_status === 'pending_level1' || reviewingArticle.review_status === 'pending_admin' ? '一级审核通过，已提交二级审核。' : '二级审核通过。' : '文章已退回发布者。');
        } catch (error) {
            alert(`审核操作失败：${error instanceof Error ? error.message : '未知错误'}`);
        }
    };
    const publish = async (article)=>{
        if (!confirm(isSuperAdmin && article.review_status !== 'approved_pending_publish' ? '超级管理员可直接发布，确定现在发布吗？' : '二级审核已通过，确定现在发布吗？')) return;
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].publishArticle(getKey(article));
            await fetchArticles();
            alert('发布成功。');
        } catch (error) {
            alert(`发布失败：${error instanceof Error ? error.message : '未知错误'}`);
        }
    };
    const handleDelete = async (article)=>{
        if (!confirm('确定删除这篇文章吗？')) return;
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].deleteArticle(getKey(article));
            await fetchArticles();
        } catch (error) {
            alert(`删除失败：${error instanceof Error ? error.message : '未知错误'}`);
        }
    };
    const getStatusBadge = (status)=>{
        const map = {
            draft: {
                label: '草稿',
                color: 'bg-gray-100 text-gray-600',
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$pen$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit$3e$__["Edit"], {
                    className: "w-3 h-3"
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 541,
                    columnNumber: 71
                }, this)
            },
            pending_level1: {
                label: '待一级审核',
                color: 'bg-amber-100 text-amber-600',
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                    className: "w-3 h-3"
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 542,
                    columnNumber: 85
                }, this)
            },
            rejected_level1: {
                label: '一级审核退回',
                color: 'bg-red-100 text-red-600',
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                    className: "w-3 h-3"
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 543,
                    columnNumber: 83
                }, this)
            },
            pending_level2: {
                label: '待二级审核',
                color: 'bg-blue-100 text-blue-600',
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                    className: "w-3 h-3"
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 544,
                    columnNumber: 83
                }, this)
            },
            rejected_level2: {
                label: '二级审核退回',
                color: 'bg-orange-100 text-orange-600',
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                    className: "w-3 h-3"
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 545,
                    columnNumber: 89
                }, this)
            },
            pending_republish: {
                label: '修改待二级审核',
                color: 'bg-indigo-100 text-indigo-600',
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                    className: "w-3 h-3"
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 546,
                    columnNumber: 92
                }, this)
            },
            rejected_republish: {
                label: '修改审核退回',
                color: 'bg-red-100 text-red-600',
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                    className: "w-3 h-3"
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 547,
                    columnNumber: 86
                }, this)
            },
            approved_pending_publish: {
                label: '待发布者发布',
                color: 'bg-purple-100 text-purple-600',
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                    className: "w-3 h-3"
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 548,
                    columnNumber: 98
                }, this)
            },
            published: {
                label: '已发布',
                color: 'bg-emerald-100 text-emerald-600',
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                    className: "w-3 h-3"
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 549,
                    columnNumber: 82
                }, this)
            },
            unpublished: {
                label: '已取消发布',
                color: 'bg-gray-100 text-gray-600',
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                    className: "w-3 h-3"
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 550,
                    columnNumber: 80
                }, this)
            },
            pending_admin: {
                label: '待一级审核（旧状态）',
                color: 'bg-amber-100 text-amber-600',
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                    className: "w-3 h-3"
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 551,
                    columnNumber: 89
                }, this)
            },
            rejected_admin: {
                label: '一级审核退回（旧状态）',
                color: 'bg-red-100 text-red-600',
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                    className: "w-3 h-3"
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 552,
                    columnNumber: 87
                }, this)
            },
            pending_leader: {
                label: '待二级审核（旧状态）',
                color: 'bg-blue-100 text-blue-600',
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                    className: "w-3 h-3"
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 553,
                    columnNumber: 88
                }, this)
            },
            rejected_leader: {
                label: '二级审核退回（旧状态）',
                color: 'bg-orange-100 text-orange-600',
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                    className: "w-3 h-3"
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 554,
                    columnNumber: 94
                }, this)
            },
            approved: {
                label: '待发布者发布（旧状态）',
                color: 'bg-purple-100 text-purple-600',
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                    className: "w-3 h-3"
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 555,
                    columnNumber: 87
                }, this)
            }
        };
        const info = map[status] || map.draft;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: `inline-flex max-w-full flex-wrap items-center justify-center gap-1 break-words whitespace-normal px-2 py-1 text-center text-xs font-medium leading-4 rounded-full ${info.color}`,
            children: [
                info.icon,
                info.label
            ]
        }, void 0, true, {
            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
            lineNumber: 558,
            columnNumber: 12
        }, this);
    };
    const renderActions = (article)=>{
        const editable = EDITABLE_STATUSES.has(article.review_status);
        const owner = isSuperAdmin || relationMatches(article.created_by_admin, user);
        const canEdit = owner && canUpdateArticle && editable;
        const canDelete = owner && canDeleteArticle && editable;
        const canSubmit = owner && canUpdateArticle && editable && article.review_status !== 'published';
        const level1Status = article.review_status === 'pending_level1' || article.review_status === 'pending_admin';
        const level2Status = article.review_status === 'pending_level2' || article.review_status === 'pending_leader' || article.review_status === 'pending_republish';
        const canReviewLevel1 = isLevel1 && canReviewArticle && level1Status && (isSuperAdmin || article.review_status === 'pending_admin' || relationMatches(article.level1_reviewer, user));
        const canReviewLevel2 = isLevel2 && canReviewArticle && level2Status && (isSuperAdmin || !article.level2_reviewer || relationMatches(article.level2_reviewer, user));
        const canPublish = canPublishArticle && (isSuperAdmin ? article.review_status !== 'published' : article.review_status === 'approved_pending_publish' && owner);
        const canUnpublish = canUnpublishArticle && article.review_status === 'published' && owner;
        const canViewReviewMessages = isSuperAdmin || relationMatches(article.created_by_admin, user) || relationMatches(article.level1_reviewer, user) || relationMatches(article.level2_reviewer, user);
        const actionClass = (enabled, activeClass)=>enabled ? activeClass : 'cursor-not-allowed text-gray-300';
        const actionTitle = (enabled, title)=>enabled ? title : `${title}（无权限或非本人文章）`;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-wrap items-center justify-center gap-1.5",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                    href: `${FRONTEND_URL}/article/${article.slug}`,
                    target: "_blank",
                    rel: "noreferrer",
                    className: "text-indigo-600 hover:text-indigo-800",
                    title: "预览",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                        className: "w-4 h-4"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                        lineNumber: 582,
                        columnNumber: 155
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 582,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    disabled: !canEdit,
                    onClick: ()=>{
                        if (canEdit) openModal(article);
                    },
                    className: actionClass(canEdit, 'text-blue-600 hover:text-blue-800'),
                    title: actionTitle(canEdit, '编辑'),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$pen$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit$3e$__["Edit"], {
                        className: "w-4 h-4"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                        lineNumber: 583,
                        columnNumber: 195
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 583,
                    columnNumber: 9
                }, this),
                editable && article.review_status !== 'published' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    disabled: !canSubmit,
                    onClick: ()=>{
                        if (canSubmit) void openSubmitModal(article);
                    },
                    className: actionClass(canSubmit, 'text-amber-600 hover:text-amber-800'),
                    title: actionTitle(canSubmit, article.review_status === 'rejected_republish' ? '提交二级审核' : '提交一级审核'),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__["Send"], {
                        className: "w-4 h-4"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                        lineNumber: 584,
                        columnNumber: 334
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 584,
                    columnNumber: 63
                }, this),
                level1Status && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            disabled: !canReviewLevel1,
                            onClick: ()=>{
                                if (canReviewLevel1) void openReviewModal(article, 'approve');
                            },
                            className: actionClass(canReviewLevel1, 'text-green-600 hover:text-green-800'),
                            title: actionTitle(canReviewLevel1, '一级审核通过'),
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                className: "w-4 h-4"
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                lineNumber: 585,
                                columnNumber: 274
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                            lineNumber: 585,
                            columnNumber: 28
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            disabled: !canReviewLevel1,
                            onClick: ()=>{
                                if (canReviewLevel1) void openReviewModal(article, 'reject');
                            },
                            className: actionClass(canReviewLevel1, 'text-red-600 hover:text-red-800'),
                            title: actionTitle(canReviewLevel1, '一级审核退回'),
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                                className: "w-4 h-4"
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                lineNumber: 585,
                                columnNumber: 559
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                            lineNumber: 585,
                            columnNumber: 318
                        }, this)
                    ]
                }, void 0, true),
                level2Status && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            disabled: !canReviewLevel2,
                            onClick: ()=>{
                                if (canReviewLevel2) void openReviewModal(article, 'approve');
                            },
                            className: actionClass(canReviewLevel2, 'text-green-600 hover:text-green-800'),
                            title: actionTitle(canReviewLevel2, '二级审核通过'),
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                className: "w-4 h-4"
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                lineNumber: 586,
                                columnNumber: 274
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                            lineNumber: 586,
                            columnNumber: 28
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            disabled: !canReviewLevel2,
                            onClick: ()=>{
                                if (canReviewLevel2) void openReviewModal(article, 'reject');
                            },
                            className: actionClass(canReviewLevel2, 'text-red-600 hover:text-red-800'),
                            title: actionTitle(canReviewLevel2, '二级审核退回'),
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                                className: "w-4 h-4"
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                lineNumber: 586,
                                columnNumber: 559
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                            lineNumber: 586,
                            columnNumber: 318
                        }, this)
                    ]
                }, void 0, true),
                (article.review_status === 'approved_pending_publish' || isSuperAdmin && article.review_status !== 'published') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    disabled: !canPublish,
                    onClick: ()=>{
                        if (canPublish) void publish(article);
                    },
                    className: actionClass(canPublish, 'text-purple-600 hover:text-purple-800'),
                    title: actionTitle(canPublish, isSuperAdmin && article.review_status !== 'approved_pending_publish' ? '超级管理员直接发布' : '发布'),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                        className: "w-4 h-4"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                        lineNumber: 587,
                        columnNumber: 415
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 587,
                    columnNumber: 125
                }, this),
                article.review_status === 'published' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    disabled: !canUnpublish,
                    onClick: async ()=>{
                        if (!canUnpublish || !confirm('确定取消发布这篇文章吗？')) return;
                        try {
                            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].unpublishArticle(getKey(article));
                            await fetchArticles();
                        } catch (error) {
                            alert(`取消发布失败：${error instanceof Error ? error.message : '未知错误'}`);
                        }
                    },
                    className: actionClass(canUnpublish, 'text-orange-600 hover:text-orange-800'),
                    title: actionTitle(canUnpublish, '取消发布'),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                        className: "w-4 h-4"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                        lineNumber: 588,
                        columnNumber: 448
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 588,
                    columnNumber: 51
                }, this),
                canViewReviewMessages && (article.rejection_reason || article.level1_review_comment || article.level2_review_comment || article.admin_review_comment || article.leader_review_comment) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>alert(`审核意见：\n${article.rejection_reason || ''}\n${article.level1_review_comment || ''}\n${article.level2_review_comment || ''}`),
                    className: "text-gray-600 hover:text-gray-800",
                    title: "查看意见",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__["MessageSquare"], {
                        className: "w-4 h-4"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                        lineNumber: 589,
                        columnNumber: 409
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 589,
                    columnNumber: 196
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    disabled: !canDelete,
                    onClick: ()=>{
                        if (canDelete) void handleDelete(article);
                    },
                    className: actionClass(canDelete, 'text-red-500 hover:text-red-700'),
                    title: actionTitle(canDelete, '删除'),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                        className: "w-4 h-4"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                        lineNumber: 590,
                        columnNumber: 209
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 590,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
            lineNumber: 581,
            columnNumber: 7
        }, this);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap items-center justify-between gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-3xl font-bold text-gray-900",
                                children: "文章管理"
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                lineNumber: 597,
                                columnNumber: 79
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-1 text-gray-500",
                                children: [
                                    "共 ",
                                    total,
                                    " 条文章"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                lineNumber: 597,
                                columnNumber: 137
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                        lineNumber: 597,
                        columnNumber: 74
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setFiltersOpen((open)=>!open),
                                className: `flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium ${filtersOpen || Object.values(appliedFilters).some(Boolean) ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$funnel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Filter$3e$__["Filter"], {
                                        className: "h-4 w-4"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                        lineNumber: 597,
                                        columnNumber: 560
                                    }, this),
                                    "筛选显示"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                lineNumber: 597,
                                columnNumber: 235
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                disabled: !canCreateArticle,
                                onClick: ()=>{
                                    if (canCreateArticle) openModal();
                                },
                                className: `flex items-center gap-2 rounded-2xl px-6 py-3 font-medium ${canCreateArticle ? 'bg-blue-600 text-white hover:bg-blue-700' : 'cursor-not-allowed bg-gray-100 text-gray-400'}`,
                                title: canCreateArticle ? '新增文章' : '当前角色没有创建文章权限',
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                        className: "h-5 w-5"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                        lineNumber: 597,
                                        columnNumber: 932
                                    }, this),
                                    "新增文章"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                lineNumber: 597,
                                columnNumber: 603
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                        lineNumber: 597,
                        columnNumber: 194
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                lineNumber: 597,
                columnNumber: 7
            }, this),
            filtersOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-2xl border border-gray-100 bg-white p-5 shadow-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-sm text-gray-600",
                                children: [
                                    "发布者",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: filterDraft.publisherId,
                                        onChange: (event)=>setFilterDraft((current)=>({
                                                    ...current,
                                                    publisherId: event.target.value
                                                })),
                                        className: "mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-gray-800",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                children: "全部用户"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                lineNumber: 598,
                                                columnNumber: 439
                                            }, this),
                                            publishers.map((publisher)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: String(publisher.id),
                                                    children: [
                                                        publisher.name,
                                                        "（",
                                                        publisher.email,
                                                        "）"
                                                    ]
                                                }, String(publisher.id), true, {
                                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                    lineNumber: 598,
                                                    columnNumber: 500
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                        lineNumber: 598,
                                        columnNumber: 212
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                lineNumber: 598,
                                columnNumber: 168
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-sm text-gray-600",
                                children: [
                                    "一级分类",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: filterDraft.primaryCategoryId,
                                        onChange: (event)=>setFilterDraft((current)=>({
                                                    ...current,
                                                    primaryCategoryId: event.target.value,
                                                    secondaryCategoryId: ''
                                                })),
                                        className: "mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-gray-800",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                children: "全部分类"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                lineNumber: 598,
                                                columnNumber: 936
                                            }, this),
                                            primaryOptions.map((category)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: String(category.id),
                                                    children: category.name
                                                }, category.id, false, {
                                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                    lineNumber: 598,
                                                    columnNumber: 1000
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                        lineNumber: 598,
                                        columnNumber: 672
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                lineNumber: 598,
                                columnNumber: 627
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-sm text-gray-600",
                                children: [
                                    "二级分类",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: filterDraft.secondaryCategoryId,
                                        onChange: (event)=>setFilterDraft((current)=>({
                                                    ...current,
                                                    secondaryCategoryId: event.target.value
                                                })),
                                        className: "mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-gray-800",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                children: "全部分类"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                lineNumber: 598,
                                                columnNumber: 1385
                                            }, this),
                                            filterSecondaryOptions.map((category)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: String(category.id),
                                                    children: category.name
                                                }, category.id, false, {
                                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                    lineNumber: 598,
                                                    columnNumber: 1457
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                        lineNumber: 598,
                                        columnNumber: 1142
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                lineNumber: 598,
                                columnNumber: 1097
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-sm text-gray-600",
                                children: [
                                    "状态",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: filterDraft.status,
                                        onChange: (event)=>setFilterDraft((current)=>({
                                                    ...current,
                                                    status: event.target.value
                                                })),
                                        className: "mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-gray-800",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                children: "全部状态"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                lineNumber: 598,
                                                columnNumber: 1814
                                            }, this),
                                            STATUS_OPTIONS.map((status)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: status.value,
                                                    children: status.label
                                                }, status.value, false, {
                                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                    lineNumber: 598,
                                                    columnNumber: 1876
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                        lineNumber: 598,
                                        columnNumber: 1597
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                lineNumber: 598,
                                columnNumber: 1554
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-sm text-gray-600",
                                children: [
                                    "发布时间（开始）",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "date",
                                        value: filterDraft.publishFrom,
                                        onChange: (event)=>setFilterDraft((current)=>({
                                                    ...current,
                                                    publishFrom: event.target.value
                                                })),
                                        className: "mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-gray-800"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                        lineNumber: 598,
                                        columnNumber: 2015
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                lineNumber: 598,
                                columnNumber: 1966
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-sm text-gray-600",
                                children: [
                                    "发布时间（结束）",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "date",
                                        value: filterDraft.publishTo,
                                        onChange: (event)=>setFilterDraft((current)=>({
                                                    ...current,
                                                    publishTo: event.target.value
                                                })),
                                        className: "mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-gray-800"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                        lineNumber: 598,
                                        columnNumber: 2312
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                lineNumber: 598,
                                columnNumber: 2263
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-sm text-gray-600",
                                children: [
                                    "修改时间（开始）",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "date",
                                        value: filterDraft.updatedFrom,
                                        onChange: (event)=>setFilterDraft((current)=>({
                                                    ...current,
                                                    updatedFrom: event.target.value
                                                })),
                                        className: "mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-gray-800"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                        lineNumber: 598,
                                        columnNumber: 2605
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                lineNumber: 598,
                                columnNumber: 2556
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-sm text-gray-600",
                                children: [
                                    "修改时间（结束）",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "date",
                                        value: filterDraft.updatedTo,
                                        onChange: (event)=>setFilterDraft((current)=>({
                                                    ...current,
                                                    updatedTo: event.target.value
                                                })),
                                        className: "mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-gray-800"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                        lineNumber: 598,
                                        columnNumber: 2902
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                lineNumber: 598,
                                columnNumber: 2853
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                        lineNumber: 598,
                        columnNumber: 98
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-4 flex justify-end gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: resetFilters,
                                className: "flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                        className: "h-4 w-4"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                        lineNumber: 598,
                                        columnNumber: 3361
                                    }, this),
                                    "重置"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                lineNumber: 598,
                                columnNumber: 3197
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: applyFilters,
                                className: "rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700",
                                children: "应用筛选"
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                lineNumber: 598,
                                columnNumber: 3405
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                        lineNumber: 598,
                        columnNumber: 3152
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                lineNumber: 598,
                columnNumber: 23
            }, this),
            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "py-12 text-center text-gray-400",
                children: "加载中..."
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                lineNumber: 599,
                columnNumber: 18
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-full overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                            className: "w-full table-fixed",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                    className: "border-b bg-gray-50",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "w-[25%] px-3 py-4 text-left text-sm font-medium text-gray-500",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>toggleSort('title'),
                                                    className: "inline-flex items-center hover:text-blue-600",
                                                    children: [
                                                        "标题",
                                                        renderSortIcon('title')
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                    lineNumber: 599,
                                                    columnNumber: 337
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                lineNumber: 599,
                                                columnNumber: 259
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "w-[11%] px-3 py-4 text-left text-sm font-medium text-gray-500",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>toggleSort('created_by_admin.name'),
                                                    className: "inline-flex items-center hover:text-blue-600",
                                                    children: [
                                                        "发布者",
                                                        renderSortIcon('created_by_admin.name')
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                    lineNumber: 599,
                                                    columnNumber: 571
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                lineNumber: 599,
                                                columnNumber: 493
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "w-[8%] px-2 py-4 text-left text-sm font-medium text-gray-500",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>toggleSort('primary_category.name'),
                                                    className: "inline-flex items-center hover:text-blue-600",
                                                    children: [
                                                        "一级分类",
                                                        renderSortIcon('primary_category.name')
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                    lineNumber: 599,
                                                    columnNumber: 837
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                lineNumber: 599,
                                                columnNumber: 760
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "w-[8%] px-2 py-4 text-left text-sm font-medium text-gray-500",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>toggleSort('secondary_category.name'),
                                                    className: "inline-flex items-center hover:text-blue-600",
                                                    children: [
                                                        "二级分类",
                                                        renderSortIcon('secondary_category.name')
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                    lineNumber: 599,
                                                    columnNumber: 1104
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                lineNumber: 599,
                                                columnNumber: 1027
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "w-[10%] px-2 py-4 text-left text-sm font-medium text-gray-500",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>toggleSort('review_status'),
                                                    className: "inline-flex items-center hover:text-blue-600",
                                                    children: [
                                                        "状态",
                                                        renderSortIcon('review_status')
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                    lineNumber: 599,
                                                    columnNumber: 1376
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                lineNumber: 599,
                                                columnNumber: 1298
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "w-[12%] px-2 py-4 text-left text-sm font-medium text-gray-500",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>toggleSort('publish_time'),
                                                    className: "inline-flex items-center hover:text-blue-600",
                                                    children: [
                                                        "发布时间",
                                                        renderSortIcon('publish_time')
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                    lineNumber: 599,
                                                    columnNumber: 1626
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                lineNumber: 599,
                                                columnNumber: 1548
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "w-[12%] px-2 py-4 text-left text-sm font-medium text-gray-500",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>toggleSort('updatedAt'),
                                                    className: "inline-flex items-center hover:text-blue-600",
                                                    children: [
                                                        "最后修改",
                                                        renderSortIcon('updatedAt')
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                    lineNumber: 599,
                                                    columnNumber: 1876
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                lineNumber: 599,
                                                columnNumber: 1798
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "w-[14%] px-2 py-4 text-center text-sm font-medium text-gray-500",
                                                children: "操作"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                lineNumber: 599,
                                                columnNumber: 2042
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                        lineNumber: 599,
                                        columnNumber: 255
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                    lineNumber: 599,
                                    columnNumber: 216
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                    className: "divide-y",
                                    children: [
                                        articles.map((article)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                className: "hover:bg-gray-50",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "break-words px-3 py-4",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "font-medium leading-5 text-gray-900",
                                                                children: article.title
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                                lineNumber: 599,
                                                                columnNumber: 2285
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "break-all text-xs text-gray-400",
                                                                children: [
                                                                    "slug: ",
                                                                    article.slug
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                                lineNumber: 599,
                                                                columnNumber: 2359
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                        lineNumber: 599,
                                                        columnNumber: 2247
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "break-words px-3 py-4 text-sm",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "inline-flex max-w-full break-all items-center gap-1.5",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                                                                    className: "h-3.5 w-3.5 shrink-0 text-gray-400"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                                    lineNumber: 599,
                                                                    columnNumber: 2557
                                                                }, this),
                                                                relationName(article.created_by_admin)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                            lineNumber: 599,
                                                            columnNumber: 2485
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                        lineNumber: 599,
                                                        columnNumber: 2439
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "break-words px-2 py-4 text-sm",
                                                        children: article.primary_category?.name || '-'
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                        lineNumber: 599,
                                                        columnNumber: 2664
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "break-words px-2 py-4 text-sm",
                                                        children: article.secondary_category?.name || '不分类'
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                        lineNumber: 599,
                                                        columnNumber: 2754
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-2 py-4",
                                                        children: getStatusBadge(article.review_status)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                        lineNumber: 599,
                                                        columnNumber: 2848
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "break-words px-2 py-4 text-xs text-gray-500",
                                                        children: formatDate(article.publish_time || article.publishedAt)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                        lineNumber: 599,
                                                        columnNumber: 2918
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "break-words px-2 py-4 text-xs text-gray-500",
                                                        children: formatDate(article.updatedAt)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                        lineNumber: 599,
                                                        columnNumber: 3040
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-2 py-4",
                                                        children: renderActions(article)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                        lineNumber: 599,
                                                        columnNumber: 3136
                                                    }, this)
                                                ]
                                            }, article.id, true, {
                                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                lineNumber: 599,
                                                columnNumber: 2197
                                            }, this)),
                                        articles.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                colSpan: 8,
                                                className: "p-6 text-center text-gray-400",
                                                children: "暂无符合条件的文章"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                lineNumber: 599,
                                                columnNumber: 3228
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                            lineNumber: 599,
                                            columnNumber: 3224
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                    lineNumber: 599,
                                    columnNumber: 2142
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                            lineNumber: 599,
                            columnNumber: 178
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                        lineNumber: 599,
                        columnNumber: 84
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-600",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    "第 ",
                                    page,
                                    " / ",
                                    totalPages,
                                    " 页，每页 ",
                                    pageSize,
                                    " 篇，共 ",
                                    total,
                                    " 篇"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                lineNumber: 599,
                                columnNumber: 3471
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        disabled: page <= 1,
                                        onClick: ()=>setPage((current)=>Math.max(1, current - 1)),
                                        className: "rounded-lg border border-gray-200 px-3 py-1.5 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-300",
                                        children: "上一页"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                        lineNumber: 599,
                                        columnNumber: 3578
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        disabled: page >= totalPages,
                                        onClick: ()=>setPage((current)=>Math.min(totalPages, current + 1)),
                                        className: "rounded-lg border border-gray-200 px-3 py-1.5 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-300",
                                        children: "下一页"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                        lineNumber: 599,
                                        columnNumber: 3825
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                lineNumber: 599,
                                columnNumber: 3537
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                        lineNumber: 599,
                        columnNumber: 3328
                    }, this)
                ]
            }, void 0, true),
            isModalOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white rounded-3xl shadow-2xl w-full max-w-[min(96vw,1500px)] mx-4 p-8 max-h-[90vh] overflow-y-auto",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-2xl font-bold mb-6",
                            children: editingKey ? '编辑文章' : '新增文章'
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                            lineNumber: 601,
                            columnNumber: 223
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                            onSubmit: saveArticle,
                            className: "space-y-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "mb-2 block font-medium",
                                            children: "发布者"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                            lineNumber: 601,
                                            columnNumber: 354
                                        }, this),
                                        isSuperAdmin ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                            value: form.publisherId,
                                            onChange: (event)=>{
                                                const selected = publishers.find((publisher)=>String(publisher.documentId || publisher.id) === event.target.value);
                                                setForm((previous)=>({
                                                        ...previous,
                                                        publisherId: event.target.value,
                                                        publisherLabel: selected ? `${selected.name}（${selected.email}）` : ''
                                                    }));
                                            },
                                            className: "w-full rounded border px-4 py-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "",
                                                    children: "请选择发布者"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                    lineNumber: 601,
                                                    columnNumber: 790
                                                }, this),
                                                publishers.map((publisher)=>{
                                                    const key = String(publisher.documentId || publisher.id);
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: key,
                                                        children: [
                                                            publisher.name,
                                                            "（",
                                                            publisher.email,
                                                            "）"
                                                        ]
                                                    }, key, true, {
                                                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                        lineNumber: 601,
                                                        columnNumber: 920
                                                    }, this);
                                                })
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                            lineNumber: 601,
                                            columnNumber: 423
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            value: form.publisherLabel || user?.name || user?.email || '',
                                            readOnly: true,
                                            disabled: true,
                                            className: "w-full cursor-not-allowed rounded border bg-gray-50 px-4 py-3 text-gray-500"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                            lineNumber: 601,
                                            columnNumber: 1011
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "mt-1 text-xs text-gray-400",
                                            children: "普通用户只能使用本人账号发布；超级管理员可以指定其他有效后台用户。"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                            lineNumber: 601,
                                            columnNumber: 1190
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                    lineNumber: 601,
                                    columnNumber: 349
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    className: "w-full px-4 py-3 border rounded",
                                    placeholder: "标题",
                                    value: form.title,
                                    onChange: (event)=>setForm((previous)=>({
                                                ...previous,
                                                title: event.target.value
                                            })),
                                    required: true
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                    lineNumber: 601,
                                    columnNumber: 1275
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    className: "w-full px-4 py-3 border rounded",
                                    placeholder: "摘要",
                                    rows: 2,
                                    value: form.summary,
                                    onChange: (event)=>setForm((previous)=>({
                                                ...previous,
                                                summary: event.target.value
                                            }))
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                    lineNumber: 601,
                                    columnNumber: 1463
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block mb-2 font-medium",
                                            children: "正文内容"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                            lineNumber: 601,
                                            columnNumber: 1663
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(WordLikeEditor, {
                                            value: form.content,
                                            onChange: (html)=>setForm((previous)=>({
                                                        ...previous,
                                                        content: html
                                                    })),
                                            uploadImage: handleEditorUpload
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                            lineNumber: 601,
                                            columnNumber: 1717
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                    lineNumber: 601,
                                    columnNumber: 1658
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-1 md:grid-cols-2 gap-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "block mb-2 font-medium",
                                                    children: "一级分类（必选）"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                    lineNumber: 601,
                                                    columnNumber: 1932
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    value: form.primaryCategoryId,
                                                    onChange: (event)=>setForm((previous)=>({
                                                                ...previous,
                                                                primaryCategoryId: event.target.value,
                                                                secondaryCategoryId: ''
                                                            })),
                                                    className: "w-full px-4 py-3 border rounded",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "",
                                                            children: "请选择一级分类"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                            lineNumber: 601,
                                                            columnNumber: 2200
                                                        }, this),
                                                        primaryOptions.map((category)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: String(category.id),
                                                                children: category.name
                                                            }, category.id, false, {
                                                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                                lineNumber: 601,
                                                                columnNumber: 2267
                                                            }, this))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                    lineNumber: 601,
                                                    columnNumber: 1990
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                            lineNumber: 601,
                                            columnNumber: 1927
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "block mb-2 font-medium",
                                                    children: "二级分类（可选）"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                    lineNumber: 601,
                                                    columnNumber: 2367
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    value: form.secondaryCategoryId,
                                                    onChange: (event)=>setForm((previous)=>({
                                                                ...previous,
                                                                secondaryCategoryId: event.target.value
                                                            })),
                                                    className: "w-full px-4 py-3 border rounded",
                                                    disabled: !form.primaryCategoryId,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "",
                                                            children: "不分类"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                            lineNumber: 601,
                                                            columnNumber: 2649
                                                        }, this),
                                                        secondaryOptions.map((category)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: String(category.id),
                                                                children: category.name
                                                            }, category.id, false, {
                                                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                                lineNumber: 601,
                                                                columnNumber: 2714
                                                            }, this))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                    lineNumber: 601,
                                                    columnNumber: 2425
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                            lineNumber: 601,
                                            columnNumber: 2362
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                    lineNumber: 601,
                                    columnNumber: 1872
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block mb-2 font-medium",
                                            children: "封面图"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                            lineNumber: 601,
                                            columnNumber: 2820
                                        }, this),
                                        form.coverPreview && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            src: form.coverPreview,
                                            width: 160,
                                            height: 96,
                                            className: "w-40 h-24 object-cover rounded mb-2",
                                            alt: "cover",
                                            unoptimized: true
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                            lineNumber: 601,
                                            columnNumber: 2895
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "file",
                                            accept: "image/*",
                                            onChange: (event)=>setCoverFile(event.target.files?.[0] || null)
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                            lineNumber: 601,
                                            columnNumber: 3025
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                    lineNumber: 601,
                                    columnNumber: 2815
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex justify-end gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>setIsModalOpen(false),
                                            className: "px-6 py-3 border rounded",
                                            children: "取消"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                            lineNumber: 601,
                                            columnNumber: 3177
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "submit",
                                            className: "px-6 py-3 bg-blue-600 text-white rounded",
                                            children: "保存"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                            lineNumber: 601,
                                            columnNumber: 3285
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                    lineNumber: 601,
                                    columnNumber: 3137
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                            lineNumber: 601,
                            columnNumber: 298
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 601,
                    columnNumber: 104
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                lineNumber: 601,
                columnNumber: 23
            }, this),
            isSubmitModalOpen && submittingArticle && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-xl font-bold mb-4",
                            children: submittingArticle.review_status === 'rejected_republish' ? '提交二级审核' : '选择一级审核人员'
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                            lineNumber: 603,
                            columnNumber: 205
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-gray-600 mb-4",
                            children: [
                                "文章：",
                                submittingArticle.title
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                            lineNumber: 603,
                            columnNumber: 331
                        }, this),
                        submittingArticle.review_status === 'rejected_republish' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "rounded-lg bg-indigo-50 p-3 text-sm text-indigo-700",
                            children: "修改后的已发布文章将直接进入二级审核。"
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                            lineNumber: 603,
                            columnNumber: 465
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                            value: selectedLevel1Reviewer,
                            onChange: (event)=>setSelectedLevel1Reviewer(event.target.value),
                            className: "w-full px-4 py-3 border rounded-lg mb-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: "",
                                    children: "请选择"
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                    lineNumber: 603,
                                    columnNumber: 717
                                }, this),
                                level1Reviewers.map((reviewer)=>{
                                    const reviewerKey = String(reviewer.documentId || reviewer.email || reviewer.id);
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: reviewerKey,
                                        children: [
                                            reviewer.name,
                                            "（",
                                            reviewer.email,
                                            "）"
                                        ]
                                    }, reviewerKey, true, {
                                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                        lineNumber: 603,
                                        columnNumber: 872
                                    }, this);
                                })
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                            lineNumber: 603,
                            columnNumber: 558
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-end gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setIsSubmitModalOpen(false),
                                    className: "px-4 py-2 border rounded-lg",
                                    children: "取消"
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                    lineNumber: 603,
                                    columnNumber: 1015
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: submitForReview,
                                    className: "px-4 py-2 bg-blue-600 text-white rounded-lg",
                                    children: "提交审核"
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                    lineNumber: 603,
                                    columnNumber: 1118
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                            lineNumber: 603,
                            columnNumber: 975
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 603,
                    columnNumber: 131
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                lineNumber: 603,
                columnNumber: 50
            }, this),
            isReviewModalOpen && reviewingArticle && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-xl font-bold mb-4",
                            children: [
                                reviewingArticle.review_status === 'pending_level1' || reviewingArticle.review_status === 'pending_admin' ? '一级审核' : '二级审核',
                                reviewAction === 'approve' ? '通过' : '退回'
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                            lineNumber: 605,
                            columnNumber: 204
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-gray-600 mb-2",
                            children: "文章标题："
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                            lineNumber: 605,
                            columnNumber: 415
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "font-medium mb-4",
                            children: reviewingArticle.title
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                            lineNumber: 605,
                            columnNumber: 466
                        }, this),
                        reviewAction === 'approve' && (reviewingArticle.review_status === 'pending_level1' || reviewingArticle.review_status === 'pending_admin') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "mb-2 block text-sm font-medium text-gray-700",
                                    children: "指定二级审核人员"
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                    lineNumber: 605,
                                    columnNumber: 690
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    value: selectedLevel2Reviewer,
                                    onChange: (event)=>setSelectedLevel2Reviewer(event.target.value),
                                    className: "w-full rounded-lg border px-4 py-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "",
                                            children: "请选择二级审核人员"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                            lineNumber: 605,
                                            columnNumber: 924
                                        }, this),
                                        level2Reviewers.map((reviewer)=>{
                                            const key = String(reviewer.documentId || reviewer.email || reviewer.id);
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: key,
                                                children: [
                                                    reviewer.name,
                                                    "（",
                                                    reviewer.email,
                                                    "）"
                                                ]
                                            }, key, true, {
                                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                lineNumber: 605,
                                                columnNumber: 1077
                                            }, this);
                                        })
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                    lineNumber: 605,
                                    columnNumber: 770
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                            lineNumber: 605,
                            columnNumber: 668
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "block text-sm font-medium text-gray-700 mb-2",
                            children: [
                                "审核意见 ",
                                reviewAction === 'reject' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-red-500",
                                    children: "*"
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                    lineNumber: 605,
                                    columnNumber: 1269
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                            lineNumber: 605,
                            columnNumber: 1170
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                            value: reviewComment,
                            onChange: (event)=>setReviewComment(event.target.value),
                            className: "w-full px-4 py-3 border rounded-lg",
                            rows: 4,
                            placeholder: reviewAction === 'approve' ? '可选填审核意见' : '请填写退回原因'
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                            lineNumber: 605,
                            columnNumber: 1317
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-end gap-3 mt-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setIsReviewModalOpen(false),
                                    className: "px-4 py-2 border rounded-lg",
                                    children: "取消"
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                    lineNumber: 605,
                                    columnNumber: 1576
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleReview,
                                    className: `px-4 py-2 rounded-lg text-white ${reviewAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`,
                                    children: [
                                        "确认",
                                        reviewAction === 'approve' ? '通过并提交二级审核' : '退回'
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                    lineNumber: 605,
                                    columnNumber: 1679
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                            lineNumber: 605,
                            columnNumber: 1531
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 605,
                    columnNumber: 130
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                lineNumber: 605,
                columnNumber: 49
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
        lineNumber: 596,
        columnNumber: 5
    }, this);
}
_s(ArticlesPage, "xBOqGq5QI0Zelq1lqgbdg3EGgKQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useModulePermission$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModulePermission"]
    ];
});
_c1 = ArticlesPage;
var _c, _c1;
__turbopack_context__.k.register(_c, "WordLikeEditor");
__turbopack_context__.k.register(_c1, "ArticlesPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_0q7pd0j._.js.map