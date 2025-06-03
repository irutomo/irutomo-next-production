'use client';

// ===================================
// Japan Info クライアントコンポーネント
// 必要最小限のClient Component機能のみ
// ===================================

import { useState } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { getAllJapanInfoArticles } from '@/lib/services/japan-info';
import { JapanInfo } from '@/types/japan-info';
import { getTranslation } from '../../lib/translations';
import {
  PageHeader,
  ArticleCard,
  LoadingSpinner,
  EmptyState,
  LoadMoreButton
} from '../index';

// ===================================
// 型定義
// ===================================
interface InitialData {
  articles: JapanInfo[];
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

interface JapanInfoClientProps {
  initialData: InitialData;
}

// ===================================
// クライアントコンポーネント
// ===================================
export function JapanInfoClient({ initialData }: JapanInfoClientProps) {
  const { language } = useLanguage();
  const [articles, setArticles] = useState<JapanInfo[]>(initialData.articles);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialData.pagination.page);
  const [error, setError] = useState<string | null>(null);
  
  const hasMore = currentPage < initialData.pagination.pageCount;
  const totalArticles = initialData.pagination.total;

  // もっと読み込む機能
  const handleLoadMore = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const nextPage = currentPage + 1;
      const results = await getAllJapanInfoArticles({
        page: nextPage,
        pageSize: 8,
        sortBy: 'publishedAt',
        sortOrder: 'desc',
      });
      
      setArticles(prev => [...prev, ...results.articles]);
      setCurrentPage(nextPage);
    } catch (err) {
      console.error('Load more error:', err);
      setError('追加データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ページヘッダー */}
      <PageHeader 
        title={getTranslation(language, 'pageTitle')}
        description={getTranslation(language, 'pageDescription')}
        
      />
      
      {/* メインコンテンツ */}
      <main className="container-responsive py-12">
        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* 記事一覧 */}
        {articles.length === 0 ? (
          <EmptyState 
            message={getTranslation(language, 'noArticles')}
            description={getTranslation(language, 'comingSoon')}
          />
        ) : (
          <>
            {/* 記事数表示 */}
            <div className="mb-8 text-center">
              <p className="text-gray-600 font-medium">
                {getTranslation(language, 'totalArticles', { count: totalArticles.toString() })}
              </p>
            </div>

            {/* 記事カード一覧 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article, index) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  language={language}
                  priority={index < 3}
                />
              ))}
            </div>

            {/* もっと読み込むボタン */}
            {hasMore && (
              <LoadMoreButton
                onClick={handleLoadMore}
                loading={loading}
                disabled={loading}
              >
                {getTranslation(language, 'loadMore')}
              </LoadMoreButton>
            )}
            
            {/* 読み込み中表示 */}
            {loading && (
              <div className="mt-8">
                <LoadingSpinner />
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
} 