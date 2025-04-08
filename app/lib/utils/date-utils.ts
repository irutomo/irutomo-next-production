/**
 * 日付を日本語形式にフォーマットする
 * @param dateString 日付文字列
 * @returns yyyy年MM月dd日 形式の文字列
 */
export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  return `${year}年${month}月${day}日`;
}

/**
 * 日時を日本語形式にフォーマットする
 * @param dateString 日付文字列
 * @returns yyyy年MM月dd日 HH:mm 形式の文字列
 */
export function formatDateTime(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${year}年${month}月${day}日 ${hours}:${minutes}`;
}

/**
 * 日付を yyyy-MM-dd 形式にフォーマット
 * @param date 日付オブジェクト
 * @returns yyyy-MM-dd 形式の文字列
 */
export function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * 今日から指定日数後の日付を取得
 * @param days 日数
 * @returns 指定日数後の日付
 */
export function getDaysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * 指定日が過去かどうかをチェック
 * @param date チェックする日付
 * @returns 過去の日付の場合はtrue
 */
export function isPastDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  
  return date < today;
}

/**
 * 2つの日付の差（日数）を取得
 * @param date1 日付1
 * @param date2 日付2
 * @returns 日数差
 */
export function getDaysDifference(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
} 