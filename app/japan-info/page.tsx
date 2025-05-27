// ===================================
// Japan Info メインページ（Strapi v5統合版）
// Next.js 15 searchParams非同期対応版
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
  searchParams: Promise<{
    query?: string;
    page?: string;
    location?: string;
    tags?: string | string[];
    popular?: string;
    sortBy?: 'publishedAt' | 'views' | 'title';
    sortOrder?: 'asc' | 'desc';
    pageSize?: string;
  }>;
}

// ===================================
// デバッグ用API接続ステータス表示
// ===================================
async function ApiStatusIndicator() {
  try {
    console.log('🔄 Checking Strapi connection...');
    const isConnected = await checkStrapiConnection();
    console.log(`📡 Strapi Connection Status: ${isConnected ? 'SUCCESS' : 'FAILED'}`);
    
    return (
      <div className={`mb-4 p-3 rounded-lg border ${
        isConnected ? 'bg-green-50 text-green-800 border-green-200' : 'bg-yellow-50 text-yellow-800 border-yellow-200'
      }`}>
        <div className="flex items-center space-x-2">
          <span className={isConnected ? '✅' : '⚠️'} />
          <span className="font-medium">
            {isConnected ? 'Strapi Connected' : 'Using Fallback Data'}
          </span>
          <span className="text-sm">
            URL: {process.env.NEXT_PUBLIC_STRAPI_URL}
          </span>
        </div>
      </div>
    );
  } catch (error) {
    console.error('❌ API Status Check Failed:', error);
    return (
      <div className="mb-4 p-3 rounded-lg border bg-red-50 text-red-800 border-red-200">
        <div className="flex items-center space-x-2">
          <span>❌</span>
          <span className="font-medium">API Connection Error</span>
          <span className="text-sm">{error instanceof Error ? error.message : 'Unknown error'}</span>
        </div>
      </div>
    );
  }
}

