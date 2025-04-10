'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/contexts/language-context';
import { Restaurant } from '@/types/restaurant';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// レストラン情報をAPIエンドポイントから取得する関数
async function getPopularRestaurants(): Promise<Restaurant[]> {
  try {
    // APIリクエスト
    const response = await fetch('/api/restaurants/popular', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'APIエラーが発生しました');
    }
    
    // 新しいAPIレスポンス形式に対応
    return result.data || [];
  } catch (error) {
    console.error('レストラン情報の取得中にエラーが発生しました:', error);
    throw error;
  }
}

// 画像URLを取得する関数
function getRestaurantImageUrl(restaurant: Restaurant): string {
  // Unsplashの画像はエラーが発生するため、代替画像を使用
  function useAlternativeIfUnsplash(url: string): string {
    if (url.includes('unsplash.com')) {
      return '/images/restaurants/placeholder.jpg';
    }
    return url;
  }

  // まずimage_urlをチェック
  if (restaurant.image_url) {
    return useAlternativeIfUnsplash(restaurant.image_url);
  }
  
  // imagesプロパティがある場合
  if (restaurant.images) {
    // 配列の場合は最初の要素を使用
    if (Array.isArray(restaurant.images) && restaurant.images.length > 0) {
      return useAlternativeIfUnsplash(restaurant.images[0]);
    }
    // 文字列の場合でJSON形式ならパースを試みる
    if (typeof restaurant.images === 'string') {
      if (restaurant.images.startsWith('[') || restaurant.images.startsWith('{')) {
        try {
          const parsedImages = JSON.parse(restaurant.images);
          if (Array.isArray(parsedImages) && parsedImages.length > 0) {
            return useAlternativeIfUnsplash(parsedImages[0]);
          }
        } catch (e) {
          console.warn('画像JSONのパースに失敗:', e);
        }
      }
      // 単純な文字列の場合はそのまま使用
      return useAlternativeIfUnsplash(restaurant.images);
    }
  }
  
  // フォールバック: プレースホルダー画像を返す
  return '/images/restaurants/placeholder.jpg';
}

// SVGコンポーネント
const StarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const MapPinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const ExternalLinkIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

export default function PopularRestaurants() {
  const { language } = useLanguage();
  
  const content = {
    ja: {
      title: '🔥人気店舗',
      viewMore: 'もっと見る',
      popular: '人気店',
      viewDetails: '詳細を見る',
      notFound: 'レストラン情報が見つかりませんでした。',
      location: '未設定',
      error: 'エラーが発生しました。再読み込みしてください。',
      retry: '再試行',
      connectionError: 'サーバーに接続できません。ネットワーク接続を確認してください。',
      dataError: 'データの取得に失敗しました。しばらくしてから再試行してください。'
    },
    ko: {
      title: '🔥인기 맛집',
      viewMore: '더보기',
      popular: '인기 맛집',
      viewDetails: '상세보기',
      notFound: '레스토랑 정보를 찾을 수 없습니다.',
      location: '미설정',
      error: '오류가 발생했습니다. 다시 로드하십시오.',
      retry: '다시 시도',
      connectionError: '서버에 연결할 수 없습니다. 네트워크 연결을 확인하세요.',
      dataError: '데이터를 가져 오지 못했습니다. 잠시 후 다시 시도하십시오.'
    }
  };

  // 非同期データフェッチのためのステート
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPopularRestaurants = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPopularRestaurants();
        setRestaurants(data);
      } catch (err) {
        console.error('人気レストラン取得エラー:', err);
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchPopularRestaurants();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">🔥人気のレストラン</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden bg-white">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <p>エラーが発生しました: {error}</p>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return <p className="text-gray-500">レストランが見つかりませんでした。</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">{content[language].title}</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 px-3">
        {restaurants.map((restaurant) => (
          <div key={restaurant.id} className="bg-white rounded-md overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-200 border border-gray-100 flex flex-col h-full">
            <Link href={`/restaurants/${restaurant.id}`} className="block">
              <div className="relative h-48 w-full">
                <Image
                  src={getRestaurantImageUrl(restaurant)}
                  alt={restaurant.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {/* 評価バッジ */}
                <div className="absolute top-2 right-2 bg-white/90 px-2 py-0.5 rounded-full text-sm font-bold flex items-center">
                  <StarIcon className="w-4 h-4 mr-1 text-yellow-500 fill-yellow-500" />
                  <span className="text-gray-900">{restaurant.rating.toFixed(1)}</span>
                </div>
                
                {/* 人気バッジ (評価が4.5以上の場合) */}
                {restaurant.rating && restaurant.rating >= 4.5 && (
                  <div className="absolute top-2 left-2 bg-[#FFA500] px-2 py-0.5 rounded-full text-xs text-white font-bold">
                    {content[language].popular}
                  </div>
                )}
              </div>
              
              <div className="p-4 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg mb-1 text-gray-900">
                    {language === 'ko' ? restaurant.korean_name || restaurant.name : restaurant.name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <MapPinIcon className="w-4 h-4 mr-1" />
                    <span className="truncate">
                      {language === 'ko' 
                        ? restaurant.korean_address || restaurant.location || restaurant.address?.split(',')[0] || content[language].location
                        : restaurant.location || restaurant.address?.split(',')[0] || content[language].location
                      }
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {restaurant.cuisine && (
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                        {language === 'ko' ? restaurant.korean_cuisine || restaurant.cuisine : restaurant.cuisine}
                      </span>
                    )}
                    {restaurant.price_range && (
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                        {restaurant.price_range}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
            
            <div className="flex gap-1 p-1">
              <Link 
                href={`/restaurants/${restaurant.id}`}
                className="flex-grow px-2 py-1.5 bg-[#FFA500] text-white rounded-md text-xs sm:text-sm font-medium hover:bg-[#FFA500]/90 transition-colors"
              >
                {language === 'ko' ? '예약하기' : '予約する'}
              </Link>
              <a 
                href={restaurant.google_maps_link || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name)}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="px-2 py-1.5 border border-gray-200 rounded-md text-gray-700 text-xs sm:text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <ExternalLinkIcon className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 