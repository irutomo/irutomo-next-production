// ===================================
// Strapi v5 Japan Info Article
// TypeScript型定義ファイル
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

// Japan Info Article型定義
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

// フロントエンド表示用型
export interface ArticleCardProps {
  article: JapanInfoArticle;
  locale?: string;
  showMetadata?: boolean;
  imageSize?: 'thumbnail' | 'medium' | 'large';
}

export interface ArticleListProps {
  articles: JapanInfoArticle[];
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
  locale?: string;
  loading?: boolean;
  error?: string | null;
}

export interface ArticleDetailProps {
  article: JapanInfoArticle;
  relatedArticles?: JapanInfoArticle[];
  locale?: string;
}

// API クライアント型
export interface StrapiApiClient {
  // 記事一覧取得
  getArticles(params?: ArticleQueryParams): Promise<JapanInfoArticlesResponse>;
  
  // 記事詳細取得
  getArticle(documentId: string, params?: ArticleQueryParams): Promise<JapanInfoArticleResponse>;
  
  // 人気記事取得
  getPopularArticles(params?: Omit<ArticleQueryParams, 'filters'>): Promise<JapanInfoArticlesResponse>;
  
  // 関連記事取得
  getRelatedArticles(currentArticleId: string, params?: ArticleQueryParams): Promise<JapanInfoArticlesResponse>;
  
  // 記事検索
  searchArticles(query: string, params?: ArticleQueryParams): Promise<JapanInfoArticlesResponse>;
}

// フック戻り値型
export interface UseArticlesReturn {
  articles: JapanInfoArticle[];
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  } | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasNextPage: boolean;
}

export interface UseArticleReturn {
  article: JapanInfoArticle | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// 設定型
export interface StrapiConfig {
  apiUrl: string;
  apiVersion: string;
  defaultLocale: string;
  supportedLocales: string[];
  timeout: number;
  retries: number;
}

export interface CacheConfig {
  enabled: boolean;
  ttl: {
    articlesList: number;
    articleDetail: number;
    popularArticles: number;
  };
}

// エラー型
export interface StrapiError {
  status: number;
  name: string;
  message: string;
  details?: Record<string, unknown>;
}

// ユーティリティ型
export type Locale = 'ja' | 'ko' | 'en';
export type SortOrder = 'asc' | 'desc';
export type ImageSize = 'thumbnail' | 'medium' | 'large';

// 記事表示用のローカライズされたフィールド
export interface LocalizedArticleFields {
  title: string;
  description: string;
  content: string;
}

// SEO用メタデータ型
export interface ArticleSeoMeta {
  title: string;
  description: string;
  image: string;
  url: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
}

// コンポーネント用プロップス型
export interface ArticleImageProps {
  src: string;
  alt: string;
  size?: ImageSize;
  className?: string;
  loading?: 'lazy' | 'eager';
}

export interface ArticleTagsProps {
  tags: string[];
  maxDisplay?: number;
  clickable?: boolean;
  onTagClick?: (tag: string) => void;
}

export interface ArticleMetadataProps {
  publishedAt: string;
  views?: number;
  author?: string;
  location?: string;
  locale?: string;
  compact?: boolean;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxButtons?: number;
}

// 検索・フィルター用型
export interface SearchFilters {
  query?: string;
  location?: string;
  tags?: string[];
  isPopular?: boolean;
  sortBy?: 'publishedAt' | 'views' | 'title';
  sortOrder?: SortOrder;
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface SearchResults {
  articles: JapanInfoArticle[];
  totalResults: number;
  searchTime: number;
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

// イベント型
export interface ArticleViewEvent {
  articleId: string;
  documentId: string;
  title: string;
  locale: string;
  timestamp: number;
}

export interface ArticleShareEvent {
  articleId: string;
  documentId: string;
  title: string;
  platform: 'twitter' | 'facebook' | 'line' | 'copy';
  timestamp: number;
}

// カスタムフック用の設定型
export interface UseArticlesOptions {
  initialPage?: number;
  pageSize?: number;
  locale?: string;
  filters?: SearchFilters;
  sortBy?: string;
  sortOrder?: SortOrder;
  enableCache?: boolean;
  enableInfiniteScroll?: boolean;
}

export interface UseArticleOptions {
  locale?: string;
  enableCache?: boolean;
  enableRelatedArticles?: boolean;
  relatedArticlesCount?: number;
}

// 状態管理用型（Redux/Zustand等）
export interface ArticlesState {
  articles: JapanInfoArticle[];
  currentArticle: JapanInfoArticle | null;
  popularArticles: JapanInfoArticle[];
  searchResults: SearchResults | null;
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  } | null;
  loading: {
    articles: boolean;
    currentArticle: boolean;
    popularArticles: boolean;
    search: boolean;
  };
  error: {
    articles: string | null;
    currentArticle: string | null;
    popularArticles: string | null;
    search: string | null;
  };
  filters: SearchFilters;
  locale: string;
}

export interface ArticlesActions {
  // データ取得
  fetchArticles: (params?: ArticleQueryParams) => Promise<void>;
  fetchArticle: (documentId: string, params?: ArticleQueryParams) => Promise<void>;
  fetchPopularArticles: (params?: ArticleQueryParams) => Promise<void>;
  searchArticles: (query: string, params?: ArticleQueryParams) => Promise<void>;
  
  // 状態更新
  setFilters: (filters: Partial<SearchFilters>) => void;
  setLocale: (locale: string) => void;
  clearCurrentArticle: () => void;
  clearSearchResults: () => void;
  
  // エラー処理
  clearError: (errorType: keyof ArticlesState['error']) => void;
}

// 設定ファイル用型（YAML設定の型安全版）
export interface FrontendConfig {
  api: {
    base: {
      url: string;
      version: string;
      timeout: number;
      retries: number;
    };
    endpoints: {
      japan_info: {
        collection: string;
        single: string;
        draft: string;
        popular: string;
      };
    };
    locales: {
      default: string;
      supported: string[];
      fallback: string;
    };
  };
  frontend: {
    list_view: {
      page_size: number;
      sort_by: string;
      sort_order: string;
      display_fields: string[];
    };
    detail_view: {
      display_fields: string[];
      seo: {
        title_field: string;
        description_field: string;
        image_field: string;
        canonical_base: string;
      };
    };
  };
  cache: {
    articles_list: {
      ttl: number;
      key_pattern: string;
    };
    article_detail: {
      ttl: number;
      key_pattern: string;
    };
  };
}

export default JapanInfoArticle; 