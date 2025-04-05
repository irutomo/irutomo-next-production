'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { formatReservationDate, formatReservationId } from '@/lib/utils';
import ReservationDetailModal from './reservation-detail-modal';
import ReservationCancelDialog from './reservation-cancel-dialog';
import { useSupabaseClient } from '@/lib/hooks';

// 予約データの型定義
interface Reservation {
  id: string;
  reservation_date: string;
  reservation_time: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  number_of_people: number;
  restaurant_id: string;
  restaurant_name: string;
  status: string;
  payment_amount?: number;
  payment_status: string;
  payment_info?: any;
  created_at: string;
  refundPolicy: {
    amount: number;
    percentage: number;
  };
  [key: string]: any;
}

interface MyReservationsClientProps {
  initialReservations: Reservation[];
  initialError: string | null;
}

export default function MyReservationsClient({ 
  initialReservations, 
  initialError 
}: MyReservationsClientProps) {
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [error, setError] = useState<string | null>(initialError);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const { supabase, error: supabaseError } = useSupabaseClient();

  // 詳細モーダルを開く
  const handleOpenDetailModal = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowDetailModal(true);
  };

  // 詳細モーダルを閉じる
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedReservation(null);
  };

  // キャンセルダイアログを開く
  const handleOpenCancelDialog = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowCancelDialog(true);
  };

  // キャンセルダイアログを閉じる
  const handleCloseCancelDialog = () => {
    setShowCancelDialog(false);
    setSelectedReservation(null);
  };

  // 予約をキャンセルする
  const handleCancelReservation = async (reason: string) => {
    if (!selectedReservation || !supabase) return;
    setLoading(true);

    try {
      console.log('予約キャンセル処理を開始します:', { 
        reservationId: selectedReservation.id,
        reason: reason,
        refundPolicy: selectedReservation.refundPolicy
      });

      // payment_infoの確認（PayPal決済の場合は返金APIを呼び出す）
      let paymentInfo = null;
      if (selectedReservation.payment_info) {
        if (typeof selectedReservation.payment_info === 'string') {
          try {
            paymentInfo = JSON.parse(selectedReservation.payment_info);
          } catch (e) {
            console.warn('payment_infoがJSONとして解析できません:', e);
          }
        } else {
          paymentInfo = selectedReservation.payment_info;
        }
      }

      // PayPal支払いの場合は返金APIを呼び出す
      if (paymentInfo?.paymentMethod === 'paypal' && paymentInfo?.transactionId) {
        const captureId = paymentInfo.transactionId;
        console.log('PayPal返金処理を実行します:', { 
          captureId,
          refundAmount: selectedReservation.refundPolicy.amount
        });
        
        // 返金APIへのリクエスト
        const refundResponse = await fetch('/api/paypal/refund', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            captureId,
            amount: selectedReservation.refundPolicy.amount.toFixed(0),
            reason: reason || '予約のキャンセル',
            reservationId: selectedReservation.id
          })
        });

        if (!refundResponse.ok) {
          const errorText = await refundResponse.text();
          console.error('PayPal返金APIエラー:', {
            status: refundResponse.status,
            statusText: refundResponse.statusText,
            body: errorText
          });
          toast.error('返金処理に問題が発生しました。予約はキャンセルされます。');
        } else {
          const refundResult = await refundResponse.json();
          if (refundResult.success) {
            toast.success('返金処理が完了しました');
          }
        }
      }
      
      // データベースの予約ステータス更新
      const { error: updateError } = await supabase
        .from('reservations')
        .update({
          status: 'cancelled',
          payment_status: 'refunded',
          updated_at: new Date().toISOString(),
          cancel_reason: reason
        })
        .eq('id', selectedReservation.id);
      
      if (updateError) {
        console.error('予約ステータス更新エラー:', updateError);
        throw new Error('予約ステータスの更新に失敗しました: ' + updateError.message);
      }
      
      // 成功したら予約一覧を更新
      const updatedReservations = reservations.map(reservation => 
        reservation.id === selectedReservation.id 
          ? { 
              ...reservation, 
              status: 'cancelled', 
              payment_status: 'refunded',
              cancel_reason: reason
            } 
          : reservation
      );
      
      setReservations(updatedReservations);
      toast.success('予約をキャンセルしました');
      
      // モーダルを閉じる
      handleCloseCancelDialog();
    } catch (error) {
      console.error('キャンセル処理エラー:', error);
      toast.error(error instanceof Error ? error.message : '予約キャンセル処理中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // 予約ステータスに対応するテキストを取得
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'pending_confirmation':
      case 'pending':
        return '確認待ち';
      case 'confirmed':
        return '確定済み';
      case 'cancelled':
        return 'キャンセル済み';
      case 'completed':
        return '利用済み';
      default:
        return status;
    }
  };

  // 予約カードをレンダリング
  const renderReservationCard = (reservation: Reservation) => {
    const reservationDate = new Date(reservation.reservation_date);
    const isPast = reservationDate < new Date();
    
    // 支払い状態の判定
    const isPaid = reservation.payment_status === 'paid' || reservation.payment_status === 'completed';
    
    // キャンセル可能かどうかを判定
    const canCancel = reservation.status !== 'cancelled' && 
      new Date(reservation.reservation_date) > new Date(); // 予約日が現在より後の場合のみキャンセル可能
    
    return (
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
              {getStatusText(reservation.status)}
            </div>
          </div>
          
          <div className="space-y-3">
            <p className="text-gray-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium">予約者:</span> {reservation.guest_name}
            </p>
            
            <p className="text-gray-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-medium">人数:</span> {reservation.number_of_people || 1}名様
            </p>
            
            <p className="text-gray-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              <span className="font-medium">予約番号:</span> {formatReservationId(reservation.id)}
            </p>
            
            {/* 支払い状態を表示 */}
            <p className="text-gray-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">支払い状態:</span> 
              <span className={`ml-2 ${isPaid ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}`}>
                {isPaid ? '支払い済み' : '未払い'}
              </span>
            </p>
            
            {/* 金額情報 */}
            <p className="text-gray-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">金額:</span> 
              <span className="ml-2 text-orange-600 font-bold">
                {`${reservation.refundPolicy.amount.toLocaleString()}円`}
              </span>
            </p>
          </div>
          
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-3">
            {canCancel && (
              <button 
                onClick={() => handleOpenCancelDialog(reservation)}
                disabled={loading}
                className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50"
              >
                キャンセルする
              </button>
            )}
            
            <button 
              onClick={() => handleOpenDetailModal(reservation)}
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
            >
              詳細を見る
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ローディング中表示
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4 border-orange-200">予約一覧</h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="ml-4 text-lg text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }
  
  // エラー表示
  if (error || supabaseError) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4 border-orange-200">予約一覧</h1>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-md">
          <p className="text-red-700 text-lg">
            {error || (supabaseError ? supabaseError.toString() : '予約情報の取得に失敗しました')}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2.5 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-colors duration-200"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }
  
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
          {reservations.map(renderReservationCard)}
        </div>
      )}
      
      {/* キャンセルダイアログ */}
      {selectedReservation && (
        <ReservationCancelDialog
          isOpen={showCancelDialog}
          onClose={handleCloseCancelDialog}
          onConfirm={handleCancelReservation}
          refundAmount={selectedReservation.refundPolicy.amount}
          refundPercentage={selectedReservation.refundPolicy.percentage}
        />
      )}
      
      {/* 詳細モーダル */}
      {selectedReservation && (
        <ReservationDetailModal
          isOpen={showDetailModal}
          onClose={handleCloseDetailModal}
          reservation={selectedReservation}
        />
      )}
    </div>
  );
} 