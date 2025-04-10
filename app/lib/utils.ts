// 予約ステータス表示用のユーティリティ関数

/**
 * 予約ステータスに対応するテキストとスタイルクラスを返す
 */
export function getReservationStatusText(status: string): { text: string; colorClass: string } {
  switch (status) {
    case 'pending':
      return { text: '保留中', colorClass: 'bg-yellow-100 text-yellow-800' };
    case 'confirmed':
      return { text: '確定', colorClass: 'bg-green-100 text-green-800' };
    case 'canceled':
      return { text: 'キャンセル', colorClass: 'bg-red-100 text-red-800' };
    case 'completed':
      return { text: '完了', colorClass: 'bg-blue-100 text-blue-800' };
    case 'no_show':
      return { text: '無断キャンセル', colorClass: 'bg-gray-100 text-gray-800' };
    default:
      return { text: '未定義', colorClass: 'bg-gray-100 text-gray-800' };
  }
}

/**
 * 支払いステータスに対応するテキストとスタイルクラスを返す
 */
export function getPaymentStatusText(status: string): { text: string; colorClass: string } {
  switch (status) {
    case 'unpaid':
      return { text: '未払い', colorClass: 'bg-red-100 text-red-800' };
    case 'paid':
      return { text: '支払済', colorClass: 'bg-green-100 text-green-800' };
    case 'refunded':
      return { text: '返金済', colorClass: 'bg-blue-100 text-blue-800' };
    case 'partial_refund':
      return { text: '一部返金', colorClass: 'bg-blue-100 text-blue-800' };
    default:
      return { text: '未定義', colorClass: 'bg-gray-100 text-gray-800' };
  }
}

/**
 * 日付文字列をフォーマットする
 */
export function formatDate(dateStr: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(dateStr);
  const defaultOptions: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'short'
  };
  
  return date.toLocaleDateString('ja-JP', options || defaultOptions);
}

/**
 * 値段を日本円形式にフォーマットする
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY'
  }).format(price);
} 