// ===================================
// Strapi v5 クライアント（フル機能版）
// Next.js App Router 対応
// ===================================

import { 
  JapanInfo, 
  JapanInfoArticle, 
  JapanInfoArticleAttributes,
  JapanInfoArticlesResponse,
  JapanInfoArticleResponse,
  ArticleQueryParams,
  SearchFilters,
  SearchResults,
  EmbedLink
} from '@/types/japan-info';

// Strapi API設定
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://strapi-production-dd77.up.railway.app';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || '';

// APIエラー型
export class StrapiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'StrapiError';
  }
}

// ===================================
// 基本的なfetch関数（v5対応）
// ===================================
async function fetchAPI<T>(
  endpoint: string, 
  options: RequestInit = {},
  params?: ArticleQueryParams
): Promise<T> {
  const url = new URL(`${STRAPI_URL}/api${endpoint}`);
  
  // クエリパラメータの構築
  if (params) {
    if (params.locale) {
      url.searchParams.append('locale', params.locale);
    }
    
    if (params.populate) {
      const populateValue = Array.isArray(params.populate) 
        ? params.populate.join(',') 
        : params.populate;
      url.searchParams.append('populate', populateValue);
    }
    
    if (params.sort) {
      const sortValue = Array.isArray(params.sort) 
        ? params.sort.join(',') 
        : params.sort;
      url.searchParams.append('sort', sortValue);
    }
    
    if (params.pagination) {
      if (params.pagination.page) {
        url.searchParams.append('pagination[page]', params.pagination.page.toString());
      }
      if (params.pagination.pageSize) {
        url.searchParams.append('pagination[pageSize]', params.pagination.pageSize.toString());
      }
    }
    
    // フィルターの構築
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, filter]) => {
        if (filter && typeof filter === 'object') {
          Object.entries(filter).forEach(([operator, value]) => {
            if (value !== undefined) {
              url.searchParams.append(`filters[${key}][${operator}]`, String(value));
            }
          });
        }
      });
    }
  }

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(STRAPI_API_TOKEN ? { 'Authorization': `Bearer ${STRAPI_API_TOKEN}` } : {}),
    },
    next: {
      revalidate: 300, // 5分間キャッシュ
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    console.log(`🚀 Fetching: ${url.toString()}`);
    const response = await fetch(url.toString(), mergedOptions);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error [${response.status}]:`, errorText);
      
      throw new StrapiError(
        `Failed to fetch data from API: ${response.status} ${response.statusText}`,
        response.status,
        response.status.toString()
      );
    }
    
    const data = await response.json();
    console.log('✅ API Response received');
    return data;
  } catch (error) {
    if (error instanceof StrapiError) {
      throw error;
    }
    
    console.error('❌ Network Error:', error);
    throw new StrapiError(
      'Network error occurred while fetching data',
      0,
      'NETWORK_ERROR'
    );
  }
}

// ===================================
// データ変換ユーティリティ
// ===================================

/**
 * Strapi v5形式から内部形式へマッピング
 */
function mapStrapiJapanInfoToInternal(strapiItem: JapanInfoArticle): JapanInfo {
  const { id, documentId, attributes } = strapiItem;
  
  return {
    id: documentId || id.toString(),
    title: attributes.title,
    korean_title: attributes.koreanTitle,
    description: attributes.description,
    korean_description: attributes.koreanDescription,
    content: attributes.content,
    korean_content: attributes.koreanContent,
    image_url: attributes.imageUrl,
    images: attributes.images || [],
    tags: attributes.tags || [],
    location: attributes.location,
    is_popular: attributes.isPopular,
    published_at: attributes.publishedAt || attributes.createdAt,
    updated_at: attributes.updatedAt,
    author: attributes.author,
    views: attributes.views || 0,
    embed_links: transformEmbedLinks(attributes.embedLinks),
    slug: attributes.slug,
    language: attributes.locale || 'ja',
  };
}

/**
 * 埋め込みリンクの変換
 */
function transformEmbedLinks(embedLinks?: EmbedLink[]): Record<string, string> | undefined {
  if (!embedLinks?.length) return undefined;
  
  return embedLinks.reduce((acc, link) => {
    acc[link.type] = link.url;
    return acc;
  }, {} as Record<string, string>);
}

// ===================================
// メインAPI関数
// ===================================

/**
 * すべての日本情報記事を取得（ページネーション対応）
 */
export async function getAllJapanInfoArticles(
  options: {
    page?: number;
    pageSize?: number;
    locale?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<{
  articles: JapanInfo[];
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}> {
  try {
    const {
      page = 1,
      pageSize = 12,
      locale = 'ja',
      sortBy = 'publishedAt',
      sortOrder = 'desc'
    } = options;

    const params: ArticleQueryParams = {
      locale,
      populate: '*',
      sort: [`${sortBy}:${sortOrder}`],
      pagination: { page, pageSize },
    };

    const response = await fetchAPI<JapanInfoArticlesResponse>(
      '/japan-info-articles',
      {},
      params
    );

    return {
      articles: response.data.map(mapStrapiJapanInfoToInternal),
      pagination: response.meta.pagination,
    };
  } catch (error) {
    console.error('❌ Error fetching Japan info articles from Strapi:', error);
    return {
      articles: [],
      pagination: { page: 1, pageSize: 12, pageCount: 0, total: 0 },
    };
  }
}

/**
 * 人気の日本情報記事を取得
 */
export async function getPopularJapanInfoArticles(
  locale: string = 'ja',
  limit: number = 6
): Promise<JapanInfo[]> {
  try {
    const params: ArticleQueryParams = {
      locale,
      populate: '*',
      sort: ['views:desc', 'publishedAt:desc'],
      filters: {
        isPopular: { $eq: true }
      },
      pagination: { pageSize: limit },
    };

    const response = await fetchAPI<JapanInfoArticlesResponse>(
      '/japan-info-articles',
      {},
      params
    );

    return response.data.map(mapStrapiJapanInfoToInternal);
  } catch (error) {
    console.error('❌ Error fetching popular Japan info articles from Strapi:', error);
    return [];
  }
}

/**
 * IDで日本情報記事を取得
 */
export async function getJapanInfoArticleById(
  id: string,
  locale: string = 'ja'
): Promise<JapanInfo | null> {
  try {
    const params: ArticleQueryParams = {
      locale,
      populate: '*',
    };

    const response = await fetchAPI<JapanInfoArticleResponse>(
      `/japan-info-articles/${id}`,
      {},
      params
    );

    return mapStrapiJapanInfoToInternal(response.data);
  } catch (error) {
    console.error(`❌ Error fetching Japan info article with ID ${id} from Strapi:`, error);
    return null;
  }
}

/**
 * スラッグで日本情報記事を取得
 */
export async function getJapanInfoArticleBySlug(
  slug: string,
  locale: string = 'ja'
): Promise<JapanInfo | null> {
  try {
    const params: ArticleQueryParams = {
      locale,
      populate: '*',
      filters: {
        slug: { $eq: slug }
      },
    };

    const response = await fetchAPI<JapanInfoArticlesResponse>(
      '/japan-info-articles',
      {},
      params
    );
    
    if (response.data.length === 0) {
      return null;
    }
    
    return mapStrapiJapanInfoToInternal(response.data[0]);
  } catch (error) {
    console.error(`❌ Error fetching Japan info article with slug ${slug} from Strapi:`, error);
    return null;
  }
}

/**
 * 高度な検索機能
 */
export async function searchJapanInfoArticles(
  searchFilters: SearchFilters,
  page: number = 1,
  pageSize: number = 12
): Promise<SearchResults> {
  const startTime = Date.now();
  
  try {
    const params: ArticleQueryParams = {
      locale: 'ja',
      populate: '*',
      pagination: { page, pageSize },
    };

    // 検索クエリの構築
    const filters: any = {};
    
    if (searchFilters.query) {
      filters.$or = [
        { title: { $containsi: searchFilters.query } },
        { description: { $containsi: searchFilters.query } },
        { content: { $containsi: searchFilters.query } },
      ];
    }
    
    if (searchFilters.location) {
      filters.location = { $containsi: searchFilters.location };
    }
    
    if (searchFilters.tags?.length) {
      filters.tags = { $in: searchFilters.tags };
    }
    
    if (searchFilters.isPopular !== undefined) {
      filters.isPopular = { $eq: searchFilters.isPopular };
    }

    params.filters = filters;
    
    // ソート設定
    if (searchFilters.sortBy) {
      const sortOrder = searchFilters.sortOrder || 'desc';
      params.sort = [`${searchFilters.sortBy}:${sortOrder}`];
    } else {
      params.sort = ['publishedAt:desc'];
    }

    const response = await fetchAPI<JapanInfoArticlesResponse>(
      '/japan-info-articles',
      {},
      params
    );

    const searchTime = Date.now() - startTime;

    return {
      articles: response.data.map(mapStrapiJapanInfoToInternal),
      totalResults: response.meta.pagination.total,
      searchTime,
      pagination: response.meta.pagination,
    };
  } catch (error) {
    console.error('❌ Error searching Japan info articles:', error);
    return {
      articles: [],
      totalResults: 0,
      searchTime: Date.now() - startTime,
      pagination: { page: 1, pageSize: 12, pageCount: 0, total: 0 },
    };
  }
}

/**
 * 閲覧数を更新
 */
export async function updateJapanInfoArticleViews(
  id: string
): Promise<void> {
  try {
    // まず現在の記事を取得
    const article = await getJapanInfoArticleById(id);
    if (!article) {
      throw new StrapiError('Article not found', 404);
    }

    // 閲覧数を増加
    const updatedViews = (article.views || 0) + 1;

    await fetchAPI(
      `/japan-info-articles/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          data: {
            views: updatedViews
          }
        }),
        next: { revalidate: 0 }, // キャッシュを無効化
      }
    );

    console.log(`✅ Views updated for article ${id}: ${updatedViews}`);
  } catch (error) {
    console.error(`❌ Error updating views for article ${id}:`, error);
    // 閲覧数の更新に失敗してもページ表示は継続
  }
}

