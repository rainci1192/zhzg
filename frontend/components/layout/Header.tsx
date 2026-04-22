'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { name: '学院首页', href: '/' },
    {
      name: '学院概况',
      href: '/about/intro',
      children: [
        { name: '学院简介', href: '/about/intro' },
        { name: '理事会', href: '/about/council' },
        { name: '现任领导', href: '/about/leaders' },
        { name: '机构设置', href: '/about/organization' },
      ],
    },
    {
      name: '招生信息',
      href: '/admission/master',
      children: [
        { name: '工程硕士', href: '/admission/master' },
        { name: '工程博士', href: '/admission/doctor' },
      ],
    },
    {
      name: '科学研究',
      href: '/research/institutions',
      children: [
        { name: '科研机构', href: '/research/institutions' },
        { name: '科研动态', href: '/research/news' },
        { name: '成果转化', href: '/research/transfer' },
      ],
    },
    {
      name: '师资队伍',
      href: '/faculty/internal',
      children: [
        { name: '校内培养导师', href: '/faculty/internal' },
        { name: '企业培养导师', href: '/faculty/enterprise' },
      ],
    },
    {
      name: '校企合作',
      href: '/cooperation/news',
      children: [
        { name: '合作动态', href: '/cooperation/news' },
        { name: '合作单位', href: '/cooperation/partner' },
      ],
    },
    {
      name: '学生工作',
      href: '/students/management',
      children: [
        { name: '学生管理', href: '/students/management' },
        { name: '学生活动', href: '/students/activities' },
        { name: '学生风采', href: '/students/showcase' },
      ],
    },
    {
      name: '管理文件',
      href: '/documents/policies',
      children: [
        { name: '政策文件', href: '/documents/policies' },
        { name: '资料下载', href: '/documents/downloads' },
      ],
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSearchOpen(false);
      }
    };

    if (searchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [searchOpen]);

  // ✅ 修复滚动闪动问题
  useEffect(() => {
    let ticking = false;
    const threshold = 80; // 提高阈值，避免在导航条高度变化时触发
    const hysteresis = 20; // 滞后值，防止在阈值附近反复切换

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;

          // 添加滞后逻辑：向下滚动超过阈值+滞后值才收缩，向上滚动低于阈值-滞后值才展开
          if (!scrolled && scrollY > threshold + hysteresis) {
            setScrolled(true);
          } else if (scrolled && scrollY < threshold - hysteresis) {
            setScrolled(false);
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]); // ✅ 添加 scrolled 依赖

  return (
    <header className={`bg-[#003d82] shadow-md sticky top-0 z-50 transition-all duration-300`}>
      <div className="max-w-[1600px] mx-auto px-2">
        <div className={`flex items-center transition-all duration-300 ${scrolled ? 'h-16' : 'h-28'}`}>
          <Link href="/" className="flex items-center flex-shrink-0 -ml-6 mr-4">
            <img
              src="/images/logo.png"
              alt="Logo"
              className={`w-auto object-contain transition-all duration-300 ${scrolled ? 'h-12' : 'h-20'}`}
            />
          </Link>

          <nav className="hidden lg:flex flex-1 justify-between items-center">
            {navItems.map((item) => (
              <div
                key={item.name}
                className="relative group"
                onMouseEnter={() => setActiveDropdown(item.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="px-3 py-2 text-white text-lg font-medium hover:bg-white/10 rounded transition-colors inline-block whitespace-nowrap"
                >
                  {item.name}
                </Link>
                {item.children && activeDropdown === item.name && (
                  <div className="absolute left-0 top-full mt-0 bg-[#003d82]/70 backdrop-blur-md shadow-lg rounded-b-md min-w-[148px] py-2">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className="block px-4 py-2 text-base text-white hover:bg-white/20"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="relative flex-shrink-0 mr-2" ref={searchRef}>
            <button
              className="hidden lg:block px-4 py-2 text-white hover:text-gray-200"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {searchOpen && (
              <div className="absolute right-0 top-full mt-2 bg-white shadow-lg rounded-md p-4 w-80">
                <input
                  type="text"
                  placeholder="请输入搜索内容..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button className="mt-2 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
                  搜索
                </button>
              </div>
            )}
          </div>

          <button
            className="lg:hidden p-2 text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden pb-4">
            {navItems.map((item) => (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className="block px-4 py-2 text-white hover:bg-white/10"
                >
                  {item.name}
                </Link>
                {item.children && (
                  <div className="pl-4">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-gray-200 hover:bg-white/10"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
