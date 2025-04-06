import type { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { createServerComponentClient } from '@/lib/supabase';
import { Restaurant } from '@/lib/types';
import { notFound } from 'next/navigation';
import { RestaurantImageSlider } from '../../../components/restaurant/restaurant-image-slider';
import { ReservationForm } from '../../../components/restaurant/reservation-form';

// SVGコンポーネント
const MapPinIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// 静的パスを生成
export async function generateStaticParams() {
  try {
    const supabase = await createServerComponentClient();
    const { data, error } = await supabase.from('restaurants').select('id');
    
    if (error) {
      console.error('レストランIDの取得エラー:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.warn('レストランデータが見つかりません');
      return [];
    }
    
    return data.map((restaurant: { id: string }) => ({
      id: restaurant.id,
    }));
  } catch (error) {
    console.error('レストランIDの取得エラー:', error);
    return [];
  }
}

// データベースから取得したレストラン情報の型
type DatabaseRestaurant = Partial<Restaurant> & {
  id: string;
  name: string;
  image_url?: string;
  images?: string[];
  description?: string;
  cuisine?: string;
  price_range?: string;
  opening_hours?: string;
  phone_number?: string;
  phone?: string;
  website?: string;
  google_maps_link?: string;
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
    // UUIDフォーマットのバリデーション（簡易的なチェック）
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      console.error('無効なUUID形式:', id);
      return null;
    }

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

  // イメージURLの処理
  let restaurantImages: string[] = [];
  
  // restaurant.imagesが配列の場合
  if (Array.isArray(restaurant.images) && restaurant.images.length > 0) {
    restaurantImages = restaurant.images;
  } 
  // restaurant.image_urlが有効な場合
  else if (restaurant.image_url) {
    restaurantImages = [restaurant.image_url];
  } 
  // デフォルト画像を使用
  else {
    restaurantImages = ['/images/restaurants/placeholder.jpg'];
  }

  // 実際のレストランデータを使用
  const restaurantData = {
    id: restaurant.id,
    name: restaurant.name,
    address: restaurant.address || '住所情報がありません',
    category: restaurant.cuisine || 'カテゴリなし',
    tags: restaurant.cuisine ? [restaurant.cuisine] : [],
    rating: restaurant.rating || 0,
    image: restaurant.image_url || '/images/restaurants/placeholder.jpg',
    images: restaurantImages,
    description: restaurant.description || 'このレストランの詳細情報はまだありません。',
    phone: restaurant.phone_number || restaurant.phone || '電話番号情報がありません',
    price_range: restaurant.price_range || '価格情報がありません',
    website: restaurant.website || '#',
    google_maps_link: restaurant.google_maps_link || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name)}`,
    opening_hours: restaurant.opening_hours || '営業時間情報がありません',
    business_hours: restaurant.business_hours || []
  };

  // 価格タグを追加
  if (restaurant.price_range) {
    restaurantData.tags.push(restaurant.price_range);
  }

  // 人気タグを追加 (評価が4.5以上)
  if (restaurant.rating && restaurant.rating >= 4.5) {
    restaurantData.tags.push('人気');
  }

  return (
    <main>
      <div className="max-w-md mx-auto">
        {/* ヘッダー */}
        <header className="sticky top-0 z-10 bg-white shadow-sm px-4 py-3 flex items-center mb-4">
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
        </header>
        
        {/* 戻るボタン */}
        <Link href="/restaurants" className="flex items-center ml-4 text-gray-600 hover:text-[#00CBB3] transition-colors mb-4">
          <svg className="mr-1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          食堂一覧に戻る
        </Link>

        {/* レストラン写真スライダー */}
        <div className="mx-4">
          <RestaurantImageSlider images={restaurantData.images} alt={restaurantData.name} />
        </div>

        {/* レストラン情報 */}
        <div className="bg-white rounded-lg shadow-sm mx-4 mt-4 p-4">
          <h1 className="text-xl font-bold mb-2">{restaurantData.name}</h1>
          
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <MapPinIcon className="w-4 h-4 mr-1" />
            {restaurantData.address}
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {restaurantData.tags.map((tag, index) => (
              <span key={index} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
          
          <h2 className="font-bold mb-2">食堂POINT👀</h2>
          <p className="text-sm text-gray-700 mb-3">
            {restaurantData.description}
          </p>
          
          <a 
            href={restaurantData.google_maps_link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-[#00CBB3] text-sm hover:underline flex items-center"
          >
            Google Maps
          </a>
        </div>

        {/* 予約フォーム */}
        <div className="bg-white rounded-lg shadow-sm mx-4 mt-4 mb-12 p-4">
          <h2 className="text-lg font-bold mb-4">予約</h2>
          <ReservationForm restaurantId={restaurantData.id} />
        </div>
      </div>
    </main>
  );
} 