import type { Metadata, ResolvingMetadata } from 'next';
import Link from 'next/link';

type Props = {
  params: Promise<{ id: string }>;
};

// 擬似的なデータベース
const restaurants = [
  {
    id: '1',
    name: '熟成肉と本格炭火焼肉 又三郎',
    address: '大阪府大阪市中央区南本町2-6-12',
    coordinates: { lat: 34.682, lng: 135.503 },
  },
  {
    id: '2',
    name: 'まほろば囲炉裏 心斎橋',
    address: '大阪府大阪市中央区心斎橋筋1-10-11',
    coordinates: { lat: 34.673, lng: 135.501 },
  },
  {
    id: '3',
    name: '焼鳥YAMATO',
    address: '大阪府大阪市北区梅田2-2-2',
    coordinates: { lat: 34.702, lng: 135.498 },
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
    title: `${restaurant.name}の地図 | IRUTOMO - 日本の飲食店予約サービス`,
    description: `${restaurant.name}の場所を地図で確認できます。住所: ${restaurant.address}`,
  };
}

export default async function RestaurantMapPage({ params }: Props) {
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
        
        <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 mb-8">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-2">{restaurant.name}の地図</h1>
            <p className="text-gray-600 mb-4">{restaurant.address}</p>
          </div>
        </div>
        
        {/* 地図表示エリア */}
        <div className="relative h-[70vh] bg-gray-200 rounded-lg overflow-hidden">
          {/* 実際の地図は実装時にGoogle Maps APIなどで表示 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400 mb-4"
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
            <p className="text-gray-500 text-lg">Google Maps表示予定</p>
            <p className="text-gray-400 mt-2">
              緯度: {restaurant.coordinates.lat}, 経度: {restaurant.coordinates.lng}
            </p>
          </div>
        </div>
        
        <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">アクセス</h2>
            <p className="mt-2 text-gray-600">
              {/* ダミーデータ */}
              大阪メトロ御堂筋線 本町駅 2番出口から徒歩5分<br />
              大阪メトロ四つ橋線 本町駅 9番出口から徒歩3分
            </p>
          </div>
          
          <div className="flex gap-4">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Google Mapsで開く
            </a>
            
            <Link
              href={`/reservation?restaurant=${paramsData.id}`}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              予約する
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 