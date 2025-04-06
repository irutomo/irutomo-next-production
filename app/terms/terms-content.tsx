'use client';

import { BackHeader } from '@/components/ui/header';
import { useLanguage } from '@/contexts/language-context';

export default function TermsContent() {
  const { language } = useLanguage();

  // 言語に基づいてコンテンツを切り替える
  const content = {
    ja: {
      title: '特定商取引法に基づく表記',
      sections: [
        {
          label: '販売業者:',
          value: 'IRUTOMO'
        },
        {
          label: '代表者:',
          value: '專齊夏暉'
        },
        {
          label: '所在地/住所:',
          value: '大阪府吹田市江坂町２丁目１−６４'
        },
        {
          label: 'カスタマーセンター番号:',
          value: '050-7121-1998'
        },
        {
          label: 'カスタマーセンター受付時間:',
          value: '10:00~19:00'
        },
        {
          label: 'メールアドレス:',
          value: 'gespokrofficial@gmail.com'
        },
        {
          label: 'ホームページURL:',
          value: 'https://irutomops.studio.site'
        },
        {
          label: '支払方法:',
          value: 'クレジットカード'
        },
        {
          label: '支払時期/期限:',
          value: '',
          list: [
            'クレジットカード: 即時',
            'コンビニエンスストア: 注文後7日以内'
          ]
        },
        {
          label: '引き渡し時期:',
          value: '予約日にサービスを提供します。'
        }
      ],
      note: '購入時、予約確定後にメールとマイページを通じて予約内容およびバウチャー（該当する場合）を確認できます。'
    },
    ko: {
      title: '특정상거래법에 따른 표기',
      sections: [
        {
          label: '판매업자:',
          value: 'IRUTOMO'
        },
        {
          label: '대표자:',
          value: '專齊夏暉'
        },
        {
          label: '소재지/주소:',
          value: '오사카부 스이타시 에사카마치 2초메 1-64'
        },
        {
          label: '고객센터 번호:',
          value: '050-7121-1998'
        },
        {
          label: '고객센터 접수시간:',
          value: '10:00~19:00'
        },
        {
          label: '이메일 주소:',
          value: 'gespokrofficial@gmail.com'
        },
        {
          label: '홈페이지 URL:',
          value: 'https://irutomops.studio.site'
        },
        {
          label: '지불방법:',
          value: '신용카드'
        },
        {
          label: '지불시기/기한:',
          value: '',
          list: [
            '신용카드: 즉시',
            '편의점: 주문 후 7일 이내'
          ]
        },
        {
          label: '제공시기:',
          value: '예약일에 서비스를 제공합니다.'
        }
      ],
      note: '구매 시, 예약 확정 후 이메일과 마이페이지를 통해 예약 내용 및 바우처(해당하는 경우)를 확인할 수 있습니다.'
    }
  };

  const currentContent = language === 'ja' ? content.ja : content.ko;

  return (
    <main className="max-w-md mx-auto pb-20">
      {/* 共通ヘッダーコンポーネントを使用 */}
      <BackHeader title={currentContent.title} backUrl="/" />

      <div className="p-4">
        <div className="bg-white/50 rounded-lg p-6 shadow-sm">
          <div className="max-w-none">
            <h2 className="text-xl font-bold mb-4">{currentContent.title}</h2>
            
            <div className="space-y-4">
              {currentContent.sections.map((section, index) => (
                <div key={index}>
                  <p className="font-bold">{section.label}</p>
                  {section.value && <p>{section.value}</p>}
                  {section.list && (
                    <ul className="list-disc list-inside ml-4">
                      {section.list.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
              
              <div className="mt-4">
                <p>{currentContent.note}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 