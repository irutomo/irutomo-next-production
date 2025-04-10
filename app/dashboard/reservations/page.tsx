import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createServerSupabaseClient } from "@/app/lib/supabase";
import { getReservationStatusText, getPaymentStatusText } from "@/lib/utils";

export const metadata = {
  title: "予約一覧 | マイダッシュボード | IRUTOMO",
  description: "IRUTOMOでのあなたの予約履歴をすべて管理できます。",
};

export const revalidate = 0; // 常に最新データを取得

// 型定義
type Restaurant = {
  id: string;
  name: string;
  korean_name?: string;
  image_url?: string;
  location?: string;
};

interface Reservation {
  id: string;
  restaurant_id: string;
  reservation_date: string;
  reservation_time: string;
  number_of_people: number;
  status: string;
  payment_status: string;
  payment_amount: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  created_at: string;
  restaurant?: Restaurant | null;
  notes?: string;
}

export default async function ReservationsPage() {
  // Supabaseクライアントの初期化
  const supabase = await createServerSupabaseClient();
  
  // ユーザーのセッション情報を取得
  const { data: { session } } = await supabase.auth.getSession();
  
  // 未ログインの場合はログインページにリダイレクト
  if (!session) {
    redirect("/auth/sign-in?returnTo=/dashboard/reservations");
  }
  
  const userId = session.user.id;
  
  // 予約一覧を取得
  const { data: rawReservations, error } = await supabase
    .from("reservations")
    .select(`
      id,
      restaurant_id,
      reservation_date,
      reservation_time,
      number_of_people,
      status,
      payment_status,
      payment_amount,
      guest_name,
      guest_email,
      guest_phone,
      notes,
      created_at,
      restaurant:restaurants(
        id,
        name,
        korean_name,
        image_url
      )
    `)
    .eq("user_id", userId)
    .order("reservation_date", { ascending: false });
  
  if (error) {
    console.error("予約データの取得に失敗しました:", error);
  }
  
  // 予約データをフォーマット
  const reservations = rawReservations?.map(res => {
    // nestedオブジェクトの処理
    let restaurant = null;
    if (res.restaurant && !Array.isArray(res.restaurant)) {
      restaurant = res.restaurant;
    } else if (Array.isArray(res.restaurant) && res.restaurant.length > 0) {
      restaurant = res.restaurant[0];
    }
    
    return {
      ...res,
      restaurant
    } as Reservation;
  }) || [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 今後の予約と過去の予約に分ける
  const upcomingReservations = reservations.filter(r => {
    const reservationDate = new Date(r.reservation_date);
    reservationDate.setHours(0, 0, 0, 0);
    return reservationDate >= today;
  });

  const pastReservations = reservations.filter(r => {
    const reservationDate = new Date(r.reservation_date);
    reservationDate.setHours(0, 0, 0, 0);
    return reservationDate < today;
  });

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">予約一覧</h1>
        <Link 
          href="/dashboard" 
          className="text-primary-600 hover:underline"
        >
          ダッシュボードに戻る
        </Link>
      </div>

      {/* 予約がない場合 */}
      {reservations.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-xl font-medium text-gray-500 mb-4">予約がありません</p>
          <Link 
            href="/restaurants" 
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white rounded-md py-2 px-6 transition-colors"
          >
            レストランを探す
          </Link>
        </div>
      )}

      {/* 今後の予約 */}
      {upcomingReservations.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">今後の予約</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="grid grid-cols-1 divide-y divide-gray-200">
              {upcomingReservations.map((reservation) => (
                <ReservationItem 
                  key={reservation.id} 
                  reservation={reservation} 
                  isUpcoming={true} 
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 過去の予約 */}
      {pastReservations.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">過去の予約</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="grid grid-cols-1 divide-y divide-gray-200">
              {pastReservations.map((reservation) => (
                <ReservationItem 
                  key={reservation.id} 
                  reservation={reservation} 
                  isUpcoming={false} 
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 予約アイテムコンポーネント
function ReservationItem({ 
  reservation, 
  isUpcoming 
}: { 
  reservation: Reservation, 
  isUpcoming: boolean 
}) {
  // 日付をフォーマット
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'short'
    });
  };

  // 予約ステータスのテキストとカラーを取得
  const statusInfo = getReservationStatusText(reservation.status);
  const paymentStatusInfo = getPaymentStatusText(reservation.payment_status);

  return (
    <div className="p-6">
      <div className="flex flex-wrap md:flex-nowrap gap-6">
        {/* レストラン画像 */}
        <div className="w-full md:w-32 h-24 rounded-md overflow-hidden bg-gray-200 relative flex-shrink-0">
          {reservation.restaurant?.image_url ? (
            <Image
              src={reservation.restaurant.image_url}
              alt={reservation.restaurant.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500">
              写真なし
            </div>
          )}
        </div>
        
        {/* 予約詳細 */}
        <div className="flex-grow">
          {/* レストラン名 */}
          <h3 className="font-semibold text-xl mb-2">
            <Link 
              href={`/restaurants/${reservation.restaurant_id}`}
              className="hover:text-primary-600 transition-colors"
            >
              {reservation.restaurant?.name || "不明なレストラン"}
            </Link>
          </h3>
          
          {/* 予約情報 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div>
              <span className="text-gray-500">日時: </span>
              <span>{formatDate(reservation.reservation_date)} {reservation.reservation_time}</span>
            </div>
            <div>
              <span className="text-gray-500">人数: </span>
              <span>{reservation.number_of_people}人</span>
            </div>
            <div>
              <span className="text-gray-500">予約者: </span>
              <span>{reservation.guest_name}</span>
            </div>
            <div>
              <span className="text-gray-500">予約番号: </span>
              <span className="font-mono">{reservation.id.substring(0, 8)}</span>
            </div>
          </div>
          
          {/* ステータスと日付 */}
          <div className="mt-4 flex flex-wrap justify-between items-center gap-2">
            <div className="flex flex-wrap gap-2">
              <span 
                className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.colorClass}`}
              >
                {statusInfo.text}
              </span>
              
              <span 
                className={`px-2 py-1 rounded-full text-xs font-medium ${paymentStatusInfo.colorClass}`}
              >
                {paymentStatusInfo.text}
              </span>
            </div>
            
            <div className="text-xs text-gray-500">
              予約日: {new Date(reservation.created_at).toLocaleDateString('ja-JP')}
            </div>
          </div>
          
          {/* ノート */}
          {reservation.notes && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
              <span className="text-gray-500 font-medium">メモ: </span>
              {reservation.notes}
            </div>
          )}
          
          {/* アクション */}
          <div className="mt-4 flex justify-end gap-2">
            {isUpcoming && reservation.status !== 'canceled' && (
              <Link 
                href={`/dashboard/reservations/${reservation.id}/cancel`}
                className="px-3 py-1.5 text-sm border border-red-300 text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                キャンセル
              </Link>
            )}
            
            <Link 
              href={`/dashboard/reservations/${reservation.id}`}
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
            >
              詳細
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 