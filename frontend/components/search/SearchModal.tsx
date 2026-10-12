'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { searchAll, SearchResultItem } from '@/lib/api';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  article: '文章',
  policy: '政策文件',
  'student-document': '学生文档',
  'research-transfer': '成果转化',
  supervisor: '导师',
};

const TYPE_COLORS: Record<string, string> = {
  article: 'bg-blue-100 text-blue-800',
  policy: 'bg-green-100 text-green-800',
  'student-document': 'bg-purple-100 text-purple-800',
  'research-transfer': 'bg-orange-100 text-orange-800',
  supervisor: 'bg-pink-100 text-pink-800',
};

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // 热门搜索
  const hotSearches = [
    '招生简章',
    '导师介绍',
    '学生管理',
    '科研成果',
    '政策文件',
  ];

  useEffect(() => {
    if (isOpen) {
      // 加载搜索历史
      const history = localStorage.getItem('searchHistory');
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
      // 聚焦输入框
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      // 关闭时清空
      setKeyword('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (keyword.trim() === '') {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const result = await searchAll(keyword, 1, 5);
      setResults(result.data);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword]);

  const handleSearch = (searchKeyword: string) => {
    if (searchKeyword.trim() === '') return;

    // 保存搜索历史
    const newHistory = [
      searchKeyword,
      ...searchHistory.filter((h) => h !== searchKeyword),
    ].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));

    // 跳转到搜索结果页
    router.push(`/search?q=${encodeURIComponent(searchKeyword)}`);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(keyword);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* 搜索框容器 */}
      <div className="relative min-h-screen flex items-start justify-center p-4 pt-20">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl">
          {/* 搜索输入框 */}
          <div className="flex items-center gap-4 p-6 border-b">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="搜索文章、政策、导师..."
              className="flex-1 text-lg outline-none"
            />
            {keyword && (
              <button
                onClick={() => setKeyword('')}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="text-sm">ESC</span>
            </button>
          </div>

          {/* 搜索结果或建议 */}
          <div className="max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">搜索中...</div>
            ) : keyword.trim() !== '' && results.length > 0 ? (
              // 搜索结果
              <div className="p-4">
                <div className="text-sm text-gray-500 mb-3 px-2">
                  找到 {results.length} 条结果
                </div>
                <div className="space-y-2">
                  {results.map((result) => (
                    <a
                      key={`${result.type}-${result.id}`}
                      href={result.url}
                      onClick={onClose}
                      className="block p-4 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`px-2 py-0.5 text-xs rounded ${
                            TYPE_COLORS[result.type]
                          }`}
                        >
                          {TYPE_LABELS[result.type]}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 line-clamp-1">
                            {result.title}
                          </h3>
                          {result.summary && (
                            <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                              {result.summary}
                            </p>
                          )}
                          {result.publish_time && (
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(result.publish_time).toLocaleDateString('zh-CN')}
                            </p>
                          )}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
                <button
                  onClick={() => handleSearch(keyword)}
                  className="w-full mt-4 py-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  查看全部结果 →
                </button>
              </div>
            ) : keyword.trim() !== '' && results.length === 0 ? (
              // 无结果
              <div className="p-8 text-center text-gray-500">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p>未找到相关结果</p>
                <p className="text-sm mt-2">试试其他关键词</p>
              </div>
            ) : (
              // 搜索建议
              <div className="p-6 space-y-6">
                {/* 搜索历史 */}
                {searchHistory.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-700">搜索历史</h3>
                      <button
                        onClick={clearHistory}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        清空
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {searchHistory.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setKeyword(item);
                            handleSearch(item);
                          }}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 热门搜索 */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">热门搜索</h3>
                  <div className="flex flex-wrap gap-2">
                    {hotSearches.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setKeyword(item);
                          handleSearch(item);
                        }}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full text-sm transition-colors"
                      >
                        🔥 {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
