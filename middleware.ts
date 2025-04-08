import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { clerkMiddleware, createClerkClient } from '@clerk/nextjs/server';

// 公開ルート（認証なしでアクセス可能）
const publicRoutes = [
  '/',
  '/service',
  '/restaurants',
  '/restaurants/(.*)',
  '/reviews',
  '/write-review',
  '/sign-in',
  '/sign-in/(.*)',
  '/sign-up',
  '/sign-up/(.*)',
  '/auth/sign-in',
  '/auth/sign-in/(.*)',
  '/auth/sign-up',
  '/auth/sign-up/(.*)',
  '/auth/callback',
  '/auth/callback/(.*)',
  '/api/(.*)',
  '/about',
  '/privacy',
  '/terms',
  '/faq',
  '/how-to-use',
  '/privacy-policy',
];

// 指定されたパスが公開ルートかどうかチェックする関数
function isPublicRoute(path: string): boolean {
  return publicRoutes.some(route => {
    if (route.endsWith('(.*)')) {
      const baseRoute = route.replace('(.*)', '');
      return path.startsWith(baseRoute);
    }
    return path === route;
  });
}

// メインミドルウェア関数
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Supabaseセッションを処理
  try {
    const supabase = createMiddlewareClient({ req, res });
    
    // Supabaseセッションのリフレッシュ（サーバーコンポーネント用に必須）
    await supabase.auth.getSession();
  } catch (error) {
    console.error('Supabaseセッション処理エラー:', error);
  }
  
  // 公開ルートの場合は認証チェックをスキップ
  if (isPublicRoute(req.nextUrl.pathname)) {
    return res;
  }
  
  // 非公開ルートでClerk認証チェック
  // 実際の処理はClerkミドルウェアと連携して行う
  
  return res;
}

// すべてのルートに適用
export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|static|favicon.ico|images).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}; 