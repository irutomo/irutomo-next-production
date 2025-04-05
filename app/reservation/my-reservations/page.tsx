import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase';
import { formatReservationDate } from '@/lib/utils';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '予約一覧 | イルトモ',
  description: 'あなたの予約一覧を確認しましょう。',
};

// 予約情報の取得
const getReservations = async () => {
  try {
    // Supabaseクライアントの取得
    const supabase = await createServerSupabaseClient();
    
    // 予約データの取得
    const { data, error } = await supabase
      .from('reservations')
      .select('*, restaurants(name)')
      .order('reservation_date', { ascending: false });
    
    if (error) {
      console.error('予約データ取得エラー:', error);
      return { error: '予約データの取得中にエラーが発生しました', reservations: [] };
    }

    // 予約データを整形
    const formattedReservations = data.map(reservation => {
      // 支払い状態の判定
      const isPaid = reservation.payment_status === 'paid' || reservation.payment_status === 'completed';
      
      // 返金ポリシーの計算 (人数に応じた料金計算)
      let amount = 1000; // デフォルト料金
      if (reservation.number_of_people >= 5 && reservation.number_of_people <= 8) {
        amount = 2000;
      } else if (reservation.number_of_people >= 9) {
        amount = 3000;
      }

      // payment_amountが設定されていればそれを優先
      if (reservation.payment_amount) {
        amount = reservation.payment_amount;
      }

      return {
        ...reservation,
        restaurant_name: reservation.restaurants?.name || '不明なレストラン',
        refundPolicy: {
          amount: amount,
          percentage: 100 // 全額返金
        }
      };
    });

    return { reservations: formattedReservations, error: null };
  } catch (err) {
    console.error('予約データ取得中の予期せぬエラー:', err);
    return { error: '予約データの取得に失敗しました', reservations: [] };
  }
};

export default async function MyReservationsPage() {
  // 予約データを取得
  const { reservations, error } = await getReservations();

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4 border-orange-200">予約一覧</h1>
      
      {reservations.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-600 mb-6 text-lg">予約がありません</p>
          <a
            href="/reservation"
            className="px-6 py-3 bg-orange-500 text-white font-medium rounded-lg shadow-md hover:bg-orange-600 transition-colors duration-200"
          >
            新しい予約を作成
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {reservations.map(reservation => (
            <div key={reservation.id} className="bg-white rounded-xl shadow-md overflow-hidden mb-4 transition duration-300 hover:shadow-lg">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{reservation.restaurant_name}</h3>
                    <p className="text-gray-600">{formatReservationDate(reservation.reservation_date)}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    reservation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  } mt-2 sm:mt-0`}>
                    {reservation.status === 'confirmed' ? '確定済み' : 
                     reservation.status === 'cancelled' ? 'キャンセル済み' : 
                     reservation.status === 'pending' ? '確認待ち' : 
                     reservation.status}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-gray-700">
                    <span className="font-medium">予約者:</span> {reservation.guest_name}
                  </p>
                  
                  <p className="text-gray-700">
                    <span className="font-medium">人数:</span> {reservation.number_of_people || 1}名様
                  </p>
                  
                  <p className="text-gray-700">
                    <span className="font-medium">金額:</span> 
                    <span className="text-orange-600 font-bold">
                      {reservation.refundPolicy.amount.toLocaleString()}円
                    </span>
                  </p>
                </div>
                
                <div className="mt-6">
                  <a
                    href={`/reservation/${reservation.id}`}
                    className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 inline-block text-center"
                  >
                    詳細を見る
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 