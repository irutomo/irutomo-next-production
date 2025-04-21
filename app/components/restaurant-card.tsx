import Image from 'next/image';
import Link from 'next/link';
import { Restaurant } from '@/lib/types';
import { useLanguage } from '@/contexts/language-context';

// SVGコンポーネント
const StarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const MapPinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

interface RestaurantCardProps {
  restaurant: Restaurant;
  translations: {
    popular: string;
    reserve: string;
    map: string;
  };
}

export default function RestaurantCard({ restaurant, translations }: RestaurantCardProps) {
  const { language } = useLanguage();

  return (
    <div className="bg-white rounded-md overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-200 border border-gray-100 flex flex-col h-full">
      <Link href={`/restaurants/${restaurant.id}`} className="block">
        <div className="relative h-48 w-full">
          <Image
            src={Array.isArray(restaurant.images) && restaurant.images.length > 0 ? String(restaurant.images[0]) : restaurant.image_url || '/images/restaurants/placeholder.jpg'}
            alt={language === 'ko' ? restaurant.korean_name || restaurant.name : restaurant.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={(e) => console.error('Image load error:', restaurant.name, Array.isArray(restaurant.images) ? restaurant.images[0] : null)}
          />
          {/* 評価バッジ */}
          <div className="absolute top-2 right-2 bg-white/90 px-2 py-0.5 rounded-full text-sm font-bold flex items-center">
            <StarIcon className="w-4 h-4 mr-1 text-yellow-500 fill-yellow-500" />
            <span className="text-gray-900">{(restaurant.rating || 0).toFixed(1)}</span>
          </div>
          
          {/* 人気バッジ (評価が4.5以上の場合) */}
          {restaurant.rating && restaurant.rating >= 4.5 && (
            <div className="absolute top-2 left-2 bg-[#FFA500] px-2 py-0.5 rounded-full text-xs text-white font-bold">
              {translations.popular}
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-lg mb-1 text-gray-900">
            {language === 'ko' ? restaurant.korean_name || restaurant.name : restaurant.name}
          </h3>
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <MapPinIcon className="w-4 h-4 mr-1" />
            <span className="truncate">
              {language === 'ko' 
                ? restaurant.korean_address || restaurant.location || restaurant.address?.split(',')[0] || '미설정'
                : restaurant.location || restaurant.address?.split(',')[0] || '未設定'
              }
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {restaurant.cuisine && (
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                {language === 'ko' ? restaurant.korean_cuisine || restaurant.cuisine : restaurant.cuisine}
              </span>
            )}
            {restaurant.price_range && (
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                {restaurant.price_range}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 mt-3">
          <Link 
            href={`/restaurants/${restaurant.id}`}
            className="flex-grow px-4 py-2 bg-[#FFA500] text-white rounded-md font-medium hover:bg-[#FFA500]/90 transition-colors text-center"
          >
            {translations.reserve}
          </Link>
          {restaurant.google_maps_link && (
            <Link
              href={restaurant.google_maps_link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors"
            >
              {translations.map}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
} 