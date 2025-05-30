import type { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { Restaurant } from '@/lib/types';
import { notFound } from 'next/navigation';
import { RestaurantImageSlider } from '../../../components/restaurant/restaurant-image-slider';
import { ReservationForm } from '../../../components/restaurant/reservation-form';
import { Database } from '@/lib/database.types';
import { ArrowLeft } from 'lucide-react';
import { cookies } from 'next/headers';

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

// 型定義を修正
type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// サーバーコンポーネント用のSupabaseクライアント
async function createServerComponentClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('環境変数が設定されていません: NEXT_PUBLIC_SUPABASE_URL または NEXT_PUBLIC_SUPABASE_ANON_KEY');
    // エラーをスローするのではなく、デフォルト値を使用
    return createClient<Database>(
      'https://pnqmgubylhwfchgrbylb.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBucW1ndWJ5bGh3ZmNoZ3JieWxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTE0MTE2MzQsImV4cCI6MjAyNjk4NzYzNH0.Qw_iHMRHVbEwdKE0TuDiEe3bXJAjFFmzjDucgBP8JZw',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }

  // Supabaseクライアントを作成
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

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
  korean_name?: string;
  korean_description?: string;
  korean_address?: string;
  korean_cuisine?: string;
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
async function getRestaurant(id: string, language: string = 'ko'): Promise<DatabaseRestaurant | null> {
  try {
    // UUIDフォーマットのバリデーション（簡易的なチェック）
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      console.error('無効なUUID形式:', id);
      return getFallbackRestaurant(id, language);
    }

    try {
      const supabase = await createServerComponentClient();
      
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('レストラン情報の取得エラー:', error);
        return getFallbackRestaurant(id, language);
      }
      
      if (!data) {
        console.warn('レストランデータが見つかりません:', id);
        return getFallbackRestaurant(id, language);
      }
      
      // 言語に応じた情報を返す
      return {
        ...data,
        name: language === 'ko' ? data.korean_name || data.name : data.name,
        description: language === 'ko' ? data.korean_description || data.description : data.description,
        address: language === 'ko' ? data.korean_address || data.address : data.address,
        cuisine: data.cuisine,
      } as DatabaseRestaurant;
    } catch (dbError) {
      console.error('データベース接続エラー:', dbError);
      return getFallbackRestaurant(id, language);
    }
  } catch (error) {
    console.error('レストラン情報の取得中にエラーが発生しました:', error);
    return getFallbackRestaurant(id, language);
  }
}

