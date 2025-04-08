'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { StarIcon } from 'lucide-react';
import { Restaurant } from '@/types/restaurant';
import { useLanguage } from '@/contexts/language-context';
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

export default function PopularRestaurants() {
  const { language } = useLanguage();
  
  const content = {
    ja: {
      title: '人気店舗',
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
      title: '인기 맛집',
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
        <h2 className="text-2xl font-bold text-gray-900">人気のレストラン</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
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
      <h2 className="text-2xl font-bold text-gray-900">人気のレストラン</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {restaurants.map((restaurant) => (
          <Link key={restaurant.id} href={`/restaurants/${restaurant.id}`} className="block">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 bg-white">
              <div className="relative h-48 w-full">
                <Image
                  src={getRestaurantImageUrl(restaurant)}
                  alt={restaurant.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {/* 評価バッジ */}
                <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full text-sm font-bold flex items-center">
                  <span className="text-yellow-500">★</span>
                  <span className="ml-1 text-gray-900">{restaurant.rating.toFixed(1)}</span>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-1 text-gray-900">{restaurant.name}</h3>
                <div className="flex items-center">
                  <div className="text-sm text-gray-500">
                    {restaurant.location || '未設定'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
} 