'use client';

/**
 * PayPal決済に関連するユーティリティ関数
 */

export interface PayPalErrorContext {
  action: string;
  component: string;
  timestamp: string;
  userAgent: string;
  url: string;
  metadata: Record<string, unknown>;
}

/**
 * PayPalエラーをログに記録する関数
 */
export const logPayPalError = (error: Error, context: PayPalErrorContext): void => {
  console.error('[PayPal Error]', {
    message: error.message,
    stack: error.stack,
    ...context
  });
  
  // 実際の実装では、ここでサーバーにエラーログを送信します
};

/**
 * PayPalサンドボックスのセッションをクリアする関数
 */
export const clearPayPalSandboxSession = (): void => {
  try {
    // PayPalのクッキーをクリア
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.split('=');
      if (name.trim().startsWith('paypal')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
    
    // ローカルストレージもクリア
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('paypal')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('PayPalセッションをクリアしました');
  } catch (error) {
    console.error('PayPalセッションのクリアに失敗しました:', error);
  }
};

/**
 * 金額をフォーマットする関数
 */
export const formatCurrency = (amount: number | string, currency = 'JPY'): string => {
  // 数値に変換
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  try {
    // 言語とロケールを決定
    const locale = typeof navigator !== 'undefined' && navigator.language
      ? navigator.language
      : 'ja-JP';
    
    // 通貨記号付きでフォーマット
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'JPY' ? 0 : 2,
      maximumFractionDigits: currency === 'JPY' ? 0 : 2,
    }).format(numAmount);
  } catch (error) {
    console.error('通貨フォーマットエラー:', error);
    // フォールバック（シンプルな文字列連結）
    return currency === 'JPY' 
      ? `¥${Math.round(numAmount).toLocaleString()}`
      : `${numAmount.toFixed(2)} ${currency}`;
  }
};

// エラーメッセージをユーザーフレンドリーな形式に変換
export const getUserFriendlyErrorMessage = (error: Error | unknown): string => {
  const defaultMessage = 'お支払い処理中にエラーが発生しました。もう一度お試しください。';
  
  if (!error) return defaultMessage;
  
  const errorMessage = error instanceof Error 
    ? error.message 
    : typeof error === 'string' 
      ? error 
      : JSON.stringify(error);
    
  // サードパーティCookieエラーの検出
  if (errorMessage.toLowerCase().includes('cookie') ||
      errorMessage.toLowerCase().includes('third party') ||
      errorMessage.toLowerCase().includes('third-party')) {
    return 'ブラウザのプライバシー設定によりPayPal決済ができません。他のブラウザを使用するか、サードパーティCookieを許可してください。';
  }
  
  // ネットワークエラーの検出
  if (errorMessage.toLowerCase().includes('network') ||
      errorMessage.toLowerCase().includes('connection')) {
    return 'ネットワーク接続エラーが発生しました。インターネット接続を確認してからもう一度お試しください。';
  }
  
  // PayPal特有のエラーコード
  if (errorMessage.includes('INSTRUMENT_DECLINED')) {
    return '支払い方法が拒否されました。別の支払い方法を選択してください。';
  }
  
  if (errorMessage.includes('PAYER_ACTION_REQUIRED')) {
    return '追加の情報が必要です。PayPalの指示に従ってください。';
  }
  
  return defaultMessage;
};

// ブラウザがCookieをサポートしているか確認
export const checkCookieSupport = (): boolean => {
  try {
    // テストクッキーを設定
    document.cookie = 'cookietest=1; SameSite=None; Secure';
    const hasCookie = document.cookie.indexOf('cookietest=') !== -1;
    
    // テストクッキーを削除
    document.cookie = 'cookietest=1; SameSite=None; Secure; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    
    return hasCookie;
  } catch (e) {
    console.error('Cookie検証エラー:', e);
    return false;
  }
};

// ブラウザがサードパーティCookieの制限がある可能性があるか確認
export const hasThirdPartyCookieRestrictions = (): boolean => {
  // Chromeでは2024年以降サードパーティCookieが制限される
  const isChrome = typeof navigator !== 'undefined' && /Chrome/.test(navigator.userAgent) && !/Edg|Edge/.test(navigator.userAgent);
  const chromeVersion = isChrome ? parseInt((navigator.userAgent.match(/Chrome\/([0-9]+)/) || ['', '0'])[1], 10) : 0;
  
  // Chrome 118以降では徐々にサードパーティCookieの制限が導入されている
  return isChrome && chromeVersion >= 118;
}; 