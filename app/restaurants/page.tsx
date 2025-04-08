// サーバーコンポーネント
import { createClient } from '@supabase/supabase-js';
import RestaurantsClient from './components/restaurants-client';
import { Restaurant } from '@/types/restaurant';
import { Metadata } from 'next';

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
    
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('レストラン情報の取得エラー:', error);
      return [];
    }
    
    return data || [];
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
    <main className="max-w-md mx-auto bg-background pb-20">
      <RestaurantsClient restaurants={restaurants} />
    </main>
  );
}