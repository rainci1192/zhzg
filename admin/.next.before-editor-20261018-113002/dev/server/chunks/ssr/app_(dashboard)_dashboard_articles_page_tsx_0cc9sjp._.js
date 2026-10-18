module.exports = [
"[project]/app/(dashboard)/dashboard/articles/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ArticlesPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-ssr] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$pen$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/square-pen.js [app-ssr] (ecmascript) <export default as Edit>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-ssr] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.js [app-ssr] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/send.js [app-ssr] (ecmascript) <export default as Send>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check-big.js [app-ssr] (ecmascript) <export default as CheckCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-x.js [app-ssr] (ecmascript) <export default as XCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.js [app-ssr] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/message-square.js [app-ssr] (ecmascript) <export default as MessageSquare>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user.js [app-ssr] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/contexts/AuthContext.tsx [app-ssr] (ecmascript)");
;
'use client';
;
;
;
;
;
;
;
const WordLikeEditor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(async ()=>{}, {
    loadableGenerated: {
        modules: [
            "[project]/components/editor/WordLikeEditor.tsx [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
const STRAPI_URL = ("TURBOPACK compile-time value", "http://localhost:1337") || 'http://localhost:1337';
const FRONTEND_URL = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000';
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
    const normalized = relation && typeof relation === 'object' && 'data' in relation ? relation.data : relation;
    if (!normalized || !user) return false;
    return normalized.id != null && String(normalized.id) === String(user.id) || normalized.documentId && normalized.documentId === user.documentId || normalized.email && normalized.email.toLowerCase() === user.email?.toLowerCase();
}
function ArticlesPage() {
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const userRole = user?.role || '';
    const isSuperAdmin = userRole === 'super_admin';
    const isLevel1 = isSuperAdmin || LEVEL1_ROLES.has(userRole);
    const isLevel2 = isSuperAdmin || LEVEL2_ROLES.has(userRole);
    const isPublisher = isSuperAdmin || !isLevel1 && !isLevel2;
    const [articles, setArticles] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [categories, setCategories] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [level1Reviewers, setLevel1Reviewers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [level2Reviewers, setLevel2Reviewers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [isModalOpen, setIsModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [editingKey, setEditingKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [reviewingArticle, setReviewingArticle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [reviewComment, setReviewComment] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [reviewAction, setReviewAction] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('approve');
    const [selectedLevel2Reviewer, setSelectedLevel2Reviewer] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [isSubmitModalOpen, setIsSubmitModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [submittingArticle, setSubmittingArticle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedLevel1Reviewer, setSelectedLevel1Reviewer] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [form, setForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        title: '',
        summary: '',
        content: '',
        primaryCategoryId: '',
        secondaryCategoryId: '',
        coverId: '',
        coverPreview: ''
    });
    const [coverFile, setCoverFile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const getKey = (article)=>article.documentId || String(article.id);
    const fetchArticles = async ()=>{
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].getArticles('?populate=*&sort=createdAt:desc');
            setArticles(response.data || []);
        } catch (error) {
            console.error('fetchArticles error:', error);
            setArticles([]);
        }
    };
    const fetchCategories = async ()=>{
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].getCategories('?populate=*&sort=sort_order:asc');
            setCategories(response.data || []);
        } catch (error) {
            console.error('fetchCategories error:', error);
            setCategories([]);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        (async ()=>{
            setLoading(true);
            await Promise.all([
                fetchArticles(),
                fetchCategories()
            ]);
            setLoading(false);
        })();
    }, []);
    const primaryOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>categories.filter((category)=>!category.parentCategory || category.level === 1), [
        categories
    ]);
    const secondaryOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const primaryId = Number(form.primaryCategoryId);
        if (!primaryId) return [];
        return categories.filter((category)=>{
            const parentId = category.parentCategory?.id ?? category.parent?.id ?? null;
            return parentId === primaryId;
        });
    }, [
        categories,
        form.primaryCategoryId
    ]);
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
                coverPreview: article.cover?.url ? `${STRAPI_URL}${article.cover.url}` : ''
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
                coverPreview: ''
            });
        }
        setCoverFile(null);
        setIsModalOpen(true);
    };
    const handleEditorUpload = async (file)=>{
        const uploaded = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["uploadFile"])(file);
        const url = uploaded?.[0]?.url || '';
        return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
    };
    const saveArticle = async (event)=>{
        event.preventDefault();
        if (!form.title.trim()) return alert('标题不能为空');
        if (!form.primaryCategoryId) return alert('请选择一级分类');
        try {
            const generateSlug = (title)=>{
                const slug = title.trim().toLowerCase().replace(/[\s\u3000]+/g, '-').replace(/[^a-z0-9_-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
                return slug || `article-${Date.now()}`;
            };
            let coverId = form.coverId;
            if (coverFile) {
                const uploaded = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["uploadFile"])(coverFile);
                if (uploaded?.[0]?.id) coverId = String(uploaded[0].id);
            }
            const payload = {
                title: form.title,
                slug: generateSlug(form.title),
                summary: form.summary,
                content: form.content,
                primary_category: Number(form.primaryCategoryId),
                secondary_category: form.secondaryCategoryId ? Number(form.secondaryCategoryId) : null,
                cover: coverId ? Number(coverId) : null
            };
            if (editingKey) await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].updateArticle(editingKey, payload);
            else await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].createArticle(payload);
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
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].getLevel1Reviewers();
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
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].submitArticleForReview(getKey(submittingArticle), selectedLevel1Reviewer === '__republish__' ? undefined : selectedLevel1Reviewer);
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
                const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].getLevel2Reviewers();
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
                await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].reviewArticleLevel1(getKey(reviewingArticle), reviewAction, reviewComment, selectedLevel2Reviewer);
            } else {
                await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].reviewArticleLevel2(getKey(reviewingArticle), reviewAction, reviewComment);
            }
            setIsReviewModalOpen(false);
            await fetchArticles();
            alert(reviewAction === 'approve' ? reviewingArticle.review_status === 'pending_level1' || reviewingArticle.review_status === 'pending_admin' ? '一级审核通过，已提交二级审核。' : '二级审核通过。' : '文章已退回发布者。');
        } catch (error) {
            alert(`审核操作失败：${error instanceof Error ? error.message : '未知错误'}`);
        }
    };
    const publish = async (article)=>{
        if (!confirm('二级审核已通过，确定现在发布吗？')) return;
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].publishArticle(getKey(article));
            await fetchArticles();
            alert('发布成功。');
        } catch (error) {
            alert(`发布失败：${error instanceof Error ? error.message : '未知错误'}`);
        }
    };
    const handleDelete = async (article)=>{
        if (!confirm('确定删除这篇文章吗？')) return;
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].deleteArticle(getKey(article));
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
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$pen$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit$3e$__["Edit"], {
                    className: "w-3 h-3"
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 368,
                    columnNumber: 71
                }, this)
            },
            pending_level1: {
                label: '待一级审核',
                color: 'bg-amber-100 text-amber-600',
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                    className: "w-3 h-3"
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 369,
                    columnNumber: 85
                }, this)
            },
            rejected_level1: {
                label: '一级审核退回',
                color: 'bg-red-100 text-red-600',
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                    className: "w-3 h-3"
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 370,
                    columnNumber: 83
                }, this)
            },
            pending_level2: {
                label: '待二级审核',
                color: 'bg-blue-100 text-blue-600',
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                    className: "w-3 h-3"
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 371,
                    columnNumber: 83
                }, this)
            },
            rejected_level2: {
                label: '二级审核退回',
                color: 'bg-orange-100 text-orange-600',
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                    className: "w-3 h-3"
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 372,
                    columnNumber: 89
                }, this)
            },
            pending_republish: {
                label: '修改待二级审核',
                color: 'bg-indigo-100 text-indigo-600',
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                    className: "w-3 h-3"
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 373,
                    columnNumber: 92
                }, this)
            },
            rejected_republish: {
                label: '修改审核退回',
                color: 'bg-red-100 text-red-600',
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                    className: "w-3 h-3"
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 374,
                    columnNumber: 86
                }, this)
            },
            approved_pending_publish: {
                label: '待发布者发布',
                color: 'bg-purple-100 text-purple-600',
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                    className: "w-3 h-3"
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 375,
                    columnNumber: 98
                }, this)
            },
            published: {
                label: '已发布',
                color: 'bg-emerald-100 text-emerald-600',
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                    className: "w-3 h-3"
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 376,
                    columnNumber: 82
                }, this)
            },
            unpublished: {
                label: '已取消发布',
                color: 'bg-gray-100 text-gray-600',
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                    className: "w-3 h-3"
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 377,
                    columnNumber: 80
                }, this)
            },
            pending_admin: {
                label: '待一级审核（旧状态）',
                color: 'bg-amber-100 text-amber-600',
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                    className: "w-3 h-3"
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 378,
                    columnNumber: 89
                }, this)
            },
            rejected_admin: {
                label: '一级审核退回（旧状态）',
                color: 'bg-red-100 text-red-600',
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                    className: "w-3 h-3"
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 379,
                    columnNumber: 87
                }, this)
            },
            pending_leader: {
                label: '待二级审核（旧状态）',
                color: 'bg-blue-100 text-blue-600',
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                    className: "w-3 h-3"
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 380,
                    columnNumber: 88
                }, this)
            },
            rejected_leader: {
                label: '二级审核退回（旧状态）',
                color: 'bg-orange-100 text-orange-600',
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                    className: "w-3 h-3"
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 381,
                    columnNumber: 94
                }, this)
            },
            approved: {
                label: '待发布者发布（旧状态）',
                color: 'bg-purple-100 text-purple-600',
                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                    className: "w-3 h-3"
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 382,
                    columnNumber: 87
                }, this)
            }
        };
        const info = map[status] || map.draft;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: `inline-flex max-w-full flex-wrap items-center justify-center gap-1 break-words whitespace-normal px-2 py-1 text-center text-xs font-medium leading-4 rounded-full ${info.color}`,
            children: [
                info.icon,
                info.label
            ]
        }, void 0, true, {
            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
            lineNumber: 385,
            columnNumber: 12
        }, this);
    };
    const renderActions = (article)=>{
        const editable = [
            'draft',
            'rejected_level1',
            'rejected_level2',
            'rejected_republish',
            'rejected_admin',
            'rejected_leader',
            'unpublished',
            'published'
        ].includes(article.review_status);
        const canReviewLevel1 = isLevel1 && (article.review_status === 'pending_level1' || article.review_status === 'pending_admin') && (isSuperAdmin || article.review_status === 'pending_admin' || relationMatches(article.level1_reviewer, user));
        const canReviewLevel2 = isLevel2 && (article.review_status === 'pending_level2' || article.review_status === 'pending_leader' || article.review_status === 'pending_republish') && (isSuperAdmin || !article.level2_reviewer || relationMatches(article.level2_reviewer, user));
        const canPublish = isPublisher && article.review_status === 'approved_pending_publish' && (isSuperAdmin || relationMatches(article.created_by_admin, user));
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-wrap items-center justify-center gap-1.5",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                    href: `${FRONTEND_URL}/article/${article.slug}`,
                    target: "_blank",
                    rel: "noreferrer",
                    className: "text-indigo-600 hover:text-indigo-800",
                    title: "预览",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                        className: "w-4 h-4"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                        lineNumber: 396,
                        columnNumber: 155
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 396,
                    columnNumber: 9
                }, this),
                isPublisher && editable && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>openModal(article),
                    className: "text-blue-600 hover:text-blue-800",
                    title: "编辑",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$pen$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit$3e$__["Edit"], {
                        className: "w-4 h-4"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                        lineNumber: 397,
                        columnNumber: 137
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 397,
                    columnNumber: 37
                }, this),
                isPublisher && editable && article.review_status !== 'published' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>openSubmitModal(article),
                    className: "text-amber-600 hover:text-amber-800",
                    title: article.review_status === 'rejected_republish' ? '提交二级审核' : '提交一级审核',
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__["Send"], {
                        className: "w-4 h-4"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                        lineNumber: 398,
                        columnNumber: 252
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 398,
                    columnNumber: 78
                }, this),
                canReviewLevel1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>openReviewModal(article, 'approve'),
                            className: "text-green-600 hover:text-green-800",
                            title: "一级审核通过",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                className: "w-4 h-4"
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                lineNumber: 399,
                                columnNumber: 154
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                            lineNumber: 399,
                            columnNumber: 31
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>openReviewModal(article, 'reject'),
                            className: "text-red-600 hover:text-red-800",
                            title: "一级审核退回",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                                className: "w-4 h-4"
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                lineNumber: 399,
                                columnNumber: 316
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                            lineNumber: 399,
                            columnNumber: 198
                        }, this)
                    ]
                }, void 0, true),
                canReviewLevel2 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>openReviewModal(article, 'approve'),
                            className: "text-green-600 hover:text-green-800",
                            title: "二级审核通过",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                className: "w-4 h-4"
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                lineNumber: 400,
                                columnNumber: 154
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                            lineNumber: 400,
                            columnNumber: 31
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>openReviewModal(article, 'reject'),
                            className: "text-red-600 hover:text-red-800",
                            title: "二级审核退回",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                                className: "w-4 h-4"
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                lineNumber: 400,
                                columnNumber: 316
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                            lineNumber: 400,
                            columnNumber: 198
                        }, this)
                    ]
                }, void 0, true),
                canPublish && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>publish(article),
                    className: "text-purple-600 hover:text-purple-800",
                    title: "发布",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                        className: "w-4 h-4"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                        lineNumber: 401,
                        columnNumber: 126
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 401,
                    columnNumber: 24
                }, this),
                isPublisher && article.review_status === 'published' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: async ()=>{
                        if (!confirm('确定取消发布这篇文章吗？')) return;
                        try {
                            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["api"].unpublishArticle(getKey(article));
                            await fetchArticles();
                        } catch (error) {
                            alert(`取消发布失败：${error instanceof Error ? error.message : '未知错误'}`);
                        }
                    },
                    className: "text-orange-600 hover:text-orange-800",
                    title: "取消发布",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                        className: "w-4 h-4"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                        lineNumber: 402,
                        columnNumber: 363
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 402,
                    columnNumber: 66
                }, this),
                (article.rejection_reason || article.level1_review_comment || article.level2_review_comment || article.admin_review_comment || article.leader_review_comment) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>alert(`审核意见：\n${article.rejection_reason || ''}\n${article.level1_review_comment || ''}\n${article.level2_review_comment || ''}`),
                    className: "text-gray-600 hover:text-gray-800",
                    title: "查看意见",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__["MessageSquare"], {
                        className: "w-4 h-4"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                        lineNumber: 403,
                        columnNumber: 384
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 403,
                    columnNumber: 171
                }, this),
                isPublisher && editable && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>handleDelete(article),
                    className: "text-red-500 hover:text-red-700",
                    title: "删除",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                        className: "w-4 h-4"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                        lineNumber: 404,
                        columnNumber: 138
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 404,
                    columnNumber: 37
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
            lineNumber: 395,
            columnNumber: 7
        }, this);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-3xl font-bold text-gray-900",
                                children: "文章管理"
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                lineNumber: 411,
                                columnNumber: 63
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-gray-500 mt-1",
                                children: [
                                    "共 ",
                                    articles.length,
                                    " 条文章"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                lineNumber: 411,
                                columnNumber: 121
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                        lineNumber: 411,
                        columnNumber: 58
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>openModal(),
                        className: "flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-medium",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                className: "w-5 h-5"
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                lineNumber: 411,
                                columnNumber: 335
                            }, this),
                            "新增文章"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                        lineNumber: 411,
                        columnNumber: 188
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                lineNumber: 411,
                columnNumber: 7
            }, this),
            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center py-12 text-gray-400",
                children: "加载中..."
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                lineNumber: 412,
                columnNumber: 18
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    className: "w-full table-fixed",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            className: "bg-gray-50 border-b",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "w-[25%] px-3 py-4 text-left text-sm font-medium text-gray-500",
                                        children: "标题"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                        lineNumber: 412,
                                        columnNumber: 257
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "w-[11%] px-3 py-4 text-left text-sm font-medium text-gray-500",
                                        children: "发布者"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                        lineNumber: 412,
                                        columnNumber: 342
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "w-[8%] px-2 py-4 text-left text-sm font-medium text-gray-500",
                                        children: "一级分类"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                        lineNumber: 412,
                                        columnNumber: 428
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "w-[8%] px-2 py-4 text-left text-sm font-medium text-gray-500",
                                        children: "二级分类"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                        lineNumber: 412,
                                        columnNumber: 514
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "w-[10%] px-2 py-4 text-left text-sm font-medium text-gray-500",
                                        children: "状态"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                        lineNumber: 412,
                                        columnNumber: 600
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "w-[12%] px-2 py-4 text-left text-sm font-medium text-gray-500",
                                        children: "发布时间"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                        lineNumber: 412,
                                        columnNumber: 685
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "w-[12%] px-2 py-4 text-left text-sm font-medium text-gray-500",
                                        children: "最后修改"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                        lineNumber: 412,
                                        columnNumber: 772
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "w-[14%] px-2 py-4 text-center text-sm font-medium text-gray-500",
                                        children: "操作"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                        lineNumber: 412,
                                        columnNumber: 859
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                lineNumber: 412,
                                columnNumber: 253
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                            lineNumber: 412,
                            columnNumber: 214
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            className: "divide-y",
                            children: [
                                articles.map((article)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        className: "hover:bg-gray-50",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "break-words px-3 py-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "font-medium leading-5 text-gray-900",
                                                        children: article.title
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                        lineNumber: 412,
                                                        columnNumber: 1102
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "break-all text-xs text-gray-400",
                                                        children: [
                                                            "slug: ",
                                                            article.slug
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                        lineNumber: 412,
                                                        columnNumber: 1176
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                lineNumber: 412,
                                                columnNumber: 1064
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "break-words px-3 py-4 text-sm",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "inline-flex max-w-full break-all items-center gap-1.5",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                                                            className: "h-3.5 w-3.5 shrink-0 text-gray-400"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                            lineNumber: 412,
                                                            columnNumber: 1374
                                                        }, this),
                                                        relationName(article.created_by_admin)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                    lineNumber: 412,
                                                    columnNumber: 1302
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                lineNumber: 412,
                                                columnNumber: 1256
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "break-words px-2 py-4 text-sm",
                                                children: article.primary_category?.name || '-'
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                lineNumber: 412,
                                                columnNumber: 1481
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "break-words px-2 py-4 text-sm",
                                                children: article.secondary_category?.name || '不分类'
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                lineNumber: 412,
                                                columnNumber: 1571
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-2 py-4",
                                                children: getStatusBadge(article.review_status)
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                lineNumber: 412,
                                                columnNumber: 1665
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "break-words px-2 py-4 text-xs text-gray-500",
                                                children: formatDate(article.publish_time || article.publishedAt)
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                lineNumber: 412,
                                                columnNumber: 1735
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "break-words px-2 py-4 text-xs text-gray-500",
                                                children: formatDate(article.updatedAt)
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                lineNumber: 412,
                                                columnNumber: 1857
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-2 py-4",
                                                children: renderActions(article)
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                lineNumber: 412,
                                                columnNumber: 1953
                                            }, this)
                                        ]
                                    }, article.id, true, {
                                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                        lineNumber: 412,
                                        columnNumber: 1014
                                    }, this)),
                                articles.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                        colSpan: 8,
                                        className: "p-6 text-center text-gray-400",
                                        children: "暂无文章"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                        lineNumber: 412,
                                        columnNumber: 2045
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                    lineNumber: 412,
                                    columnNumber: 2041
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                            lineNumber: 412,
                            columnNumber: 959
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 412,
                    columnNumber: 176
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                lineNumber: 412,
                columnNumber: 82
            }, this),
            isModalOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white rounded-3xl shadow-2xl w-full max-w-5xl mx-4 p-8 max-h-[90vh] overflow-y-auto",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-2xl font-bold mb-6",
                            children: editingKey ? '编辑文章' : '新增文章'
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                            lineNumber: 414,
                            columnNumber: 208
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                            onSubmit: saveArticle,
                            className: "space-y-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
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
                                    lineNumber: 414,
                                    columnNumber: 334
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
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
                                    lineNumber: 414,
                                    columnNumber: 522
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block mb-2 font-medium",
                                            children: "正文内容"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                            lineNumber: 414,
                                            columnNumber: 722
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(WordLikeEditor, {
                                            value: form.content,
                                            onChange: (html)=>setForm((previous)=>({
                                                        ...previous,
                                                        content: html
                                                    })),
                                            uploadImage: handleEditorUpload
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                            lineNumber: 414,
                                            columnNumber: 776
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                    lineNumber: 414,
                                    columnNumber: 717
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-1 md:grid-cols-2 gap-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "block mb-2 font-medium",
                                                    children: "一级分类（必选）"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                    lineNumber: 414,
                                                    columnNumber: 991
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    value: form.primaryCategoryId,
                                                    onChange: (event)=>setForm((previous)=>({
                                                                ...previous,
                                                                primaryCategoryId: event.target.value,
                                                                secondaryCategoryId: ''
                                                            })),
                                                    className: "w-full px-4 py-3 border rounded",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "",
                                                            children: "请选择一级分类"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                            lineNumber: 414,
                                                            columnNumber: 1259
                                                        }, this),
                                                        primaryOptions.map((category)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: String(category.id),
                                                                children: category.name
                                                            }, category.id, false, {
                                                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                                lineNumber: 414,
                                                                columnNumber: 1326
                                                            }, this))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                    lineNumber: 414,
                                                    columnNumber: 1049
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                            lineNumber: 414,
                                            columnNumber: 986
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "block mb-2 font-medium",
                                                    children: "二级分类（可选）"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                    lineNumber: 414,
                                                    columnNumber: 1426
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    value: form.secondaryCategoryId,
                                                    onChange: (event)=>setForm((previous)=>({
                                                                ...previous,
                                                                secondaryCategoryId: event.target.value
                                                            })),
                                                    className: "w-full px-4 py-3 border rounded",
                                                    disabled: !form.primaryCategoryId,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "",
                                                            children: "不分类"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                            lineNumber: 414,
                                                            columnNumber: 1708
                                                        }, this),
                                                        secondaryOptions.map((category)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: String(category.id),
                                                                children: category.name
                                                            }, category.id, false, {
                                                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                                lineNumber: 414,
                                                                columnNumber: 1773
                                                            }, this))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                    lineNumber: 414,
                                                    columnNumber: 1484
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                            lineNumber: 414,
                                            columnNumber: 1421
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                    lineNumber: 414,
                                    columnNumber: 931
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block mb-2 font-medium",
                                            children: "封面图"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                            lineNumber: 414,
                                            columnNumber: 1879
                                        }, this),
                                        form.coverPreview && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            src: form.coverPreview,
                                            width: 160,
                                            height: 96,
                                            className: "w-40 h-24 object-cover rounded mb-2",
                                            alt: "cover",
                                            unoptimized: true
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                            lineNumber: 414,
                                            columnNumber: 1954
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "file",
                                            accept: "image/*",
                                            onChange: (event)=>setCoverFile(event.target.files?.[0] || null)
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                            lineNumber: 414,
                                            columnNumber: 2084
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                    lineNumber: 414,
                                    columnNumber: 1874
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex justify-end gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>setIsModalOpen(false),
                                            className: "px-6 py-3 border rounded",
                                            children: "取消"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                            lineNumber: 414,
                                            columnNumber: 2236
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "submit",
                                            className: "px-6 py-3 bg-blue-600 text-white rounded",
                                            children: "保存"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                            lineNumber: 414,
                                            columnNumber: 2344
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                    lineNumber: 414,
                                    columnNumber: 2196
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                            lineNumber: 414,
                            columnNumber: 283
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 414,
                    columnNumber: 104
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                lineNumber: 414,
                columnNumber: 23
            }, this),
            isSubmitModalOpen && submittingArticle && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-xl font-bold mb-4",
                            children: submittingArticle.review_status === 'rejected_republish' ? '提交二级审核' : '选择一级审核人员'
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                            lineNumber: 416,
                            columnNumber: 205
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-gray-600 mb-4",
                            children: [
                                "文章：",
                                submittingArticle.title
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                            lineNumber: 416,
                            columnNumber: 331
                        }, this),
                        submittingArticle.review_status === 'rejected_republish' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "rounded-lg bg-indigo-50 p-3 text-sm text-indigo-700",
                            children: "修改后的已发布文章将直接进入二级审核。"
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                            lineNumber: 416,
                            columnNumber: 465
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                            value: selectedLevel1Reviewer,
                            onChange: (event)=>setSelectedLevel1Reviewer(event.target.value),
                            className: "w-full px-4 py-3 border rounded-lg mb-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: "",
                                    children: "请选择"
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                    lineNumber: 416,
                                    columnNumber: 717
                                }, this),
                                level1Reviewers.map((reviewer)=>{
                                    const reviewerKey = String(reviewer.documentId || reviewer.email || reviewer.id);
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: reviewerKey,
                                        children: [
                                            reviewer.name,
                                            "（",
                                            reviewer.email,
                                            "）"
                                        ]
                                    }, reviewerKey, true, {
                                        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                        lineNumber: 416,
                                        columnNumber: 872
                                    }, this);
                                })
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                            lineNumber: 416,
                            columnNumber: 558
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-end gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setIsSubmitModalOpen(false),
                                    className: "px-4 py-2 border rounded-lg",
                                    children: "取消"
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                    lineNumber: 416,
                                    columnNumber: 1015
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: submitForReview,
                                    className: "px-4 py-2 bg-blue-600 text-white rounded-lg",
                                    children: "提交审核"
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                    lineNumber: 416,
                                    columnNumber: 1118
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                            lineNumber: 416,
                            columnNumber: 975
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 416,
                    columnNumber: 131
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                lineNumber: 416,
                columnNumber: 50
            }, this),
            isReviewModalOpen && reviewingArticle && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-xl font-bold mb-4",
                            children: [
                                reviewingArticle.review_status === 'pending_level1' || reviewingArticle.review_status === 'pending_admin' ? '一级审核' : '二级审核',
                                reviewAction === 'approve' ? '通过' : '退回'
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                            lineNumber: 418,
                            columnNumber: 204
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-gray-600 mb-2",
                            children: "文章标题："
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                            lineNumber: 418,
                            columnNumber: 415
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "font-medium mb-4",
                            children: reviewingArticle.title
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                            lineNumber: 418,
                            columnNumber: 466
                        }, this),
                        reviewAction === 'approve' && (reviewingArticle.review_status === 'pending_level1' || reviewingArticle.review_status === 'pending_admin') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "mb-2 block text-sm font-medium text-gray-700",
                                    children: "指定二级审核人员"
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                    lineNumber: 418,
                                    columnNumber: 690
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    value: selectedLevel2Reviewer,
                                    onChange: (event)=>setSelectedLevel2Reviewer(event.target.value),
                                    className: "w-full rounded-lg border px-4 py-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "",
                                            children: "请选择二级审核人员"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                            lineNumber: 418,
                                            columnNumber: 924
                                        }, this),
                                        level2Reviewers.map((reviewer)=>{
                                            const key = String(reviewer.documentId || reviewer.email || reviewer.id);
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: key,
                                                children: [
                                                    reviewer.name,
                                                    "（",
                                                    reviewer.email,
                                                    "）"
                                                ]
                                            }, key, true, {
                                                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                                lineNumber: 418,
                                                columnNumber: 1077
                                            }, this);
                                        })
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                    lineNumber: 418,
                                    columnNumber: 770
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                            lineNumber: 418,
                            columnNumber: 668
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "block text-sm font-medium text-gray-700 mb-2",
                            children: [
                                "审核意见 ",
                                reviewAction === 'reject' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-red-500",
                                    children: "*"
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                    lineNumber: 418,
                                    columnNumber: 1269
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                            lineNumber: 418,
                            columnNumber: 1170
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                            value: reviewComment,
                            onChange: (event)=>setReviewComment(event.target.value),
                            className: "w-full px-4 py-3 border rounded-lg",
                            rows: 4,
                            placeholder: reviewAction === 'approve' ? '可选填审核意见' : '请填写退回原因'
                        }, void 0, false, {
                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                            lineNumber: 418,
                            columnNumber: 1317
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-end gap-3 mt-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setIsReviewModalOpen(false),
                                    className: "px-4 py-2 border rounded-lg",
                                    children: "取消"
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                    lineNumber: 418,
                                    columnNumber: 1576
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleReview,
                                    className: `px-4 py-2 rounded-lg text-white ${reviewAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`,
                                    children: [
                                        "确认",
                                        reviewAction === 'approve' ? '通过并提交二级审核' : '退回'
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                                    lineNumber: 418,
                                    columnNumber: 1679
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                            lineNumber: 418,
                            columnNumber: 1531
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                    lineNumber: 418,
                    columnNumber: 130
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
                lineNumber: 418,
                columnNumber: 49
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/(dashboard)/dashboard/articles/page.tsx",
        lineNumber: 410,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=app_%28dashboard%29_dashboard_articles_page_tsx_0cc9sjp._.js.map