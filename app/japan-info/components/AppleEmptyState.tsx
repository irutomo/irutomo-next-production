// ===================================
// Apple風空状態表示コンポーネント
// ===================================

import { LanguageKey, japanInfoTranslations } from '../lib/translations';
import { getFontClass } from '../lib/utils';

interface AppleEmptyStateProps {
  language: LanguageKey;
}

export function AppleEmptyState({ language }: AppleEmptyStateProps) {
  const t = japanInfoTranslations[language];
  const fontClass = getFontClass(language);

  return (
    <div className="text-center py-20">
      <div className="text-8xl mb-8">🍯</div>
      <h3 className={`text-2xl font-bold text-gray-900 mb-4 ${fontClass}`}>
        {t.noArticles}
      </h3>
      <p className={`text-lg text-gray-600 ${fontClass}`}>
        {t.comingSoon}
      </p>
    </div>
  );
} 