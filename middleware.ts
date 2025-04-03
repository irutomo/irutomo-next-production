import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 公開ルート（認証なしでアクセス可能）
const publicRoutes = [
  '/',
  '/service',
  '/restaurants',
  '/reviews',
  '/write-review',
  '/auth',
  '/auth/(.*)',
  '/api/(.*)',
  '/about',
  '/privacy',
  '/terms',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 公開ルートのチェック
  for (const route of publicRoutes) {
    if (
      route.endsWith('(.*)') && 
      pathname.startsWith(route.replace('(.*)', ''))
    ) {
      return NextResponse.next();
    }
    
    if (route === pathname) {
      return NextResponse.next();
    }
  }

  // 今回は認証チェックを実装せずに全てのルートを公開
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}; 