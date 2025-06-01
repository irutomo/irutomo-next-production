// ===================================
// Japan Info記事データ取得カスタムフック
// ===================================

import { useState, useEffect, useCallback } from 'react';
import { getAllJapanInfoArticles } from '@/lib/strapi/client';
import { JapanInfo } from '@/types/japan-info';

interface UseJapanInfoArticlesOptions {
  pageSize?: number;
  sortBy?: 'publishedAt' | 'title' | 'views';
  sortOrder?: 'asc' | 'desc';
}

interface UseJapanInfoArticlesReturn {
  articles: JapanInfo[];
  loading: boolean;
  hasMore: boolean;
  totalArticles: number;
  currentPage: number;
  error: Error | null;
  loadMore: () => void;
  refresh: () => void;
}

export function useJapanInfoArticles(
  options: UseJapanInfoArticlesOptions = {}
): UseJapanInfoArticlesReturn {
  const {
    pageSize = 8,
    sortBy = 'publishedAt',
    sortOrder = 'desc'
  } = options;

  // 状態管理
  const [articles, setArticles] = useState<JapanInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalArticles, setTotalArticles] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  // データ取得関数
  const fetchData = useCallback(async (page: number = 1, append: boolean = false) => {
    if (!append) setLoading(true);
    setError(null);
    
    try {
      const results = await getAllJapanInfoArticles({
        page,
        pageSize,
        sortBy,
        sortOrder,
      });

      if (append) {
        setArticles(prev => [...prev, ...results.articles]);
      } else {
        setArticles(results.articles);
      }
      
      setTotalArticles(results.pagination.total);
      setHasMore(page < results.pagination.pageCount);
      setCurrentPage(page);
    } catch (err) {
      console.error('Data fetch error:', err);
      setError(err instanceof Error ? err : new Error('データの取得に失敗しました'));
      
      if (!append) {
        setArticles([]);
      }
    } finally {
      setLoading(false);
    }
  }, [pageSize, sortBy, sortOrder]);

  // 初期データ取得
  useEffect(() => {
    fetchData(1, false);
  }, [fetchData]);

  // もっと読み込む
  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      const nextPage = currentPage + 1;
      fetchData(nextPage, true);
    }
  }, [hasMore, loading, currentPage, fetchData]);

  // リフレッシュ
  const refresh = useCallback(() => {
    setCurrentPage(1);
    fetchData(1, false);
  }, [fetchData]);

  return {
    articles,
    loading,
    hasMore,
    totalArticles,
    currentPage,
    error,
    loadMore,
    refresh,
  };
} 