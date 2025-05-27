// ===================================
// React Components & API Client
// Strapi v5 Japan Info Article
// ===================================

import React, { useState, useEffect } from 'react';

// 型定義をインポート
import { 
  JapanInfoArticle, 
  JapanInfoArticlesResponse, 
  JapanInfoArticleResponse 
} from './typescript-types';

// ===================================
// APIクライアント（シンプル版）
// ===================================

export class StrapiClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:1337') {
    this.baseUrl = baseUrl;
  }

  async getArticles(locale: string = 'ja'): Promise<JapanInfoArticlesResponse> {
    const response = await fetch(
      `${this.baseUrl}/api/japan-info-articles?locale=${locale}&populate=*&sort=publishedAt:desc`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async getArticle(documentId: string, locale: string = 'ja'): Promise<JapanInfoArticleResponse> {
    const response = await fetch(
      `${this.baseUrl}/api/japan-info-articles/${documentId}?locale=${locale}&populate=*`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async getPopularArticles(locale: string = 'ja'): Promise<JapanInfoArticlesResponse> {
    const response = await fetch(
      `${this.baseUrl}/api/japan-info-articles?locale=${locale}&populate=*&filters[isPopular][$eq]=true&sort=views:desc`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
}

// クライアントインスタンス
export const strapiClient = new StrapiClient();

// ===================================
// ユーティリティ関数
// ===================================

export function getLocalizedTitle(article: JapanInfoArticle, locale: string = 'ja'): string {
  if (locale === 'ko' && article.attributes.koreanTitle) {
    return article.attributes.koreanTitle;
  }
  return article.attributes.title;
}

export function getLocalizedDescription(article: JapanInfoArticle, locale: string = 'ja'): string {
  if (locale === 'ko' && article.attributes.koreanDescription) {
    return article.attributes.koreanDescription;
  }
  return article.attributes.description;
}

export function getLocalizedContent(article: JapanInfoArticle, locale: string = 'ja'): string {
  if (locale === 'ko' && article.attributes.koreanContent) {
    return article.attributes.koreanContent;
  }
  return article.attributes.content;
}

export function formatJapaneseDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// ===================================
// React コンポーネント
// ===================================

// 記事カードコンポーネント
interface ArticleCardProps {
  article: JapanInfoArticle;
  locale?: string;
  onArticleClick?: (article: JapanInfoArticle) => void;
}

export function ArticleCard({ article, locale = 'ja', onArticleClick }: ArticleCardProps) {
  const title = getLocalizedTitle(article, locale);
  const description = getLocalizedDescription(article, locale);
  const { attributes } = article;

  const handleClick = () => {
    if (onArticleClick) {
      onArticleClick(article);
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
      onClick={handleClick}
    >
      {/* 画像 */}
      <div className="relative h-48 bg-gray-200">
        <img
          src={attributes.imageUrl}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {attributes.isPopular && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            {locale === 'ja' ? '人気' : locale === 'ko' ? '인기' : 'Popular'}
          </div>
        )}
      </div>
      
      {/* コンテンツ */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-2">
          {title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          {description}
        </p>
        
        {/* メタデータ */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div>
            {attributes.publishedAt && (
              <span>{formatJapaneseDate(attributes.publishedAt)}</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {attributes.views > 0 && (
              <span>{attributes.views.toLocaleString()} views</span>
            )}
            {attributes.location && (
              <span>📍{attributes.location}</span>
            )}
          </div>
        </div>
        
        {/* タグ */}
        {attributes.tags && attributes.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {attributes.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
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
    </div>
  );
}

// 記事一覧コンポーネント
interface ArticleListProps {
  articles: JapanInfoArticle[];
  locale?: string;
  loading?: boolean;
  error?: string | null;
  onArticleClick?: (article: JapanInfoArticle) => void;
}

export function ArticleList({ 
  articles, 
  locale = 'ja', 
  loading = false, 
  error = null,
  onArticleClick 
}: ArticleListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-gray-200 rounded-lg h-64 animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">
          {locale === 'ja' ? 'エラーが発生しました' : 
           locale === 'ko' ? '오류가 발생했습니다' : 
           'An error occurred'}: {error}
        </p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">
          {locale === 'ja' ? '記事が見つかりませんでした' : 
           locale === 'ko' ? '기사를 찾을 수 없습니다' : 
           'No articles found'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <ArticleCard
          key={article.documentId}
          article={article}
          locale={locale}
          onArticleClick={onArticleClick}
        />
      ))}
    </div>
  );
}

// 記事詳細コンポーネント
interface ArticleDetailProps {
  article: JapanInfoArticle;
  locale?: string;
  onBack?: () => void;
}

export function ArticleDetail({ article, locale = 'ja', onBack }: ArticleDetailProps) {
  const title = getLocalizedTitle(article, locale);
  const content = getLocalizedContent(article, locale);
  const { attributes } = article;

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <header className="mb-8">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
          >
            ← {locale === 'ja' ? '戻る' : locale === 'ko' ? '돌아가기' : 'Back'}
          </button>
        )}
        
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        
        <div className="flex items-center space-x-4 text-gray-600 mb-4">
          {attributes.publishedAt && (
            <time>{formatJapaneseDate(attributes.publishedAt)}</time>
          )}
          {attributes.author && (
            <span>by {attributes.author}</span>
          )}
          {attributes.location && (
            <span>📍{attributes.location}</span>
          )}
          {attributes.views > 0 && (
            <span>{attributes.views.toLocaleString()} views</span>
          )}
        </div>
        
        {attributes.tags && (
          <div className="flex flex-wrap gap-2 mb-6">
            {attributes.tags.map((tag, index) => (
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

      {/* メイン画像 */}
      <div className="mb-8">
        <img
          src={attributes.imageUrl}
          alt={title}
          className="w-full h-64 md:h-96 object-cover rounded-lg"
        />
      </div>

      {/* コンテンツ */}
      <div 
        className="prose prose-lg max-w-none mb-12"
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* 追加画像 */}
      {attributes.images && attributes.images.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">
            {locale === 'ja' ? '関連画像' : locale === 'ko' ? '관련 이미지' : 'Related Images'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {attributes.images.map((imageUrl, index) => (
              <img
                key={index}
                src={imageUrl}
                alt={`${title} - Image ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg"
              />
            ))}
          </div>
        </section>
      )}

      {/* 埋め込みリンク */}
      {attributes.embedLinks && attributes.embedLinks.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">
            {locale === 'ja' ? '関連リンク' : locale === 'ko' ? '관련 링크' : 'Related Links'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attributes.embedLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 capitalize">{link.type}</span>
                  <span className="font-medium">{link.title || link.url}</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

// ===================================
// カスタムフック
// ===================================

export function useArticles(locale: string = 'ja') {
  const [articles, setArticles] = useState<JapanInfoArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await strapiClient.getArticles(locale);
        setArticles(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [locale]);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await strapiClient.getArticles(locale);
      setArticles(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return { articles, loading, error, refetch };
}

export function useArticle(documentId: string, locale: string = 'ja') {
  const [article, setArticle] = useState<JapanInfoArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await strapiClient.getArticle(documentId, locale);
        setArticle(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (documentId) {
      fetchArticle();
    }
  }, [documentId, locale]);

  return { article, loading, error };
}

export function usePopularArticles(locale: string = 'ja') {
  const [articles, setArticles] = useState<JapanInfoArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPopularArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await strapiClient.getPopularArticles(locale);
        setArticles(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPopularArticles();
  }, [locale]);

  return { articles, loading, error };
}

// ===================================
// 使用例コンポーネント
// ===================================

export function JapanInfoApp() {
  const [selectedArticle, setSelectedArticle] = useState<JapanInfoArticle | null>(null);
  const [currentLocale, setCurrentLocale] = useState<string>('ja');
  const [showPopularOnly, setShowPopularOnly] = useState(false);
  
  const { articles, loading, error, refetch } = useArticles(currentLocale);
  const { articles: popularArticles } = usePopularArticles(currentLocale);

  const handleArticleClick = (article: JapanInfoArticle) => {
    setSelectedArticle(article);
  };

  const handleBack = () => {
    setSelectedArticle(null);
  };

  const displayedArticles = showPopularOnly ? popularArticles : articles;

  if (selectedArticle) {
    return (
      <ArticleDetail
        article={selectedArticle}
        locale={currentLocale}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ヘッダー */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4">
          {currentLocale === 'ja' ? '日本情報記事' : 
           currentLocale === 'ko' ? '일본 정보 기사' : 
           'Japan Info Articles'}
        </h1>
        
        {/* 言語切り替え */}
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setCurrentLocale('ja')}
            className={`px-3 py-1 rounded ${
              currentLocale === 'ja' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            日本語
          </button>
          <button
            onClick={() => setCurrentLocale('ko')}
            className={`px-3 py-1 rounded ${
              currentLocale === 'ko' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            한국어
          </button>
        </div>
        
        {/* フィルター */}
        <div className="flex space-x-4">
          <button
            onClick={() => setShowPopularOnly(false)}
            className={`px-4 py-2 rounded-md transition-colors ${
              !showPopularOnly ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {currentLocale === 'ja' ? 'すべて' : 
             currentLocale === 'ko' ? '전체' : 
             'All'}
          </button>
          <button
            onClick={() => setShowPopularOnly(true)}
            className={`px-4 py-2 rounded-md transition-colors ${
              showPopularOnly ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {currentLocale === 'ja' ? '人気記事' : 
             currentLocale === 'ko' ? '인기 기사' : 
             'Popular'}
          </button>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            {currentLocale === 'ja' ? '更新' : 
             currentLocale === 'ko' ? '새로고침' : 
             'Refresh'}
          </button>
        </div>
      </header>

      {/* 記事一覧 */}
      <ArticleList
        articles={displayedArticles}
        locale={currentLocale}
        loading={loading}
        error={error}
        onArticleClick={handleArticleClick}
      />
    </div>
  );
} 