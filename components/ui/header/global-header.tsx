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
      
      <div className="flex items-center">
        {/* 言語切り替えボタン */}
        <LanguageSwitcher />
      </div>
    </header>
  );
}