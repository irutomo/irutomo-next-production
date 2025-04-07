'use client';

import { useState } from 'react';
import { ArrowLeft, HelpCircle, AlertTriangle, Mail } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { useLanguage } from '@/contexts/language-context';

// 言語切り替えボタン用のスタイル
const languageButtonStyle = {
  active: {
    opacity: 1,
    transform: 'scale(1.2)',
  },
  inactive: {
    opacity: 0.5,
  }
};

// 言語データの定義
const translations = {
  ko: {
    pageTitle: 'FAQ',
    serviceDesc: '저희는 예약 대행 서비스만 제공하며, 식당과 제휴 관계가 없으므로 식당 측에서는 IRUTOMO의 예약 화면을 인식하지 못할 수 있습니다. 방문 시 식사하시는 분의 이름을 직접 알려주세요(예약 확인 이메일에 기재된 이름을 참고하세요. 예약 확인 이메일을 받지 못한 경우 예약者の 영어 이름을 알려주세요).',
    howToReserve: {
      title: '어떻게 예약하나요?',
      steps: [
        '아래 예약 버튼에서 가게 정보와 예약자 정보를 입력하고 결제를 완료해 주세요.',
        '방문일 최소 2일 전에 예약이 처리되며, 그때까지는 승인 대기 상태가 될 수 있습니다. (희망 시간대에 예약이 가능한 경우 즉시 확정 상태로 변경, 후보일/시간대 예약은 예약일 변경 후 확정, 예약 불가능한 경우 자동 취소 및 환불)',
        '가게에서 추가로 확인 사항이 있는 경우 이메일로 연락 드립니다. 반드시 유효한 이메일 주소를 입력해 주세요.'
      ]
    },
    reservationNotPossible: {
      title: '예약이 불가능한 경우도 있나요?',
      description: '다음의 경우 예약이 불가능합니다. 예약 불가가 확인된 경우 전액 환불해 드립니다. (이메일로 환불 상세 내용 확인 가능)',
      reasons: [
        '예약을 받지 않는 가게',
        '일본인이 전화나 시스템으로 예약 가능한 식당만 서비스를 이용하실 수 있습니다. 예약 취소 이유를 알고 싶으시면 gespokrofficial@gmail.com으로 문의해 주세요.'
      ]
    },
    cancellationPolicy: {
      title: '취소 정책',
      description: '예약 완료 전까지 취소 및 환불 신청이 가능합니다. 예약 완료 이메일 수신 후 취소는 불가능합니다.'
    },
    importantInfo: {
      title: '상세 정보',
      details: [
        '식사 비용은 전액 지불해 주세요. 여기서 지불하신 비용은 IRUTOMO에 지불하는 수수료이며, 식당의 예약 보증금이 아닙니다.',
        '인원수에 맞게 예약해 주세요! 인원수가 적절하게 선택되지 않은 경우, 사전 통지 없이 예약이 자동 취소될 수 있습니다.',
        '예약 시간을 엄수해 주세요. 1분이라도 늦으면 예약이 자동 취소될 수 있습니다.'
      ]
    },
    contact: {
      title: '문의하기',
      email: 'gesopokrofficial@gmail.com'
    }
  },
  ja: {
    pageTitle: 'FAQ',
    serviceDesc: '私たちは予約代行サービスのみ提供しており、食堂とは提携関係にありませんので、食堂側はIRUTOMOの予約画面を認識することができない場合があります。訪れる際には、お食事をされる方のお名前を直接お伝えください（予約確認メールに記載されている名前を参考にしてください。予約確認メールを受け取っていない場合は、予約者の英語のお名前をお知らせください）。',
    howToReserve: {
      title: 'どうやって予約するの？',
      steps: [
        '下の予約ボタンからお店の情報と予約者情報を入力し決済を完了してください。',
        '訪問日の最低2日前には予約が処理され、それまでは承認待ちの状態となることがあります。(希望の時間帯に予約が可能な場合はすぐに確定状態に変更、候補日/時間帯の予約は予約日変更後に確定、予約不可の場合は自動キャンセル及び払い戻し)',
        'お店から追加で確認事項がある場合はメールでご連絡いたします。必ず有効なメールアドレスをご入力ください。'
      ]
    },
    reservationNotPossible: {
      title: '予約ができない場合もあるの？',
      description: '次の場合は予約ができません。予約不可が確認された場合は全額ご返金致します。(メールにて払い戻しの詳細を確認可能)',
      reasons: [
        '予約を受け付けていないお店',
        '日本人が電話やシステムでの予約可能な食堂のみサービスをご利用いただけます。予約のキャンセル理由を知りたい場合は、gespokrofficial@gmail.com までお問い合わせください。'
      ]
    },
    cancellationPolicy: {
      title: 'キャンセルポリシー',
      description: '予約完了の前まで、キャンセル及び払い戻しの申請が可能です。予約完了メール受け取り後のキャンセルは不可です。'
    },
    importantInfo: {
      title: '詳細情報',
      details: [
        'お食事代は全額お支払いください。ここでお支払いいただいた費用はIRUTOMOに支払いいただく手数料であり、食堂の予約保証金ではありません。',
        '人数に合わせて予約してください！人数が適切に選択されない場合、事前通知なしに予約は自動キャンセルされます。',
        '予約時間を厳守してください。1分でも遅れると予約が自動キャンセルとなる場合があります。'
      ]
    },
    contact: {
      title: 'お問い合わせ',
      email: 'gesopokrofficial@gmail.com'
    }
  }
};

