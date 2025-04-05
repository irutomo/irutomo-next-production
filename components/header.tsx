'use client';

import Link from 'next/link';
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import { Button } from './ui/button';

export function Header() {
  const { isSignedIn } = useUser();
  
  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">
        {/* ロゴ */}
        <div className="flex items-center gap-2">
          <Link href="/" className="text-xl font-bold text-[#FFA500] md:text-2xl">
            韓国グルメ予約
          </Link>
        </div>
        
        {/* 右側エリア - 大画面ではナビゲーションとユーザーボタンを表示 */}
        <div className="flex items-center gap-4">
          {/* 大画面ではナビゲーションを表示 */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/restaurants" className="text-gray-700 hover:text-[#FFA500]">店舗一覧</Link>
            <Link href="/service" className="text-gray-700 hover:text-[#FFA500]">サービス</Link>
            <Link href="/reviews" className="text-gray-700 hover:text-[#FFA500]">レビュー</Link>
          </nav>
          
          {/* 通知アイコン */}
          <Link href={isSignedIn ? "/dashboard/notifications" : "/auth/sign-in"} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </Link>
          
          {/* ユーザーボタン (大画面のみ) */}
          <div className="hidden md:block">
            {isSignedIn ? (
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-9 h-9",
                  },
                }}
                afterSignOutUrl="/"
              />
            ) : (
              <SignInButton mode="modal">
                <Button className="bg-[#FFA500] hover:bg-[#FF8C00] text-white rounded-full px-4 py-2 text-sm font-medium">
                  ログイン
                </Button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}