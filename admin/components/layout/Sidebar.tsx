'use client';

import { strapiFetch } from '@/lib/strapi-fetch';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { storage } from '@/lib/storage';
import CommandPalette from './CommandPalette';
import { usePermission } from '@/hooks/usePermission';
import { useAuth } from '@/contexts/AuthContext';

import { 
  LayoutDashboard, 
  FolderTree, 
  FileText, 
  File, 
  Image, 
  Link as LinkIcon, 
  Settings, 
  Users, 
  ShieldCheck, 
  History, 
  Database,
  UserCog,
  Building2,
  Microscope,
  TrendingUp,
  GraduationCap,
  BookOpen,
  Award,
  Download,
  Newspaper,
  Handshake,
  ChevronDown,
  ChevronRight,
  Clock,
  Search,
  Shield,
  Eye
} from 'lucide-react';

interface MenuItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  module?: string;
  requiredActions?: string[];
  children?: MenuItem[];
}

interface PermissionRecord {
  permission_module?: {
    name?: string;
  };
  allowed_actions?: Array<{
    name?: string;
  }>;
}

const menuConfig: MenuItem[] = [
  {
    title: '仪表盘',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: '新闻动态',
    icon: Newspaper,
    children: [
      { 
        title: '文章管理', 
        href: '/dashboard/articles', 
        icon: FileText,
        module: 'articles',
        requiredActions: ['view']
      },
      { 
        title: '分类管理', 
        href: '/dashboard/categories', 
        icon: FolderTree,
        module: 'categories',
        requiredActions: ['view']
      },
    ],
  },
  {
    title: '学院概况',
    icon: Building2,
    children: [
      { 
        title: '单页管理', 
        href: '/dashboard/pages', 
        icon: File,
        module: 'pages',
        requiredActions: ['view']
      },
      { 
        title: '现任领导', 
        href: '/dashboard/leaders', 
        icon: UserCog,
        module: 'leaders',
        requiredActions: ['view']
      },
      { 
        title: '机构设置', 
        href: '/dashboard/departments', 
        icon: Building2,
        module: 'departments',
        requiredActions: ['view']
      },
    ],
  },
  {
    title: '科学研究',
    icon: Microscope,
    children: [
      { 
        title: '科研机构', 
        href: '/dashboard/research-institutions', 
        icon: Microscope,
        module: 'research_institutions',
        requiredActions: ['view']
      },
      { 
        title: '成果转化', 
        href: '/dashboard/research-transfers', 
        icon: TrendingUp,
        module: 'research_transfers',
        requiredActions: ['view']
      },
    ],
  },
  {
    title: '师资队伍',
    icon: GraduationCap,
    children: [
      { 
        title: '培养导师', 
        href: '/dashboard/supervisors', 
        icon: GraduationCap,
        module: 'supervisors',
        requiredActions: ['view']
      },
    ],
  },
  {
    title: '校企合作',
    icon: Handshake,
    children: [
      { 
        title: '合作单位', 
        href: '/dashboard/partners', 
        icon: Handshake,
        module: 'partners',
        requiredActions: ['view']
      },
    ],
  },
  {
    title: '学生工作',
    icon: BookOpen,
    children: [
      { 
        title: '学生管理', 
        href: '/dashboard/student-documents', 
        icon: BookOpen,
        module: 'student_documents',
        requiredActions: ['view']
      },
      { 
        title: '学生风采', 
        href: '/dashboard/student-showcases', 
        icon: Award,
        module: 'student_showcases',
        requiredActions: ['view']
      },
    ],
  },
  {
    title: '管理文件',
    icon: FileText,
    children: [
      { 
        title: '政策文件', 
        href: '/dashboard/policy-documents', 
        icon: FileText,
        module: 'policy_documents',
        requiredActions: ['view']
      },
      { 
        title: '资料下载', 
        href: '/dashboard/download-files', 
        icon: Download,
        module: 'download_files',
        requiredActions: ['view']
      },
    ],
  },
  {
    title: '网站设置',
    icon: Settings,
    children: [
      { 
        title: 'Banner 管理', 
        href: '/dashboard/banners', 
        icon: Image,
        module: 'banners',
        requiredActions: ['view']
      },
      { 
        title: '友情链接', 
        href: '/dashboard/links', 
        icon: LinkIcon,
        module: 'links',
        requiredActions: ['view']
      },
      { 
        title: '站点设置', 
        href: '/dashboard/settings', 
        icon: Settings,
        module: 'site_settings',
        requiredActions: ['view']
      },
    ],
  },
  {
    title: '系统管理',
    icon: ShieldCheck,
    children: [
      { 
        title: '用户管理', 
        href: '/dashboard/users', 
        icon: Users,
        module: 'users',
        requiredActions: ['view']
      },
      { 
        title: '角色管理', 
        href: '/dashboard/roles', 
        icon: Shield,
        module: 'backend_roles',
        requiredActions: ['view']
      },
      { 
        title: '审核中心', 
        href: '/dashboard/review', 
        icon: ShieldCheck,
        module: 'review',
        requiredActions: ['view']
      },
      { 
        title: '操作日志', 
        href: '/dashboard/logs', 
        icon: History,
        module: 'logs',
        requiredActions: ['view']
      },
      { 
        title: '备份管理', 
        href: '/dashboard/backup', 
        icon: Database,
        module: 'backup',
        requiredActions: ['view']
      },
    ],
  },
];

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

