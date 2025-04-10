'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

type Restaurant = {
  id: string;
  name: string;
  address: string;
  cuisine_type: string;
  rating: number;
  price_range: string;
  created_at: string;
  featured: boolean;
  status: string;
  reservation_required: boolean;
};

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  
  // フィルター状態
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cuisineFilter, setCuisineFilter] = useState<string>('all');
  const [featuredFilter, setFeaturedFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // ページネーション
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  
  // 料理タイプのリスト
  const [cuisineTypes, setCuisineTypes] = useState<string[]>([]);
  
  const supabase = createClientComponentClient();

  // レストランデータを取得
  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      
      let baseQuery = supabase
        .from('restaurants');
      
      let queryFilters = baseQuery.select('*');
      
      // 各種フィルター適用
      if (statusFilter !== 'all') {
        queryFilters = queryFilters.eq('status', statusFilter);
      }
      
      if (cuisineFilter !== 'all') {
        queryFilters = queryFilters.eq('cuisine_type', cuisineFilter);
      }
      
      if (featuredFilter !== 'all') {
        const isFeatured = featuredFilter === 'featured';
        queryFilters = queryFilters.eq('featured', isFeatured);
      }
      
      if (searchTerm) {
        queryFilters = queryFilters.or(`name.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`);
      }
      
      // 総数を取得してページネーション計算
      try {
        // count用のクエリ
        const countQuery = baseQuery.select('*', { count: 'exact', head: true });
        
        // 同じフィルターを適用
        if (statusFilter !== 'all') {
          countQuery.eq('status', statusFilter);
        }
        
        if (cuisineFilter !== 'all') {
          countQuery.eq('cuisine_type', cuisineFilter);
        }
        
        if (featuredFilter !== 'all') {
          const isFeatured = featuredFilter === 'featured';
          countQuery.eq('featured', isFeatured);
        }
        
        if (searchTerm) {
          countQuery.or(`name.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`);
        }
        
        const { count } = await countQuery;
        setTotalPages(Math.ceil((count || 0) / itemsPerPage));
      } catch (error) {
        console.error('レストラン数取得エラー:', error);
      }
      
      // データ取得
      const { data, error } = await queryFilters
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);
      
      if (error) {
        console.error('レストラン取得エラー:', error);
        setLoading(false);
        return;
      }
      
      setRestaurants(data as Restaurant[]);
      setLoading(false);
    };
    
    fetchRestaurants();
  }, [supabase, statusFilter, cuisineFilter, featuredFilter, searchTerm, currentPage]);

  // 料理タイプを取得
  useEffect(() => {
    const fetchCuisineTypes = async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('cuisine_type')
        .order('cuisine_type');
      
      if (error) {
        console.error('料理タイプ取得エラー:', error);
        return;
      }
      
      // 重複を削除
      const uniqueCuisineTypes = Array.from(new Set(data.map(item => item.cuisine_type)));
      setCuisineTypes(uniqueCuisineTypes);
    };
    
    fetchCuisineTypes();
  }, [supabase]);

  // レストランのステータスを更新する関数
  const updateRestaurantStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      // 更新成功後、リストを更新
      setRestaurants(prevRestaurants => 
        prevRestaurants.map(restaurant => 
          restaurant.id === id 
            ? { ...restaurant, status: newStatus } 
            : restaurant
        )
      );
    } catch (error) {
      console.error('レストランステータス更新エラー:', error);
    }
  };

  // おすすめレストランの設定を切り替える
  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({ featured: !currentFeatured })
        .eq('id', id);
      
      if (error) throw error;
      
      // 更新成功後、リストを更新
      setRestaurants(prevRestaurants => 
        prevRestaurants.map(restaurant => 
          restaurant.id === id 
            ? { ...restaurant, featured: !currentFeatured } 
            : restaurant
        )
      );
    } catch (error) {
      console.error('おすすめ設定更新エラー:', error);
    }
  };

  // ステータスに応じたバッジのスタイルを返す
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // ステータスの日本語表示
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '公開中';
      case 'inactive': return '非公開';
      case 'pending': return '審査中';
      default: return status;
    }
  };

  // 評価を星で表示
  const renderRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="text-yellow-400">
            {i < fullStars ? '★' : (i === fullStars && hasHalfStar ? '★' : '☆')}
          </span>
        ))}
        <span className="ml-1 text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // フィルターをリセット
  const resetFilters = () => {
    setStatusFilter('all');
    setCuisineFilter('all');
    setFeaturedFilter('all');
    setSearchTerm('');
    setCurrentPage(1);
  };

  // 日付を日本語フォーマットで表示
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'yyyy年MM月dd日', { locale: ja });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">レストラン管理</h2>
        <div className="flex gap-2">
          <button
            onClick={resetFilters}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
          >
            フィルターをリセット
          </button>
          <Link href="/admin/restaurants/new" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">
            新規レストラン
          </Link>
        </div>
      </div>
      
      {/* フィルターコントロール */}
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ステータス
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            >
              <option value="all">すべて</option>
              <option value="active">公開中</option>
              <option value="inactive">非公開</option>
              <option value="pending">審査中</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              料理タイプ
            </label>
            <select
              value={cuisineFilter}
              onChange={(e) => {
                setCuisineFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            >
              <option value="all">すべて</option>
              {cuisineTypes.map(cuisine => (
                <option key={cuisine} value={cuisine}>
                  {cuisine}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              おすすめ表示
            </label>
            <select
              value={featuredFilter}
              onChange={(e) => {
                setFeaturedFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            >
              <option value="all">すべて</option>
              <option value="featured">おすすめのみ</option>
              <option value="not_featured">通常のみ</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              検索
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="名前または住所で検索"
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            />
          </div>
        </div>
      </div>
      
      {/* レストランリスト */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>レストランが見つかりませんでした</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    名前
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    住所
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    料理タイプ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    評価
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    価格帯
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    おすすめ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {restaurants.map((restaurant) => (
                  <tr key={restaurant.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{restaurant.name}</div>
                      <div className="text-xs text-gray-500">ID: {restaurant.id.substring(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {restaurant.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {restaurant.cuisine_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {renderRating(restaurant.rating)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {restaurant.price_range}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={restaurant.status}
                        onChange={(e) => updateRestaurantStatus(restaurant.id, e.target.value)}
                        className={`text-xs font-semibold rounded px-2 py-1 ${getStatusBadgeClass(restaurant.status)}`}
                      >
                        <option value="active">公開中</option>
                        <option value="inactive">非公開</option>
                        <option value="pending">審査中</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <button
                        onClick={() => toggleFeatured(restaurant.id, restaurant.featured)}
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          restaurant.featured 
                            ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {restaurant.featured ? 'おすすめ中' : '通常'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link href={`/admin/restaurants/${restaurant.id}`} className="text-blue-600 hover:text-blue-900 mr-3">
                        詳細
                      </Link>
                      <Link href={`/admin/restaurants/${restaurant.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                        編集
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* ページネーション */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">
                <span>{currentPage}</span> / <span>{totalPages}</span> ページ
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                前へ
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                次へ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 