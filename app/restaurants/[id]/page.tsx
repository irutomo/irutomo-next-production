import type { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Globe } from 'lucide-react';
import { createServerComponentClient } from '@/lib/supabase';
import { Restaurant } from '@/lib/types';
import { notFound } from 'next/navigation';

type Props = {
  params: { id: string };
};

// 星評価を表示するコンポーネント
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center">
      <div className="text-yellow-400 mr-1">
        <span>★</span>
      </div>
      <span className="font-bold">{rating.toFixed(1)}</span>
    </div>
  );
}

// データベースから取得したレストラン情報の型
type DatabaseRestaurant = Partial<Restaurant> & {
  id: string;
  name: string;
  image_url?: string;
};

// レストラン情報をSupabaseから取得する関数
async function getRestaurant(id: string): Promise<DatabaseRestaurant | null> {
  try {
    const supabase = await createServerComponentClient();
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('レストラン情報の取得エラー:', error);
      return null;
    }
    
    return data as DatabaseRestaurant;
  } catch (error) {
    console.error('レストラン情報の取得中にエラーが発生しました:', error);
    return null;
  }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const restaurant = await getRestaurant(params.id);
  
  if (!restaurant) {
    return {
      title: '店舗が見つかりません | IRUTOMO',
    };
  }

  return {
    title: `${restaurant.name} | IRUTOMO - 日本の飲食店予約サービス`,
    description: `${restaurant.name}の詳細情報。${restaurant.category || ''}のお店です。`,
  };
}

export default async function RestaurantPage({ params }: Props) {
  const restaurant = await getRestaurant(params.id);
  
  if (!restaurant) {
    notFound();
  }

  // デモデータ（画像内の情報に合わせる）
  const restaurantData = {
    name: '熟成肉と本格炭火焼肉 又三郎',
    address: '大阪府大阪市中央区東心斎橋1丁目16-20',
    category: '焼肉',
    rating: 4.7,
    image: restaurant.image_url || '/images/restaurants/restaurant1_main.jpg',
    id: restaurant.id,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー画像 */}
      <div className="relative w-full h-72 overflow-hidden">
        <Image 
          src={restaurantData.image}
          alt={restaurantData.name}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        {/* 戻るボタン */}
        <Link 
          href="/restaurants" 
          className="absolute top-4 left-4 flex items-center justify-center w-10 h-10 bg-white bg-opacity-80 rounded-full"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>
      </div>

      {/* メインコンテンツ */}
      <div className="relative -mt-6 bg-white rounded-t-3xl px-4 py-6">
        <div className="max-w-3xl mx-auto">
          {/* 店舗情報ヘッダー */}
          <div className="mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">{restaurantData.name}</h1>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">{restaurantData.category}</span>
                  <div className="flex items-center">
                    <StarRating rating={restaurantData.rating} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 店舗詳細情報 */}
          <div className="space-y-6">
            {/* 住所 */}
            <div className="flex items-start gap-2">
              <div className="text-gray-700 mt-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              <p className="text-gray-700">{restaurantData.address}</p>
            </div>

            {/* ウェブサイト */}
            <div className="flex items-start gap-2">
              <div className="text-orange-500 mt-1">
                <Globe className="w-5 h-5" />
              </div>
              <Link href="#" className="text-orange-500 hover:underline">
                ウェブサイトを見る
              </Link>
            </div>

            {/* 予約ボタン */}
            <Link 
              href={`/reservation?restaurant=${restaurantData.id}`}
              className="block w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-lg font-bold text-lg mt-6 transition-colors text-center"
            >
              予約する
            </Link>

            {/* 予約情報 */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h2 className="font-bold text-lg mb-4">予約案内</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-gray-500">•</span>
                  <span>予約確定後のキャンセルはできません</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-500">•</span>
                  <span>予約時間の10分前までにお越しください</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-500">•</span>
                  <span>特別なご要望は予約時にご記入ください</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 