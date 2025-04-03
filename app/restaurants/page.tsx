import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SearchBar } from '@/components/ui/search-bar';
import { createServerComponentClient } from '@/lib/supabase';
import { Restaurant } from '@/lib/types';

export const metadata: Metadata = {
  title: '店舗情報 | IRUTOMO - 日本の飲食店予約サービス',
  description: 'IRUTOMOに登録されている飲食店の一覧です。様々なジャンルのレストランから選ぶことができます。',
};

// 星評価を表示するコンポーネント
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center">
      <div className="text-yellow-400 mr-1">
        <span>★</span>
      </div>
      <span className="text-sm">{rating.toFixed(1)}</span>
    </div>
  );
}

// レストラン情報をSupabaseから取得する関数
async function getRestaurants(): Promise<Restaurant[]> {
  try {
    const supabase = await createServerComponentClient();
    console.log('Supabaseに接続しました');
    
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('レストラン情報の取得エラー:', error);
      return [];
    }
    
    console.log('取得したレストラン数:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('レストラン情報の取得中にエラーが発生しました:', error);
    return [];
  }
}

export default async function RestaurantsPage() {
  // Supabaseからレストラン情報を取得
  const restaurants = await getRestaurants();
  
  return (
    <div className="py-8">
      <div className="container max-w-6xl mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-bold mb-8">店舗情報</h1>
        
        {/* 検索バー */}
        <div className="mb-8">
          <SearchBar placeholder="大阪のグルメを検索" />
        </div>
        
        {/* レストラン一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.length > 0 ? (
            restaurants.map((restaurant) => (
              <div key={restaurant.id} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
                <div className="relative h-48">
                  <Image
                    src={restaurant.image_url || '/images/restaurants/placeholder.jpg'}
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute top-2 right-2 bg-gray-900 text-white text-xs px-2 py-1 rounded">
                    新着
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{restaurant.name}</h3>
                  {/* 評価情報表示 */}
                  <StarRating rating={restaurant.rating || 0} />
                  <p className="text-gray-600 text-sm mt-2">{restaurant.description || 'No description available'}</p>
                  
                  <div className="flex justify-between items-center mt-4">
                    <Link 
                      href={`/restaurants/${restaurant.id}/map`}
                      className="text-gray-600 text-sm flex items-center"
                    >
                      <svg
                        className="w-4 h-4 mr-1 text-primary-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        ></path>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        ></path>
                      </svg>
                      地図で見る
                    </Link>
                    
                    <Link
                      href={`/restaurants/${restaurant.id}`}
                      className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
                    >
                      選択
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-10">
              <p className="text-gray-500">レストラン情報が見つかりませんでした。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 