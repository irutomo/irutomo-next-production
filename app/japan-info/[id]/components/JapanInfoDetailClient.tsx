'use client';

// ===================================
// Japan Info 詳細ページクライアントコンポーネント
// App Router準拠、必要最小限のClient Component機能
// ===================================

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
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
  getFontClass,
  generateTableOfContents,
  addHeadingIds
} from '../../lib/utils';
import {
  ArticleDetailHeader,
  ArticleNavigation,
  TableOfContents,
  ArticleFooter,
} from '../../components';

// ===================================
// 型定義
// ===================================
interface InitialData {
  jaArticle: JapanInfo | null;
  koArticle: JapanInfo | null;
  relatedArticles: JapanInfo[];
}

interface JapanInfoDetailClientProps {
  id: string;
  initialData: InitialData;
}

// ===================================
// コンテンツ前処理関数
// ===================================
function preprocessStrapiContent(content: string): string {
  if (!content) return '';
  
  // Strapiの改行形式を正規化
  let processedContent = content
    // Windows形式の改行を統一
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // エスケープされた改行文字を実際の改行に変換
    .replace(/\\n/g, '\n')
    .replace(/\\r\\n/g, '\n')
    .replace(/\\r/g, '\n')
    // Strapiのリッチテキストエディターで使われる可能性のある改行
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p>/gi, '\n\n')
    .replace(/<p>/gi, '')
    .replace(/<\/p>/gi, '\n\n')
    // 連続する改行を段落区切りとして適切に処理
    .replace(/\n{3,}/g, '\n\n')
    // HTMLエンティティをデコード
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // Markdownリンクの特殊処理
  // [URL](text) の形式を [text](URL) の正しいMarkdown形式に変換
  processedContent = processedContent.replace(
    /\[([^[\]]*(?:https?:\/\/[^[\]]*)?)\]\(([^()]*)\)/g,
    (match, p1, p2) => {
      // p1 が URL で p2 がテキストの場合は入れ替える
      if (p1.includes('http') && !p2.includes('http')) {
        return `[${p2}](${p1})`;
      }
      // それ以外はそのまま
      return match;
    }
  );
  
  // 最終的な整理
  processedContent = processedContent
    .trim()
    // 行末の余分なスペースを削除（ただしMarkdownの改行用の2つのスペースは保持）
    .replace(/[ \t]+$/gm, '')
    // 空行の整理
    .replace(/^\s*\n/gm, '\n');
  
  return processedContent;
}

