'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyContent() {
  const [language, setLanguage] = useState<'ja' | 'ko'>('ja');

  // 言語に基づいてコンテンツを切り替える
  const content = {
    ja: {
      title: 'プライバシーポリシー',
      content: [
        {
          type: 'paragraph',
          text: '私たちIRUTOMOは、お客様の個人情報のプライバシーを保護し、適用される法令の下でのデータ保護原則および規定を遵守することを約束します。'
        },
        {
          type: 'paragraph',
          text: '私たちは、お客様が本ウェブサイト https://irutomops.studio.siteおよび/またはIRUTOMOアプリ（以下、総称して「IRUTOMOプラットフォーム」）を使用し、IRUTOMOまたは第三者の運営者（以下、「運営者」）が提供するサービス（以下、「サービス」）を利用する際に、お客様の情報を収集、処理、使用および開示することがあります。本プライバシーポリシーにおいて「お客様」とは、IRUTOMOプラットフォームにアクセスする、またはサービスを利用するすべての人を指します。'
        },
        {
          type: 'paragraph',
          text: 'このプライバシーポリシーは、IRUTOMOがIRUTOMOプラットフォームにアクセスし、またはサービスを利用する際にお客様から取得する情報を収集、処理、使用および開示する基本的な条件および条項を定めています。その情報には、名前、住所、電話番号、電子メールアドレス、旅行書類情報、車両レンタル情報、保険情報、年齢、生年月日など、特定の個人に関連する個人情報が含まれることがあります（以下、「個人情報」）。'
        },
        {
          type: 'paragraph',
          text: 'このプライバシーポリシーを注意深くお読みください。IRUTOMOプラットフォームを訪問することで、お客様はこのプライバシーポリシーに定められた個人情報の収集、処理、使用および開示に同意することになります。'
        },
        {
          type: 'heading',
          text: '条件の範囲'
        },
        {
          type: 'paragraph',
          text: 'IRUTOMOは、予告なしにこのプライバシーポリシーの条項またはその一部を更新、修正、変更する権利を留保します。お客様がIRUTOMOプラットフォームへのアクセスを継続し、またはサービスを利用することにより、更新、修正、変更されたプライバシーポリシーに同意したものとみなされます。ただし、変更が権利を減少させる場合は、同意を求める場合があります。'
        },
        {
          type: 'paragraph',
          text: 'このプライバシーポリシーのすべての条件および/またはその後の更新、修正、変更に同意しない場合は、直ちにIRUTOMOプラットフォームへのアクセスおよびサービスの利用を停止してください。'
        },
        {
          type: 'heading',
          text: '情報の収集'
        },
        {
          type: 'paragraph',
          text: '私たちは、IRUTOMOプラットフォームを使用する際に提供される個人情報や、ユーザーアカウント（以下、「ユーザーアカウント」）を開設する際、IRUTOMOプラットフォームを訪問する際、予約やレンタル、購入などを行う際に提供される情報を収集することがあります。個人情報の提供は常に任意です。しかし、個人情報を提供しない場合、一部のサービスを提供できないことがあります。例えば、ユーザーアカウントの開設や予約、レンタルの手続きができなくなります。'
        },
        {
          type: 'list',
          items: [
            'ユーザーアカウントの開設時（現在機能なし）：名前、メールアドレス、ユーザー名、パスワード、電話番号などの個人情報を収集します。',
            'IRUTOMOプラットフォームの訪問、予約、レンタル、購入などの利用時：対応するための情報（旅行書類情報、車両レンタル情報、保険情報、年齢、生年月日、ID番号、配送先住所など）を収集し、保存します。'
          ],
          ordered: true
        },
        {
          type: 'heading',
          text: '情報の保存'
        },
        {
          type: 'paragraph',
          text: '収集した個人情報およびその他のデータは、サーバーまたは第三者のサービスプロバイダーのサーバーに転送、処理、および保存されることがあります。個人情報は、必要な期間だけ保存され、法的要件に従って処理されます。不要になった場合は、データを削除または匿名化します。'
        },
        {
          type: 'heading',
          text: '情報の利用'
        },
        {
          type: 'paragraph',
          text: '私たちは、お客様の個人情報を契約履行およびサービス提供のために処理します。さらに、サービス改善やダイレクトマーケティングの目的で個人情報を処理することがあります。'
        },
        {
          type: 'heading',
          text: '情報の開示'
        },
        {
          type: 'paragraph',
          text: '以下の状況において、個人情報を第三者と共有および開示することがあります。'
        },
        {
          type: 'list',
          items: [
            '予約やレンタルの手続きを完了するために、運営者または第三者（旅行会社、レストラン、交通機関など）と共有します。',
            '法的要件に基づいて開示が必要な場合。',
            'IRUTOMOグループ内で共有する場合。',
            '顧問、エージェンシー、その他の関係者と共有する場合。'
          ],
          ordered: false
        },
        {
          type: 'heading',
          text: '保険'
        },
        {
          type: 'paragraph',
          text: '保険サービスにサインアップする際、別途契約に同意する必要があります。'
        },
        {
          type: 'heading',
          text: 'クッキー'
        },
        {
          type: 'paragraph',
          text: 'クッキーは、ウェブサイトの機能を向上させるために広く使用されています。IRUTOMOプラットフォームにアクセスする際に、クッキーを通じて個人情報が収集されることがあります。'
        },
        {
          type: 'heading',
          text: 'お客様の権利'
        },
        {
          type: 'paragraph',
          text: 'お客様は、IRUTOMOプラットフォームの「マイアカウント」から、個人情報へのアクセス、修正、削除をいつでも行うことができます。また、メールでリクエストを送信することもできます。gespokrofficial@gmail.com'
        },
        {
          type: 'heading',
          text: 'お問い合わせ'
        },
        {
          type: 'paragraph',
          text: 'このプライバシーポリシーに関するご質問は、メールでお問い合わせください。 gespokrofficial@gmail.com'
        },
        {
          type: 'paragraph',
          text: 'このポリシーは、指定された商取引に関する法律のガイドラインに準拠しています。'
        }
      ]
    },
    ko: {
      title: '개인정보 처리방침',
      content: [
        {
          type: 'paragraph',
          text: '저희 IRUTOMO는 고객님의 개인정보 보호를 약속하며, 관련 법령에 따른 데이터 보호 원칙 및 규정을 준수합니다.'
        },
        {
          type: 'paragraph',
          text: '저희는 고객님이 웹사이트 https://irutomops.studio.site 및/또는 IRUTOMO 앱(이하 "IRUTOMO 플랫폼")을 이용하고, IRUTOMO 또는 제3자 운영자(이하 "운영자")가 제공하는 서비스(이하 "서비스")를 이용할 때 고객님의 정보를 수집, 처리, 사용 및 공개할 수 있습니다. 본 개인정보 처리방침에서 "고객님"이란 IRUTOMO 플랫폼에 접속하거나 서비스를 이용하는 모든 사람을 지칭합니다.'
        },
        {
          type: 'paragraph',
          text: '이 개인정보 처리방침은 IRUTOMO가 IRUTOMO 플랫폼에 접속하거나 서비스를 이용할 때 고객님으로부터 얻은 정보를 수집, 처리, 사용 및 공개하는 기본적인 조건과 조항을 정하고 있습니다. 그 정보에는 이름, 주소, 전화번호, 이메일 주소, 여행 서류 정보, 차량 렌탈 정보, 보험 정보, 나이, 생년월일 등 특정 개인과 관련된 개인정보가 포함될 수 있습니다(이하 "개인정보").'
        },
        {
          type: 'paragraph',
          text: '이 개인정보 처리방침을 주의 깊게 읽어주세요. IRUTOMO 플랫폼을 방문함으로써, 고객님은 이 개인정보 처리방침에 명시된 개인정보의 수집, 처리, 사용 및 공개에 동의하게 됩니다.'
        },
        {
          type: 'heading',
          text: '조건의 범위'
        },
        {
          type: 'paragraph',
          text: 'IRUTOMO는 사전 통지 없이 이 개인정보 처리방침의 조항 또는 그 일부를 업데이트, 수정, 변경할 권리를 보유합니다. 고객님이 IRUTOMO 플랫폼에 계속 접속하거나 서비스를 이용함으로써, 업데이트, 수정, 변경된 개인정보 처리방침에 동의한 것으로 간주됩니다. 단, 변경이 권리를 감소시키는 경우에는 동의를 구할 수 있습니다.'
        },
        {
          type: 'paragraph',
          text: '이 개인정보 처리방침의 모든 조건 및/또는 그 후의 업데이트, 수정, 변경에 동의하지 않는 경우, 즉시 IRUTOMO 플랫폼 접속 및 서비스 이용을 중단해 주세요.'
        },
        {
          type: 'heading',
          text: '정보 수집'
        },
        {
          type: 'paragraph',
          text: '저희는 IRUTOMO 플랫폼을 사용할 때 제공되는 개인정보나, 사용자 계정(이하 "사용자 계정")을 개설할 때, IRUTOMO 플랫폼을 방문할 때, 예약이나 렌탈, 구매 등을 할 때 제공되는 정보를 수집할 수 있습니다. 개인정보 제공은 항상 자발적입니다. 그러나 개인정보를 제공하지 않을 경우, 일부 서비스를 제공할 수 없을 수 있습니다. 예를 들어, 사용자 계정 개설이나 예약, 렌탈 절차를 할 수 없게 됩니다.'
        },
        {
          type: 'list',
          items: [
            '사용자 계정 개설 시(현재 기능 없음): 이름, 이메일 주소, 사용자 이름, 비밀번호, 전화번호 등의 개인정보를 수집합니다.',
            'IRUTOMO 플랫폼 방문, 예약, 렌탈, 구매 등 이용 시: 대응하기 위한 정보(여행 서류 정보, 차량 렌탈 정보, 보험 정보, 나이, 생년월일, ID 번호, 배송지 주소 등)를 수집하고 저장합니다.'
          ],
          ordered: true
        },
        {
          type: 'heading',
          text: '정보 저장'
        },
        {
          type: 'paragraph',
          text: '수집한 개인정보 및 기타 데이터는 서버 또는 제3자 서비스 제공자의 서버에 전송, 처리 및 저장될 수 있습니다. 개인정보는 필요한 기간 동안만 저장되며, 법적 요건에 따라 처리됩니다. 불필요해진 경우 데이터를 삭제하거나 익명화합니다.'
        },
        {
          type: 'heading',
          text: '정보 사용'
        },
        {
          type: 'paragraph',
          text: '저희는 고객님의 개인정보를 계약 이행 및 서비스 제공을 위해 처리합니다. 또한, 서비스 개선이나 다이렉트 마케팅 목적으로 개인정보를 처리할 수 있습니다.'
        },
        {
          type: 'heading',
          text: '정보 공개'
        },
        {
          type: 'paragraph',
          text: '다음과 같은 상황에서 개인정보를 제3자와 공유 및 공개할 수 있습니다.'
        },
        {
          type: 'list',
          items: [
            '예약이나 렌탈 절차를 완료하기 위해 운영자 또는 제3자(여행사, 레스토랑, 교통기관 등)와 공유합니다.',
            '법적 요건에 따라 공개가 필요한 경우.',
            'IRUTOMO 그룹 내에서 공유하는 경우.',
            '고문, 에이전시, 기타 관계자와 공유하는 경우.'
          ],
          ordered: false
        },
        {
          type: 'heading',
          text: '보험'
        },
        {
          type: 'paragraph',
          text: '보험 서비스에 가입할 때 별도 계약에 동의해야 합니다.'
        },
        {
          type: 'heading',
          text: '쿠키'
        },
        {
          type: 'paragraph',
          text: '쿠키는 웹사이트 기능을 향상시키기 위해 널리 사용됩니다. IRUTOMO 플랫폼에 접속할 때 쿠키를 통해 개인정보가 수집될 수 있습니다.'
        },
        {
          type: 'heading',
          text: '고객님의 권리'
        },
        {
          type: 'paragraph',
          text: '고객님은 IRUTOMO 플랫폼의 "마이 계정"에서 개인정보 접근, 수정, 삭제를 언제든지 할 수 있습니다. 또한 이메일로 요청을 보낼 수도 있습니다. gespokrofficial@gmail.com'
        },
        {
          type: 'heading',
          text: '문의'
        },
        {
          type: 'paragraph',
          text: '이 개인정보 처리방침에 관한 질문은 이메일로 문의해 주세요. gespokrofficial@gmail.com'
        },
        {
          type: 'paragraph',
          text: '이 정책은 지정된 상거래에 관한 법률 가이드라인을 준수합니다.'
        }
      ]
    }
  };

  const currentContent = language === 'ja' ? content.ja : content.ko;

  return (
    <div className="max-w-md mx-auto bg-[#F8F8F8] min-h-screen pb-20">
      {/* ヘッダー */}
      <header className="flex items-center p-4 bg-white sticky top-0 z-50 shadow-sm">
        <Link href="/" className="mr-4">
          <ArrowLeft className="h-6 w-6 text-gray-600" />
        </Link>
        <h1 className="text-xl font-bold text-orange-500">{currentContent.title}</h1>
        <div className="ml-auto flex items-center">
          {/* 言語切り替えボタン */}
          <button 
            className={`language-button mr-2 ${language === 'ko' ? 'opacity-100 scale-110' : 'opacity-50'}`}
            onClick={() => setLanguage('ko')}
            aria-label="한국어로 전환"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', padding: '0.25rem' }}
          >
            <span className="text-xl">🇰🇷</span>
          </button>
          <button 
            className={`language-button ${language === 'ja' ? 'opacity-100 scale-110' : 'opacity-50'}`}
            onClick={() => setLanguage('ja')}
            aria-label="日本語に切り替え"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', padding: '0.25rem' }}
          >
            <span className="text-xl">🇯🇵</span>
          </button>
        </div>
      </header>

      <div className="p-4">
        <div className="card p-6 bg-white/50 rounded-lg shadow-sm">
          <div className="prose">
            <h2 className="text-xl font-bold mb-4">{currentContent.title}</h2>
            
            {currentContent.content.map((item, index) => {
              switch (item.type) {
                case 'paragraph':
                  return <p key={index} className="mb-4 text-gray-600">{item.text}</p>;
                case 'heading':
                  return <h3 key={index} className="text-lg font-bold mt-6 mb-2">{item.text}</h3>;
                case 'list':
                  if (item.ordered && item.items) {
                    return (
                      <ol key={index} className="list-decimal list-inside mb-4 ml-4">
                        {item.items.map((listItem, i) => (
                          <li key={i} className="mb-2 text-gray-600">{listItem}</li>
                        ))}
                      </ol>
                    );
                  } else if (item.items) {
                    return (
                      <ul key={index} className="list-disc list-inside mb-4 ml-4">
                        {item.items.map((listItem, i) => (
                          <li key={i} className="mb-2 text-gray-600">{listItem}</li>
                        ))}
                      </ul>
                    );
                  }
                  return null;
                default:
                  return null;
              }
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 