import Image from 'next/image';

export const metadata = {
  title: 'サービス紹介 | IRUTOMO - 日本の飲食店予約サービス',
  description: '日本の電話番号がなくても、簡単に飲食店の予約ができるサービスの特徴や利用方法をご紹介します。',
};

export default function ServicePage() {
  // サービスの特徴
  const features = [
    {
      icon: '/images/Telephone.png',
      title: '日本の電話番号なしで予約',
      description: '韓国の電話番号だけで日本の人気レストランを予約できます。日本語での会話の心配なく美味しいお店を体験しましょう。'
    },
    {
      icon: '/images/Bellhop Bell.png',
      title: '多言語対応',
      description: '韓国語、日本語、英語でサービスを利用できるため、言語の壁なく便利に利用可能です。'
    },
    {
      icon: '/images/Open Book.png',
      title: '迅速な予約確定',
      description: '平均2時間以内に予約を確定いたします。急ぎの予約も心配いりません。'
    },
    {
      icon: '/images/Hamburger.png',
      title: '簡単な決済',
      description: 'クレジットカードなど様々な決済方法に対応しています。安全で便利な決済システムをご利用ください。'
    }
  ];

  // 利用方法
  const usageSteps = [
    {
      number: '01',
      title: 'レストラン選択',
      description: '地域、料理の種類などで希望のレストランを検索して選択してください。'
    },
    {
      number: '02',
      title: '予約情報入力',
      description: '日付、時間、人数など必要な情報を入力してください。'
    },
    {
      number: '03',
      title: '手数料のお支払い',
      description: '予約手数料をお支払いください。この金額はレストランの利用料金とは別です。'
    },
    {
      number: '04',
      title: '予約確定',
      description: '当社の担当者がレストランに直接連絡し、予約を確定します。確定後、メールでお知らせします。'
    }
  ];

  // よくある質問
  const faqs = [
    {
      question: '予約手数料はいくらですか？',
      answer: '予約に対して、1,000円〜の手数料が発生します。この金額は予約サービスに対する費用であり、レストランの利用料金とは別です。'
    },
    {
      question: '予約が確定するまでどのくらいかかりますか？',
      answer: '一般的に2時間以内に予約確定の可否をお知らせします。ただし、レストランの応答時間によってはさらに時間がかかる場合があります。'
    },
    {
      question: '予約をキャンセルできますか？',
      answer: '予約が確定する前であればキャンセルが可能で、手数料は全額返金されます。予約確定後はキャンセルができず、手数料も返金されません。'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ページタイトル */}
      <div className="bg-white py-8 border-b">
        <div className="container max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center">サービス紹介</h1>
        </div>
      </div>

      {/* IRUTOMOとは？ */}
      <section className="py-12">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-primary-500 mb-8">IRUTOMOとは？</h2>
          
          <div className="space-y-4 text-gray-700">
            <p>IRUTOMOは韓国人のための日本旅行サービスです。食事予約サービスは日本電話番号がなくても、日本の電話番号が必要なくても、簡単に日本現地人から人気のあるレストランを予約することができます。"日本の友達（일본친구）"という意味の通り、IRUTOMOは、あなたの日本旅行でより日本のリアルを感じる体験を提供しています。食事予約だけではなく、日本の友達ガイドに日本の日常を案内してもらえるガイドサービスも提供しています。</p>
            
            <p>主なサービス地域は大阪、京都、奈良、神戸など関西地域を中心に運営されており、徐々に東京などの他の地域にも拡大する予定です。</p>
          </div>
        </div>
      </section>

      {/* サービスの特徴 */}
      <section className="py-12 bg-gray-50">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-primary-500 mb-8">サービスの特徴</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 flex items-start">
                <div className="mr-4">
                  <div className="bg-primary-50 rounded-full p-3 w-14 h-14 flex items-center justify-center">
                    <Image 
                      src={feature.icon} 
                      alt={feature.title} 
                      width={28} 
                      height={28} 
                    />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 利用方法 */}
      <section className="py-12">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-primary-500 mb-8">利用方法</h2>
          
          <div className="space-y-6">
            {usageSteps.map((step, index) => (
              <div key={index} className="flex">
                <div className="mr-4">
                  <div className="bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center">
                    <span className="text-primary-500 text-lg font-bold">{step.number}</span>
                  </div>
                </div>
                <div className="pt-1">
                  <h3 className="font-bold text-lg mb-1">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* よくある質問 */}
      <section className="py-12 bg-primary-50">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-primary-500 mb-8">よくある質問</h2>
          
          <div className="bg-white rounded-lg p-8 shadow-md">
            <div className="space-y-8">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                  <h3 className="font-bold text-lg mb-3">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 