'use client';

import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../lib/utils/paypal-integration';
import PayPalCheckout from './PayPalCheckout';
import { PayPalOrderDetails } from './PayPalCheckout';
import { AlertCircle, X } from 'lucide-react';

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
  content?: () => React.ReactElement;
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
  language = 'ja',
  content
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
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ? '設定済み' : '未設定',
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
  const handleSuccess = async (details: PayPalOrderDetails) => {
    console.log('支払い成功:', details);
    setIsSuccessful(true);
    setIsProcessing(false);
    setError(null);
    
    try {
      // 支払い情報をデータベースに更新
      if (reservationId) {
        const response = await fetch('/api/reservations/update-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reservationId,
            paypalOrderId: details.id,
            paypalTransactionId: details.id, // あるいは別のトランザクションID
            paymentInfo: {
              order_id: details.id,
              status: details.status,
              amount: details.purchase_units[0]?.amount?.value,
              currency: details.purchase_units[0]?.amount?.currency_code,
              create_time: details.create_time,
              update_time: details.update_time,
              payer_email: details.payer?.email_address,
              payer_id: details.payer?.payer_id,
              payer_name: details.payer?.name ? `${details.payer.name.given_name || ''} ${details.payer.name.surname || ''}`.trim() : undefined
            }
          }),
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          console.error('支払い情報の更新に失敗しました:', result);
          // エラーがあっても処理は続行（支払い自体は成功しているため）
        } else {
          console.log('支払い情報が更新されました:', result);
        }
      } else {
        console.warn('予約IDがないため支払い情報を更新できません');
      }
    } catch (error) {
      console.error('支払い情報更新エラー:', error);
      // 支払い情報の更新に失敗しても、ユーザー側のフローは続行する
    }
    
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
    
    // サードパーティCookieに関するエラーメッセージを検出
    const message = err.message.toLowerCase();
    const isCookieError = message.includes('cookie') || 
                          message.includes('third party') || 
                          message.includes('third-party') ||
                          message.includes('rejected') ||
                          message.includes('initiate_payment_reject');
    
    if (isCookieError) {
      // サードパーティCookie関連のエラーを特別に処理
      const cookieError = new Error(
        `サードパーティCookieの制限によりPayPal決済が処理できません。以下をお試しください：\n
        1. Chrome設定 > プライバシーとセキュリティ > Cookie設定を確認\n
        2. 別のブラウザ（FirefoxやSafari）をお試しください。\n
        3. お使いのブラウザでサードパーティCookieを一時的に許可してください。`
      );
      setError(cookieError);
    }
    
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
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* カスタムコンテンツがある場合はそれを表示、なければデフォルトコンテンツを表示 */}
        {content ? (
          content()
        ) : (
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
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent" aria-hidden="true" />
                <span className="ml-2 text-gray-600">{getLocalizedText('processing')}</span>
              </div>
            )}

            {/* エラー表示 */}
            {error && (
              <div className="rounded-md bg-red-50 p-4 mb-4" role="alert" aria-live="assertive">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {getLocalizedText('error')}
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error.message}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 成功表示 */}
            {isSuccessful ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  {getLocalizedText('success')}
                </h4>
                <p className="text-gray-600 mb-4">
                  {getLocalizedText('successMessage')}
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  {getLocalizedText('close')}
                </button>
              </div>
            ) : (
              // PayPalチェックアウト
              <div className="py-2">
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
        )}
      </div>
    </div>
  );
};

export default PaymentModal; 