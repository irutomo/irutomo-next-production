import type { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { createServerComponentClient } from '@/lib/supabase';
import { Restaurant } from '@/lib/types';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ id: string }>;
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
async function getRestaurant(id: string): Promise<Restaurant | null> {
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
    
    return data;
  } catch (error) {
    console.error('レストラン情報の取得中にエラーが発生しました:', error);
    return null;
  }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const paramsData = await params;
  const restaurant = await getRestaurant(paramsData.id);
  
  if (!restaurant) {
    return {
      title: '店舗が見つかりません | IRUTOMO',
    };
  }

  return {
    title: `${restaurant.name} | IRUTOMO - 日本の飲食店予約サービス`,
    description: `${restaurant.name}の詳細情報。${restaurant.category}のお店です。`,
  };
}

export default async function RestaurantPage({ params }: Props) {
  const paramsData = await params;
  const restaurant = await getRestaurant(paramsData.id);
  
  if (!restaurant) {
    notFound();
  }

  // レストランの情報から評価値を取得（データベースに評価がない場合は仮の値）
  const rating = 4.5;

  return (
    <div className="py-8">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <Link 
            href="/restaurants" 
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
            店舗一覧に戻る
          </Link>
        </div>
        
        {/* ヘッダー部分 */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 mb-8">
          <div className="relative h-80 md:h-96">
            <Image
              src={restaurant.images?.[0] || '/images/restaurants/placeholder.jpg'}
              alt={restaurant.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 1200px"
              priority
            />
          </div>
          
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{restaurant.name}</h1>
                <div className="flex items-center mb-4">
                  <StarRating rating={rating} />
                  <span className="ml-4 text-sm bg-gray-100 px-2 py-1 rounded">{restaurant.category}</span>
                </div>
                <p className="text-gray-600">{restaurant.description || 'No description available'}</p>
              </div>
              
              <Link
                href={`/reservation?restaurant=${paramsData.id}`}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-md transition-colors"
              >
                予約する
              </Link>
            </div>
          </div>
        </div>
        
        {/* 詳細情報 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="col-span-2">
            <h2 className="text-xl font-bold mb-6">店舗情報</h2>
            
            <table className="w-full border-collapse">
              <tbody>
                <tr className="border-b">
                  <th className="py-3 text-left text-gray-600 w-1/4">住所</th>
                  <td className="py-3">{restaurant.address}</td>
                </tr>
                <tr className="border-b">
                  <th className="py-3 text-left text-gray-600">電話番号</th>
                  <td className="py-3">{restaurant.phone}</td>
                </tr>
                <tr className="border-b">
                  <th className="py-3 text-left text-gray-600">営業時間</th>
                  <td className="py-3">{restaurant.opening_hours}</td>
                </tr>
                <tr className="border-b">
                  <th className="py-3 text-left text-gray-600">定休日</th>
                  <td className="py-3">情報なし</td>
                </tr>
                <tr className="border-b">
                  <th className="py-3 text-left text-gray-600">料金目安</th>
                  <td className="py-3">{restaurant.price_range}</td>
                </tr>
              </tbody>
            </table>
            
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4">アクセス</h3>
              <p className="text-gray-600">{restaurant.address}</p>
              
              <div className="mt-4">
                <Link 
                  href={`/restaurants/${paramsData.id}/map`}
                  className="text-primary-500 hover:text-primary-700 flex items-center inline-block"
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
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-bold mb-6">写真</h2>
            <div className="grid grid-cols-2 gap-3">
              {restaurant.images && restaurant.images.slice(0, 4).map((image, index) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={image}
                    alt={`${restaurant.name}の写真${index + 1}`}
                    fill
                    className="object-cover rounded-md"
                    sizes="(max-width: 768px) 50vw, 200px"
                  />
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-center">
              <Link 
                href={`/restaurants/${paramsData.id}/photos`}
                className="text-primary-500 hover:text-primary-700"
              >
                すべての写真を見る
              </Link>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4">レビュー</h3>
              <div className="flex items-center mb-2">
                <StarRating rating={rating} />
                <span className="ml-2 text-gray-600 text-sm">レビュー 32件</span>
              </div>
              
              <Link 
                href={`/restaurants/${paramsData.id}/reviews`}
                className="text-primary-500 hover:text-primary-700 block"
              >
                レビューを見る
              </Link>
              
              <Link 
                href={`/write-review?restaurant=${paramsData.id}`}
                className="mt-2 text-primary-500 hover:text-primary-700 block"
              >
                レビューを書く
              </Link>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-8">
          <Link
            href={`/reservation?restaurant=${paramsData.id}`}
            className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-md text-lg transition-colors"
          >
            予約する
          </Link>
        </div>
      </div>
    </div>
  );
} 