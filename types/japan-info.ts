// ===================================
// Strapi v5 Japan Info Article 
// TypeScript型定義（拡張版）
// ===================================

// 既存のJapanInfo型（Supabase互換性のため保持）
export interface JapanInfo {
  id: string;
  title: string;
  korean_title?: string;
  description: string;
  korean_description?: string;
  image_url: string;
  images?: string[];
  content: string;
  korean_content?: string;
  tags?: string[];
  location?: string;
  is_popular?: boolean;
  published_at?: string;
  updated_at?: string;
  author?: string;
  views?: number;
  language?: string;
  embed_links?: {
    youtube?: string;
    instagram?: string;
    twitter?: string;
    [key: string]: string | undefined;
  };
  slug?: string;
}

// ===================================
// Strapi v5 新型定義
// ===================================

// Strapi基本型定義
export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiSingleResponse<T> {
  data: T;
  meta: Record<string, unknown>;
}

// 基本属性インターフェース
export interface StrapiAttributes {
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  locale: string;
}

// Japan Info Article型定義（Strapi v5）
export interface JapanInfoArticleAttributes extends StrapiAttributes {
  // 基本情報
  title: string;
  koreanTitle?: string;
  description: string;
  koreanDescription?: string;
  content: string;
  koreanContent?: string;
  
  // メディア
  imageUrl: string;
  images?: string[];
  
  // メタデータ
  tags?: string[];
  location?: string;
  slug: string;
  
  // フラグ・統計
  isPopular: boolean;
  views: number;
  author?: string;
  
  // 埋め込みコンテンツ
  embedLinks?: EmbedLink[];
}

export interface JapanInfoArticle {
  id: number;
  documentId: string;
  attributes: JapanInfoArticleAttributes;
}

// 埋め込みリンク型
export interface EmbedLink {
  type: 'video' | 'map' | 'iframe' | 'social';
  url: string;
  title?: string;
}

// API レスポンス型
export type JapanInfoArticlesResponse = StrapiResponse<JapanInfoArticle[]>;
export type JapanInfoArticleResponse = StrapiSingleResponse<JapanInfoArticle>;

// クエリパラメータ型
export interface ArticleQueryParams {
  locale?: string;
  populate?: string | string[];
  sort?: string | string[];
  filters?: ArticleFilters;
  pagination?: {
    page?: number;
    pageSize?: number;
  };
}

export interface ArticleFilters {
  title?: StringFilter;
  description?: StringFilter;
  content?: StringFilter;
  location?: StringFilter;
  tags?: StringArrayFilter;
  isPopular?: BooleanFilter;
  views?: NumberFilter;
  author?: StringFilter;
  publishedAt?: DateFilter;
  slug?: StringFilter;
  documentId?: StringFilter;
  $or?: any[];
}

// フィルター型
export interface StringFilter {
  $eq?: string;
  $ne?: string;
  $in?: string[];
  $notIn?: string[];
  $contains?: string;
  $notContains?: string;
  $startsWith?: string;
  $endsWith?: string;
}

export interface StringArrayFilter {
  $in?: string[];
  $contains?: string;
}

export interface BooleanFilter {
  $eq?: boolean;
  $ne?: boolean;
}

export interface NumberFilter {
  $eq?: number;
  $ne?: number;
  $gt?: number;
  $gte?: number;
  $lt?: number;
  $lte?: number;
  $in?: number[];
  $notIn?: number[];
}

export interface DateFilter {
  $eq?: string;
  $ne?: string;
  $gt?: string;
  $gte?: string;
  $lt?: string;
  $lte?: string;
  $between?: [string, string];
}

// 型変換ユーティリティ
export interface JapanInfoConversionUtils {
  strapiToJapanInfo: (strapiItem: JapanInfoArticle) => JapanInfo;
  japanInfoToStrapi: (japanInfo: JapanInfo) => Partial<JapanInfoArticleAttributes>;
}

// 検索・フィルター用型
export interface SearchFilters {
  query?: string;
  location?: string;
  tags?: string[];
  isPopular?: boolean;
  sortBy?: 'publishedAt' | 'views' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResults {
  articles: JapanInfo[];
  totalResults: number;
  searchTime: number;
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

// フロントエンド表示用型
export interface ArticleCardProps {
  article: JapanInfo;
  locale?: string;
  showMetadata?: boolean;
  imageSize?: 'thumbnail' | 'medium' | 'large';
}

export interface ArticleListProps {
  articles: JapanInfo[];
  pagination?: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
  locale?: string;
  loading?: boolean;
  error?: string | null;
}

export type Locale = 'ja' | 'ko' | 'en'; 