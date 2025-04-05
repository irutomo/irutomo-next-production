import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, Users, Mail, User, Phone } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useClerkSupabaseAuth } from '@/features/auth/hooks/useClerkSupabaseAuth';
import { useSupabase } from '@/hooks/useSupabase';
import { calculateAmount } from '../../../../shared/utils';
import type { Restaurant } from '@/types/supabase';
import PaymentModal from './PaymentModal';
import RequestCommentModal from './RequestCommentModal';
import { useClerkAuth } from '@/lib/context/ClerkAuthContext';
import EnhancedPricingPlans from './EnhancedPricingPlans';

interface ReservationInputProps {
  restaurantId: string;
  language: 'ko' | 'ja' | 'en';
  onBack: () => void;
  onComplete?: (reservationId: string) => void;
}

// Define a type for PayPal payment data
interface PaypalPaymentData {
  orderId?: string;
  authToken?: string;
  [key: string]: unknown; // Allow other properties
}

// InquiryData interface removed as it's not used with the corrected onSubmit type
// interface InquiryData {
//   comment: string;
//   // Add other fields if needed
// }

// emailServiceの実装
/*
const sendReservationConfirmationEmail = async (
  email: string,
  name: string,
  date: string,
  time: string,
  service: string
) => {
  try {
    console.log('予約確認メールを送信:', { email, name, date, time, service });
    // 実際のメール送信ロジックはここに実装
    // 開発環境ではコンソールログのみ出力
    return true;
  } catch (error) {
    console.error('メール送信エラー:', error);
    return false;
  }
};
*/

// window.toastインターフェースを追加
declare global {
  interface Window {
    toast?: {
      success: (message: string) => void;
      error: (message: string) => void;
      loading: (message: string) => void;
      custom: (element: React.ReactNode) => void;
    };
  }
}

// 予約データの準備
/*
type ReservationInsert = Database['public']['Tables']['reservations']['Insert'];
*/

