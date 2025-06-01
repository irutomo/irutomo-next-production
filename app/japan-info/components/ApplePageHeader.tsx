// ===================================
// Apple風ページヘッダーコンポーネント
// ===================================

import { SparklesIcon } from 'lucide-react';
import { LanguageKey } from '../lib/translations';
import { japanInfoTranslations } from '../lib/translations';
import { getFontClass } from '../lib/utils';

interface ApplePageHeaderProps {
  language: LanguageKey;
}

export function ApplePageHeader({ language }: ApplePageHeaderProps) {
  const t = japanInfoTranslations[language];
  const fontClass = getFontClass(language);
  
  return (
    <header className="bg-gradient-to-br from-white via-orange-50/30 to-white relative overflow-hidden">
      {/* 背景の装飾 */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-accent/5"></div>
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl"></div>
      
      <div className="container-responsive py-16 md:py-24 relative">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center bg-white/80 backdrop-blur-sm rounded-full px-6 py-2 mb-8 shadow-lg border border-accent/20">
            <SparklesIcon className="w-5 h-5 text-accent mr-2 animate-pulse" />
            <span className={`text-accent font-semibold ${fontClass}`}>
              {t.newInfoDelivery}
            </span>
          </div>
          
          <h1 className={`text-5xl md:text-7xl font-black mb-6 ${fontClass}`}>
            <span className="text-accent">{t.pageTitle}</span>
          </h1>
          
          <p className={`text-xl md:text-2xl text-gray-600 leading-relaxed max-w-2xl mx-auto ${fontClass}`}>
            {t.pageDescription}
          </p>
        </div>
      </div>
    </header>
  );
} 