'use client';

import { Star } from 'lucide-react';

interface Review {
  name: string;
  location: string;
  date: string;
  rating: number;
  text: string;
  restaurant: string;
  initial: string;
}

export function CustomerReviews() {
  const reviews: Review[] = [
    {
      name: "キム・ミンジュン",
      location: "ソウル",
      date: "2024/5/15",
      rating: 5,
      text: "韓国の焼肉に似たスモーキーな風味が最高！鶏肉はとても柔らかく、串の種類も豊富で感動、店内の雰囲気も良く、スタッフの対応も親切で、また来たいと思います。",
      restaurant: "炭火焼鳥 なかお",
      initial: "キ"
    },
    {
      name: "イ・ジウン",
      location: "釜山",
      date: "2024/5/10",
      rating: 4,
      text: "肉師じじいの肉の質が素晴らしく、シェフの技術に感心しました。肉の旨味がしっかりと感じられます。焼き加減も完璧で、また食べたいと思わせる一品。お店の雰囲気も落ち着いていて、良い時間を過ごせました。",
      restaurant: "肉師じじい",
      initial: "イ"
    },
    {
      name: "チェ・ジウ",
      location: "仁川",
      date: "2024/4/25",
      rating: 4,
      text: "おでんの温かさが心地よく、韓国のスープに似た味わいで懐かしさを感じました。居心地の良い雰囲気でリラックスでき、スタッフの対応も温かかったです。様々な具材が楽しめるのも魅力で、また寒い季節に訪れたいと思います。",
      restaurant: "おでん酒場 湯あみ",
      initial: "チ"
    }
  ];

  return (
    <section className="px-4 mb-8">
      <h2 className="text-lg font-bold flex items-center mb-4">
        <span className="text-xl mr-2">💬</span>
        お客様の声
      </h2>
      <div className="space-y-4">
        {reviews.map((review, i) => (
          <div key={i} className="p-4 bg-white rounded-lg shadow-md transform hover:scale-[1.02] transition-transform duration-200">
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-gradient-to-br from-teal-400 to-yellow-500 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">
                {review.initial}
              </div>
              <div>
                <p className="font-bold">{review.name}</p>
                <p className="text-xs text-gray-500">{review.location}</p>
                <p className="text-xs text-gray-500">{review.date}</p>
              </div>
            </div>
            <div className="flex mb-2">
              {[...Array(5)].map((_, j) => (
                <svg 
                  key={j} 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-4 w-4 ${j < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-sm">{review.text}</p>
            <p className="text-xs text-gray-500">{review.restaurant}</p>
          </div>
        ))}
      </div>
    </section>
  );
} 