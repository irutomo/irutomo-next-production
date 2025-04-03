import React, { useEffect, useState } from 'react';
import { fetchRestaurants } from '../../lib/api/restaurant-api';
import { Restaurant } from '../../types/restaurant';
import { Link } from 'react-router-dom';

interface RestaurantListProps {
  category?: string;
  initialSearch?: string;
}

const RestaurantList: React.FC<RestaurantListProps> = ({ 
  category, 
  initialSearch = '' 
}) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params: Record<string, any> = { 
          page: currentPage, 
          limit: 10 
        };
        
        if (category) {
          params.category = category;
        }
        
        if (search) {
          params.search = search;
        }
        
        const result = await fetchRestaurants(params);
        setRestaurants(result.restaurants);
        setTotalCount(result.totalCount);
        setTotalPages(Math.ceil(result.totalCount / 10));
      } catch (err) {
        console.error('レストランデータの取得中にエラーが発生しました', err);
        setError('レストラン情報の読み込みに失敗しました。もう一度お試しください。');
      } finally {
        setLoading(false);
      }
    };

    loadRestaurants();
  }, [category, search, currentPage]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1); // 検索時は1ページ目に戻る
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) {
    return <div className="text-center py-10">読み込み中...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          再試行
        </button>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="py-10">
        <div className="mb-6">
          <input
            type="text"
            placeholder="レストランを検索..."
            value={search}
            onChange={handleSearchChange}
            className="w-full p-3 border rounded"
          />
        </div>
        <div className="text-center py-10">
          <p>該当するレストランが見つかりませんでした。</p>
          {search && (
            <button 
              onClick={() => setSearch('')} 
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded"
            >
              検索をクリア
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="mb-6">
        <input
          type="text"
          placeholder="レストランを検索..."
          value={search}
          onChange={handleSearchChange}
          className="w-full p-3 border rounded"
        />
      </div>

      <p className="mb-4 text-gray-600">
        {totalCount}件のレストランが見つかりました
        {category ? `（カテゴリー: ${category}）` : ''}
        {search ? `（検索: "${search}"）` : ''}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <Link 
            key={restaurant.id} 
            to={`/restaurants/${restaurant.id}`}
            className="block border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="h-48 overflow-hidden">
              <img 
                src={restaurant.image || '/images/restaurant-placeholder.jpg'} 
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-1">{restaurant.name}</h3>
              <p className="text-gray-600 mb-2">{restaurant.category}</p>
              <p className="text-sm text-gray-500 mb-2">{restaurant.address}</p>
              <div className="flex items-center">
                <div className="flex items-center mr-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg 
                      key={i}
                      className={`w-4 h-4 ${
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
          </Link>
        ))}
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-l disabled:opacity-50"
          >
            前へ
          </button>
          
          <div className="flex">
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              // 表示するページ番号の計算（現在のページを中心に最大5ページ表示）
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={i}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-4 py-2 border-t border-b ${
                    currentPage === pageNum 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-r disabled:opacity-50"
          >
            次へ
          </button>
        </div>
      )}
    </div>
  );
};

export default RestaurantList; 