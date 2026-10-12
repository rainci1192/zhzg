'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getHomeNotices } from '@/lib/api';
import HomeSectionSkeleton from '@/components/home/HomeSectionSkeleton';

interface ArticleItem {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  publish_time?: string;
}

export default function NoticeList() {
  const [list, setList] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const json = await getHomeNotices();
        if (!mounted) return;
        const data = Array.isArray(json?.data) ? json.data : [];
        setList(data);
      } catch (err: unknown) {
        if (!mounted) return;
        console.error('getHomeNotices error:', err);
        const msg = err instanceof Error ? err.message : '加载失败';
        setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return { day: '--', yearMonth: '--' };
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return { day: '--', yearMonth: '--' };
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return { day, yearMonth: `${year}.${month}` };
  };

  if (loading) {
    return (
      <div className="px-12 py-8">
        <HomeSectionSkeleton mode="notice" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-12 py-8 text-red-500">
        通知公告加载失败：{error}
      </div>
    );
  }

  const displayList = list.slice(0, 6);

  return (
    <div className="px-12 py-8">
      {/* 标题区 - 与新闻动态完全一致的样式 */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-4xl font-bold text-blue-800">通知公告</h2>
            <span className="text-base text-gray-400">/ Notice</span>
          </div>
          <Link
            href="/notice"
            className="group relative flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-medium overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 transform translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
            <svg
              className="w-5 h-5 relative z-10 transform group-hover:rotate-45 group-hover:-translate-y-1 group-hover:translate-x-1 transition-all duration-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
            <span className="relative z-10">查看更多</span>
          </Link>
        </div>
        <div className="mt-4 h-px w-full bg-gradient-to-r from-blue-200 via-gray-300 to-gray-200" />
      </div>

      {displayList.length === 0 ? (
        <div className="text-gray-400 text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
          暂无通知公告
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {displayList.map((notice) => {
            const { day, yearMonth } = formatDate(notice.publish_time);

            return (
              <Link
                key={notice.id}
                href={`/article/${notice.slug}?from=notice`}
                className="group relative flex items-center gap-5 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className="flex-shrink-0 flex flex-col items-center justify-center w-[72px] h-[72px] bg-gray-50 rounded-xl group-hover:bg-blue-600 group-hover:scale-105 transition-all duration-300 ease-out shadow-inner">
                  <span className="text-2xl font-bold font-mono tracking-tight text-gray-800 group-hover:text-white transition-colors duration-300">
                    {day}
                  </span>
                  <span className="text-[11px] font-mono mt-0.5 text-gray-400 group-hover:text-blue-100 transition-colors duration-300">
                    {yearMonth}
                  </span>
                </div>

                <div className="flex-1 min-w-0 pr-4">
                  <h4 className="text-[15px] font-semibold text-gray-700 leading-snug tracking-wide line-clamp-2 group-hover:text-blue-600 group-hover:translate-x-1.5 transition-all duration-300 ease-out">
                    {notice.title}
                  </h4>
                  {notice.summary && (
                    <p className="text-xs mt-1.5 text-gray-400 line-clamp-1 group-hover:text-blue-500/80 group-hover:translate-x-1.5 transition-all duration-300 ease-out">
                      {notice.summary}
                    </p>
                  )}
                </div>

                <div className="absolute right-3 bottom-3 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-blue-500">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
