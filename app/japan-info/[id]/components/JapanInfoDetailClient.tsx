'use client';

// ===================================
// Japan Info 詳細ページクライアントコンポーネント
// App Router準拠、必要最小限のClient Component機能
// ===================================

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { JapanInfo } from '@/types/japan-info';
import { 
  japanInfoTranslations, 
  LanguageKey, 
  getTranslation 
} from '../../lib/translations';
import { 
  getArticleContent, 
  getArticleTitle, 
  getFontClass 
} from '../../lib/utils';
import {
  ArticleDetailHeader,
  ArticleNavigation,
} from '../../components';

// ===================================
// 型定義
// ===================================
interface InitialData {
  jaArticle: JapanInfo | null;
  koArticle: JapanInfo | null;
}

interface JapanInfoDetailClientProps {
  id: string;
  initialData: InitialData;
}

// ===================================
// HTMLコンテンツレンダリングコンポーネント
// ===================================
function HtmlContent({ content, className = "" }: { content: string; className?: string }) {
  return (
    <div 
      className={`prose-article ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

// ===================================
// 記事が見つからない場合のコンポーネント
// ===================================
function ArticleNotFound({ id, language }: { id: string; language: LanguageKey }) {
  const t = japanInfoTranslations[language];
  const fontClass = getFontClass(language);

  return (
    <div className="min-h-screen bg-white">
      <div className="container-responsive py-20">
        <div className="text-center max-w-md mx-auto">
          <div className="text-6xl mb-6">📄</div>
          <h1 className={`text-2xl font-bold text-gray-900 mb-4 ${fontClass}`}>
            {t.articleNotFound}
          </h1>
          <p className={`text-gray-600 mb-8 leading-relaxed ${fontClass}`}>
            {getTranslation(language, 'articleNotFoundDescription', { id })}
          </p>
          <Link
            href="/japan-info"
            className={`inline-flex items-center px-6 py-3 bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors font-medium ${fontClass}`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.backToList}
          </Link>
        </div>
      </div>
    </div>
  );
}

// ===================================
// 記事詳細コンポーネント
// ===================================
function ArticleDetail({ 
  article, 
  language, 
  onLanguageChange 
}: { 
  article: JapanInfo; 
  language: LanguageKey;
  onLanguageChange: (lang: LanguageKey) => void;
}) {
  const content = getArticleContent(article, language);
  const t = japanInfoTranslations[language];
  const fontClass = getFontClass(language);

  return (
    <div className="min-h-screen bg-white">
      {/* ナビゲーション */}
      <ArticleNavigation 
        language={language}
        onLanguageChange={onLanguageChange}
      />

      {/* メインコンテンツ */}
      <main className="container-responsive">
        <article className="max-w-4xl mx-auto py-8 md:py-12 lg:py-16">
          {/* 記事ヘッダー */}
          <ArticleDetailHeader 
            article={article}
            language={language}
          />

          {/* フィーチャー画像 */}
          {article.featured_image && (
            <div className="relative w-full h-64 md:h-96 lg:h-[500px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden mb-8 md:mb-12 shadow-lg">
              <Image
                src={article.featured_image}
                alt={getArticleTitle(article, language)}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                priority
              />
            </div>
          )}

          {/* 記事コンテンツ */}
          {content ? (
            <div className="mb-12">
              <HtmlContent 
                content={content} 
                className={`text-gray-800 leading-relaxed ${fontClass}`}
              />
            </div>
          ) : (
            <div className={`text-center py-12 text-gray-500 ${fontClass}`}>
              {t.noContent}
            </div>
          )}

          {/* 記事フッター */}
          <footer className="border-t border-gray-200 pt-8">
            <div className="text-center">
              <Link
                href="/japan-info"
                className={`inline-flex items-center px-6 py-3 bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors font-medium ${fontClass}`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.backToList}
              </Link>
            </div>
          </footer>
        </article>
      </main>
    </div>
  );
}

// ===================================
// メインクライアントコンポーネント
// ===================================
export function JapanInfoDetailClient({ id, initialData }: JapanInfoDetailClientProps) {
  const { language, setLanguage } = useLanguage();
  
  const handleLanguageChange = (newLanguage: LanguageKey) => {
    setLanguage(newLanguage);
  };

  // 現在の言語に対応する記事を取得
  const currentArticle = language === 'ja' ? initialData.jaArticle : initialData.koArticle;
  
  // フォールバック: 現在の言語の記事がない場合は他の言語の記事を使用
  const article = currentArticle || initialData.jaArticle || initialData.koArticle;

  if (!article) {
    return <ArticleNotFound id={id} language={language} />;
  }

  return (
    <ArticleDetail 
      article={article} 
      language={language} 
      onLanguageChange={handleLanguageChange} 
    />
  );
} 