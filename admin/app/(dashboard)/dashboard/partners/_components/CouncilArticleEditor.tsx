'use client';

import { sanitizeRichHtml } from '@/lib/sanitize-html';

import { strapiFetch } from '@/lib/strapi-fetch';

import { useState, useEffect } from 'react';

const STRAPI_BASE_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

function authHeaders(): Record<string, string> {
  return { 'Content-Type': 'application/json' };
}

const COUNCIL_SLUG = 'about-council-content';

type ArticleData = {
  id: number;
  title: string;
  content: string;
};

export default function CouncilArticleEditor() {
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          'filters[slug][$eq]': COUNCIL_SLUG,
          'pagination[pageSize]': '1',
        });
        const res = await strapiFetch(`${STRAPI_BASE_URL}/api/articles?${params}`, {
          headers: authHeaders(),
          cache: 'no-store',
        });
        if (!res.ok) throw new Error(`${res.status}`);
        const json = await res.json();
        const item = json?.data?.[0];
        if (item) {
          const d = item.attributes ?? item;
          setArticle({ id: item.id, title: d.title ?? '', content: d.content ?? '' });
          setTitle(d.title ?? '');
          setContent(d.content ?? '');
        } else {
          setTitle('理事会');
          setContent('');
        }
      } catch (e) {
        setMessage({ type: 'error', text: '加载失败：' + (e instanceof Error ? e.message : String(e)) });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        data: {
          title,
          content,
          slug: COUNCIL_SLUG,
          publishedAt: new Date().toISOString(),
        },
      };

      let res: Response;
      if (article) {
        res = await strapiFetch(`${STRAPI_BASE_URL}/api/articles/${article.id}`, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify(payload),
        });
      } else {
        res = await strapiFetch(`${STRAPI_BASE_URL}/api/articles`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          (err as { error?: { message?: string } })?.error?.message ?? `保存失败: ${res.status}`
        );
      }

      const json = await res.json();
      const saved = json?.data;
      if (saved) {
        const d = saved.attributes ?? saved;
        setArticle({ id: saved.id, title: d.title ?? '', content: d.content ?? '' });
      }
      setMessage({ type: 'success', text: '保存成功！' });
    } catch (e) {
      setMessage({ type: 'error', text: '保存失败：' + (e instanceof Error ? e.message : String(e)) });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-center py-20 text-gray-400">加载中...</div>;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-800">理事会说明</h2>
        <p className="text-sm text-gray-500 mt-1">
          此内容显示在前台「学院概况 → 理事会」页面上方的介绍区域
        </p>
      </div>

      {message && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-600'
        }`}>
          {message.text}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">标题</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="理事会"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          正文内容
          <span className="ml-2 text-xs font-normal text-gray-400">（支持 HTML）</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="请输入理事会介绍内容，支持 HTML 标签..."
          rows={12}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-mono"
        />
      </div>

      {content && (
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">预览效果</p>
          <div
            className="border border-gray-200 rounded-lg p-4 prose prose-gray max-w-none text-sm bg-gray-50"
            dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(content) }}
          />
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
        >
          {saving ? '保存中…' : article ? '保存修改' : '创建内容'}
        </button>
        {article && (
          <span className="text-xs text-gray-400">ID: {article.id} · slug: {COUNCIL_SLUG}</span>
        )}
      </div>
    </div>
  );
}
