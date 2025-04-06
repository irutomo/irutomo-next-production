'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'ja' | 'ko';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
};

const defaultContext: LanguageContextType = {
  language: 'ko',
  setLanguage: () => {},
};

const LanguageContext = createContext<LanguageContextType>(defaultContext);

export const useLanguage = () => useContext(LanguageContext);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // ローカルストレージから言語設定を取得するか、デフォルトで韓国語を使用
  const [language, setLanguage] = useState<Language>('ko');

  // クライアントサイドでのみ実行
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'ja' || savedLanguage === 'ko')) {
      setLanguage(savedLanguage);
    }
  }, []);

  // 言語が変更されたらローカルストレージに保存
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
} 