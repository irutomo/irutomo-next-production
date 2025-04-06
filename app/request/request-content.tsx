'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function RequestContent() {
  // フォームの状態を管理
  const [formData, setFormData] = useState({
    restaurantName: '',
    restaurantAddress: '',
    customerName: '',
    numberOfPeople: '',
    email: '',
    notes: ''
  });

  // エラー状態を管理
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // モーダル表示状態
  const [showModal, setShowModal] = useState(false);

  // 入力値の変更処理
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // エラーがあれば消去
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // フォーム送信処理
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // バリデーション
    const newErrors: Record<string, string> = {};
    
    // 必須フィールドのチェック
    const requiredFields = ['restaurantName', 'restaurantAddress', 'customerName', 'numberOfPeople', 'email'];
    requiredFields.forEach(field => {
      if (!formData[field as keyof typeof formData].trim()) {
        newErrors[field] = '必須項目です';
      }
    });
    
    // メールアドレスのバリデーション
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }
    
    setErrors(newErrors);
    
    // エラーがなければ送信成功とみなす
    if (Object.keys(newErrors).length === 0) {
      // 実際のAPIリクエストはここに実装
      // console.log('送信データ:', formData);
      
      // フォームリセット
      setFormData({
        restaurantName: '',
        restaurantAddress: '',
        customerName: '',
        numberOfPeople: '',
        email: '',
        notes: ''
      });
      
      // 成功モーダル表示
      setShowModal(true);
    }
  };

  // モーダルを閉じる
  const closeModal = () => {
    setShowModal(false);
  };

  // ホームに戻る
  const goHome = () => {
    // Next.jsではwindow.locationの代わりにRouter.pushを使用するのが望ましいが、
    // このシンプルな実装ではLinkコンポーネントを使用
  };

  return (
    <div className="max-w-md mx-auto bg-[#f9fafb] min-h-screen pb-20">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-white shadow-sm flex items-center p-4">
        <Link href="/" className="mr-3">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <h1 className="text-lg font-bold flex-1">リクエストフォーム</h1>
      </header>
      
      <div className="m-4">
        <div className="card bg-white p-6 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 mb-6">掲載店舗以外もリクエスト可能です。以下のフォームにご記入ください。</p>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="restaurantName" className="text-sm font-medium">
                予約したい食堂の名前 <span className="text-red-500">*</span>
              </label>
              <input
                id="restaurantName"
                name="restaurantName"
                placeholder="食堂名を入力してください"
                value={formData.restaurantName}
                onChange={handleChange}
                className={`w-full h-10 px-3 rounded-md border ${errors.restaurantName ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-100`}
              />
              {errors.restaurantName && (
                <p className="text-xs text-red-500">{errors.restaurantName}</p>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="restaurantAddress" className="text-sm font-medium">
                食堂の住所または食堂の電話番号 <span className="text-red-500">*</span>
              </label>
              <input
                id="restaurantAddress"
                name="restaurantAddress"
                placeholder="食堂の住所または電話番号を入力してください"
                value={formData.restaurantAddress}
                onChange={handleChange}
                className={`w-full h-10 px-3 rounded-md border ${errors.restaurantAddress ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-100`}
              />
              {errors.restaurantAddress && (
                <p className="text-xs text-red-500">{errors.restaurantAddress}</p>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="customerName" className="text-sm font-medium">
                予約者名 <span className="text-red-500">*</span>
              </label>
              <input
                id="customerName"
                name="customerName"
                placeholder="お名前を入力してください"
                value={formData.customerName}
                onChange={handleChange}
                className={`w-full h-10 px-3 rounded-md border ${errors.customerName ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-100`}
              />
              {errors.customerName && (
                <p className="text-xs text-red-500">{errors.customerName}</p>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="numberOfPeople" className="text-sm font-medium">
                予約人数 <span className="text-red-500">*</span>
              </label>
              <input
                id="numberOfPeople"
                name="numberOfPeople"
                type="number"
                min="1"
                placeholder="人数を入力してください"
                value={formData.numberOfPeople}
                onChange={handleChange}
                className={`w-full h-10 px-3 rounded-md border ${errors.numberOfPeople ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-100`}
              />
              {errors.numberOfPeople && (
                <p className="text-xs text-red-500">{errors.numberOfPeople}</p>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="メールアドレスを入力してください"
                value={formData.email}
                onChange={handleChange}
                className={`w-full h-10 px-3 rounded-md border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-100`}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="notes" className="text-sm font-medium">
                追加リクエスト（任意）
              </label>
              <textarea
                id="notes"
                name="notes"
                placeholder="追加リクエストがあれば入力してください"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-y"
              />
            </div>
            
            <button 
              type="submit"
              className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl mt-2 transition-all hover:bg-orange-400 active:scale-[0.99]"
            >
              リクエストを送信
            </button>
          </form>
        </div>
      </div>

      {/* 成功モーダル */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
            <button 
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={closeModal}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18"/>
                <path d="m6 6 12 12"/>
              </svg>
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Success!</h3>
              <p className="text-gray-600 mb-6">予約リクエストを受け付けました！予約成功メールをお待ちください。予約不可時も100%返金します👍</p>
              
              <Link href="/">
                <button className="w-full bg-teal-500 text-white font-bold py-3 rounded-xl transition-all hover:bg-teal-400 active:scale-[0.99]">
                  ホームに戻る
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 