'use client';

import { useEffect, useRef, useState } from 'react';

export default function Footer() {
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <footer
      ref={footerRef}
      className={`relative bg-[#003d82] text-white py-8 mt-16 overflow-hidden transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
      }`}
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-[#003d82]/90"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Logo和友情链接 - 左右布局 */}
        <div className="flex items-center justify-between mb-6">
          {/* Logo - 左侧 */}
          <div className="flex-shrink-0">
            <img
              src="/images/logo.png"
              alt="Logo"
              className="h-20 w-auto object-contain"
            />
          </div>

          {/* 友情链接 - 右侧 */}
          <div>
            <h4 className="text-right text-white text-sm mb-3">友情链接</h4>
            <div className="flex flex-col items-end gap-2">
              <div className="flex gap-6">
                <a href="https://www.jlu.edu.cn" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-200 transition-colors duration-300">
                  吉林大学
                </a>
                <a href="#" className="text-white hover:text-blue-200 transition-colors duration-300">
                  吉林大学珠海研究院
                </a>
              </div>
              <div className="flex gap-6">
                <a href="#" className="text-white hover:text-blue-200 transition-colors duration-300">
                  研究生院
                </a>
                <a href="#" className="text-white hover:text-blue-200 transition-colors duration-300">
                  吉林大学国家卓越工程师学院
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-white/80 border-t border-white/20 pt-4">
          <p className="mb-1">版权所有 © 2026 吉林大学国家卓越工程师学院（珠海） ALL RIGHTS RESERVED</p>
          <p>地址：广东省珠海市金湾区草堂 邮政编码：519041 | 联系电话：0756-7626386</p>
        </div>
      </div>
    </footer>
  );
}

