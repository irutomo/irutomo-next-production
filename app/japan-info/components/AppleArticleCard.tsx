// ===================================
// Apple風記事カードコンポーネント
// ===================================

import Link from 'next/link';
import Image from 'next/image';
import { CalendarIcon, MapPinIcon, EyeIcon } from 'lucide-react';
import { JapanInfo } from '@/types/japan-info';
import { LanguageKey, japanInfoTranslations } from '../lib/translations';
import { 
  getArticleTitle, 
  getArticleDescription, 
  formatPublishedDate, 
  getFontClass, 
  formatViewCount, 
  getAnimationDelay 
} from '../lib/utils';

interface AppleArticleCardProps {
  article: JapanInfo;
  language: LanguageKey;
  index: number;
}

export function AppleArticleCard({ article, language, index }: AppleArticleCardProps) {
  const t = japanInfoTranslations[language];
  const title = getArticleTitle(article, language);
  const description = getArticleDescription(article, language);
  const publishedDate = formatPublishedDate(article.published_at || null, language) || t.noDate;
  const fontClass = getFontClass(language);
  const animationDelay = getAnimationDelay(index);

  return (
    <article 
      className="group bg-white hover:bg-gradient-to-br hover:from-white hover:to-orange-50 transition-all duration-500 border border-gray-100 hover:border-accent/20 hover:shadow-xl rounded-2xl overflow-hidden transform hover:-translate-y-1"
      style={{ animationDelay }}
    >
      <Link href={`/japan-info/${article.id}`} className="block">
        <div className="flex gap-6 p-6">
          {/* 画像部分 */}
          {article.featured_image && (
            <div className="relative w-48 h-32 md:w-72 md:h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex-shrink-0 overflow-hidden shadow-md group-hover:shadow-lg transition-shadow duration-300">
              <Image
                src={article.featured_image}
                alt={title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 192px, 288px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          )}

          {/* コンテンツ部分 */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              {/* タイトル */}
              <h2 className={`text-xl md:text-2xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-accent transition-colors duration-300 ${fontClass}`}>
                {title}
              </h2>

              {/* 説明 */}
              {description && (
                <p className={`text-gray-600 mb-4 line-clamp-3 md:line-clamp-4 text-base md:text-lg leading-relaxed ${fontClass}`}>
                  {description}
                </p>
              )}
            </div>

            {/* メタ情報 */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                <CalendarIcon className="w-4 h-4 mr-2 text-accent" />
                <span className={fontClass}>{publishedDate}</span>
              </div>
              
              {article.location && (
                <div className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                  <MapPinIcon className="w-4 h-4 mr-2 text-accent" />
                  <span className={fontClass}>{article.location}</span>
                </div>
              )}
              
              {article.views !== undefined && (
                <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 ml-auto">
                  <EyeIcon className="w-4 h-4 mr-2 text-accent" />
                  <span className={fontClass}>{formatViewCount(article.views)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
} 