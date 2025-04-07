'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/language-context';

export function CategoryButtons() {
  const { language } = useLanguage();
  
  const categoryTranslations = {
    ja: {
      popularRestaurants: '人気店舗',
      howToUse: '予約方法',
      japanInfo: '日本情報',
      guide: 'ガイド',
      faq: 'FAQ'
    },
    ko: {
      popularRestaurants: '인기 맛집',
      howToUse: '예약 방법',
      japanInfo: '일본 정보',
      guide: '가이드',
      faq: 'FAQ'
    }
  };
  
  const t = categoryTranslations[language];
  
  const categories = [
    { icon: '🍜', name: t.popularRestaurants, href: '/restaurants' },
    { icon: '📱', name: t.howToUse, href: '/how-to-use' },
    { icon: '🗺️', name: t.japanInfo, href: 'https://www.instagram.com/irutomo__kr?igshid=MWtmdmF0bHc4OXJ6bw%3D%3D&utm_source=qr', external: true },
    { icon: '💬', name: t.guide, href: 'https://irutomops.studio.site', external: true },
    { icon: '❓', name: t.faq, href: '/faq' },
  ];

  return (
    <div className="grid grid-cols-5 gap-3 md:gap-4 lg:gap-6 px-4 md:px-6 lg:px-8 mb-8 md:mb-12 max-w-5xl mx-auto">
      {categories.map((category, index) => (
        category.external ? (
          <a key={index} href={category.href} target="_blank" rel="noopener noreferrer" className="text-center focus:outline-none">
            <div className="bg-white w-14 h-14 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-2xl flex items-center justify-center mx-auto mb-2 md:mb-3 shadow-md hover:bg-teal-50 transition-colors transform hover:scale-[1.02] transition-transform duration-200">
              <span className="text-2xl md:text-3xl lg:text-4xl">{category.icon}</span>
            </div>
            <p className="text-xs md:text-sm lg:text-base text-text" data-component-name="CategoryButtons">{category.name}</p>
          </a>
        ) : (
          <Link key={index} href={category.href} className="text-center focus:outline-none">
            <div className="bg-white w-14 h-14 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-2xl flex items-center justify-center mx-auto mb-2 md:mb-3 shadow-md hover:bg-teal-50 transition-colors transform hover:scale-[1.02] transition-transform duration-200">
              <span className="text-2xl md:text-3xl lg:text-4xl">{category.icon}</span>
            </div>
            <p className="text-xs md:text-sm lg:text-base text-text" data-component-name="CategoryButtons">{category.name}</p>
          </Link>
        )
      ))}
    </div>
  );
}