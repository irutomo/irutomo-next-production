import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchRestaurantById } from '../../lib/api/restaurant-api';
import { RestaurantDetail as RestaurantDetailType } from '../../types/restaurant';

const RestaurantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<RestaurantDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'menu' | 'reviews'>('info');

  useEffect(() => {
    const loadRestaurantDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const data = await fetchRestaurantById(id);
        setRestaurant(data);
      } catch (err) {
        console.error('レストラン詳細の取得中にエラーが発生しました', err);
        setError('レストラン情報の読み込みに失敗しました。もう一度お試しください。');
      } finally {
        setLoading(false);
      }
    };

    loadRestaurantDetails();
  }, [id]);

  const handleReservationClick = () => {
    if (restaurant) {
      navigate(`/reservation/new?restaurantId=${restaurant.id}`);
    }
  };

  if (loading) {
    return <div className="text-center py-10">読み込み中...</div>;
  }

  if (error || !restaurant) {
    return (
      <div className="text-center py-10 text-red-500">
        <p>{error || 'レストランが見つかりませんでした。'}</p>
        <button 
          onClick={() => navigate(-1)} 
          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded mr-2"
        >
          戻る
        </button>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          再試行
        </button>
      </div>
    );
  }

  const formatBusinessHours = (hours: { day: string; openTime: string; closeTime: string; isClosed: boolean; }[]) => {
    const days = ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日'];
    const sortedHours = [...hours].sort((a, b) => days.indexOf(a.day) - days.indexOf(b.day));
    
    return sortedHours.map(hour => ({
      ...hour,
      formattedHours: hour.isClosed ? '定休日' : `${hour.openTime} - ${hour.closeTime}`
    }));
  };

  const formattedHours = restaurant.businessHours ? formatBusinessHours(restaurant.businessHours) : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* ヘッダー部分 */}
      <div className="flex flex-col md:flex-row md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
          <p className="text-gray-600 mb-2">{restaurant.category}</p>
          <div className="flex items-center mb-4">
            <div className="flex items-center mr-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg 
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(restaurant.rating) 
                    ? 'text-yellow-400' 
                    : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-gray-600">{restaurant.rating.toFixed(1)}</span>
            <span className="mx-2">•</span>
            <span className="text-gray-600">{restaurant.priceRange}</span>
          </div>
        </div>
        
        <div className="mb-4 md:mb-0">
          <button 
            onClick={handleReservationClick}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            予約する
          </button>
        </div>
      </div>

      {/* メイン画像 */}
      <div className="mb-8 rounded-lg overflow-hidden h-80">
        <img 
          src={restaurant.image || '/images/restaurant-placeholder.jpg'}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* タブメニュー */}
      <div className="border-b mb-6">
        <div className="flex">
          <button 
            className={`px-4 py-2 font-medium ${
              activeTab === 'info' 
                ? 'border-b-2 border-blue-500 text-blue-500' 
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('info')}
          >
            レストラン情報
          </button>
          <button 
            className={`px-4 py-2 font-medium ${
              activeTab === 'menu' 
                ? 'border-b-2 border-blue-500 text-blue-500' 
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('menu')}
          >
            メニュー
          </button>
          <button 
            className={`px-4 py-2 font-medium ${
              activeTab === 'reviews' 
                ? 'border-b-2 border-blue-500 text-blue-500' 
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('reviews')}
          >
            レビュー
          </button>
        </div>
      </div>

      {/* タブコンテンツ */}
      <div className="mb-10">
        {/* レストラン情報 */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">基本情報</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-gray-500 text-sm">住所</h3>
                  <p>{restaurant.address}</p>
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm">電話番号</h3>
                  <p>{restaurant.phoneNumber}</p>
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm">料金目安</h3>
                  <p>{restaurant.priceRange}</p>
                </div>
              </div>

              <h2 className="text-xl font-semibold mt-8 mb-4">紹介</h2>
              <p className="whitespace-pre-line">{restaurant.description}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">営業時間</h2>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <tbody>
                    {formattedHours.map((hour, index) => (
                      <tr 
                        key={hour.day} 
                        className={index % 2 === 0 ? 'bg-gray-50' : ''}
                      >
                        <td className="py-3 px-4 border-b">{hour.day}</td>
                        <td className={`py-3 px-4 border-b ${hour.isClosed ? 'text-red-500' : ''}`}>
                          {hour.formattedHours}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* メニュー */}
        {activeTab === 'menu' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">メニュー</h2>
            {restaurant.menuItems && restaurant.menuItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {restaurant.menuItems.map(item => (
                  <div key={item.id} className="flex border rounded-lg overflow-hidden">
                    {item.image && (
                      <div className="w-1/3">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className={`p-4 ${item.image ? 'w-2/3' : 'w-full'}`}>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      <p className="font-medium text-blue-800">¥{item.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">メニュー情報がありません。</p>
            )}
          </div>
        )}

        {/* レビュー */}
        {activeTab === 'reviews' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">レビュー</h2>
              <Link 
                to={`/restaurants/${restaurant.id}/review/new`} 
                className="text-blue-600 hover:underline"
              >
                レビューを書く
              </Link>
            </div>
            
            {restaurant.reviews && restaurant.reviews.length > 0 ? (
              <div className="space-y-6">
                {restaurant.reviews.map(review => (
                  <div key={review.id} className="border-b pb-6">
                    <div className="flex items-center mb-2">
                      <div className="flex items-center mr-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg 
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating 
                              ? 'text-yellow-400' 
                              : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-gray-600">{review.rating}</span>
                    </div>
                    <h3 className="font-medium mb-1">{review.userName}</h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {new Date(review.createdAt).toLocaleDateString('ja-JP')}
                    </p>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">まだレビューがありません。最初のレビューを投稿しませんか？</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDetail; 