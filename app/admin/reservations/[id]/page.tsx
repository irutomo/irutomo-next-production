'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ReservationActions from './actions';

type Reservation = {
  id: string;
  restaurant_id: string;
  user_id?: string;
  reservation_date: string;
  reservation_time: string;
  number_of_people: number;
  status: string;
  payment_status: string;
  payment_amount: number;
  payment_method?: string;
  payment_provider?: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  notes?: string;
  cancel_reason?: string;
  created_at: string;
  updated_at?: string;
  paid_at?: string;
  restaurant: {
    id: string;
    name: string;
    korean_name?: string;
    image_url?: string;
    address?: string;
    phone_number?: string;
  } | null;
};

// ステータスに対応するテキストとカラークラスを取得する関数
const getStatusInfo = (status: string) => {
  switch (status) {
    case 'confirmed':
      return { text: '確認済', colorClass: 'bg-green-100 text-green-800' };
    case 'pending':
      return { text: '未処理', colorClass: 'bg-yellow-100 text-yellow-800' };
    case 'completed':
      return { text: '完了', colorClass: 'bg-blue-100 text-blue-800' };
    case 'canceled':
      return { text: 'キャンセル', colorClass: 'bg-red-100 text-red-800' };
    default:
      return { text: status, colorClass: 'bg-gray-100 text-gray-800' };
  }
};

// 支払いステータスに対応するテキストとカラークラスを取得する関数
const getPaymentStatusInfo = (status: string) => {
  switch (status) {
    case 'paid':
      return { text: '支払い済', colorClass: 'bg-green-100 text-green-800' };
    case 'unpaid':
      return { text: '未払い', colorClass: 'bg-yellow-100 text-yellow-800' };
    case 'refunded':
      return { text: '返金済', colorClass: 'bg-blue-100 text-blue-800' };
    default:
      return { text: status, colorClass: 'bg-gray-100 text-gray-800' };
  }
};

// 日付をフォーマットする関数
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

// 金額をフォーマットする関数
const formatPrice = (price: number) => {
  return `${price.toLocaleString()}円`;
};

