export function ReviewsSection() {
  const reviews = [
    {
      name: "김민솔",
      date: "2025.02.15",
      rating: 4,
      text: "日本語が話せなくても日本現地人がオススメするレストランを予約できてとても良かったです！スタッフの方々も親切で、素早い対応が印象的",
      restaurant: "おおみや 焼肉＆本店"
    },
    {
      name: "송산철",
      date: "2025.02.10",
      rating: 5,
      text: "韓国から検索しても出てこない食堂に行くことができました。来ている人も日本人ばかりでしたが、味とサービスが素晴らかった！",
      restaurant: "炭火焼鳥 コウヘ"
    },
    {
      name: "김정한",
      date: "2025.02.05",
      rating: 4,
      text: "手数料は少しかかりますが、日本旅行に来る時ならきっても良いと思った！前回の日本旅行よりローカルな雰囲気を体験できました！",
      restaurant: "花"
    }
  ];

  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <svg 
            key={i} 
            className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <section className="py-16 bg-white">
      <div className="container max-w-6xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">レビュー</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold">{review.name}</h3>
                  <p className="text-xs text-gray-500">{review.date}</p>
                </div>
                <StarRating rating={review.rating} />
              </div>
              <p className="text-sm text-gray-700 mb-4">{review.text}</p>
              <div className="flex items-center text-xs text-gray-500">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {review.restaurant}
              </div>
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