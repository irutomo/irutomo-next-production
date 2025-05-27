// ===================================
// Japan Info メインページ（Strapi v5統合版）
// 検索・ページネーション・フィルタリング対応
// ===================================

import { Suspense } from 'react';
import { Metadata } from 'next';
import { 
  getAllJapanInfoArticles, 
  getPopularJapanInfoArticles,
  searchJapanInfoArticles,
  checkStrapiConnection 
} from '@/lib/strapi/client';
import { SearchFilters, JapanInfo } from '@/types/japan-info';

// コンポーネントインポート
import JapanInfoHero from './components/JapanInfoHero';
import JapanInfoSearch from './components/JapanInfoSearch';
import JapanInfoGrid from './components/JapanInfoGrid';
import JapanInfoPagination from './components/JapanInfoPagination';
import JapanInfoFilters from './components/JapanInfoFilters';
import PopularArticles from './components/PopularArticles';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';

// メタデータ設定
export const metadata: Metadata = {
  title: '日本の魅力を発見 | IRUTOMO',
  description: '日本全国の観光地、文化、グルメ情報をお届け。あなたの日本旅行をもっと豊かに。',
  keywords: ['日本', '観光', '旅行', '文化', 'グルメ', '体験'],
  openGraph: {
    title: '日本の魅力を発見 | IRUTOMO',
    description: '日本全国の観光地、文化、グルメ情報をお届け',
    type: 'website',
    locale: 'ja_JP',
  },
  alternates: {
    canonical: 'https://irutomo-trip.com/japan-info',
    languages: {
      'ja': 'https://irutomo-trip.com/japan-info',
      'ko': 'https://irutomo-trip.com/ko/japan-info',
      'en': 'https://irutomo-trip.com/en/japan-info',
    },
  },
};

// サーチパラメータ型定義
interface JapanInfoPageProps {
  searchParams?: {
    query?: string;
    page?: string;
    location?: string;
    tags?: string | string[];
    popular?: string;
    sortBy?: 'publishedAt' | 'views' | 'title';
    sortOrder?: 'asc' | 'desc';
    pageSize?: string;
  };
}

// フォールバック記事データ（Strapi接続失敗時）
const getFallbackArticles = async (): Promise<{
  articles: JapanInfo[];
  pagination: any;
}> => {
  // Supabaseからフォールバックデータを取得する処理
  // 既存のSupabaseクライアントを使用
  return {
    articles: [],
    pagination: { page: 1, pageSize: 12, pageCount: 0, total: 0 },
  };
};

