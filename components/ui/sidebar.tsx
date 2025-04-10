"use client";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import {
  Home,
  Store,
  Info,
  Star,
  User,
  LogOut,
  LogIn,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabaseクライアントの作成
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// サイドバーのアニメーション定義
const sidebarVariants = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      duration: 0.3
    }
  },
  closed: {
    x: "-100%",
    opacity: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 40,
      duration: 0.3
    }
  }
};

interface SidebarProps {
  isOpen?: boolean;
}

export function Sidebar({ isOpen = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Supabaseからユーザー情報を取得
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);

      // 認証状態の変更を監視
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setUser(session?.user || null);
        }
      );

      return () => {
        authListener?.subscription.unsubscribe();
      };
    };

    getUser();
  }, []);

  // ログアウト処理
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <motion.div
      className={cn(
        "fixed top-0 left-0 h-full w-[280px] z-[50] bg-white shadow-xl",
        "md:hidden", // モバイルのみ表示
      )}
      initial="closed"
      animate={isOpen ? "open" : "closed"}
      variants={sidebarVariants}
    >
      <div className="flex flex-col h-full">
        {/* サイドバーヘッダー */}
        <div className="p-4 border-b flex items-center h-16">
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

        {/* ユーザー情報 */}
        {!loading && user && (
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                <div className="w-full h-full flex items-center justify-center bg-orange-100 text-orange-500">
                  {user.email ? user.email.charAt(0).toUpperCase() : "U"}
                </div>
              </div>
              <div>
                <p className="font-medium">{user.user_metadata?.name || '会員'}</p>
                <p className="text-xs text-gray-500 truncate max-w-[160px]">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ナビゲーションメニュー */}
        <ScrollArea className="flex-grow">
          <nav className="p-4">
            <ul className="space-y-2">
              <SidebarItem 
                href="/" 
                icon={<Home className="w-5 h-5" />}
                isActive={pathname === "/"} 
              >
                ホーム
              </SidebarItem>
              <SidebarItem 
                href="/service" 
                icon={<Info className="w-5 h-5" />} 
                isActive={pathname ? pathname.startsWith("/service") : false} 
              >
                サービス紹介
              </SidebarItem>
              <SidebarItem 
                href="/restaurants" 
                icon={<Store className="w-5 h-5" />} 
                isActive={pathname ? pathname.startsWith("/restaurants") : false} 
              >
                店舗情報
              </SidebarItem>
              <SidebarItem 
                href="/reviews" 
                icon={<Star className="w-5 h-5" />} 
                isActive={pathname ? pathname.startsWith("/reviews") : false} 
              >
                レビュー
              </SidebarItem>

              {/* ログイン後のみ表示される項目 */}
              {user && (
                <SidebarItem 
                  href="/dashboard" 
                  icon={<User className="w-5 h-5" />} 
                  isActive={pathname ? pathname.startsWith("/dashboard") : false} 
                >
                  マイページ
                </SidebarItem>
              )}
            </ul>
          </nav>
        </ScrollArea>

        {/* サイドバーフッター */}
        <div className="p-4 border-t">
          {!loading && user ? (
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-2 w-full px-4 py-2 rounded-md text-red-500 hover:bg-red-50 transition"
            >
              <LogOut className="w-5 h-5" />
              <span>ログアウト</span>
            </button>
          ) : (
            <Link href="/auth/sign-in" className="flex items-center justify-center w-full px-4 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600 transition">
              <LogIn className="w-5 h-5 mr-2" />
              <span>ログイン / 登録</span>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// サイドバーアイテムコンポーネント
interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  isActive: boolean;
  children: React.ReactNode;
}

function SidebarItem({ href, icon, isActive, children }: SidebarItemProps) {
  return (
    <li>
      <Link
        href={href}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-md transition-colors",
          isActive 
            ? "bg-orange-50 text-orange-500 font-medium" 
            : "hover:bg-gray-100"
        )}
      >
        {icon}
        <span>{children}</span>
      </Link>
    </li>
  );
}