// ===================================
// コンテンツレンダリングコンポーネント
// ===================================
function ArticleContent({ content, className = "" }: { content: string; className?: string }) {
  // コンテンツの前処理
  const processedContent = preprocessStrapiContent(content);
  
  // 詳細なコンテンツタイプ判定
  const hasHtmlTags = /<[^>]+>/.test(processedContent);
  const hasMarkdownSyntax = /^#{1,6}\s|^\*\*.*\*\*|\*.*\*|\[.*\]\(.*\)|^[-*+]\s|\n\s*[-*+]\s|```/.test(processedContent);
  
  // 見出しにIDを生成するためのカウンター
  let headingIndex = 0;
  
  console.log('Content analysis:', {
    originalLength: content.length,
    processedLength: processedContent.length,
    hasHtmlTags,
    hasMarkdownSyntax,
    contentPreview: processedContent.substring(0, 500),
    renderingAs: hasHtmlTags && !hasMarkdownSyntax ? 'HTML' : 'Markdown',
    hasLinks: /\[([^\]]+)\]\(([^)]+)\)/.test(processedContent),
    linkMatches: processedContent.match(/\[([^\]]+)\]\(([^)]+)\)/g)
  });
  
  if (hasHtmlTags && !hasMarkdownSyntax) {
    // HTMLコンテンツの場合
    const contentWithIds = addHeadingIds(processedContent);
    return (
      <div 
        className={`prose-article ${className}`}
        dangerouslySetInnerHTML={{ __html: contentWithIds }}
      />
    );
  } else {
    // Markdownコンテンツまたは生テキストの場合
    return (
      <div className={`prose-article ${className}`} style={{ whiteSpace: 'pre-wrap' }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          components={{
            h1: ({ children, ...props }) => {
              const text = children?.toString() || '';
              const id = `heading-${headingIndex++}`;
              return (
                <h1 id={id} className="text-3xl font-bold text-gray-900 mb-6 mt-8 first:mt-0" {...props}>
                  {children}
                </h1>
              );
            },
            h2: ({ children, ...props }) => {
              const text = children?.toString() || '';
              const id = `heading-${headingIndex++}`;
              return (
                <h2 id={id} className="text-2xl font-bold text-gray-900 mb-4 mt-6" {...props}>
                  {children}
                </h2>
              );
            },
            h3: ({ children, ...props }) => {
              const text = children?.toString() || '';
              const id = `heading-${headingIndex++}`;
              return (
                <h3 id={id} className="text-xl font-bold text-gray-900 mb-3 mt-5" {...props}>
                  {children}
                </h3>
              );
            },
            h4: ({ children, ...props }) => {
              const text = children?.toString() || '';
              const id = `heading-${headingIndex++}`;
              return (
                <h4 id={id} className="text-lg font-bold text-gray-900 mb-2 mt-4" {...props}>
                  {children}
                </h4>
              );
            },
            h5: ({ children, ...props }) => {
              const text = children?.toString() || '';
              const id = `heading-${headingIndex++}`;
              return (
                <h5 id={id} className="text-base font-bold text-gray-900 mb-2 mt-3" {...props}>
                  {children}
                </h5>
              );
            },
            h6: ({ children, ...props }) => {
              const text = children?.toString() || '';
              const id = `heading-${headingIndex++}`;
              return (
                <h6 id={id} className="text-sm font-bold text-gray-900 mb-2 mt-3" {...props}>
                  {children}
                </h6>
              );
            },
            p: ({ children, ...props }) => (
              <p className="text-gray-800 leading-relaxed mb-4" {...props}>
                {children}
              </p>
            ),
            // 改行を適切に処理するため、brタグのスタイルを追加
            br: ({ ...props }) => (
              <br className="leading-relaxed" {...props} />
            ),
            ul: ({ children, ...props }) => (
              <ul className="list-disc list-inside text-gray-800 mb-4 space-y-2" {...props}>
                {children}
              </ul>
            ),
            ol: ({ children, ...props }) => (
              <ol className="list-decimal list-inside text-gray-800 mb-4 space-y-2" {...props}>
                {children}
              </ol>
            ),
            li: ({ children, ...props }) => (
              <li className="text-gray-800" {...props}>
                {children}
              </li>
            ),
            blockquote: ({ children, ...props }) => (
              <blockquote className="border-l-4 border-accent pl-4 py-2 mb-4 text-gray-700 italic bg-gray-50 rounded-r" {...props}>
                {children}
              </blockquote>
            ),
            code: ({ children, className, ...props }) => {
              const isInline = !className;
              return isInline ? (
                <code className="bg-gray-100 text-accent px-1 py-0.5 rounded text-sm font-mono" {...props}>
                  {children}
                </code>
              ) : (
                <code className="block bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono mb-4" {...props}>
                  {children}
                </code>
              );
            },
            pre: ({ children, ...props }) => (
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono mb-4" {...props}>
                {children}
              </pre>
            ),
            a: ({ children, href, ...props }) => {
              console.log('Link component received:', { children, href, props });
              return (
                <a 
                  href={href} 
                  className="text-accent hover:text-accent/80 underline transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  {...props}
                >
                  {children}
                </a>
              );
            },
            img: ({ src, alt }) => (
              <div className="my-6">
                <Image
                  src={src || ''}
                  alt={alt || ''}
                  width={800}
                  height={400}
                  className="rounded-lg shadow-md w-full h-auto"
                />
              </div>
            ),
            table: ({ children, ...props }) => (
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg" {...props}>
                  {children}
                </table>
              </div>
            ),
            thead: ({ children, ...props }) => (
              <thead className="bg-gray-50" {...props}>
                {children}
              </thead>
            ),
            th: ({ children, ...props }) => (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200" {...props}>
                {children}
              </th>
            ),
            td: ({ children, ...props }) => (
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 border-b border-gray-200" {...props}>
                {children}
              </td>
            ),
          }}
        >
          {processedContent}
        </ReactMarkdown>
      </div>
    );
  }
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
  onLanguageChange,
  relatedArticles
}: { 
  article: JapanInfo; 
  language: LanguageKey;
  onLanguageChange: (lang: LanguageKey) => void;
  relatedArticles: JapanInfo[];
}) {
  const content = getArticleContent(article, language);
  const t = japanInfoTranslations[language];
  const fontClass = getFontClass(language);
  

  
  // 目次を生成
  const tocItems = content ? generateTableOfContents(content) : [];

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

          {/* 目次 */}
          {tocItems.length > 0 && (
            <TableOfContents 
              tocItems={tocItems}
              language={language}
            />
          )}

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
              <ArticleContent 
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
            {/* 新しいフッター機能 */}
            <ArticleFooter 
              article={article}
              relatedArticles={relatedArticles}
              language={language}
            />
            
            {/* 戻るボタン */}
            <div className="text-center mt-8">
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
      relatedArticles={initialData.relatedArticles}
    />
  );
} 