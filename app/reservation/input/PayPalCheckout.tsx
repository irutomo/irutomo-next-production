'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import type { PayPalButtonsComponentProps } from '@paypal/react-paypal-js';
import { logPayPalError, clearPayPalSandboxSession } from '../../lib/utils/paypal-integration';
import type { PayPalErrorContext } from '../../lib/utils/paypal-integration';
import { Button } from '@/components/ui/button';
import { RotateCw, AlertTriangle, RefreshCw } from 'lucide-react';

// PayPalの注文詳細の型定義
export interface PayPalOrderDetails {
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

// PayPalエラーのタイプを定義
type PayPalErrorType = 
  | 'SESSION_ERROR'        // セッション関連の問題
  | 'NETWORK_ERROR'        // ネットワーク接続の問題
  | 'PAYMENT_ERROR'        // 支払い処理中の問題 
  | 'INITIALIZATION_ERROR' // 初期化中の問題
  | 'UNKNOWN_ERROR';       // 不明なエラー

interface PayPalCheckoutProps {
  amount: number | string;
  currency?: string;
  onSuccess?: (details: PayPalOrderDetails) => void;
  onError?: (err: Error) => void;
  onCancel?: () => void;
  paymentDescription?: string;
  reservationId?: string;
  metadata?: Record<string, unknown>;
  buttonStyle?: Record<string, unknown>;
  disabled?: boolean;
}

const PayPalCheckout: React.FC<PayPalCheckoutProps> = ({
  amount,
  currency = 'JPY',
  onSuccess,
  onError,
  onCancel,
  paymentDescription,
  reservationId,
  metadata,
  buttonStyle,
  disabled = false
}) => {
  const [{ isPending, isResolved, isRejected }] = usePayPalScriptReducer();
  const mountTimeStamp = useRef<string>(Date.now().toString());
  const [errorDetails, setErrorDetails] = useState<{message: string, code?: string, type?: PayPalErrorType} | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const retryCountRef = useRef<number>(0);
  const maxRetries = 3;

  // エラーハンドリング関数
  const handleError = useCallback((error: unknown, action: string) => {
    const errorInstance = error instanceof Error ? error : new Error(String(error));
    console.error(`PayPalエラー (${action}):`, errorInstance);
    
    // エラーコードの抽出
    const errorCode = typeof error === 'object' && error !== null && 'code' in error
      ? String((error as {code: unknown}).code)
      : 'UNKNOWN_ERROR';
    
    // エラータイプの判定
    let errorType: PayPalErrorType = 'UNKNOWN_ERROR';
    const errorMessage = errorInstance.message.toLowerCase();
    
    if (errorMessage.includes('session') || errorMessage.includes('cookie') || errorMessage.includes('token')) {
      errorType = 'SESSION_ERROR';
    } else if (errorMessage.includes('network') || errorMessage.includes('connection') || errorMessage.includes('timeout')) {
      errorType = 'NETWORK_ERROR';
    } else if (errorMessage.includes('payment') || errorMessage.includes('transaction') || errorMessage.includes('order')) {
      errorType = 'PAYMENT_ERROR';
    } else if (errorMessage.includes('init') || errorMessage.includes('load') || errorMessage.includes('script')) {
      errorType = 'INITIALIZATION_ERROR';
    }
    
    // UI表示用エラー情報を設定
    setErrorDetails({
      message: errorInstance.message,
      code: errorCode,
      type: errorType
    });
    
    const errorContext: PayPalErrorContext = {
      action,
      component: 'PayPalCheckout',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      metadata: {
        reservationId,
        amount,
        currency,
        errorType,
        retryCount: retryCountRef.current
      }
    };

    logPayPalError(errorInstance, errorContext);
    if (onError) onError(errorInstance);
  }, [onError, reservationId, amount, currency]);

  // 注文作成処理
  const createOrder = useCallback(async (_: unknown, actions: any) => {
    if (!actions?.order) {
      throw new Error('PayPal actions.order is undefined');
    }

    try {
      return await actions.order.create({
        intent: "CAPTURE", // 即時支払いを指定
        purchase_units: [{
          description: paymentDescription || '予約の支払い',
          amount: {
            value: typeof amount === 'number' ? amount.toString() : amount,
            currency_code: currency
          },
          custom_id: reservationId,
          ...(metadata ? { custom: JSON.stringify(metadata) } : {})
        }],
        application_context: {
          user_action: "PAY_NOW", 
          shipping_preference: "NO_SHIPPING",
          brand_name: "イルトモレストラン",
          landing_page: "BILLING",
          locale: "ja-JP",
          return_url: window.location.href,
          cancel_url: window.location.href
        }
      });
    } catch (error) {
      handleError(error, 'createOrder');
      throw error;
    }
  }, [amount, currency, paymentDescription, reservationId, metadata, handleError]);

  // 支払い承認処理
  const onApprove = useCallback(async (data: any, actions: any) => {
    if (!actions?.order) {
      throw new Error('PayPal actions.order is undefined');
    }

    try {
      const details = await actions.order.capture();
      console.log('支払い成功:', details);
      if (onSuccess) onSuccess(details as PayPalOrderDetails);
      // 成功したらエラー情報とリトライカウンターをリセット
      setErrorDetails(null);
      retryCountRef.current = 0;
      return details;
    } catch (error) {
      // エラーの詳細情報を強化
      const errorMessage = error instanceof Error 
        ? error.message
        : typeof error === 'string'
          ? error
          : '支払い処理中に問題が発生しました。もう一度お試しください。';
      
      handleError(new Error(errorMessage), 'onApprove');
      throw error;
    }
  }, [onSuccess, handleError]);

  const buttonOptions: PayPalButtonsComponentProps = {
    style: buttonStyle || {
      layout: 'vertical',
      color: 'gold',
      shape: 'rect',
      label: 'paypal'
    },
    disabled: disabled || isPending || isRetrying,
    forceReRender: [amount.toString(), currency, mountTimeStamp.current],
    createOrder,
    onApprove,
    onError: (err) => handleError(err, 'button'),
    onCancel: () => {
      console.log('支払いがキャンセルされました');
      if (onCancel) onCancel();
    }
  };

  // セッションエラーのクリア処理
  const handleRetry = () => {
    // 最大リトライ回数をチェック
    if (retryCountRef.current >= maxRetries) {
      alert('複数回試行しても問題が解決しない場合は、ブラウザを再起動するか、別のブラウザをお試しください。');
      return;
    }
    
    setIsRetrying(true);
    retryCountRef.current += 1;
    
    // セッションエラーの場合はセッションをクリア
    if (errorDetails?.type === 'SESSION_ERROR') {
      clearPayPalSandboxSession();
    }
    
    // コンポーネントの再マウント用にタイムスタンプを更新
    mountTimeStamp.current = Date.now().toString();
    
    // リトライ後のリセット処理
    setTimeout(() => {
      setIsRetrying(false);
      setErrorDetails(null);
    }, 1000);
  };

  // エラー表示のレンダリング
  const renderErrorState = () => {
    return (
      <div className="border border-red-300 rounded p-4 bg-red-50 text-red-700 space-y-3">
        <div className="flex items-start">
          <div className="shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-2">
            <h4 className="text-sm font-medium">決済処理中にエラーが発生しました</h4>
            <p className="text-xs mt-1">{errorDetails?.message || 'PayPalとの通信中に問題が発生しました。'}</p>
          </div>
        </div>
        <div className="flex justify-center pt-2">
          <Button
            onClick={handleRetry}
            variant="outline"
            size="sm"
            className="bg-white hover:bg-gray-100 text-red-600 border-red-300"
            disabled={isRetrying}
          >
            {isRetrying ? (
              <>
                <RotateCw className="mr-1 h-4 w-4 animate-spin" />
                再試行中...
              </>
            ) : (
              <>
                <RefreshCw className="mr-1 h-4 w-4" />
                もう一度試す
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="paypal-checkout-container">
      {/* エラー表示 */}
      {errorDetails && renderErrorState()}
      
      {/* ローディング表示 */}
      {isPending && !errorDetails && (
        <div className="flex justify-center items-center py-4 text-gray-500">
          <RotateCw className="animate-spin mr-2 h-5 w-5" />
          PayPal決済を読み込み中...
        </div>
      )}
      
      {/* PayPalボタン */}
      {!errorDetails && (
        <div className={`${isPending ? 'opacity-0 h-0' : 'opacity-100'} transition-opacity`}>
          <PayPalButtons {...buttonOptions} />
        </div>
      )}
    </div>
  );
};

export default PayPalCheckout; 