// ===================================
// Popular Articles Component
// ===================================

import Link from 'next/link';
import Image from 'next/image';
import { JapanInfo } from '@/types/japan-info';

interface PopularArticlesProps {
  articles: JapanInfo[];
}

export default function PopularArticles({ articles }: PopularArticlesProps) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <span className="text-red-500 mr-2">🔥</span>
          人気の記事
        </h2>
        <Link
          href="/japan-info?popular=true"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          すべて見る →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, index) => (
          <article
            key={article.id}
            className="group relative overflow-hidden rounded-lg"
          >
            <Link href={`/japan-info/${article.id}`}>
              {/* 記事画像 */}
              <div className="relative h-48 overflow-hidden rounded-lg">
                {article.image_url ? (
                  <Image
                    src={article.image_url}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center">
                    <span className="text-4xl text-red-300">🌟</span>
                  </div>
                )}
                
                {/* オーバーレイ */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* ランキング番号 */}
                <div className="absolute top-3 left-3">
                  <div className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full flex items-center">
                    <span className="text-yellow-300 mr-1">🏆</span>
                    {index + 1}位
                  </div>
                </div>
                
                {/* 閲覧数 */}
                {article.views && article.views > 0 && (
                  <div className="absolute top-3 right-3">
                    <span className="bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                      👁 {article.views.toLocaleString()}
                    </span>
                  </div>
                )}
                
                {/* タイトルとメタ情報 */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-lg line-clamp-2 mb-2 group-hover:text-yellow-300 transition-colors">
                    {article.title}
                  </h3>
                  
                  <div className="flex items-center justify-between text-xs text-gray-200">
                    {article.location && (
                      <span className="flex items-center">
                        📍 {article.location}
                      </span>
                    )}
                    
                    {article.published_at && (
                      <time dateTime={article.published_at}>
                        {new Date(article.published_at).toLocaleDateString('ja-JP', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </time>
                    )}
                  </div>
                </div>
              </div>
              
              {/* タグ */}
              {article.tags && article.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {article.tags.slice(0, 2).map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {article.tags.length > 2 && (
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                      +{article.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </Link>
          </article>
        ))}
      </div>

      {/* フッター */}
      <div className="mt-6 pt-4 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-600">
          閲覧数とエンゲージメントに基づいて選出された人気記事です
        </p>
      </div>
    </section>
  );
} 