'use client';

// ===================================
// Japan Info Grid Component（オウンドメディア風）
// ===================================

import Link from 'next/link';
import Image from 'next/image';
import { JapanInfo } from '@/types/japan-info';
import { Clock, Eye, MapPin } from 'lucide-react';

interface JapanInfoGridProps {
  articles: JapanInfo[];
  highlightTerms?: string[];
  currentPage?: number;
}

export default function JapanInfoGrid({ 
  articles, 
  highlightTerms = [],
  currentPage = 1 
}: JapanInfoGridProps) {
  const highlightText = (text: string) => {
    if (highlightTerms.length === 0) return text;
    
    let highlightedText = text;
    highlightTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(
        regex,
        '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
      );
    });
    
    return highlightedText;
  };

  if (articles.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl text-gray-300 mb-6">📝</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          記事がありません
        </h3>
        <p className="text-gray-600">
          まだ記事が投稿されていないか、検索条件に一致する記事がありません。
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {articles.map((article, index) => (
        <article
          key={article.id}
          className="group cursor-pointer"
        >
          <Link href={`/japan-info/${article.id}`} className="block">
            {/* 記事画像 */}
            <div className="relative h-56 mb-4 overflow-hidden rounded-xl bg-gray-100">
              {article.image_url ? (
                <Image
                  src={article.image_url}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                  <span className="text-5xl text-blue-200">🏯</span>
                </div>
              )}
              
              {/* 人気記事バッジ */}
              {article.is_popular && (
                <div className="absolute top-4 left-4">
                  <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                    人気
                  </span>
                </div>
              )}
            </div>

            {/* 記事コンテンツ */}
            <div className="space-y-3">
              {/* タグ */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {article.tags.slice(0, 2).map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-600 rounded-md border border-blue-100"
                    >
                      {tag}
                    </span>
                  ))}
                  {article.tags.length > 2 && (
                    <span className="text-xs font-medium px-2 py-1 bg-gray-50 text-gray-500 rounded-md border border-gray-100">
                      +{article.tags.length - 2}
                    </span>
                  )}
                </div>
              )}

              {/* タイトル */}
              <h3 
                className="text-xl font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors duration-200 line-clamp-2"
                dangerouslySetInnerHTML={{ 
                  __html: highlightText(article.title) 
                }}
              />

              {/* 説明 */}
              <p 
                className="text-gray-600 leading-relaxed line-clamp-3"
                dangerouslySetInnerHTML={{ 
                  __html: highlightText(article.description) 
                }}
              />

              {/* メタ情報 */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  {article.location && (
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span>{article.location}</span>
                    </div>
                  )}
                  
                  {article.views && article.views > 0 && (
                    <div className="flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      <span>{article.views.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                
                {article.published_at && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    <time dateTime={article.published_at}>
                      {new Date(article.published_at).toLocaleDateString('ja-JP', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </time>
                  </div>
                )}
              </div>
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
} 