'use client';

import Link from 'next/link';

export function CategoryButtons() {
  const categories = [
    { icon: '🍜', name: '人気店舗', href: '/restaurants' },
    { icon: '📱', name: '予約方法', href: '/service' },
    { icon: '🗺️', name: 'エリア', href: '/restaurants?view=area' },
    { icon: '💬', name: '通訳', href: '/service#translation' },
    { icon: '❓', name: 'FAQ', href: '/service#faq' },
  ];

  return (
    <div className="px-4 py-4 sm:px-6 md:px-8 md:py-8">
      <div className="grid grid-cols-5 gap-3 md:gap-6 lg:gap-8">
        {categories.map((category, index) => (
          <Link href={category.href} key={index} className="flex flex-col items-center">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-2 text-2xl shadow-md hover:bg-[rgba(0,203,179,0.1)] transition-colors md:w-20 md:h-20 md:text-3xl lg:w-24 lg:h-24 lg:text-4xl">
              {category.icon}
            </div>
            <span className="text-xs md:text-sm lg:text-base">{category.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
} 