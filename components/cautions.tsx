export function Cautions() {
  const cautions = [
    {
      title: "予約キャンセル不可",
      description: "予約確定後のキャンセルはできません。慎重に予約してください。"
    },
    {
      title: "手数料返金不可",
      description: "予約手数料は予約確定後は返金されません。"
    },
    {
      title: "予約時間厳守",
      description: "予約時間の10分前までに到着されない場合、予約がキャンセルされる可能性があります。"
    },
    {
      title: "人数変更",
      description: "予約人数の変更はできません。新規予約が必要です。"
    },
    {
      title: "ノーショーペナルティ",
      description: "ノーショーの場合、今後のサービス利用が制限される可能性があります。"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container max-w-6xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">注意事項</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cautions.map((caution, index) => (
            <div key={index} className="flex gap-4 p-6 bg-white rounded-lg shadow-sm">
              <div className="flex-shrink-0 mt-1">
                <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-500 text-xs">●</span>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">{caution.title}</h3>
                <p className="text-sm text-gray-600">{caution.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 