// ===================================
// メインページコンポーネント
// ===================================
export default async function JapanInfoPage({ searchParams }: JapanInfoPageProps) {
  // パラメータの解析
  const query = searchParams?.query || '';
  const page = Number(searchParams?.page) || 1;
  const location = searchParams?.location || '';
  const tagsParam = searchParams?.tags;
  const tags = Array.isArray(tagsParam) ? tagsParam : tagsParam ? [tagsParam] : [];
  const isPopular = searchParams?.popular === 'true';
  const sortBy = searchParams?.sortBy || 'publishedAt';
  const sortOrder = searchParams?.sortOrder || 'desc';
  const pageSize = Number(searchParams?.pageSize) || 12;

  // 検索フィルターの構築
  const searchFilters: SearchFilters = {
    query,
    location: location || undefined,
    tags: tags.length > 0 ? tags : undefined,
    isPopular: isPopular || undefined,
    sortBy,
    sortOrder,
  };

  // データ取得の実行
  let articlesData;
  let popularArticles: JapanInfo[] = [];
  let isStrapiAvailable = false;

  try {
    // Strapi接続確認
    isStrapiAvailable = await checkStrapiConnection();
    
    if (isStrapiAvailable) {
      // 検索条件がある場合は検索API、ない場合は通常取得
      if (query || location || tags.length > 0 || isPopular) {
        const searchResults = await searchJapanInfoArticles(searchFilters, page, pageSize);
        articlesData = {
          articles: searchResults.articles,
          pagination: searchResults.pagination,
        };
      } else {
        articlesData = await getAllJapanInfoArticles({
          page,
          pageSize,
          sortBy,
          sortOrder,
        });
      }

      // 人気記事の取得（検索時以外）
      if (!query && !location && tags.length === 0) {
        popularArticles = await getPopularJapanInfoArticles('ja', 6);
      }
    } else {
      // Strapiが利用できない場合のフォールバック
      console.warn('⚠️ Strapi接続失敗、フォールバックデータを使用');
      articlesData = await getFallbackArticles();
    }
  } catch (error) {
    console.error('❌ データ取得エラー:', error);
    articlesData = await getFallbackArticles();
  }

  // 検索キーワードのハイライト用
  const highlightTerms = query ? query.split(' ').filter(term => term.length > 0) : [];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* ヒーローセクション */}
      <JapanInfoHero />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Strapi接続状態表示（開発環境のみ） */}
        {process.env.NODE_ENV === 'development' && (
          <div className={`mb-4 p-2 rounded text-sm ${
            isStrapiAvailable ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {isStrapiAvailable ? '✅ Strapi Connected' : '⚠️ Using Fallback Data'}
          </div>
        )}

        {/* 検索・フィルターセクション */}
        <div className="mb-8 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              日本の魅力を探す
            </h2>
            
            <Suspense fallback={<LoadingSpinner />}>
              <JapanInfoSearch 
                initialQuery={query}
                initialLocation={location}
                initialTags={tags}
              />
            </Suspense>
          </div>

          <Suspense fallback={<LoadingSpinner />}>
            <JapanInfoFilters 
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              currentPageSize={pageSize}
              showPopularOnly={isPopular}
            />
          </Suspense>
        </div>

        {/* 人気記事セクション（検索時以外） */}
        {popularArticles.length > 0 && !query && (
          <div className="mb-12">
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <PopularArticles articles={popularArticles} />
              </Suspense>
            </ErrorBoundary>
          </div>
        )}

        {/* 検索結果の表示 */}
        <div className="space-y-6">
          {/* 検索結果ヘッダー */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {query || location || tags.length > 0 || isPopular ? '検索結果' : '最新の記事'}
              </h2>
              
              {articlesData.pagination.total > 0 && (
                <p className="text-gray-600 mt-1">
                  {articlesData.pagination.total}件の記事が見つかりました
                  {query && (
                    <span className="ml-2">
                      「<span className="font-medium text-blue-600">{query}</span>」の検索結果
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* 表示件数情報 */}
            <div className="text-sm text-gray-500 mt-2 sm:mt-0">
              {articlesData.pagination.total > 0 && (
                <>
                  {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, articlesData.pagination.total)} / {articlesData.pagination.total}
                </>
              )}
            </div>
          </div>

          {/* 記事グリッド */}
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <JapanInfoGrid 
                articles={articlesData.articles}
                highlightTerms={highlightTerms}
                currentPage={page}
              />
            </Suspense>
          </ErrorBoundary>

          {/* ページネーション */}
          {articlesData.pagination.pageCount > 1 && (
            <div className="mt-12">
              <Suspense fallback={<LoadingSpinner />}>
                <JapanInfoPagination 
                  currentPage={page}
                  totalPages={articlesData.pagination.pageCount}
                  totalItems={articlesData.pagination.total}
                  pageSize={pageSize}
                />
              </Suspense>
            </div>
          )}

          {/* 記事が見つからない場合 */}
          {articlesData.articles.length === 0 && (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="text-6xl text-gray-300 mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  記事が見つかりませんでした
                </h3>
                <p className="text-gray-600 mb-6">
                  検索条件を変更して再度お試しください。
                </p>
                
                {/* 検索条件リセットボタン */}
                <div className="space-x-4">
                  <a
                    href="/japan-info"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    すべての記事を見る
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SEO向け追加コンテンツ */}
        <section className="mt-16 bg-white rounded-xl shadow-sm border p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            日本の魅力を発見しよう
          </h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 leading-relaxed">
              IRUTOMOでは、日本全国の隠れた名所から有名な観光地まで、
              多彩な情報をお届けしています。地域の文化、伝統、グルメ、
              そして現地の人々との交流を通じて、本当の日本の魅力を
              体験していただけます。
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}