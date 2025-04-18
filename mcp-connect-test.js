// Supabase MCPサーバーへの接続テスト
require('dotenv').config({ path: '.env.development' });
const { createClient } = require('@supabase/supabase-js');

// 環境変数の検証
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

console.log('Supabase環境変数:');
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '正しく設定されています' : '設定がありません');

// Supabaseクライアントの作成
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: true,
    },
    db: {
      schema: 'public',
    },
    debug: true,
  }
);

// MCPサーバーの設定
const mcpConfig = {
  maxConnections: 10,
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  heartbeatInterval: 5000, // 5 seconds
  debug: true,
  logLevel: 'debug',
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'IRUTOMO reserve'
};

// テストメッセージの送信
async function sendTestMessage() {
  console.log('Supabase MCPサーバーに接続してテストメッセージを送信します...');
  
  try {
    // テストメッセージの作成
    const testMessage = {
      type: 'REQUEST',
      payload: {
        action: 'TEST_CONNECTION',
        message: 'MCPサーバー接続テスト',
        timestamp: new Date().toISOString()
      },
      timestamp: Date.now(),
      environment: mcpConfig.environment,
      appName: mcpConfig.appName
    };

    console.log('送信するテストメッセージ:', testMessage);

    // Supabaseにメッセージを保存
    const { data, error } = await supabase
      .from('mcp_messages')
      .insert([
        {
          type: testMessage.type,
          payload: testMessage.payload,
          timestamp: testMessage.timestamp,
          environment: testMessage.environment,
          app_name: testMessage.appName,
        },
      ])
      .select();

    if (error) {
      console.error('Supabaseへのメッセージ挿入エラー:', error);
      console.error('エラーコード:', error.code);
      console.error('エラー詳細:', error.details);
      console.error('エラーメッセージ:', error.message);
      
      // テーブルが存在しない場合は別のエラーメッセージが表示される
      if (error.code === '42P01') { // TABLE_NOT_FOUND
        console.log('テーブルが存在しません。Supabase管理画面でテーブルを作成してください。');
        console.log('以下のSQLを実行してテーブルを作成できます:');
        console.log(`
          CREATE TABLE IF NOT EXISTS public.mcp_messages (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            type TEXT NOT NULL,
            payload JSONB NOT NULL,
            timestamp BIGINT NOT NULL,
            environment TEXT,
            app_name TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `);
      }
      throw error;
    }

    console.log('テストメッセージを送信しました。応答:', data);

    // 最新のメッセージを取得
    const { data: messages, error: fetchError } = await supabase
      .from('mcp_messages')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(5);

    if (fetchError) {
      console.error('Supabaseからのメッセージ取得エラー:', fetchError);
      throw fetchError;
    }

    console.log('最新のメッセージ一覧:', messages);
    
    return { success: true, messages };
  } catch (error) {
    console.error('MCPサーバー接続エラー:', error);
    return { success: false, error };
  }
}

// メインの実行関数
async function main() {
  try {
    console.log('Supabase接続テストを開始します...');
    
    // まず簡単なユーザー取得テスト
    console.log('ユーザーテーブルの接続テスト...');
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('認証テストエラー:', userError);
    } else {
      console.log('認証テスト成功:', userData ? 'ユーザー情報取得' : 'ユーザー未認証');
    }
    
    // レストランテーブルテスト
    console.log('レストランテーブルの接続テスト...');
    const { data: testData, error: testError } = await supabase
      .from('restaurants')
      .select('id, name')
      .limit(1);
    
    if (testError) {
      console.error('Supabase接続テストエラー:', testError);
      console.error('エラーコード:', testError.code);
      console.error('エラー詳細:', testError.details);
      console.error('エラーメッセージ:', testError.message);
      throw testError;
    }
    
    console.log('Supabase接続に成功しました！restaurants テーブルのデータサンプル:', testData);
    
    // テーブル一覧の取得を試みる
    console.log('利用可能なテーブル一覧を取得します...');
    try {
      // 直接SQL実行（権限がある場合のみ）
      const { data: tables, error: tablesError } = await supabase
        .rpc('get_tables');
      
      if (tablesError) {
        console.error('テーブル一覧取得エラー:', tablesError);
      } else {
        console.log('利用可能なテーブル:', tables);
      }
    } catch (error) {
      console.error('テーブル一覧取得中のエラー:', error);
    }
    
    // mcp_messagesテーブルのテスト
    console.log('MCPメッセージテーブルの接続テスト...');
    console.log('完全なエラー情報を表示します...');
    
    try {
      // まずテーブルの存在確認（RAW SQL）
      const { data: tableExists, error: tableExistsError } = await supabase.rpc(
        'check_table_exists',
        { table_name: 'mcp_messages' }
      );
      
      if (tableExistsError) {
        console.log('テーブル存在確認エラー:', tableExistsError);
        console.log('直接SQLを使用してテーブル存在確認を試みます...');
        
        // 直接テーブルアクセスを試みる
        console.log('mcp_messagesテーブルへの直接アクセスを試みます...');
      }
      
      // 標準的なテーブルアクセス
      const { data: mcpData, error: mcpError } = await supabase
        .from('mcp_messages')
        .select('*')
        .limit(1);
      
      if (mcpError) {
        console.error('MCPテーブル接続エラー:', JSON.stringify(mcpError, null, 2));
        
        // エラー詳細表示
        if (mcpError.code === '42501') {
          console.log('権限エラーです。RLSポリシーを確認してください。');
          
          // 対処策の表示
          console.log('Supabaseコンソールで以下を実行してください:');
          console.log(`
ALTER TABLE public.mcp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "匿名ユーザーの挿入を許可" ON public.mcp_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "匿名ユーザーの選択を許可" ON public.mcp_messages
  FOR SELECT USING (true);
          `);
        } else if (mcpError.code === '42P01') {
          console.log('テーブルが存在しません。Supabaseでテーブル作成SQLを実行してください。');
        } else {
          console.log('不明なエラーです。Supabaseのテーブル設定を確認してください。');
        }
      } else {
        console.log('MCPテーブル接続成功！レコード数:', mcpData.length);
      
        // テストメッセージの送信
        console.log('テストメッセージの送信を試みます...');
        const result = await sendTestMessage();
        
        if (result.success) {
          console.log('MCPサーバーとの接続テストに成功しました！');
        } else {
          console.error('MCPサーバーとの接続テストに失敗しました。');
        }
      }
    } catch (error) {
      console.error('MCPテスト実行中の予期せぬエラー:', error);
    }
  } catch (error) {
    console.error('実行エラー:', error);
  }
}

// スクリプトの実行
main().catch(err => {
  console.error('スクリプト実行中にエラーが発生しました:', err);
  console.error('エラーの詳細:', JSON.stringify(err, null, 2));
  process.exit(1);
}); 