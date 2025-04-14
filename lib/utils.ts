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

type ReservationData = {
  restaurantId?: string;
  restaurantName?: string;
  name: string;
  guests: string;
  date: string;
  time: string;
  phone: string;
  email: string;
  request?: string;
};

/**
 * 管理者に予約通知メールを送信する
 * API経由でメール送信を行うように変更（Vercel環境で実行可能にするため）
 */
export async function sendAdminNotificationEmail(
  reservation: ReservationData,
  orderId: string,
  language: 'ko' | 'ja' = 'ja'
): Promise<boolean> {
  try {
    // 日付をフォーマット
    const formattedDate = new Date(reservation.date).toLocaleDateString(
      language === 'ko' ? 'ko-KR' : 'ja-JP',
      { year: 'numeric', month: 'long', day: 'numeric' }
    );

    // メールAPI呼び出し
    // Resendなどの外部サービスのAPIを呼び出すか、自前のバックエンドサーバーを使用するなど
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY || ''}`,
      },
      body: JSON.stringify({
        from: 'IRUTOMO予約システム <reservation@irutomo.com>',
        to: 'gespokrofficial@gmail.com',
        subject: language === 'ko'
          ? `[IRUTOMO] 새로운 예약이 완료되었습니다 - ${reservation.name}님`
          : `[IRUTOMO] 新しい予約が完了しました - ${reservation.name}様`,
        html: language === 'ko'
          ? `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #FFA500; border-bottom: 2px solid #FFA500; padding-bottom: 10px;">새로운 예약이 완료되었습니다</h2>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>예약 ID:</strong> ${orderId}</p>
              <p><strong>레스토랑:</strong> ${reservation.restaurantName || '지정되지 않음'}</p>
              <p><strong>고객 이름:</strong> ${reservation.name}</p>
              <p><strong>인원 수:</strong> ${reservation.guests}명</p>
              <p><strong>날짜:</strong> ${formattedDate}</p>
              <p><strong>시간:</strong> ${reservation.time}</p>
              <p><strong>전화번호:</strong> ${reservation.phone}</p>
              <p><strong>이메일:</strong> ${reservation.email}</p>
              <p><strong>요청사항:</strong> ${reservation.request || '없음'}</p>
            </div>
            
            <p style="color: #555;">이 예약을 처리해 주세요.</p>
            
            <div style="margin-top: 30px; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 10px;">
              <p>IRUTOMO 예약 시스템에서 자동으로 발송된 메일입니다.</p>
            </div>
          </div>
          `
          : `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #FFA500; border-bottom: 2px solid #FFA500; padding-bottom: 10px;">新しい予約が完了しました</h2>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>予約ID:</strong> ${orderId}</p>
              <p><strong>レストラン:</strong> ${reservation.restaurantName || '指定なし'}</p>
              <p><strong>お客様名:</strong> ${reservation.name}</p>
              <p><strong>人数:</strong> ${reservation.guests}人</p>
              <p><strong>日付:</strong> ${formattedDate}</p>
              <p><strong>時間:</strong> ${reservation.time}</p>
              <p><strong>電話番号:</strong> ${reservation.phone}</p>
              <p><strong>メール:</strong> ${reservation.email}</p>
              <p><strong>リクエスト:</strong> ${reservation.request || 'なし'}</p>
            </div>
            
            <p style="color: #555;">この予約を処理してください。</p>
            
            <div style="margin-top: 30px; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 10px;">
              <p>IRUTOMOの予約システムから自動送信されました。</p>
            </div>
          </div>
          `,
      }),
    });

    if (!response.ok) {
      console.error('メール送信APIエラー:', await response.text());
      return false;
    }

    console.log('管理者通知メール送信成功');
    return true;
  } catch (error) {
    console.error('管理者通知メール送信エラー:', error);
    return false;
  }
}
