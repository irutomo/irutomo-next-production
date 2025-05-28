// ===================================
// Strapi v5 クライアント（詳細デバッグ版）
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

// 環境変数とAPI設定
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL;
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;
const API_ENDPOINT = '/api/japan-info-articles';

// デバッグログ関数
function debugLog(message: string, data?: any) {
  if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
    console.log(`[Strapi Client] ${message}`, data || '');
  }
}

// エラーログ関数
function errorLog(message: string, error?: any) {
  console.error(`[Strapi Client ERROR] ${message}`, error || '');
}

// 設定確認関数
function validateConfiguration(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!STRAPI_URL) {
    errors.push('NEXT_PUBLIC_STRAPI_URL is not set');
  }
  
  if (!STRAPI_API_TOKEN) {
    errors.push('STRAPI_API_TOKEN is not set');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
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
  debugLog('🔄 Transforming Strapi article', { id: strapiArticle.id, title: strapiArticle.attributes?.title });
  
  const attrs = strapiArticle.attributes || {};
  
  // カスタムIDがある場合はそれを使用、なければStrapiのIDを文字列として使用
  const customId = attrs.customId || attrs.slug || strapiArticle.id?.toString();
  
  return {
    id: customId,
    title: attrs.title || '',
    korean_title: attrs.korean_title || attrs.koreanTitle || null,
    description: attrs.description || attrs.excerpt || '',
    korean_description: attrs.korean_description || attrs.koreanDescription || null,
    content: attrs.content || '',
    korean_content: attrs.korean_content || attrs.koreanContent || null,
    featured_image: attrs.featured_image?.data?.attributes?.url || 
                   attrs.featuredImage?.data?.attributes?.url || 
                   attrs.image?.data?.attributes?.url || null,
    tags: attrs.tags || [],
    location: attrs.location || '',
    prefecture: attrs.prefecture || '',
    is_popular: attrs.is_popular || attrs.isPopular || false,
    published_at: attrs.publishedAt || attrs.published_at || new Date().toISOString(),
    created_at: attrs.createdAt || attrs.created_at || new Date().toISOString(),
    updated_at: attrs.updatedAt || attrs.updated_at || new Date().toISOString(),
    author: attrs.author || '',
    views: attrs.views || 0,
    language: attrs.locale || 'ja',
    slug: attrs.slug || customId,
    meta_title: attrs.meta_title || attrs.metaTitle || attrs.title,
    meta_description: attrs.meta_description || attrs.metaDescription || attrs.description,
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

  const queryParams = new URLSearchParams({
    'pagination[page]': page.toString(),
    'pagination[pageSize]': pageSize.toString(),
    'sort[0]': `${sortBy}:${sortOrder}`,
    'populate': '*',
    'locale': locale,
  });

  const endpoint = `${API_ENDPOINT}?${queryParams.toString()}`;
  const result = await makeRequest(endpoint);

  if (!result.success) {
    errorLog('Failed to get all articles', result.error);
    return { 
      articles: [], 
      pagination: { page: 1, pageSize: 12, pageCount: 0, total: 0 } 
    };
  }

  const strapiResponse = result.data as JapanInfoCollectionResponse;
  const articles = strapiResponse.data?.map(transformStrapiArticle) || [];
  
  debugLog('📊 Articles retrieved', { 
    count: articles.length,
    pagination: strapiResponse.meta?.pagination 
  });

  return {
    articles,
    pagination: strapiResponse.meta?.pagination || { page: 1, pageSize: 12, pageCount: 0, total: 0 }
  };
}

// ===================================
// 人気記事取得
// ===================================
export async function getPopularJapanInfoArticles(
  locale: string = 'ja', 
  limit: number = 6
): Promise<JapanInfo[]> {
  debugLog('⭐ Getting popular articles', { locale, limit });

  const queryParams = new URLSearchParams({
    'filters[isPopular][$eq]': 'true',
    'pagination[pageSize]': limit.toString(),
    'sort[0]': 'views:desc',
    'populate': '*',
    'locale': locale,
  });

  const endpoint = `${API_ENDPOINT}?${queryParams.toString()}`;
  const result = await makeRequest(endpoint);

  if (!result.success) {
    errorLog('Failed to get popular articles', result.error);
    return [];
  }

  const strapiResponse = result.data as JapanInfoCollectionResponse;
  const articles = strapiResponse.data?.map(transformStrapiArticle) || [];

  debugLog('🌟 Popular articles retrieved', { count: articles.length });
  
  return articles;
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

  if (!result.success) {
    errorLog('Search failed', result.error);
    return { 
      articles: [], 
      pagination: { page: 1, pageSize: 12, pageCount: 0, total: 0 },
      totalResults: 0,
      searchTime: Date.now() - startTime
    };
  }

  const strapiResponse = result.data as JapanInfoCollectionResponse;
  const articles = strapiResponse.data?.map(transformStrapiArticle) || [];
  const searchTime = Date.now() - startTime;

  debugLog('🔎 Search completed', { 
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

// ===================================
// 単一記事取得関数（ID検索）
// ===================================
export async function getJapanInfoArticle(
  id: string, 
  locale: string = 'ja'
): Promise<JapanInfo | null> {
  debugLog('📄 Getting single article', { id, locale });
  
  // IDが数値かどうかをチェック
  const isNumericId = /^\d+$/.test(id);
  
  let endpoint: string;
  
  if (isNumericId) {
    // 数値IDの場合は直接アクセス
    const queryParams = new URLSearchParams({
      'populate': '*',
      'locale': locale,
    });
    endpoint = `${API_ENDPOINT}/${id}?${queryParams.toString()}`;
  } else {
    // 文字列IDの場合はslugまたはカスタムIDで検索
    const queryParams = new URLSearchParams({
      'filters[slug][$eq]': id,
      'pagination[pageSize]': '1',
      'populate': '*',
      'locale': locale,
    });
    endpoint = `${API_ENDPOINT}?${queryParams.toString()}`;
    
    // slugで見つからない場合はカスタムIDで検索
    const result = await makeRequest(endpoint);
    if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
      return transformStrapiArticle(result.data[0]);
    }
    
    // カスタムIDで再検索
    const customIdParams = new URLSearchParams({
      'filters[customId][$eq]': id,
      'pagination[pageSize]': '1',
      'populate': '*',
      'locale': locale,
    });
    endpoint = `${API_ENDPOINT}?${customIdParams.toString()}`;
  }

  const result = await makeRequest(endpoint);

  if (!result.success) {
    errorLog(`Failed to get single article ${result.error}`);
    return null;
  }

  if (!result.data) {
    debugLog('No article data found');
    return null;
  }

  // 数値IDの場合は直接オブジェクト、文字列IDの場合は配列
  const articleData = isNumericId ? result.data : (Array.isArray(result.data) && result.data.length > 0 ? result.data[0] : null);
  
  if (!articleData) {
    debugLog('No article found with given ID');
    return null;
  }

  const transformedArticle = transformStrapiArticle(articleData);
  debugLog('📖 Article retrieved', { id: transformedArticle.id, title: transformedArticle.title });
  
  return transformedArticle;
}

// ===================================
// 後方互換性関数
// ===================================

// 既存のコードで使用されている関数名をサポート
export async function getJapanInfoArticleById(
  id: string, 
  locale: string = 'ja'
): Promise<JapanInfo | null> {
  debugLog('📄 Getting article by ID (legacy function)', { id, locale });
  return getJapanInfoArticle(id, locale);
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