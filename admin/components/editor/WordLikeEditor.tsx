'use client';

import { useEffect, useRef } from 'react';

import {
  ClassicEditor,
  Essentials,
  Paragraph,
  Heading,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  RemoveFormat,
  Font,
  Alignment,
  List,
  Indent,
  IndentBlock,
  Link,
  Table,
  TableToolbar,
  TableProperties,
  TableCellProperties,
  Image,
  ImageToolbar,
  ImageStyle,
  ImageResize,
  ImageUpload,
  BlockQuote,
  HorizontalLine,
  Undo,
  PasteFromOffice,
} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import './WordLikeEditor.css'; // ✅ 新增：引入自定义样式


interface Props {
  value: string;
  onChange: (html: string) => void;
  uploadImage: (file: File) => Promise<string>;
}

export default function WordLikeEditor({ value, onChange, uploadImage }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  const uploadRef = useRef(uploadImage);
  const initialValueRef = useRef(value);

  // 保持 ref 最新，不触发重渲染
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
  useEffect(() => { uploadRef.current = uploadImage; }, [uploadImage]);

  // 只在 mount 时创建一次编辑器
  useEffect(() => {
    const el = containerRef.current;
    if (!el || editorRef.current) return;

    let isMounted = true;

    ClassicEditor.create(el, {
      licenseKey: 'GPL',
      initialData: initialValueRef.current || '',
      plugins: [
        Essentials, Paragraph, Heading,
        Bold, Italic, Underline, Strikethrough, RemoveFormat,
        Font, Alignment,
        List, Indent, IndentBlock,
        Link,
        Table, TableToolbar, TableProperties, TableCellProperties,
        Image, ImageToolbar, ImageStyle, ImageResize, ImageUpload,
        BlockQuote, HorizontalLine, Undo, PasteFromOffice,
      ],
      toolbar: [
        'undo', 'redo', '|',
        'heading', '|',
        'fontFamily', 'fontSize', '|',
        'bold', 'italic', 'underline', 'strikethrough', 'removeFormat', '|',
        'fontColor', 'fontBackgroundColor', '|',
        'alignment', '|',
        'bulletedList', 'numberedList', 'outdent', 'indent', '|',
        'insertTable', 'blockQuote', 'horizontalLine', '|',
        'link', 'uploadImage',
      ],
      heading: {
        options: [
          { model: 'paragraph', title: '正文', class: 'ck-heading_paragraph' },
          { model: 'heading1', view: 'h1', title: '标题 1', class: 'ck-heading_heading1' },
          { model: 'heading2', view: 'h2', title: '标题 2', class: 'ck-heading_heading2' },
          { model: 'heading3', view: 'h3', title: '标题 3', class: 'ck-heading_heading3' },
        ],
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
          'Times New Roman, Times, serif',
        ],
        supportAllValues: true,
      },
      fontSize: {
        options: [
          { title: '初号', model: '42px' },
          { title: '小初', model: '36px' },
          { title: '一号', model: '26px' },
          { title: '小一', model: '24px' },
          { title: '二号', model: '22px' },
          { title: '小二', model: '18px' },
          { title: '三号', model: '16px' },
          { title: '小三', model: '15px' },
          { title: '四号', model: '14px' },
          { title: '小四', model: '12px' },
          { title: '五号', model: '10.5px' },
          { title: '小五', model: '9px' },
        ],
        supportAllValues: true,
      },
      table: {
        contentToolbar: [
          'tableColumn', 'tableRow', 'mergeTableCells',
          'tableProperties', 'tableCellProperties',
        ],
      },
      image: {
        toolbar: [
          'imageStyle:inline', 'imageStyle:block', 'imageStyle:side',
          '|', 'resizeImage',
        ],
      },
    }).then((editor) => {
      if (!isMounted) {
        editor.destroy();
        return;
      }

      editorRef.current = editor;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => ({
        upload: async () => {
          const file = await loader.file;
          const url = await uploadRef.current(file);
          return { default: url };
        },
      });

      editor.model.document.on('change:data', () => {
        onChangeRef.current(editor.getData());
      });
    }).catch(() => {});

    return () => {
      isMounted = false;
      if (editorRef.current) {
        editorRef.current.destroy().catch(() => {});
        editorRef.current = null;
      }
    };
  // 只 mount 时执行一次，不依赖任何 props
   
  }, []);

  return (
    <div className="border rounded-xl overflow-hidden">
      <div ref={containerRef} />
    </div>
  );
}
