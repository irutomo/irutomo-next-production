'use client';

// ===================================
// Japan Info Grid Component
// ===================================

import Link from 'next/link';
import Image from 'next/image';
import { JapanInfo } from '@/types/japan-info';

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
      <div className="text-center py-12">
        <div className="text-6xl text-gray-300 mb-4">📝</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          記事がありません
        </h3>
        <p className="text-gray-600">
          まだ記事が投稿されていないか、検索条件に一致する記事がありません。
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article, index) => (
        <article
          key={article.id}
          className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-shadow duration-300 overflow-hidden group"
        >
          <Link href={`/japan-info/${article.id}`}>
            {/* 記事画像 */}
            <div className="relative h-48 overflow-hidden">
              {article.image_url ? (
                <Image
                  src={article.image_url}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                  <span className="text-4xl text-blue-300">🏯</span>
                </div>
              )}
              
              {/* 人気記事バッジ */}
              {article.is_popular && (
                <div className="absolute top-3 left-3">
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    人気
                  </span>
                </div>
              )}
              
              {/* 閲覧数 */}
              {article.views && article.views > 0 && (
                <div className="absolute top-3 right-3">
                  <span className="bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                    👁 {article.views.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* 記事コンテンツ */}
            <div className="p-6">
              {/* タグ */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {article.tags.slice(0, 3).map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {article.tags.length > 3 && (
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                      +{article.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* タイトル */}
              <h3 
                className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors"
                dangerouslySetInnerHTML={{ 
                  __html: highlightText(article.title) 
                }}
              />

              {/* 説明 */}
              <p 
                className="text-gray-600 text-sm line-clamp-3 mb-4"
                dangerouslySetInnerHTML={{ 
                  __html: highlightText(article.description) 
                }}
              />

              {/* メタ情報 */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                  {article.location && (
                    <span className="flex items-center">
                      📍 {article.location}
                    </span>
                  )}
                  
                  {article.author && (
                    <span className="flex items-center">
                      ✍️ {article.author}
                    </span>
                  )}
                </div>
                
                {article.published_at && (
                  <time dateTime={article.published_at}>
                    {new Date(article.published_at).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </time>
                )}
              </div>
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
} 