/**
 * 関連記事を取得
 */
export async function getRelatedJapanInfoArticles(
  currentArticleId: string,
  tags: string[] = [],
  location?: string,
  limit: number = 4
): Promise<JapanInfo[]> {
  try {
    const params: ArticleQueryParams = {
      locale: 'ja',
      populate: '*',
      pagination: { pageSize: limit + 1 }, // 現在の記事を除外するため+1
      sort: ['publishedAt:desc'],
    };

    // フィルター構築
    const filters: any = {
      documentId: { $ne: currentArticleId }
    };

    if (tags.length > 0 || location) {
      filters.$or = [];
      
      if (tags.length > 0) {
        filters.$or.push({ tags: { $in: tags } });
      }
      
      if (location) {
        filters.$or.push({ location: { $eq: location } });
      }
    }

    params.filters = filters;

    const response = await fetchAPI<JapanInfoArticlesResponse>(
      '/japan-info-articles',
      {},
      params
    );

    return response.data
      .slice(0, limit) // 念のためlimitで切り詰め
      .map(mapStrapiJapanInfoToInternal);
  } catch (error) {
    console.error('❌ Error fetching related articles:', error);
    return [];
  }
}

// ===================================
// ヘルスチェック
// ===================================

/**
 * Strapi接続確認
 */
export async function checkStrapiConnection(): Promise<boolean> {
  try {
    await fetchAPI('/japan-info-articles', {
      method: 'HEAD',
    }, {
      pagination: { pageSize: 1 }
    });
    return true;
  } catch (error) {
    console.error('❌ Strapi connection failed:', error);
    return false;
  }
} 