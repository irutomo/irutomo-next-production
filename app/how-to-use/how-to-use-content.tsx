'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function HowToUseContent() {
  const [language, setLanguage] = useState<'ja' | 'ko'>('ja');

  // 言語に基づいてコンテンツを切り替える
  const content = {
    ja: {
      title: '予約方法',
      about: {
        title: 'IRUTOMOとは？',
        description: [
          'IRUTOMOは韓国人のための日本旅行サービスです。食堂予約サービスは日本語が分からなくても、日本の電話番号がなくても、簡単に日本現地人から人気のある日本のレストランを予約することができます。',
          '"日本の友達（일본친구）"という意味のIRUTOMOは、あなたの日本旅行でより日本のリアルを感じる体験を提供しています。食堂予約だけではなく、日本の友達ガイドに日本の日常を案内してもらえるガイドサービスも提供しています。',
          '主なサービス地域は大阪、京都、奈良、神戸など関西地域を中心に運営されており、徐々に東京などの他の地域にも拡大する予定です。'
        ]
      },
      howToUse: {
        title: 'サービス利用方法',
        steps: [
          {
            number: '01',
            icon: '🏯',
            title: 'レストラン選択',
            description: '地域、料理の種類などで希望のレストランを検索して選択してください。'
          },
          {
            number: '02',
            icon: '📝',
            title: '予約情報入力',
            description: '日付、時間、人数など必要な情報を入力してください。'
          },
          {
            number: '03',
            icon: '💴',
            title: '手数料のお支払い',
            description: '予約手数料￥1,000をお支払いください。この金額はレストランの利用料金とは別です。'
          },
          {
            number: '04',
            icon: '📱',
            title: '予約確定',
            description: '当社の担当者がレストランに直接連絡し、予約を確定します。確定後、メールでお知らせします。'
          }
        ]
      }
    },
    ko: {
      title: '예약 방법',
      about: {
        title: 'IRUTOMO란?',
        description: [
          'IRUTOMO는 한국인을 위한 일본 여행 서비스입니다. 식당 예약 서비스는 일본어를 몰라도, 일본 전화번호가 없어도 간단히 일본 현지인에게 인기 있는 일본 레스토랑을 예약할 수 있습니다.',
          '"일본 친구"라는 의미의 IRUTOMO는 당신의 일본 여행에서 더 일본의 실제를 느낄 수 있는 경험을 제공합니다. 식당 예약뿐만 아니라 일본 친구 가이드에게 일본의 일상을 안내받을 수 있는 가이드 서비스도 제공합니다.',
          '주요 서비스 지역은 오사카, 교토, 나라, 고베 등 간사이 지역을 중심으로 운영되고 있으며, 점차 도쿄 등 다른 지역으로도 확대될 예정입니다.'
        ]
      },
      howToUse: {
        title: '서비스 이용 방법',
        steps: [
          {
            number: '01',
            icon: '🏯',
            title: '레스토랑 선택',
            description: '지역, 요리 종류 등으로 원하는 레스토랑을 검색하여 선택하세요.'
          },
          {
            number: '02',
            icon: '📝',
            title: '예약 정보 입력',
            description: '날짜, 시간, 인원 수 등 필요한 정보를 입력하세요.'
          },
          {
            number: '03',
            icon: '💴',
            title: '수수료 결제',
            description: '예약 수수료 ¥1,000을 결제하세요. 이 금액은 레스토랑 이용 요금과는 별도입니다.'
          },
          {
            number: '04',
            icon: '📱',
            title: '예약 확정',
            description: '저희 담당자가 레스토랑에 직접 연락하여 예약을 확정합니다. 확정 후, 이메일로 알려드립니다.'
          }
        ]
      }
    }
  };

  const currentContent = language === 'ja' ? content.ja : content.ko;

  return (
    <main className="max-w-md mx-auto bg-[#F8F8F8] min-h-screen pb-20">
      {/* ヘッダー */}
      <header className="flex items-center p-4 bg-white sticky top-0 z-50 shadow-sm">
        <Link href="/" className="mr-4">
          <ArrowLeft className="h-6 w-6 text-gray-600" />
        </Link>
        <h1 className="text-xl font-bold text-orange-500">{currentContent.title}</h1>
        <div className="ml-auto flex items-center">
          {/* 言語切り替えボタン */}
          <button 
            className={`transition-all duration-200 bg-none border-none cursor-pointer text-xl mr-2 ${language === 'ko' ? 'opacity-100 scale-110' : 'opacity-50'}`}
            onClick={() => setLanguage('ko')}
            aria-label="한국어로 전환"
          >
            <span className="text-xl">🇰🇷</span>
          </button>
          <button 
            className={`transition-all duration-200 bg-none border-none cursor-pointer text-xl ${language === 'ja' ? 'opacity-100 scale-110' : 'opacity-50'}`}
            onClick={() => setLanguage('ja')}
            aria-label="日本語に切り替え"
          >
            <span className="text-xl">🇯🇵</span>
          </button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* About IRUTOMO */}
        <div className="rounded-3xl overflow-hidden p-6 bg-purple-500 text-white">
          <h2 className="text-xl font-bold mb-4">{currentContent.about.title}</h2>
          <div className="space-y-4 text-sm leading-relaxed">
            {currentContent.about.description.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* How to Use */}
        <section>
          <h2 className="text-xl font-bold mb-4">{currentContent.howToUse.title}</h2>
          <div className="space-y-4">
            {currentContent.howToUse.steps.map((step, index) => (
              <div key={index} className="rounded-3xl p-4 bg-white/50">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {step.number}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{step.icon}</span>
                      <h3 className="font-bold">{step.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
} 