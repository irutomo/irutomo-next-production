import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// デバッグモードの設定
const DEBUG = process.env.NODE_ENV === 'development';

// ログ出力用ヘルパー関数
function log(...args: any[]) {
  if (DEBUG) {
    console.log('[MIDDLEWARE]', ...args);
  }
}

// Supabaseセッション処理
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  try {
    // リクエストURLを取得
    const url = new URL(req.url);
    const path = url.pathname;
    log(`リクエストパス: ${path}`);
    
    // PayPal関連ページでCSPノンスを生成
    if (path.includes('/restaurants/') || path.includes('/request')) {
      // セキュアな乱数を生成してノンスとして使用
      const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
      log('CSPノンス生成:', nonce);
      
      // クライアントが使用するためにリクエストヘッダーにノンスを設定
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-nonce', nonce);
      
      // レスポンスヘッダーにCSPを設定
      res.headers.set(
        'Content-Security-Policy',
        `
          default-src 'self';
          script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.paypal.com https://*.paypalobjects.com 'nonce-${nonce}';
          style-src 'self' 'unsafe-inline' https://*.paypalobjects.com;
          img-src 'self' data: blob: https://*.paypal.com https://*.paypalobjects.com;
          font-src 'self' https://*.paypalobjects.com;
          connect-src 'self' https://*.paypal.com https://*.paypalobjects.com;
          frame-src 'self' https://*.paypal.com https://*.paypalobjects.com;
          object-src 'none';
          base-uri 'self';
          form-action 'self' https://*.paypal.com;
          frame-ancestors 'self';
          upgrade-insecure-requests;
        `.replace(/\s{2,}/g, ' ').trim()
      );
    }
    
    // Supabaseクライアントの作成
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name) => req.cookies.get(name)?.value,
          set: (name, value, options) => {
            res.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove: (name, options) => {
            res.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    );
    
    // セッションの取得を待機する (awaitを追加)
    const { data: { session } } = await supabase.auth.getSession();
    log('セッション状態:', session ? 'セッションあり' : 'セッションなし');

    // 管理者ページへのアクセスとセッション確認
    if (path.startsWith('/admin') && !path.includes('/admin/login') && !path.includes('/admin/auth')) {
      log('管理者ページへのアクセス確認');

      if (!session) {
        log('未認証ユーザー: ログインページへリダイレクト');
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }

      // 管理者権限チェック - 以下はオプションで、必要に応じて有効化
      /* 
      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (error || userData?.role !== 'admin') {
          log('管理者権限なし: ログインページへリダイレクト');
          return NextResponse.redirect(new URL('/admin/login?error=not_admin', req.url));
        }
      } catch (error) {
        log('権限確認エラー:', error);
        return NextResponse.redirect(new URL('/admin/login?error=permission_check_failed', req.url));
      }
      */
    }
    
  } catch (error) {
    log('Supabaseセッション処理エラー:', error);
  }
  
  return res;
}

// ミドルウェア設定
export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|static|favicon.ico|images).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}; 