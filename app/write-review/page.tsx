import Image from 'next/image';
import Link from 'next/link';
import ReviewForm from './components/review-form';
import { createServerSupabaseClient } from '@/app/lib/supabase';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'レビューを書く | IRUTOMO - 日本の飲食店予約サービス',
  description: 'IRUTOMOで利用した日本の飲食店の体験をシェアしましょう。あなたのレビューが他の利用者の参考になります。',
};

export default async function WriteReviewPage(props: any) {
  // URLクエリパラメータからレストランIDを取得
  const restaurantId = props.searchParams.restaurantId as string;
  const reservationId = props.searchParams.reservationId as string;

  // Supabaseクライアントの初期化
  const supabase = await createServerSupabaseClient();
  
  // ユーザーがログインしているか確認
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    // ログインページにリダイレクト
    redirect('/sign-in?returnTo=/write-review' + (restaurantId ? `?restaurantId=${restaurantId}` : ''));
  }
  
  // レストランIDがある場合、レストラン情報を取得
  let restaurant = null;
  if (restaurantId) {
    const { data } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', restaurantId)
      .single();
    
    restaurant = data;
  }
  
  // 料理カテゴリの取得
  const { data: cuisines } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  
  return (
    <div className="min-h-screen bg-white">
      {/* ページタイトル */}
      <div className="bg-primary-50 py-12 border-b">
        <div className="container max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center text-primary-700">レビューを書く</h1>
          <p className="text-center text-primary-600 mt-3">あなたの体験をシェアしましょう</p>
          {restaurant && (
            <p className="text-center font-medium mt-2">
              {restaurant.name}へのレビューを書いています
            </p>
          )}
        </div>
      </div>

      {/* フォーム */}
      <section className="py-12">
        <div className="container max-w-3xl mx-auto px-4">
          <ReviewForm 
            restaurantId={restaurantId} 
            restaurant={restaurant}
            cuisines={cuisines || []}
          />
        </div>
      </section>
    </div>
  );
} 