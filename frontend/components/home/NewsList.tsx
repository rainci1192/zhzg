'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getHomeNews } from '@/lib/api';
import HomeSectionSkeleton from '@/components/home/HomeSectionSkeleton';

interface MediaItem {
  url?: string;
}

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  publish_time?: string;
  cover?: MediaItem | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

function toAbsoluteUrl(url?: string | null) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE}${url}`;
}

export default function NewsList() {
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [containerVisible, setContainerVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const json = await getHomeNews();
        if (!mounted) return;
        setNewsData(Array.isArray(json?.data) ? (json.data as NewsItem[]) : []);
      } catch (e) {
        console.error('getHomeNews error:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) setContainerVisible(true); },
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (newsData.length === 0) return;
    const slideCount = Math.min(newsData.length, 5);
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideCount);
    }, 4000);
    return () => clearInterval(timer);
  }, [newsData]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return { mmdd: '--', day: '--', month: '--', year: '--', ym: '' };
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return { mmdd: '--', day: '--', month: '--', year: '--', ym: '' };
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return {
      mmdd: `${mm}-${dd}`,
      day: dd,
      month: mm,
      year: String(d.getFullYear()),
      ym: `${d.getFullYear()}-${mm}`,
    };
  };

  const getImage = (item: NewsItem) => {
    const raw = item.cover?.url || null;
    return toAbsoluteUrl(raw);
  };

  const slideCount = Math.min(newsData.length, 5);
  const safeSlideIndex = slideCount > 0 ? currentSlide % slideCount : 0;
  const activeItem = newsData[safeSlideIndex] || newsData[0];

  // 右侧列表数据：取 newsData[0] 作为首条放大，newsData[1~6] 作为双列卡片（3行×2列=6条）
  const firstItem = newsData[0];
  const gridItems = newsData.slice(1, 7); // 最多6条，3行×2列

  return (
    <div
      ref={containerRef}
      className={`px-12 py-8 transition-all duration-1000 ${
        containerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      {/* 标题区 + 分割线 */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-4xl font-bold text-blue-800">新闻动态</h2>
            <span className="text-base text-gray-400">/ News</span>
          </div>
          <Link
            href="/news"
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

      {loading ? (
        <HomeSectionSkeleton mode="news" />
      ) : newsData.length === 0 ? (
        <div className="text-gray-500 text-center py-12">暂无新闻数据</div>
      ) : (
        <div className="flex gap-8 items-stretch">
          {/* 左侧轮播卡片（保持原有逻辑不变） */}
          <div className="w-1/3 flex-shrink-0">
            <Link href={`/article/${activeItem.slug}?from=news`} className="block group h-full flex flex-col">
              <div className="relative w-full aspect-[3/2] overflow-hidden bg-gray-200">
                {getImage(activeItem) ? (
                  <Image
                    src={getImage(activeItem)!}
                    alt={activeItem.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="40vw"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center">
                    <span className="text-white text-6xl font-bold">
                      {formatDate(activeItem.publish_time).day}
                    </span>
                  </div>
                )}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {newsData.slice(0, 5).map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.preventDefault(); setCurrentSlide(i); }}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        i === safeSlideIndex ? 'bg-blue-500 scale-125' : 'bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="bg-blue-700 text-white p-4 flex-1">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 text-center">
                    <div className="text-3xl font-bold leading-none">
                      {formatDate(activeItem.publish_time).day}
                    </div>
                    <div className="text-xs opacity-80 mt-1">
                      {formatDate(activeItem.publish_time).ym}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base leading-tight line-clamp-1 group-hover:underline">
                      {activeItem.title}
                    </h3>
                    <p className="text-xs opacity-80 mt-1 line-clamp-2 leading-relaxed">
                      {activeItem.summary || ''}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* 右侧：政策文件首条放大 + 录取公示双列卡片 */}
          <div className="flex-1 flex flex-col gap-4">

            {/* ===== 第一行：政策文件放大特效 ===== */}
            {firstItem && (
              <Link
                href={`/article/${firstItem.slug}?from=news`}
                className="group flex items-center gap-5 px-5 py-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300"
              >
                {/* 醒目大日历方块 */}
                <div className="flex-shrink-0 flex flex-col items-center justify-center w-[80px] h-[80px] bg-blue-600 rounded-xl shadow group-hover:scale-105 group-hover:bg-blue-700 transition-all duration-300">
                  <span className="text-3xl font-bold font-mono text-white leading-none">
                    {formatDate(firstItem.publish_time).day}
                  </span>
                  <span className="text-[11px] font-mono text-blue-100 mt-1">
                    {formatDate(firstItem.publish_time).year}.{formatDate(firstItem.publish_time).month}
                  </span>
                </div>

                {/* 大字号标题与摘要 */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-bold text-gray-900 line-clamp-1 leading-snug group-hover:text-blue-600 group-hover:translate-x-1.5 transition-all duration-300">
                    {firstItem.title}
                  </h4>
                  {firstItem.summary && (
                    <p className="text-sm text-gray-500 mt-1.5 line-clamp-1 group-hover:translate-x-1.5 transition-all duration-300">
                      {firstItem.summary}
                    </p>
                  )}
                </div>

                {/* 滑入箭头 */}
                <div className="flex-shrink-0 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-blue-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </Link>
            )}

            {/* ===== 第二行起：录取公示双列卡片 + 悬停背景图特效 ===== */}
            <div className="grid grid-cols-2 gap-4 flex-1">
              {gridItems.map((news) => {
                const { day, month, year } = formatDate(news.publish_time);
                const bgImg = getImage(news);

                return (
                  <Link
                    key={news.id}
                    href={`/article/${news.slug}?from=news`}
                    className="group relative rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-lg overflow-hidden transition-all duration-500 min-h-[100px] flex flex-col justify-between p-4"
                  >
                    {/* 悬停背景图显现层 */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0">
                      {bgImg ? (
                        <Image
                          src={bgImg}
                          alt={news.title}
                          fill
                          className="object-cover brightness-[0.3] scale-105 group-hover:scale-100 transition-transform duration-700"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-indigo-900" />
                      )}
                    </div>

                    {/* 内容区（悬停时文字反白） */}
                    <div className="relative z-10 flex flex-col h-full gap-3">
                      <h4 className="text-[14px] font-semibold text-gray-800 group-hover:text-white line-clamp-2 leading-snug tracking-wide group-hover:translate-x-0.5 transition-all duration-300">
                        {news.title}
                      </h4>

                      {/* 日期行：时钟图标 + 完整日期 */}
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 group-hover:text-blue-200 font-mono transition-colors duration-300 mt-auto">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{year}-{month}-{day}</span>
                      </div>
                    </div>

                    {/* 右下角滑出箭头 */}
                    <div className="absolute right-3 bottom-3 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-white z-10">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                      </svg>
                    </div>
                  </Link>
                );
              })}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
