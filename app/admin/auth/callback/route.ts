import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  console.log("管理者認証コールバック処理開始");
  
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectTo = requestUrl.searchParams.get("redirectTo") || "/admin/dashboard";
  
  console.log("認証コード存在:", code ? "あり" : "なし");
  console.log("リダイレクト先:", redirectTo);
  console.log("リクエストURL:", request.url);

  if (code) {
    try {
      console.log("Supabaseクライアント作成開始");
      
      // 正しいクッキーハンドラーを持つSuperbaseクライアントを作成
      const cookieStore = cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name) {
              return cookieStore.get(name)?.value;
            },
            set(name, value, options) {
              cookieStore.set(name, value, options);
            },
            remove(name, options) {
              cookieStore.set(name, "", options);
            },
          },
        }
      );
      
      console.log("Supabaseクライアント作成完了");
      
      console.log("認証コード交換開始");
      const authResult = await supabase.auth.exchangeCodeForSession(code);
      console.log("認証コード交換完了:", authResult.data?.session ? "成功" : "失敗");
      
      if (authResult.error) {
        console.error("認証エラー:", authResult.error.message);
        return NextResponse.redirect(
          `${requestUrl.origin}/admin/login?error=auth_exchange_failed&message=${encodeURIComponent(authResult.error.message)}`
        );
      }
      
      // セッションの確認
      console.log("セッション確認");
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error("セッションが取得できませんでした");
        return NextResponse.redirect(
          `${requestUrl.origin}/admin/login?error=no_session`
        );
      }
      
      console.log("セッション取得成功、ユーザーメール:", session.user.email);
      
      // ユーザーの管理者権限を確認
      console.log("ユーザーの権限確認開始");
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();
      
      if (userError) {
        console.error("ユーザー取得エラー:", userError.message);
        // ユーザーが見つからない場合は作成
        if (userError.code === "PGRST116") {
          console.log("ユーザーが見つからないため新規作成");
          const { error: insertError } = await supabase
            .from("users")
            .insert({
              id: session.user.id,
              email: session.user.email,
              role: "user",
            });
          
          if (insertError) {
            console.error("ユーザー作成エラー:", insertError.message);
            return NextResponse.redirect(
              `${requestUrl.origin}/admin/login?error=user_creation_failed&message=${encodeURIComponent(insertError.message)}`
            );
          }
          
          console.log("一般ユーザーとして作成完了 - 管理者権限なし");
          return NextResponse.redirect(
            `${requestUrl.origin}/admin/login?error=not_admin`
          );
        }
        
        return NextResponse.redirect(
          `${requestUrl.origin}/admin/login?error=user_fetch_failed&message=${encodeURIComponent(userError.message)}`
        );
      }
      
      // 管理者権限の確認
      if (userData.role !== "admin") {
        console.log("管理者権限なし:", userData.role);
        return NextResponse.redirect(
          `${requestUrl.origin}/admin/login?error=not_admin`
        );
      }
      
      console.log("管理者権限確認完了 - ダッシュボードへリダイレクト");
      
    } catch (error: any) {
      console.error("予期せぬエラー:", error.message);
      return NextResponse.redirect(
        `${requestUrl.origin}/admin/login?error=unexpected&message=${encodeURIComponent(error.message)}`
      );
    }
  }

  console.log(`${redirectTo}へリダイレクト`);
  return NextResponse.redirect(`${requestUrl.origin}${redirectTo}`);
} 