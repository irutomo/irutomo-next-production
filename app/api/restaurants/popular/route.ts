import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  console.log('人気レストランAPIリクエスト処理開始');
  
  // 環境変数のチェック
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('環境変数エラー: NEXT_PUBLIC_SUPABASE_URL が設定されていません');
    return NextResponse.json(
      { success: false, message: '環境変数が正しく設定されていません' },
      { status: 500 }
    );
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('環境変数エラー: NEXT_PUBLIC_SUPABASE_ANON_KEY が設定されていません');
    return NextResponse.json(
      { success: false, message: '環境変数が正しく設定されていません' },
      { status: 500 }
    );
  }
  
  console.log('環境変数チェック完了: URL と ANON_KEY が設定されています');
  
  try {
    // クラウド版Supabaseに直接接続（サービスロールキーではなく匿名キーを使用）
    console.log('Supabaseクライアント作成開始...');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );
    
    console.log('Supabaseクライアント作成完了');
    
    // 人気レストラン取得クエリ実行
    console.log('人気レストラン取得クエリ実行開始...');
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('rating', { ascending: false })
      .limit(6);

    if (error) {
      console.error('クエリエラー:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: `データ取得失敗: ${error.message}`,
          code: error.code,
          details: error.details,
        },
        { status: 500 }
      );
    }

    // データが存在しない場合は空配列を返す
    if (!restaurants || restaurants.length === 0) {
      console.log('レストランデータが見つかりませんでした');
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    console.log('データ取得成功:', restaurants.length, '件');
    return NextResponse.json({
      success: true,
      data: restaurants
    });
    
  } catch (error) {
    console.error('予期せぬエラー:', error);
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    return NextResponse.json(
      { success: false, message: `サーバーエラー: ${errorMessage}` },
      { status: 500 }
    );
  }
}