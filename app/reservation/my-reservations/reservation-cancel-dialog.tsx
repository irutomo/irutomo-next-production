'use client';

import { useState } from 'react';

// キャンセルダイアログのプロパティ
interface ReservationCancelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  refundAmount: number;
  refundPercentage: number;
}

export default function ReservationCancelDialog({
  isOpen,
  onClose,
  onConfirm,
  refundAmount,
  refundPercentage
}: ReservationCancelDialogProps) {
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 確認ボタンクリック
  const handleConfirm = () => {
    setIsSubmitting(true);
    try {
      onConfirm(reason);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ダイアログが閉じるときに理由をクリア
  const handleClose = () => {
    setReason('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-center text-center mb-6">
          <div className="bg-red-100 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="ml-4 text-2xl font-bold text-gray-800">予約をキャンセルしますか？</h2>
        </div>
        
        <p className="text-center text-gray-600 mb-4">
          キャンセルすると、この予約は取り消されます。
        </p>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800 font-medium mb-2">返金について</p>
          <p className="text-green-700">
            キャンセル時、支払い金額の{refundPercentage}%（{refundAmount.toLocaleString()}円）が返金されます。
          </p>
        </div>
        
        <div className="mb-6">
          <label htmlFor="cancel-reason" className="block text-sm font-medium text-gray-700 mb-2">
            キャンセル理由（任意）
          </label>
          <textarea
            id="cancel-reason"
            className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            rows={3}
            placeholder="キャンセルの理由を入力してください"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          ></textarea>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200"
            disabled={isSubmitting}
          >
            戻る
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2.5 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'キャンセル中...' : 'キャンセルする'}
          </button>
        </div>
      </div>
    </div>
  );
} 