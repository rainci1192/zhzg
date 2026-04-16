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

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setContainerVisible(true);
      },
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

  // 当前轮播项（确保 currentSlide 有效）
  const slideCount = Math.min(newsData.length, 5);
  const safeSlideIndex = slideCount > 0 ? currentSlide % slideCount : 0;
  const activeItem = newsData[safeSlideIndex] || newsData[0];

  return (
    <div
      ref={containerRef}
      className={`px-12 py-8 transition-all duration-1000 ${
        containerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      {/* 标题区 + 分割线（始终显示） */}
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

      {/* 加载状态 */}
      {loading ? (
        <HomeSectionSkeleton mode="news" />
      ) : newsData.length === 0 ? (
        <div className="text-gray-500 text-center py-12">暂无新闻数据</div>
      ) : (
        <div className="flex gap-8 items-stretch">
          {/* 左侧轮播卡片 */}
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
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentSlide(i);
                      }}
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

          {/* 右侧列表 */}
          <div className="flex-1 flex flex-col justify-between">
            {newsData.slice(1, 6).map((news) => {
              const { day, month, year } = formatDate(news.publish_time);

              return (
                <Link
                  key={news.id}
                  href={`/article/${news.slug}?from=news`}
                  className="group block bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="flex items-stretch">
                    {/* 日期卡片 */}
                    <div className="relative w-20 flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-500">
                      <div className="h-full flex flex-col items-center justify-center p-3 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative z-10 text-center">
                          <div className="text-3xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                            {day}
                          </div>
                          <div className="text-xs text-blue-100 mt-0.5">{year}</div>
                          <div className="text-xs font-semibold text-white mt-0.5">{month}月</div>
                        </div>
                        <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-white/60 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="absolute bottom-2 left-2 w-1 h-1 bg-white/40 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                      </div>
                    </div>

                    {/* 内容区域 */}
                    <div className="flex-1 p-4 relative">
                      <div className="relative z-10">
                        <h4 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300 mb-1 leading-tight line-clamp-1">
                          {news.title}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-1 leading-relaxed">
                          {news.summary || ''}
                        </p>
                      </div>

                      {/* 右侧箭头 */}
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* 底部蓝色进度条 */}
                  <div className="h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