export default function ReservationInput({ restaurantId, language, onBack, onComplete }: ReservationInputProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    user, 
    isAuthenticated, 
    isSupabaseReady, 
  } = useClerkSupabaseAuth();
  const { client: supabase, isLoading: isSupabaseLoading } = useSupabase();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [partySize, setPartySize] = useState('2');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(1000);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [reservationMetadata, ] = useState<Record<string, string | number | boolean | undefined>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastReservationId, setLastReservationId] = useState('');
  const { signIn } = useClerkAuth();

  // パーティーサイズが13人以上かどうかを確認
  const isLargeGroup = useMemo(() => {
    const size = parseInt(partySize, 10);
    console.log(`isLargeGroup評価: パーティーサイズ=${size}, 13人以上=${size >= 13}`);
    return size >= 13;
  }, [partySize]);

  // 人数変更時に、13人以上の場合はリクエストモーダルを表示する準備をする
  useEffect(() => {
    console.log('パーティーサイズの変更を検出:', partySize);
    // 人数が13人以上の場合、自動的にリクエストモーダルを表示するフラグをセット
    if (parseInt(partySize, 10) >= 13) {
      console.log('13人以上の予約が選択されました。リクエストモーダルを表示します。');
      setShowRequestModal(true);
      
      // 13人以上の場合は料金プランを非表示にするため、選択をリセット
      setPaymentAmount(0);
    } else {
      // 13人未満に変更された場合はモーダルを非表示にする
      setShowRequestModal(false);
      
      // デフォルトの金額を設定
      const size = parseInt(partySize, 10);
      const amount = calculateAmount(size);
      setPaymentAmount(amount);
    }
  }, [partySize]);

  useEffect(() => {
    const checkPendingCheckout = async () => {
      const pendingCheckout = localStorage.getItem('pendingPaypalCheckout');
      if (pendingCheckout) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { reservationId: _, timestamp } = JSON.parse(pendingCheckout);
        const checkoutTime = new Date(timestamp);
        const now = new Date();
        const timeDiff = (now.getTime() - checkoutTime.getTime()) / (1000 * 60); // 分単位の差

        const message = language === 'ko'
          ? '이전 결제가 완료되지 않았을 수 있습니다. 다시 시도하거나 고객 지원팀에 문의하세요.'
          : language === 'ja'
          ? '前回の支払いが完了していない可能性があります。再試行するか、サポートにお問い合わせください。'
          : 'A previous payment may not have completed. Please try again or contact support.';

        // 5分以上経過している場合はメッセージを表示
        if (timeDiff > 5) {
          console.log('未完了の支払いセッションを検出');
          try {
            if (window.toast) {
              window.toast.error(message);
            } else {
              alert(message);
            }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (_error) {
            console.log('予約再開メッセージ:', message);
          }
        }
        localStorage.removeItem('pendingPaypalCheckout');
      }
    };
    checkPendingCheckout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ログイン前後でフォームデータを保持するための関数
  const saveFormDataToStorage = () => {
    const formData = {
      date,
      time,
      partySize,
      email,
      name,
      phone
    };
    localStorage.setItem('reservationFormData', JSON.stringify(formData));
    console.log('フォームデータを保存しました', formData);
  };

  // フォームデータを復元するための関数
  const restoreFormDataFromStorage = () => {
    const savedData = localStorage.getItem('reservationFormData');
    if (savedData) {
      try {
        const formData = JSON.parse(savedData);
        setDate(formData.date || '');
        setTime(formData.time || '');
        setPartySize(formData.partySize || '2');
        setEmail(formData.email || '');
        setName(formData.name || '');
        setPhone(formData.phone || '');
        console.log('フォームデータを復元しました', formData);
        
        // 復元後にローカルストレージから削除（オプション）
        // localStorage.removeItem('reservationFormData');
      } catch (error) {
        console.error('フォームデータの復元中にエラーが発生しました', error);
      }
    }
  };

  // 認証ユーザー情報を予約フォームに設定
  useEffect(() => {
    if (isAuthenticated && user) {
      // ユーザーのメールアドレスをフォームに設定 (Commented out due to type issues)
      // if (user.emailAddresses?.[0]?.emailAddress && !email) {
      //   setEmail(user.emailAddresses[0].emailAddress);
      // }

      // ユーザーの表示名をフォームに設定（存在する場合）
      if (user.firstName && !name) {
        setName(user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName);
      }

      // ログイン後に保存したフォームデータがあれば復元
      restoreFormDataFromStorage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, email, name]); // Add missing dependencies

  // 認証後に戻ってきたかチェック
  useEffect(() => {
    const state = location.state as { fromAuth?: boolean, action?: string, hasFormData?: boolean } | null;
    
    // 認証後に支払いを続ける場合
    if (state?.fromAuth && state.action === 'payment' && isAuthenticated) {
      // 認証後に支払い処理を再開
      setShowPaymentModal(true);
      
      // フォームデータを復元
      restoreFormDataFromStorage();
      
      // stateをクリアして、リロード時に再実行されないようにする
      window.history.replaceState({}, document.title);
    }
    
    // 認証後に予約フォームを続ける場合
    if (state?.fromAuth && state.action === 'continueReservation' && isAuthenticated) {
      console.log('認証後に予約フォームを再開します');
      
      // フォームデータを復元
      restoreFormDataFromStorage();
      
      // 再開メッセージを表示
      const language = localStorage.getItem('preferredLanguage') || 'ja';
      const message = 
        language === 'ko' ? '로그인 성공! 예약을 계속 진행해 주세요.' :
        language === 'en' ? 'Successfully logged in! Please continue with your reservation.' :
        'ログインに成功しました。予約を続けてください。';
      
      // トーストメッセージを表示
      try {
        if (window.toast) {
          window.toast.success(message);
        } else {
          alert(message);
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        console.log('予約再開メッセージ:', message);
      }
      
      // stateをクリアして、リロード時に再実行されないようにする
      window.history.replaceState({}, document.title);
    }
  }, [location, isAuthenticated]);

  // 認証後のSupabase接続状態を確認
  useEffect(() => {
    if (isAuthenticated && !isSupabaseReady) {
      console.log('認証されていますが、Supabaseとの連携が完了していません。しばらくお待ちください...');
    }
  }, [isAuthenticated, isSupabaseReady]);

  useEffect(() => {
    // Supabase クライアントが準備完了するまで待機
    if (!isSupabaseLoading) {
      fetchRestaurant();
    }
  }, [restaurantId, supabase, isSupabaseLoading]);

  // 人数が変更されたときに金額を更新
  useEffect(() => {
    const size = parseInt(partySize, 10);
    const amount = calculateAmount(size);
    setPaymentAmount(amount);
  }, [partySize]);

  const fetchRestaurant = async () => {
    // supabase が null または undefined の場合、処理をスキップ
    if (!supabase) {
      console.error('Supabaseクライアントが利用できません');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setRestaurant(data);
      } else {
        setErrors(prev => ({ ...prev, fetch: 'Restaurant not found' }));
      }
    } catch (err) {
      console.error('Error fetching restaurant:', err);
      setErrors(prev => ({ ...prev, fetch: 'Error fetching restaurant data.' }));
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const today = new Date();
    const maxDate = new Date('2025-05-22');
    const selectedDate = new Date(date);

    if (!date) {
      newErrors.date = language === 'ko' 
        ? '날짜를 선택해주세요' 
        : language === 'ja'
        ? '日付を選択してください'
        : 'Please select a date';
    } else if (selectedDate < today || selectedDate > maxDate) {
      newErrors.date = language === 'ko' 
        ? '2025-02-22부터 2025-05-22 사이의 날짜를 선택해주세요' 
        : language === 'ja'
        ? '2025-02-22から2025-05-22の間の日付を選択してください'
        : 'Please select a date between 2025-02-22 and 2025-05-22';
    }

    if (!time) {
      newErrors.time = language === 'ko' 
        ? '시간을 선택해주세요' 
        : language === 'ja'
        ? '時間を選択してください'
        : 'Please select a time';
    }

    if (!partySize) {
      newErrors.partySize = language === 'ko' 
        ? '인원을 선택해주세요' 
        : language === 'ja'
        ? '人数を選択してください'
        : 'Please select the number of people';
    }

    if (!name) {
      newErrors.name = language === 'ko' 
        ? '이름을 입력해주세요' 
        : language === 'ja'
        ? 'お名前を入力してください'
        : 'Please enter your name';
    }

    if (!phone) {
      newErrors.phone = language === 'ko' 
        ? '전화번호를 입력해주세요' 
        : language === 'ja'
        ? '電話番号を入力してください'
        : 'Please enter your phone number';
    }

    if (!email) {
      newErrors.email = language === 'ko' 
        ? '이메일을 입력해주세요' 
        : language === 'ja'
        ? 'メールアドレスを入力してください'
        : 'Please enter your email address';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = language === 'ko' 
        ? '유효한 이메일을 입력해주세요' 
        : language === 'ja'
        ? '有効なメールアドレスを入力してください'
        : 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // クライアントロード中または null の場合は何もしない
    if (isSupabaseLoading || !supabase) {
      console.warn('Supabase client is not ready yet.');
      return;
    }

    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // ログインしていない場合はログインモーダルを表示
      if (!isAuthenticated) {
        saveFormDataToStorage();
        // Clerk APIを使用してサインインモーダルを表示
        if (window.Clerk && typeof window.Clerk.openSignIn === 'function') {
          // 現在のURLをリダイレクトURLとして使用
          const currentUrl = window.location.href;
          window.Clerk.openSignIn({
            redirectUrl: currentUrl
          });
        } else {
          // フォールバック: ClerkContextのsignIn関数を使用
          signIn(window.location.pathname);
        }
        return;
      }
      
      // 認証済みユーザーのIDを取得 (未使用のためコメントアウト)
      /*
      let userId = null;
      if (user) {
        userId = user.id;
      }
      */
      
      // 以下の処理は続行...

      // 13人以上の場合は直接問い合わせフォームを表示
      if (isLargeGroup) {
        setShowRequestModal(true);
        return;
      }
      
      // ログイン済みの場合は支払いモーダルを表示
      setShowPaymentModal(true);
    } catch (error) {
      console.error('予約処理エラー:', error);
      setErrors({
        ...errors,
        submit: language === 'ko' 
          ? '예약 처리 중 오류가 발생했습니다. 다시 시도해주세요.' 
          : language === 'ja'
          ? '予約処理中にエラーが発生しました。もう一度お試しください。'
          : 'An error occurred during the reservation process. Please try again.'
      });
      
      // 予約処理でエラーが発生した場合、支払い完了フラグをリセット
      // これにより、ユーザーは再度予約を試みることができます
      setPaymentCompleted(false);
      
      // エラーが発生した場合でも支払いモーダルを閉じる
      setShowPaymentModal(false);
      setIsSubmitting(false);
    }
  };

  const handlePaymentComplete = async (paymentData: PaypalPaymentData) => {
    try {
      setIsSubmitting(true);
      setErrors({});

      // 予約データの準備
      const reservationData = {
        restaurantId: restaurantId,
        date: date,
        time: time,
        partySize: parseInt(partySize, 10),
        name: name,
        email: email,
        phone: phone,
        paymentMethod: 'paypal',
        paypalOrderId: paymentData.orderId,
        language: language,
        planId: selectedProductId || 'reservation_plan'
      };

      console.log('予約データをバックエンドAPIに送信します:', reservationData);

      let apiSuccess = false;
      let responseData = null;

      try {
        // タイムアウト用のコントローラーを作成
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // タイムアウトを10秒に延長

        console.log('APIリクエスト送信先:', '/api/reservations/create');
        console.log('リクエストデータ:', reservationData);

        // エンドポイントのパスを修正（末尾のスラッシュを削除）
        const response = await fetch('/api/reservations/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(paymentData.authToken ? { 'Authorization': `Bearer ${paymentData.authToken}` } : {})
          },
          body: JSON.stringify(reservationData),
          credentials: 'include', // クッキーや認証情報を含める
          signal: controller.signal
        });

        // タイムアウトをクリア
        clearTimeout(timeoutId);

        console.log('APIレスポンスステータス:', response.status);
        console.log('APIレスポンスURL:', response.url);
        
        // レスポンスのテキストを取得
        const responseText = await response.text();
        console.log('APIレスポンス（テキスト）:', responseText);

        if (response.ok && responseText) {
          try {
            responseData = JSON.parse(responseText);
            apiSuccess = true;
          } catch (jsonError) {
            console.error('JSONパースエラー:', jsonError);
          }
        } else {
          console.error('APIエラー:', response.status, response.statusText);
        }
      } catch (apiError) {
        console.error('API呼び出しエラー:', apiError);
      }

      // APIが失敗した場合でも、一時的な予約データを使用して確認画面に進む
      if (!apiSuccess) {
        console.log('APIが失敗したため、一時的な予約データを使用します');
        // 一時的な予約ID生成（実際の環境では使用しないことをお勧めします）
        const tempReservationId = `temp-${Date.now()}`;
        responseData = {
          id: tempReservationId,
          restaurantId: restaurantId,
          date: date,
          time: time,
          partySize: parseInt(partySize, 10),
          name: name,
          email: email,
          phone: phone
        };
      }

      console.log('処理された予約データ:', responseData);

      // 予約成功時のメッセージを表示
      setSuccessMessage('予約が正常に完了しました。');
      
      // 予約データをセッションストレージに保存
      if (responseData && responseData.id) {
        sessionStorage.setItem('lastReservationId', responseData.id);
        setLastReservationId(responseData.id);
      }

      // ローディング状態を解除
      setIsSubmitting(false);
      
      // 成功モーダルを表示
      setShowSuccessModal(true);
      
      // 2秒後に確認画面に遷移
      setTimeout(() => {
        navigate(`/reservation/${responseData?.id || 'confirmation'}`);
      }, 2000);

      // オプションのコールバック関数がある場合は実行
      if (onComplete && responseData?.id) {
        onComplete(responseData.id);
      }
    } catch (error) {
      console.error('予約処理エラー:', error);
      setIsSubmitting(false);
      setErrors({
        general: '予約処理中にエラーが発生しました。もう一度お試しください。'
      });
    }
  };

  // ユーザー作成または検索の処理を分離 (未使用のためコメントアウト)
  /*
  const createOrFindUser = async (): Promise<string | null> => {
    try {
      // まず既存ユーザーを検索
      console.log('既存ユーザーを検索します...');
      // RLSをバイパスするためsupabaseAdminを使用
      const { data: existingUser, error: searchError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();
        
      if (searchError) {
        console.error('既存ユーザー検索エラー:', searchError);
      }
        
      if (existingUser) {
        console.log('既存のユーザーIDを使用:', existingUser.id);
        return existingUser.id; // 既存のユーザーIDを返す
      }
      
      // 既存ユーザーが見つからなかった場合のみ新規作成
      console.log('既存ユーザーが見つからないため、新しいユーザーを作成します');
      
      // clerk_idを生成（実際のClerkユーザーIDを使用するか、一時的なものを生成）
      const tempClerkId = user?.id || `temp-${uuidv4()}`;
      console.log('Clerk IDを設定します:', tempClerkId);
      
      // 明示的にUUIDを生成
      const userId = uuidv4();
      console.log('新しいユーザーIDを生成しました:', userId);
      
      // 管理者権限でユーザーを作成（RLSをバイパス）
      const { data: newUser, error: createUserError } = await supabaseAdmin
        .from('users')
        .insert([
          {
            id: userId, // 明示的にIDを指定
            email: email,
            name: name,
            clerk_id: tempClerkId, // ClerkユーザーIDまたは一時ID
            timezone: 'Asia/Tokyo',
            language_preference: language
          }
        ])
        .select();
        
      if (createUserError) {
        console.error('ユーザー作成エラー:', createUserError);
        
        // エラー詳細を詳しくログ出力
        console.error('エラーコード:', createUserError.code);
        console.error('エラーメッセージ:', createUserError.message);
        console.error('エラー詳細:', createUserError.details);
        
        // ユーザー作成に失敗した場合
        console.log('ユーザー作成に失敗したため、ゲスト予約として処理します');
        return null; // ゲスト予約用にnullを返す
      } else if (newUser && newUser.length > 0) {
        console.log('新しいユーザーを作成しました:', newUser[0].id);
        return newUser[0].id; // 作成したユーザーIDを返す
      } else {
        // 新しいユーザーが作成されなかった場合
        console.log('ユーザー作成失敗のため、ゲスト予約として処理します');
        return null; // ゲスト予約用にnullを返す
      }
    } catch (error) {
      console.error('ユーザー作成プロセスエラー:', error);
      console.log('エラー発生のため、ゲスト予約として処理します');
      return null; // エラー発生時もゲスト予約用にnullを返す
    }
  };
  */

  // フォームをリセットする関数
  const resetForm = () => {
    setDate('');
    setTime('');
    setPartySize('2');
    setEmail('');
    setName('');
    setPhone('');
    setErrors({});
    setIsSubmitting(false);
    setShowPaymentModal(false);
    setPaymentAmount(1000);
    setSelectedProductId('');
    setPaymentCompleted(false);
  };

  // 料金プラン選択時の処理
  const handlePlanSelect = (amount: number, planName?: string) => {
    console.log(`料金プラン選択: 金額=${amount}, プラン=${planName || 'デフォルト'}`);
    setPaymentAmount(amount);
  };

  // 料金プラン選択部分（価格一覧）
  const renderPricePlans = () => {
    // 13人以上の場合は表示しない
    if (isLargeGroup) {
      return null;
    }
    
    // partySize を数値に変換
    const partySizeNum = parseInt(partySize, 10);

    return (
      <div className="mt-6">
        
        {errors.submit && (
          <p className="text-sm text-red-500 mb-3">{errors.submit}</p>
        )}
        
        {/* EnhancedPricingPlansコンポーネントを使用 */}
        <EnhancedPricingPlans
          language={language}
          plans={[
            {
              id: 'small',
              name: language === 'ja' ? '少人数プラン' : language === 'en' ? 'Small Group Plan' : '소그룹 플랜',
              price: 1000,
              features: [
                language === 'ja' ? '1〜4名様向け' : language === 'en' ? 'For 1-4 people' : '1~4명을 위한 계획',
                language === 'ja' ? '基本予約サービス' : language === 'en' ? 'Basic reservation service' : '기본 예약 서비스'
              ],
              recommended: partySizeNum >= 1 && partySizeNum <= 4
            },
            {
              id: 'medium',
              name: language === 'ja' ? '中人数プラン' : language === 'en' ? 'Medium Group Plan' : '중간 그룹 플랜',
              price: 2000,
              features: [
                language === 'ja' ? '5〜8名様向け' : language === 'en' ? 'For 5-8 people' : '5~8명을 위한 계획',
                language === 'ja' ? '優先予約枠' : language === 'en' ? 'Priority booking' : '우선 예약'
              ],
              recommended: partySizeNum >= 5 && partySizeNum <= 8
            },
            {
              id: 'large',
              name: language === 'ja' ? '大人数プラン' : language === 'en' ? 'Large Group Plan' : '대형 그룹 플랜',
              price: 3000,
              features: [
                language === 'ja' ? '9〜12名様向け' : language === 'en' ? 'For 9-12 people' : '9~12명을 위한 계획',
                language === 'ja' ? 'VIPサポート付き' : language === 'en' ? 'With VIP support' : 'VIP 지원 포함'
              ],
              recommended: partySizeNum >= 9 && partySizeNum <= 12
            }
          ]}
          selectedPlanId={
            partySizeNum >= 1 && partySizeNum <= 4 ? 'small' :
            partySizeNum >= 5 && partySizeNum <= 8 ? 'medium' :
            partySizeNum >= 9 && partySizeNum <= 12 ? 'large' : 'small'
          }
          onSelectPlan={(planId: string) => {
            const amount = 
              planId === 'small' ? 1000 :
              planId === 'medium' ? 2000 :
              planId === 'large' ? 3000 : 1000;
            handlePlanSelect(amount, planId);
          }}
        />
      </div>
    );
  };
  
  // 大人数予約向けのコンポーネント
  const renderLargeGroupRequest = () => {
    if (!isLargeGroup) {
      return null;
    }
    
    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-3 text-amber-700">
          {language === 'en' 
            ? 'Large Group Reservation Request' 
            : language === 'ko' 
            ? '대규모 그룹 예약 요청' 
            : '大人数予約リクエスト'}
        </h3>
        
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-md mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-700">
                {language === 'ko' 
                  ? '13명 이상의 예약은 직접 문의가 필요합니다. 아래의 양식을 작성해 주세요.' 
                  : language === 'ja'
                  ? '13人以上のご予約は、直接お問い合わせが必要です。下記のフォームをご記入ください。'
                  : 'For reservations of 13 or more people, direct inquiry is required. Please fill out the form below.'}
              </p>
            </div>
          </div>
        </div>
        
        <button
          type="button"
          onClick={() => setShowRequestModal(true)}
          className="w-full bg-amber-500 text-white py-3 px-4 rounded-lg hover:bg-amber-600 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50"
        >
          {language === 'ko'
            ? '문의 양식 작성하기'
            : language === 'ja'
            ? 'お問い合わせフォームを開く'
            : 'Open Inquiry Form'}
        </button>
      </div>
    );
  };

  // Handler for inquiry submission, accepting a string comment
  const handleInquirySubmit = (comment: string) => {
    console.log('Inquiry submitted:', comment);
    // TODO: Implement actual submission logic (e.g., send to backend or email)
    // You might want to include other form data like name, email, phone, date, time
    // when sending the inquiry.
    setShowRequestModal(false); // Close modal after submission
    resetForm(); // Reset form after submission
  };

  // 支払いモーダルを閉じる際の処理
  const handlePaymentModalClose = () => {
    // 支払いモーダルを閉じる
    setShowPaymentModal(false);
    
    // 支払いが完了している場合はユーザーに通知
    if (paymentCompleted && !isSubmitting) {
      console.log('支払いは完了していますが、予約処理はまだ完了していません');
    }
  };

  // リクエストモーダルを閉じる際の処理
  const handleRequestModalClose = () => {
    console.log('リクエストモーダルを閉じます');
    setShowRequestModal(false);
    // フォームをリセット
    resetForm();
  };

  // Render loading state if Supabase is loading
  if (isSupabaseLoading || loading) {
    return <div>Loading...</div>; // Or a more sophisticated loading indicator
  }

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">
          {language === 'ko' 
            ? '레스토랑 정보를 찾을 수 없습니다' 
            : language === 'ja'
            ? 'レストラン情報が見つかりません'
            : 'Restaurant information not found'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ヘッダー */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center">
        <button
          onClick={onBack}
          className="mr-2 text-gray-600 hover:text-gray-800 transition-colors"
          aria-label="戻る"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-medium text-gray-900 flex-1 text-center">
          {language === 'ko' ? '예약하기' : language === 'ja' ? '予約する' : 'Make a Reservation'}
        </h1>
        <div className="w-8"></div> {/* バランスを取るための空の要素 */}
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 p-4 max-w-3xl mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b">
            {language === 'ko' 
              ? '예약 정보 입력' 
              : language === 'ja'
              ? '予約情報の入力'
              : 'Enter Reservation Details'}
          </h3>
          
          <div className="space-y-6">
            {/* Date */}
            <div className="bg-gray-50 p-4 rounded-lg transition-all hover:bg-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-[#FF8C00] mr-2" />
                  {language === 'ko' ? '예약일' : language === 'ja' ? '予約日' : 'Reservation Date'}
                </div>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent transition-all"
                min={new Date().toISOString().split('T')[0]}
                aria-label={language === 'ko' ? '예약일 선택' : language === 'ja' ? '予約日を選択' : 'Select reservation date'}
                title={language === 'ko' ? '예약일 선택' : language === 'ja' ? '予約日を選択' : 'Select reservation date'}
                required
              />
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
            </div>

            {/* Time */}
            <div className="bg-gray-50 p-4 rounded-lg transition-all hover:bg-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-[#FF8C00] mr-2" />
                  {language === 'ko' ? '예약 시간' : language === 'ja' ? '予約時間' : 'Reservation Time'}
                </div>
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent transition-all"
                aria-label={language === 'ko' ? '예약 시간 선택' : language === 'ja' ? '予約時間を選択' : 'Select reservation time'}
                title={language === 'ko' ? '예약 시간 선택' : language === 'ja' ? '予約時間を選択' : 'Select reservation time'}
                required
              >
                <option value="">
                  {language === 'ko' ? '시간 선택' : language === 'ja' ? '時間を 선택' : 'Select time'}
                </option>
                {Array.from({ length: 14 }, (_, i) => i + 10).map((hour) => (
                  <option key={hour} value={`${hour}:00`}>
                    {`${hour}:00`}
                  </option>
                ))}
              </select>
              {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
            </div>

            {/* Party Size */}
            <div className="bg-gray-50 p-4 rounded-lg transition-all hover:bg-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-[#FF8C00] mr-2" />
                  {language === 'ko' ? '인원 수' : language === 'ja' ? '人数' : 'Party Size'}
                </div>
              </label>
              <select
                value={partySize}
                onChange={(e) => setPartySize(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent transition-all"
                aria-label={language === 'ko' ? '인원 수 선택' : language === 'ja' ? '人数を選択' : 'Select party size'}
                title={language === 'ko' ? '인원 수 선택' : language === 'ja' ? '人数を選択' : 'Select party size'}
                required
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map((size) => (
                  <option key={size} value={size.toString()}>
                    {size} {language === 'ko' ? '명' : language === 'ja' ? '人' : 'people'}
                  </option>
                ))}
                <option key="more" value="21">
                  {language === 'ko' ? '21명 이상 (문의 필요)' : language === 'ja' ? '21人以上（要問合せ）' : '21+ people (contact required)'}
                </option>
              </select>
              {errors.partySize && <p className="text-red-500 text-sm mt-1">{errors.partySize}</p>}
            </div>

            {/* Name */}
            <div className="bg-gray-50 p-4 rounded-lg transition-all hover:bg-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-[#FF8C00] mr-2" />
                  {language === 'ko' ? '이름' : language === 'ja' ? 'お名前' : 'Name'}
                </div>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={language === 'ko' ? '이름을 입력하세요' : language === 'ja' ? 'お名前を入力してください' : 'Enter your name'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent transition-all"
                aria-label={language === 'ko' ? '이름 입력' : language === 'ja' ? 'お名前を入力' : 'Enter your name'}
                title={language === 'ko' ? '이름 입력' : language === 'ja' ? 'お名前を入力' : 'Enter your name'}
                required
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Phone */}
            <div className="bg-gray-50 p-4 rounded-lg transition-all hover:bg-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-[#FF8C00] mr-2" />
                  {language === 'ko' ? '전화번호' : language === 'ja' ? '電話番号' : 'Phone Number'}
                </div>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={language === 'ko' ? '전화번호를 입력하세요' : language === 'ja' ? '電話番号を入力してください' : 'Enter your phone number'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent transition-all"
                aria-label={language === 'ko' ? '전화번호 입력' : language === 'ja' ? '電話番号を入力' : 'Enter your phone number'}
                title={language === 'ko' ? '전화번호 입력' : language === 'ja' ? '電話番号を入力' : 'Enter your phone number'}
                required
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* Email */}
            <div className="bg-gray-50 p-4 rounded-lg transition-all hover:bg-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-[#FF8C00] mr-2" />
                  {language === 'ko' ? '이메일' : language === 'ja' ? 'メールアドレス' : 'Email'}
                </div>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={language === 'ko' ? '이메일을 입력하세요' : language === 'ja' ? 'メールアドレスを入力してください' : 'Enter your email'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent transition-all"
                aria-label={language === 'ko' ? '이메일 입력' : language === 'ja' ? 'メールアドレスを入力' : 'Enter your email'}
                title={language === 'ko' ? '이메일 입력' : language === 'ja' ? 'メールアドレスを入力' : 'Enter your email'}
                required
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Email入力欄の後に料金プランかお問い合わせフォームを表示 */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="text-lg font-medium text-gray-800 mb-4">
                {isLargeGroup
                  ? (language === 'ko' 
                      ? '대규모 예약 문의' 
                      : language === 'ja'
                      ? '大人数予約のお問い合わせ'
                      : 'Large Group Reservation Inquiry')
                  : (language === 'ko' 
                      ? '요금 플랜 선택' 
                      : language === 'ja'
                      ? '料金プランの選択'
                      : 'Select Payment Plan')
                }
              </h4>
              
              {/* 条件によって表示するコンポーネントを切り替え */}
              {isLargeGroup 
                ? renderLargeGroupRequest() 
                : renderPricePlans()
              }
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8">
            {/* エラーメッセージ表示 */}
            {errors.submit && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                <p>{errors.submit}</p>
              </div>
            )}
            
            {/* 支払い完了メッセージ */}
            {paymentCompleted && !isSubmitting && (
              <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 rounded">
                <p>
                  {language === 'ko' 
                    ? '결제가 완료되었습니다. 예약 처리를 기다려주세요...' 
                    : language === 'ja'
                    ? '支払いが完了しています。予約処理をお待ちください...'
                    : 'Payment completed. Waiting for reservation processing...'}
                </p>
              </div>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting || paymentCompleted}
              className={`w-full py-4 rounded-lg text-lg font-bold 
                shadow-lg hover:shadow-xl transition-all ${
                  paymentCompleted
                    ? 'bg-green-500 text-white disabled:opacity-70'
                    : 'bg-[#FF8C00] text-white hover:brightness-110 transform hover:scale-[1.02] disabled:opacity-50'
                }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {language === 'ko' ? '처리중...' : language === 'ja' ? '処理中...' : 'Processing...'}
                </span>
              ) : paymentCompleted ? (
                language === 'ko' ? '결제 완료됨' : language === 'ja' ? '支払い完了' : 'Payment Completed'
              ) : isLargeGroup ? (
                language === 'ko' ? '문의하기' : language === 'ja' ? 'お問い合わせする' : 'Submit Inquiry'
              ) : (
                language === 'ko' ? '예약하기' : language === 'ja' ? '予約する' : 'Make Reservation'
              )}
            </button>
          </div>
        </form>

        {/* Payment Modal */}
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={handlePaymentModalClose}
          onComplete={handlePaymentComplete}
          amount={paymentAmount}
          language={language}
          partySize={parseInt(partySize, 10)}
          metadata={reservationMetadata}
        />

        {/* 問い合わせモーダル - Pass corrected onSubmit prop */}
        {showRequestModal && (
          <RequestCommentModal
            isOpen={showRequestModal}
            onClose={handleRequestModalClose}
            language={language}
            onSubmit={handleInquirySubmit} // Pass the handler expecting a string
          />
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-xl font-bold mb-4 text-green-600">予約完了</h3>
              <p className="mb-4">{successMessage}</p>
              <p className="mb-4">予約番号: {lastReservationId}</p>
              <p className="mb-4">確認画面に移動しています...</p>
              <div className="flex justify-end">
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate(`/reservation/${lastReservationId || 'confirmation'}`);
                  }}
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}