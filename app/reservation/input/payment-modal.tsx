'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

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
  amount: number;
  currency?: string;
  title?: string;
  description?: string;
  reservationId?: string;
  onSuccess?: (details: PayPalOrderDetails) => void;
  onError?: (err: Error) => void;
  onCancel?: () => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  amount,
  currency = 'JPY',
  title,
  description,
  reservationId,
  onSuccess,
  onError,
  onCancel
}: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccessful, setIsSuccessful] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // 金額のフォーマット
  const formatCurrency = (value: number | string, currencyCode: string = 'JPY'): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    try {
      return new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: currencyCode === 'JPY' ? 0 : 2
      }).format(numValue);
    } catch (error) {
      console.error('金額フォーマットエラー:', error);
      return `${currencyCode} ${numValue}`;
    }
  };

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
    if (e.target === e.currentTarget && !isProcessing) {
      onClose();
    }
  };

  // PayPalボタンの代替 (実際の実装ではPayPalのSDKを使用)
  const PayPalButtonMock = () => (
    <button 
      onClick={() => {
        setIsProcessing(true);
        setTimeout(() => {
          // 実際の実装では、ここでPayPalの支払い処理を行います
          const mockOrderDetails: PayPalOrderDetails = {
            id: `order_${Math.random().toString(36).substring(2, 10)}`,
            status: 'COMPLETED',
            purchase_units: [
              {
                amount: {
                  value: amount.toString(),
                  currency_code: currency
                },
                description: description
              }
            ],
            create_time: new Date().toISOString()
          };
          handleSuccess(mockOrderDetails);
        }, 1500);
      }}
      className="w-full bg-[#0070ba] hover:bg-[#003087] text-white font-medium py-3 px-4 rounded flex items-center justify-center"
      disabled={isProcessing}
    >
      {isProcessing ? (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          処理中...
        </span>
      ) : (
        <>
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 6v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          PayPalで支払う
        </>
      )}
    </button>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* モーダルヘッダー */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-bold text-gray-900">
            {title || 'お支払い'}
          </h3>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* モーダルコンテンツ */}
        <div className="p-6">
          {/* 金額表示 */}
          <div className="mb-6 text-center">
            <p className="text-sm text-gray-500 mb-1">お支払い金額:</p>
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
              <span className="ml-2 text-gray-600">決済処理中...</span>
            </div>
          )}

          {/* エラー表示 */}
          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4" role="alert">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
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
                    決済エラー
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error.message}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => setError(null)}
                  className="text-sm text-red-600 font-medium hover:underline"
                >
                  再試行
                </button>
              </div>
            </div>
          )}

          {/* 成功表示 */}
          {isSuccessful && (
            <div className="rounded-md bg-green-50 p-4 mb-4" role="alert">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
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
                    お支払いが完了しました
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>ありがとうございます。お支払いが正常に処理されました。</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  閉じる
                </button>
              </div>
            </div>
          )}

          {/* PayPalボタン */}
          {!isSuccessful && !isProcessing && (
            <div className="mt-4">
              <PayPalButtonMock />
              
              <div className="text-center mt-4">
                <button
                  onClick={onCancel}
                  className="text-sm text-gray-500 hover:text-gray-700"
                  disabled={isProcessing}
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 