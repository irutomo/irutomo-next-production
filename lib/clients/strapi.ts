// ===================================
// Strapi v5 専用クライアント
// ===================================

import { 
  JapanInfoCollectionResponse,
  JapanInfoArticleResponse,
  StrapiPaginationParams,
  SearchFilters,
  JapanInfo 
} from '@/types/japan-info';
import { getEnvironmentConfig, validateStrapiConfig } from '../config/environment';
import { logger } from '../utils/logger';
import { JapanInfoTransformer } from '../transformers/japan-info';

export class StrapiClient {
  private config = getEnvironmentConfig();

  private async makeRequest(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    logger.debug('Making Strapi API request', {
      component: 'StrapiClient',
      function: 'makeRequest',
      data: { endpoint, hasAuth: !!this.config.strapi.apiToken }
    });
    
    const configValidation = validateStrapiConfig();
    if (!configValidation.isValid) {
      logger.error('Strapi configuration validation failed', {
        component: 'StrapiClient',
        data: configValidation.errors
      });
      return { success: false, error: `Configuration error: ${configValidation.errors.join(', ')}` };
    }

    const url = `${this.config.strapi.url}${endpoint}`;
    logger.debug('Request URL', { component: 'StrapiClient', data: url });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.strapi.apiToken) {
      headers['Authorization'] = `Bearer ${this.config.strapi.apiToken}`;
      logger.debug('Authorization header added', { component: 'StrapiClient' });
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

    try {
      logger.debug('Sending request...', { component: 'StrapiClient' });
      const response = await fetch(url, requestOptions);
      
      logger.debug('Response received', {
        component: 'StrapiClient',
        data: { 
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`HTTP Error ${response.status}`, {
          component: 'StrapiClient',
          data: { statusText: response.statusText, body: errorText }
        });
        return { 
          success: false, 
          error: `HTTP ${response.status}: ${response.statusText}${errorText ? ` - ${errorText}` : ''}` 
        };
      }

      const data = await response.json();
      logger.debug('Response parsed successfully', {
        component: 'StrapiClient',
        data: { 
          hasData: !!data,
          dataType: Array.isArray(data?.data) ? 'collection' : 'object',
          itemCount: Array.isArray(data?.data) ? data.data.length : 'N/A'
        }
      });

      return { success: true, data };
    } catch (error) {
      logger.error('Request failed', {
        component: 'StrapiClient',
        data: error
      });
      return { 
        success: false, 
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  async checkConnection(): Promise<boolean> {
    logger.debug('Checking Strapi connection...', { component: 'StrapiClient' });
    
    const configValidation = validateStrapiConfig();
    if (!configValidation.isValid) {
      logger.error('Configuration check failed', {
        component: 'StrapiClient',
        data: configValidation.errors
      });
      return false;
    }

    try {
      const result = await this.makeRequest(this.config.strapi.apiEndpoint + '?pagination[pageSize]=1');
      const isConnected = result.success;
      
      logger.debug(`Connection check result: ${isConnected ? 'SUCCESS' : 'FAILED'}`, {
        component: 'StrapiClient',
        data: isConnected ? { articles: result.data?.data?.length || 0 } : { error: result.error }
      });
      
      return isConnected;
    } catch (error) {
      logger.error('Connection check failed', {
        component: 'StrapiClient',
        data: error
      });
      return false;
    }
  }

  async getAllArticles(options: StrapiPaginationParams = {}): Promise<{ articles: JapanInfo[]; pagination: any }> {
    logger.debug('Getting all Japan Info articles', {
      component: 'StrapiClient',
      function: 'getAllArticles',
      data: options
    });

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

    const endpoint = `${this.config.strapi.apiEndpoint}?${queryParams.toString()}`;
    const result = await this.makeRequest(endpoint);

    if (result.success) {
      const strapiResponse = result.data as JapanInfoCollectionResponse;
      const articles = JapanInfoTransformer.fromStrapiCollection(strapiResponse.data || []);
      
      logger.debug('Articles fetched successfully from Strapi', {
        component: 'StrapiClient',
        data: { 
          articles: articles.length,
          totalResults: strapiResponse.meta?.pagination?.total || 0
        }
      });

      return {
        articles,
        pagination: strapiResponse.meta?.pagination || { page: 1, pageSize: 12, pageCount: 0, total: 0 }
      };
    }

    logger.error('Failed to fetch articles from Strapi', {
      component: 'StrapiClient',
      data: result.error
    });

    return {
      articles: [],
      pagination: { page: 1, pageSize: 12, pageCount: 0, total: 0 }
    };
  }

  async getPopularArticles(locale: string = 'ja', limit: number = 6): Promise<JapanInfo[]> {
    logger.debug('Getting popular Japan Info articles', {
      component: 'StrapiClient',
      function: 'getPopularArticles',
      data: { locale, limit }
    });

    const queryParams = new URLSearchParams({
      'filters[isPopular][$eq]': 'true',
      'pagination[pageSize]': limit.toString(),
      'sort[0]': 'views:desc',
      'sort[1]': 'publishedAt:desc',
      'populate': '*',
      'locale': locale,
    });

    const endpoint = `${this.config.strapi.apiEndpoint}?${queryParams.toString()}`;
    const result = await this.makeRequest(endpoint);

    if (result.success) {
      const strapiResponse = result.data as JapanInfoCollectionResponse;
      const articles = JapanInfoTransformer.fromStrapiCollection(strapiResponse.data || []);
      
      logger.debug('Popular articles fetched successfully from Strapi', {
        component: 'StrapiClient',
        data: { articles: articles.length }
      });

      return articles;
    }

    logger.error('Failed to fetch popular articles from Strapi', {
      component: 'StrapiClient',
      data: result.error
    });

    return [];
  }

  async searchArticles(
    filters: SearchFilters,
    page: number = 1,
    pageSize: number = 12
  ): Promise<{ articles: JapanInfo[]; pagination: any; totalResults: number; searchTime: number }> {
    logger.debug('Searching articles', {
      component: 'StrapiClient',
      function: 'searchArticles',
      data: { filters, page, pageSize }
    });
    
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

    const endpoint = `${this.config.strapi.apiEndpoint}?${queryParams.toString()}`;
    const result = await this.makeRequest(endpoint);

    if (result.success) {
      const strapiResponse = result.data as JapanInfoCollectionResponse;
      const articles = JapanInfoTransformer.fromStrapiCollection(strapiResponse.data || []);
      const searchTime = Date.now() - startTime;

      logger.debug('Search completed successfully via Strapi', {
        component: 'StrapiClient',
        data: { 
          results: articles.length,
          totalResults: strapiResponse.meta?.pagination?.total || 0,
          searchTime: `${searchTime}ms`
        }
      });

      return {
        articles,
        pagination: strapiResponse.meta?.pagination || { page: 1, pageSize: 12, pageCount: 0, total: 0 },
        totalResults: strapiResponse.meta?.pagination?.total || 0,
        searchTime
      };
    }

    const searchTime = Date.now() - startTime;
    logger.error('Search failed via Strapi', {
      component: 'StrapiClient',
      data: result.error
    });
    
    return { 
      articles: [], 
      pagination: { page: 1, pageSize: 12, pageCount: 0, total: 0 },
      totalResults: 0,
      searchTime
    };
  }

  async getArticleById(id: string, locale: string = 'ja'): Promise<JapanInfo | null> {
    logger.debug('Getting single article', {
      component: 'StrapiClient',
      function: 'getArticleById',
      data: { id, locale }
    });
    
    // 複数のロケールで検索を試行
    const locales = locale === 'ja' ? ['ja', 'ko'] : ['ko', 'ja'];
    
    for (const currentLocale of locales) {
      logger.debug(`Trying locale: ${currentLocale}`, { component: 'StrapiClient' });
      
      // コレクション検索で記事を探す（権限問題を回避）
      const searchParams = new URLSearchParams({
        'pagination[pageSize]': '100', // 全記事を取得
        'populate': '*',
      });
      
      // ロケールパラメータは条件付きで追加
      if (currentLocale) {
        searchParams.append('locale', currentLocale);
      }

      const collectionEndpoint = `${this.config.strapi.apiEndpoint}?${searchParams.toString()}`;
      const collectionResult = await this.makeRequest(collectionEndpoint);

      if (!collectionResult.success) {
        logger.debug(`Failed to get articles collection for locale ${currentLocale}`, {
          component: 'StrapiClient',
          data: collectionResult.error
        });
        continue; // 次のロケールを試行
      }

      const strapiResponse = collectionResult.data as JapanInfoCollectionResponse;
      if (!strapiResponse.data || strapiResponse.data.length === 0) {
        logger.debug(`No articles found in collection for locale ${currentLocale}`, {
          component: 'StrapiClient'
        });
        continue; // 次のロケールを試行
      }

      logger.debug(`Found ${strapiResponse.data.length} articles in locale ${currentLocale}`, {
        component: 'StrapiClient'
      });

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
          logger.debug(`Found matching article`, {
            component: 'StrapiClient',
            data: {
              articleId: article.id,
              documentId: data.documentId || article.documentId,
              customId: data.customId,
              slug: data.slug,
              title: data.title || article.title
            }
          });
        }
        
        return matches;
      });

      if (targetArticle) {
        const transformedArticle = JapanInfoTransformer.fromStrapi(targetArticle);
        logger.debug('Article found in collection', {
          component: 'StrapiClient',
          data: { 
            id: transformedArticle.id, 
            title: transformedArticle.title,
            locale: currentLocale
          }
        });
        
        return transformedArticle;
      }
      
      logger.debug(`Article not found in locale ${currentLocale}`, {
        component: 'StrapiClient',
        data: { 
          searchId: id, 
          availableIds: strapiResponse.data.slice(0, 5).map((a: any) => ({
            id: a.id,
            documentId: a.documentId,
            customId: a.customId || (a.attributes && a.attributes.customId),
            slug: a.slug || (a.attributes && a.attributes.slug),
            title: a.title || (a.attributes && a.attributes.title)
          }))
        }
      });
    }

    logger.debug('Article not found in any locale', {
      component: 'StrapiClient',
      data: { searchId: id, triedLocales: locales }
    });
    return null;
  }

  async getArticleBySlug(slug: string, locale: string = 'ja'): Promise<JapanInfo | null> {
    logger.debug('Getting article by slug', {
      component: 'StrapiClient',
      function: 'getArticleBySlug',
      data: { slug, locale }
    });
    
    const queryParams = new URLSearchParams({
      'filters[slug][$eq]': slug,
      'pagination[pageSize]': '1',
      'populate': '*',
      'locale': locale,
    });

    const endpoint = `${this.config.strapi.apiEndpoint}?${queryParams.toString()}`;
    const result = await this.makeRequest(endpoint);

    if (!result.success) {
      logger.error('Failed to get article by slug', {
        component: 'StrapiClient',
        data: result.error
      });
      return null;
    }

    const strapiResponse = result.data as JapanInfoCollectionResponse;
    if (!strapiResponse.data || strapiResponse.data.length === 0) {
      logger.debug('Article not found by slug', {
        component: 'StrapiClient',
        data: { slug }
      });
      return null;
    }

    const article = JapanInfoTransformer.fromStrapi(strapiResponse.data[0]);
    logger.debug('Article retrieved by slug', {
      component: 'StrapiClient',
      data: { slug, id: article.id, title: article.title }
    });

    return article;
  }
} 