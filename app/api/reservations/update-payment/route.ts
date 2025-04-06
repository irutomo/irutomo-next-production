import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // リクエストからデータを取得
    const { 
      reservationId,
      paypalOrderId,
      paypalTransactionId,
      paymentInfo
    } = await request.json();

    // 必須フィールドの検証
    if (!reservationId || !paypalOrderId) {
      return NextResponse.json(
        { success: false, message: '更新に必要な情報が不足しています' },
        { status: 400 }
      );
    }

    // Supabaseクライアントの取得
    const supabase = await createServerSupabaseClient();

    // 予約データの支払い情報を更新
    const { data, error } = await supabase
      .from('reservations')
      .update({
        payment_status: 'paid',
        paypal_order_id: paypalOrderId,
        paypal_transaction_id: paypalTransactionId,
        payment_method: 'paypal',
        payment_provider: 'paypal',
        payment_info: paymentInfo,
        paid_at: new Date().toISOString(),
        status: 'confirmed' // 支払いが完了したので予約を確定
      })
      .eq('id', reservationId)
      .select()
      .single();

    if (error) {
      console.error('予約支払い情報更新エラー:', error);
      return NextResponse.json(
        { success: false, message: '予約支払い情報の更新に失敗しました', error: error.message },
        { status: 500 }
      );
    }

    // 成功レスポンス
    return NextResponse.json({
      success: true,
      message: '予約支払い情報が更新されました',
      reservation: data
    });
  } catch (error) {
    console.error('予約支払い情報更新エラー:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: '予約支払い情報の更新中にエラーが発生しました',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 