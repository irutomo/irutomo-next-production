'use client';

// ===================================
// Japan Info Filters Component
// ===================================

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

interface JapanInfoFiltersProps {
  currentSortBy: string;
  currentSortOrder: string;
  currentPageSize: number;
  showPopularOnly: boolean;
}

export default function JapanInfoFilters({
  currentSortBy,
  currentSortOrder,
  currentPageSize,
  showPopularOnly,
}: JapanInfoFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilters = useCallback((updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    
    // ページをリセット
    params.delete('page');
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

  const sortOptions = [
    { value: 'publishedAt', label: '投稿日' },
    { value: 'views', label: '人気順' },
    { value: 'title', label: 'タイトル順' },
  ];

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* 並び替えオプション */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">
              並び替え:
            </label>
            <select
              value={currentSortBy}
              onChange={(e) => updateFilters({ sortBy: e.target.value })}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">
              順序:
            </label>
            <select
              value={currentSortOrder}
              onChange={(e) => updateFilters({ sortOrder: e.target.value })}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="desc">新しい順</option>
              <option value="asc">古い順</option>
            </select>
          </div>
        </div>

        {/* 追加フィルター */}
        <div className="flex items-center space-x-4">
          {/* 人気記事のみ表示 */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showPopularOnly}
              onChange={(e) => updateFilters({ 
                popular: e.target.checked ? 'true' : undefined 
              })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">人気記事のみ</span>
          </label>

          {/* 表示件数 */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">
              表示件数:
            </label>
            <select
              value={currentPageSize}
              onChange={(e) => updateFilters({ pageSize: e.target.value })}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="6">6件</option>
              <option value="12">12件</option>
              <option value="24">24件</option>
              <option value="48">48件</option>
            </select>
          </div>
        </div>
      </div>

      {/* クイックフィルター */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 mr-2">
            クイックフィルター:
          </span>
          
          <button
            onClick={() => updateFilters({ 
              sortBy: 'publishedAt', 
              sortOrder: 'desc',
              popular: undefined 
            })}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              currentSortBy === 'publishedAt' && currentSortOrder === 'desc' && !showPopularOnly
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            最新
          </button>
          
          <button
            onClick={() => updateFilters({ 
              sortBy: 'views', 
              sortOrder: 'desc',
              popular: undefined 
            })}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              currentSortBy === 'views' && currentSortOrder === 'desc' && !showPopularOnly
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            人気順
          </button>
          
          <button
            onClick={() => updateFilters({ 
              popular: 'true',
              sortBy: 'views',
              sortOrder: 'desc'
            })}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              showPopularOnly
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ⭐ 人気記事
          </button>
          
          <button
            onClick={() => updateFilters({ 
              sortBy: 'title', 
              sortOrder: 'asc',
              popular: undefined 
            })}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              currentSortBy === 'title' && currentSortOrder === 'asc' && !showPopularOnly
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ABC順
          </button>
        </div>
      </div>
    </div>
  );
} 