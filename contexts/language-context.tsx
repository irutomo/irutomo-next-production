'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'ja' | 'ko';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  isLoaded: boolean;
};

const defaultContext: LanguageContextType = {
  language: 'ko',
  setLanguage: () => {},
  isLoaded: false
};

const LanguageContext = createContext<LanguageContextType>(defaultContext);

export const useLanguage = () => useContext(LanguageContext);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // 初期値は韓国語を使用
  const [language, setLanguage] = useState<Language>('ko');
  // 言語設定の読み込みが完了したかどうかのフラグ
  const [isLoaded, setIsLoaded] = useState(false);

  // クライアントサイドでのみ実行
  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem('language') as Language;
      if (savedLanguage && (savedLanguage === 'ja' || savedLanguage === 'ko')) {
        setLanguage(savedLanguage);
      } else {
        // 明示的に設定されていない場合は'ko'を設定
        localStorage.setItem('language', 'ko');
      }
    } catch (error) {
      console.error('ローカルストレージへのアクセスエラー:', error);
      // エラーが発生した場合は'ko'を使用
      setLanguage('ko');
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // 言語が変更されたらローカルストレージに保存
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    try {
      localStorage.setItem('language', lang);
    } catch (error) {
      console.error('ローカルストレージへの保存エラー:', error);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, isLoaded }}>
      {children}
    </LanguageContext.Provider>
  );
} 