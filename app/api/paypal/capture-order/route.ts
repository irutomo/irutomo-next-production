import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/app/lib/supabase-server';
import { v4 as uuidv4 } from 'uuid';

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

        // Supabaseクライアント情報をログ出力（デバッグ用）
        console.log('Supabaseクライアント設定確認:', {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0
        });

        // 支払い情報の取得
        const paymentInfo = captureData.purchase_units[0].payments.captures[0];
        const captureId = paymentInfo.id;
        const paymentAmount = paymentInfo.amount.value;
        
        console.log('予約データ:', {
          restaurantId: reservationData.restaurantId,
          guestName: reservationData.name,
          date: reservationData.date,
          captureId
        });

        // 一意の支払いIDを生成
        const paymentId = `payment_${orderId}_${captureId}`;
        
        // メールアドレスがある場合は既存ユーザーを検索、なければゲストユーザーとして処理
        let userId = null;
        let isExistingUser = false;
        
        if (reservationData.email) {
          // メールアドレスでユーザーを検索
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', reservationData.email)
            .maybeSingle();
          
          if (existingUser) {
            // 既存ユーザーがいればそのIDを使用
            userId = existingUser.id;
            isExistingUser = true;
            console.log('既存ユーザーが見つかりました:', userId);
          } else {
            try {
              // 新規ユーザーを作成（認証なし）
              const { data: newUser, error: userError } = await supabase
                .from('users')
                .insert({
                  email: reservationData.email,
                  name: reservationData.name,
                  phone: reservationData.phone,
                  payment_id: paymentId,
                  is_guest: true,
                  metadata: {
                    first_order: orderId,
                    first_capture: captureId
                  }
                })
                .select()
                .single();
              
              if (userError) {
                console.error('ユーザー作成エラー:', userError);
              } else {
                userId = newUser.id;
                console.log('新規ユーザー作成:', userId);
              }
            } catch (userCreateError) {
              console.error('ユーザー作成中に例外が発生:', userCreateError);
              // ユーザー作成に失敗しても予約処理を継続
            }
          }
        }
        
        // JSONデータをサニタイズ（ネストされたオブジェクトの文字列化）
        const safePaymentInfo = JSON.parse(JSON.stringify(captureData));
        
        // データベース保存用に必要な情報だけを抽出
        const paymentInfoForDb = {
          id: safePaymentInfo.id,
          status: safePaymentInfo.status,
          create_time: safePaymentInfo.create_time,
          update_time: safePaymentInfo.update_time,
          payment_source: safePaymentInfo.payment_source ? {
            type: safePaymentInfo.payment_source.paypal ? 'paypal' : 'unknown'
          } : null,
          amount: paymentInfo.amount.value,
          currency_code: paymentInfo.amount.currency_code,
          capture_id: paymentInfo.id
        };
        
        try {
          // 予約データの作成
          console.log('予約データをデータベースに保存します:', {
            restaurantId: reservationData.restaurantId,
            userId,
            isExistingUser,
            captureId
          });
          
          const { data: reservation, error } = await supabase
            .from('reservations')
            .insert({
              restaurant_id: reservationData.restaurantId,
              user_id: userId, // ユーザーIDがあれば関連付け
              guest_name: reservationData.name,
              guest_email: reservationData.email,
              guest_phone: reservationData.phone,
              reservation_date: reservationData.date,
              reservation_time: reservationData.time,
              number_of_people: parseInt(reservationData.guests),
              notes: reservationData.request || null,
              paypal_order_id: orderId,
              paypal_transaction_id: captureId,
              payment_amount: paymentAmount,
              payment_status: 'paid',
              paid_at: new Date().toISOString(),
              guest_payment_id: paymentId,
              is_guest_reservation: !isExistingUser,
              status: 'pending',
              payment_method: 'paypal',
              payment_provider: 'paypal',
              payment_info: paymentInfoForDb
            })
            .select()
            .single();
          
          if (error) {
            console.error('予約データの保存エラー詳細:', {
              code: error.code,
              message: error.message,
              details: error.details,
              hint: error.hint,
              isRLSError: error.message?.includes('violates row-level security policy'),
              serviceKeyUsed: !!process.env.SUPABASE_SERVICE_ROLE_KEY
            });
            
            // RLSエラーの場合、専用のエラーメッセージを表示
            if (error.message?.includes('violates row-level security policy')) {
              return NextResponse.json(
                { 
                  success: false, 
                  message: '支払いは完了しましたが、データベースのセキュリティポリシーによって予約データの保存が拒否されました',
                  error: 'RLSポリシー違反: ' + error.message,
                  captureId: captureId,
                  orderId: orderId
                },
                { status: 500 }
              );
            }
            
            return NextResponse.json(
              { 
                success: false, 
                message: '支払いは完了しましたが、予約データの保存に失敗しました',
                error: error.message,
                captureId: captureId,
                orderId: orderId
              },
              { status: 500 }
            );
          }
          
          console.log('予約データ保存成功:', reservation.id);
          
          try {
            // PayPalトランザクション情報を保存
            const { error: transactionError } = await supabase
              .from('paypal_transactions')
              .insert({
                user_id: userId,
                reservation_id: reservation.id,
                transaction_type: 'payment',
                status: 'completed',
                amount: paymentAmount,
                paypal_order_id: orderId,
                paypal_payment_id: captureId,
                completed_at: new Date().toISOString()
              });
            
            if (transactionError) {
              console.error('トランザクション情報保存エラー:', transactionError);
              // トランザクション情報の保存に失敗しても予約は完了しているので処理を継続
            }
          } catch (transactionError) {
            console.error('トランザクション情報保存中に例外が発生:', transactionError);
            // トランザクション情報の保存に失敗しても予約は完了しているので処理を継続
          }
          
          return NextResponse.json({ 
            success: true, 
            message: '支払いと予約が完了しました',
            captureId: paymentInfo.id,
            reservationId: reservation.id,
            captureData
          });
        } catch (reservationError) {
          console.error('予約データ作成中に例外が発生:', reservationError);
          return NextResponse.json(
            { 
              success: false, 
              message: '支払いは完了しましたが、予約データの作成中に例外が発生しました',
              error: reservationError instanceof Error ? reservationError.message : String(reservationError),
              captureId: captureData.purchase_units[0].payments.captures[0].id,
              orderId: orderId
            },
            { status: 500 }
          );
        }
      } catch (dbError) {
        console.error('データベース操作エラー:', dbError);
        return NextResponse.json(
          { 
            success: false, 
            message: '支払いは完了しましたが、データベース操作に失敗しました',
            error: dbError instanceof Error ? dbError.message : String(dbError),
            captureId: captureData.purchase_units[0].payments.captures[0].id,
            orderId: orderId
          },
          { status: 500 }
        );
      }
    }
    
    // captureIdがない場合は代わりにorderIdだけを返す
    return NextResponse.json({ 
      success: true, 
      message: '支払いが完了しました',
      orderId: orderId
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