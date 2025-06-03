// ===================================
// Japan Info 統合サービス
// Strapi + Supabaseフォールバック
// ===================================

import { JapanInfo, SearchFilters, StrapiPaginationParams } from '@/types/japan-info';
import { StrapiClient } from '../clients/strapi';
import { SupabaseClient } from '../clients/supabase';
import { validateSupabaseConfig } from '../config/environment';
import { logger } from '../utils/logger';

export class JapanInfoService {
  private strapiClient: StrapiClient;
  private supabaseClient: SupabaseClient;
  private hasSupabaseFallback: boolean;

  constructor() {
    this.strapiClient = new StrapiClient();
    this.supabaseClient = new SupabaseClient();
    this.hasSupabaseFallback = validateSupabaseConfig().isValid;
  }

  async checkConnection(): Promise<{ strapi: boolean; supabase: boolean }> {
    const [strapiConnection, supabaseConnection] = await Promise.all([
      this.strapiClient.checkConnection(),
      this.hasSupabaseFallback ? this.supabaseClient.checkConnection() : Promise.resolve(false)
    ]);

    logger.info('Connection status check completed', {
      component: 'JapanInfoService',
      data: { strapi: strapiConnection, supabase: supabaseConnection }
    });

    return {
      strapi: strapiConnection,
      supabase: supabaseConnection
    };
  }

  async getAllArticles(options: StrapiPaginationParams = {}): Promise<{ articles: JapanInfo[]; pagination: any }> {
    logger.debug('Getting all Japan Info articles', {
      component: 'JapanInfoService',
      function: 'getAllArticles',
      data: options
    });

    // まずStrapiを試行
    const strapiResult = await this.strapiClient.getAllArticles(options);
    
    if (strapiResult.articles.length > 0) {
      logger.debug('Articles successfully fetched from Strapi', {
        component: 'JapanInfoService',
        data: { count: strapiResult.articles.length }
      });
      return strapiResult;
    }

    // Strapiが失敗した場合、Supabaseフォールバックを試行
    if (this.hasSupabaseFallback) {
      logger.warn('Strapi failed, attempting Supabase fallback', {
        component: 'JapanInfoService'
      });
      
      const supabaseResult = await this.supabaseClient.getAllArticles({
        page: options.page,
        pageSize: options.pageSize,
        sortBy: options.sortBy === 'publishedAt' ? 'published_at' : options.sortBy,
        sortOrder: options.sortOrder
      });
      
      return supabaseResult;
    }

    // 両方失敗した場合
    logger.error('Both Strapi and Supabase failed', {
      component: 'JapanInfoService'
    });
    
    return {
      articles: [],
      pagination: { page: 1, pageSize: 12, pageCount: 0, total: 0 }
    };
  }

  async getPopularArticles(locale: string = 'ja', limit: number = 6): Promise<JapanInfo[]> {
    logger.debug('Getting popular Japan Info articles', {
      component: 'JapanInfoService',
      function: 'getPopularArticles',
      data: { locale, limit }
    });

    // まずStrapiを試行
    const strapiResult = await this.strapiClient.getPopularArticles(locale, limit);
    
    if (strapiResult.length > 0) {
      logger.debug('Popular articles successfully fetched from Strapi', {
        component: 'JapanInfoService',
        data: { count: strapiResult.length }
      });
      return strapiResult;
    }

    // Strapiが失敗した場合、Supabaseフォールバックを試行
    if (this.hasSupabaseFallback) {
      logger.warn('Strapi failed for popular articles, attempting Supabase fallback', {
        component: 'JapanInfoService'
      });
      
      const supabaseResult = await this.supabaseClient.getPopularArticles(limit);
      return supabaseResult;
    }

    // 両方失敗した場合
    logger.error('Both Strapi and Supabase failed for popular articles', {
      component: 'JapanInfoService'
    });
    
    return [];
  }

