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
      {/* 标题区 + 分割线 */}
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
        <div className="text-gray-400 text-center py-12">暂无通知公告</div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {displayList.map((notice) => {
            const { day, yearMonth } = formatDate(notice.publish_time);

            return (
              <Link
                key={notice.id}
                href={`/article/${notice.slug}?from=notice`}
                className="group relative overflow-hidden rounded-lg bg-gray-50 transition-all duration-500 shadow-sm hover:shadow-lg hover:-translate-y-[2px]"
              >
                {/* 流光动效层 */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/60 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>

                <div className="relative p-6 flex items-center gap-4 transition-all duration-500 group-hover:bg-gradient-to-r group-hover:from-blue-50 group-hover:to-blue-100">
                  {/* 日期 */}
                  <div className="flex-shrink-0 text-center">
                    <div className="text-5xl font-bold leading-none text-blue-700 group-hover:text-blue-800 transition-colors duration-500">
                      {day}
                    </div>
                    <div className="text-sm mt-1 text-gray-500 group-hover:text-blue-600 transition-colors duration-500">
                      {yearMonth}
                    </div>
                  </div>

                  {/* 标题 */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-bold leading-tight line-clamp-2 text-gray-800 group-hover:text-blue-700 transition-colors duration-500">
                      {notice.title}
                    </h4>
                    {notice.summary && (
                      <p className="text-sm mt-2 line-clamp-1 text-gray-500 group-hover:text-blue-600 transition-colors duration-500">
                        {notice.summary}
                      </p>
                    )}
                  </div>

                  {/* 箭头 */}
                  <div className="flex-shrink-0 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* 底部细蓝线动效 */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-400 to-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
