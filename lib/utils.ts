import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 日付のフォーマット関数
export function formatReservationDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    return dateString || '不明な日時';
  }
}

// 予約IDのフォーマット関数
export function formatReservationId(id: string): string {
  if (!id) return 'ID-UNKNOWN';
  
  // 短いIDの場合はそのまま返す
  if (id.length <= 8) return `ID-${id.toUpperCase()}`;
  
  // 長いIDは短縮して表示
  return `ID-${id.substring(0, 8).toUpperCase()}`;
}
