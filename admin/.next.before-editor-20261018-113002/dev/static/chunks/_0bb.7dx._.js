(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "adminLogin",
    ()=>adminLogin,
    "api",
    ()=>api,
    "uploadFile",
    ()=>uploadFile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$strapi$2d$fetch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/strapi-fetch.ts [app-client] (ecmascript)");
;
const STRAPI_URL = ("TURBOPACK compile-time value", "http://localhost:1337") || 'http://localhost:1337';
async function strapiRequest(endpoint, options = {}) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$strapi$2d$fetch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["strapiFetch"])(`${STRAPI_URL}${endpoint}`, options);
    if (!res.ok) {
        const errorData = await res.json().catch(()=>({}));
        let msg = `API Error: ${res.status}`;
        if (errorData && typeof errorData === 'object' && 'error' in errorData && errorData.error?.message) {
            msg = errorData.error.message;
        }
        if (res.status === 401) {
            if ("TURBOPACK compile-time truthy", 1) {
                localStorage.removeItem('strapi_jwt');
                localStorage.removeItem('strapi_user');
            }
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
    const res = await fetch(`${STRAPI_URL}/api/auth/local`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            identifier: email,
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
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$strapi$2d$fetch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["strapiFetch"])(`${STRAPI_URL}/api/upload`, {
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
    getArticle: (id)=>strapiRequest(`/api/articles/${id}?populate=*`),
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/(dashboard)/dashboard/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DashboardPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
const emptyCounts = {
    published: null,
    pending: null,
    categories: null,
    banners: null
};
function totalFrom(response) {
    const total = response?.meta?.pagination?.total;
    return typeof total === 'number' ? total : null;
}
function DashboardPage() {
    _s();
    const [counts, setCounts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(emptyCounts);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DashboardPage.useEffect": ()=>{
            let active = true;
            async function load() {
                const requests = await Promise.allSettled([
                    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].getArticles('?filters[review_status][$eq]=published&pagination[pageSize]=1'),
                    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].getArticles('?filters[review_status][$eq]=pending&pagination[pageSize]=1'),
                    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].getCategories('?pagination[pageSize]=1'),
                    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].getBanners('?pagination[pageSize]=1')
                ]);
                if (!active) return;
                const values = requests.map({
                    "DashboardPage.useEffect.load.values": (result)=>result.status === 'fulfilled' ? totalFrom(result.value) : null
                }["DashboardPage.useEffect.load.values"]);
                setCounts({
                    published: values[0],
                    pending: values[1],
                    categories: values[2],
                    banners: values[3]
                });
                setLoading(false);
            }
            void load();
            return ({
                "DashboardPage.useEffect": ()=>{
                    active = false;
                }
            })["DashboardPage.useEffect"];
        }
    }["DashboardPage.useEffect"], []);
    const cards = [
        {
            label: '已发布文章',
            value: counts.published,
            color: 'text-blue-600'
        },
        {
            label: '待审核内容',
            value: counts.pending,
            color: 'text-amber-600'
        },
        {
            label: '栏目总数',
            value: counts.categories,
            color: 'text-emerald-600'
        },
        {
            label: '轮播图总数',
            value: counts.banners,
            color: 'text-purple-600'
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-3xl font-bold text-gray-900 mb-2",
                        children: "欢迎回来"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/page.tsx",
                        lineNumber: 67,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-500",
                        children: "吉林大学国家卓越工程师学院后台管理系统"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/page.tsx",
                        lineNumber: 68,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(dashboard)/dashboard/page.tsx",
                lineNumber: 66,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6",
                children: cards.map((card)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-white rounded-3xl p-6 shadow-sm border border-gray-100",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-gray-500",
                                children: card.label
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/dashboard/page.tsx",
                                lineNumber: 73,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: `text-4xl font-bold mt-2 ${card.color}`,
                                children: loading ? '加载中…' : card.value ?? '—'
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/dashboard/page.tsx",
                                lineNumber: 74,
                                columnNumber: 13
                            }, this)
                        ]
                    }, card.label, true, {
                        fileName: "[project]/app/(dashboard)/dashboard/page.tsx",
                        lineNumber: 72,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/dashboard/page.tsx",
                lineNumber: 70,
                columnNumber: 7
            }, this),
            !loading && Object.values(counts).some((value)=>value === null) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                role: "alert",
                className: "text-sm text-amber-700",
                children: "部分统计暂时无法获取，请检查登录状态和 Strapi 接口权限。"
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/dashboard/page.tsx",
                lineNumber: 81,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/(dashboard)/dashboard/page.tsx",
        lineNumber: 65,
        columnNumber: 5
    }, this);
}
_s(DashboardPage, "Gq3hrovYhMN714ryH6u2Ew4l7Cs=");
_c = DashboardPage;
var _c;
__turbopack_context__.k.register(_c, "DashboardPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_0bb.7dx._.js.map