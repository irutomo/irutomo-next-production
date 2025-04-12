'use client';

import { useState, useEffect, FormEvent } from 'react';
import { ChevronLeft, X } from 'lucide-react';
import { BackHeader } from '@/components/ui/header';
import Link from 'next/link';
import { useLanguage } from '@/contexts/language-context';
import { useRouter } from 'next/navigation';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { PAYPAL_CLIENT_ID, PAYPAL_MODE, PAYMENT_AMOUNT, paypalConfig } from './paypalConfig';

// 言語データの定義
const translations = {
  ko: {
    pageTitle: "요청 폼",
    backToHome: "홈으로 돌아가기",
    description: "게재된 식당 외에도 요청 가능합니다. 아래 양식을 작성해 주세요.",
    restaurantName: "예약하고 싶은 식당 이름",
    restaurantAddress: "식당 주소 또는 식당 전화번호",
    customerName: "예약자 이름",
    numberOfPeople: "예약 인원",
    email: "이메일 주소",
    notes: "추가 요청사항 (옵션)",
    submit: "요청 제출하기",
    success: "예약 요청이 접수되었습니다! 예약 성공 이메일을 기다려주세요. 예약 불가 시 100% 환불됩니다👍",
    goToHome: "홈으로 돌아가기",
    close: "닫기",
    required: "필수 항목입니다",
    invalidEmail: "유효한 이메일 주소를 입력해 주세요",
    loading: "로딩 중...",
    paymentError: "결제 중 오류가 발생했습니다. 다시 시도해 주세요.",
    successTitle: "성공!",
    placeholders: {
      restaurantName: "식당 이름을 입력하세요",
      restaurantAddress: "식당 주소 또는 전화번호를 입력하세요",
      customerName: "이름을 입력하세요",
      numberOfPeople: "인원 수를 입력하세요",
      email: "이메일 주소를 입력하세요",
      notes: "추가 요청사항이 있으면 입력하세요"
    }
  },
  ja: {
    pageTitle: "リクエストフォーム",
    backToHome: "ホームに戻る",
    description: "掲載店舗以外もリクエスト可能です。以下のフォームにご記入ください。",
    restaurantName: "予約したい食堂の名前",
    restaurantAddress: "食堂の住所または食堂の電話番号",
    customerName: "予約者名",
    numberOfPeople: "予約人数",
    email: "メールアドレス",
    notes: "追加リクエスト（任意）",
    submit: "リクエストを送信",
    success: "予約リクエストを受け付けました！予約成功メールをお待ちください。予約不可時も100%返金します👍",
    goToHome: "ホームに戻る",
    close: "閉じる",
    required: "必須項目です",
    invalidEmail: "有効なメールアドレスを入力してください",
    loading: "読み込み中...",
    paymentError: "決済処理中にエラーが発生しました。もう一度お試しください。",
    successTitle: "成功！",
    placeholders: {
      restaurantName: "食堂名を入力してください",
      restaurantAddress: "食堂の住所または電話番号を入力してください",
      customerName: "お名前を入力してください",
      numberOfPeople: "人数を入力してください",
      email: "メールアドレスを入力してください",
      notes: "追加リクエストがあれば入力してください"
    }
  }
};

// フォームデータの型定義
interface FormData {
  restaurantName: string;
  restaurantAddress: string;
  customerName: string;
  numberOfPeople: string;
  email: string;
  notes: string;
  date: string;
  time: string;
}

// エラーの型定義
interface FormErrors {
  [key: string]: string;
}

// PayPal関連の追加設定
const getPayPalOptions = (language: string) => {
  // 必ずstring型のclientIdを返すようにする
  return {
    ...paypalConfig,
    clientId: paypalConfig.clientId || '',
    locale: language === 'ko' ? 'ko_KR' : 'ja_JP',
    // Base64エンコード関連のエラーを回避するため、単純なタイムスタンプのみ使用
    'data-timestamp': Math.floor(Date.now() / 1000).toString(),
  };
};

