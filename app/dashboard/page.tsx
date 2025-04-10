import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createServerSupabaseClient } from "@/app/lib/supabase";

export const metadata = {
  title: "マイダッシュボード | IRUTOMO - 日本の飲食店予約サービス",
  description: "IRUTOMOのマイダッシュボードでレストランの予約やレビュー履歴を管理しましょう。",
};

export const revalidate = 0; // 常に最新データを取得

// 型定義を追加
type Restaurant = {
  id: string;
  name: string;
  image_url?: string;
  location?: string;
};

interface ReservationWithRestaurant {
  id: string;
  restaurant_id: string;
  date: string;
  time: string;
  guests: number;
  status: string;
  created_at: string;
  restaurant: Restaurant;
}

interface ReviewWithRestaurant {
  id: string;
  restaurant_id: string;
  restaurant_name?: string;
  rating: number;
  content: string;
  created_at: string;
  restaurant: Restaurant;
}

interface FavoriteWithRestaurant {
  id: string;
  restaurant_id: string;
  created_at: string;
  restaurant: Restaurant;
}

export default async function DashboardPage() {
  // Supabaseクライアントの初期化
  const supabase = await createServerSupabaseClient();
  
  // ユーザーのセッション情報を取得
  const { data: { session } } = await supabase.auth.getSession();
  
  // 未ログインの場合はログインページにリダイレクト
  if (!session) {
    redirect("/auth/sign-in?returnTo=/dashboard");
  }
  
  const userId = session.user.id;
  
  // ユーザープロフィール情報を取得
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  
  // 予約履歴を取得（最新5件）
  const { data: rawReservations } = await supabase
    .from("reservations")
    .select(`
      id,
      restaurant_id,
      reservation_date,
      reservation_time,
      number_of_people,
      status,
      created_at,
      restaurant:restaurants(
        id,
        name,
        image_url
      )
    `)
    .eq("user_id", userId)
    .order("reservation_date", { ascending: false })
    .limit(5);
  
  // 予約データをフロントエンド表示用に変換
  const reservations = rawReservations?.map(res => {
    // nestedオブジェクトの処理
    let restaurant = null;
    if (res.restaurant && !Array.isArray(res.restaurant)) {
      restaurant = res.restaurant;
    } else if (Array.isArray(res.restaurant) && res.restaurant.length > 0) {
      restaurant = res.restaurant[0];
    }
    
    return {
      id: res.id,
      restaurant_id: res.restaurant_id,
      date: res.reservation_date,
      time: res.reservation_time,
      guests: res.number_of_people,
      status: res.status,
      created_at: res.created_at,
      restaurant
    };
  });
  
  // レビュー履歴を取得（最新5件）
  const { data: rawReviews } = await supabase
    .from("reviews")
    .select(`
      id,
      restaurant_id,
      restaurant_name,
      rating,
      content,
      created_at,
      restaurant:restaurants(
        id,
        name,
        image_url
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);
  
  // レビューデータを整形
  const reviews = rawReviews?.map(rev => {
    // nestedオブジェクトの処理
    let restaurant = null;
    if (rev.restaurant && !Array.isArray(rev.restaurant)) {
      restaurant = rev.restaurant;
    } else if (Array.isArray(rev.restaurant) && rev.restaurant.length > 0) {
      restaurant = rev.restaurant[0];
    }
    
    return {
      ...rev,
      restaurant
    };
  });
  
  // ユーザーのお気に入りレストラン
  const { data: rawFavorites } = await supabase
    .from("favorites")
    .select(`
      id,
      restaurant_id,
      created_at,
      restaurant:restaurants(
        id,
        name,
        image_url,
        location
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(3);
  
  // お気に入りデータを整形
  const favorites = rawFavorites?.map(fav => {
    // nestedオブジェクトの処理
    let restaurant = null;
    if (fav.restaurant && !Array.isArray(fav.restaurant)) {
      restaurant = fav.restaurant;
    } else if (Array.isArray(fav.restaurant) && fav.restaurant.length > 0) {
      restaurant = fav.restaurant[0];
    }
    
    return {
      ...fav,
      restaurant
    };
  });
  
  // 表示名の設定（優先順位: 名前 > メール > ID）
  const displayName = 
    profile?.full_name || 
    session.user.user_metadata?.full_name || 
    session.user.email?.split('@')[0] || 
    '会員';
  
  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">マイダッシュボード</h1>
      
      {/* ユーザープロフィール */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 relative">
            {profile?.avatar_url || session.user.user_metadata?.avatar_url ? (
              <Image 
                src={profile?.avatar_url || session.user.user_metadata?.avatar_url} 
                alt={displayName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-700 text-2xl font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              {displayName}
            </h2>
            <p className="text-gray-600">{session.user.email}</p>
          </div>
          
          <div className="ml-auto">
            <Link 
              href="/dashboard/profile" 
              className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md transition-colors"
            >
              プロフィール編集
            </Link>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <h3 className="font-medium text-lg mb-2">アカウント情報</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">メールアドレス</p>
              <p>{session.user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ユーザーID</p>
              <p className="truncate">{userId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">アカウント作成日</p>
              <p>{new Date(session.user.created_at).toLocaleDateString('ja-JP')}</p>
            </div>
            {profile?.phone && (
              <div>
                <p className="text-sm text-gray-500">電話番号</p>
                <p>{profile.phone}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 予約履歴セクション */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">最近の予約</h2>
          <Link 
            href="/dashboard/reservations" 
            className="text-sm text-primary-600 hover:underline"
          >
            全ての予約を見る
          </Link>
        </div>
        
        {reservations && reservations.length > 0 ? (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="border-b pb-4 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">
                      {reservation.restaurant?.name || "不明なレストラン"}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {new Date(reservation.date).toLocaleDateString('ja-JP')} {reservation.time}
                      {' • '}{reservation.guests}名
                    </p>
                  </div>
                  <div>
                    <span 
                      className={`text-xs px-2 py-1 rounded-full ${
                        reservation.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : reservation.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {reservation.status === 'confirmed' ? '予約確定' 
                        : reservation.status === 'pending' ? '確認待ち' 
                        : 'キャンセル'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-6">最近の予約はありません</p>
        )}
      </div>
      
      {/* レビュー履歴 */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">レビュー履歴</h3>
          <Link 
            href="/dashboard/reviews" 
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            すべて見る
          </Link>
        </div>
        
        {reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-0 last:pb-0">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <h4 className="font-medium">
                      {review.restaurant?.name || review.restaurant_name || "不明なレストラン"}
                    </h4>
                    <div className="flex items-center text-yellow-400 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{review.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(review.created_at).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-6">投稿したレビューはありません</p>
        )}
      </div>
      
      {/* お気に入りレストラン */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">お気に入りレストラン</h3>
          <Link 
            href="/dashboard/favorites" 
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            すべて見る
          </Link>
        </div>
        
        {favorites && favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((favorite) => (
              <Link 
                key={favorite.id} 
                href={`/restaurants/${favorite.restaurant_id}`}
                className="block hover:shadow-md transition-shadow rounded-lg overflow-hidden"
              >
                <div className="aspect-w-16 aspect-h-9 relative h-40">
                  <Image
                    src={favorite.restaurant?.image_url || "/images/restaurant-placeholder.jpg"}
                    alt={favorite.restaurant?.name || "レストラン"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-3">
                  <h4 className="font-medium">{favorite.restaurant?.name || "不明なレストラン"}</h4>
                  <p className="text-sm text-gray-600">{favorite.restaurant?.location || ""}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-6">登録したお気に入りはありません</p>
        )}
      </div>
    </div>
  );
} 