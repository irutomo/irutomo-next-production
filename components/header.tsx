'use client';

import Link from 'next/link';
import Image from 'next/image';
import { UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";

export function Header() {
  const { isSignedIn } = useUser();
  
  return (
    <header className="flex justify-between items-center p-4 bg-white sticky top-0 z-50 shadow-sm">
      <div className="flex items-center">
        <Image src="/_img_IRUTOMO.svg" alt="IRUTOMO" width={100} height={24} className="h-6 w-auto" />
      </div>
      <div className="flex items-center">
        {/* 言語切り替えボタン */}
        <button className="mr-2 p-1 rounded-full" aria-label="한국어로 전환">
          <span className="text-xl">🇰🇷</span>
        </button>
        <button className="mr-4 p-1 rounded-full bg-teal-50" aria-label="日本語に切り替え">
          <span className="text-xl">🇯🇵</span>
        </button>
        
        {/* ユーザーボタン */}
        {isSignedIn ? (
          <UserButton afterSignOutUrl="/" />
        ) : (
          <Link href="/auth/sign-in">
            <button className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </Link>
        )}
      </div>
    </header>
  );
}