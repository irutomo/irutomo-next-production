"use client";

import { useState, FormEvent, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import Script from 'next/script';

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

type Language = 'ko' | 'ja';

type ValidationMessages = {
  name: Record<Language, string>;
  date: Record<Language, string>;
  time: Record<Language, string>;
  phone: {
    required: Record<Language, string>;
    format: Record<Language, string>;
  };
  email: {
    required: Record<Language, string>;
    format: Record<Language, string>;
  };
};

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
  const [language, setLanguage] = useState<Language>('ko'); // デフォルトを韓国語に設定
  const [baseUrl, setBaseUrl] = useState<string>('');
  const [paypalReady, setPaypalReady] = useState(false);
  const [paypalScriptLoaded, setPaypalScriptLoaded] = useState(false);

  useEffect(() => {
    // クライアントサイドでCookieを読み取る
    const cookies = document.cookie.split(';');
    const languageCookie = cookies.find(cookie => cookie.trim().startsWith('language='));
    const languageValue = languageCookie ? languageCookie.split('=')[1].trim() as Language : 'ko';
    setLanguage(languageValue);

    // 現在のホストとポートを取得
    const currentUrl = window.location.origin;
    setBaseUrl(currentUrl);
  }, []);

  // Next.js 15.3対応: PayPalスクリプトの読み込みを監視
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // PayPalスクリプトのロード状態を確認
    const checkPayPalLoaded = () => {
      return typeof window !== 'undefined' && 
             typeof window.paypal !== 'undefined' && 
             window.paypal !== null &&
             typeof window.paypal.Buttons !== 'undefined';
    };

    // 既にロードされているか確認
    if (checkPayPalLoaded()) {
      console.log('PayPal SDKは既に読み込まれています');
      setPaypalScriptLoaded(true);
      setPaypalReady(true);
      return;
    }

    // スクリプトの動的読み込み
    const loadPayPalScript = () => {
      // 既存のスクリプトがあれば削除
      const existingScript = document.getElementById('paypal-sdk');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }

      const script = document.createElement('script');
      script.id = 'paypal-sdk';
      script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=JPY&locale=${language === 'ko' ? 'ko_KR' : 'ja_JP'}&components=buttons`;
      script.async = true;
      script.onload = () => {
        console.log('PayPal SDKが正常に読み込まれました');
        setPaypalScriptLoaded(true);
        setTimeout(() => {
          if (checkPayPalLoaded()) {
            setPaypalReady(true);
          } else {
            console.error('PayPal Buttons APIが見つかりません');
          }
        }, 100);
      };
      script.onerror = () => {
        console.error('PayPal SDKの読み込みに失敗しました');
        setPaypalError(language === 'ko' ? 'PayPal SDK 로딩에 실패했습니다' : 'PayPal SDKの読み込みに失敗しました');
      };
      
      document.body.appendChild(script);
    };

    loadPayPalScript();

    return () => {
      // クリーンアップ - 必要に応じてスクリプトを削除
      const script = document.getElementById('paypal-sdk');
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, [language]);

  // バリデーションメッセージを言語に応じて設定
  const validationMessages: ValidationMessages = {
    name: {
      ko: '이름을 입력해주세요',
      ja: 'お名前を入力してください'
    },
    date: {
      ko: '날짜를 선택해주세요',
      ja: '日付を選択してください'
    },
    time: {
      ko: '시간을 선택해주세요',
      ja: '時間を選択してください'
    },
    phone: {
      required: {
        ko: '전화번호를 입력해주세요',
        ja: '電話番号を入力してください'
      },
      format: {
        ko: '전화번호는 숫자만 입력해주세요',
        ja: '電話番号は数字のみ入力してください'
      }
    },
    email: {
      required: {
        ko: '이메일을 입력해주세요',
        ja: 'メールアドレスを入力してください'
      },
      format: {
        ko: '유효한 이메일을 입력해주세요',
        ja: '有効なメールアドレスを入力してください'
      }
    }
  };

  // PayPal設定のための関数
  const getPayPalOptions = () => {
    // ユニークIDの生成（1時間ごとに更新）- これによりキャッシュの問題を回避
    const uniqueId = Math.floor(Date.now() / 3600000).toString();
    
    return {
      clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
      currency: "JPY",
      intent: "capture",
      // コンポーネントを明示的に指定
      components: "buttons",
      // 利用できない支払い方法を無効化
      disableFunding: "paylater,venmo,card",
      // 言語設定
      locale: language === 'ko' ? 'ko_KR' : 'ja_JP',
      // サードパーティCookieの制限に対応するための設定（Next.js 15.3対応）
      'data-csp-nonce': 'true',
      'data-namespace': 'paypal_sdk',
      'data-page-type': 'checkout',
      'data-sdk-integration-source': 'nextjs_client',
      // セッション内で一意のクライアントトークンを生成
      'data-client-token': `nextjs_${uniqueId}`,
      // デバッグモードを有効化
      'debug': process.env.NODE_ENV === 'development',
      // データ属性の設定
      'data-react-paypal-script-provider': true,
      dataSdkIntegrationSource: 'next_clientside',
    };
  };

  // 初期化オプション
  const initialOptions = getPayPalOptions();

  // 今日の日付を取得しフォーマット (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];

  // フォームバリデーション
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) newErrors.name = validationMessages.name[language];
    if (!date) newErrors.date = validationMessages.date[language];
    if (!time) newErrors.time = validationMessages.time[language];
    if (!phone.trim()) newErrors.phone = validationMessages.phone.required[language];
    if (!/^[0-9]+$/.test(phone)) newErrors.phone = validationMessages.phone.format[language];
    if (!email.trim()) newErrors.email = validationMessages.email.required[language];
    if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = validationMessages.email.format[language];
    
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
      console.log("PayPal: 注文作成開始", {
        amount: reservationAmount,
        currency: 'JPY',
        restaurantId,
        baseUrl
      });
      const response = await fetch(`${baseUrl}/api/paypal/create-order`, {
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

      // レスポンスのステータスとテキストを取得
      const responseStatus = response.status;
      const responseStatusText = response.statusText;
      let data;
      
      try {
        data = await response.json();
      } catch (parseError: unknown) {
        console.error('JSONパースエラー:', parseError);
        const rawText = await response.text();
        console.error('生のレスポンステキスト:', rawText);
        throw new Error(`レスポンスのパースに失敗しました: ${parseError instanceof Error ? parseError.message : '不明なエラー'}`);
      }
      
      if (!response.ok) {
        console.error('注文作成エラーレスポンス:', {
          status: responseStatus,
          statusText: responseStatusText,
          data
        });
        throw new Error(data?.message || `注文の作成に失敗しました (${responseStatus}: ${responseStatusText})`);
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
      const response = await fetch(`${baseUrl}/api/paypal/capture-order`, {
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
        // PayPal支払いが成功したがデータベース保存に失敗した場合の特別なエラーメッセージ
        if (responseData.message && responseData.message.includes('支払いは完了しました')) {
          setOrderId(data.orderID);
          setPaypalError(
            language === 'ko' 
              ? '결제는 완료되었으나 예약 정보 저장에 실패했습니다. 주문 ID를 기록해 두십시오: ' + data.orderID 
              : '支払いは完了しましたが、予約情報の保存に失敗しました。注文IDをメモしておいてください: ' + data.orderID
          );
          // 管理者への通知処理をここに追加する（オプション）
          return;
        }
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
      {/* Next.js 15.3対応: PayPal SDK読み込み方法を改善 */}
      {!paypalScriptLoaded && (
        <Script
          id="paypal-script-loader"
          strategy="afterInteractive"
          src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=JPY&locale=${language === 'ko' ? 'ko_KR' : 'ja_JP'}&components=buttons`}
          onLoad={() => {
            console.log('Script onLoad: PayPal SDK読み込み完了');
            setPaypalScriptLoaded(true);
            if (typeof window !== 'undefined' && window.paypal && typeof window.paypal !== 'undefined' && window.paypal.Buttons) {
              setPaypalReady(true);
            }
          }}
          onError={() => {
            console.error('Script onError: PayPal SDKの読み込みに失敗');
            setPaypalError(language === 'ko' ? 'PayPal SDK 로딩에 실패했습니다' : 'PayPal SDKの読み込みに失敗しました');
          }}
        />
      )}
      
      <form>
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          {language === 'ko' ? '예약 정보 입력' : '予約情報入力'}
        </h3>
        
        {/* 予約者名 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'ko' ? '예약자 이름' : '予約者名'} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full p-2 border rounded-md text-gray-900 ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
            required
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>
        
        {/* 人数 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'ko' ? '인원' : '人数'} <span className="text-red-500">*</span>
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-md text-gray-900"
            required
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
              <option key={num} value={num}>{num}{language === 'ko' ? '명' : '人'}</option>
            ))}
          </select>
        </div>
        
        {/* 日付 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'ko' ? '날짜' : '日付'} <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={today}
            className={`w-full p-2 border rounded-md text-gray-900 ${errors.date ? 'border-red-500' : 'border-gray-200'}`}
            required
          />
          {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
        </div>
        
        {/* 時間 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'ko' ? '시간' : '時間'} <span className="text-red-500">*</span>
          </label>
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={`w-full p-2 border rounded-md text-gray-900 ${errors.time ? 'border-red-500' : 'border-gray-200'}`}
            required
          >
            <option value="">{language === 'ko' ? '-- 시간 --' : '-- 時間 --'}</option>
            {['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {errors.time && <p className="mt-1 text-sm text-red-500">{errors.time}</p>}
        </div>
        
        {/* 電話番号 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'ko' ? '전화번호' : '電話番号'} <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            pattern="[0-9]+"
            className={`w-full p-2 border rounded-md text-gray-900 ${errors.phone ? 'border-red-500' : 'border-gray-200'}`}
            required
          />
          {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
        </div>
        
        {/* メールアドレス */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'ko' ? '이메일' : 'メールアドレス'} <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full p-2 border rounded-md text-gray-900 ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
            required
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
        </div>
        
        {/* 追加リクエスト */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'ko' ? '추가 리퀘스트' : '追加リクエスト'} <span className="text-gray-400 text-xs">(임의)</span>
          </label>
          <textarea
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-md h-20 resize-y text-gray-900"
          ></textarea>
        </div>
        
        {/* PayPal決済ボタン */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {language === 'ko' ? '대행 수수료' : '代行手数料'}：<span className="text-black">{parseInt(reservationAmount).toLocaleString()}</span>{language === 'ko' ? '엔' : '円'}
          </p>
          
          {paypalError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              <p className="text-sm">{paypalError}</p>
            </div>
          )}
          
          <div className="relative min-h-[40px]">
            {!paypalReady && (
              <div className="flex items-center justify-center py-4">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-[#FFA500] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                  <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                    {language === 'ko' ? '로딩 중...' : '読み込み中...'}
                  </span>
                </div>
              </div>
            )}
            
            {paypalScriptLoaded && (
              <PayPalScriptProvider 
                options={getPayPalOptions()} 
                deferLoading={false}
              >
                {typeof window !== 'undefined' && window.paypal && typeof window.paypal !== 'undefined' && window.paypal.Buttons && (
                  <PayPalButtons
                    style={{ 
                      layout: "vertical",
                      shape: "rect",
                      label: "pay",
                      height: 40
                    }}
                    disabled={isSubmitting}
                    fundingSource={undefined}
                    forceReRender={[reservationAmount, language, Math.floor(Date.now() / 3600000).toString()]}
                    createOrder={createOrder}
                    onApprove={onApprove}
                    onInit={() => {
                      console.log('PayPalボタンが初期化されました');
                      setPaypalReady(true);
                    }}
                    onError={(err) => {
                      console.error('PayPalエラー:', err);
                      setPaypalError(language === 'ko' ? '결제 중 오류가 발생했습니다. 다시 시도해 주세요.' : 'お支払い処理中にエラーが発生しました。もう一度お試しください。');
                      setIsSubmitting(false);
                    }}
                    onCancel={() => {
                      console.log('PayPal: キャンセルされました');
                      setIsSubmitting(false);
                    }}
                  />
                )}
              </PayPalScriptProvider>
            )}
            
            {/* 予約可否とリロードの案内 */}
            <div className="mt-3 text-sm text-center text-gray-700">
              <p className={language === 'ko' ? 'block' : 'hidden'}>
                <span className="text-[#FFA500] font-medium">예약불가시에도 100% 환불!</span> 우선은 예약합시다!👀
              </p>
              <p className={language === 'ko' ? 'hidden md:block' : 'hidden'}>
                버튼이 나와 있지 않은 경우 페이지를 다시 로드해 주세요!
              </p>
              <p className={language === 'ja' ? 'block' : 'hidden'}>
                <span className="text-[#FFA500] font-medium">予約不可時も100%返金!</span> まずは予約しましょう!👀
              </p>
              <p className={language === 'ja' ? 'hidden md:block' : 'hidden'}>
                ボタンが表示されていない場合は、ページを更新してください!
              </p>
            </div>
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