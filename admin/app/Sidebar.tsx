'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FolderTree, 
  FileText, 
  Download, 
  Image, 
  Link as LinkIcon, 
  Settings, 
  Users, 
  CheckCircle, 
  Activity, 
  Database 
} from 'lucide-react';

const menuItems = [
  { name: '仪表盘', href: '/dashboard', icon: LayoutDashboard },
  { name: '栏目管理', href: '/dashboard/categories', icon: FolderTree },
  { name: '文章管理', href: '/dashboard/articles', icon: FileText },
  
  
  { name: '页面管理', href: '/dashboard/pages',  icon: FileText },
  { name: '资料下载', href: '/dashboard/attachments', icon: Download },
  { name: 'Banner 管理', href: '/dashboard/banners', icon: Image },
  { name: '友情链接', href: '/dashboard/links', icon: LinkIcon },
  { name: '站点设置', href: '/dashboard/settings', icon: Settings },
  { name: '用户与角色', href: '/dashboard/users', icon: Users },
  { name: '审核中心', href: '/dashboard/review', icon: CheckCircle },
  { name: '操作日志', href: '/dashboard/logs', icon: Activity },
  { name: '备份管理', href: '/dashboard/backup', icon: Database },
 

];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Logo */}
      <div className="px-6 py-8 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">吉</div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">卓越工程师学院</h1>
            <p className="text-xs text-gray-400">后台管理系统</p>
          </div>
        </div>
      </div>

      {/* 菜单 */}
      <nav className="flex-1 px-3 py-6 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200 text-xs text-gray-400 text-center">
        v1.0 • Strapi 驱动
      </div>
    </div>
  );
}
