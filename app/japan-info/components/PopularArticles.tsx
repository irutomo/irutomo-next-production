// ===================================
// Popular Articles Component（オウンドメディア風）
// ===================================

import Link from 'next/link';
import Image from 'next/image';
import { JapanInfo } from '@/types/japan-info';
import { TrendingUp, Eye, MapPin, Clock } from 'lucide-react';

interface PopularArticlesProps {
  articles: JapanInfo[];
}

export default function PopularArticles({ articles }: PopularArticlesProps) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="bg-white">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center">
          <TrendingUp className="w-8 h-8 text-red-500 mr-3" />
          人気の記事
        </h2>
        <Link
          href="/japan-info?popular=true"
          className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          すべて見る →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article, index) => (
          <article
            key={article.id}
            className="group relative"
          >
            <Link href={`/japan-info/${article.id}`} className="block">
              {/* 記事画像 */}
              <div className="relative h-56 overflow-hidden rounded-xl bg-gray-100 mb-4">
                {article.image_url ? (
                  <Image
                    src={article.image_url}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
                    <span className="text-5xl text-red-200">🌟</span>
                  </div>
                )}
                
                {/* ランキング番号 */}
                <div className="absolute top-4 left-4">
                  <div className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full flex items-center shadow-sm">
                    <span className="text-yellow-300 mr-1">🏆</span>
                    {index + 1}
                  </div>
                </div>
              </div>
              
              {/* 記事コンテンツ */}
              <div className="space-y-3">
                {/* タグ */}
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {article.tags.slice(0, 2).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="text-xs font-medium px-2 py-1 bg-red-50 text-red-600 rounded-md border border-red-100"
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
                <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-red-600 transition-colors duration-200 line-clamp-2">
                  {article.title}
                </h3>
                
                {/* 説明 */}
                {article.description && (
                  <p className="text-gray-600 leading-relaxed line-clamp-2">
                    {article.description}
                  </p>
                )}
                
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

      {/* フッター */}
      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-600">
          閲覧数とエンゲージメントに基づいて選出された人気記事です
        </p>
      </div>
    </section>
  );
} 