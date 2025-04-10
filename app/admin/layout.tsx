'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || '';
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminName, setAdminName] = useState('');
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const checkAuthentication = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // ログインページでない場合はリダイレクト
        if (pathname !== '/admin/login') {
          router.push('/admin/login');
        }
        setIsLoading(false);
        return;
      }

      // 管理者権限の確認
      const { data: userData, error } = await supabase
        .from('users')
        .select('name, role')
        .eq('email', session.user.email)
        .single();

      if (error || userData?.role !== 'admin') {
        // 管理者ユーザーが見つからない、または管理者権限がない場合
        // ユーザーが存在しない場合は作成
        if (error && error.code === 'PGRST116') {
          // ユーザーが存在しない場合は作成
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              email: session.user.email,
              name: session.user.user_metadata.full_name || session.user.email,
              role: 'admin'
            });
            
          if (!insertError) {
            // admin_usersテーブルに追加
            const { data: newUser } = await supabase
              .from('users')
              .select('id')
              .eq('email', session.user.email)
              .single();
              
            if (newUser) {
              await supabase
                .from('admin_users')
                .insert({ user_id: newUser.id });
                
              setAdminName(session.user.user_metadata.full_name || session.user.email);
              setIsAuthenticated(true);
              setIsLoading(false);
              
              // ログインページにいる場合はダッシュボードへ
              if (pathname === '/admin/login') {
                router.push('/admin/dashboard');
              }
              return;
            }
          }
        }

        // 管理者でない場合はログアウト
        await supabase.auth.signOut();
        router.push('/admin/login');
        setIsLoading(false);
        return;
      }

      setAdminName(userData?.name || session.user.email);
      setIsAuthenticated(true);
      setIsLoading(false);

      // ログインページにいる場合はダッシュボードへ
      if (pathname === '/admin/login') {
        router.push('/admin/dashboard');
      }
    };

    checkAuthentication();
  }, [pathname, router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  // ログイン画面では特別なレイアウトを使わない
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // ロード中は何も表示しない
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 未認証の場合はログイン画面だけを表示
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* サイドバー */}
      <div className="w-64 bg-gray-800 text-white">
        <div className="p-4">
          <Link href="/admin/dashboard">
            <div className="flex items-center justify-center mb-6">
              <Image src="/irulogo-hidariue.svg" alt="IRUTOMO" width={120} height={30} className="h-8 w-auto" />
            </div>
          </Link>
          <div className="border-b border-gray-700 pb-4 mb-4">
            <p className="text-sm text-gray-400">管理者</p>
            <p className="font-medium">{adminName}</p>
          </div>
        </div>
        <nav className="px-2">
          <Link 
            href="/admin/dashboard" 
            className={`flex items-center py-2 px-4 rounded mb-1 ${
              pathname === '/admin/dashboard' ? 'bg-gray-700' : 'hover:bg-gray-700'
            }`}
          >
            <span className="mr-3">📊</span>
            ダッシュボード
          </Link>
          <Link 
            href="/admin/reservations" 
            className={`flex items-center py-2 px-4 rounded mb-1 ${
              pathname === '/admin/reservations' || pathname.startsWith('/admin/reservations/') 
                ? 'bg-gray-700' : 'hover:bg-gray-700'
            }`}
          >
            <span className="mr-3">📅</span>
            予約管理
          </Link>
          <Link 
            href="/admin/restaurants" 
            className={`flex items-center py-2 px-4 rounded mb-1 ${
              pathname === '/admin/restaurants' || pathname.startsWith('/admin/restaurants/') 
                ? 'bg-gray-700' : 'hover:bg-gray-700'
            }`}
          >
            <span className="mr-3">🍽️</span>
            レストラン管理
          </Link>
        </nav>
        <div className="absolute bottom-0 w-64 border-t border-gray-700">
          <button 
            onClick={handleSignOut}
            className="flex items-center py-3 px-4 w-full text-left hover:bg-gray-700"
          >
            <span className="mr-3">🚪</span>
            ログアウト
          </button>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ヘッダー */}
        <header className="bg-white shadow h-16 flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold">
            {pathname === '/admin/dashboard' && 'ダッシュボード'}
            {pathname === '/admin/reservations' && '予約管理'}
            {pathname.startsWith('/admin/reservations/') && '予約詳細'}
            {pathname === '/admin/restaurants' && 'レストラン管理'}
            {pathname.startsWith('/admin/restaurants/') && 'レストラン詳細'}
          </h1>
          <div className="flex items-center space-x-4">
            <Link href="/" target="_blank" className="text-sm text-blue-600 hover:text-blue-800">
              サイトを表示
            </Link>
          </div>
        </header>

        {/* コンテンツエリア */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
} 