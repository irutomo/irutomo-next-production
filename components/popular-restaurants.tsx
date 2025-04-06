import Image from 'next/image';
import Link from 'next/link';
import { createServerComponentClient } from '@/lib/supabase';
import { StarIcon } from 'lucide-react';
import { Restaurant } from '@/lib/types';

// レストラン情報をSupabaseから取得する関数
async function getPopularRestaurants(): Promise<Restaurant[]> {
  try {
    const supabase = await createServerComponentClient();
    
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('rating', { ascending: false })
      .limit(3);
    
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

export async function PopularRestaurants() {
  // Supabaseからレストラン情報を取得
  const restaurants = await getPopularRestaurants();
  
  return (
    <section className="px-4 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold flex items-center">
          <span className="text-xl mr-2">🔥</span>
          人気店舗
        </h2>
        <Link href="/restaurants">
          <button className="text-sm text-yellow-500 font-medium flex items-center">
            もっと見る
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </Link>
      </div>
      <div className="space-y-4">
        {restaurants.length > 0 ? (
          restaurants.map((restaurant) => (
            <div key={restaurant.id} className="overflow-hidden shadow-md rounded-lg bg-white transform hover:scale-[1.02] transition-transform duration-200">
              <div className="relative h-48">
                <Image
                  src={restaurant.image_url || '/images/restaurants/placeholder.jpg'}
                  alt={restaurant.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw"
                />
                <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full text-sm font-bold flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {restaurant.rating?.toFixed(1) || '0.0'}
                </div>
                {restaurant.rating && restaurant.rating >= 4.5 && (
                  <div className="absolute top-3 left-3 bg-yellow-500 px-3 py-1 rounded-full text-xs font-bold text-white">
                    人気店
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold">{restaurant.name}</h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {restaurant.location || '未設定'}
                  </div>
                </div>
                <div className="flex gap-2 mb-3">
                  {restaurant.cuisine && (
                    <span className="text-xs bg-teal-50 text-teal-500 px-2 py-1 rounded-full">
                      {restaurant.cuisine}
                    </span>
                  )}
                  {restaurant.category && (
                    <span className="text-xs bg-teal-50 text-teal-500 px-2 py-1 rounded-full">
                      {restaurant.category}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <Link href={`/restaurants/${restaurant.id}`}>
                    <button className="w-full bg-yellow-500 hover:bg-yellow-400 text-white py-2 px-4 rounded-lg">
                      詳細を見る
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-10 text-center bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">レストラン情報が見つかりませんでした。</p>
          </div>
        )}
      </div>
    </section>
  );
} 