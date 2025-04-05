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
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  try {
    // 通貨に応じたフォーマット
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency,
      minimumFractionDigits: currency === 'JPY' ? 0 : 2,
      maximumFractionDigits: currency === 'JPY' ? 0 : 2
    }).format(numAmount);
  } catch (error) {
    // フォーマットに失敗した場合はシンプルな表示
    console.error('通貨フォーマットエラー:', error);
    return `${currency === 'JPY' ? '¥' : currency === 'USD' ? '$' : ''}${numAmount}`;
  }
}; 