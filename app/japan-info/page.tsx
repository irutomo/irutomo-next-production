// ===================================
// Japan Info メインページ（App Router準拠版）
// Server Components優先、Client Components最小化
// ===================================

import { Suspense } from 'react';
import { Metadata } from 'next';
import { getAllJapanInfoArticles } from '@/lib/services/japan-info';
import { getTranslation, japanInfoTranslations } from './lib/translations';
import {
  ApplePageHeader,
  AppleLoadingSpinner,
  AppleEmptyState,
  JapanInfoClient
} from './components';

// ===================================
// メタデータ生成
// ===================================
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '일본 MZ 정보🍯 | IRUTOMO',
    description: '日本のMZ世代トレンド・カルチャー・ライフスタイル情報をお届け!!',
    openGraph: {
      title: '일본 MZ 정보🍯🍯 | IRUTOMO',
      description: '日本のMZ世代トレンド・カルチャー・ライフスタイル情報をお届け!!',
      type: 'website',
      locale: 'ko_KR',
      alternateLocale: 'ja_JP',
    },
    twitter: {
      card: 'summary_large_image',
      title: '일본 MZ 정보🍯🍯 | IRUTOMO',
      description: '日本のMZ世代トレンド・カルチャー・ライフスタイル情報をお届け!!',
    },
  };
}

// ===================================
// 初期データ取得（Server Component）
// ===================================
async function getInitialArticles() {
  try {
    const results = await getAllJapanInfoArticles({
      page: 1,
      pageSize: 8,
      sortBy: 'publishedAt',
      sortOrder: 'desc',
    });
    return results;
  } catch (error) {
    console.error('Initial data fetch error:', error);
    return {
      articles: [],
      pagination: {
        page: 1,
        pageSize: 8,
        pageCount: 0,
        total: 0,
      },
    };
  }
}

// ===================================
// 静的生成のための再検証設定
// ===================================
export const revalidate = 3600; // 1時間に1回再生成

// ===================================
// メインページコンポーネント（Server Component）
// ===================================
export default async function JapanInfoPage() {
  // サーバーサイドでデータを取得
  const initialData = await getInitialArticles();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50/20 to-white">
      <Suspense fallback={<AppleLoadingSpinner />}>
        <JapanInfoClient initialData={initialData} />
      </Suspense>
    </div>
  );
} 