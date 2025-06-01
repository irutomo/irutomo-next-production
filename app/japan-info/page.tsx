'use client';

// ===================================
// Japan Info メインページ（リファクタリング版）
// シンプルで保守性の高い構造
// ===================================

import { useLanguage } from '@/contexts/language-context';
import { useJapanInfoArticles } from './hooks/useJapanInfoArticles';
import { getTranslation } from './lib/translations';
import {
  ApplePageHeader,
  AppleArticleCard,
  AppleLoadingSpinner,
  AppleEmptyState,
  AppleLoadMoreButton
} from './components';

export default function JapanInfoPage() {
  const { language } = useLanguage();
  const { 
    articles, 
    loading, 
    hasMore, 
    totalArticles, 
    error,
    loadMore 
  } = useJapanInfoArticles({
    pageSize: 8,
    sortBy: 'publishedAt',
    sortOrder: 'desc'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50/20 to-white">
      {/* ページヘッダー */}
      <ApplePageHeader language={language} />
      
      {/* メインコンテンツ */}
      <main className="container-responsive py-12">
        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800">データの取得中にエラーが発生しました: {error.message}</p>
          </div>
        )}

        {/* 記事一覧 */}
        {loading && articles.length === 0 ? (
          <AppleLoadingSpinner />
        ) : articles.length === 0 ? (
          <AppleEmptyState language={language} />
        ) : (
          <>
            {/* 記事数表示 */}
            <div className="mb-8 text-center">
              <p className="text-gray-600 font-medium">
                {getTranslation(language, 'totalArticles', { count: totalArticles.toString() })}
              </p>
            </div>

            {/* 記事カード一覧 */}
            <div className="space-y-6">
              {articles.map((article, index) => (
                <AppleArticleCard
                  key={article.id}
                  article={article}
                  language={language}
                  index={index}
                />
              ))}
            </div>

            {/* もっと読み込むボタン */}
            {hasMore && (
              <AppleLoadMoreButton
                language={language}
                onClick={loadMore}
                disabled={loading}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
} 