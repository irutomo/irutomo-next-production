// ===================================
// Next.js App Router実装例
// Strapi v5 Japan Info Article
// ===================================

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { 
  JapanInfoArticle, 
  JapanInfoArticlesResponse, 
  JapanInfoArticleResponse,
  ArticleQueryParams 
} from './typescript-types';

// ===================================
// API クライアント実装
// ===================================

class StrapiApiClient {
  private baseUrl: string;
  private defaultParams: Record<string, unknown>;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337') {
    this.baseUrl = baseUrl;
    this.defaultParams = {
      populate: '*',
    };
  }

  private async request<T>(
    endpoint: string, 
    params?: ArticleQueryParams
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    // パラメータをURLSearchParamsに変換
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries({ ...this.defaultParams, ...params }).forEach(([key, value]) => {
        if (value !== undefined) {
          if (typeof value === 'object') {
            searchParams.append(key, JSON.stringify(value));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
    }
    
    url.search = searchParams.toString();

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
      next: {
        revalidate: 300, // 5分キャッシュ
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getArticles(params?: ArticleQueryParams): Promise<JapanInfoArticlesResponse> {
    return this.request<JapanInfoArticlesResponse>('/api/japan-info-articles', params);
  }

  async getArticle(documentId: string, params?: ArticleQueryParams): Promise<JapanInfoArticleResponse> {
    return this.request<JapanInfoArticleResponse>(`/api/japan-info-articles/${documentId}`, params);
  }

  async getPopularArticles(params?: ArticleQueryParams): Promise<JapanInfoArticlesResponse> {
    return this.request<JapanInfoArticlesResponse>('/api/japan-info-articles', {
      ...params,
      filters: {
        isPopular: { $eq: true },
        ...params?.filters,
      },
      sort: ['views:desc'],
    });
  }

  async getRelatedArticles(
    currentArticleId: string, 
    params?: ArticleQueryParams
  ): Promise<JapanInfoArticlesResponse> {
    return this.request<JapanInfoArticlesResponse>('/api/japan-info-articles', {
      ...params,
      filters: {
        documentId: { $ne: currentArticleId },
        ...params?.filters,
      },
      pagination: {
        pageSize: 3,
        ...params?.pagination,
      },
    });
  }
}

const strapiClient = new StrapiApiClient();

// ===================================
// ユーティリティ関数
// ===================================

function getLocalizedField(
  article: JapanInfoArticle, 
  field: string, 
  locale: string = 'ja'
): string {
  const { attributes } = article;
  
  if (locale === 'ko') {
    const koreanField = `korean${field.charAt(0).toUpperCase() + field.slice(1)}`;
    return (attributes as any)[koreanField] || (attributes as any)[field] || '';
  }
  
  return (attributes as any)[field] || '';
}

function formatDate(dateString: string, locale: string = 'ja'): string {
  const date = new Date(dateString);
  
  if (locale === 'ja') {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }
  
  if (locale === 'ko') {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

function generateSeoMeta(article: JapanInfoArticle, locale: string = 'ja'): Metadata {
  const title = getLocalizedField(article, 'title', locale);
  const description = getLocalizedField(article, 'description', locale);
  const imageUrl = article.attributes.imageUrl;
  
  return {
    title: `${title} | IRUTOMO`,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: 'article',
      publishedTime: article.attributes.publishedAt || undefined,
      modifiedTime: article.attributes.updatedAt,
      authors: article.attributes.author ? [article.attributes.author] : undefined,
      tags: article.attributes.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

// ===================================
// コンポーネント実装
// ===================================

// 記事カードコンポーネント
interface ArticleCardProps {
  article: JapanInfoArticle;
  locale?: string;
  priority?: boolean;
}

function ArticleCard({ article, locale = 'ja', priority = false }: ArticleCardProps) {
  const title = getLocalizedField(article, 'title', locale);
  const description = getLocalizedField(article, 'description', locale);
  const { attributes } = article;

  return (
    <Link 
      href={`/japan-info/${article.documentId}`}
      className="group block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      <div className="relative aspect-video">
        <Image
          src={attributes.imageUrl}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          priority={priority}
        />
        {attributes.isPopular && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            {locale === 'ja' ? '人気' : locale === 'ko' ? '인기' : 'Popular'}
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          {description}
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            {attributes.publishedAt && (
              <span>{formatDate(attributes.publishedAt, locale)}</span>
            )}
            {attributes.location && (
              <span className="flex items-center">
                <span>📍</span>
                <span className="ml-1">{attributes.location}</span>
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {attributes.views > 0 && (
              <span>{attributes.views.toLocaleString()} views</span>
            )}
          </div>
        </div>
        
        {attributes.tags && attributes.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {attributes.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
            {attributes.tags.length > 3 && (
              <span className="text-gray-500 text-xs">
                +{attributes.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

// 記事一覧コンポーネント
interface ArticleListProps {
  articles: JapanInfoArticle[];
  locale?: string;
}

function ArticleList({ articles, locale = 'ja' }: ArticleListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article, index) => (
        <ArticleCard
          key={article.documentId}
          article={article}
          locale={locale}
          priority={index < 3}
        />
      ))}
    </div>
  );
}

// ページネーションコンポーネント
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  return (
    <nav className="flex justify-center space-x-2 mt-8">
      {currentPage > 1 && (
        <Link
          href={`${basePath}?page=${currentPage - 1}`}
          className="px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition-colors"
        >
          前へ
        </Link>
      )}
      
      {pages.map((page) => (
        <Link
          key={page}
          href={`${basePath}?page=${page}`}
          className={`px-3 py-2 rounded-md transition-colors ${
            page === currentPage
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          {page}
        </Link>
      ))}
      
      {currentPage < totalPages && (
        <Link
          href={`${basePath}?page=${currentPage + 1}`}
          className="px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition-colors"
        >
          次へ
        </Link>
      )}
    </nav>
  );
}

// ===================================
// ページコンポーネント実装
// ===================================

// 記事一覧ページ
interface ArticlesPageProps {
  searchParams: {
    page?: string;
    locale?: string;
    popular?: string;
  };
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const page = parseInt(searchParams.page || '1');
  const locale = searchParams.locale || 'ja';
  const showPopularOnly = searchParams.popular === 'true';

  try {
    const response = showPopularOnly
      ? await strapiClient.getPopularArticles({
          locale,
          pagination: { page, pageSize: 12 },
        })
      : await strapiClient.getArticles({
          locale,
          pagination: { page, pageSize: 12 },
          sort: ['publishedAt:desc'],
        });

    const { data: articles, meta } = response;

    return (
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-4">
            {locale === 'ja' ? '日本情報記事' : locale === 'ko' ? '일본 정보 기사' : 'Japan Info Articles'}
          </h1>
          
          <div className="flex space-x-4">
            <Link
              href="/japan-info"
              className={`px-4 py-2 rounded-md transition-colors ${
                !showPopularOnly ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {locale === 'ja' ? 'すべて' : locale === 'ko' ? '전체' : 'All'}
            </Link>
            <Link
              href="/japan-info?popular=true"
              className={`px-4 py-2 rounded-md transition-colors ${
                showPopularOnly ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {locale === 'ja' ? '人気記事' : locale === 'ko' ? '인기 기사' : 'Popular'}
            </Link>
          </div>
        </header>

        {articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {locale === 'ja' ? '記事が見つかりませんでした' : 
               locale === 'ko' ? '기사를 찾을 수 없습니다' : 
               'No articles found'}
            </p>
          </div>
        ) : (
          <>
            <ArticleList articles={articles} locale={locale} />
            
            {meta.pagination.pageCount > 1 && (
              <Pagination
                currentPage={meta.pagination.page}
                totalPages={meta.pagination.pageCount}
                basePath="/japan-info"
              />
            )}
          </>
        )}
      </div>
    );
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-red-600">
            {locale === 'ja' ? 'エラーが発生しました' : 
             locale === 'ko' ? '오류가 발생했습니다' : 
             'An error occurred'}
          </p>
        </div>
      </div>
    );
  }
}

// 記事詳細ページ
interface ArticlePageProps {
  params: {
    documentId: string;
  };
  searchParams: {
    locale?: string;
  };
}

export async function generateMetadata({ params, searchParams }: ArticlePageProps): Promise<Metadata> {
  const locale = searchParams.locale || 'ja';
  
  try {
    const response = await strapiClient.getArticle(params.documentId, { locale });
    return generateSeoMeta(response.data, locale);
  } catch {
    return {
      title: 'Article Not Found | IRUTOMO',
      description: 'The requested article could not be found.',
    };
  }
}

export default async function ArticlePage({ params, searchParams }: ArticlePageProps) {
  const locale = searchParams.locale || 'ja';
  
  try {
    const [articleResponse, relatedResponse] = await Promise.all([
      strapiClient.getArticle(params.documentId, { locale }),
      strapiClient.getRelatedArticles(params.documentId, { 
        locale,
        pagination: { pageSize: 3 },
      }),
    ]);

    const article = articleResponse.data;
    const relatedArticles = relatedResponse.data;
    
    const title = getLocalizedField(article, 'title', locale);
    const content = getLocalizedField(article, 'content', locale);

    return (
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{title}</h1>
          
          <div className="flex items-center space-x-4 text-gray-600 mb-4">
            {article.attributes.publishedAt && (
              <time>{formatDate(article.attributes.publishedAt, locale)}</time>
            )}
            {article.attributes.author && (
              <span>by {article.attributes.author}</span>
            )}
            {article.attributes.location && (
              <span className="flex items-center">
                <span>📍</span>
                <span className="ml-1">{article.attributes.location}</span>
              </span>
            )}
          </div>
          
          {article.attributes.tags && (
            <div className="flex flex-wrap gap-2 mb-6">
              {article.attributes.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="relative aspect-video mb-8">
          <Image
            src={article.attributes.imageUrl}
            alt={title}
            fill
            className="object-cover rounded-lg"
            priority
          />
        </div>

        <div 
          className="prose prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {article.attributes.embedLinks && article.attributes.embedLinks.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">
              {locale === 'ja' ? '関連リンク' : locale === 'ko' ? '관련 링크' : 'Related Links'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {article.attributes.embedLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{link.type}</span>
                    <span className="font-medium">{link.title || link.url}</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {relatedArticles.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">
              {locale === 'ja' ? '関連記事' : locale === 'ko' ? '관련 기사' : 'Related Articles'}
            </h2>
            <ArticleList articles={relatedArticles} locale={locale} />
          </section>
        )}
      </article>
    );
  } catch (error) {
    console.error('Failed to fetch article:', error);
    notFound();
  }
}

// ===================================
// カスタムフック実装例
// ===================================

'use client';

import { useState, useEffect } from 'react';
import { UseArticlesReturn, ArticleQueryParams } from './typescript-types';

export function useArticles(params?: ArticleQueryParams): UseArticlesReturn {
  const [state, setState] = useState<{
    articles: JapanInfoArticle[];
    pagination: UseArticlesReturn['pagination'];
    loading: boolean;
    error: string | null;
  }>({
    articles: [],
    pagination: null,
    loading: true,
    error: null,
  });

  const fetchArticles = async (newParams?: ArticleQueryParams) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await strapiClient.getArticles({ ...params, ...newParams });
      
      setState(prev => ({
        ...prev,
        articles: response.data,
        pagination: response.meta.pagination,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An error occurred',
        loading: false,
      }));
    }
  };

  const loadMore = async () => {
    if (!state.pagination || state.pagination.page >= state.pagination.pageCount) {
      return;
    }

    try {
      const response = await strapiClient.getArticles({
        ...params,
        pagination: {
          ...params?.pagination,
          page: state.pagination.page + 1,
        },
      });

      setState(prev => ({
        ...prev,
        articles: [...prev.articles, ...response.data],
        pagination: response.meta.pagination,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  return {
    ...state,
    refetch: () => fetchArticles(),
    loadMore,
    hasNextPage: state.pagination 
      ? state.pagination.page < state.pagination.pageCount 
      : false,
  };
} 