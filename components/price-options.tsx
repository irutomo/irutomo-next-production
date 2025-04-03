export function PriceOptions() {
  const options = [
    {
      title: "合計人数1〜4名（大人、子供含めたご利用人数）",
      price: "¥1,000"
    },
    {
      title: "合計人数5〜8名（大人、子供含めたご利用人数）",
      price: "¥2,000"
    },
    {
      title: "合計人数9〜12名（大人、子供含めたご利用人数）",
      price: "¥3,000"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container max-w-6xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">追加オプション</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {options.map((option, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-medium text-gray-800 mb-4 text-sm">{option.title}</h3>
              <p className="text-primary-500 font-bold text-xl">{option.price}</p>
            </div>
          ))}
        </div>
        
        <p className="text-center text-gray-500 text-sm mt-6">* オプションは予約時に追加できます</p>
      </div>
    </section>
  );
} 