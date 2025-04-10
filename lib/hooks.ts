import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// クライアントコンポーネントでSupabaseクライアントを使用するためのフック
export const useSupabaseClient = () => {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Supabaseクライアントを初期化
  const initSupabase = useCallback(async () => {
    try {
      setLoading(true);
      const client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      setSupabase(client);
      setError(null);
    } catch (err) {
      console.error('Supabaseクライアント初期化エラー:', err);
      setError(err instanceof Error ? err : new Error('不明なエラーが発生しました'));
    } finally {
      setLoading(false);
    }
  }, []);

  // コンポーネントのマウント時にSupabaseクライアントを初期化
  useEffect(() => {
    initSupabase();
  }, [initSupabase]);

  // クライアントを手動で再初期化するための関数
  const refreshClient = useCallback(() => {
    initSupabase();
  }, [initSupabase]);

  return { 
    supabase, 
    loading, 
    error, 
    refreshClient 
  };
}; 