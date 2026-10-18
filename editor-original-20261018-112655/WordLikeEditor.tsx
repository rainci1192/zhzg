'use client';

import { useEffect, useRef, useState } from 'react';
import type { Jodit as JoditEditor } from 'jodit';
import './WordLikeEditor.css';

interface Props {
  value: string;
  onChange: (html: string) => void;
  uploadImage: (file: File) => Promise<string>;
}

/** Jodit accesses the DOM at import time, so load it only in the browser. */
export default function WordLikeEditor({ value, onChange, uploadImage }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<JoditEditor | null>(null);
  const onChangeRef = useRef(onChange);
  const uploadRef = useRef(uploadImage);
  const initialValueRef = useRef(value);
  const lastValueRef = useRef(value);
  const [error, setError] = useState('');

  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
  useEffect(() => { uploadRef.current = uploadImage; }, [uploadImage]);

  useEffect(() => {
    let disposed = false;
    const target = textareaRef.current;
    if (!target) return;

    import('jodit').then(({ Jodit }) => {
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
              'Times New Roman, serif': 'Times New Roman',
            },
          },
          fontsize: { list: [9, 10.5, 12, 14, 15, 16, 18, 22, 24, 26, 36, 42] },
        },
        buttons: [
          'undo', 'redo', '|', 'paragraph', 'font', 'fontsize', '|',
          'bold', 'italic', 'underline', 'strikethrough', 'eraser', '|',
          'brush', 'copyformat', '|', 'align', 'ul', 'ol', 'outdent', 'indent',
          '\n',
          'table', 'link', 'image', 'hr', '|',
          'cut', 'copy', 'paste', 'selectall', '|', 'find', 'print', 'source', 'fullsize',
        ],
        processPasteFromWord: true,
        askBeforePasteFromWord: false,
        defaultActionOnPasteFromWord: 'insert_as_html',
        askBeforePasteHTML: false,
        defaultActionOnPaste: 'insert_as_html',
        uploader: {
          url: '/api/upload',
          insertImageAsBase64URI: false,
          customUploadFunction: async (requestData: unknown, showProgress: (progress: number) => void) => {
            const file = requestData instanceof FormData
              ? [...requestData.values()].find((part): part is File => part instanceof File)
              : undefined;
            if (!file) throw new Error('请选择要上传的图片。');
            const url = await uploadRef.current(file);
            showProgress(100);
            return {
              success: true,
              time: new Date().toISOString(),
              data: { files: [url], baseurl: '', isImages: [true] },
            };
          },
        },
      });
      editorRef.current = editor;
      editor.value = initialValueRef.current || '';
      editor.events.on('change', () => {
        const html = editor.value;
        lastValueRef.current = html;
        onChangeRef.current(html);
      });
    }).catch((reason) => {
      if (!disposed) {
        console.error('富文本编辑器加载失败', reason);
        setError('编辑器加载失败，请刷新页面重试。');
      }
    });

    return () => {
      disposed = true;
      editorRef.current?.destruct();
      editorRef.current = null;
    };
  }, []);

  // External article changes should update the editor without resetting normal typing.
  useEffect(() => {
    if (editorRef.current && value !== lastValueRef.current) {
      editorRef.current.value = value || '';
      lastValueRef.current = value;
    } else if (!editorRef.current) {
      initialValueRef.current = value;
      lastValueRef.current = value;
    }
  }, [value]);

  return (
    <div className="word-like-editor">
      <textarea ref={textareaRef} defaultValue={initialValueRef.current} aria-label="文章正文（富文本编辑器）" />
      {error && <p role="alert" className="word-like-editor__error">{error}</p>}
      <p className="word-like-editor__hint">可直接粘贴 Word、WPS 或 Excel 表格；选中单元格后使用“对齐”或右键菜单调整格式。</p>
    </div>
  );
}
