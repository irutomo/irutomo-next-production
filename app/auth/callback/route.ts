import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: async () => {
        return await cookieStore;
      }
    });

    try {
      await supabase.auth.exchangeCodeForSession(code);
    } catch (error) {
      console.error('Supabase認証コード交換エラー:', error);
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/error?error=auth_exchange_failed`
      );
    }
  }

  // 認証後にリダイレクトするURL
  const redirectTo = requestUrl.searchParams.get('redirect_to') || '/';
  return NextResponse.redirect(`${requestUrl.origin}${redirectTo}`);
} 