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
export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  try {
    // リクエストURLを取得
    const url = new URL(req.url);
    const path = url.pathname;
    log(`リクエストパス: ${path}`);
    
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
    
    // Supabaseセッションのリフレッシュ
    void supabase.auth.getSession();
    
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