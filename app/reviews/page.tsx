import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'レビュー | IRUTOMO - 日本の飲食店予約サービス',
  description: '実際にIRUTOMOを利用したお客様のレビューをご覧いただけます。日本の飲食店予約の体験談を参考にしてください。',
};

interface Review {
  id: number;
  userName: string;
  userNameJp: string;
  date: string;
  rating: number;
  restaurantName: string;
  text: string;
  imageSrc?: string;
  tags: string[];
  helpfulCount: number;
}

export default function ReviewsPage() {
  // レビューデータ
  const reviews: Review[] = [
    {
      id: 1,
      userName: '김민준',
      userNameJp: 'キム・ミンジュン',
      date: '2024/5/15',
      rating: 5,
      restaurantName: '炭火焼鳥 なかお',
      text: '韓国の焼肉に似たスモーキーな風味が最高です！肉質はとても柔らかく、鶏の種類も豊富で感動しました。特に、つくねは絶品でした。店内の雰囲気も良く、スタッフの対応も親切で、また来たいと思います。',
      imageSrc: '/images/reviews/yakitori.jpg',
      tags: ['焼鳥', 'スモーキー', '接待'],
      helpfulCount: 28
    },
    {
      id: 2,
      userName: '이지은',
      userNameJp: 'イ・ジウン',
      date: '2024/5/10',
      rating: 5,
      restaurantName: '肉師じじい',
      text: '肉の質が素晴らしく、シェフの技術に感心しました。肉の旨味がしっかりと感じられます。焼き加減も完璧で、また食べたいと思わせる一品でした。お店の雰囲気も清潔感があって、良い時間を過ごせました。',
      imageSrc: '/images/reviews/meat.jpg',
      tags: ['肉料理', '個人経営', 'カップル'],
      helpfulCount: 16
    },
    {
      id: 3,
      userName: '박서준',
      userNameJp: 'パク・ソジュン',
      date: '2024/5/3',
      rating: 4,
      restaurantName: '酒肴飯 プリオ 料理人文一郎',
      text: '色々な小皿料理と日本酒のペアリングが楽しかったです。シェフの技術と雰囲気気に魅了されました。韓国料理とは違う魅力があり、特に季節の食材を使った料理が印象的でした。店内の落ち着いた雰囲気も良かったです。また訪れたいお店です。',
      imageSrc: '/images/reviews/sake.jpg',
      tags: ['居酒屋', '日本酒', '接待'],
      helpfulCount: 14
    },
    {
      id: 4,
      userName: '최지우',
      userNameJp: 'チェ・ジウ',
      date: '2024/4/25',
      rating: 4,
      restaurantName: 'おでん酒場 湯あみ',
      text: 'おでんの温かさが心地よく、韓国のスープにはない味わいで癒されました。居心地の良い雰囲気で安らぎを感じながら、スタッフの対応も温かかったです。様々な具材が楽しめるのも魅力で、また寒い季節に訪れたいと思います。',
      imageSrc: '/images/reviews/oden.jpg',
      tags: ['おでん', '冬におすすめ', 'ほっこり'],
      helpfulCount: 24
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ページタイトル */}
      <div className="bg-primary-50 py-12 border-b">
        <div className="container max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center text-primary-700">訪問者レビュー</h1>
          <p className="text-center text-primary-600 mt-3">実際の訪問者の意見をご確認ください</p>
        </div>
      </div>

      {/* 検索とフィルター */}
      <section className="py-8 border-b">
        <div className="container max-w-6xl mx-auto px-4">
          {/* 検索バー */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="レストラン名、地域、料理の種類で検索..."
                className="w-full py-3 px-4 pl-10 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <div className="absolute left-3 top-3.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* フィルターとソート */}
          <div className="flex flex-wrap justify-between items-center">
            {/* フィルタータブ */}
            <div className="flex space-x-2 mb-4 md:mb-0 overflow-x-auto pb-2">
              <button className="px-4 py-2 rounded-full bg-primary-500 text-white font-medium text-sm hover:bg-primary-600 transition-colors">
                すべて (4)
              </button>
              <button className="px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 hover:border-primary-300 transition-colors">
                肯定的
              </button>
              <button className="px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 hover:border-primary-300 transition-colors">
                中立的
              </button>
              <button className="px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 hover:border-primary-300 transition-colors">
                否定的
              </button>
            </div>

            {/* ソートドロップダウン */}
            <div className="relative">
              <select className="appearance-none bg-white border border-gray-200 rounded-lg py-2 px-4 pr-8 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 hover:border-primary-300 transition-colors">
                <option>最新順</option>
                <option>評価順</option>
                <option>参考になった順</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* おすすめレビュー */}
      <section className="py-12">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-primary-700">おすすめレビュー</h2>
            <Link 
              href="/write-review" 
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md transition-colors font-medium"
            >
              レビューを書く
            </Link>
          </div>

          <div className="space-y-8">
            {reviews.map(review => (
              <div key={review.id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  {/* ユーザーアイコン */}
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-500 font-bold">
                      {review.userName[0]}
                    </div>
                  </div>

                  {/* レビュー内容 */}
                  <div className="flex-grow">
                    {/* ユーザー情報と評価 */}
                    <div className="flex flex-wrap justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold">{review.userNameJp} ({review.userName})</h3>
                        <div className="text-sm text-gray-500">
                          {review.date}
                          {' · '}
                          <span className="text-primary-500">認証済み訪問</span>
                        </div>
                      </div>
                      
                      {/* 星評価 */}
                      <div className="flex text-yellow-400 mt-1 md:mt-0">
                        {[...Array(5)].map((_, i) => (
                          <svg 
                            key={i} 
                            className={`w-5 h-5 ${i < review.rating ? 'text-primary-500' : 'text-gray-300'}`} 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="ml-2 text-gray-600 font-bold">{review.rating}.0</span>
                      </div>
                    </div>

                    {/* レストラン名 */}
                    <h4 className="font-bold text-lg mb-2 text-primary-800">{review.restaurantName}</h4>
                    
                    {/* レビューテキスト */}
                    <p className="text-gray-700 mb-4">{review.text}</p>
                    
                    {/* レビュー画像（あれば） */}
                    {review.imageSrc && (
                      <div className="mb-4">
                        <div className="relative h-48 sm:h-64 w-full rounded-lg overflow-hidden">
                          <Image 
                            src={review.imageSrc} 
                            alt={review.restaurantName} 
                            fill
                            style={{ objectFit: 'cover' }}
                            className="rounded-lg hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* タグ */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {review.tags.map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-primary-50 rounded-full text-sm text-primary-700 hover:bg-primary-100 transition-colors">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    {/* 参考になったボタン */}
                    <div className="flex items-center justify-end">
                      <button className="flex items-center text-gray-500 hover:text-primary-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        参考になりましたか？
                      </button>
                      <span className="ml-2 text-sm text-gray-500">{review.helpfulCount}人が参考になったと言っています</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* ページネーション */}
          <div className="mt-10 flex justify-center">
            <Link 
              href="/write-review" 
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-md transition-colors font-medium shadow-md hover:shadow-lg"
            >
              レビューを書く
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 