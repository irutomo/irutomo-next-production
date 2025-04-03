import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'レビューを書く | IRUTOMO - 日本の飲食店予約サービス',
  description: 'IRUTOMOで利用した日本の飲食店の体験をシェアしましょう。あなたのレビューが他の利用者の参考になります。',
};

export default function WriteReviewPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ページタイトル */}
      <div className="bg-primary-50 py-12 border-b">
        <div className="container max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center text-primary-700">レビューを書く</h1>
          <p className="text-center text-primary-600 mt-3">あなたの体験をシェアしましょう</p>
        </div>
      </div>

      {/* フォーム */}
      <section className="py-12">
        <div className="container max-w-3xl mx-auto px-4">
          <form className="space-y-8">
            {/* ステップ1: 訪問したレストラン */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-primary-700">ステップ1: 訪問したレストラン</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="restaurant" className="block text-sm font-medium text-gray-700 mb-1">レストラン名 *</label>
                  <input 
                    type="text" 
                    id="restaurant" 
                    className="w-full rounded-lg border border-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="訪問したレストラン名を入力してください"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="visitDate" className="block text-sm font-medium text-gray-700 mb-1">訪問日 *</label>
                  <input 
                    type="date" 
                    id="visitDate" 
                    className="w-full rounded-lg border border-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="cuisine" className="block text-sm font-medium text-gray-700 mb-1">料理の種類</label>
                  <select 
                    id="cuisine" 
                    className="w-full rounded-lg border border-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">選択してください</option>
                    <option value="japanese">和食</option>
                    <option value="sushi">寿司</option>
                    <option value="yakiniku">焼肉</option>
                    <option value="ramen">ラーメン</option>
                    <option value="izakaya">居酒屋</option>
                    <option value="other">その他</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* ステップ2: 評価 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-primary-700">ステップ2: 評価</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">総合評価 *</label>
                  <div className="flex space-x-4">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <label key={rating} className="flex flex-col items-center cursor-pointer">
                        <input 
                          type="radio" 
                          name="rating" 
                          value={rating} 
                          className="sr-only" 
                          required
                        />
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 border-gray-200 hover:border-primary-500 peer-checked:bg-primary-500 peer-checked:text-white peer-checked:border-primary-500">
                          {rating}
                        </div>
                        <span className="mt-1 text-sm text-gray-500">
                          {rating === 1 && '不満'}
                          {rating === 2 && 'やや不満'}
                          {rating === 3 && '普通'}
                          {rating === 4 && '満足'}
                          {rating === 5 && '大満足'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-1">レビュー内容 *</label>
                  <textarea 
                    id="review" 
                    rows={6} 
                    className="w-full rounded-lg border border-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="料理の味、サービス、雰囲気など、あなたの体験を共有してください。"
                    required
                  ></textarea>
                  <p className="text-sm text-gray-500 mt-1">最低50文字、最大1000文字</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">タグ（最大3つ）</label>
                  <div className="flex flex-wrap gap-2">
                    {['コスパが良い', '雰囲気が良い', 'サービスが良い', '料理が美味しい', '接待におすすめ', 'デートにおすすめ', '家族向け', '個人経営', 'リピート決定'].map((tag) => (
                      <label key={tag} className="flex items-center space-x-2 border border-gray-200 rounded-full px-3 py-1.5 cursor-pointer hover:bg-primary-50">
                        <input type="checkbox" name="tags" value={tag} className="h-4 w-4 text-primary-500 focus:ring-primary-500" />
                        <span className="text-sm">{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* ステップ3: 写真 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-primary-700">ステップ3: 写真を追加（任意）</h2>
              
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input 
                    type="file" 
                    id="photo" 
                    className="hidden" 
                    accept="image/*" 
                    multiple 
                  />
                  <label htmlFor="photo" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-primary-600 font-medium">クリックして写真をアップロード</p>
                      <p className="text-sm text-gray-500 mt-1">または、ここにドラッグ&ドロップしてください</p>
                      <p className="text-xs text-gray-500 mt-3">JPG、PNGファイル、最大5MBまで</p>
                    </div>
                  </label>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                  {/* 写真のプレビューがここに表示される（実際の実装では追加が必要） */}
                </div>
              </div>
            </div>
            
            {/* 利用規約 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input 
                    id="terms" 
                    type="checkbox" 
                    className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                    required
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="font-medium text-gray-700">レビュー利用規約に同意します *</label>
                  <p className="text-gray-500">
                    投稿したレビューはIRUTOMOサービス内で公開され、マーケティング目的で使用される場合があります。
                    <Link href="/terms" className="text-primary-600 hover:text-primary-700 ml-1">
                      規約の全文を読む
                    </Link>
                  </p>
                </div>
              </div>
            </div>
            
            {/* 送信ボタン */}
            <div className="flex justify-center">
              <button 
                type="submit" 
                className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-md transition-colors font-medium shadow-md hover:shadow-lg"
              >
                レビューを投稿する
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
} 