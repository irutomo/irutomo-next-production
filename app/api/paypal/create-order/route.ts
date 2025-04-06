import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // リクエストからデータを取得
    const { amount, currency = 'JPY', restaurantId } = await request.json();

    // 必要なデータの検証
    if (!amount || !restaurantId) {
      return NextResponse.json(
        { success: false, message: '金額とレストランIDが必要です' },
        { status: 400 }
      );
    }

    // 環境変数の確認
    const clientId = process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_SECRET_KEY;

    console.log('PayPal設定の確認:', { 
      clientIdExists: !!clientId, 
      clientSecretExists: !!clientSecret,
      clientId: clientId?.substring(0, 10) + '...',  // セキュリティのため一部のみ表示
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
    const paypalEndpoint = 'https://api-m.paypal.com';
    
    console.log('PayPal APIエンドポイント:', paypalEndpoint);

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
      console.error('PayPalトークン取得エラー:', {
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

    console.log('PayPalアクセストークン取得成功');

    // 注文の作成
    const orderResponse = await fetch(`${paypalEndpoint}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: restaurantId,
            description: 'IRUTOMO予約手数料',
            custom_id: `restaurant_${restaurantId}`,
            amount: {
              currency_code: currency,
              value: amount.toString()
            }
          }
        ],
        application_context: {
          brand_name: 'IRUTOMO',
          user_action: 'PAY_NOW',
          return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/restaurants/${restaurantId}`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/restaurants/${restaurantId}`
        }
      })
    });

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.error('PayPal注文作成エラー:', {
        status: orderResponse.status,
        statusText: orderResponse.statusText,
        body: errorText
      });
      
      return NextResponse.json(
        { 
          success: false, 
          message: '注文の作成に失敗しました', 
          details: errorText
        },
        { status: 500 }
      );
    }

    const orderData = await orderResponse.json();
    console.log('PayPal注文作成成功:', orderData.id);
    
    return NextResponse.json({ 
      success: true, 
      orderId: orderData.id,
      orderData: orderData
    });
    
  } catch (error) {
    console.error('注文作成中にエラーが発生しました:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: '注文作成中にエラーが発生しました',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 