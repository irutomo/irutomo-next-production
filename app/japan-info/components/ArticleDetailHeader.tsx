// ===================================
// 記事詳細ヘッダーコンポーネント
// ===================================

import { CalendarIcon, MapPinIcon, EyeIcon, Clock } from 'lucide-react';
import { JapanInfo } from '@/types/japan-info';
import { LanguageKey, japanInfoTranslations } from '../lib/translations';
import { 
  getArticleTitle, 
  getArticleDescription, 
  formatPublishedDate, 
  getFontClass,
  formatViewCount
} from '../lib/utils';

interface ArticleDetailHeaderProps {
  article: JapanInfo;
  language: LanguageKey;
}

export function ArticleDetailHeader({ article, language }: ArticleDetailHeaderProps) {
  const t = japanInfoTranslations[language];
  const title = getArticleTitle(article, language);
  const description = getArticleDescription(article, language);
  const publishedDate = formatPublishedDate(article.published_at || null, language);
  const fontClass = getFontClass(language);

  return (
    <header className="mb-8 md:mb-12">
      {/* タイトル */}
      <h1 className={`text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6 ${fontClass}`}>
        {title}
      </h1>

      {/* 説明文（もしあれば表示） */}
      {description && description !== title && (
        <p className={`text-lg md:text-xl text-gray-600 leading-relaxed mb-6 ${fontClass}`}>
          {description}
        </p>
      )}

      {/* メタ情報 */}
      <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-gray-600 mb-8">
        {publishedDate && (
          <div className="flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2" />
            <span className={fontClass}>{publishedDate}</span>
          </div>
        )}
        
        {article.location && (
          <div className="flex items-center">
            <MapPinIcon className="w-4 h-4 mr-2" />
            <span className={fontClass}>{article.location}</span>
          </div>
        )}
        
        {article.views !== undefined && (
          <div className="flex items-center">
            <EyeIcon className="w-4 h-4 mr-2" />
            <span className={fontClass}>{formatViewCount(article.views)}</span>
          </div>
        )}

        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          <span className={fontClass}>{t.readingTime}</span>
        </div>
      </div>
    </header>
  );
} 