import Link from 'next/link';

export function HeroSection() {
  return (
    <div className="p-6 bg-gradient-to-br from-teal-400 to-yellow-500 rounded-2xl mx-4 my-6 text-white shadow-md">
      <div className="flex items-center mb-4">
        <span className="text-4xl mr-3">🎧</span>
        <h2 className="text-2xl font-bold">
          現地日本人から人気の食堂を簡単予約
        </h2>
      </div>
      <p className="text-sm opacity-90 mb-4">電話予約のみの人気店も私たちにお任せください！</p>
      <Link href="/restaurants">
        <button className="w-full bg-white text-teal-400 hover:bg-white/90 font-bold py-3 rounded-xl transform hover:scale-[1.02] transition-transform duration-200">
          いますぐ予約する
        </button>
      </Link>
    </div>
  );
} 