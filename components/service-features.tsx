'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/language-context';

export function ServiceFeatures() {
  const { language } = useLanguage();
  
  const content = {
    ja: {
      title: 'IRUTOMOを使う理由',
      features: [
        {
          icon: '🌏',
          title: '日本の電話番号なしで予約',
          description: '韓国の電話番号だけで日本MZ世代から人気のあるレストランを予約可能',
          color: 'primary',
        },
        {
          icon: '🍔',
          title: '外国人が普段は予約できない食堂も掲載',
          description: 'IRUTOMOがあなたのリアルな現地体験をサポート',
          color: 'secondary',
        },
        {
          icon: '⏱️',
          title: '迅速な予約確定',
          description: '平均2時間以内に予約を確定いたします。予約不可時も100％返金',
          color: 'primary',
        },
        {
          icon: '💰',
          title: '高級食堂も代行手数料￥1,000',
          description: 'IRUTOMOはただの予約代行ではありません、日本現地人とのチャットサポートが利用可能！',
          color: 'secondary',
        }
      ]
    },
    ko: {
      title: 'IRUTOMO를 사용하는 이유',
      features: [
        {
          icon: '🌏',
          title: '일본 전화번호 없이도 예약 가능',
          description: '한국 전화번호만으로 일본 MZ세대에게 인기있는 레스토랑 예약 가능',
          color: 'primary',
        },
        {
          icon: '🍔',
          title: '외국인이 평소에 예약하기 어려운 식당도 게재',
          description: 'IRUTOMO가 당신의 현지 체험을 지원합니다',
          color: 'secondary',
        },
        {
          icon: '⏱️',
          title: '신속한 예약 확정',
          description: '평균 2시간 이내에 예약을 확정해 드립니다. 예약 불가 시 100% 환불',
          color: 'primary',
        },
        {
          icon: '💰',
          title: '고급 식당도 대행 수수료 ￥1,000',
          description: 'IRUTOMO는 단순한 예약 대행이 아닙니다. 일본 현지인과의 채팅 지원도 이용 가능!',
          color: 'secondary',
        }
      ]
    }
  };

  const features = content[language].features;

  return (
    <section className="px-4 space-y-4 mb-8">
      <h2 className="text-lg font-bold flex items-center mb-4 text-text">
        <span className="text-xl mr-2">✨</span>
        {content[language].title}
      </h2>
      
      {features.map((feature, index) => (
        <div 
          key={index}
          className={`p-4 border-2 ${
            feature.color === 'primary' ? 'border-primary bg-white' : 'border-secondary bg-white'
          } rounded-lg transform hover:scale-[1.02] transition-transform duration-200`}
        >
          <div className="flex items-center gap-4">
            <div className="text-3xl flex items-center justify-center w-10 h-10">{feature.icon}</div>
            <div>
              <h3 className="font-bold mb-1 text-text">{feature.title}</h3>
              <p className="text-sm text-text/80">{feature.description}</p>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}