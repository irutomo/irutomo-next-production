// ===================================
// Japan Info Hero Section Component
// ===================================

export default function JapanInfoHero() {
  return (
    <section className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
      <div className="absolute inset-0 bg-black/20" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            日本の魅力を
            <span className="block text-yellow-300">発見しよう</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto mb-8 leading-relaxed">
            全国の観光地、文化、グルメ情報から
            <br className="hidden sm:block" />
            あなただけの特別な体験を見つけてください
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center space-x-2 text-blue-100">
              <span className="text-2xl">🏯</span>
              <span>文化・歴史</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-100">
              <span className="text-2xl">🍜</span>
              <span>グルメ</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-100">
              <span className="text-2xl">🌸</span>
              <span>自然・絶景</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-100">
              <span className="text-2xl">🎌</span>
              <span>体験・アクティビティ</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 波模様のデコレーション */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-16 text-white"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
} 