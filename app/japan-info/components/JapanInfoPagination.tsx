'use client';

// ===================================
// Japan Info Pagination Component
// ===================================

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

interface JapanInfoPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export default function JapanInfoPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
}: JapanInfoPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updatePage = useCallback((page: number) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

  // ページ範囲の計算
  const getPageNumbers = () => {
    const delta = 2; // 現在ページの前後に表示するページ数
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    // 重複削除
    return Array.from(new Set(rangeWithDots));
  };

  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* ページネーションコントロール */}
      <nav className="flex items-center justify-center space-x-1">
        {/* 前のページ */}
        <button
          onClick={() => updatePage(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentPage === 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          ← 前
        </button>

        {/* ページ番号 */}
        {pageNumbers.map((pageNum, index) => {
          if (pageNum === '...') {
            return (
              <span
                key={`dots-${index}`}
                className="px-3 py-2 text-gray-400"
              >
                ...
              </span>
            );
          }

          const page = pageNum as number;
          const isCurrentPage = page === currentPage;

          return (
            <button
              key={page}
              onClick={() => updatePage(page)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isCurrentPage
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          );
        })}

        {/* 次のページ */}
        <button
          onClick={() => updatePage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentPage === totalPages
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          次 →
        </button>
      </nav>

      {/* ページ情報 */}
      <div className="text-sm text-gray-600 text-center">
        <span>
          {totalItems.toLocaleString()}件中 {((currentPage - 1) * pageSize + 1).toLocaleString()} - {Math.min(currentPage * pageSize, totalItems).toLocaleString()}件目を表示
        </span>
        <span className="mx-2">•</span>
        <span>
          ページ {currentPage} / {totalPages}
        </span>
      </div>

      {/* ページサイズ変更（オプション） */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <span>表示件数:</span>
        {[6, 12, 24, 48].map((size) => (
          <button
            key={size}
            onClick={() => {
              const params = new URLSearchParams(searchParams?.toString() || '');
              params.set('pageSize', size.toString());
              params.delete('page'); // ページサイズ変更時はページをリセット
              router.push(`?${params.toString()}`);
            }}
            className={`px-2 py-1 rounded transition-colors ${
              pageSize === size
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'hover:bg-gray-100'
            }`}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
} 