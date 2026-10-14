/**
 * localStorage 工具函数
 */

const STORAGE_KEYS = {
  SIDEBAR_EXPANDED: 'sidebar_expanded_groups',
  RECENT_PAGES: 'recent_pages',
} as const;

function getRecentPagesStorageKey(userKey: string): string {
  return `${STORAGE_KEYS.RECENT_PAGES}:${encodeURIComponent(userKey)}`;
}

export const storage = {
  // 保存侧边栏展开状态
  setSidebarExpanded(groups: Set<string>) {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.SIDEBAR_EXPANDED, JSON.stringify([...groups]));
      }
    } catch (error) {
      console.error('保存侧边栏状态失败:', error);
    }
  },

  // 获取侧边栏展开状态
  getSidebarExpanded(): Set<string> {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEYS.SIDEBAR_EXPANDED);
        if (saved) {
          return new Set(JSON.parse(saved));
        }
      }
    } catch (error) {
      console.error('读取侧边栏状态失败:', error);
    }
    return new Set();
  },

  // 保存最近访问页面
  addRecentPage(userKey: string, page: { title: string; href: string; icon: string }) {
    try {
      if (typeof window !== 'undefined' && userKey) {
        const storageKey = getRecentPagesStorageKey(userKey);
        const saved = localStorage.getItem(storageKey);
        let recent: typeof page[] = saved ? JSON.parse(saved) : [];
        
        // 移除重复项
        recent = recent.filter((p) => p.href !== page.href);
        
        // 添加到开头
        recent.unshift(page);
        
        // 只保留最近 5 个
        recent = recent.slice(0, 5);
        
        localStorage.setItem(storageKey, JSON.stringify(recent));
      }
    } catch (error) {
      console.error('保存最近访问失败:', error);
    }
  },

  // 获取最近访问页面
  getRecentPages(userKey: string): Array<{ title: string; href: string; icon: string }> {
    try {
      if (typeof window !== 'undefined' && userKey) {
        const saved = localStorage.getItem(getRecentPagesStorageKey(userKey));
        return saved ? JSON.parse(saved) : [];
      }
    } catch (error) {
      console.error('读取最近访问失败:', error);
    }
    return [];
  },

  // 清空最近访问
  clearRecentPages(userKey: string) {
    try {
      if (typeof window !== 'undefined' && userKey) {
        localStorage.removeItem(getRecentPagesStorageKey(userKey));
      }
    } catch (error) {
      console.error('清空最近访问失败:', error);
    }
  },
};
