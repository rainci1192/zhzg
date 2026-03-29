'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
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
      name: '校企合作',
      href: '/cooperation/projects',
      children: [
        { name: '合作项目', href: '/cooperation/projects' },
        { name: '合作单位', href: '/cooperation/partners' },
        { name: '理事单位动态', href: '/cooperation/news' },
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
      name: '师资队伍',
      href: '/faculty/internal',
      children: [
        { name: '校内导师', href: '/faculty/internal' },
        { name: '企业导师', href: '/faculty/enterprise' },
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

  return (
    <header className="bg-[#003d82] shadow-md sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-2">
        <div className="flex items-center h-28">
          <Link href="/" className="flex items-center flex-shrink-0 -ml-4">
            <img
              src="/images/logo.png"
              alt="Logo"
              className="h-20 w-auto object-contain"
            />
          </Link>

          <nav className="hidden lg:flex space-x-2 flex-1 justify-center ml-12">
            {navItems.map((item) => (
              <div
                key={item.name}
                className="relative group"
                onMouseEnter={() => setActiveDropdown(item.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="px-5 py-2 text-white text-lg font-medium hover:bg-white/10 rounded transition-colors inline-block whitespace-nowrap"
                >
                  {item.name}
                </Link>
                {item.children && activeDropdown === item.name && (
                  <div className="absolute left-0 top-full mt-0 bg-[#003d82]/70 backdrop-blur-md shadow-lg rounded-b-md min-w-[160px] py-2">
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

