// ===================================
// URL Parameters Utilities
// ===================================

import { ReadonlyURLSearchParams } from 'next/navigation';

export interface FilterParams {
  [key: string]: string | string[] | number | boolean | undefined;
}

/**
 * URLSearchParamsを安全に作成する
 */
export function createURLSearchParams(searchParams?: string | ReadonlyURLSearchParams | null): URLSearchParams {
  return new URLSearchParams(searchParams?.toString() || '');
}

/**
 * フィルターパラメータからURLSearchParamsを構築
 */
export function buildSearchParams(filters: FilterParams, baseparams?: URLSearchParams): URLSearchParams {
  const params = baseparams ? new URLSearchParams(baseparams.toString()) : new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        // 配列の場合は全て削除してから追加
        params.delete(key);
        value.forEach(v => params.append(key, v.toString()));
      } else {
        params.set(key, value.toString());
      }
    } else {
      // 空値の場合は削除
      params.delete(key);
    }
  });
  
  return params;
}

/**
 * ページネーション用のURLパラメータ更新
 */
export function updatePageParam(
  searchParams: string | ReadonlyURLSearchParams | null,
  page: number
): URLSearchParams {
  const params = createURLSearchParams(searchParams);
  
  if (page === 1) {
    params.delete('page');
  } else {
    params.set('page', page.toString());
  }
  
  return params;
}

/**
 * ページサイズ変更時のURLパラメータ更新
 */
export function updatePageSizeParam(
  searchParams: string | ReadonlyURLSearchParams | null,
  pageSize: number,
  resetPage: boolean = true
): URLSearchParams {
  const params = createURLSearchParams(searchParams);
  
  params.set('pageSize', pageSize.toString());
  
  if (resetPage) {
    params.delete('page');
  }
  
  return params;
}

/**
 * 検索パラメータから安全に値を取得
 */
export function getParamValue(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
  defaultValue: string = ''
): string {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] || defaultValue : value || defaultValue;
}

/**
 * 検索パラメータから数値を安全に取得
 */
export function getParamNumber(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
  defaultValue: number = 0
): number {
  const value = getParamValue(searchParams, key);
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}

/**
 * 検索パラメータからブール値を安全に取得
 */
export function getParamBoolean(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
  defaultValue: boolean = false
): boolean {
  const value = getParamValue(searchParams, key);
  return value === 'true' || (defaultValue && value !== 'false');
}

/**
 * 検索パラメータから配列を安全に取得
 */
export function getParamArray(
  searchParams: Record<string, string | string[] | undefined>,
  key: string
): string[] {
  const value = searchParams[key];
  if (Array.isArray(value)) {
    return value;
  }
  return value ? [value] : [];
} 