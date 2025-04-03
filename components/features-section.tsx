export function FeaturesSection() {
  const features = [
    {
      icon: "🏠",
      title: "電話予約代行",
      description: "日本の電話番号がなくても予約可能"
    },
    {
      icon: "📖",
      title: "韓国語サポート",
      description: "すべてのサービスを韓国語で利用"
    },
    {
      icon: "🔔",
      title: "迅速な予約",
      description: "24時間以内に予約確定"
    },
    {
      icon: "🍔",
      title: "リーズナブルな価格",
      description: "予約1件につき1000円〜"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container max-w-6xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">サービスの特徴</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                <span className="text-2xl">{feature.icon}</span>
              </div>
              <h3 className="font-bold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 