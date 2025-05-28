// ===================================
// Japan Info 個別記事ページ（オウンドメディア風レイアウト）
// Next.js 15対応、Strapi v5統合版
// ===================================

import type { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { JapanInfo } from '@/types/japan-info';
import { ArrowLeft, CalendarIcon, MapPinIcon, TagIcon, Share2Icon, EyeIcon, Clock } from 'lucide-react';
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
  return (
    <div 
      className={`prose prose-lg max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

// ===================================
// ローディングスピナー
// ===================================
function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

// ===================================
// 記事が見つからない場合のコンポーネント
// ===================================
function ArticleNotFound({ id, language }: { id: string; language: 'ja' | 'ko' }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="text-6xl text-gray-300 mb-6">📄</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {language === 'ko' ? '기사를 찾을 수 없습니다' : '記事が見つかりません'}
          </h1>
          <p className="text-gray-600 mb-8">
            {language === 'ko' 
              ? `ID "${id}"에 해당하는 기사가 존재하지 않습니다.`
              : `ID「${id}」に該当する記事が存在しません。`
            }
          </p>
          <Link
            href="/japan-info"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'ko' ? '일본정보 일람에 돌아가기' : '日本情報一覧に戻る'}
          </Link>
        </div>
      </div>
    </div>
  );
}

// ===================================
// 記事データ取得関数
// ===================================
async function getJapanInfoById(id: string, language: 'ja' | 'ko' = 'ko'): Promise<JapanInfo | null> {
  try {
    const article = await getJapanInfoArticleById(id, language);
    return article;
  } catch (error) {
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
  try {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const { id } = resolvedParams;
    const lang = resolvedSearchParams?.lang || '';
    const language = (typeof lang === 'string' && lang === 'ja' ? 'ja' : 'ko') as 'ja' | 'ko';
    
    const article = await getJapanInfoById(id, language);
    
    if (!article) {
      return {
        title: '記事が見つかりません | IRUTOMO',
        description: '指定された記事は存在しません。',
      };
    }

    const title = language === 'ko' ? (article.korean_title || article.title) : article.title;
    const description = article.description || `${title}に関する詳細情報をお届けします。`;

    return {
      title: `${title} | IRUTOMO`,
      description,
      keywords: article.tags || [],
      openGraph: {
        title: `${title} | IRUTOMO`,
        description,
        type: 'article',
        locale: language === 'ko' ? 'ko_KR' : 'ja_JP',
        images: article.featured_image ? [{ url: article.featured_image }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} | IRUTOMO`,
        description,
        images: article.featured_image ? [article.featured_image] : [],
      },
    };
  } catch (error) {
    return {
      title: '日本旅行情報 | IRUTOMO',
      description: '日本旅行に関する有用な情報を提供します。',
    };
  }
}

// ===================================
// 言語切り替えボタンコンポーネント
// ===================================
function LanguageToggle({ currentLang, articleId }: { currentLang: 'ja' | 'ko'; articleId: string }) {
  const isKorean = currentLang === 'ko';
  const targetLang = isKorean ? 'ja' : 'ko';
  const buttonText = isKorean ? '日本語で見る' : '한국어로 보기';
  
  return (
    <Link
      href={`/japan-info/${articleId}?lang=${targetLang}`}
      className="inline-flex items-center px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
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
    <div className="min-h-screen bg-white">
      {/* ヘッダーナビゲーション */}
      <nav className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/japan-info"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">
                {language === 'ko' ? '일본정보' : '日本情報'}
              </span>
            </Link>
            
            <LanguageToggle currentLang={language} articleId={article.id} />
          </div>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 記事ヘッダー */}
        <header className="py-8 lg:py-12">
          {/* タイトル */}
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight mb-6">
            {title}
          </h1>

          {/* メタ情報 */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-8">
            {publishedDate && (
              <div className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-2" />
                <span>{publishedDate}</span>
              </div>
            )}
            
            {article.location && (
              <div className="flex items-center">
                <MapPinIcon className="w-4 h-4 mr-2" />
                <span>{article.location}</span>
              </div>
            )}
            
            {article.views !== undefined && (
              <div className="flex items-center">
                <EyeIcon className="w-4 h-4 mr-2" />
                <span>{article.views.toLocaleString()}</span>
              </div>
            )}

            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span>{language === 'ko' ? '5분 읽기' : '5分で読める'}</span>
            </div>
          </div>

          {/* タグ */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {article.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200"
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
          <div className="mb-8 lg:mb-12">
            <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg">
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
        <article className="mb-12 lg:mb-16">
          <HtmlContent 
            content={content} 
            className="prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-img:rounded-lg prose-img:shadow-md"
          />
        </article>

        {/* シェアボタン */}
        <div className="border-t border-gray-100 py-8 mb-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {language === 'ko' ? '이 기사를 공유하세요' : 'この記事をシェア'}
            </h3>
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Share2Icon className="w-4 h-4 mr-2" />
              {language === 'ko' ? '공유' : 'シェア'}
            </button>
          </div>
        </div>

        {/* フッターナビゲーション */}
        <footer className="border-t border-gray-100 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/japan-info"
              className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium mb-4 sm:mb-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === 'ko' ? '목록으로 돌아가기' : '一覧に戻る'}
            </Link>
            
            <div className="text-sm text-gray-500">
              {language === 'ko' ? '이루토모에서 더 많은 일본 정보를 확인하세요' : 'IRUTOMOでもっと多くの日本情報をチェック'}
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

// ===================================
// メインページコンポーネント
// ===================================
export default async function JapanInfoDetailPage({ params, searchParams }: JapanInfoDetailPageProps) {
  try {
    // Next.js 15: paramsとsearchParamsは非同期
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    
    const { id } = resolvedParams;
    
    // 言語設定を取得
    const lang = resolvedSearchParams?.lang || '';
    const language = (typeof lang === 'string' && lang === 'ja' ? 'ja' : 'ko') as 'ja' | 'ko';
    
    // 記事データを取得
    const article = await getJapanInfoById(id, language);
    
    // 記事が見つからない場合は専用のコンポーネントを表示
    if (!article) {
      return <ArticleNotFound id={id} language={language} />;
    }
    
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <ArticleDetail article={article} language={language} />
      </Suspense>
    );
  } catch (error) {
    // エラーが発生した場合も専用のコンポーネントを表示
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const { id } = resolvedParams;
    const lang = resolvedSearchParams?.lang || '';
    const language = (typeof lang === 'string' && lang === 'ja' ? 'ja' : 'ko') as 'ja' | 'ko';
    
    return <ArticleNotFound id={id} language={language} />;
  }
} 