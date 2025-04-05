'use client';

import { formatReservationDate, formatReservationId } from '@/lib/utils';

// 予約データの型定義
interface Reservation {
  id: string;
  reservation_date: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string | null;
  number_of_people: number;
  restaurant_id: string;
  restaurant_name: string;
  status: string;
  payment_amount?: number;
  payment_status: string;
  created_at: string;
  payment_info?: any;
  refundPolicy: {
    amount: number;
    percentage: number;
  };
  [key: string]: any;
}

// 予約詳細モーダルの型定義
interface ReservationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation;
}

// 支払い状態のテキスト表示を取得
const getPaymentStatusText = (status: string): string => {
  const lowerStatus = status?.toLowerCase() || '';
  
  if (lowerStatus === 'paid' || lowerStatus === 'completed') {
    return '支払い済み';
  } else if (lowerStatus === 'pending') {
    return '支払い待ち';
  } else if (lowerStatus === 'refunded') {
    return '返金済み';
  } else if (lowerStatus === 'failed') {
    return '支払い失敗';
  } else {
    return status || '不明';
  }
};

export default function ReservationDetailModal({
  isOpen,
  onClose,
  reservation
}: ReservationDetailModalProps) {
  if (!isOpen || !reservation) return null;

  // 支払い状態の判定
  const isPaid = reservation.payment_status === 'paid' || reservation.payment_status === 'completed';
  
  // payment_infoが文字列の場合はパースしておく
  let paymentInfo = null;
  if (reservation.payment_info) {
    if (typeof reservation.payment_info === 'string') {
      try {
        paymentInfo = JSON.parse(reservation.payment_info);
      } catch (_e) {
        // parse error - ignore
      }
    } else {
      paymentInfo = reservation.payment_info;
    }
  }
  
  // 安全に文字列化する関数
  const safeToString = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    return String(value);
  };
  
  // 安全にboolean判定を行う関数
  const safeCheck = (value: unknown): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.length > 0;
    if (typeof value === 'number') return value !== 0;
    return true;
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="absolute right-4 top-4">
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 pt-10">
          <div className="flex items-center mb-6">
            <div className="bg-orange-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="ml-4 text-2xl font-bold text-gray-800">予約詳細</h2>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-xl mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{reservation.restaurant_name}</h3>
            <div className="flex items-center">
              {reservation.status === 'confirmed' && (
                <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full mr-2">
                  確定済み
                </span>
              )}
              {reservation.status === 'pending' && (
                <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full mr-2">
                  確認待ち
                </span>
              )}
              {reservation.status === 'cancelled' && (
                <span className="px-3 py-1 text-sm font-medium bg-red-100 text-red-800 rounded-full mr-2">
                  キャンセル済み
                </span>
              )}
              
              {/* 支払い状態を表示 */}
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {isPaid ? '支払い済み' : '未払い'}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">予約日時</p>
                <p className="text-lg font-medium">{formatReservationDate(reservation.reservation_date)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">予約者名</p>
                <p className="text-lg font-medium">{reservation.guest_name}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">人数</p>
                <p className="text-lg font-medium">{reservation.number_of_people ? `${reservation.number_of_people}名様` : '1名様'}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">予約番号</p>
                <p className="text-lg font-medium font-mono">{formatReservationId(reservation.id)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">予約日</p>
                <p className="text-lg font-medium">{new Date(reservation.created_at).toLocaleDateString('ja-JP')}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">金額</p>
                <p className="text-xl font-bold text-orange-600">
                  {reservation.refundPolicy.amount.toLocaleString()}円
                </p>
              </div>
            </div>
          </div>
          
          {/* 支払い情報がある場合は表示 */}
          {paymentInfo && (
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h4 className="font-semibold text-lg mb-4">支払い情報</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {safeCheck(paymentInfo.paymentMethod) && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">決済方法</p>
                      <p className="font-medium">
                        {safeToString(paymentInfo.paymentMethod) === 'paypal' ? 'PayPal' : 
                         safeToString(paymentInfo.paymentMethod) === 'stripe' ? 'クレジットカード' : 
                         safeToString(paymentInfo.paymentMethod)}
                      </p>
                    </div>
                  )}
                  
                  {safeCheck(paymentInfo.status) && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">決済状態</p>
                      <p className="font-medium">
                        {safeToString(paymentInfo.status) === 'COMPLETED' ? '完了' : safeToString(paymentInfo.status)}
                      </p>
                    </div>
                  )}
                  
                  {safeCheck(paymentInfo.orderId) && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">注文ID</p>
                      <p className="font-medium font-mono text-sm">{safeToString(paymentInfo.orderId)}</p>
                    </div>
                  )}
                  
                  {safeCheck(paymentInfo.transactionId) && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">取引ID</p>
                      <p className="font-medium font-mono text-sm">{safeToString(paymentInfo.transactionId)}</p>
                    </div>
                  )}
                  
                  {safeCheck(paymentInfo.captureTimestamp) && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">決済日時</p>
                      <p className="font-medium">{new Date(safeToString(paymentInfo.captureTimestamp)).toLocaleString('ja-JP')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 