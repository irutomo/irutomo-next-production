// ===================================
// 記事カードコンポーネント
// ===================================

import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, Eye } from 'lucide-react';
import { JapanInfo } from '@/types/japan-info';
import { LanguageKey } from '../../lib/translations';
import { getArticleTitle, getArticleDescription, getFontClass } from '../../lib/utils';

interface ArticleCardProps {
  article: JapanInfo;
  language: LanguageKey;
  priority?: boolean;
}

export function ArticleCard({ article, language, priority = false }: ArticleCardProps) {
  const title = getArticleTitle(article, language);
  const description = getArticleDescription(article, language);
  const fontClass = getFontClass(language);

  return (
    <Link href={`/japan-info/${article.id}`} className="group">
      <article className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02]">
        {/* 画像 */}
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={article.featured_image || article.image_url || '/images/placeholder-japan.jpg'}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            priority={priority}
          />
          
          {/* オーバーレイ */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* コンテンツ */}
        <div className="p-6">
          <h3 className={`text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-accent transition-colors ${fontClass}`}>
            {title}
          </h3>
          
          <p className={`text-gray-600 text-sm mb-4 line-clamp-3 ${fontClass}`}>
            {description}
          </p>
          
          {/* メタ情報 */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              {article.published_at && (
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>{new Date(article.published_at).toLocaleDateString()}</span>
                </div>
              )}
              
              {article.location && (
                <div className="flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span>{article.location}</span>
                </div>
              )}
            </div>
            
            {article.views && article.views > 0 && (
              <div className="flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                <span>{article.views.toLocaleString()}</span>
              </div>
            )}
          </div>
          
          {/* タグ */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {article.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="bg-accent/10 text-accent px-2 py-1 rounded-full text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
              {article.tags.length > 3 && (
                <span className="text-gray-400 text-xs">+{article.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}

// Backward compatibility
export { ArticleCard as AppleArticleCard }; 