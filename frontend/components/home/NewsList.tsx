'use client';

import { useEffect, useRef, useState } from 'react';

const newsData = [
  {
    id: 1,
    title: '我院召开国家卓越工程师学院建设工作推进会',
    date: '2026-01-26',
    excerpt: '1月23日，我院组织召开国家卓越工程师学院建设工作推进会，校长参加，校党委副书记出席会议，会议由副校长主持，会上...',
  },
  {
    id: 2,
    title: '沈阳工业大学卓越工程师学院来我院调研',
    date: '2026-01-23',
    excerpt: '1月21日，沈阳工业大学副校长、卓越工程师学院院长一行来我院调研，我校校长助理、国家卓越工程师学院院长等陪同...',
  },
  {
    id: 3,
    title: '国家卓越工程师学院举办第三期卓越讲堂',
    date: '2026-01-14',
    excerpt: '1月7日，由国家卓越工程师学院主办的卓越讲堂系列讲座第三期"讲座主题"讲座在学校报告厅举办，讲座邀请到...',
  },
  {
    id: 4,
    title: '国家卓越工程师学院研究生班荣获学金获奖学生...',
    date: '2025-12-31',
    excerpt: '国家卓越工程师学院研究生班荣获学金获奖学生，以上是获奖学生名单，以上是获奖学生名单，本期获奖学生共计...',
  },
];

export default function NewsList() {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const [containerVisible, setContainerVisible] = useState(false);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const itemObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            setVisibleItems((prev) => [...new Set([...prev, index])]);
          }
        });
      },
      { threshold: 0.1 }
    );

    const containerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setContainerVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    itemRefs.current.forEach((ref) => ref && itemObserver.observe(ref));
    if (containerRef.current) {
      containerObserver.observe(containerRef.current);
    }

    return () => {
      itemObserver.disconnect();
      containerObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-lg p-8 mb-8 transition-all duration-1000 ${
        containerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
      }`}
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full"></div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            新闻动态
          </h2>
          <span className="text-sm text-gray-400 mt-2">/ News</span>
        </div>
        <a
          href="/news"
          className="group relative flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-medium overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 transform translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
          <svg className="w-5 h-5 relative z-10 transform group-hover:rotate-45 group-hover:-translate-y-1 group-hover:translate-x-1 transition-all duration-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
          <span className="relative z-10">查看更多</span>
        </a>
      </div>

      {/* 头条新闻卡片 */}
      <div
        ref={(el) => (itemRefs.current[0] = el)}
        data-index={0}
        className={`group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer mb-6 ${
          visibleItems.includes(0) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="flex flex-col md:flex-row">
          <div className="md:w-2/5 relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-400 h-64 md:h-auto">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white p-8">
                <div className="text-6xl font-bold mb-2">{newsData[0].date.split('-')[2]}</div>
                <div className="text-lg opacity-90">{newsData[0].date.slice(0, 7)}</div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
          <div className="md:w-3/5 p-6 md:p-8 flex flex-col justify-center">
            <div className="inline-block px-3 py-1 bg-red-500 text-white text-xs font-bold rounded mb-4 w-fit">头条</div>
            <h3 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300 mb-4">
              {newsData[0].title}
            </h3>
            <p className="text-gray-600 leading-relaxed line-clamp-3">{newsData[0].excerpt}</p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
      </div>

      {/* 其他新闻列表 */}
      <ul className="space-y-3">
        {newsData.slice(1).map((news, index) => (
          <li
            key={news.id}
            ref={(el) => (itemRefs.current[index + 1] = el)}
            data-index={index + 1}
            className={`group relative bg-white rounded-lg p-5 hover:shadow-xl transition-all duration-500 cursor-pointer border border-transparent hover:border-blue-100 ${
              visibleItems.includes(index + 1) ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}
            style={{ transitionDelay: `${(index + 1) * 80}ms` }}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-16 text-center">
                <div className="text-2xl font-bold text-blue-600 group-hover:scale-110 transition-transform duration-300">
                  {news.date.split('-')[2]}
                </div>
                <div className="text-xs text-gray-500">{news.date.slice(0, 7)}</div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-300 line-clamp-1 mb-2">
                  {news.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{news.excerpt}</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 to-blue-400 rounded-l-lg transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top"></div>
          </li>
        ))}
      </ul>
    </div>
  );
}

