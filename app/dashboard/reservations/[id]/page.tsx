import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createServerSupabaseClient } from "@/app/lib/supabase";
import { 
  getReservationStatusText, 
  getPaymentStatusText,
  formatDate,
  formatPrice
} from "@/lib/utils";

export const metadata = {
  title: "予約詳細 | マイダッシュボード | IRUTOMO",
  description: "IRUTOMOでの予約詳細情報を確認できます。",
};

export const revalidate = 0; // 常に最新データを取得

// 型定義
type Restaurant = {
  id: string;
  name: string;
  korean_name?: string;
  image_url?: string;
  address?: string;
  phone_number?: string;
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
  updated_at: string;
  paid_at: string | null;
  restaurant?: Restaurant | null;
  notes?: string;
  payment_method?: string;
  payment_provider?: string;
  cancel_reason?: string;
}

export default async function ReservationDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  // Supabaseクライアントの初期化
  const supabase = await createServerSupabaseClient();
  
  // ユーザーのセッション情報を取得
  const { data: { session } } = await supabase.auth.getSession();
  
  // 未ログインの場合はログインページにリダイレクト
  if (!session) {
    redirect("/auth/sign-in?returnTo=/dashboard/reservations");
  }
  
  const userId = session.user.id;
  const reservationId = params.id;
  
  // 予約詳細を取得
  const { data: reservation, error } = await supabase
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
      payment_method,
      payment_provider,
      guest_name,
      guest_email,
      guest_phone,
      notes,
      cancel_reason,
      created_at,
      updated_at,
      paid_at,
      restaurant:restaurants(
        id,
        name,
        korean_name,
        image_url,
        address,
        phone_number
      )
    `)
    .eq("id", reservationId)
    .eq("user_id", userId)
    .single();
  
  if (error || !reservation) {
    console.error("予約データの取得に失敗しました:", error);
    return notFound();
  }
  
  // レストラン情報の処理
  let restaurantData = null;
  if (reservation.restaurant && !Array.isArray(reservation.restaurant)) {
    restaurantData = reservation.restaurant;
  } else if (Array.isArray(reservation.restaurant) && reservation.restaurant.length > 0) {
    restaurantData = reservation.restaurant[0];
  }
  
  const reservationData: Reservation = {
    ...reservation,
    restaurant: restaurantData
  };
  
  // 予約ステータスのテキストとカラーを取得
  const statusInfo = getReservationStatusText(reservationData.status);
  const paymentStatusInfo = getPaymentStatusText(reservationData.payment_status);
  
  // 今後の予約かどうか
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const reservationDate = new Date(reservationData.reservation_date);
  reservationDate.setHours(0, 0, 0, 0);
  const isUpcoming = reservationDate >= today;
  const canCancel = isUpcoming && reservationData.status !== 'canceled';

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">予約詳細</h1>
        <Link 
          href="/dashboard/reservations" 
          className="text-primary-600 hover:underline"
        >
          予約一覧に戻る
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* 予約ステータスバナー */}
        <div className={`p-4 text-center text-white font-medium ${statusInfo.colorClass.replace('bg-yellow-100 text-yellow-800', 'bg-yellow-500 text-white').replace('bg-green-100 text-green-800', 'bg-green-600 text-white').replace('bg-red-100 text-red-800', 'bg-red-600 text-white').replace('bg-blue-100 text-blue-800', 'bg-blue-600 text-white').replace('bg-gray-100 text-gray-800', 'bg-gray-600 text-white')}`}>
          現在の予約状況: {statusInfo.text}
        </div>
        
        {/* レストラン情報 */}
        <div className="p-6 border-b">
          <div className="flex flex-wrap md:flex-nowrap gap-6">
            {/* レストラン画像 */}
            <div className="w-full md:w-40 h-32 rounded-md overflow-hidden bg-gray-200 relative flex-shrink-0">
              {reservationData.restaurant?.image_url ? (
                <Image
                  src={reservationData.restaurant.image_url}
                  alt={reservationData.restaurant.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500">
                  写真なし
                </div>
              )}
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold mb-2">
                <Link 
                  href={`/restaurants/${reservationData.restaurant_id}`}
                  className="hover:text-primary-600 transition-colors"
                >
                  {reservationData.restaurant?.name || "不明なレストラン"}
                </Link>
              </h2>
              
              {reservationData.restaurant?.address && (
                <p className="text-gray-600 mb-2">
                  <span className="font-medium">住所: </span>
                  {reservationData.restaurant.address}
                </p>
              )}
              
              {reservationData.restaurant?.phone_number && (
                <p className="text-gray-600">
                  <span className="font-medium">電話番号: </span>
                  {reservationData.restaurant.phone_number}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* 予約情報 */}
        <div className="p-6 grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">予約情報</h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">予約番号</p>
                <p className="font-mono">{reservationData.id}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">予約日時</p>
                <p className="font-medium">
                  {formatDate(reservationData.reservation_date)} {reservationData.reservation_time}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">人数</p>
                <p>{reservationData.number_of_people}人</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">予約作成日</p>
                <p>{new Date(reservationData.created_at).toLocaleDateString('ja-JP')}</p>
              </div>
              
              {reservationData.updated_at && reservationData.updated_at !== reservationData.created_at && (
                <div>
                  <p className="text-sm text-gray-500">最終更新日</p>
                  <p>{new Date(reservationData.updated_at).toLocaleDateString('ja-JP')}</p>
                </div>
              )}
              
              {reservationData.status === 'canceled' && reservationData.cancel_reason && (
                <div>
                  <p className="text-sm text-gray-500">キャンセル理由</p>
                  <p className="text-red-600">{reservationData.cancel_reason}</p>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">お客様情報</h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">お名前</p>
                <p>{reservationData.guest_name}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">メールアドレス</p>
                <p>{reservationData.guest_email}</p>
              </div>
              
              {reservationData.guest_phone && (
                <div>
                  <p className="text-sm text-gray-500">電話番号</p>
                  <p>{reservationData.guest_phone}</p>
                </div>
              )}
            </div>
            
            <h3 className="text-lg font-semibold mt-6 mb-4 border-b pb-2">支払い情報</h3>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium mr-2 ${paymentStatusInfo.colorClass}`}>
                  {paymentStatusInfo.text}
                </span>
                
                {reservationData.payment_amount > 0 && (
                  <p className="font-medium">
                    {formatPrice(reservationData.payment_amount)}
                  </p>
                )}
              </div>
              
              {reservationData.payment_method && (
                <div>
                  <p className="text-sm text-gray-500">支払い方法</p>
                  <p>{reservationData.payment_method}</p>
                </div>
              )}
              
              {reservationData.payment_provider && (
                <div>
                  <p className="text-sm text-gray-500">決済プロバイダ</p>
                  <p>{reservationData.payment_provider}</p>
                </div>
              )}
              
              {reservationData.paid_at && (
                <div>
                  <p className="text-sm text-gray-500">支払い日時</p>
                  <p>{new Date(reservationData.paid_at).toLocaleDateString('ja-JP', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* 追加メモ */}
        {reservationData.notes && (
          <div className="px-6 pb-6">
            <h3 className="text-lg font-semibold mb-2">メモ</h3>
            <div className="p-3 bg-gray-50 rounded">
              {reservationData.notes}
            </div>
          </div>
        )}
        
        {/* アクションボタン */}
        <div className="p-6 bg-gray-50 flex justify-end gap-3">
          {canCancel && (
            <Link 
              href={`/dashboard/reservations/${reservationData.id}/cancel`}
              className="px-4 py-2 bg-white border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
            >
              予約をキャンセルする
            </Link>
          )}
          
          <Link 
            href="/dashboard/reservations"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            戻る
          </Link>
        </div>
      </div>
    </div>
  );
} 