'use client';

import Image from 'next/image';
import Link from 'next/link';
import { createServerComponentClient } from '@/lib/supabase';
import { Restaurant } from '@/lib/types';
import { useLanguage } from '@/contexts/language-context';
// アイコンをSVGで直接実装して依存性を削減

type LocationFilter = '全て' | '大阪' | '東京' | '京都';

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
async function getRestaurants(): Promise<Restaurant[]> {
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

// レストランデータ取得とページコンポーネント
export default async function RestaurantsPage() {
  // Supabaseからレストラン情報を取得
  const restaurants = await getRestaurants();
  
  // カテゴリタグを持つレストランを準備
  const enhancedRestaurants = restaurants.map(restaurant => ({
    ...restaurant,
    tags: restaurant.cuisine ? [restaurant.cuisine] : [],
    location: restaurant.location || '未設定'
  }));
  
  // クライアントコンポーネントをラップしてデータを渡す
  return <RestaurantsClient restaurants={enhancedRestaurants} />;
}

// クライアントコンポーネント
function RestaurantsClient({ restaurants }: { restaurants: Restaurant[] }) {
  const { language } = useLanguage();
  const t = translations[language];
  
  return (
    <main className="max-w-md mx-auto min-h-screen bg-gray-50 pb-20">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-white shadow-sm px-4 py-3 flex items-center">
        <div className="flex items-center flex-1">
          <Link href="/" className="mr-2">
            <Image 
              src="/irulogo-hidariue.svg" 
              alt="IRUTOMO" 
              width={100} 
              height={20} 
              priority
            />
          </Link>
        </div>
        <div className="flex items-center">
          <h1 className="text-lg font-bold mr-2">{t.title}</h1>
          <Link href="/" className="ml-auto">
            <button className="p-2 rounded-md hover:bg-gray-100 transition-colors">
              <ArrowLeftIcon />
            </button>
          </Link>
        </div>
      </header>

      {/* フィルター */}
      <div className="bg-white shadow-sm p-4 mb-4">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <button className="px-4 py-2 rounded-md bg-[#00CBB3] text-white font-medium whitespace-nowrap">
            {t.all}
          </button>
          <button className="px-4 py-2 rounded-md border border-gray-200 text-gray-700 font-medium whitespace-nowrap hover:bg-gray-50">
            大阪
          </button>
          <button className="px-4 py-2 rounded-md border border-gray-200 text-gray-700 font-medium whitespace-nowrap hover:bg-gray-50">
            東京
          </button>
          <button className="px-4 py-2 rounded-md border border-gray-200 text-gray-700 font-medium whitespace-nowrap hover:bg-gray-50">
            京都
          </button>
        </div>
      </div>
      
      {/* レストランカード */}
      <section className="px-4">
        <div className="grid grid-cols-1 gap-4">
          {restaurants.length > 0 ? (
            restaurants.map((restaurant) => (
              <div key={restaurant.id} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
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
                  <h3 className="font-bold text-lg mb-1">{restaurant.name}</h3>
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
                      className="px-4 py-2 bg-[#FFA500] text-white rounded-md font-medium hover:bg-[#FFA500]/90 transition-colors"
                    >
                      {t.reserve}
                    </Link>
                    <Link 
                      href={restaurant.google_maps_link || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name)}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 border border-gray-200 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center"
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