// ===================================
// メインページコンポーネント
// ===================================
export default async function JapanInfoPage({ searchParams }: JapanInfoPageProps) {
  console.log('📄 Japan Info Page Loading...');
  
  // Next.js 15: searchParamsは非同期なのでawaitが必要
  const resolvedSearchParams = await searchParams;
  console.log('🔍 Resolved Search Params:', resolvedSearchParams);

  // パラメータの解析
  const query = resolvedSearchParams?.query || '';
  const page = Number(resolvedSearchParams?.page) || 1;
  const location = resolvedSearchParams?.location || '';
  const tagsParam = resolvedSearchParams?.tags;
  const tags = Array.isArray(tagsParam) ? tagsParam : tagsParam ? [tagsParam] : [];
  const isPopular = resolvedSearchParams?.popular === 'true';
  const sortBy = resolvedSearchParams?.sortBy || 'publishedAt';
  const sortOrder = resolvedSearchParams?.sortOrder || 'desc';
  const pageSize = Number(resolvedSearchParams?.pageSize) || 12;

  console.log('🎯 Parsed parameters:', { query, page, location, tags, isPopular, sortBy, sortOrder, pageSize });

  // 検索フィルターの構築
  const searchFilters: SearchFilters = {
    query: query || undefined,
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
  let debugInfo = '';

  try {
    console.log('📡 Starting API calls...');
    
    // Strapi接続確認
    isStrapiAvailable = await checkStrapiConnection();
    console.log(`🔗 Strapi available: ${isStrapiAvailable}`);
    
    if (isStrapiAvailable) {
      // 検索条件がある場合は検索API、ない場合は通常取得
      if (query || location || tags.length > 0 || isPopular) {
        console.log('🔍 Using search API with filters:', searchFilters);
        const searchResults = await searchJapanInfoArticles(searchFilters, page, pageSize);
        articlesData = {
          articles: searchResults.articles,
          pagination: searchResults.pagination,
        };
        debugInfo = `Search: ${searchResults.totalResults} results in ${searchResults.searchTime}ms`;
      } else {
        console.log('📚 Using getAllJapanInfoArticles');
        articlesData = await getAllJapanInfoArticles({
          page,
          pageSize,
          sortBy,
          sortOrder,
        });
        debugInfo = `All articles: ${articlesData.articles.length} loaded`;
      }

      console.log(`📊 Retrieved ${articlesData.articles.length} articles`);

      // 人気記事の取得（検索時以外）
      if (!query && !location && tags.length === 0) {
        console.log('⭐ Getting popular articles...');
        popularArticles = await getPopularJapanInfoArticles('ja', 6);
        console.log(`🌟 Popular articles: ${popularArticles.length}`);
      }
    } else {
      // Strapiが利用できない場合のフォールバック
      console.warn('⚠️ Strapi接続失敗、フォールバックデータを使用');
      articlesData = {
        articles: [],
        pagination: { page: 1, pageSize: 12, pageCount: 0, total: 0 },
      };
      debugInfo = 'Using fallback data';
    }
  } catch (error) {
    console.error('❌ データ取得エラー:', error);
    articlesData = {
      articles: [],
      pagination: { page: 1, pageSize: 12, pageCount: 0, total: 0 },
    };
    debugInfo = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }

  // 検索キーワードのハイライト用
  const highlightTerms = query ? query.split(' ').filter(term => term.length > 0) : [];

  console.log('🎬 Rendering page with data:', {
    articlesCount: articlesData.articles.length,
    popularCount: popularArticles.length,
    isStrapiAvailable,
    debugInfo
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* ヒーローセクション */}
      <JapanInfoHero />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* API接続ステータス表示 */}
        <Suspense fallback={<LoadingSpinner size="sm" />}>
          <ApiStatusIndicator />
        </Suspense>

        {/* デバッグ情報表示（開発環境のみ） */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">🔧 Debug Info</h3>
            <div className="text-sm text-gray-700 space-y-1">
              <div><strong>Strapi URL:</strong> {process.env.NEXT_PUBLIC_STRAPI_URL}</div>
              <div><strong>API Token:</strong> {process.env.STRAPI_API_TOKEN ? '✅ Set' : '❌ Missing'}</div>
              <div><strong>Connection Status:</strong> {isStrapiAvailable ? '✅ Connected' : '❌ Failed'}</div>
              <div><strong>Status:</strong> {debugInfo}</div>
              <div><strong>Articles:</strong> {articlesData.articles.length}</div>
              <div><strong>Popular:</strong> {popularArticles.length}</div>
              <div><strong>Search Filters:</strong> {JSON.stringify(searchFilters)}</div>
              <div><strong>Raw Params:</strong> {JSON.stringify(resolvedSearchParams)}</div>
            </div>
          </div>
        )}

        {/* Strapi API接続テスト表示 */}
        <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">🧪 Strapi API Test</h3>
          <div className="text-sm text-blue-800">
            <div><strong>Direct API Test:</strong> 
              <a 
                href="https://strapi-production-dd77.up.railway.app/api/japan-info-articles" 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-2 underline hover:no-underline"
              >
                Test Strapi API ↗
              </a>
            </div>
            <div><strong>Expected Results:</strong> 3 articles from Strapi</div>
            <div><strong>Actual Results:</strong> {articlesData.articles.length} articles loaded</div>
          </div>
        </div>

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
                  {isStrapiAvailable 
                    ? 'Strapi APIに接続できましたが、記事データが存在しないか、検索条件にマッチする記事がありません。' 
                    : 'Strapi APIに接続できませんでした。ネットワーク接続やAPIトークンを確認してください。'
                  }
                </p>
                
                {/* 検索条件リセットボタン */}
                <div className="space-x-4">
                  <a
                    href="/japan-info"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    すべての記事を見る
                  </a>
                  {!isStrapiAvailable && (
                    <button
                      onClick={() => window.location.reload()}
                      className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      再読み込み
                    </button>
                  )}
                  <a
                    href="https://strapi-production-dd77.up.railway.app/api/japan-info-articles"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    API直接テスト ↗
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