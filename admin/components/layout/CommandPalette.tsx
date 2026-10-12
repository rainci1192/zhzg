'use client';

import { useReducer, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight } from 'lucide-react';

interface MenuItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  group?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
}

// 使用 reducer 管理状态，避免在 effect 中调用 setState
interface State {
  query: string;
  selectedIndex: number;
}

type Action =
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'SET_SELECTED_INDEX'; payload: number }
  | { type: 'RESET' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_QUERY':
      return { ...state, query: action.payload, selectedIndex: 0 };
    case 'SET_SELECTED_INDEX':
      return { ...state, selectedIndex: action.payload };
    case 'RESET':
      return { query: '', selectedIndex: 0 };
    default:
      return state;
  }
}

export default function CommandPalette({ isOpen, onClose, menuItems }: CommandPaletteProps) {
  const [state, dispatch] = useReducer(reducer, { query: '', selectedIndex: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 模糊搜索过滤
  const filteredItems = useMemo(() => {
    if (!state.query.trim()) {
      return menuItems.slice(0, 8);
    }

    const lowerQuery = state.query.toLowerCase();
    return menuItems.filter((item) => {
      const titleMatch = item.title.toLowerCase().includes(lowerQuery);
      const groupMatch = item.group?.toLowerCase().includes(lowerQuery);
      return titleMatch || groupMatch;
    });
  }, [state.query, menuItems]);

  // 当对话框打开时重置状态并聚焦
  useEffect(() => {
    if (isOpen) {
      dispatch({ type: 'RESET' });
      // 使用 setTimeout 确保在下一个事件循环中聚焦
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [isOpen]);

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          dispatch({
            type: 'SET_SELECTED_INDEX',
            payload: (state.selectedIndex + 1) % filteredItems.length,
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          dispatch({
            type: 'SET_SELECTED_INDEX',
            payload: (state.selectedIndex - 1 + filteredItems.length) % filteredItems.length,
          });
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredItems[state.selectedIndex]) {
            router.push(filteredItems[state.selectedIndex].href);
            onClose();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, state.selectedIndex, router, onClose]);

  // 点击背景关闭
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-[20vh] px-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
        {/* 搜索输入 */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={state.query}
            onChange={(e) => dispatch({ type: 'SET_QUERY', payload: e.target.value })}
            placeholder="搜索菜单功能..."
            className="flex-1 outline-none text-base placeholder:text-gray-400"
          />
          <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded">
            ESC
          </kbd>
        </div>

        {/* 搜索结果 */}
        <div className="max-h-[400px] overflow-y-auto">
          {filteredItems.length > 0 ? (
            <ul className="py-2">
              {filteredItems.map((item, index) => {
                const Icon = item.icon;
                const isSelected = index === state.selectedIndex;
                return (
                  <li key={item.href}>
                    <button
                      onClick={() => {
                        router.push(item.href);
                        onClose();
                      }}
                      onMouseEnter={() => dispatch({ type: 'SET_SELECTED_INDEX', payload: index })}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        isSelected
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{item.title}</div>
                        {item.group && (
                          <div className="text-xs text-gray-500 truncate">{item.group}</div>
                        )}
                      </div>
                      {isSelected && <ArrowRight className="w-4 h-4 flex-shrink-0" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="py-12 text-center text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>未找到匹配的菜单</p>
            </div>
          )}
        </div>

        {/* 底部提示 */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded">↓</kbd>
              导航
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded">Enter</kbd>
              选择
            </span>
          </div>
          <span>共 {filteredItems.length} 项</span>
        </div>
      </div>
    </div>
  );
}
