(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/api/partners.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "STRAPI_BASE_URL",
    ()=>STRAPI_BASE_URL,
    "createPartner",
    ()=>createPartner,
    "deletePartner",
    ()=>deletePartner,
    "fetchPartner",
    ()=>fetchPartner,
    "fetchPartners",
    ()=>fetchPartners,
    "toAbsoluteUrl",
    ()=>toAbsoluteUrl,
    "updatePartner",
    ()=>updatePartner,
    "uploadLogo",
    ()=>uploadLogo
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$strapi$2d$fetch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/strapi-fetch.ts [app-client] (ecmascript)");
;
const STRAPI_BASE_URL = ("TURBOPACK compile-time value", "http://localhost:1337") || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.STRAPI_URL || 'http://localhost:1337';
function authHeaders() {
    return {
        'Content-Type': 'application/json'
    };
}
function unwrap(entity) {
    const d = entity.attributes ?? entity;
    let logo = null;
    const logoField = d.logo;
    if (logoField) {
        if (logoField.data) {
            const data = logoField.data;
            const attrs = data.attributes ?? data;
            if (attrs?.url) logo = {
                id: data.id ?? 0,
                url: attrs.url,
                name: attrs.name ?? ''
            };
        } else if (logoField.url) {
            const lf = logoField;
            logo = {
                id: lf.id ?? 0,
                url: lf.url ?? '',
                name: lf.name ?? ''
            };
        }
    }
    return {
        id: entity.id ?? 0,
        documentId: entity.documentId ?? d.documentId ?? '',
        name: d.name ?? '',
        logo,
        intro: d.intro ?? null,
        website: d.website ?? null,
        is_active: d.is_active ?? true,
        is_council: d.is_council ?? false,
        sort_order: d.sort_order ?? 0
    };
}
function toAbsoluteUrl(url) {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${STRAPI_BASE_URL}${url}`;
}
;
async function fetchPartners() {
    const params = new URLSearchParams({
        'populate': 'logo',
        'sort[0]': 'sort_order:asc',
        'sort[1]': 'id:asc',
        'pagination[pageSize]': '200'
    });
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$strapi$2d$fetch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["strapiFetch"])(`${STRAPI_BASE_URL}/api/council-members?${params}`, {
        headers: authHeaders(),
        cache: 'no-store'
    });
    if (!res.ok) throw new Error(`获取合作单位失败: ${res.status}`);
    const json = await res.json();
    return (json.data ?? []).map(unwrap);
}
async function fetchPartner(documentId) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$strapi$2d$fetch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["strapiFetch"])(`${STRAPI_BASE_URL}/api/council-members/${documentId}?populate=logo`, {
        headers: authHeaders(),
        cache: 'no-store'
    });
    if (!res.ok) throw new Error(`获取合作单位失败: ${res.status}`);
    const json = await res.json();
    return unwrap(json.data ?? json);
}
async function createPartner(payload) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$strapi$2d$fetch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["strapiFetch"])(`${STRAPI_BASE_URL}/api/council-members`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
            data: payload
        })
    });
    if (!res.ok) {
        const err = await res.json().catch(()=>({
                error: {
                    message: ''
                }
            }));
        throw new Error(err?.error?.message ?? `创建失败: ${res.status}`);
    }
    const json = await res.json();
    return unwrap(json.data ?? json);
}
async function updatePartner(documentId, payload) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$strapi$2d$fetch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["strapiFetch"])(`${STRAPI_BASE_URL}/api/council-members/${documentId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
            data: payload
        })
    });
    if (!res.ok) {
        const err = await res.json().catch(()=>({
                error: {
                    message: ''
                }
            }));
        throw new Error(err?.error?.message ?? `更新失败: ${res.status}`);
    }
    const json = await res.json();
    return unwrap(json.data ?? json);
}
async function deletePartner(documentId) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$strapi$2d$fetch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["strapiFetch"])(`${STRAPI_BASE_URL}/api/council-members/${documentId}`, {
        method: 'DELETE',
        headers: authHeaders()
    });
    if (!res.ok) throw new Error(`删除失败: ${res.status}`);
}
async function uploadLogo(file) {
    const formData = new FormData();
    formData.append('files', file);
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$strapi$2d$fetch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["strapiFetch"])(`${STRAPI_BASE_URL}/api/upload`, {
        method: 'POST',
        headers: {},
        body: formData
    });
    if (!res.ok) throw new Error(`上传失败: ${res.status}`);
    const json = await res.json();
    const f = json[0];
    return {
        id: f.id,
        url: f.url.startsWith('http') ? f.url : `${STRAPI_BASE_URL}${f.url}`,
        name: f.name
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/sanitize-html.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sanitizeRichHtml",
    ()=>sanitizeRichHtml
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/index.js [app-client] (ecmascript)");
;
// Keep common Word/WPS/Excel formatting while excluding active CSS (URLs,
// expressions and arbitrary layout rules). Both admin preview and public site
// use the same allowlist so an approved article looks the same in both places.
const size = /^(?:auto|0|\d+(?:\.\d+)?(?:px|pt|em|rem|%))$/i;
const color = /^(?:#[0-9a-f]{3,8}|[a-z]+|rgba?\(\s*[\d.%,\s]+\)|hsla?\(\s*[\d.%,\s]+\))$/i;
const border = /^(?:none|(?:\d+(?:\.\d+)?(?:px|pt))\s+(?:solid|dashed|dotted|double)\s+(?:#[0-9a-f]{3,8}|[a-z]+))$/i;
const OPTIONS = {
    allowedTags: [
        ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].defaults.allowedTags,
        'figure',
        'figcaption',
        'img',
        'iframe',
        'table',
        'thead',
        'tbody',
        'tfoot',
        'tr',
        'th',
        'td',
        'colgroup',
        'col',
        'caption',
        'u',
        's',
        'sub',
        'sup'
    ],
    allowedAttributes: {
        ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].defaults.allowedAttributes,
        a: [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].defaults.allowedAttributes.a || [],
            'rel',
            'style'
        ],
        p: [
            'style'
        ],
        div: [
            'style'
        ],
        span: [
            'style'
        ],
        h1: [
            'style'
        ],
        h2: [
            'style'
        ],
        h3: [
            'style'
        ],
        h4: [
            'style'
        ],
        img: [
            'src',
            'alt',
            'title',
            'width',
            'height',
            'loading',
            'style'
        ],
        iframe: [
            'src',
            'title',
            'width',
            'height',
            'allow',
            'allowfullscreen',
            'loading',
            'referrerpolicy',
            'sandbox'
        ],
        table: [
            'width',
            'border',
            'cellpadding',
            'cellspacing',
            'align',
            'style'
        ],
        tr: [
            'style'
        ],
        col: [
            'span',
            'width',
            'style'
        ],
        colgroup: [
            'span',
            'width',
            'style'
        ],
        th: [
            'colspan',
            'rowspan',
            'scope',
            'width',
            'height',
            'align',
            'valign',
            'bgcolor',
            'style'
        ],
        td: [
            'colspan',
            'rowspan',
            'width',
            'height',
            'align',
            'valign',
            'bgcolor',
            'style'
        ]
    },
    allowedStyles: {
        '*': {
            'text-align': [
                /^(?:left|right|center|justify|start|end)$/i
            ],
            'vertical-align': [
                /^(?:top|middle|bottom|baseline)$/i
            ],
            color: [
                color
            ],
            'background-color': [
                color
            ],
            'font-family': [
                /^[\p{L}\p{N}\s,\-'"()]+$/u
            ],
            'font-size': [
                size
            ],
            'font-weight': [
                /^(?:normal|bold|bolder|lighter|[1-9]00)$/i
            ],
            'font-style': [
                /^(?:normal|italic|oblique)$/i
            ],
            'text-decoration': [
                /^(?:none|underline|line-through|overline)(?:\s+(?:underline|line-through|overline))*$/i
            ],
            'white-space': [
                /^(?:normal|pre|pre-wrap|nowrap)$/i
            ],
            'line-height': [
                size,
                /^\d+(?:\.\d+)?$/
            ],
            'text-indent': [
                size
            ],
            width: [
                size
            ],
            height: [
                size
            ],
            'min-width': [
                size
            ],
            'max-width': [
                size
            ],
            border: [
                border
            ],
            'border-top': [
                border
            ],
            'border-right': [
                border
            ],
            'border-bottom': [
                border
            ],
            'border-left': [
                border
            ],
            'border-collapse': [
                /^(?:collapse|separate)$/i
            ],
            'border-spacing': [
                size,
                /^\d+(?:\.\d+)?(?:px|pt) \d+(?:\.\d+)?(?:px|pt)$/i
            ],
            padding: [
                size,
                /^(?:\d+(?:\.\d+)?(?:px|pt|em|rem)\s+){1,3}\d+(?:\.\d+)?(?:px|pt|em|rem)$/i
            ]
        }
    },
    allowedSchemes: [
        'http',
        'https',
        'mailto',
        'tel'
    ],
    allowedIframeHostnames: [
        'www.youtube.com',
        'youtube.com',
        'www.youtube-nocookie.com',
        'player.vimeo.com'
    ],
    allowIframeRelativeUrls: false,
    transformTags: {
        a: (tagName, attributes)=>({
                tagName,
                attribs: {
                    ...attributes,
                    rel: 'noopener noreferrer'
                }
            }),
        iframe: (tagName, attributes)=>({
                tagName,
                attribs: {
                    ...attributes,
                    sandbox: 'allow-scripts allow-same-origin allow-presentation',
                    referrerpolicy: 'strict-origin-when-cross-origin'
                }
            })
    }
};
function sanitizeRichHtml(value) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(typeof value === 'string' ? value : '', OPTIONS);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/(dashboard)/dashboard/partners/_components/CouncilArticleEditor.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CouncilArticleEditor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sanitize$2d$html$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/sanitize-html.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$strapi$2d$fetch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/strapi-fetch.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
const STRAPI_BASE_URL = ("TURBOPACK compile-time value", "http://localhost:1337") || 'http://localhost:1337';
function authHeaders() {
    return {
        'Content-Type': 'application/json'
    };
}
const COUNCIL_SLUG = 'about-council-content';
function CouncilArticleEditor() {
    _s();
    const [article, setArticle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [title, setTitle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [content, setContent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CouncilArticleEditor.useEffect": ()=>{
            async function load() {
                setLoading(true);
                try {
                    const params = new URLSearchParams({
                        'filters[slug][$eq]': COUNCIL_SLUG,
                        'pagination[pageSize]': '1'
                    });
                    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$strapi$2d$fetch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["strapiFetch"])(`${STRAPI_BASE_URL}/api/articles?${params}`, {
                        headers: authHeaders(),
                        cache: 'no-store'
                    });
                    if (!res.ok) throw new Error(`${res.status}`);
                    const json = await res.json();
                    const item = json?.data?.[0];
                    if (item) {
                        const d = item.attributes ?? item;
                        setArticle({
                            id: item.id,
                            title: d.title ?? '',
                            content: d.content ?? ''
                        });
                        setTitle(d.title ?? '');
                        setContent(d.content ?? '');
                    } else {
                        setTitle('理事会');
                        setContent('');
                    }
                } catch (e) {
                    setMessage({
                        type: 'error',
                        text: '加载失败：' + (e instanceof Error ? e.message : String(e))
                    });
                } finally{
                    setLoading(false);
                }
            }
            load();
        }
    }["CouncilArticleEditor.useEffect"], []);
    async function handleSave() {
        setSaving(true);
        setMessage(null);
        try {
            const payload = {
                data: {
                    title,
                    content,
                    slug: COUNCIL_SLUG,
                    publishedAt: new Date().toISOString()
                }
            };
            let res;
            if (article) {
                res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$strapi$2d$fetch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["strapiFetch"])(`${STRAPI_BASE_URL}/api/articles/${article.id}`, {
                    method: 'PUT',
                    headers: authHeaders(),
                    body: JSON.stringify(payload)
                });
            } else {
                res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$strapi$2d$fetch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["strapiFetch"])(`${STRAPI_BASE_URL}/api/articles`, {
                    method: 'POST',
                    headers: authHeaders(),
                    body: JSON.stringify(payload)
                });
            }
            if (!res.ok) {
                const err = await res.json().catch(()=>({}));
                throw new Error(err?.error?.message ?? `保存失败: ${res.status}`);
            }
            const json = await res.json();
            const saved = json?.data;
            if (saved) {
                const d = saved.attributes ?? saved;
                setArticle({
                    id: saved.id,
                    title: d.title ?? '',
                    content: d.content ?? ''
                });
            }
            setMessage({
                type: 'success',
                text: '保存成功！'
            });
        } catch (e) {
            setMessage({
                type: 'error',
                text: '保存失败：' + (e instanceof Error ? e.message : String(e))
            });
        } finally{
            setSaving(false);
        }
    }
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center py-20 text-gray-400",
            children: "加载中..."
        }, void 0, false, {
            fileName: "[project]/app/(dashboard)/dashboard/partners/_components/CouncilArticleEditor.tsx",
            lineNumber: 115,
            columnNumber: 12
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-white rounded-xl border border-gray-200 p-6 shadow-sm",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-lg font-semibold text-gray-800",
                        children: "理事会说明"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/partners/_components/CouncilArticleEditor.tsx",
                        lineNumber: 121,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-gray-500 mt-1",
                        children: "此内容显示在前台「学院概况 → 理事会」页面上方的介绍区域"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/partners/_components/CouncilArticleEditor.tsx",
                        lineNumber: 122,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(dashboard)/dashboard/partners/_components/CouncilArticleEditor.tsx",
                lineNumber: 120,
                columnNumber: 7
            }, this),
            message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `mb-4 px-4 py-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-600'}`,
                children: message.text
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/dashboard/partners/_components/CouncilArticleEditor.tsx",
                lineNumber: 128,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "block text-sm font-medium text-gray-700 mb-1.5",
                        children: "标题"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/partners/_components/CouncilArticleEditor.tsx",
                        lineNumber: 138,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        value: title,
                        onChange: (e)=>setTitle(e.target.value),
                        placeholder: "理事会",
                        className: "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/partners/_components/CouncilArticleEditor.tsx",
                        lineNumber: 139,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(dashboard)/dashboard/partners/_components/CouncilArticleEditor.tsx",
                lineNumber: 137,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "block text-sm font-medium text-gray-700 mb-1.5",
                        children: [
                            "正文内容",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "ml-2 text-xs font-normal text-gray-400",
                                children: "（支持 HTML）"
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/dashboard/partners/_components/CouncilArticleEditor.tsx",
                                lineNumber: 151,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(dashboard)/dashboard/partners/_components/CouncilArticleEditor.tsx",
                        lineNumber: 149,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                        value: content,
                        onChange: (e)=>setContent(e.target.value),
                        placeholder: "请输入理事会介绍内容，支持 HTML 标签...",
                        rows: 12,
                        className: "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-mono"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/partners/_components/CouncilArticleEditor.tsx",
                        lineNumber: 153,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(dashboard)/dashboard/partners/_components/CouncilArticleEditor.tsx",
                lineNumber: 148,
                columnNumber: 7
            }, this),
            content && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm font-medium text-gray-700 mb-2",
                        children: "预览效果"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/partners/_components/CouncilArticleEditor.tsx",
                        lineNumber: 164,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "border border-gray-200 rounded-lg p-4 prose prose-gray max-w-none text-sm bg-gray-50",
                        dangerouslySetInnerHTML: {
                            __html: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sanitize$2d$html$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sanitizeRichHtml"])(content)
                        }
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/partners/_components/CouncilArticleEditor.tsx",
                        lineNumber: 165,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(dashboard)/dashboard/partners/_components/CouncilArticleEditor.tsx",
                lineNumber: 163,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleSave,
                        disabled: saving,
                        className: "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50",
                        children: saving ? '保存中…' : article ? '保存修改' : '创建内容'
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/partners/_components/CouncilArticleEditor.tsx",
                        lineNumber: 173,
                        columnNumber: 9
                    }, this),
                    article && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs text-gray-400",
                        children: [
                            "ID: ",
                            article.id,
                            " · slug: ",
                            COUNCIL_SLUG
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(dashboard)/dashboard/partners/_components/CouncilArticleEditor.tsx",
                        lineNumber: 181,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(dashboard)/dashboard/partners/_components/CouncilArticleEditor.tsx",
                lineNumber: 172,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/(dashboard)/dashboard/partners/_components/CouncilArticleEditor.tsx",
        lineNumber: 119,
        columnNumber: 5
    }, this);
}
_s(CouncilArticleEditor, "0KHS7TZPrSLhLbxkkW9OwbHuTls=");
_c = CouncilArticleEditor;
var _c;
__turbopack_context__.k.register(_c, "CouncilArticleEditor");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/(dashboard)/dashboard/partners/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PartnersPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$partners$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/partners.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$dashboard$292f$dashboard$2f$partners$2f$_components$2f$CouncilArticleEditor$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/(dashboard)/dashboard/partners/_components/CouncilArticleEditor.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
function PartnersPage() {
    _s();
    const [partners, setPartners] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [isError, setIsError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [deletingId, setDeletingId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('list');
    const loadPartners = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "PartnersPage.useCallback[loadPartners]": async ()=>{
            setIsLoading(true);
            setIsError(false);
            try {
                setPartners(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$partners$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchPartners"])());
            } catch  {
                setIsError(true);
            } finally{
                setIsLoading(false);
            }
        }
    }["PartnersPage.useCallback[loadPartners]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PartnersPage.useEffect": ()=>{
            loadPartners();
        }
    }["PartnersPage.useEffect"], [
        loadPartners
    ]);
    async function handleDelete(partner) {
        if (!window.confirm(`确定删除「${partner.name}」？此操作不可恢复。`)) return;
        setDeletingId(partner.id);
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$partners$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deletePartner"])(partner.documentId);
            await loadPartners();
        } catch (e) {
            alert('删除失败：' + (e instanceof Error ? e.message : String(e)));
        } finally{
            setDeletingId(null);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "p-6 max-w-6xl mx-auto",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between mb-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-2xl font-bold text-gray-800",
                                children: "合作单位管理"
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                                lineNumber: 40,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-gray-500 text-sm mt-1",
                                children: "管理所有合作企业及理事单位"
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                                lineNumber: 41,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                        lineNumber: 39,
                        columnNumber: 9
                    }, this),
                    activeTab === 'list' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/dashboard/partners/new",
                        className: "inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "＋"
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                                lineNumber: 45,
                                columnNumber: 13
                            }, this),
                            "新增合作单位"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                        lineNumber: 44,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                lineNumber: 38,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setActiveTab('list'),
                        className: `px-5 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`,
                        children: "单位列表"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                        lineNumber: 51,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setActiveTab('intro'),
                        className: `px-5 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'intro' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`,
                        children: "理事会说明"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                        lineNumber: 54,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                lineNumber: 50,
                columnNumber: 7
            }, this),
            activeTab === 'intro' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$dashboard$292f$dashboard$2f$partners$2f$_components$2f$CouncilArticleEditor$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                lineNumber: 60,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-3 gap-4 mb-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                                label: "全部单位",
                                value: partners.length,
                                color: "blue"
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                                lineNumber: 64,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                                label: "理事单位",
                                value: partners.filter((p)=>p.is_council).length,
                                color: "green"
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                                lineNumber: 65,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                                label: "已启用",
                                value: partners.filter((p)=>p.is_active).length,
                                color: "gray"
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                                lineNumber: 66,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                        lineNumber: 63,
                        columnNumber: 11
                    }, this),
                    isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center py-20 text-gray-400",
                        children: "加载中..."
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                        lineNumber: 70,
                        columnNumber: 13
                    }, this) : isError ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center py-20 space-y-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-red-400",
                                children: "加载失败，请检查 Strapi 服务"
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                                lineNumber: 73,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: loadPartners,
                                className: "px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors",
                                children: "重新加载"
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                                lineNumber: 74,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                        lineNumber: 72,
                        columnNumber: 13
                    }, this) : partners.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center py-20 text-gray-400",
                        children: "暂无合作单位数据"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                        lineNumber: 77,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                            className: "w-full text-sm",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                    className: "bg-gray-50 border-b border-gray-200",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "text-left px-4 py-3 text-gray-600 font-medium w-16",
                                                children: "Logo"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                                                lineNumber: 83,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "text-left px-4 py-3 text-gray-600 font-medium",
                                                children: "企业名称"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                                                lineNumber: 84,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "text-left px-4 py-3 text-gray-600 font-medium hidden md:table-cell",
                                                children: "网址"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                                                lineNumber: 85,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "text-center px-4 py-3 text-gray-600 font-medium",
                                                children: "理事单位"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                                                lineNumber: 86,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "text-center px-4 py-3 text-gray-600 font-medium",
                                                children: "启用"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                                                lineNumber: 87,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "text-center px-4 py-3 text-gray-600 font-medium w-12",
                                                children: "排序"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                                                lineNumber: 88,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "text-right px-4 py-3 text-gray-600 font-medium",
                                                children: "操作"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                                                lineNumber: 89,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                                        lineNumber: 82,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                                    lineNumber: 81,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                    className: "divide-y divide-gray-100",
                                    children: partners.map((partner)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            className: "hover:bg-gray-50 transition-colors",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-4 py-3",
                                                    children: partner.logo ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "relative w-12 h-10",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                            src: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$partners$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toAbsoluteUrl"])(partner.logo.url),
                                                            alt: partner.name,
                                                            fill: true,
                                                            className: "object-contain rounded border border-gray-100 bg-gray-50 p-1",
                                                            unoptimized: true
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                                                            lineNumber: 98,
                                                            columnNumber: 29
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                                                        lineNumber: 97,
                                                        columnNumber: 27
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "w-12 h-10 rounded border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center text-gray-300 text-xs",
                                                        children: "无"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                                                        lineNumber: 101,
                                                        columnNumber: 27
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                                                    lineNumber: 95,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-4 py-3 font-medium text-gray-800",
                                                    children: partner.name
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                                                    lineNumber: 104,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-4 py-3 text-gray-500 hidden md:table-cell max-w-[180px] truncate",
                                                    children: partner.website ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                        href: partner.website,
                                                        target: "_blank",
                                                        rel: "noopener noreferrer",
                                                        className: "text-blue-500 hover:underline",
                                                        children: partner.website
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                                                        lineNumber: 107,
                                                        columnNumber: 27
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-gray-300",
                                                        children: "—"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                                                        lineNumber: 108,
                                                        columnNumber: 29
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                                                    lineNumber: 105,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-4 py-3 text-center",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Badge, {
                                                        active: partner.is_council,
                                                        activeText: "理事",
                                                        inactiveText: "普通"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                                                        lineNumber: 110,
                                                        columnNumber: 61
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                                                    lineNumber: 110,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-4 py-3 text-center",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Badge, {
                                                        active: partner.is_active,
                                                        activeText: "启用",
                                                        inactiveText: "禁用"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                                                        lineNumber: 111,
                                                        columnNumber: 61
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                                                    lineNumber: 111,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-4 py-3 text-center text-gray-400",
                                                    children: partner.sort_order
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                                                    lineNumber: 112,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-4 py-3 text-right",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center justify-end gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                                href: `/dashboard/partners/${partner.documentId}`,
                                                                className: "px-3 py-1 text-xs rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors",
                                                                children: "编辑"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                                                                lineNumber: 115,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>handleDelete(partner),
                                                                disabled: deletingId === partner.id,
                                                                className: "px-3 py-1 text-xs rounded-md bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-50",
                                                                children: deletingId === partner.id ? '删除中' : '删除'
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                                                                lineNumber: 116,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                                                        lineNumber: 114,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                                                    lineNumber: 113,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, partner.id, true, {
                                            fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                                            lineNumber: 94,
                                            columnNumber: 21
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                                    lineNumber: 92,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                            lineNumber: 80,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                        lineNumber: 79,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true)
        ]
    }, void 0, true, {
        fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
        lineNumber: 37,
        columnNumber: 5
    }, this);
}
_s(PartnersPage, "euEsyG5jTnm8gne6w3KIAqn3jWg=");
_c = PartnersPage;
function StatCard({ label, value, color }) {
    const colorMap = {
        blue: 'bg-blue-50 text-blue-700',
        green: 'bg-green-50 text-green-700',
        gray: 'bg-gray-50 text-gray-700'
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `rounded-xl p-4 ${colorMap[color]}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm opacity-75",
                children: label
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                lineNumber: 135,
                columnNumber: 63
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-3xl font-bold mt-1",
                children: value
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
                lineNumber: 135,
                columnNumber: 108
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
        lineNumber: 135,
        columnNumber: 10
    }, this);
}
_c1 = StatCard;
function Badge({ active, activeText, inactiveText }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `inline-block px-2 py-0.5 text-xs rounded-full ${active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`,
        children: active ? activeText : inactiveText
    }, void 0, false, {
        fileName: "[project]/app/(dashboard)/dashboard/partners/page.tsx",
        lineNumber: 139,
        columnNumber: 10
    }, this);
}
_c2 = Badge;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "PartnersPage");
__turbopack_context__.k.register(_c1, "StatCard");
__turbopack_context__.k.register(_c2, "Badge");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_086wdr-._.js.map