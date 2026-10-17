'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const isHome = usePathname() === '/';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLElement>(null);

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

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleClickOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!menuButtonRef.current?.contains(target) && !menuPanelRef.current?.contains(target)) {
        setMobileMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    let ticking = false;
    const threshold = 80;
    const hysteresis = 20;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;

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
  }, [scrolled]);

  return (
    <header className={`z-50 w-full transition-all duration-300 ${isHome ? `fixed left-0 top-0 ${scrolled ? 'bg-[#082f62]/95 shadow-lg backdrop-blur-xl' : 'bg-gradient-to-b from-[#071d37]/85 to-transparent'}` : 'sticky top-0 bg-[#003d82] shadow-md'}`}>
      <div className="max-w-[1600px] mx-auto px-2">
        <div className={`flex items-center transition-all duration-300 ${scrolled ? 'h-16' : 'h-28'}`}>
          <Link
            href="/"
            className="flex items-center flex-shrink-0 w-[min(60vw,460px)] lg:w-[clamp(280px,27vw,460px)] 2xl:w-[460px] mr-3"
          >
            <img
              src="/images/logo.png"
              alt="Logo"
              className={`w-full h-auto object-contain transition-all duration-300 ${scrolled ? 'max-h-12' : 'max-h-20'}`}
            />
          </Link>

          <nav className="hidden lg:flex flex-1 min-w-0 justify-between items-center">
            {navItems.map((item) => (
              <div
                key={item.name}
                className="relative group"
                onMouseEnter={() => setActiveDropdown(item.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="home-nav-link px-1.5 xl:px-2 2xl:px-3 py-2 text-white text-base 2xl:text-lg font-medium rounded transition-colors inline-block whitespace-nowrap"
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
              type="button"
              aria-label="打开搜索"
              className="px-4 py-2 text-white hover:text-gray-200"
              onClick={() => {
                setMobileMenuOpen(false);
                setSearchOpen(!searchOpen);
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {searchOpen && (
              <form
                role="search"
                onSubmit={(event) => {
                  event.preventDefault();
                  const query = searchQuery.trim();
                  if (!query) return;
                  router.push(`/search?q=${encodeURIComponent(query)}`);
                  setSearchOpen(false);
                }}
                className="absolute right-0 top-full mt-2 bg-white shadow-lg rounded-md p-4 w-[min(20rem,calc(100vw-2rem))]"
              >
                <input
                  type="text"
                  name="q"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="请输入搜索内容..."
                  aria-label="搜索文章"
                  maxLength={100}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="mt-2 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  搜索
                </button>
              </form>
            )}
          </div>

          <button
            ref={menuButtonRef}
            type="button"
            aria-label={mobileMenuOpen ? '关闭导航菜单' : '打开导航菜单'}
            aria-expanded={mobileMenuOpen}
            aria-controls={mobileMenuOpen ? 'site-mobile-nav' : undefined}
            className="lg:hidden p-2 text-white"
            onClick={() => {
              setSearchOpen(false);
              setMobileMenuOpen(!mobileMenuOpen);
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav
          ref={menuPanelRef}
          id="site-mobile-nav"
          aria-label="窄屏网站导航"
          className={`absolute left-2 top-full z-50 lg:hidden w-[min(22rem,calc(100vw-1rem))] ${scrolled ? 'max-h-[calc(100dvh-4rem)]' : 'max-h-[calc(100dvh-7rem)]'} overflow-y-auto overscroll-contain rounded-b-lg border border-gray-200 bg-white p-3 text-gray-800 shadow-2xl`}
        >
          {navItems.map((item) => (
            item.children ? (
              <details key={item.name} className="border-b border-gray-100 last:border-0">
                <summary className="cursor-pointer rounded px-3 py-3 font-medium hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">
                  {item.name}
                </summary>
                <div className="pb-2 pl-4">
                  {item.children.map((child) => (
                    <Link
                      key={child.name}
                      href={child.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block rounded px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              </details>
            ) : (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded border-b border-gray-100 px-3 py-3 font-medium hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
              >
                {item.name}
              </Link>
            )
          ))}
        </nav>
      )}
    </header>
  );
}
