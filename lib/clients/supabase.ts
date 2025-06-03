// ===================================
// Supabase専用クライアント（フォールバック用）
// ===================================

import { createClient } from '@supabase/supabase-js';
import { JapanInfo, SearchFilters } from '@/types/japan-info';
import { getEnvironmentConfig, validateSupabaseConfig } from '../config/environment';
import { logger } from '../utils/logger';
import { JapanInfoTransformer, SupabaseJapanInfoRow } from '../transformers/japan-info';

export class SupabaseClient {
  private client: any = null;
  private config = getEnvironmentConfig();

  private getClient() {
    if (!this.client && this.config.supabase.url && this.config.supabase.anonKey) {
      this.client = createClient(this.config.supabase.url, this.config.supabase.anonKey);
    }
    return this.client;
  }

  private validateConfig(): boolean {
    const validation = validateSupabaseConfig();
    if (!validation.isValid) {
      logger.error('Supabase configuration validation failed', {
        component: 'SupabaseClient',
        data: validation.errors
      });
      return false;
    }
    return true;
  }

  async checkConnection(): Promise<boolean> {
    if (!this.validateConfig()) {
      return false;
    }

    try {
      const client = this.getClient();
      if (!client) {
        return false;
      }

      const { data, error } = await client
        .from('japan_info')
        .select('id')
        .limit(1);

      if (error) {
        logger.error('Supabase connection check failed', {
          component: 'SupabaseClient',
          data: error
        });
        return false;
      }

      logger.debug('Supabase connection successful', {
        component: 'SupabaseClient',
        data: { hasData: !!data }
      });

      return true;
    } catch (error) {
      logger.error('Supabase connection check failed', {
        component: 'SupabaseClient',
        data: error
      });
      return false;
    }
  }

  async getAllArticles(options: {
    page?: number;
    pageSize?: number;
    isPopular?: boolean;
    query?: string;
    location?: string;
    tags?: string[];
    sortBy?: string;
    sortOrder?: string;
  } = {}): Promise<{ articles: JapanInfo[]; pagination: any }> {
    if (!this.validateConfig()) {
      return {
        articles: [],
        pagination: { page: 1, pageSize: 12, pageCount: 0, total: 0 }
      };
    }

    try {
      const client = this.getClient();
      if (!client) {
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

      let supabaseQuery = client.from('japan_info').select('*', { count: 'exact' });

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
      const articles = JapanInfoTransformer.fromSupabaseCollection(data as SupabaseJapanInfoRow[] || []);
      const totalPages = Math.ceil((count || 0) / pageSize);

      logger.warn('Using Supabase fallback for Japan Info data', {
        component: 'SupabaseClient',
        data: {
          articlesFound: articles.length,
          totalCount: count,
          page,
          totalPages
        }
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
      logger.error('Supabase fallback failed', {
        component: 'SupabaseClient',
        data: error
      });
      return {
        articles: [],
        pagination: { page: 1, pageSize: 12, pageCount: 0, total: 0 }
      };
    }
  }

  async getArticleById(id: string): Promise<JapanInfo | null> {
    if (!this.validateConfig()) {
      return null;
    }

    try {
      const client = this.getClient();
      if (!client) {
        throw new Error('Supabase client is not available');
      }

      const { data, error } = await client
        .from('japan_info')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        logger.debug('Article not found in Supabase', {
          component: 'SupabaseClient',
          data: { id, error }
        });
        return null;
      }

      const article = JapanInfoTransformer.fromSupabase(data as SupabaseJapanInfoRow);

      logger.debug('Article retrieved from Supabase', {
        component: 'SupabaseClient',
        data: { id, title: article.title }
      });

      return article;
    } catch (error) {
      logger.error('Supabase fallback failed for single article', {
        component: 'SupabaseClient',
        data: error
      });
      return null;
    }
  }

  async searchArticles(
    filters: SearchFilters,
    page: number = 1,
    pageSize: number = 12
  ): Promise<{ articles: JapanInfo[]; pagination: any; totalResults: number; searchTime: number }> {
    const startTime = Date.now();

    const result = await this.getAllArticles({
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

    logger.warn('Search completed via Supabase fallback', {
      component: 'SupabaseClient',
      data: {
        results: result.articles.length,
        totalResults: result.pagination.total,
        searchTime: `${searchTime}ms`
      }
    });

    return {
      articles: result.articles,
      pagination: result.pagination,
      totalResults: result.pagination.total,
      searchTime
    };
  }

  async getPopularArticles(limit: number = 6): Promise<JapanInfo[]> {
    const result = await this.getAllArticles({
      pageSize: limit,
      isPopular: true,
      sortBy: 'views',
      sortOrder: 'desc'
    });

    logger.warn('Popular articles retrieved via Supabase fallback', {
      component: 'SupabaseClient',
      data: { articles: result.articles.length }
    });

    return result.articles;
  }
} 