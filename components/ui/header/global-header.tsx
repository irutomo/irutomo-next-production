'use client';

import Link from 'next/link';
import Image from 'next/image';
// import { UserButton } from "@clerk/nextjs";
// import { useUser } from "@clerk/nextjs";
import { LanguageSwitcher } from './language-switcher';

export function GlobalHeader() {
  // const { isSignedIn } = useUser();
  const isSignedIn = false; // 常にログアウト状態とする
  
  return (
    <header className="global-header flex justify-between items-center p-4 md:py-5 md:px-6 lg:px-8 bg-white sticky top-0 z-50 shadow-sm">
      <div className="flex items-center">
        <Link href="/">
          <Image src="/irulogo-hidariue.svg" alt="IRUTOMO" width={100} height={24} className="h-6 md:h-7 lg:h-8 w-auto" />
        </Link>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* 言語切り替えボタン */}
        <LanguageSwitcher />
        
        {/* ユーザーボタン - 常にログインボタンを表示 */}
        {/* {isSignedIn ? (
          <UserButton afterSignOutUrl="/" />
        ) : ( */}
          <Link href="/auth/sign-in">
            <button className="flex items-center justify-center md:border md:border-gray-300 md:px-3 md:py-1 md:rounded-full md:hover:bg-gray-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-text/70 md:h-5 md:w-5 md:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="hidden md:inline">ログイン</span>
            </button>
          </Link>
        {/* )} */}
      </div>
    </header>
  );
}