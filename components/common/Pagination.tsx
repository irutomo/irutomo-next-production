'use client';

// ===================================
// Generic Pagination Component
// ===================================

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { 
  calculatePageRange, 
  generatePaginationText, 
  DEFAULT_PAGE_SIZES 
} from '@/lib/utils/pagination';
import { updatePageParam, updatePageSizeParam } from '@/lib/utils/url-params';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  showPageSizeSelector?: boolean;
  pageSizeOptions?: readonly number[];
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  showPageSizeSelector = true,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  className = '',
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updatePage = useCallback((page: number) => {
    const params = updatePageParam(searchParams, page);
    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

  const updatePageSize = useCallback((newPageSize: number) => {
    const params = updatePageSizeParam(searchParams, newPageSize, true);
    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

  if (totalPages <= 1 && !showPageSizeSelector) {
    return null;
  }

  const pageNumbers = calculatePageRange(currentPage, totalPages);
  const paginationText = generatePaginationText(currentPage, pageSize, totalItems);

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* ページネーションコントロール */}
      {totalPages > 1 && (
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
      )}

      {/* ページ情報 */}
      <div className="text-sm text-gray-600 text-center">
        <span>{paginationText}</span>
        {totalPages > 1 && (
          <>
            <span className="mx-2">•</span>
            <span>ページ {currentPage} / {totalPages}</span>
          </>
        )}
      </div>

      {/* ページサイズ変更 */}
      {showPageSizeSelector && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>表示件数:</span>
          {pageSizeOptions.map((size) => (
            <button
              key={size}
              onClick={() => updatePageSize(size)}
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
      )}
    </div>
  );
} 