// ===================================
// Japan Info 個別記事ページ（App Router専用）
// Next.js 15対応、Strapi v5統合版
// ===================================

import type { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { JapanInfo } from '@/types/japan-info';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarIcon, MapPinIcon, TagIcon, Share2Icon, EyeIcon } from 'lucide-react';
import { cookies } from 'next/headers';
import { getJapanInfoArticleById } from '@/lib/strapi/client';
import { Suspense } from 'react';

// ===================================
// 型定義
// ===================================
interface JapanInfoDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// ===================================
// HTMLコンテンツレンダリングコンポーネント
// ===================================
function HtmlContent({ content, className = "" }: { content: string; className?: string }) {
  // HTMLタグを適切にレンダリングするためのコンポーネント
  return (
    <div 
      className={`prose prose-lg max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
      style={{
        lineHeight: '1.8',
      }}
    />
  );
}

// ===================================
// ローディングスピナー
// ===================================
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

// ===================================
// フォールバック用ダミーデータ
// ===================================
function getFallbackJapanInfo(id: string): JapanInfo {
  return {
    id: id,
    title: '記事が見つかりません',
    korean_title: '기사를 찾을 수 없습니다',
    description: 'リクエストされた記事が見つかりませんでした。',
    korean_description: '요청하신 기사를 찾을 수 없습니다.',
    content: '<p>申し訳ございませんが、リクエストされた記事が見つかりませんでした。</p>',
    korean_content: '<p>죄송합니다. 요청하신 기사를 찾을 수 없습니다.</p>',
    featured_image: null,
    tags: [],
    location: '',
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    views: 0,
    is_popular: false,
  };
}

// ===================================
// データ取得関数
// ===================================
async function getJapanInfoById(id: string, language: 'ja' | 'ko' = 'ko'): Promise<JapanInfo | null> {
  try {
    console.log(`📄 Getting Japan Info article: ID=${id}, language=${language}`);
    
    // Strapiから記事を取得
    const strapiData = await getJapanInfoArticleById(id, language);
    
    if (strapiData) {
      console.log('✅ Article retrieved from Strapi:', strapiData.title);
      
      // 言語に応じてデータを調整
      return {
        ...strapiData,
        title: language === 'ko' ? (strapiData.korean_title || strapiData.title) : strapiData.title,
        description: language === 'ko' ? (strapiData.korean_description || strapiData.description) : strapiData.description,
        content: language === 'ko' ? (strapiData.korean_content || strapiData.content) : strapiData.content,
      };
    }
    
    console.warn(`⚠️ Article not found: ID=${id}`);
    return null;
  } catch (error) {
    console.error('❌ Error getting Japan Info article:', error);
    return null;
  }
}

// ===================================
// メタデータ生成
// ===================================
export async function generateMetadata(
  { params, searchParams }: JapanInfoDetailPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Next.js 15: paramsとsearchParamsは非同期
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const { id } = resolvedParams;
  
  // 言語設定を取得
  const lang = resolvedSearchParams?.lang || '';
  const language = (typeof lang === 'string' && lang === 'ja' ? 'ja' : 'ko') as 'ja' | 'ko';
  
  try {
    const article = await getJapanInfoById(id, language);

    if (!article) {
      return {
        title: language === 'ko' 
          ? '정보를 찾을 수 없습니다 | 이루토모' 
          : '情報が見つかりません | IRUTOMO',
        description: language === 'ko'
          ? '요청하신 일본 여행 정보를 찾을 수 없습니다.'
          : 'リクエストされた日本旅行情報が見つかりませんでした。',
      };
    }

    const title = language === 'ko' ? (article.korean_title || article.title) : article.title;
    const description = language === 'ko' ? (article.korean_description || article.description) : article.description;

    return {
      title: language === 'ko'
        ? `${title} | 이루토모 - 일본 여행 정보`
        : `${title} | IRUTOMO - 日本旅行情報`,
      description: description,
      keywords: article.tags || (language === 'ko' ? ['일본 여행'] : ['日本旅行']),
      openGraph: {
        title: title,
        description: description,
        images: article.featured_image ? [article.featured_image] : [],
        type: 'article',
        publishedTime: article.published_at,
        modifiedTime: article.updated_at,
      },
      twitter: {
        card: 'summary_large_image',
        title: title,
        description: description,
        images: article.featured_image ? [article.featured_image] : [],
      },
    };
  } catch (error) {
    console.error('❌ Metadata generation error:', error);
    return {
      title: language === 'ko' ? '일본 여행 정보 | 이루토모' : '日本旅行情報 | IRUTOMO',
      description: language === 'ko' ? '일본 여행에 대한 유용한 정보를 제공합니다.' : '日本旅行に関する有用な情報を提供します。',
    };
  }
}

// ===================================
// 言語切り替えボタンコンポーネント
// ===================================
function LanguageToggle({ currentLang, articleId }: { currentLang: 'ja' | 'ko'; articleId: string }) {
  const isKorean = currentLang === 'ko';
  const targetLang = isKorean ? 'ja' : 'ko';
  const buttonText = isKorean ? '한국어로 보기' : '日本語で見る';
  
  return (
    <Link
      href={`/japan-info/${articleId}?lang=${targetLang}`}
      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      {buttonText}
    </Link>
  );
}

// ===================================
// 記事詳細コンポーネント
// ===================================
function ArticleDetail({ article, language }: { article: JapanInfo; language: 'ja' | 'ko' }) {
  const title = language === 'ko' ? (article.korean_title || article.title) : article.title;
  const content = language === 'ko' ? (article.korean_content || article.content) : article.content;
  const publishedDate = article.published_at ? new Date(article.published_at).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'ja-JP') : '';

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ヘッダー */}
      <header className="mb-8">
        {/* 戻るボタン */}
        <div className="mb-6">
          <Link
            href="/japan-info"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'ko' ? '일본정보 일람에 돌아가기' : '日本情報一覧に戻る'}
          </Link>
        </div>

        {/* 言語切り替え */}
        <div className="mb-6 flex justify-end">
          <LanguageToggle currentLang={language} articleId={article.id} />
        </div>

        {/* タイトル */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {title}
        </h1>

        {/* メタ情報 */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
          {publishedDate && (
            <div className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-1" />
              {publishedDate}
            </div>
          )}
          
          {article.location && (
            <div className="flex items-center">
              <MapPinIcon className="w-4 h-4 mr-1" />
              {article.location}
            </div>
          )}
          
          {article.views !== undefined && (
            <div className="flex items-center">
              <EyeIcon className="w-4 h-4 mr-1" />
              {article.views.toLocaleString()}
            </div>
          )}

          <div className="flex items-center">
            <Share2Icon className="w-4 h-4 mr-1" />
            <span>{language === 'ko' ? '공유' : 'シェア'}</span>
          </div>
        </div>

        {/* タグ */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {article.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                <TagIcon className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* 記事画像 */}
      {article.featured_image && (
        <div className="mb-8">
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <Image
              src={article.featured_image}
              alt={title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      {/* 記事本文 */}
      <div className="mb-12">
        <HtmlContent 
          content={content} 
          className="prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900"
        />
      </div>

      {/* フッター */}
      <footer className="border-t pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <Link
              href="/japan-info"
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === 'ko' ? '목록으로 돌아가기' : '一覧に戻る'}
            </Link>
          </div>
          
          <div className="text-sm text-gray-500">
            {language === 'ko' ? '이루토모에서 더 많은 일본 정보를 확인하세요' : 'IRUTOMOでもっと多くの日本情報をチェック'}
          </div>
        </div>
      </footer>
    </article>
  );
}

// ===================================
// メインページコンポーネント
// ===================================
export default async function JapanInfoDetailPage({ params, searchParams }: JapanInfoDetailPageProps) {
  // Next.js 15: paramsとsearchParamsは非同期
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const { id } = resolvedParams;
  
  // 言語設定を取得
  const lang = resolvedSearchParams?.lang || '';
  const language = (typeof lang === 'string' && lang === 'ja' ? 'ja' : 'ko') as 'ja' | 'ko';
  
  console.log(`🔍 Loading Japan Info Detail: ID=${id}, language=${language}`);
  
  // 記事データを取得
  const article = await getJapanInfoById(id, language);
  
  // 記事が見つからない場合は404
  if (!article) {
    console.warn(`❌ Article not found: ID=${id}`);
    notFound();
  }
  
  console.log(`✅ Article loaded: ${article.title}`);
  
  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={<LoadingSpinner />}>
        <ArticleDetail article={article} language={language} />
      </Suspense>
    </div>
  );
} 