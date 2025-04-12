import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { Database } from '@/lib/database.types';
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';

// サーバーサイド用のSupabaseクライアント (開発環境用)
export const createServerSupabaseClient = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  // サービスロールキーが設定されていない場合はエラーログを出力
  if (!supabaseServiceRoleKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEYが設定されていません。RLSポリシーに違反する可能性があります。');
  }
  
  // サービスロールキーを使用したクライアントを作成
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    }
  });

  return supabase;
};

// サーバーコンポーネント用のSupabaseクライアント (cookiesベース)
export const createServerComponentClient = async () => {
  const cookieStore = await cookies();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          const cookie = cookieStore.get(name) as RequestCookie | undefined;
          return cookie?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set(name, value, options);
          } catch (error) {
            console.error('Cookie設定エラー:', error);
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.delete(name);
          } catch (error) {
            console.error('Cookie削除エラー:', error);
          }
        },
      },
    }
  );
}; 