'use client';

import { useEffect, useRef, useState } from 'react';
import type { Jodit as JoditEditor } from 'jodit';
import type { Table } from 'jodit/esm/modules/table/table';
import './WordLikeEditor.css';

interface Props {
  value: string;
  onChange: (html: string) => void;
  uploadImage: (file: File) => Promise<string>;
}

type TableAction = 'rowBefore' | 'rowAfter' | 'columnBefore' | 'columnAfter' | 'deleteRow' | 'deleteColumn';
type ParagraphAlignment = 'left' | 'center' | 'right' | 'justify';
type TableAlignment = 'left' | 'center' | 'right';

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<JoditEditor | null>(null);
  const onChangeRef = useRef(onChange);
  const uploadRef = useRef(uploadImage);
  const initialValueRef = useRef(value);
  const lastValueRef = useRef(value);
  const activeCellRef = useRef<HTMLTableCellElement | null>(null);
  const [error, setError] = useState('');
  const [tableCell, setTableCell] = useState<{ row: number; column: number; rows: number; columns: number } | null>(null);
  const [columnWidth, setColumnWidth] = useState('');
  const [rowHeight, setRowHeight] = useState('');

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

  return (
    <div className="word-like-editor" data-editor-build="table-tools-20261018">
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
