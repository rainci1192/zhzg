'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { Jodit as JoditEditor } from 'jodit';
import type { Table } from 'jodit/esm/modules/table/table';
import './WordLikeEditor.css';

interface Props {
  value: string;
  onChange: (html: string) => void;
  uploadImage: (file: File) => Promise<string | { url: string; id?: number }>;
}

type TableAction = 'rowBefore' | 'rowAfter' | 'columnBefore' | 'columnAfter' | 'deleteRow' | 'deleteColumn';
type ParagraphAlignment = 'left' | 'center' | 'right' | 'justify';
type TableAlignment = 'left' | 'center' | 'right';
type ImageAlignment = 'left' | 'center' | 'right';
type ImageToolsState = { left: number; top: number; width: number; height: number; alignment: ImageAlignment };
type ImageResizeDirection = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
const IMAGE_RESIZE_HANDLES: readonly { direction: ImageResizeDirection; label: string; x: number; y: number }[] = [
  { direction: 'nw', label: '左上角', x: 0, y: 0 },
  { direction: 'n', label: '上边中点', x: 0.5, y: 0 },
  { direction: 'ne', label: '右上角', x: 1, y: 0 },
  { direction: 'e', label: '右边中点', x: 1, y: 0.5 },
  { direction: 'se', label: '右下角', x: 1, y: 1 },
  { direction: 's', label: '下边中点', x: 0.5, y: 1 },
  { direction: 'sw', label: '左下角', x: 0, y: 1 },
  { direction: 'w', label: '左边中点', x: 0, y: 0.5 },
];

const MIN_COLUMN_WIDTH = 36;
const MAX_COLUMN_WIDTH = 1200;

/** Freeze the rendered widths before changing one column. Word tables often mix
 * percentage cell widths, colgroups and an overall width; leaving any of those
 * constraints in place makes the browser take space from adjacent columns. */
function measureColumnWidths(table: HTMLTableElement, tableModule: Table): number[] {
  const matrix = tableModule.formalMatrix(table);
  return Array.from({ length: tableModule.getColumnsCount(table) }, (_, column) => {
    const cells = matrix.map((row) => row[column]).filter((cell): cell is HTMLTableCellElement => !!cell);
    const single = cells.find((cell) => cell.colSpan === 1);
    const cell = single || cells[0];
    const measured = cell ? cell.getBoundingClientRect().width / (single ? 1 : cell.colSpan) : MIN_COLUMN_WIDTH;
    return Math.max(MIN_COLUMN_WIDTH, Math.round(measured || MIN_COLUMN_WIDTH));
  });
}

function setIndependentColumnWidths(table: HTMLTableElement, widths: number[]) {
  const groups = [...table.children].filter((child): child is HTMLTableColElement => child.tagName === 'COLGROUP');
  const originalCols = groups.flatMap((item) => [...item.children]
    .filter((child): child is HTMLTableColElement => child.tagName === 'COL')
    .flatMap((col) => Array.from({ length: Math.max(1, col.span) }, () => col.cloneNode(false) as HTMLTableColElement)));
  const group = groups[0] || table.ownerDocument.createElement('colgroup');
  if (!groups.length) {
    const firstSection = [...table.children].find((child) => child.tagName !== 'CAPTION');
    table.insertBefore(group, firstSection || null);
  }
  groups.slice(1).forEach((extra) => extra.remove());
  group.removeAttribute('span');
  group.removeAttribute('width');
  group.style.width = '';
  // Rebuild spanning/percentage <col> elements into one fixed-width <col> per logical column.
  group.replaceChildren(...widths.map((width, index) => {
    const col = originalCols[index] || table.ownerDocument.createElement('col');
    col.removeAttribute('span');
    col.removeAttribute('width');
    col.style.width = `${width}px`;
    return col;
  }));
  table.querySelectorAll<HTMLTableCellElement>('td, th').forEach((cell) => {
    if (cell.closest('table') !== table) return;
    cell.removeAttribute('width');
    cell.style.width = '';
  });
  table.removeAttribute('width');
  table.style.tableLayout = 'fixed';
  table.style.maxWidth = 'none';
  table.style.width = `${widths.reduce((total, width) => total + width, 0)}px`;
}

