'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarItem {
  name: string;
  href: string;
}

interface SidebarProps {
  title: string;
  items: SidebarItem[];
}

export default function Sidebar({ title, items }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="site-sidebar">
      <div className="site-sidebar-heading">
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <nav aria-label={`${title}栏目`} className="site-sidebar-nav">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`site-sidebar-link ${isActive ? 'is-active' : ''}`}
            >
              <span>{item.name}</span><span aria-hidden="true">↗</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

