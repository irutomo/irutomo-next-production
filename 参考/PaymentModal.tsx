import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../../../shared/utils/paypal-integration';
import PayPalCheckout from './PayPalCheckout';

// PayPalの注文詳細の型定義
interface PayPalOrderDetails {
  id: string;
  status: string;
  purchase_units: Array<{
    reference_id?: string;
    amount: {
      value: string;
      currency_code: string;
    };
    description?: string;
    custom_id?: string;
  }>;
  payer?: {
    email_address?: string;
    payer_id?: string;
    name?: {
      given_name?: string;
      surname?: string;
    };
  };
  create_time?: string;
  update_time?: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number | string;
  currency?: string;
  title?: string;
  description?: string;
  reservationId?: string;
  metadata?: Record<string, unknown>;
  onSuccess?: (details: PayPalOrderDetails) => void;
  onError?: (err: Error) => void;
  onCancel?: () => void;
  language?: 'ja' | 'ko' | 'en';
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  currency = 'JPY',
  title,
  description,
  reservationId,
  metadata = {},
  onSuccess,
  onError,
  onCancel,
  language
}) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccessful, setIsSuccessful] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  // 多言語対応のテキスト取得関数
  const getLocalizedText = (key: string): string => {
    const locTexts: Record<string, Record<string, string>> = {
      en: {
        title: 'Payment',
        amount: 'Payment Amount:',
        processing: 'Processing payment...',
        error: 'Payment Error',
        retry: 'Try Again',
        success: 'Payment Completed',
        successMessage: 'Thank you. Your payment has been processed successfully.',
        close: 'Close'
      },
      ja: {
        title: 'お支払い',
        amount: 'お支払い金額:',
        processing: '決済処理中...',
        error: '決済エラー',
        retry: '再試行',
        success: 'お支払いが完了しました',
        successMessage: 'ありがとうございます。お支払いが正常に処理されました。',
        close: '閉じる'
      },
      ko: {
        title: '결제',
        amount: '결제 금액:',
        processing: '결제 처리 중...',
        error: '결제 오류',
        retry: '다시 시도',
        success: '결제가 완료되었습니다',
        successMessage: '감사합니다. 결제가 성공적으로 처리되었습니다.',
        close: '닫기'
      }
    };
    
    // 言語設定またはブラウザ言語を使用
    const userLang = language || (navigator.language.startsWith('ja') ? 'ja' : navigator.language.startsWith('ko') ? 'ko' : 'en');
    return locTexts[userLang]?.[key] || locTexts['en'][key] || key;
  };
  
  // 環境変数やブラウザ状態を確認するデバッグ情報（開発環境のみ）
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('PaymentModal デバッグ情報:', {
        clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID ? '設定済み' : '未設定',
        mode: import.meta.env.VITE_PAYPAL_MODE || 'production',
        language,
        browserLanguage: navigator.language,
        currency,
        amount
      });
    }
  }, [language, currency, amount]);

  // モーダルが開いていない場合は何も表示しない
  if (!isOpen) return null;

  // 成功ハンドラー
  const handleSuccess = (details: PayPalOrderDetails) => {
    console.log('支払い成功:', details);
    setIsSuccessful(true);
    setIsProcessing(false);
    setError(null);
    
    // 成功コールバックが指定されている場合は呼び出す
    if (onSuccess) {
      onSuccess(details);
    }
  };

  // エラーハンドラー
  const handleError = (err: Error) => {
    console.error('支払いエラー:', err);
    setError(err);
    setIsProcessing(false);
    setIsSuccessful(false);
    
    // エラーコールバックが指定されている場合は呼び出す
    if (onError) {
      onError(err);
    }
  };

  // キャンセルハンドラー
  const handleCancel = () => {
    console.log('支払いキャンセル');
    setError(null);
    setIsProcessing(false);
    setIsSuccessful(false);
    
    // キャンセルコールバックが指定されている場合は呼び出す
    if (onCancel) {
      onCancel();
    }
  };

  // モーダル外のクリックでクローズ
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      // 処理中は閉じないようにする
      if (!isProcessing) {
        onClose();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="payment-modal-title"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* モーダルヘッダー */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 id="payment-modal-title" className="text-xl font-bold text-gray-900">
            {title || getLocalizedText('title')}
          </h3>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label={getLocalizedText('close')}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* モーダルコンテンツ */}
        <div className="p-6">
          {/* 金額表示 */}
          <div className="mb-6 text-center">
            <p className="text-sm text-gray-500 mb-1">{getLocalizedText('amount')}</p>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(amount, currency)}
            </p>
            {description && (
              <p className="mt-2 text-sm text-gray-600">{description}</p>
            )}
          </div>

          {/* 処理中の表示 */}
          {isProcessing && !error && !isSuccessful && (
            <div className="flex justify-center items-center py-4" aria-live="polite">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#3B82F6] border-t-transparent" aria-hidden="true" />
              <span className="ml-2 text-gray-600">{getLocalizedText('processing')}</span>
            </div>
          )}

          {/* エラー表示 */}
          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4" role="alert" aria-live="assertive">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {getLocalizedText('error')}
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error.message}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      onClick={() => {
                        setError(null);
                        setIsProcessing(false);
                      }}
                    >
                      {getLocalizedText('retry')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 成功表示 */}
          {isSuccessful && (
            <div className="rounded-md bg-green-50 p-4 mb-4" role="status" aria-live="polite">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    {getLocalizedText('success')}
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>{getLocalizedText('successMessage')}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      onClick={onClose}
                    >
                      {getLocalizedText('close')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PayPalボタン */}
          {!isSuccessful && (
            <div className="mt-4">
              <PayPalCheckout
                amount={amount}
                currency={currency}
                onSuccess={handleSuccess}
                onError={handleError}
                onCancel={handleCancel}
                paymentDescription={description}
                reservationId={reservationId}
                metadata={metadata}
                disabled={isProcessing}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;