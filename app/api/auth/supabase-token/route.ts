import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// 環境変数から接続情報を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 静的エクスポート設定
export const dynamic = 'force-dynamic';

/**
 * Supabaseセッショントークンを取得するAPI
 * クライアント側からSupabaseのセッション情報を取得するために使用
 */
export async function GET() {
  try {
    // Cookieからセッション情報を取得
    const cookieStore = cookies();
    
    // Supabaseクライアントを初期化
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      // cookiesの型エラー対応のため、別の方法でCookieを渡す
      global: {
        headers: {
          cookie: cookieStore.toString(),
        },
      },
    });
    
    // 現在のセッション情報を取得
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      console.error("認証セッションが見つかりません", error);
      return NextResponse.json(
        { error: "認証されていません" },
        { status: 401 }
      );
    }
    
    console.log(`認証済みユーザー: ${session.user.id}`);
    
    // アクセストークンをクライアントに返す
    return NextResponse.json({ 
      token: session.access_token,
      userId: session.user.id
    });
  } catch (error) {
    console.error("Supabaseトークン取得エラー:", error);
    return NextResponse.json(
      { error: "トークン取得中にエラーが発生しました" },
      { status: 500 }
    );
  }
} 