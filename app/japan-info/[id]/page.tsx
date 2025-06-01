// ===================================
// Japan Info 個別記事ページ（App Router準拠版）
// Server Components優先、適切なメタデータ生成
// ===================================

import { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getJapanInfoArticleById } from '@/lib/strapi/client';
import { getArticleTitle, getArticleDescription } from '../lib/utils';
import { AppleLoadingSpinner } from '../components';
import { JapanInfoDetailClient } from './components/JapanInfoDetailClient';

// ===================================
// 型定義
// ===================================
interface JapanInfoDetailPageProps {
  params: Promise<{ id: string }>;
}

// ===================================
// メタデータ生成（Server Component）
// ===================================
export async function generateMetadata({ params }: JapanInfoDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  
  try {
    // 日本語版を優先してメタデータ用のデータを取得
    const article = await getJapanInfoArticleById(id, 'ja');
    
    if (!article) {
      return {
        title: '記事が見つかりません | IRUTOMO',
        description: '指定された記事は存在しません。',
      };
    }

    const title = getArticleTitle(article, 'ja');
    const description = getArticleDescription(article, 'ja');

    return {
      title: `${title} | IRUTOMO`,
      description: description || '日本のMZ世代情報をお届けします。',
      openGraph: {
        title: `${title} | IRUTOMO`,
        description: description || '日本のMZ世代情報をお届けします。',
        type: 'article',
        images: article.featured_image ? [article.featured_image] : [],
        locale: 'ja_JP',
        alternateLocale: 'ko_KR',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} | IRUTOMO`,
        description: description || '日本のMZ世代情報をお届けします。',
        images: article.featured_image ? [article.featured_image] : [],
      },
    };
  } catch {
    return {
      title: '記事が見つかりません | IRUTOMO',
      description: '指定された記事は存在しません。',
    };
  }
}

// ===================================
// 初期データ取得（Server Component）
// ===================================
async function getInitialArticleData(id: string) {
  try {
    // 日本語版と韓国語版の両方を取得
    const [jaArticle, koArticle] = await Promise.allSettled([
      getJapanInfoArticleById(id, 'ja'),
      getJapanInfoArticleById(id, 'ko'),
    ]);

    return {
      jaArticle: jaArticle.status === 'fulfilled' ? jaArticle.value : null,
      koArticle: koArticle.status === 'fulfilled' ? koArticle.value : null,
    };
  } catch (error) {
    console.error('Error fetching article data:', error);
    return {
      jaArticle: null,
      koArticle: null,
    };
  }
}

// ===================================
// メインページコンポーネント（Server Component）
// ===================================
export default async function JapanInfoDetailPage({ params }: JapanInfoDetailPageProps) {
  const { id } = await params;
  const initialData = await getInitialArticleData(id);

  // 両方の言語版が存在しない場合は404
  if (!initialData.jaArticle && !initialData.koArticle) {
    notFound();
  }

  return (
    <Suspense fallback={<AppleLoadingSpinner />}>
      <JapanInfoDetailClient 
        id={id}
        initialData={initialData}
      />
    </Suspense>
  );
}

// ===================================
// 静的生成のための再検証設定
// ===================================
export const revalidate = 3600; // 1時間に1回再生成

// =================================== 