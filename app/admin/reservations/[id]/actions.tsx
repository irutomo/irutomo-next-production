'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

type ReservationActionsProps = {
  reservationId: string;
  currentStatus: string;
};

export default function ReservationActions({ 
  reservationId, 
  currentStatus 
}: ReservationActionsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  const updateStatus = async (newStatus: string, cancelReason?: string) => {
    setIsUpdating(true);
    
    try {
      const updateData: any = { status: newStatus };
      
      if (cancelReason) {
        updateData.cancel_reason = cancelReason;
      }
      
      const { error } = await supabase
        .from('reservations')
        .update(updateData)
        .eq('id', reservationId);
      
      if (error) {
        throw error;
      }
      
      alert(getSuccessMessage(newStatus));
      router.refresh(); // ページを更新して最新のデータを表示
      
    } catch (err) {
      console.error('更新エラー:', err);
      alert('予約ステータスの更新に失敗しました');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleConfirm = () => updateStatus('confirmed');
  const handleComplete = () => updateStatus('completed');
  
  const handleCancel = () => {
    const reason = prompt('キャンセル理由を入力してください:');
    if (reason !== null) {
      updateStatus('canceled', reason);
    }
  };
  
  const getSuccessMessage = (status: string) => {
    switch (status) {
      case 'confirmed': return '予約を確認済みに更新しました';
      case 'completed': return '予約を完了に更新しました';
      case 'canceled': return '予約をキャンセルしました';
      default: return '予約ステータスを更新しました';
    }
  };
  
  if (isUpdating) {
    return (
      <div className="px-6 py-4 bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mr-3"></div>
        <span>更新中...</span>
      </div>
    );
  }
  
  return (
    <div className="px-6 py-4 bg-gray-50 flex flex-wrap justify-end gap-2">
      {currentStatus !== 'confirmed' && (
        <button 
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          onClick={handleConfirm}
        >
          予約確認
        </button>
      )}
      
      {currentStatus !== 'completed' && (
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          onClick={handleComplete}
        >
          完了にする
        </button>
      )}
      
      {currentStatus !== 'canceled' && (
        <button 
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          onClick={handleCancel}
        >
          キャンセル
        </button>
      )}
    </div>
  );
} 