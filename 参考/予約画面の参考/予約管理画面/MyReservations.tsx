import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '@lib/supabase';
import ReservationCancelDialog from './ReservationCancelDialog';
import { useClerkAuth } from '@lib/context/ClerkAuthContext';
import { formatReservationId } from '@lib/utils/format';

// 予約詳細モーダルコンポーネント
interface ReservationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  formatDate: (date: string) => string;
}

const ReservationDetailModal: React.FC<ReservationDetailModalProps> = ({
  isOpen,
  onClose,
  reservation,
  formatDate
}) => {
  if (!isOpen || !reservation) return null;

  // 金額情報を取得
  const paymentAmount = getPaymentAmount(reservation);

  // 支払い状態の判定
  const isPaid = reservation.payment_status === 'paid' || reservation.payment_status === 'completed';
  
  // payment_infoが文字列の場合はパースしておく
  let paymentInfo: PaymentInfoDetails | null = null;
  if (reservation.payment_info) {
    if (typeof reservation.payment_info === 'string') {
      try {
        paymentInfo = JSON.parse(reservation.payment_info) as PaymentInfoDetails;
      } catch (_e) {
        // parse error - ignore
      }
    } else {
      paymentInfo = reservation.payment_info as PaymentInfoDetails;
    }
  }
  
  // 安全に文字列化する関数
  const safeToString = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    return String(value);
  };
  
  // 安全にboolean判定を行う関数（リンターエラー修正用）
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
              {reservation.status === 'pending_confirmation' && (
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
                <p className="text-lg font-medium">{formatDate(reservation.reservation_date)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">予約者名</p>
                <p className="text-lg font-medium">{reservation.guest_name}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">人数</p>
                <p className="text-lg font-medium">{reservation.number_of_guests ? `${reservation.number_of_guests}名様` : '1名様'}</p>
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
                  {reservation.number_of_guests >= 5 && reservation.number_of_guests <= 8 
                    ? `2,000円` 
                    : reservation.number_of_guests >= 9 
                      ? `3,000円` 
                      : `1,000円`
                  }
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
};

// 予約データ型定義
interface Reservation {
  id: string;
  reservation_date: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  number_of_guests: number;
  restaurant_id: string;
  restaurant_name: string;
  status: string;
  amount_paid?: number;  // 任意フィールドとして定義
  payment_status: string;
  created_at: string;
  user_id?: string;
  payment_info?: PaymentInfoDetails | string;
  refundPolicy: {
    amount: number;
    percentage: number;
  };
  metadata?: {
    price?: number;
    amount?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown; // 追加のフィールドを許可
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

// 支払い状態に基づくバッジスタイルを取得
const getPaymentStatusBadgeStyle = (status: string): string => {
  const lowerStatus = status?.toLowerCase();
  if (lowerStatus === 'paid' || lowerStatus === 'completed') {
    return 'bg-green-100 text-green-800';
  } else if (lowerStatus === 'refunded') {
    return 'bg-yellow-100 text-yellow-800';
  } else {
    return 'bg-gray-100 text-gray-800';
  }
};

// 支払い金額を取得する関数
const getPaymentAmount = (reservation: Reservation): number => {
  // すでに支払い金額が設定されている場合
  if (reservation.amount_paid) {
    return Number(reservation.amount_paid);
  }
  
  // payment_infoから取得を試みる
  if (reservation.payment_info) {
    try {
      const paymentInfo = typeof reservation.payment_info === 'string' 
        ? JSON.parse(reservation.payment_info) 
        : reservation.payment_info;
      
      console.log('payment_info詳細:', paymentInfo as PaymentInfoDetails);
      
      // PayPal支払い情報から金額を取得する - 実際のPayPal構造に基づく
      if (paymentInfo.amount) {
        return Number(paymentInfo.amount) || 0;
      }
      
      // 他の可能なパスを確認
      if (paymentInfo.purchase_units && paymentInfo.purchase_units.length > 0) {
        const unit = paymentInfo.purchase_units[0];
        if (unit.amount?.value) {
          return Number(unit.amount.value) || 0;
        }
      }
      
      // 結果オブジェクトを確認
      if (paymentInfo.result?.purchase_units?.length > 0) {
        const unit = paymentInfo.result.purchase_units[0];
        if (unit.amount?.value) {
          return Number(unit.amount.value) || 0;
        }
      }
      
      // metadataを確認
      if (paymentInfo.metadata) {
        if (paymentInfo.metadata.price) {
          return Number(paymentInfo.metadata.price) || 0;
        }
        if (paymentInfo.metadata.amount) {
          return Number(paymentInfo.metadata.amount) || 0;
        }
      }
    } catch (e) {
      console.error('payment_info解析エラー:', e);
    }
  }
  
  // reservation.metadataを確認
  if (reservation.metadata) {
    if (typeof reservation.metadata === 'string') {
      try {
        const metadata = JSON.parse(reservation.metadata) as Record<string, unknown>;
        if (metadata.price) return Number(metadata.price) || 0;
        if (metadata.amount) return Number(metadata.amount) || 0;
      } catch (e) {
        console.error('metadata解析エラー:', e);
      }
    } else if (typeof reservation.metadata === 'object' && reservation.metadata !== null) {
      const metadataObj = reservation.metadata as Record<string, unknown>;
      if ('price' in metadataObj && metadataObj.price) {
        return Number(metadataObj.price) || 0;
      }
      if ('amount' in metadataObj && metadataObj.amount) {
        return Number(metadataObj.amount) || 0;
      }
    }
  }
  
  // 人数に基づいて金額を計算（データベースに金額情報が存在しない場合のフォールバック）
  if (reservation.number_of_guests) {
    const partySize = reservation.number_of_guests;
    
    // 人数ごとのプラン価格を設定
    if (partySize >= 1 && partySize <= 4) {
      return 1000;  // 基本プラン: 1〜4人は1,000円
    } else if (partySize >= 5 && partySize <= 8) {
      return 2000;  // スタンダードプラン: 5〜8人は2,000円
    } else if (partySize >= 9) {
      return 3000;  // プレミアムプラン: 9人以上は3,000円
    }
  }
  
  // 支払い情報が見つからない場合のログ
  console.log('支払い情報が取得できませんでした:', { 
    id: reservation.id, 
    payment_status: reservation.payment_status,
    has_payment_info: !!reservation.payment_info,
    has_metadata: !!reservation.metadata
  });

  // それでも見つからない場合は1000円を返す（基本料金）
  return 1000;
};

// 予約が支払い済みかどうかを判定
const isPaid = (reservation: Reservation): boolean => {
  const status = reservation.payment_status?.toLowerCase();
  return status === 'paid' || status === 'completed';
};

// キャンセルポリシーに基づいて返金額と割合を計算
const calculateRefundPolicy = (paidAmount: number | undefined, _reservationDate: Date): { amount: number; percentage: number } => {
  // 金額が未定義の場合は0として扱う
  const actualAmount = paidAmount || 0;
  
  // キャンセルは常に100%返金
  return { amount: actualAmount, percentage: 100 }; // 全額返金
};

// パース時の型安全な変換
const safeParseJson = (jsonString: string | null | undefined): Record<string, unknown> | null => {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString) as Record<string, unknown>;
  } catch (_e) {
    // エラーログは出力しない
    return null;
  }
};

// 支払い情報オブジェクトの型定義（詳細なPayPal構造に基づく）
interface PaymentInfoDetails {
  orderId?: string;
  status?: string;
  payerId?: string;
  payerEmail?: string;
  transactionId?: string;
  amount?: string | number;
  currency?: string;
  paymentMethod?: string;
  captureTimestamp?: string;
  metadata?: {
    paymentProvider?: string;
    price?: number;
    amount?: number;
    [key: string]: unknown;
  };
  originalReservationId?: string;
  purchase_units?: Array<{
    amount?: {
      value?: string;
      currency_code?: string;
    };
  }>;
  result?: {
    id?: string;
    purchase_units?: Array<{
      amount?: {
        value?: string;
        currency_code?: string;
      };
    }>;
  };
  [key: string]: unknown;
}

const MyReservations: React.FC = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [detailReservation, setDetailReservation] = useState<Reservation | null>(null);
  const { user, isAuthenticated, getToken } = useClerkAuth();
  
  // 予約データを取得
  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      setError('');
      
      try {
        // ログインユーザーのメールアドレスを使って予約を取得
        let email = '';
        
        // Clerkのユーザーオブジェクトからメールアドレスを取得（型に依存しないアクセス方法）
        if (user) {
          // User型をanyとしてキャストして柔軟に扱う
          const clerkUser = user as any;
          
          if (typeof user.email === 'string') {
            // User型の定義通りに取得
            email = user.email;
          } else if (clerkUser.primaryEmailAddress && typeof clerkUser.primaryEmailAddress.emailAddress === 'string') {
            // Clerkの実際の構造を使用
            email = clerkUser.primaryEmailAddress.emailAddress;
          } else if (clerkUser.emailAddresses && Array.isArray(clerkUser.emailAddresses) && clerkUser.emailAddresses.length > 0) {
            // 配列からの取得
            const firstEmail = clerkUser.emailAddresses[0];
            if (firstEmail && typeof firstEmail.emailAddress === 'string') {
              email = firstEmail.emailAddress;
            }
          }
        }
        
        if (!email) {
          setError('メールアドレスが取得できませんでした。再度ログインしてください。');
          setLoading(false);
          return;
        }
        
        console.log('使用するメールアドレス:', email);
        
        // Supabaseから予約データを取得
        const { data, error } = await supabase
          .from('reservations')
          .select('*')
          .eq('guest_email', email)
          .order('reservation_date', { ascending: true });
        
        if (error) {
          console.error('予約データ取得エラー:', error);
          setError('予約データの取得中にエラーが発生しました。');
          setLoading(false);
          return;
        }
        
        // 診断用：支払い情報の確認
        if (data && data.length > 0) {
          console.log('予約データデバッグ:', data);
          data.forEach((reservation: any, index: number) => {
            const amount = getPaymentAmount(reservation as Reservation);
            console.log(`予約[${index}] ID=${reservation.id}, 金額=${amount}円, payment_info=`, reservation.payment_info);
            if (amount === 0) {
              console.log(`  - amount_paid: ${reservation.amount_paid || 'なし'}`);
              console.log(`  - metadata: ${JSON.stringify(reservation.metadata || 'なし')}`);
            }
          });
        }
        
        // 予約データを整形
        const formattedReservations = (data || []).map((reservation: any) => {
          const reservationDate = new Date(reservation.reservation_date);
          const refundPolicy = calculateRefundPolicy(
            getPaymentAmount(reservation as Reservation),
            reservationDate
          );
          
          return { 
            ...reservation, 
            refundPolicy
          } as Reservation;
        });
        
        setReservations(formattedReservations);
      } catch (err) {
        console.error('予約データ取得中の予期せぬエラー:', err);
        setError('予約データの取得中に予期せぬエラーが発生しました。');
      } finally {
        setLoading(false);
      }
    };
    
    // ユーザー情報が取得できたら実行
    if (isAuthenticated) {
      fetchReservations();
    } else {
      // ユーザー情報がない場合は待機
      setLoading(false);
      setError('ログインして予約情報を確認してください');
    }
  }, [user, isAuthenticated]);
  
  // 日付のフォーマット関数
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return dateString;
    }
  };
  
  // キャンセルポリシーに基づいて返金額と割合を計算
  const calculateRefundPolicy = (paidAmount: number | undefined, _reservationDate: Date): { amount: number; percentage: number } => {
    // 金額が未定義の場合は0として扱う
    const actualAmount = paidAmount || 0;
    
    // キャンセルは常に100%返金
    return { amount: actualAmount, percentage: 100 }; // 全額返金
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
    if (!selectedReservation) return;
    
    try {
      // 認証トークンを取得
      const authToken = await getToken({ template: 'supabase' });
      
      console.log('予約キャンセル処理を開始します:', { 
        reservationId: selectedReservation.id,
        reason: reason,
        hasAuthToken: !!authToken,
        refundPolicy: selectedReservation.refundPolicy
      });

      // payment_infoの確認
      let paymentInfo: PaymentInfoDetails | null = null;
      if (selectedReservation.payment_info) {
        if (typeof selectedReservation.payment_info === 'string') {
          try {
            paymentInfo = JSON.parse(selectedReservation.payment_info) as PaymentInfoDetails;
          } catch (e) {
            console.warn('payment_infoがJSONとして解析できません:', e);
          }
        } else {
          paymentInfo = selectedReservation.payment_info as PaymentInfoDetails;
        }
      }

      console.log('支払い情報の詳細:', paymentInfo);

      // captureIdの取得 (PayPal)
      const captureId = 
        (paymentInfo?.transactionId as string) || 
        (paymentInfo?.result?.id as string) || 
        '';
      
      // PayPal支払いの場合は返金APIを呼び出す
      if (captureId && paymentInfo?.paymentMethod === 'paypal') {
        console.log('PayPal返金処理を実行します:', { 
          captureId,
          refundAmount: selectedReservation.refundPolicy.amount
        });
        
        try {
          // 返金APIへのリクエスト
          const refundResponse = await fetch('/api/paypal/refund', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
            },
            body: JSON.stringify({
              captureId,
              amount: selectedReservation.refundPolicy.amount.toFixed(0),
              reason: reason || '予約のキャンセル',
              reservationId: selectedReservation.id
            })
          });

          // レスポンスが正常でない場合
          if (!refundResponse.ok) {
            const errorText = await refundResponse.text();
            console.error('PayPal返金APIエラー:', {
              status: refundResponse.status,
              statusText: refundResponse.statusText,
              body: errorText
            });
            throw new Error(`返金処理エラー: ${refundResponse.status} ${refundResponse.statusText}`);
          }

          const refundResult = await refundResponse.json();
          
          console.log('PayPal返金結果:', refundResult);
          
          if (!refundResult.success) {
            throw new Error(refundResult.message || 'PayPal返金処理に失敗しました');
          }
          
          toast.success('返金処理が完了しました');
        } catch (paypalError) {
          console.error('PayPal返金エラー:', paypalError);
          // エラーを発生させずに続行（DBの更新は行う）
          toast.error('返金処理に問題が発生しましたが、予約はキャンセルされました。後ほど返金について管理者に連絡します。');
        }
      } else {
        console.log('PayPal支払い情報がないか、返金が必要ない予約です');
      }
      
      // データベースの予約ステータス更新
      console.log('予約ステータスを更新します...');
      const { error: updateError } = await supabase
        .from('reservations')
        .update({
          status: 'cancelled',
          payment_status: 'refunded',
          updated_at: new Date().toISOString(),
          cancel_reason: reason // キャンセル理由を保存
        })
        .eq('id', selectedReservation.id);
      
      if (updateError) {
        console.error('予約ステータス更新エラー:', updateError);
        throw new Error('予約ステータスの更新に失敗しました: ' + updateError.message);
      }
      
      console.log('予約ステータスの更新が完了しました');
      
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
    }
  };
  
  // 詳細モーダルを開く
  const handleOpenDetailModal = (reservation: Reservation) => {
    setDetailReservation(reservation);
    setShowDetailModal(true);
  };
  
  // 詳細モーダルを閉じる
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setDetailReservation(null);
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
    
    // 支払い状態の判定（'completed'もpaidとして扱う）
    const isPaid = reservation.payment_status === 'paid' || reservation.payment_status === 'completed';
    
    // 金額情報を取得
    const paymentAmount = getPaymentAmount(reservation);
    
    // キャンセル可能かどうかを判定
    const canCancel = reservation.status !== 'cancelled' && 
      new Date(reservation.reservation_date) > new Date(); // 予約日が現在より後の場合のみキャンセル可能
    
    return (
      <div key={reservation.id} className="bg-white rounded-xl shadow-md overflow-hidden mb-4 transition duration-300 hover:shadow-lg">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">{reservation.restaurant_name}</h3>
              <p className="text-gray-600">{formatDate(reservation.reservation_date)}</p>
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
              <span className="font-medium">人数:</span> {reservation.number_of_guests ? `${reservation.number_of_guests}名様` : '1名様'}
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
                {reservation.number_of_guests >= 5 && reservation.number_of_guests <= 8 
                  ? `2,000円` 
                  : reservation.number_of_guests >= 9 
                    ? `3,000円` 
                    : `1,000円`
                }
              </span>
            </p>
          </div>
          
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-3">
            {canCancel && (
              <button 
                onClick={() => handleOpenCancelDialog(reservation)}
                className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
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
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4 border-orange-200">予約一覧</h1>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-md">
          <p className="text-red-700 text-lg">{error}</p>
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
          <button
            onClick={() => navigate('/reservation')}
            className="px-6 py-3 bg-orange-500 text-white font-medium rounded-lg shadow-md hover:bg-orange-600 transition-colors duration-200"
          >
            新しい予約を作成
          </button>
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
      <ReservationDetailModal
        isOpen={showDetailModal}
        onClose={handleCloseDetailModal}
        reservation={detailReservation}
        formatDate={formatDate}
      />
    </div>
  );
};

export default MyReservations; 