const getIconName = (icon: React.ComponentType<{ className?: string }>): string => {
  return icon.name || 'FileText';
};

const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    FileText,
    FolderTree,
    File,
    UserCog,
    Building2,
    Microscope,
    TrendingUp,
    GraduationCap,
    BookOpen,
    Award,
    Download,
    Image,
    LinkIcon,
    Settings,
    Users,
    ShieldCheck,
    History,
    Database,
    Handshake,
    Shield,
    Eye,
  };
  return iconMap[iconName] || FileText;
};

function getRoleName(role?: string): string {
  const roleNames: Record<string, string> = {
    'super_admin': '超级管理员',
    'admin': '管理员',
    'editor': '编辑',
    'reviewer': '审核员',
    'article_level1_reviewer': '一级审核',
    'article_level2_reviewer': '二级审核',
    'level1_reviewer': '一级审核',
    'level2_reviewer': '二级审核',
    'reviewer_level1': '一级审核',
    'reviewer_level2': '二级审核',
    'viewer': '查看者',
  };
  return role ? (roleNames[role] || '未知') : '未知';
}

export default function Sidebar() {
  const pathname = usePathname();
  const { canAccessPath, userRole } = usePermission();
  const { user } = useAuth();
  const recentPagesUserKey = user
    ? `backend-admin:${user.documentId || user.id || user.email.trim().toLowerCase()}`
    : null;

  const [userPermissions, setUserPermissions] = useState<{
    modules: Set<string>;
    actions: Map<string, Set<string>>;
  }>({
    modules: new Set(),
    actions: new Map(),
  });
  const [permissionsLoading, setPermissionsLoading] = useState(true);

  useEffect(() => {
  async function loadUserPermissions() {
    console.log('=== Sidebar 加载权限开始 ===');
    console.log('user 对象:', user);

    // ✅ 修复:直接使用 user.roleId
    const roleId = user?.roleId || 
      (user?.role && typeof user.role === 'object' && 'id' in user.role 
        ? (user.role as { id: number }).id 
        : null);

    console.log('提取的 roleId:', roleId);

    if (!roleId) {
      console.log('❌ 没有 roleId,跳过权限加载');
      setPermissionsLoading(false);
      return;
    }

    try {
      const url = `${STRAPI_URL}/api/role-permissions?filters[backend_role][id][$eq]=${roleId}&populate=permission_module&populate=allowed_actions`;
      console.log('请求 URL:', url);

      const response = await strapiFetch(url);

      if (!response.ok) {
        throw new Error('加载权限失败');
      }

      const data = await response.json();
      console.log('权限数据返回:', data);

      const records: PermissionRecord[] = data.data || [];
      console.log('权限记录数:', records.length);

      const modules = new Set<string>();
      const actions = new Map<string, Set<string>>();

      records.forEach((record) => {
        const moduleName = record.permission_module?.name;
        console.log('处理模块:', moduleName);

        if (!moduleName) return;

        modules.add(moduleName);

        const moduleActions = Array.isArray(record.allowed_actions)
          ? record.allowed_actions
          : [];

        if (!actions.has(moduleName)) {
          actions.set(moduleName, new Set());
        }

        moduleActions.forEach((action) => {
          if (action?.name) {
            console.log(`  - 添加操作: ${moduleName}.${action.name}`);
            actions.get(moduleName)!.add(action.name);
          }
        });
      });

      console.log('最终模块列表:', Array.from(modules));
      console.log('最终操作列表:', Array.from(actions.entries()).map(([k, v]) => ({ 
        module: k, 
        actions: Array.from(v) 
      })));

      setUserPermissions({ modules, actions });
    } catch (error) {
      console.error('❌ 加载权限失败:', error);
    } finally {
      setPermissionsLoading(false);
      console.log('=== Sidebar 加载权限结束 ===');
    }
  }

  loadUserPermissions();
}, [user]);



  const hasModule = useCallback((moduleName?: string) => {
    if (!moduleName) return true;
    return userPermissions.modules.has(moduleName);
  }, [userPermissions.modules]);

  const hasAnyAction = useCallback((moduleName?: string, actionNames?: string[]) => {
    if (!moduleName || !actionNames || actionNames.length === 0) return true;
    
    const moduleActions = userPermissions.actions.get(moduleName);
    if (!moduleActions) return false;

    return actionNames.some((action) => moduleActions.has(action));
  }, [userPermissions.actions]);

  const filterMenuItem = useCallback((item: MenuItem): boolean => {
    // 仪表盘始终可见
    if (item.href === '/dashboard') return true;

    // ✅ 超级管理员拥有所有权限
    if (userRole === 'super_admin') return true;

    // 检查旧的权限系统
    if (item.href && !canAccessPath(item.href)) return false;

    // 检查新的细化权限
    if (item.module) {
      if (!hasModule(item.module)) return false;
      if (item.requiredActions && !hasAnyAction(item.module, item.requiredActions)) {
        return false;
      }
    }

    return true;
  }, [canAccessPath, hasModule, hasAnyAction, userRole]);

  const filteredMenuConfig = useMemo(() => {
    if (permissionsLoading) return [];

    return menuConfig
      .map((group) => {
        if (group.href) {
          return filterMenuItem(group) ? group : null;
        }

        if (group.children) {
          const accessibleChildren = group.children.filter(filterMenuItem);

          if (accessibleChildren.length > 0) {
            return { ...group, children: accessibleChildren };
          }
        }

        return null;
      })
      .filter((item): item is MenuItem => item !== null);
  }, [permissionsLoading, filterMenuItem]);

  const initialExpandedGroups = useMemo(() => {
    const saved = storage.getSidebarExpanded();
    if (saved.size > 0) {
      return saved;
    }

    const expanded = new Set<string>();
    filteredMenuConfig.forEach((group) => {
      if (group.children) {
        const hasActiveChild = group.children.some((child) => child.href === pathname);
        if (hasActiveChild) {
          expanded.add(group.title);
        }
      }
    });
    return expanded;
  }, [pathname, filteredMenuConfig]);

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(initialExpandedGroups);
  const [recentPages, setRecentPages] = useState<Array<{ title: string; href: string; icon: string }>>([]);
  const [recentPagesOwner, setRecentPagesOwner] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const visibleRecentPages = recentPagesOwner === recentPagesUserKey ? recentPages : [];

  const flatMenuItems = useMemo(() => {
    const items: Array<{
      title: string;
      href: string;
      icon: React.ComponentType<{ className?: string }>;
      group?: string;
    }> = [];

    filteredMenuConfig.forEach((group) => {
      if (group.href) {
        items.push({
          title: group.title,
          href: group.href,
          icon: group.icon,
        });
      }
      if (group.children) {
        group.children.forEach((child) => {
          items.push({
            title: child.title,
            href: child.href!,
            icon: child.icon,
            group: group.title,
          });
        });
      }
    });

    return items;
  }, [filteredMenuConfig]);

  useEffect(() => {
    storage.setSidebarExpanded(expandedGroups);
  }, [expandedGroups]);

  useEffect(() => {
    const loadRecent = () => {
      if (!recentPagesUserKey) {
        setRecentPages([]);
        setRecentPagesOwner(null);
        return;
      }

      const pages = storage.getRecentPages(recentPagesUserKey);
      setRecentPages(pages);
      setRecentPagesOwner(recentPagesUserKey);
    };
    loadRecent();
  }, [recentPagesUserKey]);

  useEffect(() => {
    const updateRecent = () => {
      if (!recentPagesUserKey) return;

      let currentPage: { title: string; href: string; icon: string } | null = null;

      for (const group of filteredMenuConfig) {
        if (group.href === pathname) {
          currentPage = {
            title: group.title,
            href: group.href,
            icon: getIconName(group.icon),
          };
          break;
        }
        if (group.children) {
          const child = group.children.find((c) => c.href === pathname);
          if (child) {
            currentPage = {
              title: child.title,
              href: child.href!,
              icon: getIconName(child.icon),
            };
            break;
          }
        }
      }

      if (currentPage && currentPage.href !== '/dashboard') {
        storage.addRecentPage(recentPagesUserKey, currentPage);
        setRecentPages(storage.getRecentPages(recentPagesUserKey));
        setRecentPagesOwner(recentPagesUserKey);
      }
    };

    updateRecent();
  }, [pathname, filteredMenuConfig, recentPagesUserKey]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleGroup = (title: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  };

  const isGroupActive = (group: MenuItem) => {
    if (group.href === pathname) return true;
    if (group.children) {
      return group.children.some((child) => child.href === pathname);
    }
    return false;
  };

  const handleClearRecent = () => {
    if (!recentPagesUserKey) return;
    storage.clearRecentPages(recentPagesUserKey);
    setRecentPages([]);
    setRecentPagesOwner(recentPagesUserKey);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <Link href="/dashboard" className="px-6 py-8 border-b border-gray-200 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
            吉
          </div>
          <div>
            <h1 className="font-bold text-xl text-gray-900">国卓珠海</h1>
            <p className="text-xs text-gray-500 -mt-1">后台管理系统</p>
          </div>
        </div>
      </Link>

      <div className="px-6 py-4 border-b border-gray-200">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm text-gray-600 transition-colors group"
        >
          <Search className="w-4 h-4" />
          <span className="flex-1 text-left">搜索菜单...</span>
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded group-hover:border-gray-300">
            ⌘K
          </kbd>
        </button>

        {user && (
          <div className="mt-3 p-3 bg-gray-50 rounded-xl">
            <div className="text-xs text-gray-500 mb-1">当前角色</div>
            <div className="text-sm font-medium text-gray-900">{getRoleName(userRole)}</div>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-6 overflow-y-auto">
        {visibleRecentPages.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between px-4 mb-2">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                <Clock className="w-3.5 h-3.5" />
                最近访问
              </div>
              <button
                onClick={handleClearRecent}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                清空
              </button>
            </div>
            <ul className="space-y-1">
              {visibleRecentPages.map((page) => {
                const Icon = getIconComponent(page.icon);
                return (
                  <li key={page.href}>
                    <Link
                      href={page.href}
                      className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all ${
                        pathname === page.href
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {page.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="h-px bg-gray-200 my-4" />
          </div>
        )}

        {permissionsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-gray-500">加载菜单中...</div>
          </div>
        ) : (
          <ul className="space-y-1">
            {filteredMenuConfig.map((item) => {
              const Icon = item.icon;
              const isExpanded = expandedGroups.has(item.title);
              const isActive = isGroupActive(item);

              if (!item.children) {
                return (
                  <li key={item.title}>
                    <Link
                      href={item.href!}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                        pathname === item.href
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.title}
                    </Link>
                  </li>
                );
              }

              return (
                <li key={item.title}>
                  <button
                    onClick={() => toggleGroup(item.title)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      {item.title}
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>

                  {isExpanded && (
                    <ul className="mt-1 ml-4 space-y-1">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        const isChildActive = pathname === child.href;
                        return (
                          <li key={child.href}>
                            <Link
                              href={child.href!}
                              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${
                                isChildActive
                                  ? 'bg-blue-100 text-blue-700 font-medium'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              }`}
                            >
                              <ChildIcon className="w-4 h-4" />
                              {child.title}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      <div className="p-4 border-t border-gray-200 text-xs text-gray-400 text-center">
        Strapi 5 + Next.js
      </div>

      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        menuItems={flatMenuItems}
      />
    </div>
  );
}
