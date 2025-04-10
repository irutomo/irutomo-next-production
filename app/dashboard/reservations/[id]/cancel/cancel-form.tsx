"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

interface CancelReservationFormProps {
  reservationId: string;
  restaurantName: string;
  reservationDate: string;
  reservationTime: string;
}

export default function CancelReservationForm({
  reservationId,
  restaurantName,
  reservationDate,
  reservationTime
}: CancelReservationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  
  const supabase = createClientComponentClient();
  
  // キャンセル理由のオプション
  const cancelReasons = [
    '予定が変更になった',
    '他の予約に変更した',
    '体調不良',
    'レストランの都合',
    'その他'
  ];
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!isConfirmed) {
      setError('キャンセルを確認するために、チェックボックスにチェックしてください。');
      return;
    }
    
    if (!cancelReason) {
      setError('キャンセル理由を選択してください。');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // 予約ステータスを更新
      const { error: updateError } = await supabase
        .from('reservations')
        .update({
          status: 'canceled',
          cancel_reason: cancelReason,
          updated_at: new Date().toISOString()
        })
        .eq('id', reservationId);
      
      if (updateError) {
        throw new Error(updateError.message);
      }
      
      // キャンセル完了後に予約詳細ページにリダイレクト
      router.push(`/dashboard/reservations/${reservationId}?canceled=true`);
    } catch (err) {
      console.error('予約キャンセルエラー:', err);
      setError('予約のキャンセル中にエラーが発生しました。しばらくしてからもう一度お試しください。');
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* キャンセル理由 */}
      <div>
        <label htmlFor="cancel-reason" className="block text-sm font-medium text-gray-700 mb-1">
          キャンセル理由 <span className="text-red-500">*</span>
        </label>
        <select
          id="cancel-reason"
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
          required
        >
          <option value="">キャンセル理由を選択してください</option>
          {cancelReasons.map((reason) => (
            <option key={reason} value={reason}>
              {reason}
            </option>
          ))}
        </select>
      </div>
      
      {/* 確認チェックボックス */}
      <div className="bg-gray-50 p-4 rounded-md">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="confirm"
              type="checkbox"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
              className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              required
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="confirm" className="font-medium text-gray-700">
              この予約をキャンセルすることを確認します
            </label>
            <p className="text-gray-500">
              {restaurantName}の{new Date(reservationDate).toLocaleDateString('ja-JP')} {reservationTime}の予約をキャンセルします。この操作は取り消せません。
            </p>
          </div>
        </div>
      </div>
      
      {/* エラーメッセージ */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {/* アクションボタン */}
      <div className="flex justify-end space-x-3">
        <Link
          href={`/dashboard/reservations/${reservationId}`}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          キャンセルせずに戻る
        </Link>
        
        <button
          type="submit"
          disabled={isSubmitting || !isConfirmed}
          className={`px-4 py-2 rounded-md text-white ${
            isSubmitting || !isConfirmed
              ? 'bg-red-300 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700'
          } transition-colors`}
        >
          {isSubmitting ? '処理中...' : '予約をキャンセルする'}
        </button>
      </div>
    </form>
  );
} 