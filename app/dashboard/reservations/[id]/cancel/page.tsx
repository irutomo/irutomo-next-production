import { redirect, notFound } from "next/navigation";
import CancelReservationForm from "./cancel-form";
import Link from "next/link";
import { createServerSupabaseClient } from "@/app/lib/supabase";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "予約キャンセル | マイダッシュボード | IRUTOMO",
  description: "IRUTOMOでの予約キャンセル手続きができます。",
};

export const revalidate = 0; // 常に最新データを取得

// 型定義
type Restaurant = {
  id: string;
  name: string;
  korean_name?: string;
  image_url?: string;
};

interface Reservation {
  id: string;
  restaurant_id: string;
  reservation_date: string;
  reservation_time: string;
  number_of_people: number;
  status: string;
  payment_status: string;
  guest_name: string;
  restaurant?: Restaurant | null;
}

export default async function CancelReservationPage({ 
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
      guest_name,
      restaurant:restaurants(
        id,
        name,
        korean_name,
        image_url
      )
    `)
    .eq("id", reservationId)
    .eq("user_id", userId)
    .single();
  
  if (error || !reservation) {
    console.error("予約データの取得に失敗しました:", error);
    return notFound();
  }
  
  // すでにキャンセル済みの場合はリダイレクト
  if (reservation.status === 'canceled') {
    redirect(`/dashboard/reservations/${reservationId}`);
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
  
  // 今後の予約かどうか確認
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const reservationDate = new Date(reservationData.reservation_date);
  reservationDate.setHours(0, 0, 0, 0);
  const isUpcoming = reservationDate >= today;
  
  // 過去の予約はキャンセルできない
  if (!isUpcoming) {
    redirect(`/dashboard/reservations/${reservationId}`);
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">予約キャンセル</h1>
        <Link 
          href={`/dashboard/reservations/${reservationId}`} 
          className="text-primary-600 hover:underline"
        >
          予約詳細に戻る
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold mb-4">キャンセルする予約</h2>
          
          <div className="space-y-2">
            <p>
              <span className="font-medium">レストラン: </span>
              {reservationData.restaurant?.name || "不明なレストラン"}
            </p>
            
            <p>
              <span className="font-medium">予約日時: </span>
              {formatDate(reservationData.reservation_date)} {reservationData.reservation_time}
            </p>
            
            <p>
              <span className="font-medium">人数: </span>
              {reservationData.number_of_people}人
            </p>
            
            <p>
              <span className="font-medium">予約者: </span>
              {reservationData.guest_name}
            </p>
          </div>
        </div>
        
        <div className="p-6">
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
            <p className="text-amber-800 font-medium">注意事項</p>
            <ul className="list-disc ml-5 mt-2 text-sm text-amber-700 space-y-1">
              <li>予約キャンセルは当日キャンセルにあたる場合、キャンセル料が発生する場合があります。</li>
              <li>キャンセル後の復元はできません。慎重に選択してください。</li>
              <li>支払い済みの場合、返金処理には数日かかることがあります。</li>
            </ul>
          </div>
          
          <CancelReservationForm 
            reservationId={reservationId} 
            restaurantName={reservationData.restaurant?.name || "不明なレストラン"}
            reservationDate={reservationData.reservation_date}
            reservationTime={reservationData.reservation_time}
          />
        </div>
      </div>
    </div>
  );
} 