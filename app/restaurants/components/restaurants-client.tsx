'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { Restaurant } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';
import { CtaBanner } from '@/components/cta-banner';
import RestaurantCard from '@/app/components/restaurant-card';

// 多言語対応のテキスト
const translations = {
  ko: {
    title: '맛집 목록',
    pageTitle: '홈으로 돌아가기',
    backToHome: '홈으로 돌아가기',
    all: '전체',
    popular: '인기',
    notFound: '맛집 정보를 찾을 수 없습니다.',
    reserve: '예약하기',
    map: '지도',
    osaka: '오사카',
    tokyo: '도쿄',
    kyoto: '교토'
  },
  ja: {
    title: 'レストラン一覧',
    pageTitle: 'レストラン一覧',
    backToHome: 'ホームに戻る',
    all: 'すべて',
    popular: '人気',
    notFound: 'レストラン情報が見つかりませんでした。',
    reserve: '予約する',
    map: '地図',
    osaka: '大阪',
    tokyo: '東京',
    kyoto: '京都'
  }
};

// 場所のフィルタータイプ
type LocationFilter = 'all' | 'osaka' | 'tokyo' | 'kyoto';

// クライアントコンポーネント
export default function RestaurantsClient({ restaurants }: { restaurants: Restaurant[] }) {
  const { language } = useLanguage();
  const t = translations[language];
  
  // フィルターの状態管理
  const [locationFilter, setLocationFilter] = useState<LocationFilter>('all');
  
  // フィルタリングされたレストラン
  const filteredRestaurants = useMemo(() => {
    if (locationFilter === 'all') {
      return restaurants;
    }
    
    // レストランの location フィールドに基づいてフィルタリング
    return restaurants.filter(restaurant => {
      const location = restaurant.location?.toLowerCase() || '';
      
      // 場所によるフィルタリング
      switch (locationFilter) {
        case 'osaka':
          return location.includes('大阪') || location.includes('osaka');
        case 'tokyo':
          return location.includes('東京') || location.includes('tokyo');
        case 'kyoto':
          return location.includes('京都') || location.includes('kyoto');
        default:
          return true;
      }
    });
  }, [restaurants, locationFilter]);
  
  return (
    <main className="max-w-7xl mx-auto bg-[#F8F8F8] min-h-screen pb-20">
      {/* シンプルなヘッダーに変更 */}
      <header className="flex items-center p-4 bg-white sticky top-0 z-50 shadow-custom">
        <Link href="/" className="mr-4">
          <ArrowLeft className="h-6 w-6 text-gray-600" />
        </Link>
        <h1 className="text-xl font-bold text-[#FFA500]">{t.pageTitle}</h1>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* フィルター */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <button 
              className={`px-4 py-2 rounded-md ${
                locationFilter === 'all' ? 'bg-[#00CBB3] text-white' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
              } font-medium whitespace-nowrap`}
              onClick={() => setLocationFilter('all')}
            >
              {t.all}
            </button>
            <button 
              className={`px-4 py-2 rounded-md ${
                locationFilter === 'osaka' ? 'bg-[#00CBB3] text-white' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
              } font-medium whitespace-nowrap`}
              onClick={() => setLocationFilter('osaka')}
            >
              {t.osaka}
            </button>
            <button 
              className={`px-4 py-2 rounded-md ${
                locationFilter === 'tokyo' ? 'bg-[#00CBB3] text-white' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
              } font-medium whitespace-nowrap`}
              onClick={() => setLocationFilter('tokyo')}
            >
              {t.tokyo}
            </button>
            <button 
              className={`px-4 py-2 rounded-md ${
                locationFilter === 'kyoto' ? 'bg-[#00CBB3] text-white' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
              } font-medium whitespace-nowrap`}
              onClick={() => setLocationFilter('kyoto')}
            >
              {t.kyoto}
            </button>
          </div>
        </div>
        
        {/* レストランカード */}
        <div className="space-y-6">
          {filteredRestaurants.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  translations={{
                    popular: t.popular,
                    reserve: t.reserve,
                    map: t.map
                  }}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">{t.notFound}</p>
          )}
        </div>
        
        {/* フィルター結果表示 */}
        {locationFilter !== 'all' && (
          <div className="text-center text-sm text-gray-600">
            {t[locationFilter]}: {filteredRestaurants.length}식당
          </div>
        )}
        
        {/* リクエストフォームカード */}
        <CtaBanner />
      </div>
    </main>
  );
} 