// フォールバック用のダミーレストランデータを返す関数
function getFallbackRestaurant(id: string, language: string = 'ko'): DatabaseRestaurant {
  // このレストランIDに基づいて異なるダミーデータを返す
  const fallbackRestaurants: DatabaseRestaurant[] = [
    {
      id: id || 'dummy-1',
      name: '鉄鍋餃子 餃子の山崎',
      korean_name: '철판 만두 만두의 야마자키',
      cuisine: '居酒屋',
      location: '大阪北区',
      rating: 4.4,
      price_range: '¥¥',
      image_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=400',
      address: '大阪府大阪市北区',
      description: '鉄鍋で焼き上げる絶品餃子とビールが楽しめる居酒屋です。',
      phone_number: '06-1234-5678',
      google_maps_link: 'https://maps.google.com',
      is_active: true,
      business_hours: [
        { day: '月', open_time: '17:00', close_time: '23:00', is_closed: false },
        { day: '火', open_time: '17:00', close_time: '23:00', is_closed: false },
        { day: '水', open_time: '17:00', close_time: '23:00', is_closed: false },
        { day: '木', open_time: '17:00', close_time: '23:00', is_closed: false },
        { day: '金', open_time: '17:00', close_time: '23:00', is_closed: false },
        { day: '土', open_time: '16:00', close_time: '23:00', is_closed: false },
        { day: '日', open_time: '16:00', close_time: '22:00', is_closed: false }
      ]
    },
    {
      id: id || 'dummy-2',
      name: 'おでん酒場 湯あみ',
      korean_name: '오뎅 술집 유아미',
      cuisine: '居酒屋',
      location: '大阪北区',
      rating: 4.2,
      price_range: '¥¥',
      image_url: 'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?auto=format&fit=crop&w=400',
      address: '大阪府大阪市北区',
      description: '季節の具材を使った本格おでんとお酒が楽しめる隠れ家的な居酒屋です。',
      phone_number: '06-2345-6789',
      google_maps_link: 'https://maps.google.com',
      is_active: true,
      business_hours: [
        { day: '月', open_time: '17:00', close_time: '23:00', is_closed: true },
        { day: '火', open_time: '17:00', close_time: '23:00', is_closed: false },
        { day: '水', open_time: '17:00', close_time: '23:00', is_closed: false },
        { day: '木', open_time: '17:00', close_time: '23:00', is_closed: false },
        { day: '金', open_time: '17:00', close_time: '23:00', is_closed: false },
        { day: '土', open_time: '16:00', close_time: '23:00', is_closed: false },
        { day: '日', open_time: '16:00', close_time: '22:00', is_closed: false }
      ]
    },
    {
      id: id || 'dummy-3',
      name: '炭火焼鳥 コクレ',
      korean_name: '숯불구이 코쿠레',
      cuisine: '居酒屋',
      location: '大阪福島',
      rating: 4.4,
      price_range: '¥¥',
      image_url: 'https://images.unsplash.com/photo-1591684080176-bb2b73f9ec68?auto=format&fit=crop&w=400',
      address: '大阪府大阪市福島区',
      description: '備長炭で丁寧に焼き上げる絶品焼き鳥と季節の日本酒が楽しめるお店です。',
      phone_number: '06-3456-7890',
      google_maps_link: 'https://maps.google.com',
      is_active: true,
      business_hours: [
        { day: '月', open_time: '17:00', close_time: '23:00', is_closed: true },
        { day: '火', open_time: '17:00', close_time: '23:00', is_closed: false },
        { day: '水', open_time: '17:00', close_time: '23:00', is_closed: false },
        { day: '木', open_time: '17:00', close_time: '23:00', is_closed: false },
        { day: '金', open_time: '17:00', close_time: '23:00', is_closed: false },
        { day: '土', open_time: '16:00', close_time: '23:00', is_closed: false },
        { day: '日', open_time: '16:00', close_time: '22:00', is_closed: false }
      ]
    }
  ];
  
  // ハッシュ関数: idを数値化して3つのダミーデータからランダムに選択する
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % fallbackRestaurants.length;
  
  return {
    ...fallbackRestaurants[index],
    id // 元のIDを保持
  };
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  // paramsをawaitする
  const { id } = await params;
  // クッキーから言語設定を取得
  const cookieStore = await cookies();
  const language = cookieStore.get('language')?.value || 'ko';
  
  const restaurant = await getRestaurant(id, language);
  
  if (!restaurant) {
    return {
      title: '식당을 찾을 수 없습니다 | 이루토모',
      description: '요청하신 레스토랑 정보를 찾을 수 없습니다. 다른 맛집을 탐색해보세요.',
    };
  }

  const name = restaurant.korean_name || restaurant.name;
  const cuisine = restaurant.korean_cuisine || restaurant.cuisine || '';
  const location = restaurant.location || '';
  const description = restaurant.korean_description || restaurant.description || '';
  const address = restaurant.korean_address || restaurant.address || '';
  const rating = restaurant.rating ? `평점 ${restaurant.rating}점` : '';
  const price = restaurant.price_range || '';

  // 詳細なメタディスクリプションを作成
  const metaDescription = `${name}는 ${location}에 위치한 ${cuisine} 레스토랑입니다. ${description} ${rating && `${rating}의 평가를 받고 있으며`} ${price && `가격대는 ${price}입니다.`} 이루토모를 통해 쉽게 예약하고 일본 현지 맛집을 경험하세요.`;
  
  // レストラン名と住所を含めたキーワード
  const keywords = [
    name, 
    cuisine, 
    `${location} 맛집`, 
    '일본 레스토랑', 
    '일본 맛집', 
    '일본 현지인 추천', 
    '일본 식당 예약'
  ].filter(Boolean);

  return {
    title: `${name} | 이루토모 - 한국인을 위한 일본 식당 예약 서비스`,
    description: metaDescription,
    keywords: keywords
  };
}

