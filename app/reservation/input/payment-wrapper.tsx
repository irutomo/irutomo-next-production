'use client';

import React, { useState } from 'react';
import PaymentModal from './payment-modal';

interface PaymentWrapperProps {
  children: (props: { showPaymentModal: () => void }) => React.ReactNode;
}

export default function PaymentWrapper({ children }: PaymentWrapperProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState(1000);
  const [reservationId, setReservationId] = useState<string | undefined>(undefined);

  const showPaymentModal = () => {
    // 支払い金額を取得
    const amountInput = document.getElementById('plan_amount') as HTMLInputElement;
    if (amountInput) {
      setAmount(Number(amountInput.value));
    }
    
    // 一時的な予約IDを生成（実際の実装ではデータベースから取得したIDを使用）
    setReservationId(`temp_${Math.random().toString(36).substring(2, 10)}`);
    
    // モーダルを表示
    setIsModalOpen(true);
  };
  
  const handlePaymentSuccess = (details: any) => {
    console.log('支払い成功:', details);
    
    // 支払い完了フラグを設定
    const paymentCompletedInput = document.getElementById('payment_completed') as HTMLInputElement;
    if (paymentCompletedInput) {
      paymentCompletedInput.value = 'true';
    }
    
    // モーダルを閉じる
    setTimeout(() => {
      setIsModalOpen(false);
      
      // フォームを送信
      const form = document.querySelector('form') as HTMLFormElement;
      if (form) {
        form.submit();
      }
    }, 1500);
  };
  
  const handlePaymentError = (error: Error) => {
    console.error('支払いエラー:', error);
    // エラー処理
  };
  
  const handlePaymentCancel = () => {
    console.log('支払いキャンセル');
    setIsModalOpen(false);
  };

  return (
    <>
      {children({ showPaymentModal })}
      
      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        amount={amount}
        currency="JPY"
        title="予約保証金のお支払い"
        description="プレミアム予約の席確保のための予約保証金です"
        reservationId={reservationId}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        onCancel={handlePaymentCancel}
      />
    </>
  );
} 