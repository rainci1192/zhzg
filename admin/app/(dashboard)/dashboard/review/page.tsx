'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

type ReviewStatus = 'pending_level1' | 'pending_level2' | 'pending_republish' | 'pending_admin' | 'pending_leader';

interface Article {
  id: string;
  documentId: string;
  title: string;
  summary?: string;
  content?: string;
  review_status: ReviewStatus;
  level1_reviewer?: { id?: number | string; documentId?: string; email?: string } | null;
  level2_reviewer?: { id?: number | string; documentId?: string; email?: string } | null;
}

const level1Statuses = new Set<ReviewStatus>(['pending_level1', 'pending_admin']);
const level2Statuses = new Set<ReviewStatus>(['pending_level2', 'pending_republish', 'pending_leader']);
const level1Roles = new Set(['article_level1_reviewer', 'level1_reviewer', 'reviewer_level1']);
const level2Roles = new Set(['article_level2_reviewer', 'level2_reviewer', 'reviewer_level2']);

function statusLabel(status: ReviewStatus) {
  if (level1Statuses.has(status)) return '待一级审核';
  return '待二级审核';
}

function relationMatches(relation: Article['level1_reviewer'], user: { id?: string; documentId?: string; email?: string } | null) {
  if (!relation || !user) return false;
  return (relation.id != null && String(relation.id) === String(user.id)) ||
    (!!relation.documentId && relation.documentId === user.documentId) ||
    (!!relation.email && relation.email.toLowerCase() === user.email?.toLowerCase());
}

export default function ReviewPage() {
  const { user } = useAuth();
  const role = user?.role || '';
  const [list, setList] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<Article | null>(null);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = (await api.getArticles(
        '?filters[review_status][$in][0]=pending_level1&filters[review_status][$in][1]=pending_level2&filters[review_status][$in][2]=pending_admin&filters[review_status][$in][3]=pending_leader&filters[review_status][$in][4]=pending_republish&sort=createdAt:desc'
      )) as { data?: Article[] };
      setList(res.data || []);
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('workflow-tasks-updated'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPending();
  }, []);

  const review = async (article: Article, decision: 'approve' | 'reject') => {
    const comment = decision === 'reject' ? prompt('请输入退回原因：') || '' : prompt('审核意见（可留空）：') || '';
    if (decision === 'reject' && !comment.trim()) return;

    if (level1Statuses.has(article.review_status)) {
      let level2ReviewerId: string | number | undefined;
      if (decision === 'approve') {
        const response = (await api.getLevel2Reviewers()) as { data?: Array<{ id: number; documentId?: string; name: string; email: string }> };
        const reviewers = response.data || [];
        if (!reviewers.length) throw new Error('当前没有可用的二级审核人员。');
        if (reviewers.length === 1) level2ReviewerId = reviewers[0].documentId || reviewers[0].id;
        else {
          const answer = prompt(`请选择二级审核人员：\n${reviewers.map((item, index) => `${index + 1}. ${item.name}（${item.email}）`).join('\n')}`, '1');
          const selected = reviewers[Number(answer) - 1];
          if (!selected) return;
          level2ReviewerId = selected.documentId || selected.id;
        }
      }
      await api.reviewArticleLevel1(article.documentId, decision, comment, level2ReviewerId);
    } else {
      await api.reviewArticleLevel2(article.documentId, decision, comment);
    }
    await fetchPending();
    alert(decision === 'approve' && level1Statuses.has(article.review_status) ? '一级审核通过，已提交二级审核。' : decision === 'approve' ? '审核通过。' : '文章已退回发布者。');
  };

  const canReview = (article: Article) =>
    role === 'super_admin' ||
    (level1Statuses.has(article.review_status) && level1Roles.has(role) && (!article.level1_reviewer || relationMatches(article.level1_reviewer, user))) ||
    (level2Statuses.has(article.review_status) && level2Roles.has(role) && (!article.level2_reviewer || relationMatches(article.level2_reviewer, user)));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">审核中心</h1>
      {loading ? <div>加载中...</div> : <table className="w-full bg-white rounded-xl border"><thead className="bg-gray-50"><tr><th className="p-3 text-left">标题</th><th className="p-3 text-left">状态</th><th className="p-3 text-center">操作</th></tr></thead><tbody>{list.map((article) => <tr key={article.id} className="border-t"><td className="p-3"><button onClick={async () => { const res = (await api.getArticle(article.documentId)) as { data?: Article }; setPreview(res.data || null); }} className="text-blue-600 hover:underline">{article.title}</button></td><td className="p-3">{statusLabel(article.review_status)}</td><td className="p-3 text-center space-x-2">{canReview(article) && <><button onClick={() => void review(article, 'approve')} className="px-3 py-1 bg-green-600 text-white rounded">通过</button><button onClick={() => void review(article, 'reject')} className="px-3 py-1 bg-red-600 text-white rounded">退回</button></>}</td></tr>)}{list.length === 0 && <tr><td colSpan={3} className="p-6 text-center text-gray-400">暂无待审核内容</td></tr>}</tbody></table>}
      {preview && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white max-w-3xl w-full rounded-xl p-6"><h2 className="text-xl font-bold mb-2">{preview.title}</h2>{preview.summary && <p className="text-gray-600 mb-4">{preview.summary}</p>}<div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: preview.content || '' }} /><div className="text-right mt-6"><button onClick={() => setPreview(null)} className="px-4 py-2 bg-gray-200 rounded">关闭</button></div></div></div>}
    </div>
  );
}
