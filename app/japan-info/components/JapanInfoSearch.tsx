'use client';

// ===================================
// Japan Info Search Component
// ===================================

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// Heroicons alternatives using emoji and SVG
const MagnifyingGlassIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const XMarkIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface JapanInfoSearchProps {
  initialQuery?: string;
  initialLocation?: string;
  initialTags?: string[];
}

export default function JapanInfoSearch({
  initialQuery = '',
  initialLocation = '',
  initialTags = [],
}: JapanInfoSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // 人気のタグ
  const popularTags = [
    '東京', '大阪', '京都', '北海道', '沖縄',
    '温泉', 'グルメ', '桜', '紅葉', '祭り',
    '城', '神社', '寺院', '美術館', '自然',
  ];

  const updateSearchParams = useCallback((newParams: Record<string, string | string[] | undefined>) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    
    // 既存のパラメータをクリア
    params.delete('query');
    params.delete('location');
    params.delete('tags');
    params.delete('page'); // 検索時はページをリセット
    
    // 新しいパラメータを設定
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.set(key, value);
        }
      }
    });
    
    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

  const handleSearch = () => {
    updateSearchParams({
      query: query.trim() || undefined,
      location: location.trim() || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
    });
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleClear = () => {
    setQuery('');
    setLocation('');
    setSelectedTags([]);
    router.push('/japan-info');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      {/* メイン検索バー */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400">
            <MagnifyingGlassIcon />
          </div>
          <input
            type="text"
            placeholder="キーワードで検索（観光地、グルメ、体験など）"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            検索
          </button>
          
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            詳細
          </button>
          
          {(query || location || selectedTags.length > 0) && (
            <button
              onClick={handleClear}
              className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
            >
              <div className="h-5 w-5">
                <XMarkIcon />
              </div>
            </button>
          )}
        </div>
      </div>

      {/* 詳細検索オプション */}
      {showAdvanced && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          {/* 地域検索 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              地域・場所で絞り込み
            </label>
            <input
              type="text"
              placeholder="例: 東京、大阪、京都..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* タグ選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリで絞り込み
            </label>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 現在の検索条件表示 */}
      {(query || location || selectedTags.length > 0) && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600">検索条件:</span>
          
          {query && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              「{query}」
            </span>
          )}
          
          {location && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
              📍 {location}
            </span>
          )}
          
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
            >
              🏷️ {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
} 