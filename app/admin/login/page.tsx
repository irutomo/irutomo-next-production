'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback, Suspense } from 'react';
import Image from 'next/image';
import { FaCircleNotch } from 'react-icons/fa';

// SearchParamsを使用するコンポーネントを分離
function LoginContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // 新しいSupabaseクライアントを作成
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // URLパラメータからエラー情報を取得
  useEffect(() => {
    if (searchParams) {
      const error = searchParams.get('error');
      const message = searchParams.get('message');
      
      if (error) {
        console.log(`URLパラメータからエラー検出: ${error}`);
        let errorMessage = '';
        
        switch (error) {
          case 'auth_exchange_failed':
            errorMessage = '認証処理に失敗しました';
            break;
          case 'no_session':
            errorMessage = 'セッションが取得できませんでした';
            break;
          case 'not_admin':
            errorMessage = '管理者権限がありません';
            break;
          case 'user_creation_failed':
            errorMessage = 'ユーザー作成に失敗しました';
            break;
          case 'user_fetch_failed':
            errorMessage = 'ユーザー情報の取得に失敗しました';
            break;
          default:
            errorMessage = '認証エラーが発生しました';
        }
        
        if (message) {
          errorMessage += `: ${decodeURIComponent(message)}`;
        }
        
        setAuthError(errorMessage);
      }
    }
  }, [searchParams]);

  const checkAuth = useCallback(async () => {
    console.log("checkAuth開始");
    setIsCheckingAuth(true);
    try {
      // セッションの確認
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log("認証状態:", session ? "ログイン済み" : "未ログイン");
      console.log("セッションエラー:", sessionError ? sessionError.message : "なし");

      if (sessionError) {
        console.error("セッション取得エラー:", sessionError.message);
        setAuthError(sessionError.message);
        setIsCheckingAuth(false);
        return;
      }

      if (!session) {
        console.log("セッションなし - ログイン必要");
        setIsCheckingAuth(false);
        return;
      }

      console.log("ユーザーメール:", session.user.email);

      // ユーザー情報の取得
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      console.log("ユーザーデータ:", userData);
      console.log("ユーザー取得エラー:", userError ? userError.message : "なし");

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
            setAuthError(insertError.message);
            setIsCheckingAuth(false);
            return;
          }

          console.log("一般ユーザーとして作成完了 - 管理者権限なし");
          setAuthError("管理者権限がありません");
          setIsCheckingAuth(false);
          return;
        }

        setAuthError(userError.message);
        setIsCheckingAuth(false);
        return;
      }

      // 管理者権限の確認
      if (userData.role !== "admin") {
        console.log("管理者権限なし:", userData.role);
        setAuthError("管理者権限がありません");
        setIsCheckingAuth(false);
        return;
      }

      console.log("管理者権限確認完了 - ダッシュボードへリダイレクト");
      router.push('/admin/dashboard');
    } catch (error: any) {
      console.error("予期せぬエラー:", error.message);
      setAuthError(error.message);
    } finally {
      setIsCheckingAuth(false);
      setIsLoading(false);
    }
  }, [router, supabase]);

  // 認証状態の監視 (シンプルにしてSupabase操作を含めない)
  useEffect(() => {
    checkAuth();
    
    // シンプルな認証状態リスナー (Supabase操作を含めないシンプルな実装)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("認証状態変更:", event, session ? "セッションあり" : "セッションなし");
      
      // SIGNED_INイベントの場合、checkAuthを呼び出す (非同期操作は別の関数で処理)
      if (event === 'SIGNED_IN' && session) {
        checkAuth();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkAuth, supabase]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold mb-4 text-center">認証確認中</h2>
            <FaCircleNotch className="animate-spin text-4xl text-blue-500 mb-4" />
            <p className="text-gray-600">しばらくお待ちください...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <div className="flex flex-col items-center mb-8">
          <Image 
            src="/irulogo-hidariue.svg" 
            alt="IRUTOMO" 
            width={200} 
            height={50} 
            className="mb-4"
          />
          <h2 className="text-2xl font-bold text-gray-800">管理者ログイン</h2>
          {authError && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {authError}
            </div>
          )}
        </div>
        
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#4F46E5',
                  brandAccent: '#4338CA',
                }
              }
            }
          }}
          providers={[]}
          localization={{
            variables: {
              sign_in: {
                email_label: 'メールアドレス',
                password_label: 'パスワード',
                button_label: 'ログイン',
                loading_button_label: 'ログイン中...',
                link_text: 'アカウントをお持ちの方はログイン',
                email_input_placeholder: 'メールアドレス',
                password_input_placeholder: 'パスワード',
              }
            }
          }}
          onlyThirdPartyProviders={false}
          redirectTo={`${window.location.origin}/admin/auth/callback`}
          view="sign_in"
        />
      </div>
    </div>
  );
}

// ローディング表示用コンポーネント
function LoginFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold mb-4 text-center">読み込み中</h2>
          <FaCircleNotch className="animate-spin text-4xl text-blue-500 mb-4" />
          <p className="text-gray-600">ページを準備しています...</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminLogin() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
} 