export default function FaqContent() {
  // 言語コンテキストから言語設定を取得
  const { language, setLanguage } = useLanguage();
  
  // 言語切り替え関数
  const toggleLanguage = () => {
    setLanguage(language === 'ko' ? 'ja' : 'ko');
  };
  
  // 現在の言語のテキストを取得
  const t = translations[language];

  return (
    <main className="max-w-md mx-auto bg-[#F8F8F8] min-h-screen pb-20">
      {/* ヘッダー */}
      <header className="flex items-center p-4 bg-white sticky top-0 z-50 shadow-custom">
        <Link href="/" className="mr-4">
          <ArrowLeft className="h-6 w-6 text-gray-600" />
        </Link>
        <h1 className="text-xl font-bold text-[#FFA500]">{t.pageTitle}</h1>
        <div className="ml-auto flex items-center">
          {/* 言語切り替えボタン */}
          <button 
            onClick={() => setLanguage('ko')} 
            className={`language-button mr-2 ${language === 'ko' ? 'active' : ''}`}
            aria-label="한국어로 전환"
            style={language === 'ko' ? languageButtonStyle.active : languageButtonStyle.inactive}
          >
            <span className="text-xl">🇰🇷</span>
          </button>
          <button 
            onClick={() => setLanguage('ja')} 
            className={`language-button ${language === 'ja' ? 'active' : ''}`}
            aria-label="日本語に切り替え"
            style={language === 'ja' ? languageButtonStyle.active : languageButtonStyle.inactive}
          >
            <span className="text-xl">🇯🇵</span>
          </button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* サービス説明 */}
        <Card className="p-4 bg-white/50">
          <p className="text-sm leading-relaxed text-text font-medium">
            {t.serviceDesc}
          </p>
        </Card>

        {/* 予約方法 */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="h-5 w-5 text-[#00CBB3]" />
            <h2 className="font-bold text-text text-base">{t.howToReserve.title}</h2>
          </div>
          <Card className="p-4 bg-white/50">
            <ol className="list-none space-y-3">
              {t.howToReserve.steps.map((step, index) => (
                <li key={index} className="flex gap-2">
                  <span className="text-[#00CBB3] font-bold">{index === 0 ? "1️⃣" : index === 1 ? "2️⃣" : "3️⃣"}</span>
                  <p className="text-sm text-text">{step}</p>
                </li>
              ))}
            </ol>
          </Card>
        </section>

        {/* 予約不可の場合 */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="h-5 w-5 text-[#00CBB3]" />
            <h2 className="font-bold text-text text-base">{t.reservationNotPossible.title}</h2>
          </div>
          <Card className="p-4 bg-white/50">
            <p className="text-sm mb-3 text-text font-medium">{t.reservationNotPossible.description}</p>
            <ol className="list-none space-y-3">
              {t.reservationNotPossible.reasons.map((reason, index) => (
                <li key={index} className="flex gap-2">
                  <span className="text-[#00CBB3] font-bold">{index === 0 ? "1️⃣" : "2️⃣"}</span>
                  <p className="text-sm text-text">{reason}</p>
                </li>
              ))}
            </ol>
          </Card>
        </section>

        {/* キャンセルポリシー */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-[#FFA500]" />
            <h2 className="font-bold text-text text-base">{t.cancellationPolicy.title}</h2>
          </div>
          <Card className="p-4 bg-white/50 border-2 border-[#FFA500]">
            <p className="text-sm text-text font-medium">
              {t.cancellationPolicy.description}
            </p>
          </Card>
        </section>

        {/* 重要情報 */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-[#FFA500]" />
            <h2 className="font-bold text-text text-base">{t.importantInfo.title}</h2>
          </div>
          <Card className="p-4 bg-white/50 space-y-4">
            {t.importantInfo.details.map((detail, index) => (
              <p key={index} className="text-sm text-text font-medium">{detail}</p>
            ))}
          </Card>
        </section>

        {/* お問い合わせ */}
        <section>
          <Card className="p-4 bg-white/50 border-2 border-[#00CBB3]">
            <div className="flex items-center gap-3">
              <Mail className="h-6 w-6 text-[#00CBB3]" />
              <div>
                <h3 className="font-bold mb-1 text-text text-base">{t.contact.title}</h3>
                <p className="text-sm text-[#00CBB3] font-medium">{t.contact.email}</p>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}