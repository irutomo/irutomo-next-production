'use client';

import { useLanguage } from '@/contexts/language-context';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  
  return (
    <div className="flex items-center">
      <button 
        className={`bg-transparent border-none cursor-pointer text-xl p-1 mr-2 ${language === 'ko' ? 'opacity-100 scale-110' : 'opacity-50'}`}
        onClick={() => setLanguage('ko')}
        aria-label="한국어로 전환"
      >
        <span className="text-xl">🇰🇷</span>
      </button>
      <button 
        className={`bg-transparent border-none cursor-pointer text-xl p-1 ${language === 'ja' ? 'opacity-100 scale-110' : 'opacity-50'}`}
        onClick={() => setLanguage('ja')}
        aria-label="日本語に切り替え"
      >
        <span className="text-xl">🇯🇵</span>
      </button>
    </div>
  );
} 