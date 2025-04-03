import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

// ClerkからSupabaseアクセストークンを取得するAPIルート
export async function GET() {
  try {
    // 認証済みかチェック - TypeScriptエラーを回避するためのパターン
    let userId = null;
    try {
      const authResult = auth();
      // @ts-ignore auth()の戻り値型の問題を回避
      userId = authResult.userId;
    } catch (error) {
      console.error("認証情報取得エラー:", error);
    }

    if (!userId) {
      return NextResponse.json(
        { error: "未認証のリクエストです" },
        { status: 401 }
      );
    }

    // 現在のユーザーを取得
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: "ユーザー情報を取得できませんでした" },
        { status: 404 }
      );
    }

    // SupabaseのJWTトークンを取得
    // @ts-ignore getToken関数は実行時に存在する
    const token = await user.getToken({ template: 'supabase' });
    if (!token) {
      return NextResponse.json(
        { error: "Supabaseトークンを取得できませんでした" },
        { status: 400 }
      );
    }

    // トークンをクライアントに返す
    return NextResponse.json({ token });
  } catch (error) {
    console.error("Supabaseトークン取得エラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
} 