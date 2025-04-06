'use client';

import Link from 'next/link';

export function ServiceFeatures() {
  const features = [
    {
      icon: '🌏',
      title: '日本の電話番号なしで予約',
      description: '韓国の電話番号だけで日本MZ世代から人気のあるレストランを予約可能',
      color: 'teal',
    },
    {
      icon: '🍔',
      title: '外国人が普段は予約できない食堂も掲載',
      description: 'IRUTOMOがあなたのリアルな現地体験をサポート',
      color: 'yellow',
    },
    {
      icon: '⏱️',
      title: '迅速な予約確定',
      description: '平均2時間以内に予約を確定いたします。予約不可時も100％返金',
      color: 'teal',
    },
    {
      icon: '💰',
      title: '高級食堂も代行手数料￥1,000',
      description: 'IRUTOMOはただの予約代行ではありません、日本現地人とのチャットサポートが利用可能！',
      color: 'yellow',
    }
  ];

  return (
    <section className="px-4 space-y-4 mb-8">
      <h2 className="text-lg font-bold flex items-center mb-4">
        <span className="text-xl mr-2">✨</span>
        IRUTOMOを使う理由
      </h2>
      
      {features.map((feature, index) => (
        <div 
          key={index}
          className={`p-4 border-2 ${
            feature.color === 'teal' ? 'border-teal-400' : 'border-yellow-500'
          } bg-white/50 rounded-lg transform hover:scale-[1.02] transition-transform duration-200`}
        >
          <div className="flex items-center gap-4">
            <div className="text-3xl flex items-center justify-center w-10 h-10">{feature.icon}</div>
            <div>
              <h3 className="font-bold mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
} 