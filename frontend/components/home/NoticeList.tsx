'use client';

import { useEffect, useRef, useState } from 'react';

const noticeData = [
  {
    id: 1,
    title: '关于做好2026年度专项工程硕士毕业生工程系列职称申报工作的通知',
    date: '2026-03-06',
    tag: '重要',
  },
  {
    id: 2,
    title: '关于公布研究生教育教学改革专项（卓越工程师）项目结题情况的通知',
    date: '2026-01-29',
    tag: '通知',
  },
  {
    id: 3,
    title: '关于开展研究生教育教学改革专项（卓越工程师）项目结题工作的通知',
    date: '2026-01-06',
    tag: '通知',
  },
  {
    id: 4,
    title: '江苏省卓越工程师培养改革优秀案例/校企导师组推荐公示',
    date: '2025-11-18',
    tag: '公示',
  },
  {
    id: 5,
    title: '关于开展国家卓越工程师学院2026级工程硕博士校内导师双选工作的通知',
    date: '2025-11-13',
    tag: '通知',
  },
];

export default function NoticeList() {
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
      className={`bg-gradient-to-br from-orange-50 to-white rounded-xl shadow-lg p-8 transition-all duration-1000 ${
        containerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
      }`}
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-orange-300 rounded-full"></div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
            通知公告
          </h2>
          <span className="text-sm text-gray-400 mt-2">/ Notice</span>
        </div>
        <a
          href="/notice"
          className="group relative flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-medium overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 transform translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
          <svg className="w-5 h-5 relative z-10 transform group-hover:rotate-45 group-hover:-translate-y-1 group-hover:translate-x-1 transition-all duration-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
          <span className="relative z-10">查看更多</span>
        </a>
      </div>

      <ul className="space-y-3">
        {noticeData.map((notice, index) => (
          <li
            key={notice.id}
            ref={(el) => (itemRefs.current[index] = el)}
            data-index={index}
            className={`group relative bg-white rounded-lg p-4 hover:shadow-lg transition-all duration-500 cursor-pointer transform hover:-translate-x-2 ${
              visibleItems.includes(index) ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}
            style={{ transitionDelay: `${index * 80}ms` }}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-16 text-center">
                <div className="text-2xl font-bold text-orange-600">{notice.date.split('-')[2]}</div>
                <div className="text-xs text-gray-500">{notice.date.slice(0, 7)}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${
                    notice.tag === '重要' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                  }`}>
                    {notice.tag}
                  </span>
                  <h3 className="flex-1 text-gray-800 group-hover:text-orange-600 transition-colors duration-300 line-clamp-2">
                    {notice.title}
                  </h3>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transform group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-600 to-orange-400 rounded-l-lg transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top"></div>
          </li>
        ))}
      </ul>
    </div>
  );
}

