// ===================================
// Search Filters Utilities
// ===================================

import { buildSearchParams, getParamValue, getParamNumber, getParamBoolean, getParamArray } from './url-params';

export interface BaseSearchFilters {
  query?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface RestaurantSearchFilters extends BaseSearchFilters {
  location?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface JapanInfoSearchFilters extends BaseSearchFilters {
  location?: string;
  tags?: string[];
  isPopular?: boolean;
}

/**
 * 検索パラメータから汎用フィルターを抽出
 */
export function extractBaseFilters(
  searchParams: Record<string, string | string[] | undefined>
): BaseSearchFilters {
  return {
    query: getParamValue(searchParams, 'query') || undefined,
    page: getParamNumber(searchParams, 'page', 1),
    pageSize: getParamNumber(searchParams, 'pageSize', 12),
    sortBy: getParamValue(searchParams, 'sortBy') || undefined,
    sortOrder: (getParamValue(searchParams, 'sortOrder') as 'asc' | 'desc') || 'desc',
  };
}

/**
 * 検索パラメータからレストラン用フィルターを抽出
 */
export function extractRestaurantFilters(
  searchParams: Record<string, string | string[] | undefined>
): RestaurantSearchFilters {
  const baseFilters = extractBaseFilters(searchParams);
  
  return {
    ...baseFilters,
    location: getParamValue(searchParams, 'location') || undefined,
    category: getParamValue(searchParams, 'category') || undefined,
    minPrice: getParamNumber(searchParams, 'minPrice') || undefined,
    maxPrice: getParamNumber(searchParams, 'maxPrice') || undefined,
  };
}

/**
 * 検索パラメータからJapan Info用フィルターを抽出
 */
export function extractJapanInfoFilters(
  searchParams: Record<string, string | string[] | undefined>
): JapanInfoSearchFilters {
  const baseFilters = extractBaseFilters(searchParams);
  
  return {
    ...baseFilters,
    location: getParamValue(searchParams, 'location') || undefined,
    tags: getParamArray(searchParams, 'tags'),
    isPopular: getParamBoolean(searchParams, 'popular', false) || undefined,
  };
}

/**
 * フィルターからクエリパラメータを構築
 */
export function buildFilterParams(filters: BaseSearchFilters): URLSearchParams {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => 
      value !== undefined && value !== null && value !== ''
    )
  );
  
  return buildSearchParams(cleanFilters);
}

/**
 * Supabaseクエリ用の検索条件構築
 */
export function buildSupabaseSearchConditions(
  query?: string,
  searchFields: string[] = ['name', 'description']
): string | undefined {
  if (!query) return undefined;
  
  const conditions = searchFields.map(field => `${field}.ilike.%${query}%`);
  return conditions.join(',');
}

/**
 * 価格範囲フィルターの適用
 */
export function applyPriceFilter(
  baseQuery: any,
  minPrice?: number,
  maxPrice?: number,
  priceField: string = 'average_price'
) {
  let query = baseQuery;
  
  if (minPrice !== undefined) {
    query = query.gte(priceField, minPrice);
  }
  
  if (maxPrice !== undefined) {
    query = query.lte(priceField, maxPrice);
  }
  
  return query;
}

/**
 * カテゴリフィルターの適用
 */
export function applyCategoryFilter(
  baseQuery: any,
  category?: string,
  categoryField: string = 'category'
) {
  return category ? baseQuery.eq(categoryField, category) : baseQuery;
}

/**
 * 位置情報フィルターの適用
 */
export function applyLocationFilter(
  baseQuery: any,
  location?: string,
  locationField: string = 'location'
) {
  return location ? baseQuery.ilike(locationField, `%${location}%`) : baseQuery;
} 