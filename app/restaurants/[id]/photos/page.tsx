import type { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/app/lib/supabase';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

// データベースから取得したレストラン情報の型
type Restaurant = {
  id: string;
  name: string;
  image_url?: string;
  images?: string[];
};

// レストラン情報をSupabaseから取得する関数
async function getRestaurant(id: string): Promise<Restaurant | null> {
  try {
    // UUIDフォーマットのバリデーション（簡易的なチェック）
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      console.error('無効なUUID形式:', id);
      return null;
    }

    // 直接Supabaseクライアントを作成して、cookiesを使用しない
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase
      .from('restaurants')
      .select('id, name, image_url, images')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('レストラン情報の取得エラー:', error);
      return null;
    }
    
    return data as Restaurant;
  } catch (error) {
    console.error('レストラン情報の取得中にエラーが発生しました:', error);
    return null;
  }
}

// 静的パスを生成
export async function generateStaticParams() {
  try {
    // generateStaticParamsではcookies()を使用できないため、直接クライアントを作成
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
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

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const restaurant = await getRestaurant(id);
  
  if (!restaurant) {
    return {
      title: '店舗が見つかりません | IRUTOMO',
    };
  }

  return {
    title: `${restaurant.name}の写真一覧 | IRUTOMO - 日本の飲食店予約サービス`,
    description: `${restaurant.name}の写真一覧。料理や内装の雰囲気をご覧いただけます。`,
  };
}

export default async function RestaurantPhotosPage({ params }: Props) {
  const { id } = await params;
  const restaurant = await getRestaurant(id);
  
  if (!restaurant) {
    notFound();
  }

  // 画像が存在しない場合はデフォルトの画像を表示
  const photos = [];
  
  // images配列が存在し、配列であることを確認
  if (restaurant.images && Array.isArray(restaurant.images) && restaurant.images.length > 0) {
    photos.push(...restaurant.images);
  } 
  // image_urlが存在する場合は追加
  else if (restaurant.image_url) {
    photos.push(restaurant.image_url);
  } 
  // どちらも存在しない場合はデフォルト画像
  else {
    photos.push('/images/restaurants/placeholder.jpg');
  }

  const photoDescriptions = [
    '店舗外観', '店内', '個室', 'カウンター席', '料理', '雰囲気'
  ];

  return (
    <div className="py-8">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <Link 
            href={`/restaurants/${id}`}
            className="text-primary-500 hover:text-primary-700 flex items-center"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              ></path>
            </svg>
            店舗詳細に戻る
          </Link>
        </div>
        
        <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 p-6 mb-8">
          <h1 className="text-2xl font-bold mb-2">{restaurant.name}の写真</h1>
          <p className="text-gray-600">全{photos.length}枚の写真があります</p>
        </div>
        
        {/* 写真グリッド */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="aspect-w-16 aspect-h-9 relative h-64">
                <Image
                  src={photo}
                  alt={`${restaurant.name}の写真 ${index + 1}`}
                  fill
                  style={{ objectFit: 'cover' }}
                  quality={80}
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
                />
              </div>
              <div className="p-4">
                <p className="text-gray-600">
                  {index < photoDescriptions.length 
                    ? photoDescriptions[index]
                    : `写真 ${index + 1}`}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 予約ボタン */}
        <div className="mt-12 text-center">
          <Link
            href={`/reservation?restaurant=${id}`}
            className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-md transition-colors inline-block font-medium"
          >
            この店舗を予約する
          </Link>
        </div>
      </div>
    </div>
  );
}