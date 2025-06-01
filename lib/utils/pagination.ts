// ===================================
// Pagination Utilities
// ===================================

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  offset: number;
  from: number;
  to: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

/**
 * ページネーション計算のユーティリティ
 */
export function calculatePagination(
  currentPage: number,
  pageSize: number,
  totalItems: number
): PaginationInfo {
  const totalPages = Math.ceil(totalItems / pageSize);
  const offset = (currentPage - 1) * pageSize;
  const from = offset;
  const to = Math.min(offset + pageSize - 1, totalItems - 1);

  return {
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    offset,
    from,
    to,
  };
}

/**
 * ページ番号の範囲を計算（省略記号含む）
 */
export function calculatePageRange(
  currentPage: number,
  totalPages: number,
  delta: number = 2
): (number | string)[] {
  const range = [];
  const rangeWithDots = [];

  // 現在ページの前後に表示するページ範囲を計算
  for (
    let i = Math.max(2, currentPage - delta);
    i <= Math.min(totalPages - 1, currentPage + delta);
    i++
  ) {
    range.push(i);
  }

  // 最初のページ
  if (currentPage - delta > 2) {
    rangeWithDots.push(1, '...');
  } else {
    rangeWithDots.push(1);
  }

  // 中間のページ範囲
  rangeWithDots.push(...range);

  // 最後のページ
  if (currentPage + delta < totalPages - 1) {
    rangeWithDots.push('...', totalPages);
  } else if (totalPages > 1) {
    rangeWithDots.push(totalPages);
  }

  // 重複削除
  return Array.from(new Set(rangeWithDots));
}

/**
 * ページサイズオプションの標準設定
 */
export const DEFAULT_PAGE_SIZES = [6, 12, 24, 48] as const;

/**
 * Supabaseクエリ用のレンジ計算
 */
export function calculateSupabaseRange(page: number, pageSize: number): [number, number] {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return [from, to];
}

/**
 * ページネーション情報の表示用テキスト生成
 */
export function generatePaginationText(
  currentPage: number,
  pageSize: number,
  totalItems: number
): string {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  
  return `${totalItems.toLocaleString()}件中 ${startItem.toLocaleString()} - ${endItem.toLocaleString()}件目を表示`;
} 