export default function AdminReservationDetailPage({ 
  params 
}: { 
  params: any
}) {
  // 状態の初期化
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();
  const id = typeof params === 'object' && params !== null ? params.id : null;

  useEffect(() => {
    if (!id) {
      setError('予約IDが見つかりません');
      setLoading(false);
      return;
    }

    // 予約データを取得する関数
    const fetchReservationData = async () => {
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

        // 予約詳細を取得
        const { data, error: reservationError } = await supabase
          .from("reservations")
          .select(`
            id,
            restaurant_id,
            user_id,
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
          .eq("id", id)
          .single();
        
        if (reservationError) {
          console.error("予約データの取得に失敗しました:", reservationError);
          setError("予約情報の取得中にエラーが発生しました");
          setLoading(false);
          return;
        }
        
        // レストラン情報の処理
        let restaurantData = null;
        if (data.restaurant && !Array.isArray(data.restaurant)) {
          restaurantData = data.restaurant;
        } else if (Array.isArray(data.restaurant) && data.restaurant.length > 0) {
          restaurantData = data.restaurant[0];
        }
        
        setReservation({
          ...data,
          restaurant: restaurantData
        });
        setLoading(false);
      } catch (err) {
        console.error('データ取得エラー:', err);
        setError('予期せぬエラーが発生しました');
        setLoading(false);
      }
    };

    fetchReservationData();
  }, [id, router, supabase]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p className="font-bold">エラー</p>
          <p>{error || '予約情報が見つかりませんでした'}</p>
        </div>
        <Link 
          href="/admin/reservations" 
          className="text-blue-600 hover:underline"
        >
          予約一覧に戻る
        </Link>
      </div>
    );
  }

  const statusInfo = getStatusInfo(reservation.status);
  const paymentStatusInfo = getPaymentStatusInfo(reservation.payment_status);

  // 今後の予約かどうか
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const reservationDate = new Date(reservation.reservation_date);
  reservationDate.setHours(0, 0, 0, 0);
  const isUpcoming = reservationDate >= today;

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">予約詳細</h1>
        <Link 
          href="/admin/reservations" 
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
            
            <div>
              <h2 className="text-2xl font-semibold mb-2">
                <Link 
                  href={`/admin/restaurants/${reservation.restaurant_id}`}
                  className="hover:text-primary-600 transition-colors"
                >
                  {reservation.restaurant?.name || "不明なレストラン"}
                </Link>
              </h2>
              
              {reservation.restaurant?.address && (
                <p className="text-gray-600 mb-2">
                  <span className="font-medium">住所: </span>
                  {reservation.restaurant.address}
                </p>
              )}
              
              {reservation.restaurant?.phone_number && (
                <p className="text-gray-600">
                  <span className="font-medium">電話番号: </span>
                  {reservation.restaurant.phone_number}
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
                <p className="font-mono">{reservation.id}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">予約日時</p>
                <p className="font-medium">
                  {formatDate(reservation.reservation_date)} {reservation.reservation_time}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">人数</p>
                <p>{reservation.number_of_people}人</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">予約作成日</p>
                <p>{new Date(reservation.created_at).toLocaleDateString('ja-JP')}</p>
              </div>
              
              {reservation.updated_at && reservation.updated_at !== reservation.created_at && (
                <div>
                  <p className="text-sm text-gray-500">最終更新日</p>
                  <p>{new Date(reservation.updated_at).toLocaleDateString('ja-JP')}</p>
                </div>
              )}
              
              {reservation.status === 'canceled' && reservation.cancel_reason && (
                <div>
                  <p className="text-sm text-gray-500">キャンセル理由</p>
                  <p className="text-red-600">{reservation.cancel_reason}</p>
                </div>
              )}

              {reservation.user_id && (
                <div>
                  <p className="text-sm text-gray-500">ユーザーID</p>
                  <Link href={`/admin/users/${reservation.user_id}`} className="text-blue-600 hover:underline">
                    {reservation.user_id}
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">お客様情報</h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">お名前</p>
                <p>{reservation.guest_name}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">メールアドレス</p>
                <p>{reservation.guest_email}</p>
              </div>
              
              {reservation.guest_phone && (
                <div>
                  <p className="text-sm text-gray-500">電話番号</p>
                  <p>{reservation.guest_phone}</p>
                </div>
              )}
            </div>
            
            <h3 className="text-lg font-semibold mt-6 mb-4 border-b pb-2">支払い情報</h3>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium mr-2 ${paymentStatusInfo.colorClass}`}>
                  {paymentStatusInfo.text}
                </span>
                
                {reservation.payment_amount > 0 && (
                  <p className="font-medium">
                    {formatPrice(reservation.payment_amount)}
                  </p>
                )}
              </div>
              
              {reservation.payment_method && (
                <div>
                  <p className="text-sm text-gray-500">支払い方法</p>
                  <p>{reservation.payment_method}</p>
                </div>
              )}
              
              {reservation.payment_provider && (
                <div>
                  <p className="text-sm text-gray-500">決済プロバイダ</p>
                  <p>{reservation.payment_provider}</p>
                </div>
              )}
              
              {reservation.paid_at && (
                <div>
                  <p className="text-sm text-gray-500">支払い日時</p>
                  <p>{new Date(reservation.paid_at).toLocaleDateString('ja-JP', { 
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
        {reservation.notes && (
          <div className="px-6 pb-6">
            <h3 className="text-lg font-semibold mb-2">メモ</h3>
            <div className="p-3 bg-gray-50 rounded">
              {reservation.notes}
            </div>
          </div>
        )}
        
        {/* 管理者用アクションボタン */}
        <ReservationActions 
          reservationId={reservation.id} 
          currentStatus={reservation.status} 
        />
      </div>
    </div>
  );
} 