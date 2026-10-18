(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/editor/WordLikeEditor.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>WordLikeEditor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function WordLikeEditor({ value, onChange, uploadImage }) {
    _s();
    const textareaRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const editorRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const onChangeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(onChange);
    const uploadRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(uploadImage);
    const initialValueRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(value);
    const lastValueRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(value);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WordLikeEditor.useEffect": ()=>{
            onChangeRef.current = onChange;
        }
    }["WordLikeEditor.useEffect"], [
        onChange
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WordLikeEditor.useEffect": ()=>{
            uploadRef.current = uploadImage;
        }
    }["WordLikeEditor.useEffect"], [
        uploadImage
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WordLikeEditor.useEffect": ()=>{
            let disposed = false;
            const target = textareaRef.current;
            if (!target) return;
            __turbopack_context__.A("[project]/node_modules/jodit/esm/index.js [app-client] (ecmascript, async loader)").then({
                "WordLikeEditor.useEffect": ({ Jodit })=>{
                    if (disposed) return;
                    const editor = Jodit.make(target, {
                        language: 'zh_cn',
                        sourceEditor: 'area',
                        beautifyHTML: false,
                        height: 540,
                        minHeight: 380,
                        toolbarAdaptive: false,
                        toolbarSticky: true,
                        showCharsCounter: true,
                        showWordsCounter: true,
                        showXPathInStatusbar: false,
                        zIndex: 1100,
                        defaultFontSizePoints: 'pt',
                        controls: {
                            font: {
                                list: {
                                    '': '默认字体',
                                    'SimSun, 宋体, serif': '宋体',
                                    'Microsoft YaHei, 微软雅黑, sans-serif': '微软雅黑',
                                    'SimHei, 黑体, sans-serif': '黑体',
                                    'KaiTi, 楷体, serif': '楷体',
                                    'FangSong, 仿宋, serif': '仿宋',
                                    'Arial, sans-serif': 'Arial',
                                    'Times New Roman, serif': 'Times New Roman'
                                }
                            },
                            fontsize: {
                                list: [
                                    9,
                                    10.5,
                                    12,
                                    14,
                                    15,
                                    16,
                                    18,
                                    22,
                                    24,
                                    26,
                                    36,
                                    42
                                ]
                            }
                        },
                        buttons: [
                            'undo',
                            'redo',
                            '|',
                            'paragraph',
                            'font',
                            'fontsize',
                            '|',
                            'bold',
                            'italic',
                            'underline',
                            'strikethrough',
                            'eraser',
                            '|',
                            'brush',
                            'copyformat',
                            '|',
                            'align',
                            'ul',
                            'ol',
                            'outdent',
                            'indent',
                            '\n',
                            'table',
                            'link',
                            'image',
                            'hr',
                            '|',
                            'cut',
                            'copy',
                            'paste',
                            'selectall',
                            '|',
                            'find',
                            'print',
                            'source',
                            'fullsize'
                        ],
                        processPasteFromWord: true,
                        askBeforePasteFromWord: false,
                        defaultActionOnPasteFromWord: 'insert_as_html',
                        askBeforePasteHTML: false,
                        defaultActionOnPaste: 'insert_as_html',
                        uploader: {
                            url: '/api/upload',
                            insertImageAsBase64URI: false,
                            customUploadFunction: {
                                "WordLikeEditor.useEffect.editor": async (requestData, showProgress)=>{
                                    const file = requestData instanceof FormData ? [
                                        ...requestData.values()
                                    ].find({
                                        "WordLikeEditor.useEffect.editor": (part)=>part instanceof File
                                    }["WordLikeEditor.useEffect.editor"]) : undefined;
                                    if (!file) throw new Error('请选择要上传的图片。');
                                    const url = await uploadRef.current(file);
                                    showProgress(100);
                                    return {
                                        success: true,
                                        time: new Date().toISOString(),
                                        data: {
                                            files: [
                                                url
                                            ],
                                            baseurl: '',
                                            isImages: [
                                                true
                                            ]
                                        }
                                    };
                                }
                            }["WordLikeEditor.useEffect.editor"]
                        }
                    });
                    editorRef.current = editor;
                    editor.value = initialValueRef.current || '';
                    editor.events.on('change', {
                        "WordLikeEditor.useEffect": ()=>{
                            const html = editor.value;
                            lastValueRef.current = html;
                            onChangeRef.current(html);
                        }
                    }["WordLikeEditor.useEffect"]);
                }
            }["WordLikeEditor.useEffect"]).catch({
                "WordLikeEditor.useEffect": (reason)=>{
                    if (!disposed) {
                        console.error('富文本编辑器加载失败', reason);
                        setError('编辑器加载失败，请刷新页面重试。');
                    }
                }
            }["WordLikeEditor.useEffect"]);
            return ({
                "WordLikeEditor.useEffect": ()=>{
                    disposed = true;
                    editorRef.current?.destruct();
                    editorRef.current = null;
                }
            })["WordLikeEditor.useEffect"];
        }
    }["WordLikeEditor.useEffect"], []);
    // External article changes should update the editor without resetting normal typing.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WordLikeEditor.useEffect": ()=>{
            if (editorRef.current && value !== lastValueRef.current) {
                editorRef.current.value = value || '';
                lastValueRef.current = value;
            } else if (!editorRef.current) {
                initialValueRef.current = value;
                lastValueRef.current = value;
            }
        }
    }["WordLikeEditor.useEffect"], [
        value
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "word-like-editor",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                ref: textareaRef,
                defaultValue: initialValueRef.current,
                "aria-label": "文章正文（富文本编辑器）"
            }, void 0, false, {
                fileName: "[project]/components/editor/WordLikeEditor.tsx",
                lineNumber: 126,
                columnNumber: 7
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                role: "alert",
                className: "word-like-editor__error",
                children: error
            }, void 0, false, {
                fileName: "[project]/components/editor/WordLikeEditor.tsx",
                lineNumber: 127,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "word-like-editor__hint",
                children: "可直接粘贴 Word、WPS 或 Excel 表格；选中单元格后使用“对齐”或右键菜单调整格式。"
            }, void 0, false, {
                fileName: "[project]/components/editor/WordLikeEditor.tsx",
                lineNumber: 128,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/editor/WordLikeEditor.tsx",
        lineNumber: 125,
        columnNumber: 5
    }, this);
}
_s(WordLikeEditor, "/Y+FxndmlcitzzEhFMcJJDaz9H8=");
_c = WordLikeEditor;
var _c;
__turbopack_context__.k.register(_c, "WordLikeEditor");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/editor/WordLikeEditor.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/components/editor/WordLikeEditor.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=components_editor_WordLikeEditor_tsx_0sx~6or._.js.map