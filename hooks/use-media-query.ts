'use client';

import { useState, useEffect } from 'react';

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

type BreakpointKey = keyof typeof breakpoints;

/**
 * メディアクエリの状態を返すカスタムフック
 * @param query メディアクエリ文字列 (例: '(min-width: 768px)')
 * @returns メディアクエリがマッチするかどうかのブール値
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    // SSRでは初期値をfalseに設定
    if (typeof window === 'undefined') return;
    
    const media = window.matchMedia(query);
    
    // 初期値を設定
    setMatches(media.matches);
    
    // リスナーを設定
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    // リスナーを追加
    media.addEventListener('change', listener);
    
    // クリーンアップ
    return () => {
      media.removeEventListener('change', listener);
    };
  }, [query]);
  
  return matches;
}

/**
 * 特定のブレークポイント以上の画面サイズかどうかを返すフック
 * @param breakpoint ブレークポイント名 ('sm' | 'md' | 'lg' | 'xl' | '2xl')
 * @returns 指定されたブレークポイント以上かどうかのブール値
 */
export function useBreakpoint(breakpoint: BreakpointKey): boolean {
  return useMediaQuery(`(min-width: ${breakpoints[breakpoint]}px)`);
}

/**
 * 現在のブレークポイントに基づいて値を返すフック
 * @param values ブレークポイントごとの値を持つオブジェクト
 * @returns 現在のブレークポイントに対応する値
 */
export function useResponsiveValue<T>(values: { base: T } & Partial<Record<BreakpointKey, T>>): T {
  const isSm = useBreakpoint('sm');
  const isMd = useBreakpoint('md');
  const isLg = useBreakpoint('lg');
  const isXl = useBreakpoint('xl');
  const is2Xl = useBreakpoint('2xl');
  
  if (is2Xl && values['2xl'] !== undefined) return values['2xl'];
  if (isXl && values.xl !== undefined) return values.xl;
  if (isLg && values.lg !== undefined) return values.lg;
  if (isMd && values.md !== undefined) return values.md;
  if (isSm && values.sm !== undefined) return values.sm;
  
  return values.base;
} 