// ===================================
// 記事詳細ナビゲーションコンポーネント
// ===================================

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LanguageKey, japanInfoTranslations } from '../../lib/translations';
import { getFontClass } from '../../lib/utils';

interface LanguageToggleProps {
  currentLang: LanguageKey;
  onLanguageChange: (lang: LanguageKey) => void;
}

interface ArticleNavigationProps {
  language: LanguageKey;
  onLanguageChange: (lang: LanguageKey) => void;
}

function LanguageToggle({ currentLang, onLanguageChange }: LanguageToggleProps) {
  const isKorean = currentLang === 'ko';
  const targetLang = isKorean ? 'ja' : 'ko';
  const buttonText = isKorean ? '日本語で見る' : '한국어로 보기';
  const fontClass = getFontClass(targetLang);
  
  const handleClick = () => {
    onLanguageChange(targetLang);
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors ${fontClass}`}
    >
      {buttonText}
    </button>
  );
}

export function ArticleNavigation({ language, onLanguageChange }: ArticleNavigationProps) {
  const t = japanInfoTranslations[language];
  const fontClass = getFontClass(language);

  return (
    <nav className="border-b border-gray-100 bg-white sticky top-0 z-10">
      <div className="container-responsive">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/japan-info"
            className={`inline-flex items-center text-gray-600 hover:text-accent transition-colors ${fontClass}`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">
              {t.japanInfo}
            </span>
          </Link>
          
          <LanguageToggle 
            currentLang={language}
            onLanguageChange={onLanguageChange}
          />
        </div>
      </div>
    </nav>
  );
} 