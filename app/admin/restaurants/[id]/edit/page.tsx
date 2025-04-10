'use client';

import { useState, useEffect, FormEvent } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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
  banner_url: string;
  logo_url: string;
  has_wifi: boolean;
  has_parking: boolean;
  is_accessible: boolean;
  reservation_required: boolean;
  is_family_friendly: boolean;
  is_pet_friendly: boolean;
  menu_url: string;
};

type FormErrors = {
  [key: string]: string;
};

export default function EditRestaurantPage() {
  const params = useParams() || {};
  const router = useRouter();
  const restaurantId = typeof params.id === 'string' ? params.id : null;
  
  const [restaurant, setRestaurant] = useState<Restaurant>({
    id: '',
    name: '',
    address: '',
    phone_number: '',
    email: '',
    website: '',
    description: '',
    cuisine_type: '',
    rating: 0,
    price_range: '',
    opening_hours: '',
    featured: false,
    status: 'active',
    serves_alcohol: false,
    takes_reservations: false,
    vegetarian_options: false,
    vegan_options: false,
    gluten_free_options: false,
    banner_url: '',
    logo_url: '',
    has_wifi: false,
    has_parking: false,
    is_accessible: false,
    reservation_required: false,
    is_family_friendly: false,
    is_pet_friendly: false,
    menu_url: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  const supabase = createClientComponentClient();

  // レストラン情報を取得
  useEffect(() => {
    if (!restaurantId) {
      setError('レストランIDが見つかりません');
      setLoading(false);
      return;
    }

    const fetchRestaurant = async () => {
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
          console.error('レストラン取得エラー:', restaurantError);
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
        console.error('レストラン取得エラー:', error);
        setError(error.message || 'レストラン情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRestaurant();
  }, [restaurantId, router, supabase]);

  // フォームの入力値を更新
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setRestaurant(prev => ({ ...prev, [name]: checked }));
    } else {
      setRestaurant(prev => ({ ...prev, [name]: value }));
    }
    
    // エラーメッセージをクリア
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // フォーム送信時の処理
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    // バリデーション
    const newErrors: FormErrors = {};
    if (!restaurant.name) newErrors.name = '店舗名は必須です';
    if (!restaurant.address) newErrors.address = '住所は必須です';
    if (!restaurant.cuisine_type) newErrors.cuisine_type = '料理タイプは必須です';
    
    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      setSaving(false);
      return;
    }
    
    try {
      const { error } = await supabase
        .from('restaurants')
        .update(restaurant)
        .eq('id', restaurantId);
      
      if (error) throw error;
      
      setSuccess('レストラン情報を更新しました');
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (error: any) {
      console.error('更新エラー:', error);
      setError(error.message || '更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !restaurant.id) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-red-600 my-10">
          <p className="text-xl">{error}</p>
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
        <h2 className="text-2xl font-semibold">レストラン編集</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => router.back()} 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
          >
            戻る
          </button>
          <Link 
            href={`/admin/restaurants/${restaurantId}`} 
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            詳細に戻る
          </Link>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 my-4">
          <p>{success}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-8">
        {/* 基本情報 */}
        <div>
          <h3 className="text-lg font-medium mb-4 pb-2 border-b">基本情報</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                店舗名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={restaurant.name}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
              />
              {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                料理タイプ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="cuisine_type"
                value={restaurant.cuisine_type}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${formErrors.cuisine_type ? 'border-red-500' : 'border-gray-300'}`}
              />
              {formErrors.cuisine_type && <p className="text-red-500 text-xs mt-1">{formErrors.cuisine_type}</p>}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                住所 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={restaurant.address}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${formErrors.address ? 'border-red-500' : 'border-gray-300'}`}
              />
              {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                電話番号
              </label>
              <input
                type="text"
                name="phone_number"
                value={restaurant.phone_number}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <input
                type="email"
                name="email"
                value={restaurant.email}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ウェブサイト
              </label>
              <input
                type="url"
                name="website"
                value={restaurant.website}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="https://..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メニューURL
              </label>
              <input
                type="url"
                name="menu_url"
                value={restaurant.menu_url}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="https://..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                営業時間
              </label>
              <input
                type="text"
                name="opening_hours"
                value={restaurant.opening_hours}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="例: 11:00-22:00"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                価格帯
              </label>
              <select
                name="price_range"
                value={restaurant.price_range}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">選択してください</option>
                <option value="$">$ (リーズナブル)</option>
                <option value="$$">$$ (標準)</option>
                <option value="$$$">$$$ (高級)</option>
                <option value="$$$$">$$$$ (超高級)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ステータス
              </label>
              <select
                name="status"
                value={restaurant.status}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="active">公開中</option>
                <option value="inactive">非公開</option>
                <option value="pending">審査中</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                評価 (0-5)
              </label>
              <input
                type="number"
                name="rating"
                value={restaurant.rating}
                onChange={handleChange}
                min="0"
                max="5"
                step="0.1"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ロゴ画像URL
              </label>
              <input
                type="url"
                name="logo_url"
                value={restaurant.logo_url}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="https://..."
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                バナー画像URL
              </label>
              <input
                type="url"
                name="banner_url"
                value={restaurant.banner_url}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>
        
        {/* 説明文 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            説明文
          </label>
          <textarea
            name="description"
            value={restaurant.description}
            onChange={handleChange}
            rows={5}
            className="w-full p-2 border border-gray-300 rounded"
          ></textarea>
        </div>
        
        {/* 追加オプション */}
        <div>
          <h3 className="text-lg font-medium mb-4 pb-2 border-b">追加オプション</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={restaurant.featured}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                おすすめに設定
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="takes_reservations"
                name="takes_reservations"
                checked={restaurant.takes_reservations}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="takes_reservations" className="ml-2 text-sm text-gray-700">
                予約受付
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="reservation_required"
                name="reservation_required"
                checked={restaurant.reservation_required}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="reservation_required" className="ml-2 text-sm text-gray-700">
                予約必須
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="serves_alcohol"
                name="serves_alcohol"
                checked={restaurant.serves_alcohol}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="serves_alcohol" className="ml-2 text-sm text-gray-700">
                アルコール提供あり
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="vegetarian_options"
                name="vegetarian_options"
                checked={restaurant.vegetarian_options}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="vegetarian_options" className="ml-2 text-sm text-gray-700">
                ベジタリアンメニューあり
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="vegan_options"
                name="vegan_options"
                checked={restaurant.vegan_options}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="vegan_options" className="ml-2 text-sm text-gray-700">
                ビーガンメニューあり
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="gluten_free_options"
                name="gluten_free_options"
                checked={restaurant.gluten_free_options}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="gluten_free_options" className="ml-2 text-sm text-gray-700">
                グルテンフリーメニューあり
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="has_wifi"
                name="has_wifi"
                checked={restaurant.has_wifi}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="has_wifi" className="ml-2 text-sm text-gray-700">
                Wi-Fiあり
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="has_parking"
                name="has_parking"
                checked={restaurant.has_parking}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="has_parking" className="ml-2 text-sm text-gray-700">
                駐車場あり
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_accessible"
                name="is_accessible"
                checked={restaurant.is_accessible}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="is_accessible" className="ml-2 text-sm text-gray-700">
                バリアフリー対応
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_family_friendly"
                name="is_family_friendly"
                checked={restaurant.is_family_friendly}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="is_family_friendly" className="ml-2 text-sm text-gray-700">
                ファミリー向け
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_pet_friendly"
                name="is_pet_friendly"
                checked={restaurant.is_pet_friendly}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="is_pet_friendly" className="ml-2 text-sm text-gray-700">
                ペット可
              </label>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {saving ? '保存中...' : '保存する'}
          </button>
        </div>
      </form>
    </div>
  );
} 