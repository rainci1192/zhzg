module.exports = [
"[project]/lib/sanitize-html.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sanitizeRichHtml",
    ()=>sanitizeRichHtml
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sanitize-html/index.js [app-ssr] (ecmascript)");
;
// Keep common Word/WPS/Excel formatting while excluding active CSS (URLs,
// expressions and arbitrary layout rules). Both admin preview and public site
// use the same allowlist so an approved article looks the same in both places.
const size = /^(?:auto|0|\d+(?:\.\d+)?(?:px|pt|em|rem|%))$/i;
const color = /^(?:#[0-9a-f]{3,8}|[a-z]+|rgba?\(\s*[\d.%,\s]+\)|hsla?\(\s*[\d.%,\s]+\))$/i;
const border = /^(?:none|(?:\d+(?:\.\d+)?(?:px|pt))\s+(?:solid|dashed|dotted|double)\s+(?:#[0-9a-f]{3,8}|[a-z]+))$/i;
const OPTIONS = {
    allowedTags: [
        ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].defaults.allowedTags,
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
        ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].defaults.allowedAttributes,
        a: [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].defaults.allowedAttributes.a || [],
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
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sanitize$2d$html$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(typeof value === 'string' ? value : '', OPTIONS);
}
}),
"[project]/app/(dashboard)/dashboard/review/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ReviewPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sanitize$2d$html$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/sanitize-html.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/contexts/AuthContext.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
const level1Statuses = new Set([
    'pending_level1',
    'pending_admin'
]);
const level2Statuses = new Set([
    'pending_level2',
    'pending_republish',
    'pending_leader'
]);
const level1Roles = new Set([
    'article_level1_reviewer',
    'level1_reviewer',
    'reviewer_level1'
]);
const level2Roles = new Set([
    'article_level2_reviewer',
    'level2_reviewer',
    'reviewer_level2'
]);
function statusLabel(status) {
    if (level1Statuses.has(status)) return '待一级审核';
    return '待二级审核';
}
function relationMatches(relation, user) {
    if (!relation || !user) return false;
    return relation.id != null && String(relation.id) === String(user.id) || !!relation.documentId && relation.documentId === user.documentId || !!relation.email && relation.email.toLowerCase() === user.email?.toLowerCase();
}
function ReviewPage() {
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const role = user?.role || '';
    const [list, setList] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [preview, setPreview] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const fetchPending = async ()=>{
        setLoading(true);
        try {
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].getArticles('?filters[review_status][$in][0]=pending_level1&filters[review_status][$in][1]=pending_level2&filters[review_status][$in][2]=pending_admin&filters[review_status][$in][3]=pending_leader&filters[review_status][$in][4]=pending_republish&sort=createdAt:desc');
            setList(res.data || []);
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
        } finally{
            setLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        void fetchPending();
    }, []);
    const review = async (article, decision)=>{
        const comment = decision === 'reject' ? prompt('请输入退回原因：') || '' : prompt('审核意见（可留空）：') || '';
        if (decision === 'reject' && !comment.trim()) return;
        if (level1Statuses.has(article.review_status)) {
            let level2ReviewerId;
            if (decision === 'approve') {
                const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].getLevel2Reviewers();
                const reviewers = response.data || [];
                if (!reviewers.length) throw new Error('当前没有可用的二级审核人员。');
                if (reviewers.length === 1) level2ReviewerId = reviewers[0].documentId || reviewers[0].id;
                else {
                    const answer = prompt(`请选择二级审核人员：\n${reviewers.map((item, index)=>`${index + 1}. ${item.name}（${item.email}）`).join('\n')}`, '1');
                    const selected = reviewers[Number(answer) - 1];
                    if (!selected) return;
                    level2ReviewerId = selected.documentId || selected.id;
                }
            }
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].reviewArticleLevel1(article.documentId, decision, comment, level2ReviewerId);
        } else {
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].reviewArticleLevel2(article.documentId, decision, comment);
        }
        await fetchPending();
        alert(decision === 'approve' && level1Statuses.has(article.review_status) ? '一级审核通过，已提交二级审核。' : decision === 'approve' ? '审核通过。' : '文章已退回发布者。');
    };
    const canReview = (article)=>role === 'super_admin' || level1Statuses.has(article.review_status) && level1Roles.has(role) && (!article.level1_reviewer || relationMatches(article.level1_reviewer, user)) || level2Statuses.has(article.review_status) && level2Roles.has(role) && (!article.level2_reviewer || relationMatches(article.level2_reviewer, user));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                className: "text-2xl font-bold mb-4",
                children: "审核中心"
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                lineNumber: 96,
                columnNumber: 7
            }, this),
            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: "加载中..."
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                lineNumber: 97,
                columnNumber: 18
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                className: "w-full bg-white rounded-xl border",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                        className: "bg-gray-50",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    className: "p-3 text-left",
                                    children: "标题"
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                                    lineNumber: 97,
                                    columnNumber: 125
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    className: "p-3 text-left",
                                    children: "状态"
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                                    lineNumber: 97,
                                    columnNumber: 162
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    className: "p-3 text-center",
                                    children: "操作"
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                                    lineNumber: 97,
                                    columnNumber: 199
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                            lineNumber: 97,
                            columnNumber: 121
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                        lineNumber: 97,
                        columnNumber: 91
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                        children: [
                            list.map((article)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    className: "border-t",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-3",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: async ()=>{
                                                    const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].getArticle(article.documentId);
                                                    setPreview(res.data || null);
                                                },
                                                className: "text-blue-600 hover:underline",
                                                children: article.title
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                                                lineNumber: 97,
                                                columnNumber: 343
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                                            lineNumber: 97,
                                            columnNumber: 323
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-3",
                                            children: statusLabel(article.review_status)
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                                            lineNumber: 97,
                                            columnNumber: 556
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-3 text-center space-x-2",
                                            children: canReview(article) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>void review(article, 'approve'),
                                                        className: "px-3 py-1 bg-green-600 text-white rounded",
                                                        children: "通过"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                                                        lineNumber: 97,
                                                        columnNumber: 684
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>void review(article, 'reject'),
                                                        className: "px-3 py-1 bg-red-600 text-white rounded",
                                                        children: "退回"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                                                        lineNumber: 97,
                                                        columnNumber: 805
                                                    }, this)
                                                ]
                                            }, void 0, true)
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                                            lineNumber: 97,
                                            columnNumber: 617
                                        }, this)
                                    ]
                                }, article.id, true, {
                                    fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                                    lineNumber: 97,
                                    columnNumber: 281
                                }, this)),
                            list.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    colSpan: 3,
                                    className: "p-6 text-center text-gray-400",
                                    children: "暂无待审核内容"
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                                    lineNumber: 97,
                                    columnNumber: 965
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                                lineNumber: 97,
                                columnNumber: 961
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                        lineNumber: 97,
                        columnNumber: 251
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                lineNumber: 97,
                columnNumber: 38
            }, this),
            preview && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white max-w-3xl w-full rounded-xl p-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-xl font-bold mb-2",
                            children: preview.title
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                            lineNumber: 98,
                            columnNumber: 158
                        }, this),
                        preview.summary && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-gray-600 mb-4",
                            children: preview.summary
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                            lineNumber: 98,
                            columnNumber: 237
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "prose max-w-none",
                            dangerouslySetInnerHTML: {
                                __html: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$sanitize$2d$html$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitizeRichHtml"])(preview.content || '')
                            }
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                            lineNumber: 98,
                            columnNumber: 293
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-right mt-6",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setPreview(null),
                                className: "px-4 py-2 bg-gray-200 rounded",
                                children: "关闭"
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                                lineNumber: 98,
                                columnNumber: 440
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                            lineNumber: 98,
                            columnNumber: 407
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                    lineNumber: 98,
                    columnNumber: 100
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                lineNumber: 98,
                columnNumber: 19
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
        lineNumber: 95,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=_0qtda-n._.js.map