export default async function RestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  // paramsをawaitする
  const { id } = await params;
  // クッキーから言語設定を取得
  const cookieStore = await cookies();
  const language = cookieStore.get('language')?.value || 'ko';

  // レストラン情報を取得
  const restaurant = await getRestaurant(id, language);
  if (!restaurant) {
    notFound();
  }

  // 画像の配列を準備
  const restaurantImages = (() => {
    // デバッグログ
    console.log('レストラン画像処理開始:', id);
    console.log('images データ型:', typeof restaurant.images);
    
    // 画像データが文字列形式の場合はJSON解析を試みる
    if (restaurant.images) {
      if (typeof restaurant.images === 'string') {
        try {
          console.log('文字列からのパース試行:', restaurant.images.substring(0, 100));
          // JSON形式かどうかを確認
          if (restaurant.images.trim().startsWith('[') && restaurant.images.trim().endsWith(']')) {
            const parsed = JSON.parse(restaurant.images);
            // 有効なURLのみをフィルタリング
            if (Array.isArray(parsed)) {
              const filteredImages = parsed.filter(img => !!img);
              console.log('パース成功、画像数:', filteredImages.length);
              return filteredImages;
            }
            console.log('パース結果が配列ではありません:', typeof parsed);
            return [];
          } else {
            // JSON形式でない場合は単一の画像URLとして処理
            console.log('JSON形式ではないため単一URLとして処理:', restaurant.images);
            return [restaurant.images];
          }
        } catch (e) {
          console.error('レストラン画像の解析エラー:', e, typeof restaurant.images);
          // 文字列がJSONではない場合は、単一の画像URLとして扱う
          if (typeof restaurant.images === 'string' && restaurant.images.trim() !== '') {
            return [restaurant.images];
          }
          return [];
        }
      } else if (Array.isArray(restaurant.images)) {
        // 既に配列形式の場合
        const filteredImages = restaurant.images.filter(img => !!img);
        console.log('既に配列形式、画像数:', filteredImages.length);
        return filteredImages;
      } else if (restaurant.images && typeof restaurant.images === 'object') {
        // オブジェクトの場合（Supabaseの内部表現）
        try {
          // オブジェクトを文字列化して再パース
          const stringified = JSON.stringify(restaurant.images);
          console.log('オブジェクトを文字列化:', stringified.substring(0, 100));
          
          // JSON形式かどうかを確認
          if (stringified.trim().startsWith('[') && stringified.trim().endsWith(']')) {
            const parsed = JSON.parse(stringified);
            if (Array.isArray(parsed)) {
              const filteredImages = parsed.filter(img => !!img);
              console.log('オブジェクトからパース成功、画像数:', filteredImages.length);
              return filteredImages;
            }
          }
          console.error('オブジェクトのパース結果が配列ではありません');
          return [];
        } catch (e) {
          console.error('レストラン画像オブジェクトの処理エラー:', e);
          return [];
        }
      }
    }
    
    // 画像配列がない場合はメイン画像を使用
    console.log('imagesなし、image_urlを使用:', restaurant.image_url);
    return restaurant.image_url ? [restaurant.image_url] : ['/images/restaurants/placeholder.jpg'];
  })();

  // デバッグ用にイメージデータ型を出力
  console.log('restaurantImages type:', typeof restaurantImages, Array.isArray(restaurantImages));
  console.log('restaurant.images type:', typeof restaurant.images, restaurant.images ? 'データあり' : 'データなし');

  // 実際のレストランデータを使用
  const restaurantData = {
    id: restaurant.id,
    name: language === 'ko' ? restaurant.korean_name || restaurant.name : restaurant.name,
    address: language === 'ko' 
      ? restaurant.korean_address || restaurant.address || '주소 정보가 없습니다' 
      : restaurant.address || '住所情報がありません',
    category: restaurant.cuisine || (language === 'ko' ? '카테고리 없음' : 'カテゴリなし'),
    tags: restaurant.cuisine ? [restaurant.cuisine] : [],
    rating: restaurant.rating || 0,
    image: restaurant.image_url || '/images/restaurants/placeholder.jpg',
    images: restaurantImages.length > 0 ? restaurantImages : ['/images/restaurants/placeholder.jpg'],
    description: language === 'ko'
      ? restaurant.korean_description || restaurant.description || '이 레스토랑의 상세 정보가 아직 없습니다'
      : restaurant.description || 'このレストランの詳細情報はまだありません',
    phone: restaurant.phone_number || restaurant.phone || (language === 'ko' ? '전화번호 정보가 없습니다' : '電話番号情報がありません'),
    price_range: restaurant.price_range || (language === 'ko' ? '가격 정보가 없습니다' : '価格情報がありません'),
    website: restaurant.website || '#',
    google_maps_link: restaurant.google_maps_link || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name)}`,
    opening_hours: restaurant.opening_hours || (language === 'ko' ? '영업시간 정보가 없습니다' : '営業時間情報がありません'),
    business_hours: restaurant.business_hours || []
  };

  // 価格タグを追加
  if (restaurant.price_range) {
    restaurantData.tags.push(restaurant.price_range);
  }

  // 人気タグを追加 (評価が4.5以上)
  if (restaurant.rating && restaurant.rating >= 4.5) {
    restaurantData.tags.push(language === 'ko' ? '인기' : '人気');
  }

  return (
    <main className="bg-[#F8F8F8] min-h-screen pb-20">
      {/* ヘッダー */}
      <header className="bg-white sticky top-0 z-50 shadow-custom w-full">
        <div className="container-responsive flex items-center p-4">
          <Link href="/restaurants" className="mr-4">
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </Link>
          <h1 className="text-xl font-bold text-[#FFA500]">
            {language === 'ko' ? '맛집 상세정보' : 'レストラン詳細'}
          </h1>
        </div>
      </header>

      <div className="container-responsive py-6 space-y-6">
        {/* レストラン写真スライダー */}
        <RestaurantImageSlider images={restaurantData.images} alt={restaurantData.name} />

        {/* レストラン情報 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h1 className="text-xl font-bold mb-2 text-gray-900">
            {restaurantData.name}
          </h1>
          
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
          
          <div className="border-t border-gray-100 pt-3 mt-3">
            <h2 className="font-bold mb-2 text-[#FFA500] flex items-center">
              <span className="mr-1">👀</span>
              {language === 'ko' ? '맛집 POINT' : '食堂POINT'}
            </h2>
            <p className="text-sm text-gray-700 mb-3 bg-gray-50 p-2 rounded">
              {restaurantData.description}
            </p>
          </div>
          
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
        <div className="bg-white rounded-lg shadow-sm p-4">
          <ReservationForm 
            restaurantId={restaurantData.id}
            restaurantName={restaurantData.name}
            restaurantImage={restaurantData.image}
            businessHours={restaurantData.business_hours}
          />
        </div>
      </div>
    </main>
  );
} 