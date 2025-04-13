'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/language-context';
import { useEffect, useState } from 'react';

export function HeroSection() {
  const { language, isLoaded } = useLanguage();
  // クライアントでのレンダリングを保証するためのstate
  const [mounted, setMounted] = useState(false);

  // マウント時にstateを更新
  useEffect(() => {
    setMounted(true);
  }, []);

  const content = {
    ja: {
      title: '現地日本人から人気の食堂を簡単予約',
      description: '日本現地人が選んだ食堂のセレクトショップ！',
      buttonText: 'ホットな食堂を探す'
    },
    ko: {
      title: '현지 일본인이 추천하는 인기 맛집 바로 예약',
      description: '전화 예약만 가능한 고급인기 맛집도 저희에게 맡겨주세요!',
      buttonText: '핫 식당 찾기'
    }
  };

  // マウントされていない場合はローディング表示またはフォールバックを返す
  if (!mounted) {
    return (
      <div className="p-6 md:p-8 lg:p-10 bg-gradient-to-br from-primary to-secondary rounded-2xl mx-4 md:mx-6 lg:mx-8 my-6 md:my-8 text-white shadow-md md:max-w-3xl md:mx-auto lg:max-w-4xl xl:max-w-5xl">
        <div className="animate-pulse h-20"></div>
      </div>
    );
  }

  // データが読み込まれている場合は選択された言語のコンテンツを表示
  const currentContent = content[language];

  return (
    <div className="p-6 md:p-8 lg:p-10 bg-gradient-to-br from-primary to-secondary rounded-2xl mx-4 md:mx-6 lg:mx-8 my-6 md:my-8 text-white shadow-md md:max-w-3xl md:mx-auto lg:max-w-4xl xl:max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-6 md:mb-0 md:mr-8 md:flex-1">
          <div className="flex items-center mb-4">
            <span className="text-4xl md:text-5xl lg:text-6xl mr-3">🎧</span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">
              {currentContent.title}
            </h2>
          </div>
          <p className="text-base md:text-lg lg:text-xl opacity-90 mb-4 md:mb-6">{currentContent.description}</p>
        </div>
        
        <div className="md:flex-shrink-0 md:w-1/3">
          <Link href="/restaurants">
            <button className="w-full bg-white text-primary hover:bg-white/90 font-bold py-3 md:py-4 rounded-xl transform hover:scale-[1.02] transition-transform duration-200">
              {currentContent.buttonText}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}