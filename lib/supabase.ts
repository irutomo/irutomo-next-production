import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import { currentUser } from '@clerk/nextjs/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// サーバーサイド用のSupabaseクライアント
export const createServerSupabaseClient = async () => {
  const { getToken } = auth();
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${await getToken({ template: "supabase" })}`
      }
    }
  });

  return supabase;
};

// サーバーコンポーネント用のSupabaseクライアント
export const createServerComponentClient = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL または Anon Key が設定されていません。');
  }

  // 簡易版のSupabaseクライアントを作成 (認証なし)
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// クライアントサイド用のSupabaseクライアント
export const createBrowserSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

// デフォルトのクライアント（認証なし）
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 