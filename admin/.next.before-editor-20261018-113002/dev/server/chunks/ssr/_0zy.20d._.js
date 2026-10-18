module.exports = [
"[project]/lib/api/partners.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$strapi$2d$fetch$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/strapi-fetch.ts [app-ssr] (ecmascript)");
;
const STRAPI_BASE_URL = ("TURBOPACK compile-time value", "http://localhost:1337") || process.env.STRAPI_URL || 'http://localhost:1337';
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
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$strapi$2d$fetch$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["strapiFetch"])(`${STRAPI_BASE_URL}/api/council-members?${params}`, {
        headers: authHeaders(),
        cache: 'no-store'
    });
    if (!res.ok) throw new Error(`获取合作单位失败: ${res.status}`);
    const json = await res.json();
    return (json.data ?? []).map(unwrap);
}
async function fetchPartner(documentId) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$strapi$2d$fetch$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["strapiFetch"])(`${STRAPI_BASE_URL}/api/council-members/${documentId}?populate=logo`, {
        headers: authHeaders(),
        cache: 'no-store'
    });
    if (!res.ok) throw new Error(`获取合作单位失败: ${res.status}`);
    const json = await res.json();
    return unwrap(json.data ?? json);
}
async function createPartner(payload) {
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$strapi$2d$fetch$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["strapiFetch"])(`${STRAPI_BASE_URL}/api/council-members`, {
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
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$strapi$2d$fetch$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["strapiFetch"])(`${STRAPI_BASE_URL}/api/council-members/${documentId}`, {
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
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$strapi$2d$fetch$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["strapiFetch"])(`${STRAPI_BASE_URL}/api/council-members/${documentId}`, {
        method: 'DELETE',
        headers: authHeaders()
    });
    if (!res.ok) throw new Error(`删除失败: ${res.status}`);
}
async function uploadLogo(file) {
    const formData = new FormData();
    formData.append('files', file);
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$strapi$2d$fetch$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["strapiFetch"])(`${STRAPI_BASE_URL}/api/upload`, {
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
}),
"[project]/app/(dashboard)/dashboard/partners/_components/PartnerForm.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PartnerForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$partners$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/partners.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [app-ssr] (ecmascript)");
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
function PartnerForm({ initialData }) {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const fileInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const isEdit = !!initialData;
    const [form, setForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        name: initialData?.name ?? '',
        intro: initialData?.intro ?? '',
        website: initialData?.website ?? '',
        is_active: initialData?.is_active ?? true,
        is_council: initialData?.is_council ?? false,
        sort_order: initialData?.sort_order ?? 0
    });
    const initialLogoUrl = initialData?.logo ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$partners$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toAbsoluteUrl"])(initialData.logo.url) : '';
    const [logoPreview, setLogoPreview] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialLogoUrl);
    const [logoFileId, setLogoFileId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialData?.logo?.id ?? null);
    const [uploading, setUploading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    async function handleLogoChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setLogoPreview(URL.createObjectURL(file));
        e.target.value = '';
        setUploading(true);
        setError('');
        try {
            const uploaded = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$partners$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["uploadLogo"])(file);
            setLogoFileId(uploaded.id);
            setLogoPreview(uploaded.url);
        } catch (err) {
            setError('Logo 上传失败：' + (err instanceof Error ? err.message : String(err)));
            setLogoPreview(initialLogoUrl);
        } finally{
            setUploading(false);
        }
    }
    const handleEditorUpload = async (file)=>{
        const uploaded = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["uploadFile"])(file);
        const url = uploaded?.[0]?.url || '';
        return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
    };
    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.name.trim()) {
            setError('企业名称不能为空');
            return;
        }
        setError('');
        setSaving(true);
        try {
            const payload = {
                name: form.name.trim(),
                intro: form.intro.trim() || undefined,
                website: form.website.trim() || undefined,
                is_active: form.is_active,
                is_council: form.is_council,
                sort_order: Number(form.sort_order),
                logo: logoFileId
            };
            if (isEdit) await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$partners$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updatePartner"])(initialData.documentId, payload);
            else await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$partners$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createPartner"])(payload);
            router.push('/dashboard/partners');
            router.refresh();
        } catch (err) {
            setError('保存失败：' + (err instanceof Error ? err.message : String(err)));
        } finally{
            setSaving(false);
        }
    }
    const isBusy = uploading || saving;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
        onSubmit: handleSubmit,
        className: "max-w-2xl mx-auto space-y-6",
        children: [
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm",
                children: error
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/dashboard/partners/_components/PartnerForm.tsx",
                lineNumber: 91,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                label: "企业名称",
                required: true,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    type: "text",
                    value: form.name,
                    onChange: (e)=>setForm({
                            ...form,
                            name: e.target.value
                        }),
                    placeholder: "请输入企业名称",
                    required: true,
                    className: "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/partners/_components/PartnerForm.tsx",
                    lineNumber: 94,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/dashboard/partners/_components/PartnerForm.tsx",
                lineNumber: 93,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                label: "企业 Logo",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-start gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-32 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden cursor-pointer hover:border-blue-400 transition-colors flex-shrink-0 relative",
                                onClick: ()=>fileInputRef.current?.click(),
                                children: logoPreview ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    src: logoPreview,
                                    alt: "logo预览",
                                    fill: true,
                                    className: "object-contain p-2",
                                    unoptimized: true
                                }, void 0, false, {
                                    fileName: "[project]/app/(dashboard)/dashboard/partners/_components/PartnerForm.tsx",
                                    lineNumber: 101,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-center text-gray-400 text-xs",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-2xl mb-1",
                                            children: "🖼"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/dashboard/partners/_components/PartnerForm.tsx",
                                            lineNumber: 103,
                                            columnNumber: 66
                                        }, this),
                                        "点击上传"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(dashboard)/dashboard/partners/_components/PartnerForm.tsx",
                                    lineNumber: 103,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/dashboard/partners/_components/PartnerForm.tsx",
                                lineNumber: 99,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col gap-2 justify-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>fileInputRef.current?.click(),
                                        disabled: uploading,
                                        className: "px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50",
                                        children: uploading ? '上传中…' : logoPreview ? '更换图片' : '选择图片'
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/dashboard/partners/_components/PartnerForm.tsx",
                                        lineNumber: 107,
                                        columnNumber: 13
                                    }, this),
                                    logoPreview && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>{
                                            setLogoPreview('');
                                            setLogoFileId(null);
                                        },
                                        className: "px-4 py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors",
                                        children: "移除图片"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/dashboard/partners/_components/PartnerForm.tsx",
                                        lineNumber: 111,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-gray-400",
                                        children: "支持 PNG / JPG / SVG，建议宽高比 3:2"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/dashboard/partners/_components/PartnerForm.tsx",
                                        lineNumber: 113,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(dashboard)/dashboard/partners/_components/PartnerForm.tsx",
                                lineNumber: 106,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(dashboard)/dashboard/partners/_components/PartnerForm.tsx",
                        lineNumber: 98,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        ref: fileInputRef,
                        type: "file",
                        accept: "image/*",
                        className: "hidden",
                        onChange: handleLogoChange
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/partners/_components/PartnerForm.tsx",
                        lineNumber: 116,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(dashboard)/dashboard/partners/_components/PartnerForm.tsx",
                lineNumber: 97,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                label: "企业简介",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(WordLikeEditor, {
                    value: form.intro,
                    onChange: (html)=>setForm({
                            ...form,
                            intro: html
                        }),
                    uploadImage: handleEditorUpload
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/partners/_components/PartnerForm.tsx",
                    lineNumber: 120,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/dashboard/partners/_components/PartnerForm.tsx",
                lineNumber: 119,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                label: "企业网址",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    type: "url",
                    value: form.website,
                    onChange: (e)=>setForm({
                            ...form,
                            website: e.target.value
                        }),
                    placeholder: "https://example.com（选填）",
                    className: "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/partners/_components/PartnerForm.tsx",
                    lineNumber: 128,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/dashboard/partners/_components/PartnerForm.tsx",
                lineNumber: 127,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                label: "排序权重",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "number",
                        value: form.sort_order,
                        min: 0,
                        onChange: (e)=>setForm({
                                ...form,
                                sort_order: Number(e.target.value)
                            }),
                        className: "w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/partners/_components/PartnerForm.tsx",
                        lineNumber: 132,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-gray-400 mt-1",
                        children: "数字越小越靠前，默认为 0"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/partners/_components/PartnerForm.tsx",
                        lineNumber: 133,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(dashboard)/dashboard/partners/_components/PartnerForm.tsx",
                lineNumber: 131,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-2 gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ToggleField, {
                        label: "是否理事单位",
                        description: "勾选后将显示在理事会成员列表",
                        checked: form.is_council,
                        onChange: (v)=>setForm({
                                ...form,
                                is_council: v
                            })
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/partners/_components/PartnerForm.tsx",
                        lineNumber: 137,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ToggleField, {
                        label: "启用显示",
                        description: "关闭后不在前台展示",
                        checked: form.is_active,
                        onChange: (v)=>setForm({
                                ...form,
                                is_active: v
                            })
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/partners/_components/PartnerForm.tsx",
                        lineNumber: 138,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(dashboard)/dashboard/partners/_components/PartnerForm.tsx",
                lineNumber: 136,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3 pt-4 border-t border-gray-100",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "submit",
                        disabled: isBusy,
                        className: "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50",
                        children: saving ? '保存中…' : isEdit ? '保存修改' : '创建单位'
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/partners/_components/PartnerForm.tsx",
                        lineNumber: 142,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>router.back(),
                        className: "px-6 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm",
                        children: "取消"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/partners/_components/PartnerForm.tsx",
                        lineNumber: 145,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(dashboard)/dashboard/partners/_components/PartnerForm.tsx",
                lineNumber: 141,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/(dashboard)/dashboard/partners/_components/PartnerForm.tsx",
        lineNumber: 90,
        columnNumber: 5
    }, this);
}
function Field({ label, required, children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "block text-sm font-medium text-gray-700 mb-1.5",
                children: [
                    label,
                    required && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-red-500 ml-1",
                        children: "*"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/partners/_components/PartnerForm.tsx",
                        lineNumber: 154,
                        columnNumber: 93
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(dashboard)/dashboard/partners/_components/PartnerForm.tsx",
                lineNumber: 154,
                columnNumber: 7
            }, this),
            children
        ]
    }, void 0, true, {
        fileName: "[project]/app/(dashboard)/dashboard/partners/_components/PartnerForm.tsx",
        lineNumber: 153,
        columnNumber: 5
    }, this);
}
function ToggleField({ label, description, checked, onChange }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-start gap-3 p-4 border border-gray-200 rounded-lg",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                role: "switch",
                "aria-checked": checked,
                onClick: ()=>onChange(!checked),
                className: `relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors focus:outline-none ${checked ? 'bg-blue-600' : 'bg-gray-200'}`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: `inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform mt-0.5 ${checked ? 'translate-x-5' : 'translate-x-0.5'}`
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/dashboard/partners/_components/PartnerForm.tsx",
                    lineNumber: 164,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/dashboard/partners/_components/PartnerForm.tsx",
                lineNumber: 163,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm font-medium text-gray-700",
                        children: label
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/partners/_components/PartnerForm.tsx",
                        lineNumber: 166,
                        columnNumber: 12
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-gray-400 mt-0.5",
                        children: description
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/partners/_components/PartnerForm.tsx",
                        lineNumber: 166,
                        columnNumber: 72
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(dashboard)/dashboard/partners/_components/PartnerForm.tsx",
                lineNumber: 166,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/(dashboard)/dashboard/partners/_components/PartnerForm.tsx",
        lineNumber: 162,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=_0zy.20d._.js.map