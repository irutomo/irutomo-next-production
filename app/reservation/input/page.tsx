import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock, Calendar, Users, MapPin, Utensils } from 'lucide-react';
import PlanSelector from './plan-selector';
import PaymentWrapper from './payment-wrapper';

export const metadata: Metadata = {
  title: '予約情報入力 | IRUTOMO - 日本の飲食店予約サービス',
  description: 'IRUTOMOで簡単に飲食店を予約できます。予約内容を入力して、すぐに予約を確定させましょう。',
};

export default async function ReservationInputPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const restaurantId = searchParams?.restaurant_id as string | undefined;
  const date = searchParams?.date as string | undefined;
  const time = searchParams?.time as string | undefined;
  const people = searchParams?.people as string | undefined;

  // Note: 実際の実装では、ここでレストラン情報をデータベースから取得します
  const restaurantName = restaurantId ? 
    restaurantId === '1' ? '熟成肉と本格炭火焼肉 又三郎' : 
    restaurantId === '2' ? 'まほろば囲炉裏 心斎橋' : 
    restaurantId === '3' ? '焼鳥YAMATO' : '指定なし' : '指定なし';

  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className="container max-w-3xl mx-auto px-4">
        <div className="mb-6">
          <Link 
            href={`/reservation?restaurant=${restaurantId}`}
            className="inline-flex items-center text-primary-600 hover:text-primary-800 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            予約情報入力に戻る
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-6">予約詳細入力</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-bold">予約情報の確認</h2>
          </div>
          
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* レストラン情報 */}
              <div className="space-y-1">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gray-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">レストラン</p>
                    <p className="font-medium">{restaurantName}</p>
                  </div>
                </div>
              </div>
              
              {/* 日付 */}
              <div className="space-y-1">
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">予約日</p>
                    <p className="font-medium">{date || '指定なし'}</p>
                  </div>
                </div>
              </div>
              
              {/* 時間 */}
              <div className="space-y-1">
                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-gray-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">予約時間</p>
                    <p className="font-medium">{time || '指定なし'}</p>
                  </div>
                </div>
              </div>
              
              {/* 人数 */}
              <div className="space-y-1">
                <div className="flex items-start">
                  <Users className="w-5 h-5 text-gray-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">人数</p>
                    <p className="font-medium">{people ? `${people}人` : '指定なし'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 予約プラン選択 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-bold">予約プランの選択</h2>
          </div>
          
          <div className="p-6">
            <PlanSelector />
          </div>
        </div>
        
        {/* 予約者情報入力フォーム */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-bold">予約者情報</h2>
            <p className="text-sm text-gray-500 mt-1">お客様の情報を入力してください</p>
          </div>
          
          <PaymentWrapper>
            {({showPaymentModal}) => (
              <form 
                onSubmit={(e) => {
                  const planInput = document.getElementById('plan') as HTMLInputElement;
                  const amountInput = document.getElementById('plan_amount') as HTMLInputElement;
                  
                  // プレミアム予約が選択されていて、かつ支払いが完了していない場合
                  if (planInput?.value === 'premium' && Number(amountInput?.value) > 0) {
                    e.preventDefault();
                    showPaymentModal();
                  }
                }}
                action="/reservation/confirmation" 
                className="p-6 space-y-6"
              >
                {/* 隠しフィールド - 予約情報の保持 */}
                <input type="hidden" name="restaurant_id" value={restaurantId || ''} />
                <input type="hidden" name="date" value={date || ''} />
                <input type="hidden" name="time" value={time || ''} />
                <input type="hidden" name="people" value={people || ''} />
                <input type="hidden" id="plan" name="plan" value="standard" />
                <input type="hidden" id="plan_amount" name="plan_amount" value="0" />
                <input type="hidden" id="payment_completed" name="payment_completed" value="false" />
                
                {/* お名前 */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">お名前 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="山田 太郎"
                    required
                  />
                </div>
                
                {/* メールアドレス */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">メールアドレス <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="example@email.com"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">予約確認メールをお送りします</p>
                </div>
                
                {/* 電話番号 */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">電話番号 <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="090-1234-5678"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">当日連絡が取れる番号をご入力ください</p>
                </div>
                
                {/* 特別リクエスト */}
                <div>
                  <label htmlFor="special_requests" className="block text-sm font-medium text-gray-700 mb-1">特別リクエスト</label>
                  <textarea
                    id="special_requests"
                    name="special_requests"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="アレルギーや特別なご要望があればお知らせください"
                  ></textarea>
                </div>
                
                {/* 予約規約の同意 */}
                <div className="pt-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        required
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="terms" className="font-medium text-gray-700">
                        <span className="text-red-500">*</span> 予約規約に同意します
                      </label>
                      <p className="text-gray-500">
                        キャンセルポリシー、個人情報の取り扱い、その他の
                        <a href="#" className="text-primary-600 hover:underline">利用規約</a>
                        を確認し、同意します。
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* 送信ボタン */}
                <div className="pt-6">
                  <button
                    type="submit"
                    className="w-full py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    予約を確定する
                  </button>
                  <p className="mt-2 text-xs text-center text-gray-500">
                    確定後、確認メールをお送りします
                  </p>
                </div>
              </form>
            )}
          </PaymentWrapper>
        </div>
      </div>
    </div>
  );
} 