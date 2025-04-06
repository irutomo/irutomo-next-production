"use client";

import { useState, FormEvent } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

interface ReservationFormProps {
  restaurantId: string;
  restaurantName: string;
  restaurantImage: string;
  businessHours: {
    day: string;
    open_time: string;
    close_time: string;
    is_closed: boolean;
  }[];
}

export function ReservationForm({ restaurantId, restaurantName, restaurantImage, businessHours }: ReservationFormProps) {
  const [name, setName] = useState("");
  const [guests, setGuests] = useState("2");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [request, setRequest] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [reservationAmount] = useState("1000"); // 予約手数料1000円固定
  const [paypalError, setPaypalError] = useState<string | null>(null);

  // PayPal初期化オプション
  const initialOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "AX__ZB3M5gT4CkuFI9T8bXoyZYZPqsvVu7JilzrpPg2rzkOPqJ1kh8WbPdeFEVwp9lS4NzQDzfF_SSqv",
    currency: "JPY",
    intent: "capture",
    components: "buttons",
    debug: process.env.NODE_ENV !== "production",
  };

  // 今日の日付を取得しフォーマット (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];

  // フォームバリデーション
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) newErrors.name = "お名前を入力してください";
    if (!date) newErrors.date = "日付を選択してください";
    if (!time) newErrors.time = "時間を選択してください";
    if (!phone.trim()) newErrors.phone = "電話番号を入力してください";
    if (!/^[0-9]+$/.test(phone)) newErrors.phone = "電話番号は数字のみ入力してください";
    if (!email.trim()) newErrors.email = "メールアドレスを入力してください";
    if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "有効なメールアドレスを入力してください";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 注文の作成
  const createOrder = async () => {
    setPaypalError(null);
    
    if (!validateForm()) {
      return Promise.reject("入力内容を確認してください");
    }

    setIsSubmitting(true);
    
    try {
      console.log("PayPal: 注文作成開始");
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: reservationAmount,
          currency: 'JPY',
          restaurantId
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('注文作成エラーレスポンス:', data);
        throw new Error(data.message || '注文の作成に失敗しました');
      }
      
      console.log("PayPal: 注文ID取得成功", data.orderId);
      return data.orderId;
    } catch (error) {
      console.error('PayPal注文作成エラー:', error);
      setPaypalError(error instanceof Error ? error.message : '注文の作成に失敗しました');
      setIsSubmitting(false);
      return Promise.reject("注文の作成に失敗しました");
    }
  };

  // 注文の処理（支払い完了時）
  const onApprove = async (data: { orderID: string }) => {
    try {
      console.log("PayPal: 支払い承認済み、キャプチャ開始", data.orderID);
      const response = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: data.orderID,
          reservationData: {
            restaurantId,
            name,
            guests,
            date,
            time,
            phone,
            email,
            request
          }
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('支払い処理エラーレスポンス:', responseData);
        throw new Error(responseData.message || '支払いの処理に失敗しました');
      }
      
      console.log("PayPal: 支払い完了", responseData);
      // 支払い成功
      setOrderId(data.orderID);
      setShowSuccessModal(true);
      
      // フォームをリセット
      setName("");
      setGuests("2");
      setDate("");
      setTime("");
      setPhone("");
      setEmail("");
      setRequest("");
    } catch (error) {
      console.error('PayPal支払い処理エラー:', error);
      setPaypalError(error instanceof Error ? error.message : '支払いの処理に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form>
        {/* 予約者名 */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            予約者名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
            required
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>
        
        {/* 人数 */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            人数 <span className="text-red-500">*</span>
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-md"
            required
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>
        
        {/* 日付 */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            日付 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={today}
            className={`w-full p-2 border rounded-md ${errors.date ? 'border-red-500' : 'border-gray-200'}`}
            required
          />
          {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
        </div>
        
        {/* 時間 */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            時間 <span className="text-red-500">*</span>
          </label>
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={`w-full p-2 border rounded-md ${errors.time ? 'border-red-500' : 'border-gray-200'}`}
            required
          >
            <option value="">-- 時間 --</option>
            {['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {errors.time && <p className="mt-1 text-sm text-red-500">{errors.time}</p>}
        </div>
        
        {/* 電話番号 */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            電話番号 <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            pattern="[0-9]+"
            className={`w-full p-2 border rounded-md ${errors.phone ? 'border-red-500' : 'border-gray-200'}`}
            required
          />
          {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
        </div>
        
        {/* メールアドレス */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            メールアドレス <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full p-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
            required
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
        </div>
        
        {/* 追加リクエスト */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            追加リクエスト <span className="text-gray-400 text-xs">(任意)</span>
          </label>
          <textarea
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-md h-20 resize-y"
          ></textarea>
        </div>
        
        {/* PayPal決済ボタン */}
        <div className="mb-4">
          <p className="text-center mb-2 font-medium">代行手数料：{parseInt(reservationAmount).toLocaleString()}円</p>
          
          {paypalError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              <p className="text-sm">{paypalError}</p>
            </div>
          )}
          
          <PayPalScriptProvider options={initialOptions}>
            <PayPalButtons
              style={{ layout: 'vertical', shape: 'rect' }}
              disabled={isSubmitting}
              forceReRender={[reservationAmount, initialOptions.currency]}
              createOrder={createOrder}
              onApprove={onApprove}
              onError={(err) => {
                console.error('PayPalエラー:', err);
                setPaypalError('お支払い処理中にエラーが発生しました。もう一度お試しください。');
                setIsSubmitting(false);
              }}
              onCancel={() => {
                console.log('PayPal: キャンセルされました');
                setIsSubmitting(false);
              }}
            />
          </PayPalScriptProvider>
        </div>
      </form>

      {/* 成功モーダル */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                ✅
              </div>
              <h3 className="text-xl font-bold mb-4">Success!</h3>
              <p className="text-gray-600 mb-6">
                代行手数料の支払いが完了しました！担当者が予約を急ぎます！予約成立後、予約完了メールが届きます。予約不成立時も100％返金します。
              </p>
              
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  window.location.href = '/'; // ホームに戻る
                }}
                className="w-full py-3 bg-[#00CBB3] text-white font-bold rounded-lg hover:bg-[#00CBB3]/90 transition-colors"
              >
                ホームに戻る
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 