  async searchArticles(
    filters: SearchFilters,
    page: number = 1,
    pageSize: number = 12
  ): Promise<{ articles: JapanInfo[]; pagination: any; totalResults: number; searchTime: number }> {
    logger.debug('Searching articles', {
      component: 'JapanInfoService',
      function: 'searchArticles',
      data: { filters, page, pageSize }
    });
    
    const startTime = Date.now();
    
    // まずStrapiを試行
    const strapiResult = await this.strapiClient.searchArticles(filters, page, pageSize);
    
    if (strapiResult.articles.length > 0 || !this.hasSupabaseFallback) {
      logger.debug('Search completed via Strapi', {
        component: 'JapanInfoService',
        data: { count: strapiResult.articles.length }
      });
      return strapiResult;
    }

    // Strapiが失敗した場合、Supabaseフォールバックを試行
    logger.warn('Strapi search failed, attempting Supabase fallback', {
      component: 'JapanInfoService'
    });
    
    const supabaseResult = await this.supabaseClient.searchArticles(filters, page, pageSize);
    
    return supabaseResult;
  }

  async getArticleById(id: string, locale: string = 'ja'): Promise<JapanInfo | null> {
    logger.debug('Getting Japan Info article by ID', {
      component: 'JapanInfoService',
      function: 'getArticleById',
      data: { id, locale }
    });

    // まずStrapiを試行
    const strapiResult = await this.strapiClient.getArticleById(id, locale);
    
    if (strapiResult) {
      logger.debug('Article successfully fetched from Strapi', {
        component: 'JapanInfoService',
        data: { id, title: strapiResult.title }
      });
      return strapiResult;
    }

    // Strapiが失敗した場合、Supabaseフォールバックを試行
    if (this.hasSupabaseFallback) {
      logger.warn('Strapi failed for article by ID, attempting Supabase fallback', {
        component: 'JapanInfoService',
        data: { id }
      });
      
      const supabaseResult = await this.supabaseClient.getArticleById(id);
      
      if (supabaseResult) {
        logger.debug('Article successfully fetched from Supabase fallback', {
          component: 'JapanInfoService',
          data: { id, title: supabaseResult.title }
        });
      }
      
      return supabaseResult;
    }

    // 両方失敗した場合
    logger.error('Both Strapi and Supabase failed for article by ID', {
      component: 'JapanInfoService',
      data: { id }
    });
    
    return null;
  }

  async getArticleBySlug(slug: string, locale: string = 'ja'): Promise<JapanInfo | null> {
    logger.debug('Getting article by slug', {
      component: 'JapanInfoService',
      function: 'getArticleBySlug',
      data: { slug, locale }
    });
    
    // Strapiのみでスラッグ検索（Supabaseはスラッグをサポートしていない）
    const result = await this.strapiClient.getArticleBySlug(slug, locale);
    
    if (result) {
      logger.debug('Article retrieved by slug', {
        component: 'JapanInfoService',
        data: { slug, id: result.id, title: result.title }
      });
    } else {
      logger.debug('Article not found by slug', {
        component: 'JapanInfoService',
        data: { slug }
      });
    }

    return result;
  }
}

// シングルトンインスタンス
export const japanInfoService = new JapanInfoService();

// 従来の関数も互換性のため提供
export const getAllJapanInfoArticles = (options?: StrapiPaginationParams) => 
  japanInfoService.getAllArticles(options);

export const getPopularJapanInfoArticles = (locale?: string, limit?: number) => 
  japanInfoService.getPopularArticles(locale, limit);

export const searchJapanInfoArticles = (filters: SearchFilters, page?: number, pageSize?: number) => 
  japanInfoService.searchArticles(filters, page, pageSize);

export const getJapanInfoArticleById = (id: string, locale?: string) => 
  japanInfoService.getArticleById(id, locale);

export const getJapanInfoArticleBySlug = (slug: string, locale?: string) => 
  japanInfoService.getArticleBySlug(slug, locale);

export const checkStrapiConnection = async () => {
  const status = await japanInfoService.checkConnection();
  return status.strapi;
};

// レガシー関数名も対応
export const getJapanInfoArticle = getJapanInfoArticleById; 