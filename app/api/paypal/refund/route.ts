import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/app/lib/supabase';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// 環境変数から接続情報を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 静的エクスポート設定
export const dynamic = 'force-dynamic';
// export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    // リクエストボディの解析
    const body = await request.json();
    const { captureId, amount, reason, reservationId } = body;

    // パラメータの検証
    if (!captureId) {
      return NextResponse.json(
        { success: false, message: 'キャプチャIDが必要です' },
        { status: 400 }
      );
    }

    if (!reservationId) {
      return NextResponse.json(
        { success: false, message: '予約IDが必要です' },
        { status: 400 }
      );
    }

    // 認証の確認（Supabaseを使用）
    const cookieStore = cookies();
    
    // Supabaseクライアントを初期化
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          cookie: cookieStore.toString(),
        },
      },
    });
    
    // 現在のセッション情報を取得
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      console.error('認証情報取得エラー:', authError);
      return NextResponse.json(
        { success: false, message: '認証が必要です' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;

    // 環境変数の確認
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('PayPal認証情報が設定されていません');
      return NextResponse.json(
        { success: false, message: 'PayPal認証情報が不足しています' },
        { status: 500 }
      );
    }

    // PayPal APIエンドポイント (環境に応じて切り替え)
    const paypalEndpoint = process.env.NODE_ENV === 'production' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com';
    
    console.log('PayPal APIエンドポイント (返金処理):', paypalEndpoint);

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
      console.error('PayPalトークン取得エラー:', await tokenResponse.text());
      return NextResponse.json(
        { success: false, message: 'PayPalアクセストークンの取得に失敗しました' },
        { status: 500 }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 返金処理の実行
    const refundResponse = await fetch(`${paypalEndpoint}/v2/payments/captures/${captureId}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        amount: {
          value: amount,
          currency_code: 'JPY'
        },
        note_to_payer: reason || '予約のキャンセル'
      })
    });

    if (!refundResponse.ok) {
      const errorText = await refundResponse.text();
      console.error('PayPal返金エラー:', {
        status: refundResponse.status,
        statusText: refundResponse.statusText,
        body: errorText
      });
      
      return NextResponse.json(
        { 
          success: false, 
          message: '返金処理に失敗しました', 
          details: errorText
        },
        { status: 500 }
      );
    }

    const refundResult = await refundResponse.json();
    
    // Supabaseに予約情報を更新
    const adminSupabase = await createServerSupabaseClient();
    
    // 予約テーブルのステータスを更新
    const { error: reservationUpdateError } = await adminSupabase
      .from('reservations')
      .update({
        payment_status: 'refunded',
        status: 'cancelled',
        updated_at: new Date().toISOString(),
        cancel_reason: reason || 'キャンセル'
      })
      .eq('id', reservationId);
    
    if (reservationUpdateError) {
      console.error('予約ステータスの更新に失敗しました:', reservationUpdateError);
    }

    return NextResponse.json({ 
      success: true, 
      message: '返金処理が完了しました',
      refundId: refundResult.id,
      refundData: refundResult
    });
    
  } catch (error) {
    console.error('返金処理中にエラーが発生しました:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: '返金処理中にエラーが発生しました',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 