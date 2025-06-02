// ===================================
// 関連記事表示コンポーネント
// ===================================

import Link from 'next/link';
import Image from 'next/image';
import { CalendarIcon, EyeIcon } from 'lucide-react';
import { JapanInfo } from '@/types/japan-info';
import { LanguageKey } from '../../lib/translations';
import { 
  getArticleTitle, 
  getArticleDescription, 
  formatPublishedDate,
  getFontClass,
  formatViewCount
} from '../../lib/utils';

interface RelatedArticlesProps {
  articles: JapanInfo[];
  currentArticleId: string;
  language: LanguageKey;
}

interface RelatedArticleCardProps {
  article: JapanInfo;
  language: LanguageKey;
}

// 関連記事カードコンポーネント
function RelatedArticleCard({ article, language }: RelatedArticleCardProps) {
  const title = getArticleTitle(article, language);
  const description = getArticleDescription(article, language);
  const publishedDate = formatPublishedDate(article.published_at || null, language);
  const fontClass = getFontClass(language);

  return (
    <Link 
      href={`/japan-info/${article.id}`}
      className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      {/* 画像 */}
      {article.featured_image && (
        <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          <Image
            src={article.featured_image}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      )}

      {/* コンテンツ */}
      <div className="p-4">
        {/* タイトル */}
        <h3 className={`font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-accent transition-colors duration-300 ${fontClass}`}>
          {title}
        </h3>

        {/* 説明 */}
        {description && (
          <p className={`text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed ${fontClass}`}>
            {description}
          </p>
        )}

        {/* メタ情報 */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            {publishedDate && (
              <div className="flex items-center">
                <CalendarIcon className="w-3 h-3 mr-1" />
                <span className={fontClass}>{publishedDate}</span>
              </div>
            )}
          </div>
          
          {article.views !== undefined && article.views > 0 && (
            <div className="flex items-center">
              <EyeIcon className="w-3 h-3 mr-1" />
              <span className={fontClass}>{formatViewCount(article.views)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

// メイン関連記事コンポーネント
export function RelatedArticles({ articles, currentArticleId, language }: RelatedArticlesProps) {
  const fontClass = getFontClass(language);
  
  // 現在の記事を除外し、最大3件に制限
  const relatedArticles = articles
    .filter(article => article.id !== currentArticleId)
    .slice(0, 3);

  // 関連記事がない場合は表示しない
  if (relatedArticles.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <h3 className={`text-xl font-bold text-gray-900 mb-6 text-center ${fontClass}`}>
        {language === 'ja' ? '関連記事' : '관련 기사'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatedArticles.map((article) => (
          <RelatedArticleCard
            key={article.id}
            article={article}
            language={language}
          />
        ))}
      </div>
      
      {/* もっと見るボタン */}
      <div className="text-center mt-6">
        <Link
          href="/japan-info"
          className={`inline-flex items-center px-6 py-3 bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors font-medium ${fontClass}`}
        >
          {language === 'ja' ? 'もっと記事を見る' : '더 많은 기사 보기'}
        </Link>
      </div>
    </div>
  );
} 