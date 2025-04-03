import { currentUser } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";
import { createBrowserSupabaseClient, createServerSupabaseClient } from "./supabase";

// クライアントからSupabaseセッションを取得する関数
// このトークンはRLSで保護されたデータにアクセスするために使用されます
export async function getSupabaseTokenInClient() {
  try {
    const response = await fetch('/api/auth/supabase-token');
    if (!response.ok) {
      throw new Error('トークンの取得に失敗しました');
    }
    const { token } = await response.json();
    return token;
  } catch (error) {
    console.error('Supabaseトークン取得エラー:', error);
    return null;
  }
}

// サーバーサイドでClerkからSupabaseのセッショントークンを取得する関数
export async function getSupabaseTokenInServer() {
  try {
    const user = await currentUser();
    if (!user) return null;

    // ClerkのgetTokenメソッドを使用してSupabase用のトークンを取得
    // @ts-ignore TypeScript定義ファイルが更新されるまでIgnore
    const token = await user.getToken({ template: 'supabase' });
    return token;
  } catch (error) {
    console.error('サーバーサイドSupabaseトークン取得エラー:', error);
    return null;
  }
}

// サーバーサイドでユーザー認証状態とSupabaseクライアントを取得
export async function getServerAuthAndSupabase() {
  const { userId } = await auth();
  const token = await getSupabaseTokenInServer();
  const supabase = await createServerSupabaseClient();

  if (token) {
    // セッショントークンを使用してSupabaseセッションを設定
    supabase.auth.setSession({
      access_token: token,
      refresh_token: '',
    });
  }

  return { userId, supabase };
}

// クライアントサイドでトークンを使用してSupabaseクライアントを取得
export async function getSupabaseClientWithToken() {
  const token = await getSupabaseTokenInClient();
  const supabase = createBrowserSupabaseClient();

  if (token) {
    supabase.auth.setSession({
      access_token: token,
      refresh_token: '',
    });
  }

  return supabase;
} 