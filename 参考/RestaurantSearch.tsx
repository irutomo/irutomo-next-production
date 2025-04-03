import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@lib/supabase';
import type { Restaurant } from '@lib/types/supabase';
import DirectRequestModal from './DirectRequestModal';
import { processImageUrl, CUISINE_IMAGES } from '../../../lib/config/restaurant-images';

// 本番環境かどうかを確認
const isProd = import.meta.env.PROD;

// デバッグ用のロガー
const logger = {
  log: (...args: any[]) => {
    if (!isProd) console.log(...args);
  },
  error: (...args: any[]) => console.error(...args), // エラーは本番でも出力
  warn: (...args: any[]) => {
    if (!isProd) console.warn(...args);
  },
  info: (...args: any[]) => {
    if (!isProd) console.info(...args);
  }
};

interface RestaurantSearchProps {
  language: 'ko' | 'ja' | 'en';
  onSelectRestaurant: (restaurantId: string) => void;
}

export default function RestaurantSearch({ language, onSelectRestaurant }: RestaurantSearchProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDirectRequestModalOpen, setIsDirectRequestModalOpen] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const restaurantsPerPage = 12;

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setIsLoading(true);
      logger.log('レストラン情報取得開始...');
      
      // まず接続テストを実行
      const testResult = await supabase.from('restaurants').select('id').limit(1);
      if (testResult.error) {
        logger.error('接続テストエラー:', testResult.error);
        throw new Error(`接続テストエラー: ${testResult.error.message}`);
      }
      
      logger.log('接続テスト成功。全レストラン情報を取得します...');
      
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('rating', { ascending: false });

      if (error) {
        logger.error('レストラン情報取得エラー:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        logger.warn('レストランデータが取得できませんでした（空のデータセット）');
      } else {
        logger.log(`${data.length}件のレストラン情報を取得しました`);
      }
      
      setRestaurants(data || []);
    } catch (error) {
      logger.error('Error fetching restaurants:', error);
      // ユーザーフレンドリーなエラーメッセージ
      alert(language === 'ko' 
        ? '데이터 로딩 중 오류가 발생했습니다. 다시 시도해 주세요.' 
        : language === 'ja' 
        ? 'データの読み込み中にエラーが発生しました。再度お試しください。' 
        : 'Error loading data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 画像処理ユーティリティをインポート
  const getRandomImage = (cuisine: string | null): string => {
    if (!cuisine || !CUISINE_IMAGES[cuisine] || CUISINE_IMAGES[cuisine].length === 0) {
      // デフォルト画像をランダムに選択
      const defaultImages = CUISINE_IMAGES.default;
      return defaultImages[Math.floor(Math.random() * defaultImages.length)];
    }
    
    // ジャンルに対応する画像をランダムに選択
    const cuisineImages = CUISINE_IMAGES[cuisine];
    return cuisineImages[Math.floor(Math.random() * cuisineImages.length)];
  };

  // 画像URLを処理する関数
  const processRestaurantImageUrl = (url: string | null, restaurant: any): string => {
    return processImageUrl(url, restaurant?.id, restaurant?.cuisine_type);
  };

  // レストラン画像を取得する関数
  const getRestaurantImages = (restaurant: any): { main: string; gallery: string[] } => {
    const mainImage = processRestaurantImageUrl(restaurant.image_url, restaurant);
    
    // ギャラリー画像がある場合はそれを使用、なければジャンルに基づいてデフォルト画像を使用
    const galleryImages = restaurant.gallery_images 
      ? (Array.isArray(restaurant.gallery_images) 
          ? restaurant.gallery_images 
          : [])
      : [];
    
    // 不足している場合はジャンル画像で補完
    if (galleryImages.length < 3) {
      const cuisineImages = CUISINE_IMAGES[restaurant.cuisine_type] || CUISINE_IMAGES.default;
      for (let i = galleryImages.length; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * cuisineImages.length);
        galleryImages.push(cuisineImages[randomIndex]);
      }
    }
    
    return {
      main: mainImage,
      gallery: galleryImages.map(img => processRestaurantImageUrl(img, restaurant))
    };
  };

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (restaurant.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (restaurant.cuisine?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const paginatedRestaurants = filteredRestaurants.slice(
    (currentPage - 1) * restaurantsPerPage,
    currentPage * restaurantsPerPage
  );

  const totalPages = Math.ceil(filteredRestaurants.length / restaurantsPerPage);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const openGoogleMaps = (restaurant: Restaurant) => {
    const mapsUrl = restaurant.google_maps_link || 
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${restaurant.name} ${restaurant.address} 大阪`)}`;

    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSelectRestaurant = (restaurantId: string) => {
    // Call the provided onSelectRestaurant function
    onSelectRestaurant(restaurantId);
    
    // Navigate to the restaurant details page
    navigate(`/restaurant-details/${restaurantId}`);
  };

  return (
    <div className="bg-white">
      {/* Search Section */}
      <section className="py-8 bg-gray-50 sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                placeholder={language === 'ko' ? '오사카 맛집 검색' : language === 'ja' ? '大阪のグルメを検索' : 'Search Osaka restaurants'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-[#FF8C00] text-white rounded-lg hover:brightness-110 transition-all"
              aria-label={language === 'ko' ? '검색' : language === 'ja' ? '検索' : 'Search'}
            >
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>
      </section>

      {/* Restaurant List */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FF8C00] border-t-transparent"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedRestaurants.map((restaurant) => {
                  // 画像を処理
                  const { main: restaurantImage } = getRestaurantImages(restaurant);
                  
                  return (
                    <div 
                      key={restaurant.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="relative h-48">
                        <img
                          src={restaurantImage}
                          alt={restaurant.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // 画像ロードエラー時にデフォルト画像を表示
                            e.currentTarget.src = getRandomImage(restaurant.cuisine || null);
                          }}
                        />
                        {/* カテゴリータグ */}
                        {restaurant.cuisine && (
                          <span className="absolute top-2 right-2 bg-white bg-opacity-90 text-gray-800 text-xs px-2 py-1 rounded">
                            {restaurant.cuisine}
                          </span>
                        )}
                      </div>
                      
                      {/* レストラン情報 */}
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-1 text-gray-900">
                          {restaurant.name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <span className="mr-2">
                            {restaurant.price_range === 'high' && '¥¥¥'}
                            {restaurant.price_range === 'medium' && '¥¥'}
                            {restaurant.price_range === 'low' && '¥'}
                          </span>
                          {restaurant.rating && (
                            <span className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 mr-1" />
                              {restaurant.rating}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {restaurant.description || 'No description available'}
                        </p>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => openGoogleMaps(restaurant)}
                            className="flex items-center text-[#FF8C00] hover:text-orange-600 transition-colors"
                          >
                            <MapPin className="w-4 h-4 mr-1" />
                            {language === 'ko' ? '지도에서 보기' : language === 'ja' ? '地図で見る' : 'View on Map'}
                          </button>
                          <button
                            onClick={() => handleSelectRestaurant(restaurant.id.toString())}
                            className="px-4 py-2 bg-[#FF8C00] text-white rounded hover:brightness-110 transition-all"
                          >
                            {language === 'ko' ? '선택' : language === 'ja' ? '選択' : 'Select'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded ${
                        currentPage === page
                          ? 'bg-[#FF8C00] text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Custom Request CTA */}
          <div className="mt-8 text-center">
            <button
              onClick={() => setIsDirectRequestModalOpen(true)}
              className="px-6 py-3 bg-[#FF8C00] text-white rounded-lg hover:brightness-110 transition-all"
            >
              {language === 'ko' ? '직접 요청하기' : language === 'ja' ? '直接リクエスト' : 'Direct Request'}
            </button>
          </div>
        </div>
      </section>

      {/* DirectRequestModal */}
      <DirectRequestModal
        isOpen={isDirectRequestModalOpen}
        onClose={() => setIsDirectRequestModalOpen(false)}
        language={language}
      />
    </div>
  );
}