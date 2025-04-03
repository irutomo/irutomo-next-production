export function UsageSteps() {
  const steps = [
    {
      number: "01",
      title: "お店を選択",
      description: "おすすめ店から選ぶか、希望のお店をリクエスト"
    },
    {
      number: "02",
      title: "予約情報入力",
      description: "日付、時間、人数を入力して予約をリクエスト"
    },
    {
      number: "03",
      title: "手数料のお支払い",
      description: "予約手数料をお支払い"
    },
    {
      number: "04",
      title: "予約確定",
      description: "24時間以内にメールで予約確定をお知らせ"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container max-w-6xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">ご利用方法</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="mb-4">
                <span className="text-4xl font-bold text-primary-500">{step.number}</span>
              </div>
              <h3 className="font-bold mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-12 flex justify-center">
          <a 
            href="#reservation" 
            className="bg-primary-500 hover:bg-primary-600 text-white font-medium px-8 py-3 rounded-md transition-colors"
          >
            今すぐ予約
          </a>
        </div>
      </div>
    </section>
  );
} 