'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Article {
  id: string;
  documentId: string;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  review_status: string;
  publish_time?: string;
}

export default function ReviewPage() {
  const [list, setList] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<Article | null>(null);

  const fetchPending = async () => {
    setLoading(true);
    const res = (await api.getArticles(
      '?filters[review_status][$eq]=pending&sort=createdAt:desc'
    )) as { data?: Article[] };
    setList(res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPending();
  }, []);

  const openPreview = async (docId: string) => {
    const res = (await api.getArticle(docId)) as { data?: Article };
    setPreview(res.data || null);
  };

  const approve = async (docId: string) => {
    await api.updateArticle(docId, { review_status: 'approved' });
    fetchPending();
  };

  const reject = async (docId: string) => {
    await api.updateArticle(docId, { review_status: 'rejected' });
    fetchPending();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">审核中心</h1>

      {loading ? (
        <div>加载中...</div>
      ) : (
        <table className="w-full bg-white rounded-xl border">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">标题</th>
              <th className="p-3 text-left">状态</th>
              <th className="p-3 text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            {list.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="p-3">
                  <button
                    onClick={() => openPreview(a.documentId)}
                    className="text-blue-600 hover:underline"
                  >
                    {a.title}
                  </button>
                </td>
                <td className="p-3">{a.review_status}</td>
                <td className="p-3 text-center space-x-2">
                  <button
                    onClick={() => approve(a.documentId)}
                    className="px-3 py-1 bg-green-600 text-white rounded"
                  >
                    通过
                  </button>
                  <button
                    onClick={() => reject(a.documentId)}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    驳回
                  </button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={3} className="p-6 text-center text-gray-400">
                  暂无待审核内容
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {preview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white max-w-3xl w-full rounded-xl p-6">
            <h2 className="text-xl font-bold mb-2">{preview.title}</h2>
            {preview.summary && <p className="text-gray-600 mb-4">{preview.summary}</p>}
            <div className="prose max-w-none">{preview.content}</div>
            <div className="text-right mt-6">
              <button
                onClick={() => setPreview(null)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
