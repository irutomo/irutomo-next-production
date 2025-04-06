"use client";

import { useState, useEffect } from "react";
import { MapPin, Phone, Calendar, Clock, Star, ChevronRight, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { SignInButton } from "@clerk/nextjs";

// 言語データの定義
const translations = {
  ko: {
    siteName: "IRUTOMO",
    hero: {
      title: "현지 일본인부터 인기있는 식당 간단히 예약!!",
      subtitle: "일본어로 전화만 예약가능한 식당도 저희라면 가능합니다!",
      cta: "지금 예약하기"
    },
    categories: [
      { icon: "🍜", name: "인기 식당" },
      { icon: "📱", name: "예약 방법" },
      { icon: "🗺️", name: "일본 정보" },
      { icon: "💬", name: "가이드" },
      { icon: "❓", name: "FAQ" },
    ],
    popularRestaurants: "현지 인기 식당",
    viewMore: "더보기",
    popular: "인기",
    book: "자세히 보기",
    services: {
      title: "서비스를 사용하는 이유",
      phone: {
        title: "일본 전화번호 없이 예약",
        desc: "한국 전화번호만으로 일본 MZ세대에게 인기있는 레스토랑 예약 가능"
      },
      easy: {
        title: "외국인이 예약하기 어려운 식당도 게재",
        desc: "IRUTOMO가 당신의 현지 체험을 서포트"
      },
      quick: {
        title: "신속한 예약 확정",
        desc: "평균 2시간 이내에 예약을 확정해 드립니다. 예약 불가 시 100% 환불"
      },
      premium: {
        title: "고급 식당도 대행 수수료 ¥1,000",
        desc: "IRUTOMO는 단순한 예약 대행이 아닙니다. 일본 현지인과의 채팅 서포트 이용 가능!"
      }
    },
    testimonials: {
      title: "고객 후기",
    },
    cta: {
      title: "지금 일본의 진짜 모습을 경험해보세요!",
      desc: "게재된 식당 외에도 요청 가능합니다!",
      button: "요청하기"
    },
    footer: {
      desc: "일본의 리얼을 더욱 즐겁게 체험!\n일본여행은　IRUTOMO!",
      rights: "  © 2025 IRUTOMO. All rights reserved."
    }
  },
  ja: {
    siteName: "IRUTOMO",
    hero: {
      title: "現地日本人から人気の食堂を簡単予約",
      subtitle: "電話予約のみの人気店も私たちにお任せください！",
      cta: "いますぐ予約する"
    },
    categories: [
      { icon: "🍜", name: "人気店舗" },
      { icon: "📱", name: "予約方法" },
      { icon: "🗺️", name: "日本情報" },
      { icon: "💬", name: "ガイド" },
      { icon: "❓", name: "FAQ" },
    ],
    popularRestaurants: "人気店舗",
    viewMore: "もっと見る",
    popular: "人気店",
    book: "詳細を見る",
    services: {
      title: "IRUTOMOを使う理由",
      phone: {
        title: "日本の電話番号なしで予約",
        desc: "韓国の電話番号だけで日本MZ世代から人気のあるレストランを予約可能"
      },
      easy: {
        title: "外国人が普段は予約できない食堂も掲載",
        desc: "IRUTOMOがあなたのリアルな現地体験をサポート"
      },
      quick: {
        title: "迅速な予約確定",
        desc: "平均2時間以内に予約を確定いたします。予約不可時も100％返金"
      },
      premium: {
        title: "高級食堂も代行手数料￥1,000",
        desc: "IRUTOMOはただの予約代行ではありません、日本現地人とのチャットサポートが利用可能！"
      }
    },
    testimonials: {
      title: "お客様の声",
    },
    cta: {
      title: "今すぐ日本のリアルを体験しよう！",
      desc: "掲載店舗以外もリクエスト可能！",
      button: "リクエストする"
    },
    footer: {
      desc: "日本のリアルをもっと楽しく体験！\n日本旅行はIRUTOMO!",
      rights: " © 2025 IRUTOMO. All rights reserved."
    }
  }
};

// レストランデータ
const restaurants = [
  {
    id: 1,
    name: {
      ko: "철판 만두 만두의 야마자키",
      ja: "鉄鍋餃子 餃子の山崎"
    },
    area: {
      ko: "오사카 북구",
      ja: "大阪北区"
    },
    rating: "4.4",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=400",
    tags: {
      ko: ["이자카야", "만두"],
      ja: ["居酒屋", "餃子"]
    },
    popular: true
  },
  {
    id: 2,
    name: {
      ko: "오뎅 술집 유아미",
      ja: "おでん酒場 湯あみ"
    },
    area: {
      ko: "오사카 북구",
      ja: "大阪北区"
    },
    rating: "4.2",
    image: "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?auto=format&fit=crop&w=400",
    tags: {
      ko: ["이자카야", "오뎅"],
      ja: ["居酒屋", "おでん"]
    },
    popular: true
  },
  {
    id: 3,
    name: {
      ko: "숯불구이 코쿠레",
      ja: "炭火焼鳥 コクレ"
    },
    area: {
      ko: "오사카 후쿠시마",
      ja: "大阪福島"
    },
    rating: "4.4",
    image: "https://images.unsplash.com/photo-1591684080176-bb2b73f9ec68?auto=format&fit=crop&w=400",
    tags: {
      ko: ["이자카야", "야키토리"],
      ja: ["居酒屋", "焼き鳥"]
    }
  }
];

// お客様の声データ
const testimonials = [
  {
    text: {
      ko: "탄화구이 나카오의 훈제 향이 한국 고기구이와 비슷해서 최고! 닭고기가 매우 부드럽고 꼬치 종류도 다양해서 감동했어요. 가게 분위기도 좋고 직원들도 친절해서 또 방문하고 싶어요.",
      ja: "韓国の焼肉に似たスモーキーな風味が最高！鶏肉はとても柔らかく、串の種類も豊富で感動、店内の雰囲気も良く、スタッフの対応も親切で、また来たいと思います。"
    },
    name: {
      ko: "김민준",
      ja: "キム・ミンジュン"
    },
    location: {
      ko: "서울",
      ja: "ソウル"
    },
    date: "2024/5/15",
    rating: 5,
    restaurant: {
      ko: "탄화구이 나카오",
      ja: "炭火焼鳥 なかお"
    }
  },
  {
    text: {
      ko: "고기의 품질이 훌륭하고 셰프의 기술에 감탄했어요. 고기의 풍미가 확실히 느껴집니다. 굽는 정도도 완벽해서 다시 먹고 싶게 만드는 요리예요. 가게 분위기도 차분해서 좋은 시간을 보냈습니다.",
      ja: "肉師じじいの肉の質が素晴らしく、シェフの技術に感心しました。肉の旨味がしっかりと感じられます。焼き加減も完璧で、また食べたいと思わせる一品。お店の雰囲気も落ち着いていて、良い時間を過ごせました。"
    },
    name: {
      ko: "이지은",
      ja: "イ・ジウン"
    },
    location: {
      ko: "부산",
      ja: "釜山"
    },
    date: "2024/5/10",
    rating: 4,
    restaurant: {
      ko: "니쿠시 지지이",
      ja: "肉師じじい"
    }
  },
  {
    text: {
      ko: "오뎅의 따뜻함이 편안하고 한국 국물과 비슷한 맛이라 친숙함을 느꼈어요. 편안한 분위기에서 휴식할 수 있었고 직원들의 대응도 따뜻했어요. 다양한 재료를 즐길 수 있는 것도 매력적이라 추운 계절에 다시 방문하고 싶어요.",
      ja: "おでんの温かさが心地よく、韓国のスープに似た味わいで懐かしさを感じました。居心地の良い雰囲気でリラックスでき、スタッフの対応も温かかったです。様々な具材が楽しめるのも魅力で、また寒い季節に訪れたいと思います。"
    },
    name: {
      ko: "최지우",
      ja: "チェ・ジウ"
    },
    location: {
      ko: "인천",
      ja: "仁川"
    },
    date: "2024/4/25",
    rating: 4,
    restaurant: {
      ko: "오뎅 사카바 유아미",
      ja: "おでん酒場 湯あみ"
    }
  }
];

export default function Home() {
  // 言語コンテキストから言語設定を取得
  const { language, setLanguage } = useLanguage();
  
  // 翻訳データの取得
  const t = translations[language];
  
  return (
    <main className="max-w-md mx-auto bg-[#F8F8F8] min-h-screen pb-20">
      {/* ヘッダー - 言語切り替えボタンを追加 */}
      <header className="flex justify-between items-center p-4 bg-white sticky top-0 z-50 shadow-custom">
        <div className="flex items-center">
          <img src="/_img_IRUTOMO.svg" alt="IRUTOMO" className="h-6" />
        </div>
        <div className="flex items-center">
          {/* 言語切り替えボタン */}
          <button 
            onClick={() => setLanguage("ko")} 
            className={`language-button mr-2 ${language === "ko" ? "active" : ""}`}
            aria-label="한국어로 전환"
          >
            <span className="text-xl">🇰🇷</span>
          </button>
          <button 
            onClick={() => setLanguage("ja")} 
            className={`language-button mr-4 ${language === "ja" ? "active" : ""}`}
            aria-label="日本語に切り替え"
          >
            <span className="text-xl">🇯🇵</span>
          </button>
          <SignInButton mode="modal">
            <button className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </SignInButton>
        </div>
      </header>

      {/* ヒーローバナー */}
      <div className="p-6 bg-gradient-to-br from-[#00CBB3] to-[#FFA500] rounded-2xl mx-4 my-6 text-white shadow-custom">
        <div className="flex items-center mb-4">
          <span className="text-4xl mr-3">🎧</span>
          <h2 className="text-2xl font-bold">
            {t.hero.title.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                <br />
              </span>
            ))}
          </h2>
        </div>
        <p className="text-sm opacity-90 mb-4">{t.hero.subtitle}</p>
        <Link href="/restaurants">
          <Button className="w-full bg-white text-[#00CBB3] hover:bg-white/90 font-bold py-3 rounded-xl hover-scale">
            {t.hero.cta}
          </Button>
        </Link>
      </div>

      {/* カテゴリー */}
      <div className="grid grid-cols-5 gap-3 px-4 mb-8">
        {t.categories.map((category, i) => {
          // FAQカテゴリーの場合はリンクを追加
          if (category.name === "FAQ" || category.name === "FAQ") {
            return (
              <Link key={i} href="/faq" className="text-center focus:outline-none">
                <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-custom hover:bg-[#00CBB3]/10 transition-colors hover-scale">
                  <span className="text-2xl">{category.icon}</span>
                </div>
                <p className="text-xs">{category.name}</p>
              </Link>
            );
          }
          
          // 人気店舗カテゴリーの場合はリンクを追加
          if (category.icon === "🍜") {
            return (
              <Link key={i} href="/restaurants" className="text-center focus:outline-none">
                <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-custom hover:bg-[#00CBB3]/10 transition-colors hover-scale">
                  <span className="text-2xl">{category.icon}</span>
                </div>
                <p className="text-xs">{category.name}</p>
              </Link>
            );
          }
          
          // 予約方法カテゴリーの場合はリンクを追加
          if (category.icon === "📱") {
            return (
              <Link key={i} href="/how-to-use" className="text-center focus:outline-none">
                <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-custom hover:bg-[#00CBB3]/10 transition-colors hover-scale">
                  <span className="text-2xl">{category.icon}</span>
                </div>
                <p className="text-xs">{category.name}</p>
              </Link>
            );
          }
          
          // ガイドカテゴリーの場合は外部リンクを追加
          if (category.icon === "💬") {
            return (
              <a key={i} href="https://irutomops.studio.site" target="_blank" rel="noopener noreferrer" className="text-center focus:outline-none">
                <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-custom hover:bg-[#00CBB3]/10 transition-colors hover-scale">
                  <span className="text-2xl">{category.icon}</span>
                </div>
                <p className="text-xs">{category.name}</p>
              </a>
            );
          }
          
          // 日本情報カテゴリーの場合はInstagramリンクを追加
          if (category.icon === "🗺️") {
            return (
              <a key={i} href="https://www.instagram.com/irutomo__kr?igshid=MWtmdmF0bHc4OXJ6bw%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="text-center focus:outline-none">
                <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-custom hover:bg-[#00CBB3]/10 transition-colors hover-scale">
                  <span className="text-2xl">{category.icon}</span>
                </div>
                <p className="text-xs">{category.name}</p>
              </a>
            );
          }
          
          // その他のカテゴリーは通常のボタン
          return (
            <button key={i} className="text-center focus:outline-none">
              <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-custom hover:bg-[#00CBB3]/10 transition-colors hover-scale">
                <span className="text-2xl">{category.icon}</span>
              </div>
              <p className="text-xs">{category.name}</p>
            </button>
          );
        })}
      </div>

      <div className="section-divider mx-4" />

      {/* 人気店舗 */}
      <section className="px-4 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold flex items-center">
            <span className="text-xl mr-2">🔥</span>
            {t.popularRestaurants}
          </h2>
          <Link href="/restaurants">
            <Button variant="ghost" className="text-sm text-[#FFA500] font-medium flex items-center">
              {t.viewMore}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="space-y-4">
          {restaurants.map((restaurant, i) => (
            <Card key={i} className="overflow-hidden shadow-custom hover-scale">
              <div className="relative h-48">
                <img src={restaurant.image} alt={restaurant.name[language]} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full text-sm font-bold flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
                  {restaurant.rating}
                </div>
                {restaurant.popular && (
                  <div className="absolute top-3 left-3 bg-[#FFA500] px-3 py-1 rounded-full text-xs font-bold text-white">
                    {t.popular}
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold">{restaurant.name[language]}</h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    {restaurant.area[language]}
                  </div>
                </div>
                <div className="flex gap-2 mb-3">
                  {restaurant.tags[language].map((tag, j) => (
                    <span key={j} className="text-xs bg-[#00CBB3]/10 text-[#00CBB3] px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="space-y-2">
                  <Link href={`/restaurants/${restaurant.id}`}>
                    <Button className="w-full bg-[#FFA500] hover:bg-[#FFA500]/90 text-white">
                      {t.book}
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <div className="section-divider mx-4" />

      {/* 特徴 */}
      <section className="px-4 space-y-4 mb-8">
        <h2 className="text-lg font-bold flex items-center mb-4">
          <span className="text-xl mr-2">✨</span>
          {t.services.title}
        </h2>
        <Card className="p-4 border-2 border-[#00CBB3] bg-white/50 hover-scale">
          <div className="flex items-center gap-4">
            <div className="text-3xl flex items-center justify-center w-10 h-10">🌏</div>
            <div>
              <h3 className="font-bold mb-1">{t.services.phone.title}</h3>
              <p className="text-sm text-gray-600">{t.services.phone.desc}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 border-2 border-[#FFA500] bg-white/50 hover-scale">
          <div className="flex items-center gap-4">
            <div className="text-3xl flex items-center justify-center w-10 h-10">🍔</div>
            <div>
              <h3 className="font-bold mb-1">{t.services.easy.title}</h3>
              <p className="text-sm text-gray-600">{t.services.easy.desc}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-2 border-[#00CBB3] bg-white/50 hover-scale">
          <div className="flex items-center gap-4">
            <div className="text-3xl flex items-center justify-center w-10 h-10">⏱️</div>
            <div>
              <h3 className="font-bold mb-1">{t.services.quick.title}</h3>
              <p className="text-sm text-gray-600">{t.services.quick.desc}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-2 border-[#FFA500] bg-white/50 hover-scale">
          <div className="flex items-center gap-4">
            <div className="text-3xl flex items-center justify-center w-10 h-10">💰</div>
            <div>
              <h3 className="font-bold mb-1">{t.services.premium.title}</h3>
              <p className="text-sm text-gray-600">{t.services.premium.desc}</p>
            </div>
          </div>
        </Card>
      </section>

      <div className="section-divider mx-4" />

      {/* お客様の声 */}
      <section className="px-4 mb-8">
        <h2 className="text-lg font-bold flex items-center mb-4">
          <span className="text-xl mr-2">💬</span>
          {t.testimonials.title}
        </h2>
        <div className="space-y-4">
          {testimonials.map((testimonial, i) => (
            <Card key={i} className="p-4 bg-white hover-scale">
              <div className="flex items-start gap-3 mb-3">
                <div className="bg-gradient-to-br from-[#00CBB3] to-[#FFA500] rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">
                  {testimonial.name[language].charAt(0)}
                </div>
                <div>
                  <p className="font-bold">{testimonial.name[language]}</p>
                  <p className="text-xs text-gray-500">{testimonial.location[language]}</p>
                  <p className="text-xs text-gray-500">{testimonial.date}</p>
                </div>
              </div>
              <div className="flex mb-2">
                {[...Array(testimonial.rating)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-sm">{testimonial.text[language]}</p>
              <p className="text-xs text-gray-500">{testimonial.restaurant[language]}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 mb-8">
        <Card className="p-6 bg-gradient-to-br from-[#00CBB3] to-[#FFA500] text-white shadow-custom">
          <h2 className="text-xl font-bold mb-3">{t.cta.title}</h2>
          <p className="text-sm mb-4">{t.cta.desc}</p>
          <Link href="/request">
            <Button className="w-full bg-white text-[#00CBB3] hover:bg-white/90 font-bold py-3 rounded-xl hover-scale">
              {t.cta.button}
            </Button>
          </Link>
        </Card>
      </section>

      {/* フッター */}
      <footer className="bg-white pt-8 pb-20 px-4">
        <div className="flex items-center mb-6">
          <img src="/_img_IRUTOMO.svg" alt="IRUTOMO" className="h-6" />
        </div>
        <p className="text-sm text-gray-500 mb-6">
          {t.footer.desc.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))}
        </p>
        <div className="mb-4 flex flex-wrap gap-x-4 text-xs text-gray-500">
          <Link href="/privacy-policy" className="hover:text-[#00CBB3]">
            {language === "ko" ? "개인정보 처리방침" : "プライバシーポリシー"}
          </Link>
          <Link href="/legal" className="hover:text-[#00CBB3]">
            {language === "ko" ? "특정 상거래법에 기반한 표기" : "特定商取引法に基づく表記"}
          </Link>
        </div>
        <div className="text-xs text-gray-400">
          {t.footer.rights}
        </div>
      </footer>
    </main>
  );
}