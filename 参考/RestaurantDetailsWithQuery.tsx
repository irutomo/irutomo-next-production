import React from 'react';
import { ArrowLeft, Star, MapPin, ExternalLink, Clock, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useRestaurantQuery } from '@/hooks/useRestaurantQuery';

interface RestaurantDetailsProps {
  restaurantId: string;
  language: 'ko' | 'ja' | 'en';
  onBack: () => void;
  onReserve: (restaurantId: string) => void;
}

/**
 * React Queryを使用したレストラン詳細コンポーネント
 * データ取得ロジックとUI表示の完全な分離を実現
 */
export default function RestaurantDetailsWithQuery({ restaurantId, language, onBack, onReserve }: RestaurantDetailsProps) {
  const { t } = useTranslation();
  const { 
    data: restaurant, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useRestaurantQuery(restaurantId);

  const processImageUrl = (url: string | null) => {
    if (!url) return 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c';
    
    // 既にHTTPで始まるURLはそのまま返す（ただしCoreサーバーのURLはHTTPSに変換）
    if (url.startsWith('http')) {
      // CoreSVCのURLの場合はHTTPSに変換
      if (url.includes('core.coresv.com')) {
        return url.replace('http://', 'https://');
      }
      return url;
    }
    
    // restaurant_[UUID]_[位置].jpgパターンのローカルファイル名の場合
    if (url.match(/^restaurant_[0-9a-f-]+_(main|[0-9]+)\.jpg$/i)) {
      return `/images/restaurants/${url}`;
    }
    
    // Supabase Storage URLの場合
    if (url.includes('storage/') || url.includes('storage-pyoyziehtekhpergqztm')) {
      const cleanPath = url.replace(/^storage\//, '');
      return `https://pyoyziehtekhpergqztm.supabase.co/storage/v1/object/public/${cleanPath}`;
    }
    
    // その他の相対パスで始まるURLの場合
    if (url.startsWith('/')) {
      // すでに/images/restaurants/で始まる場合はそのまま返す
      if (url.startsWith('/images/restaurants/')) {
        return url;
      }
      return `https://pyoyziehtekhpergqztm.supabase.co/storage/v1/object/public${url}`;
    }
    
    // フォールバック：どのパターンにも一致しない場合はデフォルト画像を返す
    return 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c';
  };

  // 料理ジャンルの翻訳
  const translateCuisine = (cuisine: string, lang: 'ko' | 'ja' | 'en') => {
    // 韓国語翻訳マップ
    const koTranslations: Record<string, string> = {
      '焼肉': '소고기 구이',
      '寿司': '스시',
      'ラーメン': '라멘',
      '居酒屋': '이자카야',
      'カフェ': '카페',
      'イタリアン': '이탈리안',
      'フレンチ': '프렌치',
      '中華料理': '중국 요리',
      '韓国料理': '한식',
      'バー': '바',
      'ファミリーレストラン': '패밀리 레스토랑',
      '和食': '일식'
    };

    // 英語翻訳マップ
    const enTranslations: Record<string, string> = {
      '焼肉': 'Korean BBQ',
      '寿司': 'Sushi',
      'ラーメン': 'Ramen',
      '居酒屋': 'Izakaya',
      'カフェ': 'Cafe',
      'イタリアン': 'Italian',
      'フレンチ': 'French',
      '中華料理': 'Chinese',
      '韓国料理': 'Korean',
      'バー': 'Bar',
      'ファミリーレストラン': 'Family Restaurant',
      '和食': 'Japanese'
    };

    // レストランのカスタムフィールドを優先的に使用
    if (restaurant && lang === 'ko' && restaurant.korean_cuisine) {
      return restaurant.korean_cuisine;
    }
    if (restaurant && lang === 'en' && restaurant.english_cuisine) {
      return restaurant.english_cuisine;
    }
    
    // フィールドがなければ翻訳マップから取得
    if (lang === 'ko') return koTranslations[cuisine] || cuisine;
    if (lang === 'en') return enTranslations[cuisine] || cuisine;
    
    // 日本語はそのまま返す
    return cuisine;
  };

  const openGoogleMaps = () => {
    if (!restaurant) return;

    const mapsUrl = restaurant.google_maps_link || 
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${restaurant.name} ${restaurant.address || ''} 大阪`)}`;

    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  // スケルトンローディング表示
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div data-testid="loading-spinner" className="animate-spin rounded-full h-12 w-12 border-4 border-[#FF8C00] border-t-transparent"></div>
      </div>
    );
  }

  // エラー表示
  if (isError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="p-6 bg-white rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            {t('restaurantDetails.errorTitle')}
          </h2>
          <p className="text-gray-600 mb-4">{error instanceof Error ? error.message : t('restaurantDetails.unexpectedError')}</p>
          <div className="flex space-x-4">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-[#FF8C00] text-white rounded hover:bg-[#E07800] transition-colors"
            >
              {t('restaurantDetails.backButton')}
            </button>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              再読み込み
            </button>
          </div>
        </div>
      </div>
    );
  }

  // データがない場合
  if (!restaurant) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="p-6 bg-white rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {t('restaurantDetails.notFoundTitle')}
          </h2>
          <p className="text-gray-600 mb-4">
            {t('restaurantDetails.notFoundDesc')}
          </p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-[#FF8C00] text-white rounded hover:bg-[#E07800] transition-colors"
          >
            {t('restaurantDetails.backButton')}
          </button>
        </div>
      </div>
    );
  }

  // 画像URLを処理
  const mainImageUrl = processImageUrl(restaurant.image_url);
  const openingHours = restaurant.opening_hours || '';
  const restaurantUrl = restaurant.url || restaurant.google_maps_link;
  
  return (
    <div className="min-h-screen bg-white">
      {/* Main Image */}
      <div className="relative h-64 md:h-96 bg-gray-100">
        <img
          src={mainImageUrl}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <button
          onClick={onBack}
          className="absolute top-4 left-4 flex items-center text-white hover:text-[#FF8C00] transition-colors"
        >
          <ArrowLeft className="w-6 h-6 mr-1" />
          {t('restaurantDetails.backButton')}
        </button>
      </div>

      {/* Restaurant Info */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative -mt-16 mx-4 bg-white rounded-t-3xl shadow-xl p-6"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {language === 'ko' 
                ? restaurant.korean_name || restaurant.name 
                : language === 'ja' 
                ? (restaurant.japanese_name || restaurant.name)
                : restaurant.name}
            </h1>
            {restaurant.cuisine && (
              <span className="inline-block bg-[#FF8C00]/10 text-[#FF8C00] text-sm px-3 py-1 rounded-full">
                {translateCuisine(restaurant.cuisine, language)}
              </span>
            )}
          </div>
          {restaurant.rating && (
            <div className="flex items-center bg-[#FF8C00] text-white px-3 py-1 rounded-lg">
              <Star className="w-4 h-4 mr-1" />
              <span className="font-semibold">{restaurant.rating}</span>
            </div>
          )}
        </div>

        {/* エリア、価格帯、クイック情報 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {restaurant.area && (
            <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">
              {restaurant.area}
            </span>
          )}
          {restaurant.price_range && (
            <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">
              {restaurant.price_range}
            </span>
          )}
          {/* 他のタグがあれば表示 */}
        </div>

        {/* 予約ボタン */}
        <button
          onClick={() => onReserve(restaurantId)}
          className="w-full mb-6 bg-[#FF8C00] text-white py-3 rounded-lg font-semibold hover:bg-[#E07800] transition-colors"
        >
          予約する
        </button>

        {/* 店舗詳細 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">{t('restaurantDetails.aboutTitle')}</h2>
          <p className="text-gray-600 leading-relaxed">
            {restaurant.description || t('restaurantDetails.noDescription')}
          </p>
        </div>

        {/* 連絡先情報 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">{t('restaurantDetails.contactInfo')}</h2>
          
          {/* 住所 */}
          {restaurant.address && (
            <div className="flex items-start mb-3">
              <MapPin className="w-5 h-5 text-[#FF8C00] mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-gray-700">{restaurant.address}</p>
                <button 
                  onClick={openGoogleMaps}
                  className="text-sm text-[#FF8C00] hover:underline flex items-center mt-1"
                >
                  {t('restaurantDetails.viewOnMap')}
                  <ExternalLink className="w-3 h-3 ml-1" />
                </button>
              </div>
            </div>
          )}
          
          {/* 電話番号 */}
          {restaurant.phone && (
            <div className="flex items-center mb-3">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-5 h-5 text-[#FF8C00] mr-2 flex-shrink-0" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" 
                />
              </svg>
              <p className="text-gray-700">{restaurant.phone}</p>
            </div>
          )}
          
          {/* 営業時間 */}
          {openingHours && (
            <div className="flex items-start mb-3">
              <Clock className="w-5 h-5 text-[#FF8C00] mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-gray-700 whitespace-pre-line">{openingHours}</p>
              </div>
            </div>
          )}
          
          {/* ウェブサイト */}
          {restaurantUrl && (
            <div className="flex items-center">
              <Globe className="w-5 h-5 text-[#FF8C00] mr-2 flex-shrink-0" />
              <a 
                href={restaurantUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FF8C00] hover:underline"
              >
                {new URL(restaurantUrl).hostname}
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
} 