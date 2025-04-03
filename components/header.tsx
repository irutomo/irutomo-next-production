'use client';

import Link from 'next/link';
import Image from 'next/image';
import { NavBar } from './ui/tubelight-navbar';
import { Home, Info, Store, Star, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './ui/sidebar';
import { useState, useEffect } from 'react';
import { Fade as Hamburger } from 'hamburger-react';
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { isSignedIn, user } = useUser();
  
  // モバイルメニューが開いている間はスクロールを無効化
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  // 画面幅が変わったときにメニューを閉じる
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isOpen) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);
  
  // ルート遷移時にモバイルメニューを閉じる
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);
  
  const navItems = [
    { name: 'ホーム', url: '/', icon: Home },
    { name: 'サービス紹介', url: '/service', icon: Info },
    { name: '店舗情報', url: '/restaurants', icon: Store },
    { name: 'レビュー', url: '/reviews', icon: Star }
  ];
  
  // オーバーレイコンポーネント
  const MobileOverlay = () => (
    <div 
      className={cn(
        "fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      onClick={() => setIsOpen(false)}
      aria-hidden="true"
    />
  );
  
  return (
    <>
      {/* モバイルオーバーレイ */}
      <MobileOverlay />
      
      {/* サイドバー */}
      <Sidebar isOpen={isOpen} />
      
      <header className="sticky top-0 z-30 w-full bg-white shadow-sm">
        <div className="container max-w-6xl mx-auto flex h-16 items-center justify-between px-4">
          {/* ロゴ */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center">
              <Image 
                src="/irulogo-hidariue.svg"
                alt="IRUtomo Logo"
                width={120}
                height={24}
                priority
              />
            </Link>
          </div>
          
          {/* デスクトップナビゲーション */}
          <div className="hidden md:flex md:items-center md:justify-center md:flex-1">
            <div className="w-auto">
              <NavBar 
                items={navItems} 
                className="static transform-none w-auto" 
              />
            </div>
          </div>
          
          {/* 右側ユーザーエリア */}
          <div className="flex items-center gap-4">
            {/* Clerk認証ボタン */}
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
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6 py-2 text-sm font-medium">
                    ログイン
                  </Button>
                </SignInButton>
              )}
            </div>
            
            {/* ハンバーガーメニュー（モバイル用） */}
            <div className="md:hidden flex items-center z-50 relative">
              <Hamburger 
                toggled={isOpen} 
                toggle={setIsOpen} 
                size={20} 
                color="#F97316" 
                label="メニューを開く"
                rounded
                hideOutline={false}
              />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}