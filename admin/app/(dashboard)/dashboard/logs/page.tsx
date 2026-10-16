'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, Download, Filter, RefreshCw, RotateCcw, Search } from 'lucide-react';
import { api } from '@/lib/api';

interface OperationLog {
  id: number;
  actor_name?: string;
  actor_email?: string;
  actor_role?: string;
  action: string;
  module: string;
  target_type?: string;
  target_id?: string | null;
  target_label?: string;
  method?: string;
  path?: string;
  ip_address?: string;
  user_agent?: string;
  status_code?: number;
  result: 'success' | 'failed';
  details?: { fields?: string[]; queryKeys?: string[] } | null;
  createdAt: string;
}

interface LogResponse {
  data?: OperationLog[];
  meta?: { pagination?: { page?: number; pageSize?: number; pageCount?: number; total?: number } };
}

interface LogFilters {
  q: string;
  module: string;
  action: string;
  result: string;
  from: string;
  to: string;
}

const EMPTY_FILTERS: LogFilters = { q: '', module: '', action: '', result: '', from: '', to: '' };
const PAGE_SIZE = 20;

function queryFor(filters: LogFilters, page: number, pageSize = PAGE_SIZE) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  Object.entries(filters).forEach(([key, value]) => {
    if (!value.trim()) return;
    if (key === 'from' || key === 'to') {
      const [year, month, day] = value.split('-').map(Number);
      const date = new Date(year, month - 1, day, key === 'to' ? 23 : 0, key === 'to' ? 59 : 0, key === 'to' ? 59 : 0, key === 'to' ? 999 : 0);
      params.set(key, date.toISOString());
      return;
    }
    params.set(key, value.trim());
  });
  return `?${params.toString()}`;
}

function formatTime(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('zh-CN', { hour12: false });
}

function csvCell(value: unknown) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

