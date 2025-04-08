'use client';

import Image from 'next/image';
import Link from 'next/link';
import { createServerComponentClient } from '@/lib/supabase';
import { Restaurant } from '@/lib/types';
import { useLanguage } from '@/contexts/language-context';
import React, { useState, useEffect } from 'react';
// アイコンをSVGで直接実装して依存性を削減

type LocationFilter = '全て' | '大阪' | '東京' | '京都';

// 拡張されたレストラン型の定義
type EnhancedRestaurant = Restaurant & {
  tags: string[];
};

// SVGコンポーネント
const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const StarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// 星評価を表示するコンポーネント
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center">
      <StarIcon className="w-4 h-4 mr-1 text-yellow-500 fill-yellow-500" />
      <span className="font-bold">{rating.toFixed(1)}</span>
    </div>
  );
}

// レストラン情報をSupabaseから取得する関数
async function getRestaurants() {
  try {
    const supabase = await createServerComponentClient();
    
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('レストラン情報の取得エラー:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('レストラン情報の取得中にエラーが発生しました:', error);
    return [];
  }
}

// 多言語対応のテキスト
const translations = {
  ko: {
    title: '맛집 목록',
    backToHome: '홈으로 돌아가기',
    all: '전체',
    popular: '인기',
    notFound: '맛집 정보를 찾을 수 없습니다.',
    reserve: '예약하기',
    map: '지도'
  },
  ja: {
    title: 'レストラン一覧',
    backToHome: 'ホームに戻る',
    all: 'すべて',
    popular: '人気',
    notFound: 'レストラン情報が見つかりませんでした。',
    reserve: '予約する',
    map: '地図'
  }
};

// フォールバック用のダミーレストランデータ
const FALLBACK_RESTAURANTS: EnhancedRestaurant[] = [
  {
    id: 'dummy-1',
    name: '鉄鍋餃子 餃子の山崎',
    korean_name: '철판 만두 만두의 야마자키',
    cuisine: '居酒屋',
    location: '大阪北区',
    rating: 4.4,
    price_range: '¥¥',
    image_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=400',
    address: '大阪府大阪市北区',
    description: '鉄鍋で焼き上げる絶品餃子とビールが楽しめる居酒屋です。',
    tags: ['居酒屋', '餃子']
  },
  {
    id: 'dummy-2',
    name: 'おでん酒場 湯あみ',
    korean_name: '오뎅 술집 유아미',
    cuisine: '居酒屋',
    location: '大阪北区',
    rating: 4.2,
    price_range: '¥¥',
    image_url: 'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?auto=format&fit=crop&w=400',
    address: '大阪府大阪市北区',
    description: '季節の具材を使った本格おでんとお酒が楽しめる隠れ家的な居酒屋です。',
    tags: ['居酒屋', 'おでん']
  },
  {
    id: 'dummy-3',
    name: '炭火焼鳥 コクレ',
    korean_name: '숯불구이 코쿠레',
    cuisine: '居酒屋',
    location: '大阪福島',
    rating: 4.4,
    price_range: '¥¥',
    image_url: 'https://images.unsplash.com/photo-1591684080176-bb2b73f9ec68?auto=format&fit=crop&w=400',
    address: '大阪府大阪市福島区',
    description: '備長炭で丁寧に焼き上げる絶品焼き鳥と季節の日本酒が楽しめるお店です。',
    tags: ['居酒屋', '焼き鳥']
  }
];

// クライアントコンポーネントとしてページを再実装
export default function RestaurantsPage() {
  // グローバルヘッダーを非表示にする
  useEffect(() => {
    const header = document.querySelector('.global-header');
    if (header) {
      header.classList.add('hidden');
    }

    return () => {
      const header = document.querySelector('.global-header');
      if (header) {
        header.classList.remove('hidden');
      }
    };
  }, []);

  // 言語設定を取得
  const { language } = useLanguage();
  const t = translations[language];
  
  // レストランデータを状態として管理
  const [restaurants, setRestaurants] = useState<EnhancedRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  
  // サーバーからデータを取得
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await getRestaurants();
        if (!data || data.length === 0) {
          setRestaurants(FALLBACK_RESTAURANTS);
        } else {
          // カテゴリタグを持つレストランを準備
          const enhancedRestaurants = data.map(restaurant => ({
            ...restaurant,
            tags: restaurant.cuisine ? [restaurant.cuisine] : [],
            location: restaurant.location || '未設定'
          }));
          setRestaurants(enhancedRestaurants as EnhancedRestaurant[]);
        }
      } catch (error) {
        console.error('データ取得エラー:', error);
        setRestaurants(FALLBACK_RESTAURANTS);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  // ローディング中の表示
  if (loading) {
    return (
      <main className="max-w-md mx-auto bg-background min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-t-4 border-[#00CBB3] rounded-full animate-spin"></div>
      </main>
    );
  }
  
  return (
    <main className="max-w-md mx-auto bg-background pb-20">
      {/* ホームに戻るリンク */}
      <div className="p-4">
        <Link href="/" className="text-gray-600 hover:text-[#00CBB3] transition-colors flex items-center">
          <ArrowLeftIcon />
          <span className="ml-1">{t.backToHome}</span>
        </Link>
      </div>

      {/* フィルター */}
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex space-x-2 overflow-x-auto pb-2 -mx-1 px-1">
            <button className="px-4 py-2 rounded-md bg-[#00CBB3] text-white font-medium whitespace-nowrap shadow-sm">
              {t.all}
            </button>
            <button className="px-4 py-2 rounded-md border border-gray-200 text-gray-700 font-medium whitespace-nowrap hover:bg-gray-50 transition-colors">
              大阪
            </button>
            <button className="px-4 py-2 rounded-md border border-gray-200 text-gray-700 font-medium whitespace-nowrap hover:bg-gray-50 transition-colors">
              東京
            </button>
            <button className="px-4 py-2 rounded-md border border-gray-200 text-gray-700 font-medium whitespace-nowrap hover:bg-gray-50 transition-colors">
              京都
            </button>
          </div>
        </div>
      </div>
      
      {/* レストランカード */}
      <section className="p-4">
        <div className="grid grid-cols-1 gap-4 pb-8">
          {restaurants.length > 0 ? (
            restaurants.map((restaurant) => (
              <div key={restaurant.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow transition-shadow duration-200 border border-gray-100">
                <div className="relative h-48">
                  <Image
                    src={restaurant.image_url || '/images/restaurants/placeholder.jpg'}
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw"
                  />
                  {/* 評価バッジ */}
                  <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full text-sm font-bold flex items-center">
                    <StarIcon className="w-4 h-4 mr-1 text-yellow-500 fill-yellow-500" />
                    {restaurant.rating?.toFixed(1) || '0.0'}
                  </div>
                  
                  {/* 人気バッジ (評価が4.5以上の場合) */}
                  {restaurant.rating && restaurant.rating >= 4.5 && (
                    <div className="absolute top-3 left-3 bg-[#FFA500] px-3 py-1 rounded-full text-xs text-white font-bold">
                      {t.popular}
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">
                    {language === 'ko' && restaurant.korean_name ? restaurant.korean_name : restaurant.name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    {restaurant.location || restaurant.address?.split(',')[0] || '未設定'}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {restaurant.cuisine && (
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                        {restaurant.cuisine}
                      </span>
                    )}
                    {restaurant.price_range && (
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                        {restaurant.price_range}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Link 
                      href={`/restaurants/${restaurant.id}`}
                      className="px-4 py-2 bg-[#FFA500] text-white rounded-md font-medium hover:bg-[#FFA500]/90 transition-colors flex-1 text-center"
                    >
                      {t.reserve}
                    </Link>
                    <Link 
                      href={restaurant.google_maps_link || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name)}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 border border-gray-200 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                      {t.map}
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-10 text-center bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">{t.notFound}</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}