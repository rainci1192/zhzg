module.exports = [
"[project]/components/editor/WordLikeEditor.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>WordLikeEditor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ckeditor5$2f$dist$2f$ckeditor5$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/ckeditor5/dist/ckeditor5.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$editor$2d$classic$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@ckeditor/ckeditor5-editor-classic/dist/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$essentials$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@ckeditor/ckeditor5-essentials/dist/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$paragraph$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@ckeditor/ckeditor5-paragraph/dist/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$heading$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@ckeditor/ckeditor5-heading/dist/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$basic$2d$styles$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@ckeditor/ckeditor5-basic-styles/dist/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$remove$2d$format$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@ckeditor/ckeditor5-remove-format/dist/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$font$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@ckeditor/ckeditor5-font/dist/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$alignment$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@ckeditor/ckeditor5-alignment/dist/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$list$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@ckeditor/ckeditor5-list/dist/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$indent$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@ckeditor/ckeditor5-indent/dist/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$link$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@ckeditor/ckeditor5-link/dist/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$table$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@ckeditor/ckeditor5-table/dist/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$image$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@ckeditor/ckeditor5-image/dist/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$block$2d$quote$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@ckeditor/ckeditor5-block-quote/dist/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$horizontal$2d$line$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@ckeditor/ckeditor5-horizontal-line/dist/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$undo$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@ckeditor/ckeditor5-undo/dist/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$paste$2d$from$2d$office$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@ckeditor/ckeditor5-paste-from-office/dist/index.js [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
function WordLikeEditor({ value, onChange, uploadImage }) {
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const editorRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const onChangeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(onChange);
    const uploadRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(uploadImage);
    const initialValueRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(value);
    // 保持 ref 最新，不触发重渲染
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        onChangeRef.current = onChange;
    }, [
        onChange
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        uploadRef.current = uploadImage;
    }, [
        uploadImage
    ]);
    // 只在 mount 时创建一次编辑器
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const el = containerRef.current;
        if (!el || editorRef.current) return;
        let isMounted = true;
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$editor$2d$classic$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ClassicEditor"].create(el, {
            licenseKey: 'GPL',
            initialData: initialValueRef.current || '',
            plugins: [
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$essentials$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Essentials"],
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$paragraph$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Paragraph"],
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$heading$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Heading"],
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$basic$2d$styles$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Bold"],
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$basic$2d$styles$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Italic"],
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$basic$2d$styles$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Underline"],
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$basic$2d$styles$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Strikethrough"],
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$remove$2d$format$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RemoveFormat"],
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$font$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Font"],
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$alignment$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Alignment"],
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$list$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["List"],
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$indent$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Indent"],
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$indent$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["IndentBlock"],
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$link$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Link"],
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$table$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Table"],
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$table$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TableToolbar"],
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$table$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TableProperties"],
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$table$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TableCellProperties"],
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$image$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Image"],
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$image$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ImageToolbar"],
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$image$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ImageStyle"],
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$image$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ImageResize"],
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$image$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ImageUpload"],
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$block$2d$quote$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BlockQuote"],
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$horizontal$2d$line$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HorizontalLine"],
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$undo$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Undo"],
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ckeditor$2f$ckeditor5$2d$paste$2d$from$2d$office$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PasteFromOffice"]
            ],
            toolbar: [
                'undo',
                'redo',
                '|',
                'heading',
                '|',
                'fontFamily',
                'fontSize',
                '|',
                'bold',
                'italic',
                'underline',
                'strikethrough',
                'removeFormat',
                '|',
                'fontColor',
                'fontBackgroundColor',
                '|',
                'alignment',
                '|',
                'bulletedList',
                'numberedList',
                'outdent',
                'indent',
                '|',
                'insertTable',
                'blockQuote',
                'horizontalLine',
                '|',
                'link',
                'uploadImage'
            ],
            heading: {
                options: [
                    {
                        model: 'paragraph',
                        title: '正文',
                        class: 'ck-heading_paragraph'
                    },
                    {
                        model: 'heading1',
                        view: 'h1',
                        title: '标题 1',
                        class: 'ck-heading_heading1'
                    },
                    {
                        model: 'heading2',
                        view: 'h2',
                        title: '标题 2',
                        class: 'ck-heading_heading2'
                    },
                    {
                        model: 'heading3',
                        view: 'h3',
                        title: '标题 3',
                        class: 'ck-heading_heading3'
                    }
                ]
            },
            fontFamily: {
                options: [
                    'default',
                    '宋体, SimSun',
                    '黑体, SimHei',
                    '微软雅黑, Microsoft YaHei',
                    '楷体, KaiTi',
                    '仿宋, FangSong',
                    'Arial, Helvetica, sans-serif',
                    'Times New Roman, Times, serif'
                ],
                supportAllValues: true
            },
            fontSize: {
                options: [
                    {
                        title: '初号',
                        model: '42px'
                    },
                    {
                        title: '小初',
                        model: '36px'
                    },
                    {
                        title: '一号',
                        model: '26px'
                    },
                    {
                        title: '小一',
                        model: '24px'
                    },
                    {
                        title: '二号',
                        model: '22px'
                    },
                    {
                        title: '小二',
                        model: '18px'
                    },
                    {
                        title: '三号',
                        model: '16px'
                    },
                    {
                        title: '小三',
                        model: '15px'
                    },
                    {
                        title: '四号',
                        model: '14px'
                    },
                    {
                        title: '小四',
                        model: '12px'
                    },
                    {
                        title: '五号',
                        model: '10.5px'
                    },
                    {
                        title: '小五',
                        model: '9px'
                    }
                ],
                supportAllValues: true
            },
            table: {
                contentToolbar: [
                    'tableColumn',
                    'tableRow',
                    'mergeTableCells',
                    'tableProperties',
                    'tableCellProperties'
                ]
            },
            image: {
                toolbar: [
                    'imageStyle:inline',
                    'imageStyle:block',
                    'imageStyle:side',
                    '|',
                    'resizeImage'
                ]
            }
        }).then((editor)=>{
            if (!isMounted) {
                editor.destroy();
                return;
            }
            editorRef.current = editor;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            editor.plugins.get('FileRepository').createUploadAdapter = (loader)=>({
                    upload: async ()=>{
                        const file = await loader.file;
                        const url = await uploadRef.current(file);
                        return {
                            default: url
                        };
                    }
                });
            editor.model.document.on('change:data', ()=>{
                onChangeRef.current(editor.getData());
            });
        }).catch(()=>{});
        return ()=>{
            isMounted = false;
            if (editorRef.current) {
                editorRef.current.destroy().catch(()=>{});
                editorRef.current = null;
            }
        };
    // 只 mount 时执行一次，不依赖任何 props
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "border rounded-xl overflow-hidden",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            ref: containerRef
        }, void 0, false, {
            fileName: "[project]/components/editor/WordLikeEditor.tsx",
            lineNumber: 173,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/editor/WordLikeEditor.tsx",
        lineNumber: 172,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=components_editor_WordLikeEditor_tsx_0vww..d._.js.map