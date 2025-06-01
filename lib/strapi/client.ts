// ===================================
// Strapi v5 クライアント（詳細デバッグ版）+ Supabaseフォールバック
// ===================================

import { 
  JapanInfoArticle, 
  JapanInfoArticleResponse,
  JapanInfoCollectionResponse,
  SearchFilters,
  JapanInfo,
  StrapiPaginationParams,
  StrapiConnectionStatus 
} from '@/types/japan-info';

import { createClient } from '@supabase/supabase-js';

// 環境変数とAPI設定
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL;
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;
const API_ENDPOINT = '/api/japan-info-articles';

// Supabase設定（フォールバック用）
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabaseClient: any = null;

// Supabaseクライアントの初期化
function getSupabaseClient() {
  if (!supabaseClient && SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabaseClient;
}

// デバッグ用ログ関数（本番環境では無効）
function debugLog(message: string, data?: any) {
  // 本番環境ではデバッグログを出力しない
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
    console.log(`[Strapi Debug] ${message}`, data || '');
  }
}

// エラーログ関数
function errorLog(message: string, error?: any) {
  console.error(`[Strapi Client ERROR] ${message}`, error || '');
}

// 警告ログ関数
function warningLog(message: string, data?: any) {
  console.warn(`[Strapi Client WARNING] ${message}`, data || '');
}

// 設定確認関数
function validateConfiguration(): { 
  isValid: boolean; 
  errors: string[]; 
  hasSupabaseFallback: boolean 
} {
  const errors: string[] = [];
  
  if (!STRAPI_URL) {
    errors.push('NEXT_PUBLIC_STRAPI_URL is not set');
  }
  
  if (!STRAPI_API_TOKEN) {
    errors.push('STRAPI_API_TOKEN is not set');
  }
  
  const hasSupabaseFallback = !!(SUPABASE_URL && SUPABASE_ANON_KEY);
  
  return {
    isValid: errors.length === 0,
    errors,
    hasSupabaseFallback
  };
}

// Supabaseから取得するデータの型定義
interface SupabaseJapanInfoRow {
  id: number;
  title: string;
  korean_title?: string;
  description: string;
  korean_description?: string;
  content: string;
  korean_content?: string;
  image_url: string;
  tags?: string[];
  location?: string;
  is_popular?: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  author?: string;
  views?: number;
}

// ===================================
// Supabaseフォールバック関数群
// ===================================

