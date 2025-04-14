import { NextResponse } from 'next/server';
import { sendAdminNotificationEmail } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // リクエストからデータを取得
    const { type, orderId, data, language } = await request.json();

    // 必要なデータの検証
    if (!orderId || !data) {
      return NextResponse.json(
        { success: false, message: '必要なデータが不足しています' },
        { status: 400 }
      );
    }

    console.log('管理者通知メール送信リクエスト:', { type, orderId, language });

    // 予約データの形式を整える
    const reservationData = {
      restaurantName: data.restaurantName || '',
      name: type === 'request' ? data.customerName : data.name,
      guests: data.numberOfPeople || data.guests || '1',
      date: data.date || '',
      time: data.time || '',
      phone: data.phone || data.customerName || '', // リクエストフォームには電話番号がない場合がある
      email: data.email || '',
      request: data.notes || data.request || ''
    };

    // メール送信
    const emailSuccess = await sendAdminNotificationEmail(
      reservationData,
      orderId,
      language === 'ko' ? 'ko' : 'ja'
    );

    if (!emailSuccess) {
      return NextResponse.json(
        { success: false, message: 'メール送信に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '管理者通知メールが送信されました'
    });

  } catch (error) {
    console.error('管理者通知処理中にエラーが発生:', error);
    return NextResponse.json(
      { success: false, message: '予期せぬエラーが発生しました', error },
      { status: 500 }
    );
  }
} 