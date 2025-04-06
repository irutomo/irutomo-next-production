"use client";

import { useState, FormEvent } from 'react';

interface ReservationFormProps {
  restaurantId: string;
}

export function ReservationForm({ restaurantId }: ReservationFormProps) {
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

  // フォーム送信処理
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // ここに実際の予約処理のコードを追加
      // 例: APIエンドポイントへのリクエストなど
      console.log('予約データ:', {
        restaurantId,
        name,
        guests,
        date,
        time,
        phone,
        email,
        request
      });
      
      // 成功時の処理（デモ用に1秒待機）
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
      console.error('予約処理エラー:', error);
      // エラー処理を追加
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
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
          <div className="h-[45px] bg-[#ffc439] rounded-md flex justify-center items-center cursor-pointer">
            <img
              src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_100x26.png"
              alt="PayPal"
              className="h-[26px]"
            />
          </div>
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