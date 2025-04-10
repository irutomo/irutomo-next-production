'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

type Restaurant = {
  id: string;
  name: string;
  address: string;
  phone_number: string;
  email: string;
  website: string;
  description: string;
  cuisine_type: string;
  rating: number;
  price_range: string;
  opening_hours: string;
  featured: boolean;
  status: string;
  serves_alcohol: boolean;
  takes_reservations: boolean;
  vegetarian_options: boolean;
  vegan_options: boolean;
  gluten_free_options: boolean;
  created_at: string;
  updated_at: string;
  banner_url: string;
  logo_url: string;
  has_wifi: boolean;
  has_parking: boolean;
  is_accessible: boolean;
  reservation_required: boolean;
  is_family_friendly: boolean;
  is_pet_friendly: boolean;
  menu_url: string;
  images: string[];
};

export default function RestaurantDetailPage() {
  const params = useParams() || {};
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClientComponentClient();
  const restaurantId = typeof params.id === 'string' ? params.id : null;

  useEffect(() => {
    if (!restaurantId) {
      setError('レストランIDが見つかりません');
      setLoading(false);
      return;
    }

    const fetchRestaurantDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let isAuthenticating = false;

        // セッションの確認
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('セッション取得エラー:', sessionError);
          setError('認証情報の取得に失敗しました');
          setLoading(false);
          return;
        }
        
        if (!session) {
          console.log('未認証状態 - ログインページへリダイレクト');
          isAuthenticating = true;
          router.push('/admin/login');
          return;
        }

        // 同じセッションで再度認証チェックするのを避ける
        if (isAuthenticating) return;

        // 管理者権限の確認
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (userError) {
          console.error('ユーザー情報取得エラー:', userError);
          setError('ユーザー情報の取得に失敗しました');
          setLoading(false);
          return;
        }

        if (userData?.role !== 'admin') {
          console.log('管理者権限なし - ログインページへリダイレクト');
          router.push('/admin/login');
          return;
        }
        
        // レストラン情報の取得
        const { data, error: restaurantError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', restaurantId)
          .single();
        
        if (restaurantError) {
          console.error('レストラン詳細取得エラー:', restaurantError);
          setError('レストラン情報の取得に失敗しました');
          setLoading(false);
          return;
        }
        
        if (!data) {
          setError('レストランが見つかりませんでした');
          setLoading(false);
          return;
        }
        
        setRestaurant(data as Restaurant);
      } catch (error: any) {
        console.error('レストラン詳細取得エラー:', error);
        setError(error.message || 'レストラン情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRestaurantDetails();
  }, [restaurantId, router, supabase]);

  const handleStatusChange = async (newStatus: string) => {
    if (!restaurant) return;
    
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({ status: newStatus })
        .eq('id', restaurant.id);
      
      if (error) throw error;
      
      setRestaurant({ ...restaurant, status: newStatus });
    } catch (error: any) {
      console.error('ステータス更新エラー:', error);
      alert('ステータスの更新に失敗しました: ' + error.message);
    }
  };

  const toggleFeatured = async () => {
    if (!restaurant) return;
    
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({ featured: !restaurant.featured })
        .eq('id', restaurant.id);
      
      if (error) throw error;
      
      setRestaurant({ ...restaurant, featured: !restaurant.featured });
    } catch (error: any) {
      console.error('おすすめ設定更新エラー:', error);
      alert('おすすめ設定の更新に失敗しました: ' + error.message);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '未設定';
    try {
      return format(parseISO(dateString), 'yyyy年MM月dd日 HH:mm', { locale: ja });
    } catch (e) {
      return dateString;
    }
  };

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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '公開中';
      case 'inactive': return '非公開';
      case 'pending': return '審査中';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-red-600 my-10">
          <p className="text-xl">{error || 'レストランが見つかりませんでした'}</p>
          <button 
            onClick={() => router.back()} 
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">レストラン詳細</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => router.back()} 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
          >
            戻る
          </button>
          <Link 
            href={`/admin/restaurants/${restaurant.id}/edit`} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded"
          >
            編集
          </Link>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* レストランバナー */}
        <div className="relative h-48 w-full bg-gray-200">
          {restaurant.banner_url ? (
            <Image 
              src={restaurant.banner_url} 
              alt={restaurant.name} 
              fill
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-400">
              バナー画像なし
            </div>
          )}
        </div>
        
        {/* レストラン基本情報 */}
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-start space-x-4">
              {/* ロゴ */}
              <div className="relative h-20 w-20 rounded-full overflow-hidden bg-gray-100">
                {restaurant.logo_url ? (
                  <Image 
                    src={restaurant.logo_url} 
                    alt={restaurant.name} 
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">
                    ロゴなし
                  </div>
                )}
              </div>
              
              {/* 名前と基本情報 */}
              <div>
                <h1 className="text-2xl font-bold">{restaurant.name}</h1>
                <p className="text-gray-600">{restaurant.cuisine_type || '料理ジャンル未設定'}</p>
                <div className="flex items-center mt-2 space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(restaurant.status)}`}>
                    {getStatusText(restaurant.status)}
                  </span>
                  
                  {restaurant.featured && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      おすすめ
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* アクションボタン */}
            <div className="flex flex-col space-y-2">
              <div className="flex space-x-2">
                {restaurant.status !== 'active' && (
                  <button 
                    onClick={() => handleStatusChange('active')}
                    className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded text-sm"
                  >
                    公開する
                  </button>
                )}
                
                {restaurant.status !== 'inactive' && (
                  <button 
                    onClick={() => handleStatusChange('inactive')}
                    className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
                  >
                    非公開にする
                  </button>
                )}
              </div>
              
              <button 
                onClick={toggleFeatured}
                className={`py-1 px-3 rounded text-sm ${
                  restaurant.featured 
                    ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {restaurant.featured ? 'おすすめ解除' : 'おすすめに設定'}
              </button>
            </div>
          </div>
          
          {/* 詳細情報 */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b">基本情報</h3>
              <dl className="divide-y">
                <div className="py-2 grid grid-cols-3">
                  <dt className="text-gray-500">住所</dt>
                  <dd className="col-span-2">{restaurant.address || '未設定'}</dd>
                </div>
                <div className="py-2 grid grid-cols-3">
                  <dt className="text-gray-500">電話番号</dt>
                  <dd className="col-span-2">{restaurant.phone_number || '未設定'}</dd>
                </div>
                <div className="py-2 grid grid-cols-3">
                  <dt className="text-gray-500">メール</dt>
                  <dd className="col-span-2">{restaurant.email || '未設定'}</dd>
                </div>
                <div className="py-2 grid grid-cols-3">
                  <dt className="text-gray-500">ウェブサイト</dt>
                  <dd className="col-span-2">
                    {restaurant.website ? (
                      <a 
                        href={restaurant.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline"
                      >
                        {restaurant.website}
                      </a>
                    ) : '未設定'}
                  </dd>
                </div>
                <div className="py-2 grid grid-cols-3">
                  <dt className="text-gray-500">営業時間</dt>
                  <dd className="col-span-2">{restaurant.opening_hours || '未設定'}</dd>
                </div>
                <div className="py-2 grid grid-cols-3">
                  <dt className="text-gray-500">価格帯</dt>
                  <dd className="col-span-2">{restaurant.price_range || '未設定'}</dd>
                </div>
                <div className="py-2 grid grid-cols-3">
                  <dt className="text-gray-500">メニューURL</dt>
                  <dd className="col-span-2">
                    {restaurant.menu_url ? (
                      <a 
                        href={restaurant.menu_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline"
                      >
                        メニューを見る
                      </a>
                    ) : '未設定'}
                  </dd>
                </div>
              </dl>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b">詳細情報</h3>
              <dl className="divide-y">
                <div className="py-2 grid grid-cols-3">
                  <dt className="text-gray-500">予約</dt>
                  <dd className="col-span-2">{restaurant.takes_reservations ? '可能' : '不可'}</dd>
                </div>
                <div className="py-2 grid grid-cols-3">
                  <dt className="text-gray-500">予約必須</dt>
                  <dd className="col-span-2">{restaurant.reservation_required ? 'はい' : 'いいえ'}</dd>
                </div>
                <div className="py-2 grid grid-cols-3">
                  <dt className="text-gray-500">アルコール提供</dt>
                  <dd className="col-span-2">{restaurant.serves_alcohol ? 'あり' : 'なし'}</dd>
                </div>
                <div className="py-2 grid grid-cols-3">
                  <dt className="text-gray-500">Wi-Fi</dt>
                  <dd className="col-span-2">{restaurant.has_wifi ? 'あり' : 'なし'}</dd>
                </div>
                <div className="py-2 grid grid-cols-3">
                  <dt className="text-gray-500">駐車場</dt>
                  <dd className="col-span-2">{restaurant.has_parking ? 'あり' : 'なし'}</dd>
                </div>
                <div className="py-2 grid grid-cols-3">
                  <dt className="text-gray-500">バリアフリー</dt>
                  <dd className="col-span-2">{restaurant.is_accessible ? 'はい' : 'いいえ'}</dd>
                </div>
                <div className="py-2 grid grid-cols-3">
                  <dt className="text-gray-500">家族向け</dt>
                  <dd className="col-span-2">{restaurant.is_family_friendly ? 'はい' : 'いいえ'}</dd>
                </div>
                <div className="py-2 grid grid-cols-3">
                  <dt className="text-gray-500">ペット可</dt>
                  <dd className="col-span-2">{restaurant.is_pet_friendly ? 'はい' : 'いいえ'}</dd>
                </div>
                <div className="py-2 grid grid-cols-3">
                  <dt className="text-gray-500">ベジタリアン</dt>
                  <dd className="col-span-2">{restaurant.vegetarian_options ? 'メニューあり' : 'なし'}</dd>
                </div>
                <div className="py-2 grid grid-cols-3">
                  <dt className="text-gray-500">ビーガン</dt>
                  <dd className="col-span-2">{restaurant.vegan_options ? 'メニューあり' : 'なし'}</dd>
                </div>
                <div className="py-2 grid grid-cols-3">
                  <dt className="text-gray-500">グルテンフリー</dt>
                  <dd className="col-span-2">{restaurant.gluten_free_options ? 'メニューあり' : 'なし'}</dd>
                </div>
              </dl>
            </div>
          </div>
          
          {/* 説明文 */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">説明</h3>
            <div className="bg-gray-50 p-4 rounded">
              {restaurant.description || '説明文がありません'}
            </div>
          </div>
          
          {/* システム情報 */}
          <div className="mt-8 border-t pt-4 text-sm text-gray-500">
            <p>作成日時: {formatDate(restaurant.created_at)}</p>
            <p>最終更新: {formatDate(restaurant.updated_at)}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 