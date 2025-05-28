// ===================================
// Japan Info Hero Section Component（オウンドメディア風）
// ===================================

export default function JapanInfoHero() {
  return (
    <section className="relative bg-white border-b border-gray-100">
      {/* 背景パターン */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* メインタイトル */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            日本の魅力を
            <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              発見しよう
            </span>
          </h1>
          
          {/* サブタイトル */}
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
            全国の観光地、文化、グルメ情報から
            <br className="hidden sm:block" />
            あなただけの特別な体験を見つけてください
          </p>
          
          {/* カテゴリーアイコン */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <span className="text-3xl mb-2">🏯</span>
              <span className="text-sm font-medium text-gray-700">文化・歴史</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <span className="text-3xl mb-2">🍜</span>
              <span className="text-sm font-medium text-gray-700">グルメ</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <span className="text-3xl mb-2">🌸</span>
              <span className="text-sm font-medium text-gray-700">自然・絶景</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <span className="text-3xl mb-2">🎌</span>
              <span className="text-sm font-medium text-gray-700">体験・アクティビティ</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 