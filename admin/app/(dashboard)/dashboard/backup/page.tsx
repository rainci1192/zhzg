'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CalendarClock, CheckCircle2, Database, Download, HardDrive, LoaderCircle, Play, RefreshCw, RotateCcw, Save, Trash2 } from 'lucide-react';
import { strapiFetch } from '@/lib/strapi-fetch';
import { useAuth } from '@/contexts/AuthContext';
import { fetchRoles, getModuleActions } from '@/lib/permissions';

const API = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

type Settings = {
  enabled: boolean;
  frequency: 'daily' | 'weekly';
  time: string;
  weekday: number;
  retentionCount: number;
  includeMedia: boolean;
};

type Backup = {
  id: string;
  mode: 'manual' | 'scheduled' | 'pre_restore';
  status: 'running' | 'success' | 'failed';
  databaseClient: string;
  databaseName: string;
  startedAt: string;
  completedAt?: string | null;
  sizeBytes?: number;
  sha256?: string | null;
  mediaIncluded?: boolean;
  mediaProvider?: string;
  mediaFiles?: number;
  mediaNote?: string | null;
  error?: string | null;
  restoreSupported?: boolean;
  createdBy?: { name?: string; email?: string };
};

type Overview = {
  settings: Settings;
  records: Backup[];
  database: { client: string; name: string; restoreSupported: boolean };
  storage: string;
  serverTimezone: string;
  nextRunHint: string | null;
  lastSuccessAt: string | null;
  running: boolean;
};

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const DEFAULT_SETTINGS: Settings = { enabled: false, frequency: 'daily', time: '02:00', weekday: 1, retentionCount: 14, includeMedia: true };

function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('zh-CN', { hour12: false });
}

