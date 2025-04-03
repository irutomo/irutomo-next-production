import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container max-w-6xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 leading-tight">
          <span className="text-primary-500 block">日本の電話番号がなくても</span>
          <span className="text-primary-500 block">行きたいお店を予約可能！</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-center text-gray-700 mb-8">
          日本の人気店は電話予約のみの場合が多いです。IRUTOMOがあなたの美味しい店をサポートします。
        </p>
        
        <div className="flex justify-center">
          <Link 
            href="/reservation" 
            className="bg-primary-500 hover:bg-primary-600 text-white font-medium px-8 py-3 rounded-md transition-colors"
          >
            今すぐ予約
          </Link>
        </div>
      </div>
    </section>
  );
} 