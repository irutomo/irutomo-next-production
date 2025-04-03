import type { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

type Props = {
  params: Promise<{ id: string }>;
};

// 擬似的なデータベース
const restaurants = [
  {
    id: '1',
    name: '熟成肉と本格炭火焼肉 又三郎',
    reviews: [
      {
        id: 101,
        userId: 'user123',
        userName: '山田太郎',
        userIcon: '/images/default_icon.jpg',
        rating: 5,
        date: '2023-12-15',
        content: '肉の質が素晴らしく、特に熟成肉は絶品でした。接客も丁寧で居心地の良い空間でした。家族で訪れましたが、子供も大満足でした。また必ず訪れたいと思います。',
        images: ['/images/reviews/meat.jpg'],
        tags: ['接客が良い', '雰囲気が良い', '料理が美味しい'],
      },
      {
        id: 102,
        userId: 'user456',
        userName: '佐藤花子',
        userIcon: '/images/default_icon.jpg',
        rating: 4,
        date: '2023-11-20',
        content: '友人と訪れました。肉の味は確かに良かったのですが、少し混雑していて騒がしかったです。それでも料理の質は素晴らしく、特に塩タンがおすすめです。',
        images: [],
        tags: ['料理が美味しい', 'コスパが良い'],
      }
    ]
  },
  {
    id: '2',
    name: 'まほろば囲炉裏 心斎橋',
    reviews: [
      {
        id: 103,
        userId: 'user789',
        userName: '田中一郎',
        userIcon: '/images/default_icon.jpg',
        rating: 5,
        date: '2023-12-10',
        content: '囲炉裏を囲んで食事するスタイルが新鮮で楽しかったです。おでんが特に美味しく、日本酒との相性も抜群でした。接客も丁寧で、店の雰囲気も落ち着いていて良かったです。',
        images: ['/images/reviews/oden.jpg'],
        tags: ['雰囲気が良い', '接客が良い', '料理が美味しい'],
      }
    ]
  },
  {
    id: '3',
    name: '焼鳥YAMATO',
    reviews: [
      {
        id: 104,
        userId: 'user101',
        userName: '鈴木健太',
        userIcon: '/images/default_icon.jpg',
        rating: 4,
        date: '2023-12-05',
        content: '焼き鳥の種類が豊富で、どれも美味しかったです。特に、つくねと首肉がおすすめです。カウンター席でシェフの技を見ながら食べられるのも良かったです。',
        images: ['/images/reviews/yakitori.jpg'],
        tags: ['料理が美味しい', '一人でも入りやすい'],
      },
      {
        id: 105,
        userId: 'user202',
        userName: '伊藤由美',
        userIcon: '/images/default_icon.jpg',
        rating: 3,
        date: '2023-11-25',
        content: '味は良かったのですが、店内が少し狭く感じました。予約して行くことをお勧めします。焼き鳥は美味しかったですが、値段は少し高めです。',
        images: [],
        tags: ['料理が美味しい', '少し高い'],
      }
    ]
  }
];

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const paramsData = await params;
  const restaurant = restaurants.find(r => r.id === paramsData.id);
  
  if (!restaurant) {
    return {
      title: '店舗が見つかりません | IRUTOMO',
    };
  }

  return {
    title: `${restaurant.name}のレビュー一覧 | IRUTOMO - 日本の飲食店予約サービス`,
    description: `${restaurant.name}の口コミ・レビュー一覧。実際に利用したお客様からの評価をご覧いただけます。`,
  };
}

// 星評価を表示するコンポーネント
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-5 h-5 ${
            i < rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-2 text-gray-700">{rating}.0</span>
    </div>
  );
}

export default async function RestaurantReviewsPage({ params }: Props) {
  const paramsData = await params;
  const restaurant = restaurants.find(r => r.id === paramsData.id);
  
  if (!restaurant) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold">店舗が見つかりません</h1>
        <p className="mt-4">指定された店舗は存在しないか、削除された可能性があります。</p>
        <Link 
          href="/restaurants" 
          className="mt-8 inline-block bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-md transition-colors"
        >
          店舗一覧に戻る
        </Link>
      </div>
    );
  }

  // レビューの平均評価を計算
  const averageRating = restaurant.reviews.length > 0
    ? restaurant.reviews.reduce((sum, review) => sum + review.rating, 0) / restaurant.reviews.length
    : 0;

  // タグの集計
  const tagCounts: { [key: string]: number } = {};
  restaurant.reviews.forEach(review => {
    review.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  // タグを出現回数順にソート
  const sortedTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag);

  return (
    <div className="py-8">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <Link 
            href={`/restaurants/${paramsData.id}`}
            className="text-primary-500 hover:text-primary-700 flex items-center"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              ></path>
            </svg>
            店舗詳細に戻る
          </Link>
        </div>
        
        <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 p-6 mb-8">
          <h1 className="text-2xl font-bold mb-2">{restaurant.name}のレビュー</h1>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gray-800 mr-2">{averageRating.toFixed(1)}</span>
              <StarRating rating={Math.round(averageRating)} />
            </div>
            <span className="text-gray-600">レビュー {restaurant.reviews.length}件</span>
          </div>
        </div>
        
        {/* タグフィルター */}
        {sortedTags.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-3">人気のタグ</h2>
            <div className="flex flex-wrap gap-2">
              {sortedTags.map(tag => (
                <span
                  key={tag}
                  className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm hover:bg-gray-200 cursor-pointer"
                >
                  {tag} ({tagCounts[tag]})
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* レビュー投稿ボタン */}
        <div className="mb-8 flex justify-end">
          <Link
            href={`/write-review?restaurant=${paramsData.id}`}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md transition-colors inline-flex items-center"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              ></path>
            </svg>
            レビューを書く
          </Link>
        </div>
        
        {/* レビュー一覧 */}
        <div className="space-y-6">
          {restaurant.reviews.length > 0 ? (
            restaurant.reviews.map(review => (
              <div 
                key={review.id} 
                className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 p-6"
              >
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-xs">ユーザー</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-bold">{review.userName}</h3>
                      <StarRating rating={review.rating} />
                      <span className="text-gray-500 text-sm">{review.date}</span>
                    </div>
                    <p className="text-gray-700 mb-4">{review.content}</p>
                    
                    {/* レビュー画像 */}
                    {review.images.length > 0 && (
                      <div className="mb-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {review.images.map((image, index) => (
                            <div key={index} className="aspect-w-1 aspect-h-1 relative">
                              <div className="w-full h-24 bg-gray-200 rounded flex items-center justify-center">
                                <span className="text-gray-500 text-xs">{image}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* タグ */}
                    {review.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {review.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                ></path>
              </svg>
              <h3 className="text-lg font-bold mb-2">まだレビューがありません</h3>
              <p className="text-gray-600 mb-6">最初のレビューを投稿してみませんか？</p>
              <Link
                href={`/write-review?restaurant=${paramsData.id}`}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-md transition-colors inline-block"
              >
                レビューを書く
              </Link>
            </div>
          )}
        </div>

        {/* ページネーション（レビュー数が多い場合） */}
        {restaurant.reviews.length > 5 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center gap-1">
              <button className="px-3 py-1 rounded border border-gray-300 text-gray-500 hover:bg-gray-50">前へ</button>
              <button className="px-3 py-1 rounded bg-primary-500 text-white">1</button>
              <button className="px-3 py-1 rounded border border-gray-300 text-gray-500 hover:bg-gray-50">2</button>
              <button className="px-3 py-1 rounded border border-gray-300 text-gray-500 hover:bg-gray-50">次へ</button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
} 