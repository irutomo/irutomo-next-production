import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '予約 | IRUTOMO - 日本の飲食店予約サービス',
  description: 'IRUTOMOで簡単に飲食店を予約できます。予約内容を入力して、すぐに予約を確定させましょう。',
};

// 予約内容入力フォームのコンポーネント
function ReservationForm({ restaurantId }: { restaurantId?: string }) {
  // Note: 実際の実装では、ここでfetch等を使用して選択されたレストランの情報を取得します
  const restaurantName = restaurantId ? 
    restaurantId === '1' ? '熟成肉と本格炭火焼肉 又三郎' : 
    restaurantId === '2' ? 'まほろば囲炉裏 心斎橋' : 
    restaurantId === '3' ? '焼鳥YAMATO' : '指定なし' : '指定なし';

  // 今日の日付を取得してフォーマット (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold">予約情報入力</h2>
      </div>
      
      <form className="p-6 space-y-6" action="/reservation/confirmation">
        {/* 店舗情報 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">店舗</label>
          {restaurantId ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{restaurantName}</p>
                <Link href={`/restaurants/${restaurantId}`} className="text-sm text-primary-500 hover:underline">
                  店舗詳細を見る
                </Link>
              </div>
              <Link href="/restaurants" className="text-sm text-gray-600 hover:text-gray-900">
                変更
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-gray-500">店舗が選択されていません</p>
              <Link href="/restaurants" className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md transition-colors text-sm">
                店舗を選択
              </Link>
            </div>
          )}
          {restaurantId && (
            <input type="hidden" name="restaurant_id" value={restaurantId} />
          )}
        </div>
        
        {/* 日付選択 */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">日付</label>
          <input
            type="date"
            id="date"
            name="date"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            min={today}
            required
          />
        </div>
        
        {/* 時間選択 */}
        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">時間</label>
          <select
            id="time"
            name="time"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            required
          >
            <option value="">選択してください</option>
            <option value="17:00">17:00</option>
            <option value="17:30">17:30</option>
            <option value="18:00">18:00</option>
            <option value="18:30">18:30</option>
            <option value="19:00">19:00</option>
            <option value="19:30">19:30</option>
            <option value="20:00">20:00</option>
            <option value="20:30">20:30</option>
            <option value="21:00">21:00</option>
            <option value="21:30">21:30</option>
          </select>
        </div>
        
        {/* 人数選択 */}
        <div>
          <label htmlFor="people" className="block text-sm font-medium text-gray-700 mb-1">人数</label>
          <select
            id="people"
            name="people"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            required
          >
            <option value="">選択してください</option>
            <option value="1">1人</option>
            <option value="2">2人</option>
            <option value="3">3人</option>
            <option value="4">4人</option>
            <option value="5">5人</option>
            <option value="6">6人</option>
            <option value="7">7人</option>
            <option value="8">8人</option>
            <option value="9">9人以上（要相談）</option>
          </select>
        </div>
        
        {/* コース・席選択 */}
        <div>
          <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">コース・席タイプ</label>
          <select
            id="course"
            name="course"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">選択してください（任意）</option>
            <option value="normal">席のみ（コースなし）</option>
            <option value="course_a">スタンダードコース - 4,000円</option>
            <option value="course_b">プレミアムコース - 6,000円</option>
            <option value="course_c">特選コース - 8,000円</option>
          </select>
        </div>
        
        {/* 席タイプ */}
        <div>
          <label htmlFor="seat" className="block text-sm font-medium text-gray-700 mb-1">希望席タイプ</label>
          <select
            id="seat"
            name="seat_type"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">選択してください（任意）</option>
            <option value="table">テーブル席</option>
            <option value="counter">カウンター席</option>
            <option value="private">個室</option>
            <option value="terrace">テラス席</option>
          </select>
          <p className="mt-1 text-sm text-gray-500">※希望に添えない場合があります</p>
        </div>
        
        {/* 予約者情報 */}
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-lg font-bold mb-4">予約者情報</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">お名前</label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="山田 太郎"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="example@email.com"
                required
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="090-1234-5678"
                required
              />
            </div>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">その他のリクエスト</label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="アレルギーや特別なご要望があればお知らせください"
              ></textarea>
            </div>
          </div>
        </div>
        
        {/* 注意事項 */}
        <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-600">
          <h4 className="font-medium mb-2">予約にあたっての注意事項</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>ご予約の確定後、確認メールをお送りします。</li>
            <li>ご予約時間を15分以上過ぎても連絡なくご来店されない場合、キャンセル扱いとなる場合があります。</li>
            <li>キャンセルは予約時間の3時間前までにお願いします。</li>
            <li>一部コースは前日までの予約が必要な場合があります。</li>
          </ul>
        </div>
        
        {/* 送信ボタン */}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            className="w-full sm:w-auto bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-8 rounded-md transition-colors"
          >
            予約を確定する
          </button>
        </div>
      </form>
    </div>
  );
}

export default async function ReservationPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // searchParamsを同期的に使用するためにawaitを付けるか、
  // 関数をasyncにする必要があります
  const currSearchParams = await searchParams;
  const restaurantId = currSearchParams?.restaurant as string | undefined;

  return (
    <div className="py-8">
      <div className="container max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">ご予約</h1>
        
        <Suspense fallback={<div className="h-96 flex items-center justify-center">読み込み中...</div>}>
          <ReservationForm restaurantId={restaurantId} />
        </Suspense>
      </div>
    </div>
  );
} 