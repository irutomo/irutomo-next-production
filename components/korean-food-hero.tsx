'use client';

import Link from 'next/link';

export function KoreanFoodHero() {
  return (
    <div className="px-4 pt-6 pb-4">
      <div className="hero-banner bg-gradient-to-br from-[#FFA500] to-[#00CBB3] rounded-2xl p-6 text-white shadow-sm">
        <h2 className="text-2xl font-bold mb-3 leading-relaxed">
          現地日本人から<br />
          人気の食堂を<br />
          簡単予約 🍽️
        </h2>
        <p className="text-sm opacity-90 mb-4">電話予約のみの人気店も私たちにお任せください！</p>
        
        <Link href="/restaurants" className="inline-block bg-white text-[#FFA500] font-medium px-4 py-2 rounded-full text-sm shadow-sm hover:bg-opacity-90 transition-colors">
          予約する
        </Link>
      </div>
    </div>
  );
} 