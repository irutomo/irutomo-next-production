'use client';

import Link from 'next/link';
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import { Button } from './ui/button';

export function Header() {
  const { isSignedIn } = useUser();
  
  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-sm">
      <div className="container max-w-[430px] mx-auto flex h-16 items-center justify-between px-4">
        {/* ロゴ */}
        <div className="flex items-center gap-2">
          <Link href="/" className="text-xl font-bold text-[#FFA500]">
            韓国グルメ予約
          </Link>
        </div>
        
        {/* 通知アイコン */}
        <div className="flex items-center">
          <Link href={isSignedIn ? "/dashboard/notifications" : "/auth/sign-in"} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}