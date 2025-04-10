'use client';

import Link from 'next/link';
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
    map: '지도'
  },
  ja: {
    title: 'レストラン一覧',
    pageTitle: 'レストラン一覧',
    backToHome: 'ホームに戻る',
    all: 'すべて',
    popular: '人気',
    notFound: 'レストラン情報が見つかりませんでした。',
    reserve: '予約する',
    map: '地図'
  }
};

// クライアントコンポーネント
export default function RestaurantsClient({ restaurants }: { restaurants: Restaurant[] }) {
  const { language } = useLanguage();
  const t = translations[language];
  
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
        <div className="space-y-6">
          {restaurants.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
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
        
        {/* リクエストフォームカード */}
        <CtaBanner />
      </div>
    </main>
  );
} 