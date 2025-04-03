import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Users, MapPin, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: '予約確認 | IRUTOMO - 日本の飲食店予約サービス',
  description: 'IRUTOMOでの予約が完了しました。予約の詳細をご確認ください。',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function ReservationConfirmationPage() {
  // 実際のアプリケーションでは、データベースから予約情報を取得する
  const reservationData = {
    id: 'RSV123456',
    restaurantId: '1',
    restaurantName: '熟成肉と本格炭火焼肉 又三郎',
    date: '2023-12-20',
    time: '19:00',
    people: 4,
    course: 'スタンダードコース - 4,000円',
    seatType: 'テーブル席',
    name: '山田 太郎',
    email: 'yamada@example.com',
    phone: '090-1234-5678',
    notes: 'アレルギーなし',
    status: 'confirmed', // confirmed, pending, cancelled
    createdAt: '2023-12-10 15:30:45',
  };

  // 日付をフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];
    return `${year}年${month}月${day}日（${weekday}）`;
  };

  return (
    <div className="py-8">
      <div className="container max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <Link 
            href="/"
            className="text-primary-500 hover:text-primary-700 flex items-center text-sm"
          >
            <ArrowLeft size={16} className="mr-1" />
            ホームに戻る
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h1 className="text-2xl font-bold">予約確認</h1>
            <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full font-medium text-sm flex items-center">
              <CheckCircle size={16} className="mr-1" />
              予約完了
            </div>
          </div>
          
          <div className="p-6">
            <div className="mb-12 text-center">
              <h2 className="text-xl font-bold mb-2">ご予約ありがとうございます</h2>
              <p className="text-gray-600">
                予約ID: <span className="font-medium">{reservationData.id}</span>
              </p>
              <p className="text-gray-600 mt-1">
                予約確認メールを {reservationData.email} に送信しました
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h3 className="text-lg font-bold mb-4">予約内容</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin size={20} className="text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium">{reservationData.restaurantName}</p>
                    <Link href={`/restaurants/${reservationData.restaurantId}`} className="text-sm text-primary-500 hover:underline">
                      店舗詳細を見る
                    </Link>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Calendar size={20} className="text-gray-400 mr-3" />
                  <p>{formatDate(reservationData.date)}</p>
                </div>
                
                <div className="flex items-center">
                  <Clock size={20} className="text-gray-400 mr-3" />
                  <p>{reservationData.time}</p>
                </div>
                
                <div className="flex items-center">
                  <Users size={20} className="text-gray-400 mr-3" />
                  <p>{reservationData.people}名様</p>
                </div>
                
                {reservationData.course && (
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-gray-400 mr-3 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    <p>{reservationData.course}</p>
                  </div>
                )}
                
                {reservationData.seatType && (
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-gray-400 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 5h14a2 2 0 012 2v3a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 12h16l-3 8H7l-3-8z"
                      />
                    </svg>
                    <p>{reservationData.seatType}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h3 className="text-lg font-bold mb-4">予約者情報</h3>
              
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-gray-600">お名前</div>
                  <div className="col-span-2 font-medium">{reservationData.name}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-gray-600">メールアドレス</div>
                  <div className="col-span-2">{reservationData.email}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-gray-600">電話番号</div>
                  <div className="col-span-2">{reservationData.phone}</div>
                </div>
                
                {reservationData.notes && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-gray-600">その他リクエスト</div>
                    <div className="col-span-2">{reservationData.notes}</div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h3 className="text-lg font-bold mb-4">お支払い</h3>
              
              <p className="text-gray-600 mb-4">
                お支払いは店舗でのお会計時にお願いいたします。
              </p>
              
              <div className="border-t border-gray-200 pt-4 flex justify-between">
                <span className="font-medium">合計（目安）</span>
                <span className="font-bold">¥16,000</span>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-6 rounded-lg mb-8">
              <h3 className="text-lg font-bold mb-4 flex items-center text-yellow-700">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                キャンセルについて
              </h3>
              
              <ul className="list-disc list-inside space-y-1 text-yellow-700">
                <li>キャンセルは予約時間の3時間前までにお願いします。</li>
                <li>予約時間に遅れる場合は、お店に直接ご連絡ください。</li>
                <li>ご予約時間を15分以上過ぎても連絡なくご来店されない場合、キャンセル扱いとなる場合があります。</li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/reservation/cancel?id=${reservationData.id}`}
                className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-center"
              >
                予約をキャンセルする
              </Link>
              
              <Link
                href={`/reservation/edit?id=${reservationData.id}`}
                className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-md text-center"
              >
                予約内容を変更する
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}