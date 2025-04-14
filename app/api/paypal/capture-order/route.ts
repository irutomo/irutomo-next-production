import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/app/lib/supabase-server';

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
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

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
    
    // 予約情報をデータベースに保存
    try {
      // Next.js 15.3対応:非同期サーバークライアントの作成
      const supabase = await createServerSupabaseClient();
      
      // テスト用のユーザーID
      const testUserId = '11111111-1111-1111-1111-111111111111';
      
      // 予約情報を保存
      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .insert({
          user_id: testUserId,
          restaurant_id: reservationData.restaurantId,
          reservation_date: reservationData.date,
          reservation_time: reservationData.time,
          number_of_people: parseInt(reservationData.guests),
          status: 'confirmed',
          customer_name: reservationData.name,
          customer_email: reservationData.email,
          customer_phone: reservationData.phone,
          special_requests: reservationData.request || null,
          payment_status: 'completed',
          payment_id: captureData.id,
          payment_amount: captureData.purchase_units[0].payments.captures[0].amount.value,
          payment_currency: captureData.purchase_units[0].payments.captures[0].amount.currency_code
        })
        .select()
        .single();

      if (reservationError) {
        console.error('予約保存エラー:', reservationError);
        return NextResponse.json(
          { success: false, message: '予約の保存に失敗しました', error: reservationError },
          { status: 500 }
        );
      }

      // レストラン情報の取得（メールに含めるため）
      let restaurantName = '指定なし';
      if (reservationData.restaurantId) {
        const { data: restaurant } = await supabase
          .from('restaurants')
          .select('name')
          .eq('id', reservationData.restaurantId)
          .single();

        if (restaurant) {
          restaurantName = restaurant.name;
        }
      }

      // 管理者に通知メールを送信
      try {
        // 現在のURL（オリジン）を取得
        const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        
        // 管理者通知APIを呼び出す
        const notificationResponse = await fetch(`${origin}/api/notifications/admin-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'reservation',
            orderId: captureData.id,
            data: {
              ...reservationData,
              restaurantName: restaurantName
            },
            // 言語設定を取得（ユーザーの入力言語から推測）
            language: /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(reservationData.name) ? 'ko' : 'ja'
          }),
        });

        if (notificationResponse.ok) {
          console.log('管理者への通知メール送信API呼び出し成功');
        } else {
          console.error('管理者通知API呼び出しエラー:', await notificationResponse.text());
        }
      } catch (emailError) {
        // メール送信エラーはログに記録するが、予約処理自体は続行する
        console.error('管理者通知API呼び出しエラー:', emailError);
      }

      return NextResponse.json({
        success: true,
        message: '支払いと予約が完了しました',
        reservation: reservation,
        captureData: captureData
      });

    } catch (error) {
      console.error('予約処理中にエラーが発生:', error);
      return NextResponse.json(
        { success: false, message: '予約処理中にエラーが発生しました', error },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('予約処理中に予期せぬエラーが発生:', error);
    return NextResponse.json(
      { success: false, message: '予期せぬエラーが発生しました', error },
      { status: 500 }
    );
  }
} 