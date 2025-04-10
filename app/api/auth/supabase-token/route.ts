import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";

// 静的エクスポート設定 - App Router では通常不要だが、Edge Runtime を使う場合は必要
export const dynamic = 'force-dynamic';
// export const runtime = 'edge'; // Edge Runtime を使う場合は必要に応じてコメント解除

// Model: データ取得と処理を担当
class SupabaseTokenModel {
  async getSupabaseToken() {
    let userId: string | null = null;
    let user = null; // currentUser() または clerkClient.users.getUser() の戻り値を格納

    try {
      // Clerk の認証情報を取得 (同期)
      const authResult = auth();
      // Clerk の auth() は Route Handler では同期的に AuthObject を返すはずだが、リンターが誤認識する可能性があるため ignore
      // @ts-ignore - Linter incorrectly expects Promise<Auth> here.
      userId = authResult.userId;

      if (!userId) {
        console.error("SupabaseTokenModel: 未認証のリクエストです。");
        throw new Error("未認証のリクエストです");
      }

      user = await currentUser();
      if (!user) {
        console.warn(`SupabaseTokenModel: currentUser() でユーザー情報が見つかりません (userId: ${userId}), clerkClient を試します。`);
        try {
          const clerk = await clerkClient();
          user = await clerk.users.getUser(userId);
          if(!user) {
             console.error(`SupabaseTokenModel: clerkClient.users.getUser(${userId}) でもユーザー情報が見つかりません。`);
             throw new Error("clerkClient でもユーザー情報が見つかりません");
          }
        } catch(clerkClientError) {
           console.error(`SupabaseTokenModel: clerkClient.users.getUser(${userId}) でエラー`, clerkClientError);
           throw new Error("ユーザー情報を取得できませんでした");
        }
      }

      if (!user) {
        console.error(`SupabaseTokenModel: ユーザー情報が最終的に取得できませんでした (userId: ${userId})`);
        throw new Error("ユーザー情報を取得できませんでした");
      }

      const userIdentifier = user.emailAddresses?.[0]?.emailAddress || user.id;
      console.log(`SupabaseTokenModel: 認証成功 (userId: ${userId}, userIdentifier: ${userIdentifier})`);

      if (typeof (user as any).getToken !== 'function') {
         console.error("SupabaseTokenModel: user.getToken is not a function. User object keys:", Object.keys(user));
         throw new Error("ユーザーオブジェクトから Supabase トークン取得関数が見つかりません");
      }

      const token = await (user as any).getToken({ template: 'supabase' });

      if (!token) {
        console.error(`SupabaseTokenModel: Supabaseトークンの取得に失敗しました (userId: ${userId})`);
        throw new Error("Supabaseトークンを取得できませんでした");
      }

      console.log(`SupabaseTokenModel: Supabaseトークン取得成功 (userId: ${userId})`);
      return token;

    } catch (error: any) {
      console.error("SupabaseTokenModel: getSupabaseToken 中にエラー発生:", error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`トークン取得エラー: ${message}`);
    }
  }
}

// Controller: ビジネスロジックと制御フロー
class SupabaseTokenController {
  private model: SupabaseTokenModel;

  constructor() {
    this.model = new SupabaseTokenModel();
  }

  async getToken() {
    try {
      const token = await this.model.getSupabaseToken();
      return { success: true, token };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "不明なエラーが発生しました";
      console.error("SupabaseTokenController: getToken エラー:", errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }
  }
}

interface TokenResult {
  success: boolean;
  token?: string;
  error?: string;
}

// Presenter: HTTPリクエスト/レスポンスの処理
export async function GET() {
  try {
    // ログ出力を追加
    console.log("Supabaseトークン取得API呼び出し開始");
    
    // 現在のユーザーを取得
    const user = await currentUser();
    
    if (!user) {
      console.log("認証されたユーザーが見つかりません");
      return NextResponse.json(
        { error: "認証されていません" },
        { status: 401 }
      );
    }
    
    console.log(`認証済みユーザー: ${user.id}`);
    
    // Clerkからカスタムトークンを生成（Supabase用）
    // @ts-ignore TypeScript定義ファイルが更新されるまでIgnore
    const token = await user.getToken({ template: "supabase" });
    
    if (!token) {
      console.log("トークンの生成に失敗しました");
      return NextResponse.json(
        { error: "トークンの生成に失敗しました" },
        { status: 500 }
      );
    }
    
    console.log("Supabaseトークン生成成功");
    
    // トークンをクライアントに返す
    return NextResponse.json({ token });
  } catch (error) {
    console.error("Supabaseトークン取得エラー:", error);
    return NextResponse.json(
      { error: "トークン取得中にエラーが発生しました" },
      { status: 500 }
    );
  }
} 