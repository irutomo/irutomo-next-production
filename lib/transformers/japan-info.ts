// ===================================
// Japan Info データ変換ロジック
// ===================================

import { JapanInfo } from '@/types/japan-info';
import { logger } from '../utils/logger';

export interface SupabaseJapanInfoRow {
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

export class JapanInfoTransformer {
  static fromStrapi(strapiArticle: any): JapanInfo {
    logger.debug('Transforming Strapi article', {
      component: 'JapanInfoTransformer',
      function: 'fromStrapi',
      data: { id: strapiArticle.id, title: strapiArticle.title }
    });
    
    // Strapi v5では、attributesではなく直接プロパティとしてデータが格納される
    const data = strapiArticle.attributes || strapiArticle;
    
    // カスタムIDがある場合はそれを使用、なければStrapiのIDを文字列として使用
    const customId = data.customId || data.slug || data.documentId || strapiArticle.id?.toString();
    
    // タイトルのフォールバック処理
    const title = data.title || data.koreanTitle || `記事 ${strapiArticle.id}`;
    const description = data.description || data.koreanDescription || '';
    const content = data.content || data.koreanContent || '';
    
    // 画像URLの取得（複数のフィールド名に対応）
    const imageUrl = data.imageUrl || 
                     data.featured_image?.data?.attributes?.url || 
                     data.featuredImage?.data?.attributes?.url || 
                     data.image?.data?.attributes?.url || null;

    return {
      id: customId,
      title: title,
      korean_title: data.koreanTitle || title,
      description: description,
      korean_description: data.koreanDescription || description,
      content: content,
      korean_content: data.koreanContent || content,
      featured_image: imageUrl,
      image_url: imageUrl,  // 後方互換性のため
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

  static fromSupabase(item: SupabaseJapanInfoRow): JapanInfo {
    logger.debug('Transforming Supabase article', {
      component: 'JapanInfoTransformer',
      function: 'fromSupabase',
      data: { id: item.id, title: item.title }
    });

    return {
      id: item.id.toString(),
      title: item.title,
      korean_title: item.korean_title || item.title,
      description: item.description,
      korean_description: item.korean_description || item.description,
      content: item.content,
      korean_content: item.korean_content || item.content,
      featured_image: item.image_url,
      image_url: item.image_url,  // 後方互換性のため
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
  }

  static fromStrapiCollection(strapiArticles: any[]): JapanInfo[] {
    return strapiArticles.map(article => this.fromStrapi(article));
  }

  static fromSupabaseCollection(supabaseRows: SupabaseJapanInfoRow[]): JapanInfo[] {
    return supabaseRows.map(row => this.fromSupabase(row));
  }
} 