// SupabaseからJapan Infoデータを取得（フォールバック）
async function getJapanInfoFromSupabase(
  options: {
    page?: number;
    pageSize?: number;
    isPopular?: boolean;
    query?: string;
    location?: string;
    tags?: string[];
    sortBy?: string;
    sortOrder?: string;
  } = {}
): Promise<{ articles: JapanInfo[]; pagination: any }> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client is not available');
    }

    const {
      page = 1,
      pageSize = 12,
      isPopular,
      query,
      location,
      tags = [],
      sortBy = 'published_at',
      sortOrder = 'desc'
    } = options;

    let supabaseQuery = supabase.from('japan_info').select('*', { count: 'exact' });

    // フィルター適用
    if (isPopular) {
      supabaseQuery = supabaseQuery.eq('is_popular', true);
    }

    if (query) {
      supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%,korean_title.ilike.%${query}%`);
    }

    if (location) {
      supabaseQuery = supabaseQuery.ilike('location', `%${location}%`);
    }

    if (tags.length > 0) {
      supabaseQuery = supabaseQuery.contains('tags', tags);
    }

    // ソート
    const validSortColumns = ['published_at', 'views', 'title', 'created_at'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'published_at';
    supabaseQuery = supabaseQuery.order(sortColumn, { ascending: sortOrder === 'asc' });

    // ページネーション
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    supabaseQuery = supabaseQuery.range(from, to);

    const { data, error, count } = await supabaseQuery;

    if (error) {
      throw error;
    }

    // データ変換
    const articles: JapanInfo[] = (data as SupabaseJapanInfoRow[] || []).map((item: SupabaseJapanInfoRow) => ({
      id: item.id.toString(),
      title: item.title,
      korean_title: item.korean_title || item.title,
      description: item.description,
      korean_description: item.korean_description || item.description,
      content: item.content,
      korean_content: item.korean_content || item.content,
      featured_image: item.image_url,
      tags: item.tags || [],
      location: item.location || '',
      prefecture: '',
      is_popular: item.is_popular || false,
      published_at: item.published_at,
      created_at: item.created_at,
      updated_at: item.updated_at,
      author: item.author || '',
      views: item.views || 0,
      language: 'ja',
      slug: item.id.toString(),
      meta_title: item.title,
      meta_description: item.description,
    }));

    const totalPages = Math.ceil((count || 0) / pageSize);

    warningLog('Using Supabase fallback for Japan Info data', {
      articlesFound: articles.length,
      totalCount: count,
      page,
      totalPages
    });

    return {
      articles,
      pagination: {
        page,
        pageSize,
        pageCount: totalPages,
        total: count || 0
      }
    };
  } catch (error) {
    errorLog('Supabase fallback failed', error);
    return {
      articles: [],
      pagination: { page: 1, pageSize: 12, pageCount: 0, total: 0 }
    };
  }
}

// 個別記事をSupabaseから取得
async function getJapanInfoByIdFromSupabase(id: string): Promise<JapanInfo | null> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client is not available');
    }

    const { data, error } = await supabase
      .from('japan_info')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    const item = data as SupabaseJapanInfoRow;
    
    return {
      id: item.id.toString(),
      title: item.title,
      korean_title: item.korean_title || item.title,
      description: item.description,
      korean_description: item.korean_description || item.description,
      content: item.content,
      korean_content: item.korean_content || item.content,
      featured_image: item.image_url,
      tags: item.tags || [],
      location: item.location || '',
      prefecture: '',
      is_popular: item.is_popular || false,
      published_at: item.published_at,
      created_at: item.created_at,
      updated_at: item.updated_at,
      author: item.author || '',
      views: item.views || 0,
      language: 'ja',
      slug: item.id.toString(),
      meta_title: item.title,
      meta_description: item.description,
    };
  } catch (error) {
    errorLog('Supabase fallback failed for single article', error);
    return null;
  }
}

// APIリクエスト関数
async function makeRequest(
  endpoint: string, 
  options: RequestInit = {}
): Promise<{ success: boolean; data?: any; error?: string }> {
  debugLog('🚀 Making API request', { endpoint, hasAuth: !!STRAPI_API_TOKEN });
  
  const config = validateConfiguration();
  if (!config.isValid) {
    errorLog('Configuration validation failed', config.errors);
    if (config.hasSupabaseFallback) {
      warningLog('Strapi not available, will use Supabase fallback');
    }
    return { success: false, error: `Configuration error: ${config.errors.join(', ')}` };
  }

  const url = `${STRAPI_URL}${endpoint}`;
  debugLog('📡 Request URL', url);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (STRAPI_API_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
    debugLog('🔑 Authorization header added');
  }

  const requestOptions: RequestInit = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
    // キャッシュを無効化して常に最新データを取得
    cache: 'no-store'
  };

  debugLog('📋 Request options', { 
    method: requestOptions.method || 'GET',
    hasAuth: !!headers['Authorization'],
    cache: requestOptions.cache 
  });

  try {
    debugLog('⏳ Sending request...');
    const response = await fetch(url, requestOptions);
    
    debugLog('📬 Response received', { 
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      errorLog(`HTTP Error ${response.status}`, { statusText: response.statusText, body: errorText });
      return { 
        success: false, 
        error: `HTTP ${response.status}: ${response.statusText}${errorText ? ` - ${errorText}` : ''}` 
      };
    }

    const data = await response.json();
    debugLog('✅ Response parsed successfully', { 
      hasData: !!data,
      dataType: Array.isArray(data?.data) ? 'collection' : 'object',
      itemCount: Array.isArray(data?.data) ? data.data.length : 'N/A'
    });

    return { success: true, data };
  } catch (error) {
    errorLog('❌ Request failed', error);
    return { 
      success: false, 
      error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

// ===================================
// Connection Check
// ===================================
export async function checkStrapiConnection(): Promise<boolean> {
  debugLog('🔍 Checking Strapi connection...');
  
  const config = validateConfiguration();
  if (!config.isValid) {
    errorLog('Configuration check failed', config.errors);
    if (config.hasSupabaseFallback) {
      warningLog('Strapi unavailable, but Supabase fallback is available');
      return false; // Strapiは利用不可だが、フォールバックは可能
    }
    return false;
  }

  try {
    const result = await makeRequest(API_ENDPOINT + '?pagination[pageSize]=1');
    const isConnected = result.success;
    
    debugLog(`🔗 Connection check result: ${isConnected ? 'SUCCESS' : 'FAILED'}`, 
      isConnected ? { articles: result.data?.data?.length || 0 } : { error: result.error }
    );
    
    return isConnected;
  } catch (error) {
    errorLog('Connection check failed', error);
    return false;
  }
}

// ===================================
// データ変換関数
// ===================================
function transformStrapiArticle(strapiArticle: any): JapanInfo {
  debugLog('🔄 Transforming Strapi article', { id: strapiArticle.id, title: strapiArticle.title });
  
  // Strapi v5では、attributesではなく直接プロパティとしてデータが格納される
  const data = strapiArticle.attributes || strapiArticle;
  
  // カスタムIDがある場合はそれを使用、なければStrapiのIDを文字列として使用
  const customId = data.customId || data.slug || data.documentId || strapiArticle.id?.toString();
  
  // タイトルのフォールバック処理
  const title = data.title || data.koreanTitle || `記事 ${strapiArticle.id}`;
  const description = data.description || data.koreanDescription || '';
  const content = data.content || data.koreanContent || '';
  
  return {
    id: customId,
    title: title,
    korean_title: data.koreanTitle || title,
    description: description,
    korean_description: data.koreanDescription || description,
    content: content,
    korean_content: data.koreanContent || content,
    featured_image: data.imageUrl || 
                   data.featured_image?.data?.attributes?.url || 
                   data.featuredImage?.data?.attributes?.url || 
                   data.image?.data?.attributes?.url || null,
    tags: data.tags || [],
    location: data.location || '',
    prefecture: data.prefecture || '',
    is_popular: data.isPopular || false,
    published_at: data.publishedAt || data.published_at || data.createdAt || new Date().toISOString(),
    created_at: data.createdAt || data.created_at || new Date().toISOString(),
    updated_at: data.updatedAt || data.updated_at || new Date().toISOString(),
    author: data.author || '',
    views: data.views || 0,
    language: data.locale || 'ja',
    slug: data.slug || customId,
    meta_title: data.meta_title || data.metaTitle || title,
    meta_description: data.meta_description || data.metaDescription || description,
  };
}

// ===================================
// 全記事取得
// ===================================
export async function getAllJapanInfoArticles(
  options: StrapiPaginationParams = {}
): Promise<{ articles: JapanInfo[]; pagination: any }> {
  debugLog('📚 Getting all Japan Info articles', options);

  const {
    page = 1,
    pageSize = 12,
    sortBy = 'publishedAt',
    sortOrder = 'desc',
    locale = 'ja'
  } = options;

  // まずStrapiを試行
  const queryParams = new URLSearchParams({
    'pagination[page]': page.toString(),
    'pagination[pageSize]': pageSize.toString(),
    'sort[0]': `${sortBy}:${sortOrder}`,
    'populate': '*',
    'locale': locale,
  });

  const endpoint = `${API_ENDPOINT}?${queryParams.toString()}`;
  const result = await makeRequest(endpoint);

  if (result.success) {
    const strapiResponse = result.data as JapanInfoCollectionResponse;
    const articles = strapiResponse.data?.map(transformStrapiArticle) || [];
    
    debugLog('✅ Articles fetched successfully from Strapi', { 
      articles: articles.length,
      totalResults: strapiResponse.meta?.pagination?.total || 0
    });

    return {
      articles,
      pagination: strapiResponse.meta?.pagination || { page: 1, pageSize: 12, pageCount: 0, total: 0 }
    };
  }

  // Strapiが失敗した場合、Supabaseフォールバックを試行
  const config = validateConfiguration();
  if (config.hasSupabaseFallback) {
    warningLog('Strapi failed, attempting Supabase fallback', result.error);
    
    return await getJapanInfoFromSupabase({
      page,
      pageSize,
      sortBy: sortBy === 'publishedAt' ? 'published_at' : sortBy,
      sortOrder
    });
  }

  // 両方失敗した場合
  errorLog('Both Strapi and Supabase failed', result.error);
  return {
    articles: [],
    pagination: { page: 1, pageSize: 12, pageCount: 0, total: 0 }
  };
}

// ===================================
// 人気記事取得
// ===================================
export async function getPopularJapanInfoArticles(
  locale: string = 'ja', 
  limit: number = 6
): Promise<JapanInfo[]> {
  debugLog('⭐ Getting popular Japan Info articles', { locale, limit });

  // まずStrapiを試行
  const queryParams = new URLSearchParams({
    'filters[isPopular][$eq]': 'true',
    'pagination[pageSize]': limit.toString(),
    'sort[0]': 'views:desc',
    'sort[1]': 'publishedAt:desc',
    'populate': '*',
    'locale': locale,
  });

  const endpoint = `${API_ENDPOINT}?${queryParams.toString()}`;
  const result = await makeRequest(endpoint);

  if (result.success) {
    const strapiResponse = result.data as JapanInfoCollectionResponse;
    const articles = strapiResponse.data?.map(transformStrapiArticle) || [];
    
    debugLog('✅ Popular articles fetched successfully from Strapi', { 
      articles: articles.length 
    });

    return articles;
  }

  // Strapiが失敗した場合、Supabaseフォールバックを試行
  const config = validateConfiguration();
  if (config.hasSupabaseFallback) {
    warningLog('Strapi failed, attempting Supabase fallback for popular articles', result.error);
    
    const fallbackResult = await getJapanInfoFromSupabase({
      pageSize: limit,
      isPopular: true,
      sortBy: 'views',
      sortOrder: 'desc'
    });
    
    return fallbackResult.articles;
  }

  // 両方失敗した場合
  errorLog('Both Strapi and Supabase failed for popular articles', result.error);
  return [];
}

// ===================================
// 記事検索
// ===================================
export async function searchJapanInfoArticles(
  filters: SearchFilters,
  page: number = 1,
  pageSize: number = 12
): Promise<{ 
  articles: JapanInfo[]; 
  pagination: any; 
  totalResults: number; 
  searchTime: number; 
}> {
  debugLog('🔍 Searching articles', { filters, page, pageSize });
  
  const startTime = Date.now();
  
  // まずStrapiを試行
  const queryParams = new URLSearchParams({
    'pagination[page]': page.toString(),
    'pagination[pageSize]': pageSize.toString(),
    'populate': '*',
  });

  // 検索クエリ
  if (filters.query) {
    queryParams.append('filters[$or][0][title][$containsi]', filters.query);
    queryParams.append('filters[$or][1][description][$containsi]', filters.query);
    queryParams.append('filters[$or][2][content][$containsi]', filters.query);
  }

  // 地域フィルター
  if (filters.location) {
    queryParams.append('filters[location][$containsi]', filters.location);
  }

  // タグフィルター
  if (filters.tags && filters.tags.length > 0) {
    filters.tags.forEach((tag, index) => {
      queryParams.append(`filters[tags][$in][${index}]`, tag);
    });
  }

  // 人気記事フィルター
  if (filters.isPopular) {
    queryParams.append('filters[isPopular][$eq]', 'true');
  }

  // ソート
  const sortBy = filters.sortBy || 'publishedAt';
  const sortOrder = filters.sortOrder || 'desc';
  queryParams.append('sort[0]', `${sortBy}:${sortOrder}`);

  const endpoint = `${API_ENDPOINT}?${queryParams.toString()}`;
  const result = await makeRequest(endpoint);

  if (result.success) {
    const strapiResponse = result.data as JapanInfoCollectionResponse;
    const articles = strapiResponse.data?.map(transformStrapiArticle) || [];
    const searchTime = Date.now() - startTime;

    debugLog('✅ Search completed successfully via Strapi', { 
      results: articles.length,
      totalResults: strapiResponse.meta?.pagination?.total || 0,
      searchTime: `${searchTime}ms`
    });

    return {
      articles,
      pagination: strapiResponse.meta?.pagination || { page: 1, pageSize: 12, pageCount: 0, total: 0 },
      totalResults: strapiResponse.meta?.pagination?.total || 0,
      searchTime
    };
  }

  // Strapiが失敗した場合、Supabaseフォールバックを試行
  const config = validateConfiguration();
  if (config.hasSupabaseFallback) {
    warningLog('Strapi search failed, attempting Supabase fallback', result.error);
    
    const fallbackResult = await getJapanInfoFromSupabase({
      page,
      pageSize,
      query: filters.query,
      location: filters.location,
      tags: filters.tags,
      isPopular: filters.isPopular,
      sortBy: filters.sortBy === 'publishedAt' ? 'published_at' : filters.sortBy,
      sortOrder: filters.sortOrder
    });
    
    const searchTime = Date.now() - startTime;
    
    return {
      articles: fallbackResult.articles,
      pagination: fallbackResult.pagination,
      totalResults: fallbackResult.pagination.total,
      searchTime
    };
  }

  // 両方失敗した場合
  const searchTime = Date.now() - startTime;
  errorLog('Both Strapi and Supabase search failed', result.error);
  
  return { 
    articles: [], 
    pagination: { page: 1, pageSize: 12, pageCount: 0, total: 0 },
    totalResults: 0,
    searchTime
  };
}

// ===================================
// 単一記事取得関数（ID検索）- 改善版
// ===================================
export async function getJapanInfoArticle(
  id: string, 
  locale: string = 'ja'
): Promise<JapanInfo | null> {
  debugLog('📄 Getting single article', { id, locale });
  
  // 複数のロケールで検索を試行
  const locales = locale === 'ja' ? ['ja', 'ko'] : ['ko', 'ja'];
  
  for (const currentLocale of locales) {
    debugLog(`🔍 Trying locale: ${currentLocale}`);
    
    // コレクション検索で記事を探す（権限問題を回避）
    const searchParams = new URLSearchParams({
      'pagination[pageSize]': '100', // 全記事を取得
      'populate': '*',
    });
    
    // ロケールパラメータは条件付きで追加
    if (currentLocale) {
      searchParams.append('locale', currentLocale);
    }

    const collectionEndpoint = `${API_ENDPOINT}?${searchParams.toString()}`;
    const collectionResult = await makeRequest(collectionEndpoint);

    if (!collectionResult.success) {
      debugLog(`❌ Failed to get articles collection for locale ${currentLocale}`, collectionResult.error);
      continue; // 次のロケールを試行
    }

    const strapiResponse = collectionResult.data as JapanInfoCollectionResponse;
    if (!strapiResponse.data || strapiResponse.data.length === 0) {
      debugLog(`📭 No articles found in collection for locale ${currentLocale}`);
      continue; // 次のロケールを試行
    }

    debugLog(`📚 Found ${strapiResponse.data.length} articles in locale ${currentLocale}`);

    // IDまたはカスタムIDで記事を検索
    const targetArticle = strapiResponse.data.find((article: any) => {
      const data = article.attributes || article;
      const matches = (
        article.id?.toString() === id ||
        data.customId === id ||
        data.slug === id ||
        data.documentId === id
      );
      
      if (matches) {
        debugLog(`🎯 Found matching article`, {
          articleId: article.id,
          documentId: data.documentId || article.documentId,
          customId: data.customId,
          slug: data.slug,
          title: data.title || article.title
        });
      }
      
      return matches;
    });

    if (targetArticle) {
      const transformedArticle = transformStrapiArticle(targetArticle);
      debugLog('📖 Article found in collection', { 
        id: transformedArticle.id, 
        title: transformedArticle.title,
        locale: currentLocale
      });
      
      return transformedArticle;
    }
    
    debugLog(`🔍 Article not found in locale ${currentLocale}`, { 
      searchId: id, 
      availableIds: strapiResponse.data.slice(0, 5).map((a: any) => ({
        id: a.id,
        documentId: a.documentId,
        customId: a.customId || (a.attributes && a.attributes.customId),
        slug: a.slug || (a.attributes && a.attributes.slug),
        title: a.title || (a.attributes && a.attributes.title)
      }))
    });
  }

  debugLog('❌ Article not found in any locale', { searchId: id, triedLocales: locales });
  return null;
}

// ===================================
// ID指定記事取得（言語対応版）
// ===================================
export async function getJapanInfoArticleById(
  id: string, 
  locale: string = 'ja'
): Promise<JapanInfo | null> {
  debugLog('🆔 Getting Japan Info article by ID', { id, locale });

  // まずStrapiを試行
  const result = await getJapanInfoArticle(id, locale);
  
  if (result) {
    debugLog('✅ Article fetched successfully from Strapi', { id, title: result.title });
    return result;
  }

  // Strapiが失敗した場合、Supabaseフォールバックを試行
  const config = validateConfiguration();
  if (config.hasSupabaseFallback) {
    warningLog('Strapi failed, attempting Supabase fallback for article by ID', { id });
    
    const fallbackResult = await getJapanInfoByIdFromSupabase(id);
    
    if (fallbackResult) {
      debugLog('✅ Article fetched successfully from Supabase fallback', { id, title: fallbackResult.title });
    }
    
    return fallbackResult;
  }

  // 両方失敗した場合
  errorLog('Both Strapi and Supabase failed for article by ID', { id });
  return null;
}

// スラッグ検索関数も追加
export async function getJapanInfoArticleBySlug(
  slug: string,
  locale: string = 'ja'
): Promise<JapanInfo | null> {
  debugLog('📄 Getting article by slug', { slug, locale });
  
  const queryParams = new URLSearchParams({
    'filters[slug][$eq]': slug,
    'pagination[pageSize]': '1',
    'populate': '*',
    'locale': locale,
  });

  const endpoint = `${API_ENDPOINT}?${queryParams.toString()}`;
  const result = await makeRequest(endpoint);

  if (!result.success) {
    errorLog('Failed to get article by slug', result.error);
    return null;
  }

  const strapiResponse = result.data as JapanInfoCollectionResponse;
  if (!strapiResponse.data || strapiResponse.data.length === 0) {
    debugLog('Article not found by slug', { slug });
    return null;
  }

  const article = transformStrapiArticle(strapiResponse.data[0]);
  debugLog('📖 Article retrieved by slug', { slug, id: article.id, title: article.title });

  return article;
} 