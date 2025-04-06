'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, HelpCircle, AlertTriangle, Mail } from 'lucide-react';

export default function FaqContent() {
  const [language, setLanguage] = useState<'ja' | 'ko'>('ja');

  // 言語に基づいてコンテンツを切り替える
  const content = {
    ja: {
      title: 'よくある質問',
      serviceDescription: '私たちは予約代行サービスのみ提供しており、食堂とは提携関係にありませんので、食堂側はIRUTOMOの予約画面を認識することができない場合があります。訪れる際には、お食事をされる方のお名前を直接お伝えください（予約確認メールに記載されている名前を参考にしてください。予約確認メールを受け取っていない場合は、予約者の英語のお名前をお知らせください）。',
      
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
    },
    ko: {
      title: '자주 묻는 질문',
      serviceDescription: '저희는 예약 대행 서비스만 제공하고 있으며, 식당과는 제휴 관계가 없으므로 식당측에서 IRUTOMO의 예약 화면을 인식하지 못할 수 있습니다. 방문 시에는 식사를 하시는 분의 이름을 직접 말씀해 주세요(예약 확인 이메일에 기재된 이름을 참고해 주세요. 예약 확인 이메일을 받지 못한 경우에는 예약자의 영어 이름을 알려주세요).',
      
      howToReserve: {
        title: '어떻게 예약하나요?',
        steps: [
          '아래 예약 버튼에서 식당 정보와 예약자 정보를 입력하고 결제를 완료해 주세요.',
          '방문일 최소 2일 전에 예약이 처리되며, 그때까지는 승인 대기 상태가 될 수 있습니다. (원하는 시간대에 예약이 가능한 경우 즉시 확정 상태로 변경, 후보일/시간대 예약은 예약일 변경 후 확정, 예약 불가능한 경우 자동 취소 및 환불)',
          '식당에서 추가로 확인할 사항이 있는 경우 이메일로 연락 드립니다. 반드시 유효한 이메일 주소를 입력해 주세요.'
        ]
      },
      
      reservationNotPossible: {
        title: '예약이 불가능한 경우도 있나요?',
        description: '다음의 경우 예약이 불가능합니다. 예약 불가가 확인된 경우 전액 환불해 드립니다. (이메일로 환불 상세 내용 확인 가능)',
        reasons: [
          '예약을 받지 않는 식당',
          '일본인이 전화나 시스템으로 예약 가능한 식당만 서비스를 이용하실 수 있습니다. 예약 취소 이유를 알고 싶은 경우, gespokrofficial@gmail.com으로 문의해 주세요.'
        ]
      },
      
      cancellationPolicy: {
        title: '취소 정책',
        description: '예약 완료 전까지 취소 및 환불 신청이 가능합니다. 예약 완료 이메일 수신 후 취소는 불가능합니다.'
      },
      
      importantInfo: {
        title: '상세 정보',
        details: [
          '식사비는 전액 지불해 주세요. 여기서 지불하신 비용은 IRUTOMO에 지불하는 수수료이며, 식당의 예약 보증금이 아닙니다.',
          '인원수에 맞춰 예약해 주세요! 인원수가 적절하게 선택되지 않은 경우, 사전 통지 없이 예약은 자동 취소됩니다.',
          '예약 시간을 엄수해 주세요. 1분이라도 늦으면 예약이 자동 취소될 수 있습니다.'
        ]
      },
      
      contact: {
        title: '문의하기',
        email: 'gesopokrofficial@gmail.com'
      }
    }
  };

  const currentContent = language === 'ja' ? content.ja : content.ko;

  return (
    <div className="max-w-[430px] mx-auto bg-[#F8F8F8] min-h-screen pb-20">
      {/* ヘッダー */}
      <header className="flex items-center p-4 bg-white sticky top-0 z-50 shadow-sm">
        <Link href="/" className="text-gray-600 mr-4">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-bold text-orange-500">{currentContent.title}</h1>
        <div className="ml-auto flex items-center">
          {/* 言語切り替えボタン */}
          <button 
            className={`bg-transparent border-none cursor-pointer text-xl p-1 ml-2 ${language === 'ko' ? 'opacity-100 scale-110' : 'opacity-50'}`}
            onClick={() => setLanguage('ko')}
            aria-label="한국어로 전환"
          >
            <span>🇰🇷</span>
          </button>
          <button 
            className={`bg-transparent border-none cursor-pointer text-xl p-1 ${language === 'ja' ? 'opacity-100 scale-110' : 'opacity-50'}`}
            onClick={() => setLanguage('ja')}
            aria-label="日本語に切り替え"
          >
            <span>🇯🇵</span>
          </button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* サービス説明 */}
        <div className="bg-white/50 rounded-lg p-4 shadow-sm">
          <p className="text-sm">{currentContent.serviceDescription}</p>
        </div>

        {/* 予約方法 */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="w-5 h-5 text-teal-500" />
            <h2 className="font-bold">{currentContent.howToReserve.title}</h2>
          </div>
          <div className="bg-white/50 rounded-lg p-4 shadow-sm">
            <ol className="list-none p-0 m-0 flex flex-col gap-3">
              {currentContent.howToReserve.steps.map((step, index) => (
                <li key={index} className="flex gap-2 items-start">
                  <span className="text-teal-500">{index + 1}️⃣</span>
                  <p className="text-sm">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 予約不可の場合 */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="w-5 h-5 text-teal-500" />
            <h2 className="font-bold">{currentContent.reservationNotPossible.title}</h2>
          </div>
          <div className="bg-white/50 rounded-lg p-4 shadow-sm">
            <p className="text-sm mb-3">{currentContent.reservationNotPossible.description}</p>
            <ol className="list-none p-0 m-0 flex flex-col gap-3">
              {currentContent.reservationNotPossible.reasons.map((reason, index) => (
                <li key={index} className="flex gap-2 items-start">
                  <span className="text-teal-500">{index + 1}️⃣</span>
                  <p className="text-sm">{reason}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* キャンセルポリシー */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h2 className="font-bold">{currentContent.cancellationPolicy.title}</h2>
          </div>
          <div className="bg-white/50 rounded-lg p-4 shadow-sm border-2 border-orange-500">
            <p className="text-sm">{currentContent.cancellationPolicy.description}</p>
          </div>
        </section>

        {/* 重要情報 */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h2 className="font-bold">{currentContent.importantInfo.title}</h2>
          </div>
          <div className="bg-white/50 rounded-lg p-4 shadow-sm space-y-4">
            {currentContent.importantInfo.details.map((detail, index) => (
              <p key={index} className="text-sm">{detail}</p>
            ))}
          </div>
        </section>

        {/* お問い合わせ */}
        <section className="mb-6">
          <div className="bg-white/50 rounded-lg p-4 shadow-sm border-2 border-teal-500">
            <div className="flex items-center gap-3">
              <Mail className="w-6 h-6 text-teal-500" />
              <div>
                <h3 className="font-bold mb-1">{currentContent.contact.title}</h3>
                <p className="text-sm text-teal-500">{currentContent.contact.email}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
} 