export default function RequestContent() {
  const { language } = useLanguage();
  const router = useRouter();
  const t = translations[language];

  // フォームの状態を管理
  const [formData, setFormData] = useState<FormData>({
    restaurantName: '',
    restaurantAddress: '',
    customerName: '',
    numberOfPeople: '',
    email: '',
    notes: '',
    date: '',
    time: ''
  });

  // エラー状態を管理
  const [errors, setErrors] = useState<FormErrors>({});
  
  // 送信成功状態
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  
  // PayPalスクリプト読み込み状態の監視
  useEffect(() => {
    // PayPalスクリプトが既に読み込まれているか確認
    const checkScriptLoaded = () => {
      if (typeof window !== 'undefined' && window.paypal) {
        console.log("PayPal SDKが読み込まれました");
        setScriptLoaded(true);
        return true;
      }
      return false;
    };

    // 初期チェック
    if (!checkScriptLoaded()) {
      // スクリプトがまだ読み込まれていない場合、定期的にチェック
      const interval = setInterval(() => {
        if (checkScriptLoaded()) {
          clearInterval(interval);
        }
      }, 500);
      
      // クリーンアップ
      return () => clearInterval(interval);
    }
  }, []);

  // 入力値の変更処理
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // エラーがあれば消去
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // バリデーション関数
  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    // 必須フィールドのチェック
    const requiredFields = ['restaurantName', 'restaurantAddress', 'customerName', 'numberOfPeople', 'email', 'date', 'time'];
    requiredFields.forEach(field => {
      if (!formData[field as keyof typeof formData].trim()) {
        newErrors[field] = t.required;
      }
    });
    
    // メールアドレスのバリデーション
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.invalidEmail;
    }
    
    return newErrors;
  };

  // フォーム送信処理
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // バリデーション
    const formErrors = validateForm();
    setErrors(formErrors);
    
    // エラーがなければPayPal決済に進む
    if (Object.keys(formErrors).length === 0) {
      console.log('フォームが有効です。PayPal決済を開始します。');
      // PayPalボタンがクリックされるのを待つ
    }
  };

  // モーダルを閉じる
  const closeModal = () => {
    setIsSubmitted(false);
  };

  // ホームに戻る
  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <main className="max-w-md mx-auto bg-[#F8F8F8] min-h-screen pb-20">
      {/* ヘッダー */}
      <header className="flex items-center p-4 bg-white sticky top-0 z-10 shadow-sm">
        <Link href="/" className="flex items-center text-[#FFA500] hover:text-[#FF8C00]">
          <ChevronLeft className="h-5 w-5 mr-1" />
          <span>{t.backToHome}</span>
        </Link>
      </header>
      
      <div className="p-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h1 className="text-xl font-bold text-center mb-4 text-[#FFA500]">{t.pageTitle}</h1>
          <p className="text-sm text-center text-gray-700 mb-6">{t.description}</p>
          
          <style jsx global>{`
            ::placeholder {
              color: #9ca3af;
              opacity: 1;
            }
          `}</style>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="restaurantName" className="text-sm font-medium text-gray-800">
                {t.restaurantName} <span className="text-red-500">*</span>
              </label>
              <input
                id="restaurantName"
                name="restaurantName"
                placeholder={t.placeholders.restaurantName}
                value={formData.restaurantName}
                onChange={handleChange}
                className={`w-full h-10 px-3 rounded-md border text-gray-900 ${errors.restaurantName ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-100`}
              />
              {errors.restaurantName && (
                <p className="text-xs text-red-500">{errors.restaurantName}</p>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="restaurantAddress" className="text-sm font-medium text-gray-800">
                {t.restaurantAddress} <span className="text-red-500">*</span>
              </label>
              <input
                id="restaurantAddress"
                name="restaurantAddress"
                placeholder={t.placeholders.restaurantAddress}
                value={formData.restaurantAddress}
                onChange={handleChange}
                className={`w-full h-10 px-3 rounded-md border text-gray-900 ${errors.restaurantAddress ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-100`}
              />
              {errors.restaurantAddress && (
                <p className="text-xs text-red-500">{errors.restaurantAddress}</p>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="customerName" className="text-sm font-medium text-gray-800">
                {t.customerName} <span className="text-red-500">*</span>
              </label>
              <input
                id="customerName"
                name="customerName"
                placeholder={t.placeholders.customerName}
                value={formData.customerName}
                onChange={handleChange}
                className={`w-full h-10 px-3 rounded-md border text-gray-900 ${errors.customerName ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-100`}
              />
              {errors.customerName && (
                <p className="text-xs text-red-500">{errors.customerName}</p>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="numberOfPeople" className="text-sm font-medium text-gray-800">
                {t.numberOfPeople} <span className="text-red-500">*</span>
              </label>
              <input
                id="numberOfPeople"
                name="numberOfPeople"
                type="number"
                min="1"
                placeholder={t.placeholders.numberOfPeople}
                value={formData.numberOfPeople}
                onChange={handleChange}
                className={`w-full h-10 px-3 rounded-md border text-gray-900 ${errors.numberOfPeople ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-100`}
              />
              {errors.numberOfPeople && (
                <p className="text-xs text-red-500">{errors.numberOfPeople}</p>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-800">
                {t.email} <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder={t.placeholders.email}
                value={formData.email}
                onChange={handleChange}
                className={`w-full h-10 px-3 rounded-md border text-gray-900 ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-100`}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="notes" className="text-sm font-medium text-gray-800">
                {t.notes}
              </label>
              <textarea
                id="notes"
                name="notes"
                placeholder={t.placeholders.notes}
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-y"
              />
            </div>
            
            {/* 日付入力 */}
            <div className="flex flex-col gap-2">
              <label htmlFor="date" className="text-sm font-medium text-gray-800">
                {language === 'ko' ? '날짜' : '日付'} <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full h-10 px-3 rounded-md border text-gray-900 ${errors.date ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-100`}
              />
              {errors.date && (
                <p className="text-xs text-red-500">{errors.date}</p>
              )}
            </div>
            
            {/* 時間入力 */}
            <div className="flex flex-col gap-2">
              <label htmlFor="time" className="text-sm font-medium text-gray-800">
                {language === 'ko' ? '시간' : '時間'} <span className="text-red-500">*</span>
              </label>
              <select
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className={`w-full h-10 px-3 rounded-md border text-gray-900 ${errors.time ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-100`}
              >
                <option value="">{language === 'ko' ? '-- 시간 --' : '-- 時間 --'}</option>
                {['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {errors.time && (
                <p className="text-xs text-red-500">{errors.time}</p>
              )}
            </div>
            
            {/* PayPalボタン */}
            <div className="mt-6 relative min-h-[40px]">
              {/* 読み込み中の表示 */}
              {!scriptLoaded && (
                <div className="flex items-center justify-center py-4">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-[#FFA500] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                    <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                      {t.loading}
                    </span>
                  </div>
                </div>
              )}
              
              <PayPalScriptProvider options={getPayPalOptions(language)}>
                <PayPalButtons 
                  style={{ 
                    layout: "vertical",
                    shape: "rect",
                    label: "pay",
                    height: 40
                  }}
                  disabled={false}
                  fundingSource={undefined}
                  forceReRender={[PAYMENT_AMOUNT, paypalConfig.currency, language, Math.floor(Date.now() / 1000).toString()]}
                  onInit={() => {
                    console.log("PayPalボタンが初期化されました");
                    setScriptLoaded(true);
                  }}
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      intent: "CAPTURE",
                      purchase_units: [
                        {
                          amount: {
                            currency_code: "JPY",
                            value: PAYMENT_AMOUNT.toString()
                          },
                          description: `${formData.restaurantName || "食堂"} - ${formData.numberOfPeople || "1"}名様`
                        }
                      ],
                      application_context: {
                        shipping_preference: "NO_SHIPPING"
                      }
                    });
                  }}
                  onApprove={(data, actions) => {
                    if (!actions.order) {
                      console.error("PayPal actions.orderが利用できません");
                      return Promise.reject("PayPal actions.order not available");
                    }
                    
                    return actions.order.capture().then((details) => {
                      console.log("決済が完了しました:", details);
                      const payerName = details.payer?.name?.given_name || "お客様";
                      console.log("Transaction completed by: " + payerName);
                      console.log("Transaction ID: " + details.id);
                      setIsSubmitted(true);
                      setPaymentError(null);
                    });
                  }}
                  onError={(err) => {
                    console.error("PayPal決済エラー:", err);
                    setPaymentError(t.paymentError);
                  }}
                />
              </PayPalScriptProvider>
              
              {paymentError && (
                <div className="mt-2 text-red-500 text-sm">
                  {paymentError}
                </div>
              )}

              <p className="text-xs text-gray-500 mt-4 text-center">
                {language === 'ko' 
                  ? `※위 버튼에서 수수료¥${PAYMENT_AMOUNT.toLocaleString()}를 결제해주세요.`
                  : `※上のボタンから手数料¥${PAYMENT_AMOUNT.toLocaleString()}を決済してください。`
                }
              </p>
              
              {/* 予約可否とリロードの案内 */}
              <div className="mt-3 text-sm text-center text-gray-700">
                <p className={language === 'ko' ? 'block' : 'hidden'}>
                  <span className="text-[#FFA500] font-medium">예약불가시에도 100% 환불!</span> 우선은 예약합시다!👀
                </p>
                <p className={language === 'ko' ? 'block' : 'hidden'}>
                  버튼이 나와 있지 않은 경우 페이지를 다시 로드해 주세요!
                </p>
                <p className={language === 'ja' ? 'block' : 'hidden'}>
                  <span className="text-[#FFA500] font-medium">予約不可時も100%返金!</span> まずは予約しましょう!👀
                </p>
                <p className={language === 'ja' ? 'block' : 'hidden'}>
                  ボタンが表示されていない場合は、ページを更新してください!
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* 成功モーダル */}
      {isSubmitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-11/12 max-w-md relative">
            <button 
              onClick={closeModal} 
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h3 className="text-xl font-bold mb-4">{t.successTitle}</h3>
              <p className="text-gray-600 mb-6">{t.success}</p>
              
              <button 
                onClick={handleGoHome}
                className="w-full bg-[#00CBB3] hover:bg-[#00CBB3]/90 text-white font-bold py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.99]"
              >
                {t.goToHome}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
} 