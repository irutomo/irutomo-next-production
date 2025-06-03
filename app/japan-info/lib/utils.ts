// ===================================
// Japan Info 共通ユーティリティ関数
// ===================================

import { JapanInfo } from '@/types/japan-info';
import { LanguageKey } from './translations';

/**
 * 言語に応じて記事のタイトルを取得
 */
export function getArticleTitle(article: JapanInfo, language: LanguageKey): string {
  return language === 'ko' ? (article.korean_title || article.title) : article.title;
}

/**
 * 言語に応じて記事の説明を取得
 */
export function getArticleDescription(article: JapanInfo, language: LanguageKey): string {
  return language === 'ko' ? (article.korean_description || article.description) : article.description;
}

/**
 * 言語に応じて記事のコンテンツを取得
 */
export function getArticleContent(article: JapanInfo, language: LanguageKey): string {
  const content = language === 'ko' ? (article.korean_content || article.content) : article.content;
  
  // デバッグ: コンテンツの詳細を出力
  if (typeof window !== 'undefined') {
    console.log('Article content details:', {
      language,
      contentPreview: content?.substring(0, 500),
      hasHtml: /<[^>]+>/.test(content || ''),
      hasMarkdown: /^#|\*\*|__|\[.*\]|\n\s*[-*+]/.test(content || ''),
      hasLinks: /\[([^\]]+)\]\(([^)]+)\)/.test(content || ''),
      linkExamples: content?.match(/\[([^\]]+)\]\(([^)]+)\)/g),
      rawContent: content
    });
  }
  
  return content;
}

/**
 * 言語に応じたフォントクラスを取得
 */
export function getFontClass(language: LanguageKey): string {
  return language === 'ko' ? 'font-noto-sans-kr' : '';
}

/**
 * 日付をフォーマット
 */
export function formatPublishedDate(date: string | null, language: LanguageKey): string | null {
  if (!date) return null;
  
  const d = new Date(date);
  
  if (language === 'ko') {
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * 閲覧数をフォーマット
 */
export function formatViewCount(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  return views.toString();
}

/**
 * アニメーション遅延を取得
 */
export function getAnimationDelay(index: number): string {
  return `${index * 100}ms`;
}

// ===================================
// 目次生成関連のユーティリティ関数
// ===================================

export interface TocItem {
  id: string;
  text: string;
  level: number;
  children?: TocItem[];
}

/**
 * HTMLコンテンツまたはMarkdownコンテンツから目次（Table of Contents）を生成
 */
export function generateTableOfContents(content: string): TocItem[] {
  // HTMLタグが含まれているかチェック
  const hasHtmlTags = /<[^>]+>/.test(content);
  
  if (hasHtmlTags) {
    // HTMLコンテンツの場合
    if (typeof window === 'undefined') {
      // Server-side: 簡易HTML解析
      return parseHeadingsServerSide(content);
    }
    
    // Client-side: DOM解析
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    const tocItems: TocItem[] = [];
    
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      const text = heading.textContent?.trim() || '';
      const id = createHeadingId(text, index);
      
      // 元のHTMLにIDを追加（クライアント側でのみ実行）
      if (!heading.id) {
        heading.id = id;
      }
      
      tocItems.push({
        id,
        text,
        level,
      });
    });
    
    return buildHierarchicalToc(tocItems);
  } else {
    // Markdownコンテンツの場合
    return parseMarkdownHeadings(content);
  }
}

/**
 * サーバーサイドでのHTMLヘッダー解析
 */
function parseHeadingsServerSide(htmlContent: string): TocItem[] {
  const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi;
  const tocItems: TocItem[] = [];
  let match;
  let index = 0;
  
  while ((match = headingRegex.exec(htmlContent)) !== null) {
    const level = parseInt(match[1]);
    const text = match[2].replace(/<[^>]*>/g, '').trim(); // HTMLタグを除去
    const id = createHeadingId(text, index);
    
    tocItems.push({
      id,
      text,
      level,
    });
    
    index++;
  }
  
  return buildHierarchicalToc(tocItems);
}

/**
 * 見出しからIDを生成
 */
function createHeadingId(text: string, index: number): string {
  // 日本語・韓国語対応のスラッグ生成
  const slug = text
    .toLowerCase()
    .replace(/[^\w\s-\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\uac00-\ud7af]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  return slug || `heading-${index}`;
}

/**
 * フラットな目次を階層構造に変換
 */
function buildHierarchicalToc(flatToc: TocItem[]): TocItem[] {
  const result: TocItem[] = [];
  const stack: TocItem[] = [];
  
  flatToc.forEach(item => {
    // スタックから現在のレベル以上の要素を削除
    while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
      stack.pop();
    }
    
    if (stack.length === 0) {
      // トップレベル
      result.push(item);
    } else {
      // 親要素の子として追加
      const parent = stack[stack.length - 1];
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(item);
    }
    
    stack.push(item);
  });
  
  return result;
}

/**
 * HTMLコンテンツに見出しIDを追加
 */
export function addHeadingIds(htmlContent: string): string {
  let index = 0;
  
  return htmlContent.replace(
    /<h([1-6])([^>]*)>(.*?)<\/h[1-6]>/gi,
    (match, level, attributes, text) => {
      const cleanText = text.replace(/<[^>]*>/g, '').trim();
      const id = createHeadingId(cleanText, index);
      index++;
      
      // 既にIDが設定されている場合は追加しない
      if (attributes.includes('id=')) {
        return match;
      }
      
      return `<h${level}${attributes} id="${id}">${text}</h${level}>`;
    }
  );
}

/**
 * Markdownコンテンツから見出しを解析
 */
function parseMarkdownHeadings(markdownContent: string): TocItem[] {
  const lines = markdownContent.split('\n');
  const tocItems: TocItem[] = [];
  let index = 0;
  
  lines.forEach(line => {
    const trimmedLine = line.trim();
    
    // Markdown見出しの解析 (# ## ### など)
    const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      const id = createHeadingId(text, index);
      
      tocItems.push({
        id,
        text,
        level,
      });
      
      index++;
    }
  });
  
  return buildHierarchicalToc(tocItems);
} 