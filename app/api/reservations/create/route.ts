import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // リクエストからデータを取得
    const { 
      restaurantId, 
      date, 
      time, 
      partySize, 
      name, 
      email, 
      phone, 
      notes, 
      amount 
    } = await request.json();

    // 必須フィールドの検証
    if (!restaurantId || !date || !time || !partySize || !name || !email) {
      return NextResponse.json(
        { success: false, message: '予約に必要な情報が不足しています' },
        { status: 400 }
      );
    }

    // Supabaseクライアントの取得
    const supabase = await createServerSupabaseClient();

    // 予約データをreservationsテーブルに挿入
    const { data, error } = await supabase
      .from('reservations')
      .insert([
        {
          restaurant_id: restaurantId,
          reservation_date: date,
          reservation_time: time,
          number_of_people: partySize,
          guest_name: name,
          guest_email: email,
          guest_phone: phone,
          notes: notes,
          payment_amount: amount,
          status: 'pending',
          payment_status: 'unpaid'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('予約データ保存エラー:', error);
      return NextResponse.json(
        { success: false, message: '予約データの保存に失敗しました', error: error.message },
        { status: 500 }
      );
    }

    // PayPal注文を作成（サーバーサイドで処理）
    try {
      // PayPal APIリクエストではなく、予約IDをそのまま返す（決済はクライアント側で処理）
      // クライアントサイドでPayPalボタンを直接使用するため、サーバーサイドでの注文作成はスキップ
      console.log('予約データが保存されました - PayPal決済は直接クライアントで処理します。');
    } catch (paypalError) {
      console.error('PayPal注文作成エラー:', paypalError);
      // PayPal注文作成に失敗しても予約情報は保存済みなので、予約IDは返す
    }

    // 成功レスポンス
    return NextResponse.json({
      success: true,
      message: '予約情報が保存されました',
      reservationId: data.id,
      reservation: data
    });
  } catch (error) {
    console.error('予約作成処理エラー:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: '予約処理中にエラーが発生しました',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 