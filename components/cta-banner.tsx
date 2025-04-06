'use client';

import Link from 'next/link';

export function CtaBanner() {
  return (
    <section className="px-4 mb-8">
      <div className="p-6 bg-gradient-to-br from-teal-400 to-yellow-500 text-white shadow-md rounded-lg">
        <h2 className="text-xl font-bold mb-3">今すぐ日本のリアルを体験しよう！</h2>
        <p className="text-sm mb-4">掲載店舗以外もリクエスト可能！</p>
        <Link href="/request">
          <button className="w-full bg-white text-teal-400 hover:bg-white/90 font-bold py-3 rounded-xl transform hover:scale-[1.02] transition-transform duration-200">
            リクエストする
          </button>
        </Link>
      </div>
    </section>
  );
} 