function formatBytes(value = 0) {
  if (value < 1024) return `${value} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let amount = value / 1024;
  let unit = units[0];
  for (let index = 1; amount >= 1024 && index < units.length; index += 1) {
    amount /= 1024;
    unit = units[index];
  }
  return `${amount.toFixed(1)} ${unit}`;
}

export default function BackupManagementPage() {
  const { user } = useAuth();
  const isSuper = ['super_admin', 'superadmin', 'super-administrator'].includes(String(user?.role || '').toLowerCase());
  const [actions, setActions] = useState<string[]>([]);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const can = useCallback((action: string) => isSuper || actions.includes(action) || (action === 'edit' && actions.includes('update')), [actions, isSuper]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [response, granted, roles] = await Promise.all([
        strapiFetch(`${API}/api/backup-management`),
        user?.roleId ? getModuleActions(user.roleId, 'backup') : Promise.resolve([]),
        fetchRoles(),
      ]);
      if (!response.ok) throw new Error(await responseMessage(response));
      const result = await response.json() as { data: Overview };
      setOverview(result.data);
      setSettings(result.data.settings || DEFAULT_SETTINGS);
      const role = roles.find((item) => item.id === user?.roleId);
      const legacyBackup = role?.permissions?.includes('manage_backup');
      setActions(legacyBackup ? [...new Set([...granted, 'view', 'create', 'edit', 'delete'])] : granted);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '读取备份管理信息失败。');
    } finally {
      setLoading(false);
    }
  }, [user?.roleId]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!overview?.running) return;
    const timer = window.setInterval(async () => {
      try {
        const response = await strapiFetch(`${API}/api/backup-management`);
        if (!response.ok) return;
        const result = await response.json() as { data: Overview };
        setOverview(result.data);
        if (!result.data.running) {
          const completed = result.data.records[0];
          if (completed?.status === 'success') setSuccess(`备份完成：${completed.id}`);
          else if (completed?.status === 'failed') setError(completed.error || '备份失败，请查看备份记录。');
        }
      } catch { /* refresh on the next poll */ }
    }, 4000);
    return () => window.clearInterval(timer);
  }, [overview?.running]);

  async function responseMessage(response: Response) {
    const data = await response.json().catch(() => ({})) as { error?: { message?: string }; message?: string };
    return data.error?.message || data.message || `请求失败：${response.status}`;
  }

  async function saveSettings() {
    setBusy('settings');
    setError('');
    setSuccess('');
    try {
      const response = await strapiFetch(`${API}/api/backup-management/settings`, { method: 'PUT', body: JSON.stringify(settings) });
      if (!response.ok) throw new Error(await responseMessage(response));
      setSuccess('定时计划和保留策略已保存。');
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '保存失败。');
    } finally { setBusy(''); }
  }

  async function runBackup() {
    setBusy('run');
    setError('');
    setSuccess('');
    try {
      const response = await strapiFetch(`${API}/api/backup-management/run`, { method: 'POST', body: JSON.stringify({}) });
      if (!response.ok) throw new Error(await responseMessage(response));
      setSuccess('手动备份已在后台启动，页面会自动更新进度。');
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '备份失败。');
      await load();
    } finally { setBusy(''); }
  }

  async function downloadBackup(item: Backup) {
    setBusy(`download:${item.id}`);
    setError('');
    try {
      const response = await strapiFetch(`${API}/api/backup-management/${encodeURIComponent(item.id)}/download`);
      if (!response.ok) throw new Error(await responseMessage(response));
      const objectUrl = URL.createObjectURL(await response.blob());
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = `${item.id}.tar.gz`;
      anchor.click();
      URL.revokeObjectURL(objectUrl);
    } catch (cause) { setError(cause instanceof Error ? cause.message : '下载失败。'); }
    finally { setBusy(''); }
  }

  async function removeBackup(item: Backup) {
    if (!window.confirm(`确定删除备份“${item.id}”吗？此操作不可撤销。`)) return;
    setBusy(`delete:${item.id}`);
    setError('');
    try {
      const response = await strapiFetch(`${API}/api/backup-management/${encodeURIComponent(item.id)}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(await responseMessage(response));
      setSuccess('备份已删除。');
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : '删除失败。'); }
    finally { setBusy(''); }
  }

  async function restoreBackup(item: Backup) {
    const confirmation = window.prompt(`恢复会覆盖当前数据库${item.mediaIncluded ? '及本地媒体文件' : ''}。系统会先创建一个恢复前安全备份。\n\n如确认，请完整输入：RESTORE ${item.id}`);
    if (confirmation !== `RESTORE ${item.id}`) return;
    setBusy(`restore:${item.id}`);
    setError('');
    setSuccess('');
    try {
      const response = await strapiFetch(`${API}/api/backup-management/${encodeURIComponent(item.id)}/restore`, {
        method: 'POST', body: JSON.stringify({ confirmation }),
      });
      if (!response.ok) throw new Error(await responseMessage(response));
      const result = await response.json() as { data?: { safetyBackupId?: string } };
      setSuccess(`恢复完成。恢复前安全备份：${result.data?.safetyBackupId || '已创建'}`);
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : '恢复失败。'); }
    finally { setBusy(''); }
  }

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => setSettings((current) => ({ ...current, [key]: value }));

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">备份管理</h1>
          <p className="mt-1 text-sm text-slate-500">创建可校验的数据库与媒体文件备份，并管理定时计划、下载和恢复。</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => void load()} disabled={loading || !!busy} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />刷新
          </button>
          <button onClick={() => void runBackup()} disabled={!can('create') || !!busy || overview?.running} title={!can('create') ? '当前角色没有创建备份权限' : ''} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300">
            {busy === 'run' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}立即备份
          </button>
        </div>
      </header>

      {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
      {success && <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{success}</div>}

      {loading && !overview ? <div className="flex h-48 items-center justify-center text-slate-500"><LoaderCircle className="mr-2 h-5 w-5 animate-spin" />正在加载备份管理...</div> : overview && <>
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Summary icon={Database} title="数据库" value={`${overview.database.client} · ${overview.database.name}`} />
          <Summary icon={HardDrive} title="最近成功备份" value={formatDate(overview.lastSuccessAt)} />
          <Summary icon={CalendarClock} title="定时计划" value={overview.nextRunHint || '未启用'} />
          <Summary icon={CheckCircle2} title="备份记录" value={`${overview.records.length} 条`} />
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2 text-blue-700"><CalendarClock className="h-5 w-5" /></div>
            <div><h2 className="font-semibold text-slate-900">定时策略与保留规则</h2><p className="text-xs text-slate-500">计划按服务器本地时间执行：{overview.serverTimezone}</p></div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <label className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-3 text-sm text-slate-700">
              <input type="checkbox" checked={settings.enabled} disabled={!can('edit')} onChange={(event) => updateSetting('enabled', event.target.checked)} className="h-4 w-4 accent-blue-600" />启用定时备份
            </label>
            <label className="space-y-1 text-sm text-slate-600">频率<select disabled={!can('edit')} value={settings.frequency} onChange={(event) => updateSetting('frequency', event.target.value as Settings['frequency'])} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"><option value="daily">每天</option><option value="weekly">每周</option></select></label>
            {settings.frequency === 'weekly' && <label className="space-y-1 text-sm text-slate-600">星期<select disabled={!can('edit')} value={settings.weekday} onChange={(event) => updateSetting('weekday', Number(event.target.value))} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900">{WEEKDAYS.map((day, index) => <option key={day} value={index}>{day}</option>)}</select></label>}
            <label className="space-y-1 text-sm text-slate-600">执行时间<input disabled={!can('edit')} type="time" value={settings.time} onChange={(event) => updateSetting('time', event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900" /></label>
            <label className="space-y-1 text-sm text-slate-600">保留成功备份<input disabled={!can('edit')} type="number" min={1} max={100} value={settings.retentionCount} onChange={(event) => updateSetting('retentionCount', Number(event.target.value))} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900" /><span className="block text-xs text-slate-400">1–100 份；失败记录保留 30 天</span></label>
          </div>
          <label className="mt-4 inline-flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={settings.includeMedia} disabled={!can('edit')} onChange={(event) => updateSetting('includeMedia', event.target.checked)} className="h-4 w-4 accent-blue-600" />同时备份本地上传媒体文件</label>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-500">备份目录：<span className="font-mono">{overview.storage}</span></p>
            <button onClick={() => void saveSettings()} disabled={!can('edit') || !!busy} title={!can('edit') ? '当前角色没有配置备份计划的权限' : ''} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"><Save className="h-4 w-4" />{busy === 'settings' ? '保存中…' : '保存设置'}</button>
          </div>
        </section>

        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div><p className="font-semibold">恢复与存储提示</p><p className="mt-1">恢复会覆盖当前数据库，恢复前系统会自动创建安全备份。当前 {overview.database.client} 数据库{overview.database.restoreSupported ? '支持在线恢复' : '需要离线恢复'}。当前媒体提供方：{overview.records[0]?.mediaProvider || 'local'}；云端对象存储需另行配置云端版本控制/备份。建议定期下载备份并存放在另一台设备或异地位置。</p>
            {!overview.database.restoreSupported && <ol className="mt-2 list-inside list-decimal space-y-1 text-xs"><li>停止 Strapi，并额外复制当前数据库文件和 `backend/public/uploads` 作安全副本。</li><li>解压备份包，将 `database.sqlite` 替换为当前 `DATABASE_FILENAME` 文件（默认 `backend/.tmp/data.db`），将 `uploads` 覆盖 `backend/public/uploads`。</li><li>重新启动 Strapi，检查后台登录、文章和媒体资源。</li></ol>}
          </div>
        </div>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4"><div><h2 className="font-semibold text-slate-900">备份记录</h2><p className="mt-1 text-xs text-slate-500">包含执行方式、校验值、媒体文件情况和结果</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">SHA-256 校验</span></div>
          {!overview.records.length ? <div className="px-6 py-14 text-center text-sm text-slate-500">暂无备份记录。可先执行一次手动备份。</div> : <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">备份 / 数据库</th><th className="px-5 py-3">方式 / 状态</th><th className="px-5 py-3">时间</th><th className="px-5 py-3">大小 / 媒体</th><th className="px-5 py-3">执行人</th><th className="px-5 py-3 text-right">操作</th></tr></thead>
              <tbody className="divide-y divide-slate-100">{overview.records.map((item) => <tr key={item.id} className="align-top hover:bg-slate-50/70">
                <td className="max-w-[280px] px-5 py-4"><div className="break-all font-medium text-slate-900">{item.id}</div><div className="mt-1 text-xs text-slate-500">{item.databaseClient} · {item.databaseName}</div>{item.sha256 && <div title={item.sha256} className="mt-1 truncate font-mono text-[10px] text-slate-400">SHA-256 {item.sha256}</div>}</td>
                <td className="px-5 py-4"><div className="text-slate-700">{item.mode === 'manual' ? '手动' : item.mode === 'scheduled' ? '定时' : '恢复前安全点'}</div><span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs ${item.status === 'success' ? 'bg-emerald-100 text-emerald-700' : item.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{item.status === 'success' ? '成功' : item.status === 'failed' ? '失败' : '进行中'}</span>{item.error && <p className="mt-1 max-w-[240px] text-xs text-red-600">{item.error}</p>}</td>
                <td className="whitespace-nowrap px-5 py-4 text-slate-600">开始：{formatDate(item.startedAt)}<br />结束：{formatDate(item.completedAt)}</td>
                <td className="px-5 py-4 text-slate-600">{formatBytes(item.sizeBytes)}<div className="mt-1 text-xs">{item.mediaIncluded ? `本地媒体 ${item.mediaFiles || 0} 个文件` : '未包含媒体'}</div>{item.mediaNote && <div className="mt-1 max-w-[220px] text-xs text-amber-700">{item.mediaNote}</div>}</td>
                <td className="px-5 py-4 text-slate-600">{item.createdBy?.name || '系统定时任务'}<div className="mt-1 text-xs text-slate-400">{item.createdBy?.email || ''}</div></td>
                <td className="px-5 py-4"><div className="flex justify-end gap-1.5">
                  <button onClick={() => void downloadBackup(item)} disabled={!can('view') || item.status !== 'success' || !!busy} title="下载 .tar.gz 备份包" className="rounded-md p-2 text-blue-700 hover:bg-blue-50 disabled:text-slate-300"><Download className="h-4 w-4" /></button>
                  <button onClick={() => void restoreBackup(item)} disabled={!can('restore') || item.status !== 'success' || !overview.database.restoreSupported || !!busy} title={!can('restore') ? '当前角色没有恢复权限' : '恢复备份'} className="rounded-md p-2 text-amber-700 hover:bg-amber-50 disabled:text-slate-300"><RotateCcw className="h-4 w-4" /></button>
                  <button onClick={() => void removeBackup(item)} disabled={!can('delete') || !!busy} title={!can('delete') ? '当前角色没有删除权限' : '删除备份'} className="rounded-md p-2 text-red-700 hover:bg-red-50 disabled:text-slate-300"><Trash2 className="h-4 w-4" /></button>
                </div></td>
              </tr>)}</tbody>
            </table>
          </div>}
        </section>
      </>}
    </div>
  );
}

function Summary({ icon: Icon, title, value }: { icon: typeof Database; title: string; value: string }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><span className="rounded-lg bg-slate-100 p-2 text-slate-700"><Icon className="h-5 w-5" /></span><div className="min-w-0"><p className="text-xs text-slate-500">{title}</p><p className="truncate text-sm font-semibold text-slate-900">{value}</p></div></div></div>;
}
