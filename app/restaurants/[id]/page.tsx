import type { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Globe, Clock, MapPin, Calendar } from 'lucide-react';
import { createServerComponentClient } from '@/lib/supabase';
import { Restaurant } from '@/lib/types';
import { notFound } from 'next/navigation';
import { RestaurantTabs } from '@/components/restaurant/restaurant-tabs';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// 静的パスを生成
export async function generateStaticParams() {
  try {
    const supabase = await createServerComponentClient();
    const { data } = await supabase.from('restaurants').select('id');
    
    if (!data) return [];
    
    return data.map((restaurant) => ({
      id: restaurant.id,
    }));
  } catch (error) {
    console.error('レストランIDの取得エラー:', error);
    return [];
  }
}

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
  description?: string;
  cuisine?: string;
  price_range?: string;
  opening_hours?: string;
  phone_number?: string;
  phone?: string;
  website?: string;
  menu_items?: {
    id: string;
    name: string;
    description?: string;
    price: number;
    image?: string;
  }[];
  business_hours?: {
    day: string;
    open_time: string;
    close_time: string;
    is_closed: boolean;
  }[];
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
  const id = (await params).id;
  const restaurant = await getRestaurant(id);
  
  if (!restaurant) {
    return {
      title: '店舗が見つかりません | IRUTOMO',
    };
  }

  return {
    title: `${restaurant.name} | IRUTOMO - 日本の飲食店予約サービス`,
    description: `${restaurant.name}の詳細情報。${restaurant.cuisine || ''}のお店です。`,
  };
}

export default async function RestaurantPage({ params, searchParams }: Props) {
  const id = (await params).id;
  const restaurant = await getRestaurant(id);
  
  if (!restaurant) {
    notFound();
  }

  // 実際のレストランデータを使用
  const restaurantData = {
    name: restaurant.name,
    address: restaurant.address || '住所情報がありません',
    category: restaurant.cuisine || 'カテゴリなし',
    rating: restaurant.rating || 0,
    image: restaurant.image_url || '/images/restaurants/restaurant1_main.jpg',
    id: restaurant.id,
    description: restaurant.description || 'このレストランの説明はまだありません。',
    phone: restaurant.phone_number || restaurant.phone || '電話番号情報がありません',
    price_range: restaurant.price_range || '価格情報がありません',
    website: restaurant.website || '#',
    opening_hours: restaurant.opening_hours || '営業時間情報がありません',
    menu_items: restaurant.menu_items || [],
    business_hours: restaurant.business_hours || []
  };

  // 営業時間のフォーマット
  const formatBusinessHours = (hours: typeof restaurantData.business_hours) => {
    if (!hours || hours.length === 0) {
      return [
        { day: '月曜日', formattedHours: '情報なし' },
        { day: '火曜日', formattedHours: '情報なし' },
        { day: '水曜日', formattedHours: '情報なし' },
        { day: '木曜日', formattedHours: '情報なし' },
        { day: '金曜日', formattedHours: '情報なし' },
        { day: '土曜日', formattedHours: '情報なし' },
        { day: '日曜日', formattedHours: '情報なし' },
      ];
    }

    const days = ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日'];
    // 曜日順にソート
    const sortedHours = [...hours].sort((a, b) => 
      days.indexOf(a.day) - days.indexOf(b.day)
    );
    
    return sortedHours.map(hour => ({
      ...hour,
      formattedHours: hour.is_closed ? '定休日' : `${hour.open_time} - ${hour.close_time}`
    }));
  };

  const formattedHours = formatBusinessHours(restaurantData.business_hours);
  
  // タブで表示するデータを準備
  const tabData = {
    description: restaurantData.description,
    business_hours: formattedHours,
    menu_items: restaurantData.menu_items
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

          {/* 基本情報 */}
          <div className="mb-6">
            <div className="space-y-4">
              {/* 住所 */}
              <div className="flex items-start gap-2">
                <div className="text-gray-700 mt-1">
                  <MapPin className="w-5 h-5" />
                </div>
                <p className="text-gray-700">{restaurantData.address}</p>
              </div>

              {/* 電話番号 */}
              <div className="flex items-start gap-2">
                <div className="text-gray-700 mt-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                </div>
                <p className="text-gray-700">{restaurantData.phone}</p>
              </div>

              {/* 料金目安 */}
              <div className="flex items-start gap-2">
                <div className="text-gray-700 mt-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <p className="text-gray-700">{restaurantData.price_range}</p>
              </div>

              {/* ウェブサイト */}
              <div className="flex items-start gap-2">
                <div className="text-orange-500 mt-1">
                  <Globe className="w-5 h-5" />
                </div>
                <Link href={restaurantData.website} className="text-orange-500 hover:underline">
                  ウェブサイトを見る
                </Link>
              </div>
            </div>
          </div>

          {/* タブコンポーネント */}
          <RestaurantTabs restaurantData={tabData} />

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
  );
} 