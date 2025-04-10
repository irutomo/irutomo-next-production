import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    // Supabase環境変数を取得
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('Supabase環境変数詳細:');
    console.log('Supabase URL:', supabaseUrl);
    console.log('Supabase Service Key (最初の10文字):', supabaseServiceKey ? supabaseServiceKey.substring(0, 10) + '...' : '未設定');
    
    // 環境変数のバリデーション
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        message: 'Supabase環境変数が設定されていません',
        details: {
          hasUrl: !!supabaseUrl,
          hasServiceKey: !!supabaseServiceKey,
          env: process.env.NODE_ENV,
          allEnvKeys: Object.keys(process.env).filter(key => 
            key.includes('SUPABASE') || key.includes('PUBLIC')
          )
        }
      }, { status: 500 });
    }
    
    // Supabaseクライアントの作成
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // すべてのテーブル一覧を取得
    const { data: tables, error: tablesError } = await supabase
      .from('pg_catalog.pg_tables')
      .select('schemaname, tablename')
      .eq('schemaname', 'public');
      
    if (tablesError) {
      console.error('テーブル一覧取得エラー:', tablesError);
      
      // テーブル情報取得に失敗した場合、単純なクエリを試す
      const { data: testData, error: testError } = await supabase
        .from('restaurants')
        .select('count(*)', { count: 'exact' });
        
      if (testError) {
        return NextResponse.json({
          success: false,
          message: 'Supabase接続テスト失敗',
          error: testError.message,
          hint: testError.hint,
          code: testError.code
        }, { status: 500 });
      }
      
      return NextResponse.json({
        success: true,
        message: 'テーブル一覧取得失敗、レストラン数取得成功',
        count: testData,
        error: tablesError.message
      });
    }
    
    // テーブル情報の取得成功
    return NextResponse.json({
      success: true,
      message: 'Supabase接続テスト成功',
      tables: tables,
      tableNames: tables.map(t => t.tablename)
    });
    
  } catch (error) {
    console.error('テスト接続エラー:', error);
    return NextResponse.json({
      success: false,
      message: 'テストエンドポイントでエラーが発生しました',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 