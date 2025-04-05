'use client';

import React, { useState } from 'react';

interface RequestCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  partySize: number;
  language: 'ko' | 'ja' | 'en';
  restaurantId?: string;
}

const RequestCommentModal: React.FC<RequestCommentModalProps> = ({
  isOpen,
  onClose,
  partySize,
  language,
  restaurantId,
}) => {
  const [comment, setComment] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  if (!isOpen) return null;
  
  // 多言語対応のテキスト
  const texts = {
    title: language === 'ko' 
      ? '대규모 예약 요청' 
      : language === 'ja' 
      ? '大人数予約リクエスト' 
      : 'Large Group Reservation Request',
    description: language === 'ko'
      ? '13명 이상의 예약은 별도로 처리됩니다. 요청 사항을 입력해 주세요.'
      : language === 'ja'
      ? '13人以上のご予約は別途対応させていただきます。リクエスト内容をご入力ください。'
      : 'Reservations for 13 or more people are handled separately. Please enter your request details.',
    nameLabel: language === 'ko' ? '이름' : language === 'ja' ? 'お名前' : 'Name',
    emailLabel: language === 'ko' ? '이메일' : language === 'ja' ? 'メールアドレス' : 'Email',
    phoneLabel: language === 'ko' ? '전화번호' : language === 'ja' ? '電話番号' : 'Phone',
    commentLabel: language === 'ko' ? '요청 사항' : language === 'ja' ? 'リクエスト内容' : 'Request Details',
    submitButton: language === 'ko' ? '요청 보내기' : language === 'ja' ? 'リクエストを送信' : 'Send Request',
    cancelButton: language === 'ko' ? '취소' : language === 'ja' ? 'キャンセル' : 'Cancel',
    submitting: language === 'ko' ? '제출 중...' : language === 'ja' ? '送信中...' : 'Submitting...',
    thankYou: language === 'ko' 
      ? '요청해 주셔서 감사합니다. 곧 연락 드리겠습니다.' 
      : language === 'ja' 
      ? 'リクエストありがとうございます。まもなくご連絡いたします。' 
      : 'Thank you for your request. We will contact you soon.',
    closeButton: language === 'ko' ? '닫기' : language === 'ja' ? '閉じる' : 'Close',
  };
  
  // リクエスト送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment || !email || !name || !phone) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 実際の実装ではここにAPI呼び出しのコードが入ります
      console.log('リクエスト送信:', { name, email, phone, comment, partySize, restaurantId });
      
      // 送信成功を示すために少し待機
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitted(true);
    } catch (error) {
      console.error('リクエスト送信エラー:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {!submitted ? (
          <form onSubmit={handleSubmit} className="p-6">
            <h3 className="text-xl font-bold mb-2">{texts.title}</h3>
            <p className="text-gray-600 mb-4">{texts.description}</p>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">{texts.nameLabel}</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">{texts.emailLabel}</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">{texts.phoneLabel}</label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">{texts.commentLabel}</label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  rows={5}
                  required
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {texts.cancelButton}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? texts.submitting : texts.submitButton}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 text-center">
            <svg
              className="mx-auto h-12 w-12 text-green-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <h3 className="text-xl font-bold mb-2">{texts.title}</h3>
            <p className="text-gray-600 mb-6">{texts.thankYou}</p>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
            >
              {texts.closeButton}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestCommentModal; 