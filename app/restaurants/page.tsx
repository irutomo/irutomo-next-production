// サーバーコンポーネント
import { createClient } from '@supabase/supabase-js';
import RestaurantsClient from './components/restaurants-client';
import { Restaurant } from '@/types/restaurant';
import { Metadata } from 'next';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'レストラン一覧 | IRUTOMO',
  description: '日本の人気レストラン一覧をご覧ください',
};

// レストラン情報をSupabaseから直接取得する関数
async function getRestaurants() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    // 匿名キーでSupabaseクライアントを作成
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // 言語設定を取得
    const cookieStore = await cookies();
    const language = cookieStore.get('language')?.value || 'ja';
    
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('is_active', true);
    
    if (error) {
      console.error('レストラン情報の取得エラー:', error);
      return [];
    }
    
    // 言語に応じた情報を返す
    return data.map(restaurant => ({
      ...restaurant,
      name: language === 'ko' ? restaurant.korean_name || restaurant.name : restaurant.name,
      description: language === 'ko' ? restaurant.korean_description || restaurant.description : restaurant.description,
      address: language === 'ko' ? restaurant.korean_address || restaurant.address : restaurant.address,
      cuisine: language === 'ko' ? restaurant.korean_cuisine || restaurant.cuisine : restaurant.cuisine,
    })) || [];
  } catch (error) {
    console.error('レストラン情報の取得中にエラーが発生しました:', error);
    return [];
  }
}

// サーバーコンポーネントとしてページを実装
export default async function RestaurantsPage() {
  // サーバーサイドでデータを取得
  const restaurants = await getRestaurants();
  
  return (
    <div className="min-h-screen bg-background">
      <RestaurantsClient restaurants={restaurants} />
    </div>
  );
}