import { NextResponse } from "next/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { Webhook } from "svix";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    // webhookシークレットを取得
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    
    if (!WEBHOOK_SECRET) {
      console.error("Clerk webhookシークレットが設定されていません");
      return NextResponse.json(
        { error: "Webhook シークレットエラー" },
        { status: 500 }
      );
    }

    // リクエストからヘッダーを取得
    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json(
        { error: "svixヘッダーが不足しています" },
        { status: 400 }
      );
    }

    // リクエストボディをJSON形式で取得
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // webhookを検証
    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: WebhookEvent;
    
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (error) {
      console.error("webhook検証エラー:", error);
      return NextResponse.json(
        { error: "Webhookの検証に失敗しました" },
        { status: 400 }
      );
    }

    // イベントタイプに基づいて処理
    const eventType = evt.type;
    
    // Supabaseクライアントを初期化
    const supabase = await createServerSupabaseClient();
    
    // ユーザー作成イベントの処理
    if (eventType === "user.created" || eventType === "user.updated") {
      const {
        id,
        email_addresses,
        first_name,
        last_name,
        image_url,
        phone_numbers,
      } = evt.data;
      
      const userData: Record<string, string> = {
        id: id,
        email: email_addresses?.[0]?.email_address || "",
        first_name: first_name || "",
        last_name: last_name || "",
        profile_image: image_url || "",
        phone: phone_numbers?.[0]?.phone_number || "",
        updated_at: new Date().toISOString(),
      };
      
      if (eventType === "user.created") {
        userData.created_at = new Date().toISOString();
        
        // ユーザーをSupabaseに挿入
        const { error } = await supabase
          .from("users")
          .insert(userData);
          
        if (error) {
          console.error("Supabaseユーザー作成エラー:", error);
          return NextResponse.json(
            { error: "ユーザーの作成に失敗しました" },
            { status: 500 }
          );
        }
      } else {
        // ユーザー情報を更新
        const { error } = await supabase
          .from("users")
          .update(userData)
          .eq("id", id);
          
        if (error) {
          console.error("Supabaseユーザー更新エラー:", error);
          return NextResponse.json(
            { error: "ユーザーの更新に失敗しました" },
            { status: 500 }
          );
        }
      }
    }
    
    // ユーザー削除イベントの処理
    if (eventType === "user.deleted") {
      const { id } = evt.data;
      
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", id);
        
      if (error) {
        console.error("Supabaseユーザー削除エラー:", error);
        return NextResponse.json(
          { error: "ユーザーの削除に失敗しました" },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhookエラー:", error);
    return NextResponse.json(
      { error: "内部サーバーエラー" },
      { status: 500 }
    );
  }
} 