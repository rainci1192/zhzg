(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/(dashboard)/dashboard/review/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ReviewPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/contexts/AuthContext.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
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
    _s();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const role = user?.role || '';
    const [list, setList] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [preview, setPreview] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const fetchPending = async ()=>{
        setLoading(true);
        try {
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].getArticles('?filters[review_status][$in][0]=pending_level1&filters[review_status][$in][1]=pending_level2&filters[review_status][$in][2]=pending_admin&filters[review_status][$in][3]=pending_leader&filters[review_status][$in][4]=pending_republish&sort=createdAt:desc');
            setList(res.data || []);
            if ("TURBOPACK compile-time truthy", 1) window.dispatchEvent(new CustomEvent('workflow-tasks-updated'));
        } finally{
            setLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ReviewPage.useEffect": ()=>{
            void fetchPending();
        }
    }["ReviewPage.useEffect"], []);
    const review = async (article, decision)=>{
        const comment = decision === 'reject' ? prompt('请输入退回原因：') || '' : prompt('审核意见（可留空）：') || '';
        if (decision === 'reject' && !comment.trim()) return;
        if (level1Statuses.has(article.review_status)) {
            let level2ReviewerId;
            if (decision === 'approve') {
                const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].getLevel2Reviewers();
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
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].reviewArticleLevel1(article.documentId, decision, comment, level2ReviewerId);
        } else {
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].reviewArticleLevel2(article.documentId, decision, comment);
        }
        await fetchPending();
        alert(decision === 'approve' && level1Statuses.has(article.review_status) ? '一级审核通过，已提交二级审核。' : decision === 'approve' ? '审核通过。' : '文章已退回发布者。');
    };
    const canReview = (article)=>role === 'super_admin' || level1Statuses.has(article.review_status) && level1Roles.has(role) && (!article.level1_reviewer || relationMatches(article.level1_reviewer, user)) || level2Statuses.has(article.review_status) && level2Roles.has(role) && (!article.level2_reviewer || relationMatches(article.level2_reviewer, user));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                className: "text-2xl font-bold mb-4",
                children: "审核中心"
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                lineNumber: 94,
                columnNumber: 7
            }, this),
            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: "加载中..."
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                lineNumber: 95,
                columnNumber: 18
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                className: "w-full bg-white rounded-xl border",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                        className: "bg-gray-50",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    className: "p-3 text-left",
                                    children: "标题"
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                                    lineNumber: 95,
                                    columnNumber: 125
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    className: "p-3 text-left",
                                    children: "状态"
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                                    lineNumber: 95,
                                    columnNumber: 162
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    className: "p-3 text-center",
                                    children: "操作"
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                                    lineNumber: 95,
                                    columnNumber: 199
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                            lineNumber: 95,
                            columnNumber: 121
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                        lineNumber: 95,
                        columnNumber: 91
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                        children: [
                            list.map((article)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    className: "border-t",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-3",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: async ()=>{
                                                    const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].getArticle(article.documentId);
                                                    setPreview(res.data || null);
                                                },
                                                className: "text-blue-600 hover:underline",
                                                children: article.title
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                                                lineNumber: 95,
                                                columnNumber: 343
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                                            lineNumber: 95,
                                            columnNumber: 323
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-3",
                                            children: statusLabel(article.review_status)
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                                            lineNumber: 95,
                                            columnNumber: 556
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-3 text-center space-x-2",
                                            children: canReview(article) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>void review(article, 'approve'),
                                                        className: "px-3 py-1 bg-green-600 text-white rounded",
                                                        children: "通过"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                                                        lineNumber: 95,
                                                        columnNumber: 684
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>void review(article, 'reject'),
                                                        className: "px-3 py-1 bg-red-600 text-white rounded",
                                                        children: "退回"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                                                        lineNumber: 95,
                                                        columnNumber: 805
                                                    }, this)
                                                ]
                                            }, void 0, true)
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                                            lineNumber: 95,
                                            columnNumber: 617
                                        }, this)
                                    ]
                                }, article.id, true, {
                                    fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                                    lineNumber: 95,
                                    columnNumber: 281
                                }, this)),
                            list.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    colSpan: 3,
                                    className: "p-6 text-center text-gray-400",
                                    children: "暂无待审核内容"
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                                    lineNumber: 95,
                                    columnNumber: 965
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                                lineNumber: 95,
                                columnNumber: 961
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                        lineNumber: 95,
                        columnNumber: 251
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                lineNumber: 95,
                columnNumber: 38
            }, this),
            preview && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white max-w-3xl w-full rounded-xl p-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-xl font-bold mb-2",
                            children: preview.title
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                            lineNumber: 96,
                            columnNumber: 158
                        }, this),
                        preview.summary && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-gray-600 mb-4",
                            children: preview.summary
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                            lineNumber: 96,
                            columnNumber: 237
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "prose max-w-none",
                            dangerouslySetInnerHTML: {
                                __html: preview.content || ''
                            }
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                            lineNumber: 96,
                            columnNumber: 293
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-right mt-6",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setPreview(null),
                                className: "px-4 py-2 bg-gray-200 rounded",
                                children: "关闭"
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                                lineNumber: 96,
                                columnNumber: 422
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                            lineNumber: 96,
                            columnNumber: 389
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                    lineNumber: 96,
                    columnNumber: 100
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
                lineNumber: 96,
                columnNumber: 19
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/(dashboard)/dashboard/review/page.tsx",
        lineNumber: 93,
        columnNumber: 5
    }, this);
}
_s(ReviewPage, "uJd9ZenxtdVrs5N4D4CCpvHLXHs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = ReviewPage;
var _c;
__turbopack_context__.k.register(_c, "ReviewPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_%28dashboard%29_dashboard_review_page_tsx_0n6y6-u._.js.map