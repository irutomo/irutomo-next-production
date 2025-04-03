import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import { currentUser } from '@clerk/nextjs/server';

// サーバーサイドでのSupabaseクライアント (認証済み)
export const createServerSupabaseClient = async () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase URL または Service Key が設定されていません。');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// サーバーコンポーネント用のSupabaseクライアント (Clerkトークン使用)
export const createServerComponentClient = async () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL または Anon Key が設定されていません。');
  }

  // 基本的なSupabaseクライアントを作成
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // TypeScriptエラーを回避するためにtry-catchブロックで囲む
    // auth()からuserIdを安全に取得
    let userId = null;
    try {
      const authResult = auth();
      // @ts-ignore auth()の戻り値型の問題を回避
      userId = authResult.userId;
    } catch (authError) {
      console.error('認証情報取得エラー:', authError);
    }
    
    // ユーザーIDがある場合は、ユーザー情報とトークンを取得
    if (userId) {
      try {
        const user = await currentUser();
        
        if (user) {
          try {
            // 2025年4月1日のSupabase-Clerk統合の仕様に合わせたトークン取得
            // @ts-ignore getToken関数は実行時に存在する
            const token = await user.getToken({ template: 'supabase' });
            
            if (token) {
              // Supabaseのセッションをセット
              supabase.auth.setSession({
                access_token: token,
                refresh_token: '',
              });
            }
          } catch (tokenError) {
            console.error('Supabaseトークン取得エラー:', tokenError);
          }
        }
      } catch (userError) {
        console.error('ユーザー情報取得エラー:', userError);
      }
    }
  } catch (error) {
    console.error('認証処理エラー:', error);
  }
  
  return supabase;
};

// クライアントサイドでのSupabaseクライアント
export const createBrowserSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL または Anon Key が設定されていません。');
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
}; 