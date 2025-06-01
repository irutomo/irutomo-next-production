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
 * 言語に応じて記事の説明文を取得
 */
export function getArticleDescription(article: JapanInfo, language: LanguageKey): string {
  return language === 'ko' ? (article.korean_description || article.description) : article.description;
}

/**
 * 言語に応じて記事のコンテンツを取得
 */
export function getArticleContent(article: JapanInfo, language: LanguageKey): string {
  return language === 'ko' ? (article.korean_content || article.content) : article.content;
}

/**
 * 公開日をフォーマット
 */
export function formatPublishedDate(publishedAt: string | null, language: LanguageKey): string {
  if (!publishedAt) return '';
  
  const date = new Date(publishedAt);
  const locale = language === 'ko' ? 'ko-KR' : 'ja-JP';
  
  return date.toLocaleDateString(locale);
}

/**
 * 韓国語フォント用のCSSクラスを取得
 */
export function getFontClass(language: LanguageKey): string {
  return language === 'ko' ? 'font-noto-sans-kr' : '';
}

/**
 * 閲覧数を読みやすい形式にフォーマット
 */
export function formatViewCount(views: number): string {
  return views.toLocaleString();
}

/**
 * カードのアニメーション遅延を計算
 */
export function getAnimationDelay(index: number): string {
  return `${index * 100}ms`;
} 