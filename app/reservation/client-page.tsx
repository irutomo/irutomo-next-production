'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ReservationInput from './input/ReservationInput';

export default function ReservationClientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const restaurantId = searchParams?.get('restaurant') || undefined;

  const handleBack = () => {
    // 戻るボタンのロジック
    console.log('戻るボタンがクリックされました');
  };

  const handleComplete = () => {
    // 完了時のロジック
    console.log('予約が完了しました');
  };

  return (
    <ReservationInput 
      restaurantId={restaurantId} 
      language="ja"
      onBack={handleBack}
      onComplete={handleComplete}
    />
  );
} 