'use client';

import { useState, FormEvent } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Restaurant = {
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

export default function NewRestaurantPage() {
  const router = useRouter();
  
  const [restaurant, setRestaurant] = useState<Restaurant>({
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
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  const supabase = createClientComponentClient();

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
      const { data, error } = await supabase
        .from('restaurants')
        .insert(restaurant)
        .select();
      
      if (error) throw error;
      
      setSuccess('レストランを追加しました');
      
      // 詳細ページに遷移
      if (data && data.length > 0) {
        setTimeout(() => {
          router.push(`/admin/restaurants/${data[0].id}`);
        }, 1500);
      } else {
        // 一覧に戻る
        setTimeout(() => {
          router.push('/admin/restaurants');
        }, 1500);
      }
    } catch (error: any) {
      console.error('追加エラー:', error);
      setError(error.message || '追加に失敗しました');
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">新規レストラン追加</h2>
        <div className="flex space-x-2">
          <Link 
            href="/admin/restaurants" 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
          >
            キャンセル
          </Link>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9v4a1 1 0 102 0V9a1 1 0 10-2 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium border-b pb-2 mb-4">基本情報</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                店舗名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={restaurant.name}
                onChange={handleChange}
                className={`w-full rounded-md border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50`}
                required
              />
              {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="cuisine_type">
                料理タイプ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="cuisine_type"
                name="cuisine_type"
                value={restaurant.cuisine_type}
                onChange={handleChange}
                className={`w-full rounded-md border ${formErrors.cuisine_type ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50`}
                required
              />
              {formErrors.cuisine_type && <p className="mt-1 text-sm text-red-600">{formErrors.cuisine_type}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="address">
                住所 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={restaurant.address}
                onChange={handleChange}
                className={`w-full rounded-md border ${formErrors.address ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50`}
                required
              />
              {formErrors.address && <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone_number">
                電話番号
              </label>
              <input
                type="text"
                id="phone_number"
                name="phone_number"
                value={restaurant.phone_number || ''}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                メールアドレス
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={restaurant.email || ''}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="website">
                Webサイト
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={restaurant.website || ''}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="price_range">
                価格帯
              </label>
              <select
                id="price_range"
                name="price_range"
                value={restaurant.price_range || ''}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              >
                <option value="">選択してください</option>
                <option value="¥">¥ (リーズナブル)</option>
                <option value="¥¥">¥¥ (普通)</option>
                <option value="¥¥¥">¥¥¥ (高め)</option>
                <option value="¥¥¥¥">¥¥¥¥ (高級)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="opening_hours">
                営業時間
              </label>
              <input
                type="text"
                id="opening_hours"
                name="opening_hours"
                value={restaurant.opening_hours || ''}
                onChange={handleChange}
                placeholder="例: 11:00-15:00, 17:00-21:00"
                className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="rating">
                評価 (0-5)
              </label>
              <input
                type="number"
                id="rating"
                name="rating"
                min="0"
                max="5"
                step="0.1"
                value={restaurant.rating || 0}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="status">
                ステータス
              </label>
              <select
                id="status"
                name="status"
                value={restaurant.status || 'active'}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              >
                <option value="active">公開中</option>
                <option value="inactive">非公開</option>
                <option value="pending">審査中</option>
              </select>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium border-b pb-2 mb-4">詳細情報</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
                説明
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={restaurant.description || ''}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="banner_url">
                  バナー画像URL
                </label>
                <input
                  type="url"
                  id="banner_url"
                  name="banner_url"
                  value={restaurant.banner_url || ''}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="logo_url">
                  ロゴ画像URL
                </label>
                <input
                  type="url"
                  id="logo_url"
                  name="logo_url"
                  value={restaurant.logo_url || ''}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="menu_url">
                  メニューURL
                </label>
                <input
                  type="url"
                  id="menu_url"
                  name="menu_url"
                  value={restaurant.menu_url || ''}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={restaurant.featured || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                  おすすめに表示
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="serves_alcohol"
                  name="serves_alcohol"
                  checked={restaurant.serves_alcohol || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="serves_alcohol" className="ml-2 block text-sm text-gray-900">
                  アルコール提供
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="takes_reservations"
                  name="takes_reservations"
                  checked={restaurant.takes_reservations || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="takes_reservations" className="ml-2 block text-sm text-gray-900">
                  予約受付
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="reservation_required"
                  name="reservation_required"
                  checked={restaurant.reservation_required || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="reservation_required" className="ml-2 block text-sm text-gray-900">
                  予約必須
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="vegetarian_options"
                  name="vegetarian_options"
                  checked={restaurant.vegetarian_options || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="vegetarian_options" className="ml-2 block text-sm text-gray-900">
                  ベジタリアンメニューあり
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="vegan_options"
                  name="vegan_options"
                  checked={restaurant.vegan_options || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="vegan_options" className="ml-2 block text-sm text-gray-900">
                  ビーガンメニューあり
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="gluten_free_options"
                  name="gluten_free_options"
                  checked={restaurant.gluten_free_options || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="gluten_free_options" className="ml-2 block text-sm text-gray-900">
                  グルテンフリーメニューあり
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="has_wifi"
                  name="has_wifi"
                  checked={restaurant.has_wifi || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="has_wifi" className="ml-2 block text-sm text-gray-900">
                  Wi-Fiあり
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="has_parking"
                  name="has_parking"
                  checked={restaurant.has_parking || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="has_parking" className="ml-2 block text-sm text-gray-900">
                  駐車場あり
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_accessible"
                  name="is_accessible"
                  checked={restaurant.is_accessible || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_accessible" className="ml-2 block text-sm text-gray-900">
                  バリアフリー
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_family_friendly"
                  name="is_family_friendly"
                  checked={restaurant.is_family_friendly || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_family_friendly" className="ml-2 block text-sm text-gray-900">
                  ファミリー向け
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_pet_friendly"
                  name="is_pet_friendly"
                  checked={restaurant.is_pet_friendly || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_pet_friendly" className="ml-2 block text-sm text-gray-900">
                  ペット可
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Link
            href="/admin/restaurants"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            キャンセル
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? '保存中...' : 'レストランを追加'}
          </button>
        </div>
      </form>
    </div>
  );
} 