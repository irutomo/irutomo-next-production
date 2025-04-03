import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";
import { getServerAuthAndSupabase } from "@/lib/clerk";

export default async function DashboardPage() {
  // サーバーコンポーネントでのユーザー認証チェック
  const user = await currentUser();
  const { userId } = await auth();
  
  if (!userId || !user) {
    redirect("/auth/sign-in");
  }
  
  // Supabaseからユーザーデータを取得
  const { supabase } = await getServerAuthAndSupabase();
  const { data: userData, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  
  if (error) {
    console.error("ユーザーデータ取得エラー:", error);
  }
  
  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">マイダッシュボード</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
            {user.imageUrl && (
              <img 
                src={user.imageUrl} 
                alt={user.firstName || "ユーザー"} 
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-gray-600">{user.emailAddresses[0].emailAddress}</p>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <h3 className="font-medium text-lg mb-2">アカウント情報</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">メールアドレス</p>
              <p>{user.emailAddresses[0].emailAddress}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ユーザーID</p>
              <p className="truncate">{user.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">アカウント作成日</p>
              <p>{new Date(user.createdAt).toLocaleDateString('ja-JP')}</p>
            </div>
            {userData?.phone && (
              <div>
                <p className="text-sm text-gray-500">電話番号</p>
                <p>{userData.phone}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">予約履歴</h3>
          <p className="text-gray-500">最近の予約はありません</p>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">レビュー履歴</h3>
          <p className="text-gray-500">投稿したレビューはありません</p>
        </div>
      </div>
    </div>
  );
} 