import type { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

type Props = {
  params: Promise<{ id: string }>;
};

// 擬似的なデータベース
const restaurants = [
  {
    id: '1',
    name: '熟成肉と本格炭火焼肉 又三郎',
    photos: [
      '/images/restaurants/restaurant1-1.jpg',
      '/images/restaurants/restaurant1-2.jpg',
      '/images/restaurants/restaurant1-3.jpg',
      '/images/restaurants/restaurant1-4.jpg',
      '/images/reviews/meat.jpg',
      '/images/landing-page-image1.jpg',
    ],
  },
  {
    id: '2',
    name: 'まほろば囲炉裏 心斎橋',
    photos: [
      '/images/restaurants/restaurant2-1.jpg',
      '/images/restaurants/restaurant2-2.jpg',
      '/images/reviews/oden.jpg',
      '/images/landing-page-image2.jpg',
    ],
  },
  {
    id: '3',
    name: '焼鳥YAMATO',
    photos: [
      '/images/restaurants/restaurant3-1.jpg',
      '/images/reviews/yakitori.jpg',
      '/images/landing-page-image3.jpg',
    ],
  },
];

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const paramsData = await params;
  const restaurant = restaurants.find(r => r.id === paramsData.id);
  
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
  const paramsData = await params;
  const restaurant = restaurants.find(r => r.id === paramsData.id);
  
  if (!restaurant) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold">店舗が見つかりません</h1>
        <p className="mt-4">指定された店舗は存在しないか、削除された可能性があります。</p>
        <Link 
          href="/restaurants" 
          className="mt-8 inline-block bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-md transition-colors"
        >
          店舗一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <Link 
            href={`/restaurants/${paramsData.id}`}
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
          <p className="text-gray-600">全{restaurant.photos.length}枚の写真があります</p>
        </div>
        
        {/* 写真グリッド */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {restaurant.photos.map((photo, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="aspect-w-16 aspect-h-9 relative h-64">
                {/* 実際の実装ではここに実際の画像のパスが入ります */}
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-500">画像 {index + 1}</p>
                    <p className="text-gray-400 text-sm mt-1">{photo}</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <p className="text-gray-600">
                  {index === 0 ? '店舗外観' : 
                   index === 1 ? '店内' : 
                   index === 2 ? '個室' : 
                   index === 3 ? 'カウンター席' : 
                   index === 4 ? '料理' : '雰囲気'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 予約ボタン */}
        <div className="mt-12 text-center">
          <Link
            href={`/reservation?restaurant=${paramsData.id}`}
            className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-md transition-colors inline-block font-medium"
          >
            この店舗を予約する
          </Link>
        </div>
      </div>
    </div>
  );
}