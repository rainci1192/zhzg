'use client';

import { useEffect, useRef, useState } from 'react';

export default function Footer() {
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setIsVisible(true);
        });
      },
      { threshold: 0.1 }
    );

    if (footerRef.current) observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <footer
      ref={footerRef}
      className={`relative bg-[#003d82] text-white py-8 mt-0 overflow-hidden transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-100 translate-y-0'
      }`}
      style={{
        backgroundImage: 'url(/images/banner-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-[#043c7e]/85"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Logo和友情链接 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-shrink-0">
            <img
              src="/images/logo.png"
              alt="Logo"
              className="h-20 w-auto object-contain"
            />
          </div>

          <div className="text-left">
            <h4 className="text-white text-sm mb-3">友情链接</h4>
            <div className="flex flex-col gap-2">
              <a href="https://www.jlu.edu.cn" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-200 transition-colors duration-300">
                吉林大学
              </a>
              <a href="https://yjsy.jlu.edu.cn" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-200 transition-colors duration-300">
                研究生院
              </a>
              <a href="#" className="text-white hover:text-blue-200 transition-colors duration-300">
                吉林大学国家卓越工程师学院
              </a>
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
