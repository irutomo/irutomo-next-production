'use client';

import { useState, FormEvent } from 'react';
import { BackHeader } from '@/components/ui/header';
import Link from 'next/link';

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
      {/* 共通ヘッダーコンポーネントを使用 */}
      <BackHeader title="リクエストフォーム" backUrl="/" />
      
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-11/12 max-w-md">
            <h2 className="text-xl font-bold mb-4">リクエストを送信しました</h2>
            <p className="mb-6">内容を確認次第、メールにてご連絡いたします。</p>
            <div className="flex justify-between">
              <button 
                onClick={closeModal}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
              >
                閉じる
              </button>
              <Link href="/">
                <div className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                  ホームに戻る
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 