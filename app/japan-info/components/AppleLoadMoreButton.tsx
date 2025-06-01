// ===================================
// Apple風もっと読み込むボタンコンポーネント
// ===================================

import { SparklesIcon } from 'lucide-react';
import { LanguageKey, japanInfoTranslations } from '../lib/translations';
import { getFontClass } from '../lib/utils';

interface AppleLoadMoreButtonProps {
  language: LanguageKey;
  onClick: () => void;
  disabled?: boolean;
}

export function AppleLoadMoreButton({ language, onClick, disabled = false }: AppleLoadMoreButtonProps) {
  const t = japanInfoTranslations[language];
  const fontClass = getFontClass(language);

  return (
    <div className="text-center mt-12">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`group inline-flex items-center px-10 py-4 bg-gradient-to-r from-accent to-accent/80 text-white rounded-full hover:from-accent/90 hover:to-accent/70 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed ${fontClass}`}
      >
        <SparklesIcon className="w-5 h-5 mr-2 group-hover:animate-spin" />
        {t.loadMore}
      </button>
    </div>
  );
} 