export default function OperationLogsPage() {
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [detailLog, setDetailLog] = useState<OperationLog | null>(null);

  const loadLogs = useCallback(async (targetPage = page, targetFilters = filters) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.getOperationLogs(queryFor(targetFilters, targetPage)) as LogResponse;
      setLogs(response.data || []);
      setTotal(Number(response.meta?.pagination?.total || 0));
      setPageCount(Math.max(1, Number(response.meta?.pagination?.pageCount || 1)));
    } catch (loadError) {
      setLogs([]);
      setTotal(0);
      setPageCount(1);
      setError(loadError instanceof Error ? loadError.message : '操作日志加载失败');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { void loadLogs(page, filters); }, [loadLogs, page, filters]);

  const updateDraft = (key: keyof LogFilters, value: string) => setDraftFilters((current) => ({ ...current, [key]: value }));
  const applyFilters = () => { setPage(1); setFilters({ ...draftFilters }); };
  const resetFilters = () => { setDraftFilters(EMPTY_FILTERS); setPage(1); setFilters(EMPTY_FILTERS); };

  const exportLogs = async () => {
    setExporting(true);
    try {
      const first = await api.getOperationLogs(queryFor(filters, 1, 100)) as LogResponse;
      const all = [...(first.data || [])];
      const count = Number(first.meta?.pagination?.pageCount || 1);
      for (let current = 2; current <= count; current += 1) {
        const response = await api.getOperationLogs(queryFor(filters, current, 100)) as LogResponse;
        all.push(...(response.data || []));
      }
      const headers = ['时间', '用户', '邮箱', '角色', '模块', '操作', '对象', '结果', '状态码', '请求方式', 'IP地址', '接口路径'];
      const rows = all.map((log) => [
        formatTime(log.createdAt), log.actor_name, log.actor_email, log.actor_role, log.module,
        log.action, log.target_label, log.result === 'success' ? '成功' : '失败', log.status_code,
        log.method, log.ip_address, log.path,
      ]);
      const csv = '\uFEFF' + [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `operation-logs-${new Date().toISOString().slice(0, 10)}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (exportError) {
      alert(exportError instanceof Error ? exportError.message : '导出失败');
    } finally {
      setExporting(false);
    }
  };

  const rangeLabel = useMemo(() => total ? `${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, total)} / ${total} 条` : '0 条', [page, total]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-blue-50 p-3 text-blue-600"><Activity className="h-6 w-6" /></span>
          <div><h1 className="text-2xl font-bold text-gray-900">操作日志</h1><p className="mt-1 text-sm text-gray-500">记录后台用户的内容维护、审核、发布及系统管理操作</p></div>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => void loadLogs()} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><RefreshCw className="h-4 w-4" />刷新</button>
          <button type="button" disabled={exporting || total === 0} onClick={() => void exportLogs()} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"><Download className="h-4 w-4" />{exporting ? '导出中…' : '导出筛选结果'}</button>
        </div>
      </div>

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
          <label className="relative md:col-span-2"><span className="mb-1 block text-sm text-gray-600">关键字</span><Search className="absolute left-3 top-10 h-4 w-4 text-gray-400" /><input value={draftFilters.q} onChange={(event) => updateDraft('q', event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') applyFilters(); }} placeholder="用户、模块、对象、IP 或路径" className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm" /></label>
          <label><span className="mb-1 block text-sm text-gray-600">模块</span><select value={draftFilters.module} onChange={(event) => updateDraft('module', event.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm"><option value="">全部模块</option>{['文章', '文章审核', '分类管理', '页面管理', '导师管理', '学生资料', '政策文件', '科研机构', '成果转化', '用户管理', '角色管理', '权限管理', 'Banner 管理', '友情链接', '附件管理', '站点设置'].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span className="mb-1 block text-sm text-gray-600">操作</span><select value={draftFilters.action} onChange={(event) => updateDraft('action', event.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm"><option value="">全部操作</option>{['创建', '修改', '删除', '提交审核', '一级审核通过', '一级审核退回', '二级审核通过', '二级审核退回', '发布', '取消发布'].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span className="mb-1 block text-sm text-gray-600">结果</span><select value={draftFilters.result} onChange={(event) => updateDraft('result', event.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm"><option value="">全部结果</option><option value="success">成功</option><option value="failed">失败</option></select></label>
          <label><span className="mb-1 block text-sm text-gray-600">开始日期</span><input type="date" value={draftFilters.from} onChange={(event) => updateDraft('from', event.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" /></label>
          <label><span className="mb-1 block text-sm text-gray-600">结束日期</span><input type="date" value={draftFilters.to} onChange={(event) => updateDraft('to', event.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" /></label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={resetFilters} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><RotateCcw className="h-4 w-4" />重置</button>
          <button type="button" onClick={applyFilters} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"><Filter className="h-4 w-4" />筛选</button>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {error && <div className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700">日志加载失败：{error}</div>}
        <div className="flex items-center justify-between border-b px-5 py-3 text-sm text-gray-500"><span>操作记录</span><span>{rangeLabel}</span></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500"><tr><th className="px-4 py-3">时间</th><th className="px-4 py-3">操作人</th><th className="px-4 py-3">模块 / 操作</th><th className="px-4 py-3">操作对象</th><th className="px-4 py-3">结果</th><th className="px-4 py-3">请求信息</th><th className="px-4 py-3">详情</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">正在加载操作日志…</td></tr> : logs.length === 0 ? <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">暂无操作记录</td></tr> : logs.map((log) => <tr key={log.id} className="hover:bg-gray-50"><td className="whitespace-nowrap px-4 py-3 text-gray-600">{formatTime(log.createdAt)}</td><td className="px-4 py-3"><div className="font-medium text-gray-900">{log.actor_name || '未知用户'}</div><div className="text-xs text-gray-500">{log.actor_email || '—'} · {log.actor_role || '—'}</div></td><td className="px-4 py-3"><div className="text-gray-500">{log.module}</div><span className="font-medium text-gray-900">{log.action}</span></td><td className="max-w-xs truncate px-4 py-3 text-gray-700" title={log.target_label}>{log.target_label || log.target_type || '—'}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${log.result === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{log.result === 'success' ? '成功' : '失败'}{log.status_code ? ` · ${log.status_code}` : ''}</span></td><td className="px-4 py-3 text-xs text-gray-500"><div>{log.method || '—'} · {log.ip_address || 'IP 未记录'}</div><div className="max-w-[250px] truncate" title={log.path}>{log.path || '—'}</div></td><td className="px-4 py-3"><button type="button" onClick={() => setDetailLog(log)} className="text-blue-600 hover:text-blue-800">查看</button></td></tr>)}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3 text-sm text-gray-600"><span>{rangeLabel}</span><div className="flex items-center gap-2"><button type="button" disabled={page <= 1 || loading} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-lg border px-3 py-1.5 disabled:cursor-not-allowed disabled:text-gray-300">上一页</button><span>第 {page} / {pageCount} 页</span><button type="button" disabled={page >= pageCount || loading} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} className="rounded-lg border px-3 py-1.5 disabled:cursor-not-allowed disabled:text-gray-300">下一页</button></div></div>
      </section>

      {detailLog && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDetailLog(null)}><div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold">操作记录详情</h2><button type="button" onClick={() => setDetailLog(null)} className="rounded border px-3 py-1 text-sm">关闭</button></div><dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2"><Detail label="时间" value={formatTime(detailLog.createdAt)} /><Detail label="操作人" value={`${detailLog.actor_name || '未知'}（${detailLog.actor_email || '—'}）`} /><Detail label="角色" value={detailLog.actor_role || '—'} /><Detail label="操作" value={`${detailLog.module} · ${detailLog.action}`} /><Detail label="对象" value={detailLog.target_label || '—'} /><Detail label="结果" value={`${detailLog.result === 'success' ? '成功' : '失败'} · ${detailLog.status_code || '—'}`} /><Detail label="请求" value={`${detailLog.method || '—'} ${detailLog.path || ''}`} /><Detail label="IP 地址" value={detailLog.ip_address || '—'} /><Detail label="涉及字段" value={detailLog.details?.fields?.join('、') || '—'} /><Detail label="浏览器" value={detailLog.user_agent || '—'} /></dl></div></div>}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0"><dt className="text-xs text-gray-500">{label}</dt><dd className="mt-1 break-words text-gray-900">{value}</dd></div>;
}
