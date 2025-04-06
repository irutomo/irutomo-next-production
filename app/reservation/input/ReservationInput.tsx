'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import EnhancedPricingPlans from './EnhancedPricingPlans';
import RequestCommentModal from './RequestCommentModal';
import PaymentModal from './PaymentModal';
import { PayPalOrderDetails } from './PayPalCheckout';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import useToast from '@/hooks/useToast';
import { PayPalCheckout } from './PayPalCheckout';
import { toast } from 'react-toastify';

// 価格をフォーマットする関数
const formatPrice = (price: number): string => {
  return price.toLocaleString('ja-JP');
};

interface ReservationInputProps {
  restaurantId?: string;
  language: 'ko' | 'ja' | 'en';
  onBack: () => void;
  onComplete: () => void;
}

// PaymentModalの型定義
interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  currency: string;
  title: string;
  description: string;
  reservationId: string;
  metadata: any;
  onSuccess: (details: PayPalOrderDetails) => void;
  onError: (error: Error) => void;
  onCancel: () => void;
  language?: string;
  content?: () => React.ReactElement;
}

const ReservationInput: React.FC<ReservationInputProps> = ({
  restaurantId,
  language = 'ja',
  onBack,
  onComplete,
}) => {
  const router = useRouter();
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'warning':
        toast.warning(message);
        break;
      default:
        toast.info(message);
        break;
    }
  }, []);
  
  // 予約情報のstate
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [partySize, setPartySize] = useState<number>(2);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [seatType, setSeatType] = useState('');
  
  // 価格プラン関連のstate
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [selectedPlanName, setSelectedPlanName] = useState<string>('');
  
  // UI状態管理
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [reservationId, setReservationId] = useState<string>('');
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  // 予約データの状態
  const [reservationData, setReservationData] = useState<{
    id: number;
    user_id: string;
    start_time: string;
    price: number;
  } | null>(null);
  
  // 予約データの読み込み
  useEffect(() => {
    if (reservationId) {
      // 既存の予約データを取得
      fetch(`/api/reservations/${reservationId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setReservationData(data.reservation);
          }
        })
        .catch(err => {
          console.error('予約データの取得に失敗しました:', err);
        });
    }
  }, [reservationId]);

  // PayPal初期化オプション
  const paypalOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'AcTjrhc3hFkSrCH3OwxxU8XRJXfgCJFhVBCp68X3xkUC1lqz4FUivsnN7WTeJj_wTKsx4OCrpg9dIy3z',
    currency: "JPY",
    intent: "capture",
    // サードパーティCookieの制限に対応する設定
    "data-client-token": "abc123xyz==",
    "data-partner-attribution-id": "IRUTOMO_reserve",
    components: "buttons", // 必要なコンポーネントのみロード
    // 詳細設定
    "data-user-id-token": "false", // ユーザーIDトークンを無効化
    "data-sdk-integration-source": "fullstack-button-integrator",
    // disableFundingを削除し、すべての決済オプションを許可
    // その他の最適化
    "enable-funding": "card,credit,paylater",
    "disable-funding": "", // 何も無効化しない
    locale: "ja_JP", // 日本語ロケールを明示的に設定
    "buyer-country": "JP", // 日本を購入者の国として設定
    debug: false, // 本番環境では必ずfalseに設定
    "data-namespace": "paypal_sdk",
    "data-page-type": "checkout",
  };

  // レストラン情報を取得（実際の実装ではAPIからフェッチします）
  const restaurantName = restaurantId ? 
    restaurantId === '1' ? '熟成肉と本格炭火焼肉 又三郎' : 
    restaurantId === '2' ? 'まほろば囲炉裏 心斎橋' : 
    restaurantId === '3' ? '焼鳥YAMATO' : '指定なし' : '指定なし';

  // 今日の日付を取得 (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];

  // 料金プランが選択された時の処理
  const handlePlanSelect = (amount: number, planName?: string) => {
    setSelectedAmount(amount);
    if (planName) {
      setSelectedPlanName(planName);
    }
    console.log(`料金プラン選択: ${amount}円, ${planName || '名称なし'}`);
  };

  // 大人数リクエストモーダルを表示
  const handleShowRequestModal = () => {
    setShowRequestModal(true);
  };

  // 決済モーダルを表示
  const handleShowPaymentModal = () => {
    setShowPaymentModal(true);
  };

  // フォームバリデーション
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!date) errors.date = '日付を選択してください';
    if (!time) errors.time = '時間を選択してください';
    if (!partySize) errors.partySize = '人数を選択してください';
    if (!name) errors.name = 'お名前を入力してください';
    if (!email) errors.email = 'メールアドレスを入力してください';
    if (email && !/\S+@\S+\.\S+/.test(email)) errors.email = '有効なメールアドレスを入力してください';
    if (!phone) errors.phone = '電話番号を入力してください';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 予約フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 予約情報をオブジェクトにまとめる
      const reservationData = {
        restaurantId,
        date,
        time,
        partySize,
        name,
        email,
        phone,
        notes,
        amount: selectedAmount,
        plan_name: selectedPlanName,
      };
      
      console.log('予約データ:', reservationData);
      
      // 予約情報をデータベースに保存
      const response = await fetch('/api/reservations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservationData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || '予約情報の保存に失敗しました');
      }
      
      console.log('予約保存結果:', result);
      
      // データベースから返された予約IDを使用
      setReservationId(result.reservationId);
      
      // 決済モーダルを表示
      setShowPaymentModal(true);
    } catch (error) {
      console.error('予約処理エラー:', error);
      alert(`予約処理中にエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
      // エラー処理
    } finally {
      setIsSubmitting(false);
    }
  };

  // 決済成功時の処理
  const handlePaymentSuccess = useCallback((details: PayPalOrderDetails) => {
    console.log('支払い成功:', details);
    showToast('お支払いが完了しました！', 'success');
    setPaymentComplete(true);
    setShowPaymentModal(false);
    
    // 予約完了ページへリダイレクト
    if (reservationId) {
      router.push(`/reservation/complete?id=${reservationId}`);
    }
  }, [router, reservationId, showToast]);

  // 決済エラー時の処理
  const handlePaymentError = useCallback((error: Error) => {
    console.error('支払いエラー:', error);
    showToast(`お支払い処理中にエラーが発生しました: ${error.message}`, 'error');
  }, [showToast]);

  // 決済キャンセル時の処理
  const handlePaymentCancel = () => {
    console.log('支払いキャンセル');
    setShowPaymentModal(false);
  };

  // 戻るボタンの処理
  const handleBack = () => {
    if (restaurantId) {
      router.push(`/restaurants/${restaurantId}`);
    } else {
      router.push('/restaurants');
    }
    onBack();
  };

  // 決済モーダル内のコンテンツをレンダリング
  const renderPaymentModalContent = () => {
    // 予約情報の準備ができていない場合
    if (!reservationData) {
      return <div className="p-4 text-center">予約情報の読み込み中...</div>;
    }
    
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">お支払い</h3>
        
        {isPaymentLoading && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded text-center">
            <div className="animate-pulse">処理中...</div>
            <p className="text-sm mt-1">ページを閉じたり更新したりしないでください</p>
          </div>
        )}
        
        <div className="mb-4">
          <p className="font-medium">予約詳細:</p>
          <p>日時: {new Date(reservationData.start_time).toLocaleString('ja-JP')}</p>
          <p>お支払い金額: {formatPrice(reservationData.price)}円</p>
        </div>
                
        <PayPalCheckout
          amount={reservationData.price}
          currency="JPY"
          reservationId={String(reservationData.id)}
          paymentDescription={`IRUTOMO reserve - 予約ID: ${reservationData.id}`}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          onCancel={() => {
            showToast('お支払いがキャンセルされました', 'warning');
            setShowPaymentModal(false);
          }}
          metadata={{ 
            reservation_id: reservationData.id,
            user_id: reservationData.user_id 
          }}
          setLoading={setIsPaymentLoading}
        />
        
        <button
          onClick={() => setShowPaymentModal(false)}
          className="mt-4 w-full py-2 px-4 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          disabled={isPaymentLoading}
        >
          キャンセル
        </button>
      </div>
    );
  };

  return (
    <PayPalScriptProvider options={paypalOptions}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold">予約情報入力</h2>
        </div>
        
        <form className="p-6 space-y-6" onSubmit={handleSubmit}>
          {/* 店舗情報 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">店舗</label>
            {restaurantId ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{restaurantName}</p>
                  <Link href={`/restaurants/${restaurantId}`} className="text-sm text-primary-500 hover:underline">
                    店舗詳細を見る
                  </Link>
                </div>
                <Link href="/restaurants" className="text-sm text-gray-600 hover:text-gray-900">
                  変更
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-gray-500">店舗が選択されていません</p>
                <Link href="/restaurants" className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md transition-colors text-sm">
                  店舗を選択
                </Link>
              </div>
            )}
          </div>
          
          {/* 日付選択 */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">日付</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`w-full px-4 py-2 border ${validationErrors.date ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-primary-500 focus:border-primary-500`}
              min={today}
              required
            />
            {validationErrors.date && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.date}</p>
            )}
          </div>
          
          {/* 時間選択 */}
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">時間</label>
            <select
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={`w-full px-4 py-2 border ${validationErrors.time ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-primary-500 focus:border-primary-500`}
              required
            >
              <option value="">選択してください</option>
              <option value="17:00">17:00</option>
              <option value="17:30">17:30</option>
              <option value="18:00">18:00</option>
              <option value="18:30">18:30</option>
              <option value="19:00">19:00</option>
              <option value="19:30">19:30</option>
              <option value="20:00">20:00</option>
              <option value="20:30">20:30</option>
              <option value="21:00">21:00</option>
            </select>
            {validationErrors.time && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.time}</p>
            )}
          </div>
          
          {/* 人数選択 */}
          <div>
            <label htmlFor="partySize" className="block text-sm font-medium text-gray-700 mb-1">人数</label>
            <select
              id="partySize"
              value={partySize}
              onChange={(e) => setPartySize(parseInt(e.target.value, 10))}
              className={`w-full px-4 py-2 border ${validationErrors.partySize ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-primary-500 focus:border-primary-500`}
              required
            >
              {[...Array(20)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}人
                </option>
              ))}
            </select>
            {validationErrors.partySize && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.partySize}</p>
            )}
            
            {/* 13人以上の場合の注意事項 */}
            {partySize >= 13 && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                <p>13名以上の予約は、事前に店舗への確認が必要です。「大人数予約リクエスト」ボタンからリクエストをお送りください。</p>
                <button
                  type="button"
                  onClick={handleShowRequestModal}
                  className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors w-full"
                >
                  大人数予約リクエスト
                </button>
              </div>
            )}
          </div>
          
          {/* プラン選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">料金プラン</label>
            <EnhancedPricingPlans
              partySize={partySize}
              language={language}
              onPlanSelect={handlePlanSelect}
              plans={[]} // APIからの取得を想定
              selectedPlanId=""
            />
          </div>
          
          {/* 連絡先情報 */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="font-medium text-gray-900">予約者情報</h3>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">お名前</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-4 py-2 border ${validationErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-primary-500 focus:border-primary-500`}
                required
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.name}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-2 border ${validationErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-primary-500 focus:border-primary-500`}
                required
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full px-4 py-2 border ${validationErrors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-primary-500 focus:border-primary-500`}
                required
              />
              {validationErrors.phone && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.phone}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">要望・備考</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="アレルギー情報や特別なリクエストがあればご記入ください"
              />
            </div>
          </div>
          
          {/* ボタン */}
          <div className="flex flex-col md:flex-row gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-3 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors md:order-1 order-2"
            >
              戻る
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors flex-1 md:order-2 order-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? '処理中...' : `予約を確定（${selectedAmount.toLocaleString()}円）`}
            </button>
          </div>
        </form>
      </div>
      
      {/* 大人数リクエストモーダル */}
      {showRequestModal && (
        <RequestCommentModal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          partySize={partySize}
          language={language}
          restaurantId={restaurantId || ''}
        />
      )}
      
      {/* 決済モーダル */}
      {showPaymentModal && (
        <PaymentModal
          isOpen={true}
          onClose={() => setShowPaymentModal(false)}
          amount={selectedAmount}
          currency="JPY"
          title="予約の確定と支払い"
          description={`${restaurantName}の予約 - ${date} ${time} - ${partySize}名様`}
          reservationId={reservationId}
          metadata={{
            restaurant_id: restaurantId,
            date,
            time,
            party_size: partySize,
            name,
            email,
            plan_name: selectedPlanName
          }}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          onCancel={handlePaymentCancel}
          language={language}
          content={renderPaymentModalContent}
        />
      )}
    </PayPalScriptProvider>
  );
};

export default ReservationInput; 