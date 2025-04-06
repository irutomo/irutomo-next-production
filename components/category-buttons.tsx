'use client';

import Link from 'next/link';

export function CategoryButtons() {
  const categories = [
    { icon: '🍜', name: '人気店舗', href: '/restaurants' },
    { icon: '📱', name: '予約方法', href: '/how-to-use' },
    { icon: '🗺️', name: '日本情報', href: 'https://www.instagram.com/irutomo__kr?igshid=MWtmdmF0bHc4OXJ6bw%3D%3D&utm_source=qr', external: true },
    { icon: '💬', name: 'ガイド', href: 'https://irutomops.studio.site', external: true },
    { icon: '❓', name: 'FAQ', href: '/faq' },
  ];

  return (
    <div className="grid grid-cols-5 gap-3 px-4 mb-8">
      {categories.map((category, index) => (
        category.external ? (
          <a key={index} href={category.href} target="_blank" rel="noopener noreferrer" className="text-center focus:outline-none">
            <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-md hover:bg-teal-50 transition-colors transform hover:scale-[1.02] transition-transform duration-200">
              <span className="text-2xl">{category.icon}</span>
            </div>
            <p className="text-xs">{category.name}</p>
          </a>
        ) : (
          <Link key={index} href={category.href} className="text-center focus:outline-none">
            <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-md hover:bg-teal-50 transition-colors transform hover:scale-[1.02] transition-transform duration-200">
              <span className="text-2xl">{category.icon}</span>
            </div>
            <p className="text-xs">{category.name}</p>
          </Link>
        )
      ))}
    </div>
  );
} 