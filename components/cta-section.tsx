import Link from 'next/link';

export function CTASection() {
  return (
    <section className="py-16 bg-white">
      <div className="container max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">今すぐ予約しよう</h2>
        
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <Link
            href="/reservation"
            className="bg-primary-500 hover:bg-primary-600 text-white font-medium px-8 py-3 rounded-md transition-colors"
          >
            レストラン予約する
          </Link>
          
          <Link
            href="/restaurants"
            className="bg-white hover:bg-gray-50 text-gray-800 font-medium px-8 py-3 rounded-md border border-gray-300 transition-colors"
          >
            提携店舗リストを見る
          </Link>
        </div>
      </div>
    </section>
  );
} 