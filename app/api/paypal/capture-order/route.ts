import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // リクエストからデータを取得
    const { orderId, reservationData } = await request.json();

    // 必要なデータの検証
    if (!orderId) {
      return NextResponse.json(
        { success: false, message: '注文IDが必要です' },
        { status: 400 }
      );
    }

    // 環境変数の確認
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_SECRET_KEY;

    console.log('PayPal設定の確認 (キャプチャ処理):', { 
      clientIdExists: !!clientId, 
      clientSecretExists: !!clientSecret,
      environment: process.env.NODE_ENV
    });

    if (!clientId || !clientSecret) {
      console.error('PayPal認証情報が設定されていません');
      return NextResponse.json(
        { success: false, message: 'PayPal認証情報が不足しています' },
        { status: 500 }
      );
    }

    // PayPal APIエンドポイント
    const paypalEndpoint = process.env.NODE_ENV === 'production' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com';
    
    console.log('PayPal APIエンドポイント (キャプチャ処理):', paypalEndpoint);

    // アクセストークンの取得
    const tokenResponse = await fetch(`${paypalEndpoint}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: 'grant_type=client_credentials'
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('PayPalトークン取得エラー (キャプチャ処理):', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        response: errorText
      });
      return NextResponse.json(
        { success: false, message: 'PayPalアクセストークンの取得に失敗しました', details: errorText },
        { status: 500 }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    console.log('PayPalアクセストークン取得成功 (キャプチャ処理)');

    // 注文のキャプチャ
    const captureResponse = await fetch(`${paypalEndpoint}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!captureResponse.ok) {
      const errorText = await captureResponse.text();
      console.error('PayPal注文キャプチャエラー:', {
        status: captureResponse.status,
        statusText: captureResponse.statusText,
        body: errorText
      });
      
      return NextResponse.json(
        { 
          success: false, 
          message: '支払いの処理に失敗しました', 
          details: errorText
        },
        { status: 500 }
      );
    }

    const captureData = await captureResponse.json();
    console.log('PayPal支払いキャプチャ成功:', captureData.id);
    
    // 支払いが完了した場合、予約データをデータベースに保存
    if (reservationData && captureData.status === 'COMPLETED') {
      try {
        const supabase = await createServerSupabaseClient();

        // 支払い情報の取得
        const paymentInfo = captureData.purchase_units[0].payments.captures[0];
        const captureId = paymentInfo.id;
        const paymentAmount = paymentInfo.amount.value;
        
        console.log('Supabaseに予約データを保存します:', {
          restaurantId: reservationData.restaurantId,
          guestName: reservationData.name,
          date: reservationData.date,
          captureId
        });
        
        // 予約データの作成
        const { data: reservation, error } = await supabase
          .from('reservations')
          .insert({
            restaurant_id: reservationData.restaurantId,
            guest_name: reservationData.name,
            guest_email: reservationData.email,
            guest_phone: reservationData.phone,
            reservation_date: reservationData.date,
            reservation_time: reservationData.time,
            guests: parseInt(reservationData.guests),
            special_request: reservationData.request || null,
            paypal_order_id: orderId,
            paypal_capture_id: captureId,
            payment_amount: paymentAmount,
            payment_status: 'completed',
            status: 'pending'
          } as any)
          .select()
          .single();
        
        if (error) {
          console.error('予約データの保存エラー:', error);
          return NextResponse.json(
            { 
              success: false, 
              message: '支払いは完了しましたが、予約データの保存に失敗しました',
              captureData 
            },
            { status: 500 }
          );
        }
        
        console.log('予約データ保存成功:', reservation.id);
        
        return NextResponse.json({ 
          success: true, 
          message: '支払いと予約が完了しました',
          captureId: paymentInfo.id,
          reservationId: reservation.id,
          captureData
        });
      } catch (dbError) {
        console.error('データベース操作エラー:', dbError);
        return NextResponse.json(
          { 
            success: false, 
            message: '支払いは完了しましたが、データベース操作に失敗しました',
            captureData 
          },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: '支払いが完了しました',
      captureData
    });
    
  } catch (error) {
    console.error('支払い処理中にエラーが発生しました:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: '支払い処理中にエラーが発生しました',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 