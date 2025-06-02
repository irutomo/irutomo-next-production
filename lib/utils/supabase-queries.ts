// ===================================
// Supabase Query Utilities
// ===================================

import { createServerSupabaseClient } from '@/app/lib/supabase-server';
import { calculateSupabaseRange } from './pagination';
import { 
  buildSupabaseSearchConditions,
  applyPriceFilter,
  applyCategoryFilter,
  applyLocationFilter,
  RestaurantSearchFilters 
} from './search-filters';

/**
 * レストラン検索用の共通クエリビルダー
 */
export function buildRestaurantQuery(filters: RestaurantSearchFilters, supabase: any) {
  let baseQuery = supabase
    .from('restaurants')
    .select('*, restaurant_categories(*)');

  // テキスト検索の適用
  if (filters.query) {
    const searchConditions = buildSupabaseSearchConditions(
      filters.query,
      ['name', 'description']
    );
    if (searchConditions) {
      baseQuery = baseQuery.or(searchConditions);
    }
  }

  // フィルターの適用
  baseQuery = applyLocationFilter(baseQuery, filters.location);
  baseQuery = applyCategoryFilter(baseQuery, filters.category, 'restaurant_categories.category_id');
  baseQuery = applyPriceFilter(baseQuery, filters.minPrice, filters.maxPrice);

  return baseQuery;
}

/**
 * ページネーション付きレストラン検索
 */
export async function searchRestaurants(filters: RestaurantSearchFilters) {
  const { page = 1, pageSize = 10 } = filters;
  const [from, to] = calculateSupabaseRange(page, pageSize);
  
  try {
    const supabase = await createServerSupabaseClient();
    
    // カウント用クエリ
    let countQuery = supabase
      .from('restaurants')
      .select('*', { count: 'exact', head: true });

    // フィルターの適用（カウント用）
    if (filters.query) {
      const searchConditions = buildSupabaseSearchConditions(
        filters.query,
        ['name', 'description']
      );
      if (searchConditions) {
        countQuery = countQuery.or(searchConditions);
      }
    }
    
    countQuery = applyLocationFilter(countQuery, filters.location);
    countQuery = applyCategoryFilter(countQuery, filters.category, 'restaurant_categories.category_id');
    countQuery = applyPriceFilter(countQuery, filters.minPrice, filters.maxPrice);

    // データ取得用クエリ
    const dataQuery = buildRestaurantQuery(filters, supabase);
    
    // データクエリにrangeとorderを適用
    const dataQueryWithPagination = dataQuery
      .range(from, to)
      .order('created_at', { ascending: false });
    
    // 並行実行
    const [countResult, dataResult] = await Promise.all([
      countQuery,
      dataQueryWithPagination
    ]);

    if (countResult.error) {
      throw new Error(`Count query failed: ${countResult.error.message}`);
    }
    
    if (dataResult.error) {
      throw new Error(`Data query failed: ${dataResult.error.message}`);
    }

    return {
      restaurants: dataResult.data || [],
      totalCount: countResult.count || 0,
      totalPages: Math.ceil((countResult.count || 0) / pageSize),
      currentPage: page,
      pageSize,
    };
  } catch (error) {
    console.error('Restaurant search error:', error);
    return {
      restaurants: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: page,
      pageSize,
    };
  }
}

/**
 * 基本的なページネーション付きクエリ実行
 */
export async function executePaginatedQuery<T>(
  tableName: string,
  page: number,
  pageSize: number,
  selectFields: string = '*',
  filters?: Record<string, any>,
  orderBy?: { column: string; ascending?: boolean }
) {
  const supabase = await createServerSupabaseClient();
  const [from, to] = calculateSupabaseRange(page, pageSize);
  
  try {
    // データ取得用クエリを構築
    let query = supabase
      .from(tableName)
      .select(selectFields, { count: 'exact' });
    
    // フィルターの適用
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (typeof value === 'string' && key.includes('search')) {
            // 検索用のフィルター
            query = query.or(`name.ilike.%${value}%,description.ilike.%${value}%`);
          } else {
            query = query.eq(key, value);
          }
        }
      });
    }
    
    // ソート条件の適用
    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });
    }
    
    // ページネーションの適用
    const { data, error, count } = await query.range(from, to);
    
    if (error) {
      throw new Error(`Query failed: ${error.message}`);
    }
    
    return {
      data: data as T[],
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize),
      currentPage: page,
      pageSize,
    };
  } catch (error) {
    console.error('Paginated query error:', error);
    return {
      data: [] as T[],
      totalCount: 0,
      totalPages: 0,
      currentPage: page,
      pageSize,
    };
  }
}

/**
 * 検索用のクエリ実行（テキスト検索対応）
 */
export async function executeSearchQuery<T>(
  tableName: string,
  searchQuery: string,
  searchFields: string[],
  page: number,
  pageSize: number,
  selectFields: string = '*',
  additionalFilters?: Record<string, any>
) {
  const supabase = await createServerSupabaseClient();
  const [from, to] = calculateSupabaseRange(page, pageSize);
  
  try {
    let query = supabase
      .from(tableName)
      .select(selectFields, { count: 'exact' });
    
    // テキスト検索条件の構築
    if (searchQuery && searchFields.length > 0) {
      const searchConditions = searchFields
        .map(field => `${field}.ilike.%${searchQuery}%`)
        .join(',');
      query = query.or(searchConditions);
    }
    
    // 追加フィルターの適用
    if (additionalFilters) {
      Object.entries(additionalFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value);
        }
      });
    }
    
    const { data, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Search query failed: ${error.message}`);
    }
    
    return {
      data: data as T[],
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize),
      currentPage: page,
      pageSize,
    };
  } catch (error) {
    console.error('Search query error:', error);
    return {
      data: [] as T[],
      totalCount: 0,
      totalPages: 0,
      currentPage: page,
      pageSize,
    };
  }
}

/**
 * フィルター付きカウントクエリ
 */
export async function countWithFilters(
  tableName: string,
  queryBuilder?: (query: any) => any
): Promise<number> {
  const supabase = await createServerSupabaseClient();
  
  try {
    let query = supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (queryBuilder) {
      query = queryBuilder(query);
    }
    
    const { count, error } = await query;
    
    if (error) {
      throw new Error(`Count query failed: ${error.message}`);
    }
    
    return count || 0;
  } catch (error) {
    console.error('Count query error:', error);
    return 0;
  }
} 