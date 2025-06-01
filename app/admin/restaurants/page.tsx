'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import Pagination from '@/components/common/Pagination';
import { calculateSupabaseRange } from '@/lib/utils/pagination';

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
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  
  // 料理タイプのリスト
  const [cuisineTypes, setCuisineTypes] = useState<string[]>([]);
  
  const supabase = createClientComponentClient();

  // レストラン取得関数
  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    
    const [from, to] = calculateSupabaseRange(currentPage, itemsPerPage);
    
    let baseQuery = supabase
      .from('restaurants');
    
    let queryFilters = baseQuery.select('*', { count: 'exact' });
    
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
    
    try {
      const { data, error, count } = await queryFilters
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('レストラン取得エラー:', error);
        return;
      }

      setRestaurants(data || []);
      setTotalItems(count || 0);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    } catch (error) {
      console.error('レストラン取得エラー:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase, currentPage, statusFilter, cuisineFilter, featuredFilter, searchTerm]);

  // データ取得の実行
  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

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
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">レストラン管理</h1>
        <Link
          href="/admin/restaurants/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          新規追加
        </Link>
      </div>

      {/* フィルター */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">検索</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="名前、住所で検索"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ステータス</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="all">すべて</option>
              <option value="active">アクティブ</option>
              <option value="inactive">非アクティブ</option>
              <option value="pending">承認待ち</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">料理タイプ</label>
            <select
              value={cuisineFilter}
              onChange={(e) => setCuisineFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="all">すべて</option>
              <option value="korean">韓国料理</option>
              <option value="japanese">日本料理</option>
              <option value="chinese">中華料理</option>
              <option value="western">洋食</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">注目</label>
            <select
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="all">すべて</option>
              <option value="featured">注目店舗</option>
              <option value="normal">通常店舗</option>
            </select>
          </div>
        </div>
      </div>

      {/* レストラン一覧 */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* テーブル内容 */}
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
            
            {/* ページネーション */}
            <div className="px-6 py-4 border-t">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={itemsPerPage}
                showPageSizeSelector={false}
                className="justify-center"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
} 