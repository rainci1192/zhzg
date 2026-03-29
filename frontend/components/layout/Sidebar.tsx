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
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <nav className="py-2">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-6 py-3 transition-all duration-300 border-l-4 ${
                isActive
                  ? 'bg-blue-50 border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-gray-700 hover:bg-gray-50 hover:border-blue-300'
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

