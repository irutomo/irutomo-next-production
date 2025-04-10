'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/language-context';

export function CtaBanner() {
  const { language } = useLanguage();
  
  const content = {
    ja: {
      title: '今すぐ日本のリアルを体験しよう！',
      description: '掲載店舗以外もリクエスト可能！',
      buttonText: 'リクエストする'
    },
    ko: {
      title: '지금 바로 일본의 진짜 모습을 경험하세요!',
      description: '게재된 가게 외에도 요청 가능!',
      buttonText: '요청하기'
    }
  };
  
  return (
    <section className="px-4 mb-8">
      <div className="p-6 bg-gradient-to-br from-primary to-secondary text-white shadow-md rounded-lg">
        <h2 className="text-xl font-bold mb-3">{content[language].title}</h2>
        <p className="text-sm mb-4">{content[language].description}</p>
        <Link href="/request">
          <button className="w-full bg-white text-primary hover:bg-white/90 font-bold py-3 rounded-xl transform hover:scale-[1.02] transition-transform duration-200">
            {content[language].buttonText}
          </button>
        </Link>
      </div>
    </section>
  );
}