/** Jodit accesses the DOM at import time, so load it only in the browser. */
export default function WordLikeEditor({ value, onChange, uploadImage }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<JoditEditor | null>(null);
  const onChangeRef = useRef(onChange);
  const uploadRef = useRef(uploadImage);
  const initialValueRef = useRef(value);
  const lastValueRef = useRef(value);
  const activeCellRef = useRef<HTMLTableCellElement | null>(null);
  const activeImageRef = useRef<HTMLImageElement | null>(null);
  const [error, setError] = useState('');
  const [tableCell, setTableCell] = useState<{ row: number; column: number; rows: number; columns: number } | null>(null);
  const [columnWidth, setColumnWidth] = useState('');
  const [rowHeight, setRowHeight] = useState('');
  const [imageTools, setImageTools] = useState<ImageToolsState | null>(null);

  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
  useEffect(() => { uploadRef.current = uploadImage; }, [uploadImage]);

  // The image toolbar is inserted above the editable area after selecting an
  // image, so remeasure its overlay after that layout change.
  useEffect(() => {
    if (!imageTools) return;
    const frame = window.requestAnimationFrame(() => {
      const image = activeImageRef.current;
      const root = rootRef.current;
      if (!image?.isConnected || !root) return;
      const imageRect = image.getBoundingClientRect();
      const rootRect = root.getBoundingClientRect();
      const left = imageRect.left - rootRect.left;
      const top = imageRect.top - rootRect.top;
      setImageTools((current) => !current || (Math.abs(current.left - left) < 1 && Math.abs(current.top - top) < 1)
        ? current
        : { ...current, left, top });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [imageTools]);

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
        toolbarInline: true,
        tableAllowCellSelection: true,
        // Jodit's built-in resize takes the delta from the next column.
        // The editor below resizes the whole table instead.
        tableAllowCellResize: false,
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
          copyformat: { icon: 'copyformat', tooltip: '格式刷' },
        },
        buttons: [
          'undo', 'redo', '|', 'paragraph', 'font', 'fontsize', '|',
          'bold', 'italic', 'underline', 'strikethrough', 'eraser', '|',
          'brush', 'copyformat', '|', 'ul', 'ol', 'outdent', 'indent',
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
            const uploadedImage = await uploadRef.current(file);
            const url = typeof uploadedImage === 'string' ? uploadedImage : uploadedImage.url;
            if (!url) throw new Error('图片上传成功，但没有获得图片地址。');
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

      const cellFromNode = (node: Node | null) => {
        const element = node instanceof Element ? node : node?.parentElement;
        const cell = element?.closest('td, th') as HTMLTableCellElement | null;
        return cell && editor.editor.contains(cell) ? cell : null;
      };
      const selectionCell = () => {
        const selection = editor.ed.getSelection();
        const cell = cellFromNode(selection?.focusNode || null) || cellFromNode(selection?.anchorNode || null);
        if (cell) return cell;
        if (!selection?.rangeCount) return null;
        const range = selection.getRangeAt(0);
        if (!editor.editor.contains(range.commonAncestorContainer)) return null;
        return [...editor.editor.querySelectorAll<HTMLTableCellElement>('td, th')]
          .find((candidate) => range.intersectsNode(candidate)) || null;
      };
      const trackCell = (event: Event) => {
        showTableCell(editor, cellFromNode(event.target as Node) || selectionCell());
      };
      const imageFromNode = (node: Node | null) => {
        const element = node instanceof Element ? node : node?.parentElement;
        const image = element?.closest('img') as HTMLImageElement | null;
        return image && editor.editor.contains(image) ? image : null;
      };
      const refreshImageTools = (image: HTMLImageElement) => {
        const root = rootRef.current;
        if (!root || !image.isConnected) return;
        const imageRect = image.getBoundingClientRect();
        const rootRect = root.getBoundingClientRect();
        const alignment = image.dataset.align === 'center' || image.dataset.align === 'right'
          ? image.dataset.align
          : image.dataset.align === 'left' ? 'left'
            : image.style.marginLeft === 'auto' && image.style.marginRight === 'auto'
              ? 'center'
              : image.style.marginLeft === 'auto' ? 'right' : 'center';
        setImageTools({
          left: imageRect.left - rootRect.left,
          top: imageRect.top - rootRect.top,
          width: imageRect.width,
          height: imageRect.height,
          alignment,
        });
      };
      const trackImage = (event: Event) => {
        const image = imageFromNode(event.target as Node);
        if (image) {
          showTableCell(editor, null);
          activeImageRef.current = image;
          refreshImageTools(image);
        } else if (event.type === 'click') {
          activeImageRef.current = null;
          setImageTools(null);
        }
      };
      const refreshSelectedImage = () => {
        if (activeImageRef.current) refreshImageTools(activeImageRef.current);
      };
      const trackSelection = () => {
        const selection = editor.ed.getSelection();
        if (!selection || (!editor.editor.contains(selection.anchorNode) && !editor.editor.contains(selection.focusNode))) return;
        showTableCell(editor, selectionCell());
      };
      let drag: { table: HTMLTableElement; cell: HTMLTableCellElement; column: number; widths: number[]; startX: number } | null = null;
      const resizeTarget = (event: PointerEvent) => {
        const cell = cellFromNode(event.target as Node);
        if (!cell) return null;
        const bounds = cell.getBoundingClientRect();
        if (Math.abs(event.clientX - bounds.right) > 8 || event.clientY < bounds.top || event.clientY > bounds.bottom) return null;
        const table = cell.closest('table') as HTMLTableElement | null;
        if (!table) return null;
        const tableModule = editor.getInstance<Table>('Table', editor.o);
        // The right edge of a merged cell belongs to its last logical column.
        const column = tableModule.formalCoordinate(table, cell, true)[1];
        return column >= 0 ? { table, cell, column, tableModule } : null;
      };
      const hoverResize = (event: PointerEvent) => {
        if (drag || (event.pointerType !== 'mouse' && event.pointerType !== 'pen')) return;
        editor.editor.style.cursor = resizeTarget(event) ? 'col-resize' : '';
      };
      const moveResize = (event: PointerEvent) => {
        if (!drag) return;
        const width = Math.max(MIN_COLUMN_WIDTH, Math.min(MAX_COLUMN_WIDTH,
          drag.widths[drag.column] + Math.round(event.clientX - drag.startX)));
        const next = [...drag.widths];
        next[drag.column] = width;
        setIndependentColumnWidths(drag.table, next);
        event.preventDefault();
      };
      const moveResizeListener = (event: Event) => moveResize(event as PointerEvent);
      const endResize = () => {
        if (!drag) return;
        const { cell } = drag;
        drag = null;
        editor.editor.style.cursor = '';
        editor.synchronizeValues();
        showTableCell(editor, cell);
      };
      const beginResize = (event: PointerEvent) => {
        if (event.button !== 0 || (event.pointerType !== 'mouse' && event.pointerType !== 'pen')) return;
        const target = resizeTarget(event);
        if (!target) return;
        const { table, cell, column, tableModule } = target;
        drag = { table, cell, column, widths: measureColumnWidths(table, tableModule), startX: event.clientX };
        event.preventDefault();
        event.stopPropagation();
        editor.editor.style.cursor = 'col-resize';
      };
      const beginResizeListener = (event: Event) => beginResize(event as PointerEvent);
      const hoverResizeListener = (event: Event) => hoverResize(event as PointerEvent);
      editor.editor.addEventListener('pointerdown', trackCell, true);
      editor.editor.addEventListener('pointerdown', beginResizeListener, true);
      editor.editor.addEventListener('pointermove', hoverResizeListener);
      editor.ed.defaultView?.addEventListener('pointermove', moveResizeListener);
      editor.ed.defaultView?.addEventListener('pointerup', endResize);
      editor.ed.defaultView?.addEventListener('pointercancel', endResize);
      editor.editor.addEventListener('mouseup', trackCell);
      editor.editor.addEventListener('keyup', trackCell);
      editor.editor.addEventListener('click', trackCell);
      editor.editor.addEventListener('click', trackImage);
      editor.editor.addEventListener('scroll', refreshSelectedImage);
      window.addEventListener('resize', refreshSelectedImage);
      window.addEventListener('scroll', refreshSelectedImage, true);
      editor.ed.addEventListener('selectionchange', trackSelection);
      editor.events.on('beforeDestruct', () => {
        editor.editor.removeEventListener('pointerdown', trackCell, true);
        editor.editor.removeEventListener('pointerdown', beginResizeListener, true);
        editor.editor.removeEventListener('pointermove', hoverResizeListener);
        editor.ed.defaultView?.removeEventListener('pointermove', moveResizeListener);
        editor.ed.defaultView?.removeEventListener('pointerup', endResize);
        editor.ed.defaultView?.removeEventListener('pointercancel', endResize);
        editor.editor.removeEventListener('mouseup', trackCell);
        editor.editor.removeEventListener('keyup', trackCell);
        editor.editor.removeEventListener('click', trackCell);
        editor.editor.removeEventListener('click', trackImage);
        editor.editor.removeEventListener('scroll', refreshSelectedImage);
        window.removeEventListener('resize', refreshSelectedImage);
        window.removeEventListener('scroll', refreshSelectedImage, true);
        editor.ed.removeEventListener('selectionchange', trackSelection);
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
      activeCellRef.current = null;
      activeImageRef.current = null;
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

  function getTableContext() {
    const editor = editorRef.current;
    const cell = activeCellRef.current;
    const table = cell?.closest('table') as HTMLTableElement | null;
    if (!editor || !cell || !table || !editor.editor.contains(table)) return null;
    const tableModule = editor.getInstance<Table>('Table', editor.o);
    const [row, column] = tableModule.formalCoordinate(table, cell);
    return { editor, tableModule, table, cell, row, column };
  }

  function showTableCell(editor: JoditEditor, cell: HTMLTableCellElement | null) {
    const table = cell?.closest('table') as HTMLTableElement | null;
    if (!cell || !table || !editor.editor.contains(table)) {
      activeCellRef.current = null;
      setTableCell(null);
      return;
    }
    activeCellRef.current = cell;
    const tableModule = editor.getInstance<Table>('Table', editor.o);
    const [row, column] = tableModule.formalCoordinate(table, cell);
    const next = { row: row + 1, column: column + 1, rows: tableModule.getRowsCount(table), columns: tableModule.getColumnsCount(table) };
    setTableCell((previous) => previous && Object.keys(next).every((key) =>
      previous[key as keyof typeof next] === next[key as keyof typeof next]) ? previous : next);
    setColumnWidth(String(measureColumnWidths(table, tableModule)[column]));
    setRowHeight(String(Math.round(cell.parentElement?.getBoundingClientRect().height || cell.getBoundingClientRect().height)));
  }

  function runTableAction(action: TableAction) {
    const context = getTableContext();
    if (!context) return;
    const { editor, tableModule, table, cell, row, column } = context;
    if (action === 'rowBefore' || action === 'rowAfter') {
      tableModule.appendRow(table, cell.parentElement as HTMLTableRowElement, action === 'rowAfter');
    } else if (action === 'columnBefore' || action === 'columnAfter') {
      tableModule.appendColumn(table, cell, action === 'columnAfter');
    } else if (action === 'deleteRow' && tableModule.getRowsCount(table) > 1) {
      tableModule.removeRow(table, row);
    } else if (action === 'deleteColumn' && tableModule.getColumnsCount(table) > 1) {
      tableModule.removeColumn(table, column);
    } else {
      return;
    }
    // A deleted cell has no cursor; keep the tool focused on the nearest survivor.
    const matrix = tableModule.formalMatrix(table);
    const next = cell.isConnected ? cell : matrix[Math.min(row, matrix.length - 1)]?.[Math.min(column, (matrix[0]?.length || 1) - 1)];
    editor.synchronizeValues();
    showTableCell(editor, next || null);
    if (next) editor.s.setCursorIn(next);
  }

  function applyColumnWidth() {
    const context = getTableContext();
    const width = Number(columnWidth);
    if (!context || !Number.isInteger(width) || width < 36 || width > 1200) return;
    const { editor, tableModule, table, column, cell } = context;
    const widths = measureColumnWidths(table, tableModule);
    widths[column] = width;
    setIndependentColumnWidths(table, widths);
    editor.synchronizeValues();
    showTableCell(editor, cell);
  }

  function applyRowHeight() {
    const context = getTableContext();
    const height = Number(rowHeight);
    if (!context || !Number.isInteger(height) || height < 24 || height > 1000) return;
    const { editor, cell } = context;
    const row = cell.parentElement as HTMLTableRowElement;
    row.style.height = `${height}px`;
    for (const item of row.cells) item.style.height = `${height}px`;
    editor.synchronizeValues();
    showTableCell(editor, cell);
  }

  function alignParagraph(alignment: ParagraphAlignment) {
    const editor = editorRef.current;
    if (!editor) return;
    const command = {
      left: 'justifyLeft',
      center: 'justifyCenter',
      right: 'justifyRight',
      justify: 'justifyFull',
    }[alignment];
    editor.execCommand(command);
    editor.synchronizeValues();
  }

  function alignTable(alignment: TableAlignment) {
    const context = getTableContext();
    if (!context) return;
    const { editor, table, cell } = context;
    // Set explicit inline layout on the table itself; this does not alter the
    // alignment of text inside its cells or redistribute the column widths.
    table.style.marginLeft = alignment === 'left' ? '0' : 'auto';
    table.style.marginRight = alignment === 'right' ? '0' : 'auto';
    table.setAttribute('align', alignment);
    editor.synchronizeValues();
    showTableCell(editor, cell);
  }

  function setImageAlignment(alignment: ImageAlignment) {
    const editor = editorRef.current;
    const image = activeImageRef.current;
    if (!editor || !image?.isConnected) return;
    image.style.display = 'block';
    image.style.float = 'none';
    image.style.marginLeft = alignment === 'left' ? '0' : 'auto';
    image.style.marginRight = alignment === 'right' ? '0' : 'auto';
    image.dataset.align = alignment;
    editor.synchronizeValues();
    window.requestAnimationFrame(() => {
      if (activeImageRef.current === image) {
        const rect = image.getBoundingClientRect();
        const root = rootRef.current?.getBoundingClientRect();
        if (root) setImageTools({ left: rect.left - root.left, top: rect.top - root.top, width: rect.width, height: rect.height, alignment });
      }
    });
  }

  function applyImageSize(widthValue: string, heightValue: string) {
    const editor = editorRef.current;
    const image = activeImageRef.current;
    const width = Math.round(Number(widthValue));
    const height = Math.round(Number(heightValue));
    if (!editor || !image?.isConnected || !Number.isFinite(width) || !Number.isFinite(height) || width < 24 || height < 24 || width > 2400 || height > 2400) return;
    image.style.width = `${width}px`;
    image.style.height = `${height}px`;
    image.style.maxWidth = 'none';
    image.setAttribute('width', String(width));
    image.setAttribute('height', String(height));
    editor.synchronizeValues();
    const rect = image.getBoundingClientRect();
    const root = rootRef.current?.getBoundingClientRect();
    if (root) setImageTools((current) => current ? { ...current, left: rect.left - root.left, top: rect.top - root.top, width: rect.width, height: rect.height } : current);
  }

  function beginImageResize(event: ReactPointerEvent<HTMLButtonElement>, direction: ImageResizeDirection) {
    const editor = editorRef.current;
    const image = activeImageRef.current;
    if (!editor || !image?.isConnected || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startY = event.clientY;
    const pointerId = event.pointerId;
    const startWidth = image.getBoundingClientRect().width;
    const startHeight = image.getBoundingClientRect().height;
    const move = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) return;
      const widthDelta = direction.includes('e') ? moveEvent.clientX - startX : direction.includes('w') ? startX - moveEvent.clientX : 0;
      const heightDelta = direction.includes('s') ? moveEvent.clientY - startY : direction.includes('n') ? startY - moveEvent.clientY : 0;
      const width = Math.max(24, Math.min(2400, Math.round(startWidth + widthDelta)));
      const height = Math.max(24, Math.min(2400, Math.round(startHeight + heightDelta)));
      image.style.width = `${width}px`;
      image.style.height = `${height}px`;
      image.style.maxWidth = 'none';
      image.setAttribute('width', String(width));
      image.setAttribute('height', String(height));
      const imageRect = image.getBoundingClientRect();
      const rootRect = rootRef.current?.getBoundingClientRect();
      if (rootRect) setImageTools((current) => current ? { ...current, left: imageRect.left - rootRect.left, top: imageRect.top - rootRect.top, width: imageRect.width, height: imageRect.height } : current);
      moveEvent.preventDefault();
    };
    const finish = (finishEvent: PointerEvent) => {
      if (finishEvent.pointerId !== pointerId) return;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', finish);
      window.removeEventListener('pointercancel', finish);
      editor.synchronizeValues();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', finish);
  }

  return (
    <div ref={rootRef} className="word-like-editor" data-editor-build="image-eight-handles-20261019">
      {imageTools && activeImageRef.current && <>
        <div className="word-like-editor__image-selection" aria-hidden="true" style={{ left: imageTools.left, top: imageTools.top, width: imageTools.width, height: imageTools.height }} />
        {IMAGE_RESIZE_HANDLES.map(({ direction, label, x, y }) => (
          <button key={direction} type="button" className={`word-like-editor__image-resize-handle word-like-editor__image-resize-handle--${direction}`}
            style={{ left: imageTools.left + imageTools.width * x - 7, top: imageTools.top + imageTools.height * y - 7 }}
            onPointerDown={(event) => beginImageResize(event, direction)} title={`拖动${label}调整图片大小`} aria-label={`拖动${label}调整图片大小`} />
        ))}
      </>}
      {imageTools && <div className="word-like-editor__image-tools" role="toolbar" aria-label="图片编辑工具">
        <strong>图片工具</strong>
        <span>{Math.round(imageTools.width)} × {Math.round(imageTools.height)} px</span>
        <div className="word-like-editor__tool-group" role="group" aria-label="图片对齐">
          {([['left', '左对齐'], ['center', '居中'], ['right', '右对齐']] as const).map(([alignment, label]) => (
            <button key={`image-${alignment}`} type="button" aria-pressed={imageTools.alignment === alignment}
              onMouseDown={(event) => event.preventDefault()} onClick={() => setImageAlignment(alignment)}>{label}</button>
          ))}
        </div>
        <label>宽 <input type="number" min="24" max="2400" value={Math.round(imageTools.width)} aria-label="图片宽度（像素）"
          onChange={(event) => setImageTools((current) => current ? { ...current, width: Number(event.target.value) || 0 } : current)} /></label>
        <label>高 <input type="number" min="24" max="2400" value={Math.round(imageTools.height)} aria-label="图片高度（像素）"
          onChange={(event) => setImageTools((current) => current ? { ...current, height: Number(event.target.value) || 0 } : current)} /></label>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyImageSize(String(imageTools.width), String(imageTools.height))}>应用尺寸</button>
      </div>}
      <div className="word-like-editor__table-tools" role="toolbar" aria-label="表格编辑工具">
        <div className="word-like-editor__tool-group" role="group" aria-label="段落对齐">
          <strong>段落对齐</strong>
          {([['left', '左对齐'], ['center', '居中'], ['right', '右对齐'], ['justify', '两端对齐']] as const).map(([alignment, label]) => (
            <button key={`paragraph-${alignment}`} type="button" onMouseDown={(event) => event.preventDefault()}
              onClick={() => alignParagraph(alignment)} title={`段落${label}`}>{label}</button>
          ))}
        </div>
        <div className="word-like-editor__tool-group" role="group" aria-label="表格位置">
          <strong>表格位置</strong>
          {([['left', '左对齐'], ['center', '居中'], ['right', '右对齐']] as const).map(([alignment, label]) => (
            <button key={`table-${alignment}`} type="button" onMouseDown={(event) => event.preventDefault()}
              onClick={() => alignTable(alignment)} disabled={!tableCell} title={`表格整体${label}`}>{label}</button>
          ))}
        </div>
        <strong>表格工具</strong>
        <span className="word-like-editor__table-position">
          {tableCell ? `第 ${tableCell.row} 行 · 第 ${tableCell.column} 列` : '点击表格单元格后可操作'}
        </span>
        {([
          ['rowBefore', '上方插入行'], ['rowAfter', '下方插入行'],
          ['columnBefore', '左侧插入列'], ['columnAfter', '右侧插入列'],
          ['deleteRow', '删除当前行'], ['deleteColumn', '删除当前列'],
        ] as const).map(([action, label]) => (
          <button key={action} type="button" onMouseDown={(event) => event.preventDefault()}
            onClick={() => runTableAction(action)}
            disabled={!tableCell || (action === 'deleteRow' && tableCell.rows <= 1) || (action === 'deleteColumn' && tableCell.columns <= 1)}>
            {label}
          </button>
        ))}
        <label>列宽 <input type="number" min="36" max="1200" value={columnWidth} disabled={!tableCell}
          onChange={(event) => setColumnWidth(event.target.value)} aria-label="当前列宽（像素）" /> px</label>
        <button type="button" onClick={applyColumnWidth} disabled={!tableCell}>应用列宽</button>
        <label>行高 <input type="number" min="24" max="1000" value={rowHeight} disabled={!tableCell}
          onChange={(event) => setRowHeight(event.target.value)} aria-label="当前行高（像素）" /> px</label>
        <button type="button" onClick={applyRowHeight} disabled={!tableCell}>应用行高</button>
      </div>
      <textarea ref={textareaRef} defaultValue={initialValueRef.current} aria-label="文章正文（富文本编辑器）" />
      {error && <p role="alert" className="word-like-editor__error">{error}</p>}
      <p className="word-like-editor__hint">点击表格单元格即可使用上方的表格工具；单元格边界可拖动调整列宽，选中多个单元格可使用浮动菜单合并或拆分。</p>
    </div>
  );
}
