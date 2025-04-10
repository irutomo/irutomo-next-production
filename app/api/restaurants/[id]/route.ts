import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { params } = context;
    
    // 環境変数の確認
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('環境変数の詳細確認 (レストラン詳細):');
    console.log('Supabase URL:', supabaseUrl);
    console.log('Supabase Service Key (最初の10文字):', supabaseServiceKey ? supabaseServiceKey.substring(0, 10) + '...' : '未設定');
    console.log('要求されたレストランID:', params.id);
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Supabase環境変数が設定されていません',
          details: {
            hasUrl: !!supabaseUrl,
            hasServiceKey: !!supabaseServiceKey,
            urlValue: supabaseUrl,
            serviceKeyPrefix: supabaseServiceKey ? supabaseServiceKey.substring(0, 5) + '...' : null
          }
        },
        { status: 500 }
      );
    }
    
    // UUIDの形式チェック
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (params.id && !uuidRegex.test(params.id)) {
      return NextResponse.json(
        { 
          success: false, 
          message: '無効なUUID形式です',
          id: params.id
        },
        { status: 400 }
      );
    }
    
    // Supabaseクライアントの作成（サービスロールキーを使用）
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // IDに基づいてレストラン情報を取得
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', params.id)
      .single();
    
    if (error) {
      console.error('レストラン詳細の取得エラー:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'レストラン詳細の取得に失敗しました', 
          error: error.message,
          hint: error.hint,
          details: {
            id: params.id,
            supabaseUrl: supabaseUrl,
            serviceKeyValid: typeof supabaseServiceKey === 'string' && supabaseServiceKey.length > 20
          }
        },
        { status: error.code === 'PGRST116' ? 404 : 500 }
      );
    }
    
    if (!data) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'レストランが見つかりませんでした',
          id: params.id
        },
        { status: 404 }
      );
    }
    
    // 成功レスポンス
    return NextResponse.json({
      success: true,
      message: 'レストラン詳細を正常に取得しました',
      data,
      environment: process.env.NODE_ENV
    });
    
  } catch (error) {
    console.error('予期せぬエラーが発生しました:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: '予期せぬエラーが発生しました',
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 