import React, { useRef, useEffect, useCallback, useState } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import type { PayPalButtonsComponentProps } from '@paypal/react-paypal-js';
import { logPayPalError, clearPayPalSandboxSession } from '../../../../shared/utils/paypal-integration';
import type { PayPalErrorContext } from '../../../../shared/utils/paypal-integration';
import { Button } from '../../../components/ui/button';
import { RotateCw, AlertTriangle, RefreshCw } from 'lucide-react';

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
  const [{ isPending, isResolved, isRejected, options }] = usePayPalScriptReducer();
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
        options: JSON.stringify(options),
        errorType,
        retryCount: retryCountRef.current
      }
    };

    logPayPalError(errorInstance, errorContext);
    if (onError) onError(errorInstance);
  }, [onError, reservationId, amount, currency, options]);

  // グローバルエラー監視
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      // PayPal関連エラーのみをフィルタリング
      const paypalError = event.filename?.includes('paypal') || 
                         event.message?.toLowerCase().includes('paypal');
      
      if (paypalError) {
        handleError(event, 'global');
      }
    };

    window.addEventListener('error', handleGlobalError);
    return () => window.removeEventListener('error', handleGlobalError);
  }, [handleError]);

  // エラー状態リセット
  useEffect(() => {
    if (isRetrying) {
      const retryTimer = setTimeout(() => {
        setIsRetrying(false);
        setErrorDetails(null);
      }, 2000);
      
      return () => clearTimeout(retryTimer);
    }
  }, [isRetrying]);

  // 注文作成処理 - ベストプラクティスの適用
  const createOrder = useCallback(async (_: unknown, actions: any) => {
    if (!actions?.order) {
      throw new Error('PayPal actions.order is undefined');
    }

    try {
      // PayPalベストプラクティス: intentパラメータを明示的に指定
      return await actions.order.create({
        intent: "CAPTURE", // 明示的に即時支払いを指定
        purchase_units: [{
          description: paymentDescription || '予約の支払い',
          amount: {
            value: typeof amount === 'number' ? amount.toString() : amount,
            currency_code: currency
          },
          custom_id: reservationId,
          ...(metadata ? { custom: JSON.stringify(metadata) } : {})
        }],
        // PayPalベストプラクティス: Pay Nowエクスペリエンス実装
        application_context: {
          user_action: "PAY_NOW", // 明示的なPay Now体験の実装
          shipping_preference: "NO_SHIPPING", // 配送情報入力不要
          brand_name: "イルトモ222レストラン", // ブランド名の表示
          landing_page: "BILLING", // 請求ページから開始
          locale: "ja-JP", // 日本語ロケールを優先
          return_url: window.location.href, // 現在のページに戻る
          cancel_url: window.location.href // キャンセル時も現在のページに戻る
        }
      });
    } catch (error) {
      handleError(error, 'createOrder');
      throw error;
    }
  }, [amount, currency, paymentDescription, reservationId, metadata, handleError]);

  // 支払い承認処理 - エラーハンドリング強化
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
    
    // 少し待ってからリトライ状態を解除
    setTimeout(() => {
      setIsRetrying(false);
      setErrorDetails(null);
    }, 1500);
  };

  // エラーメッセージの表示とリトライボタン
  const renderErrorState = () => {
    if (!errorDetails) return null;
    
    // エラータイプに応じたメッセージとアクション
    let errorMessage = errorDetails.message;
    let actionMessage = 'もう一度試す';
    
    if (errorDetails.type === 'SESSION_ERROR') {
      errorMessage = 'PayPalセッションに問題が発生しました。セッションをリセットしてもう一度お試しください。';
      actionMessage = 'セッションをリセットして再試行';
    } else if (errorDetails.type === 'NETWORK_ERROR') {
      errorMessage = 'インターネット接続に問題があります。接続を確認してもう一度お試しください。';
    } else if (errorDetails.type === 'INITIALIZATION_ERROR') {
      errorMessage = 'PayPalの読み込みに問題が発生しました。ページを更新してもう一度お試しください。';
      actionMessage = 'PayPalを再読み込み';
    }
    
    return (
      <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 text-sm text-red-800">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{errorMessage}</p>
            {errorDetails.code && (
              <p className="text-xs mt-1 text-red-600">エラーコード: {errorDetails.code}</p>
            )}
          </div>
        </div>
        <div className="mt-3">
          <Button 
            size="sm" 
            variant="outline" 
            className="bg-white text-red-700 border-red-300 hover:bg-red-50"
            onClick={handleRetry}
            disabled={isRetrying}
          >
            {isRetrying ? (
              <>
                <RotateCw className="h-3 w-3 mr-1 animate-spin" />
                処理中...
              </>
            ) : (
              <>
                <RefreshCw className="h-3 w-3 mr-1" />
                {actionMessage}
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="paypal-checkout-container">
      {errorDetails && renderErrorState()}
      
      {!errorDetails && isResolved && (
        <PayPalButtons {...buttonOptions} />
      )}
      
      {!errorDetails && isPending && (
        <div className="bg-gray-50 border border-gray-200 rounded p-4 text-center text-gray-500">
          <div className="flex justify-center mb-2">
            <RotateCw className="h-5 w-5 animate-spin" />
          </div>
          PayPalを読み込み中...
        </div>
      )}
      
      {!errorDetails && isRejected && (
        <div className="bg-red-50 border border-red-200 rounded p-4 text-center text-red-700">
          PayPalの読み込みに失敗しました。ページを更新してもう一度お試しください。
        </div>
      )}
    </div>
  );
};

export default PayPalCheckout; 