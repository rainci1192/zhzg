'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Bell, CheckCircle, Clock, Edit, Eye, Send, XCircle } from 'lucide-react';

type CountResponse = { meta?: { pagination?: { total?: number } } };
type Counts = {
  published: number | null;
  pending: number | null;
  categories: number | null;
  banners: number | null;
};

type WorkflowTask = {
  id: string;
  type: string;
  title: string;
  article_document_id?: string;
  article_title: string;
  status: string;
  status_label: string;
  action_required: boolean;
  actions: string[];
  comment?: string;
  submitter?: { name?: string; email?: string } | null;
  updatedAt?: string;
};

const emptyCounts: Counts = {
  published: null,
  pending: null,
  categories: null,
  banners: null,
};

function totalFrom(response: unknown): number | null {
  const total = (response as CountResponse)?.meta?.pagination?.total;
  return typeof total === 'number' ? total : null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [counts, setCounts] = useState<Counts>(emptyCounts);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<WorkflowTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [preview, setPreview] = useState<{ title?: string; summary?: string; content?: string } | null>(null);

  const loadTasks = async () => {
    setTasksLoading(true);
    try {
      const response = (await api.getWorkflowTasks()) as { data?: WorkflowTask[] };
      setTasks(response.data || []);
      window.dispatchEvent(new CustomEvent('workflow-tasks-updated'));
    } catch (error) {
      console.error('workflow tasks error:', error);
      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    async function load() {
      const requests = await Promise.allSettled([
        api.getArticles('?filters[review_status][$eq]=published&pagination[pageSize]=1'),
        api.getArticles(
          '?filters[review_status][$in][0]=pending_level1&filters[review_status][$in][1]=pending_level2&filters[review_status][$in][2]=pending_admin&filters[review_status][$in][3]=pending_leader&filters[review_status][$in][4]=pending_republish&pagination[pageSize]=1'
        ),
        api.getCategories('?pagination[pageSize]=1'),
        api.getBanners('?pagination[pageSize]=1'),
      ]);
      if (!active) return;
      const values = requests.map((result) =>
        result.status === 'fulfilled' ? totalFrom(result.value) : null
      );
      setCounts({
        published: values[0],
        pending: values[1],
        categories: values[2],
        banners: values[3],
      });
      setLoading(false);
    }

    void load();
    void loadTasks();
    return () => { active = false; };
  }, []);

  const performTask = async (task: WorkflowTask, action: string) => {
    const id = task.article_document_id;
    if (!id) return;
    try {
      if (action === 'preview') {
        const response = (await api.getArticle(id)) as { data?: { title?: string; summary?: string; content?: string } };
        setPreview(response.data || null);
      } else if (action === 'approve' || action === 'reject') {
        const comment = action === 'reject' ? window.prompt('请输入退回原因：') || '' : window.prompt('审核意见（可留空）：') || '';
        if (action === 'reject' && !comment.trim()) return;
        if (task.type === 'review_level1') await api.reviewArticleLevel1(id, action, comment);
        else await api.reviewArticleLevel2(id, action, comment);
        await loadTasks();
      } else if (action === 'publish') {
        if (!window.confirm('二级审核已通过，确认发布吗？')) return;
        await api.publishArticle(id);
        await loadTasks();
      } else if (action === 'unpublish') {
        if (!window.confirm('确认取消发布这篇文章吗？')) return;
        await api.unpublishArticle(id);
        await loadTasks();
      } else if (action === 'edit' || action === 'submit') {
        router.push('/dashboard/articles');
      }
    } catch (error) {
      window.alert(`任务处理失败：${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const cards = [
    { label: '已发布文章', value: counts.published, color: 'text-blue-600' },
    { label: '待审核内容', value: counts.pending, color: 'text-amber-600' },
    { label: '栏目总数', value: counts.categories, color: 'text-emerald-600' },
    { label: '轮播图总数', value: counts.banners, color: 'text-purple-600' },
  ];

  const actionableTasks = tasks.filter((task) => task.action_required);
  const reviewerTasks = tasks.filter((task) => task.type === 'review_level1' || task.type === 'review_level2');
  const returnedTasks = tasks.filter((task) => task.type.startsWith('author_revision'));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">欢迎回来</h1>
        <p className="text-gray-500">吉林大学国家卓越工程师学院后台管理系统</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className={`text-4xl font-bold mt-2 ${card.color}`}>
              {loading ? '加载中…' : card.value ?? '—'}
            </p>
          </div>
        ))}
      </div>
      <section className="rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="relative rounded-2xl bg-blue-50 p-3 text-blue-600"><Bell className="h-5 w-5" />{actionableTasks.length > 0 && <span className="absolute -right-2 -top-2 min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-center text-xs font-bold text-white">{actionableTasks.length > 99 ? '99+' : actionableTasks.length}</span>}</div>
            <div><h2 className="text-xl font-semibold text-gray-900">站内工作任务</h2><p className="text-sm text-gray-500">待处理 {actionableTasks.length} 项 · 审核任务 {reviewerTasks.length} 项 · 退回修改 {returnedTasks.length} 项</p></div>
          </div>
          <button onClick={() => void loadTasks()} className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">刷新任务</button>
        </div>
        {tasksLoading ? <div className="p-8 text-center text-gray-400">正在加载任务…</div> : tasks.length === 0 ? <div className="p-10 text-center text-gray-400"><CheckCircle className="mx-auto mb-2 h-8 w-8 text-emerald-400" />当前没有需要处理的工作任务</div> : <div className="divide-y divide-gray-100">{tasks.slice(0, 12).map((task) => <div key={task.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 hover:bg-gray-50"><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${task.action_required ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>{task.status_label}</span><span className="font-medium text-gray-900">{task.title}</span></div><div className="mt-1 truncate text-sm text-gray-700">{task.article_title}</div><div className="mt-1 flex items-center gap-2 text-xs text-gray-400"><Clock className="h-3.5 w-3.5" />{task.submitter?.name || task.submitter?.email || '系统任务'}{task.comment ? ` · 意见：${task.comment}` : ''}</div></div><div className="flex items-center gap-2">{task.actions.includes('preview') && <button title="预览" onClick={() => void performTask(task, 'preview')} className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50"><Eye className="h-4 w-4" /></button>}{task.actions.includes('edit') && <button title="编辑" onClick={() => void performTask(task, 'edit')} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"><Edit className="h-4 w-4" /></button>}{task.actions.includes('submit') && <button title="提交审核" onClick={() => void performTask(task, 'submit')} className="rounded-lg p-2 text-amber-600 hover:bg-amber-50"><Send className="h-4 w-4" /></button>}{task.actions.includes('approve') && <button title="通过" onClick={() => void performTask(task, 'approve')} className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50"><CheckCircle className="h-4 w-4" /></button>}{task.actions.includes('reject') && <button title="退回" onClick={() => void performTask(task, 'reject')} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><XCircle className="h-4 w-4" /></button>}{task.actions.includes('publish') && <button title="发布" onClick={() => void performTask(task, 'publish')} className="rounded-lg p-2 text-purple-600 hover:bg-purple-50"><CheckCircle className="h-4 w-4" /></button>}{task.actions.includes('unpublish') && <button title="取消发布" onClick={() => void performTask(task, 'unpublish')} className="rounded-lg p-2 text-orange-600 hover:bg-orange-50"><XCircle className="h-4 w-4" /></button>}</div></div>)}</div>}
        {tasks.length > 12 && <div className="border-t border-gray-100 px-6 py-3 text-center text-sm text-gray-500">还有 {tasks.length - 12} 项任务，前往文章管理查看全部</div>}
      </section>
      {preview && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6"><h2 className="text-2xl font-bold text-gray-900">{preview.title}</h2>{preview.summary && <p className="mt-2 text-gray-500">{preview.summary}</p>}<div className="prose mt-6 max-w-none" dangerouslySetInnerHTML={{ __html: preview.content || '<p>暂无正文</p>' }} /><div className="mt-6 text-right"><button onClick={() => setPreview(null)} className="rounded-xl bg-gray-100 px-4 py-2 text-sm text-gray-700">关闭预览</button></div></div></div>}
      {!loading && Object.values(counts).some((value) => value === null) && (
        <p role="alert" className="text-sm text-amber-700">
          部分统计暂时无法获取，请检查登录状态和 Strapi 接口权限。
        </p>
      )}
    </div>
  );
}
