// サーバーコンポーネント
import { createClient } from '@supabase/supabase-js';
import RestaurantsClient from './components/restaurants-client';
import { Restaurant } from '@/types/restaurant';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '레스토랑 목록 | 이루토모',
  description: '일본의 인기 레스토랑 목록을 확인해 보세요',
};

// レストラン情報をSupabaseから直接取得する関数
async function getRestaurants(language: 'ja' | 'ko' = 'ja') {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    // 匿名キーでSupabaseクライアントを作成
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
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
export default async function RestaurantsPage({
  params,
  searchParams,
}: {
  params: Promise<Record<string, never>>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // URLパラメータから言語設定を取得（例: /restaurants?lang=ko）
  // 有効な値は'ja'または'ko'のみ、それ以外は'ja'を使用
  const resolvedSearchParams = await searchParams;
  const lang = resolvedSearchParams?.lang || '';
  const language = (typeof lang === 'string' && lang === 'ko' ? 'ko' : 'ja') as 'ja' | 'ko';
  
  // サーバーサイドでデータを取得
  const restaurants = await getRestaurants(language);
  
  return (
    <div className="min-h-screen bg-background">
      <RestaurantsClient restaurants={restaurants} />
    </div>
  );
}