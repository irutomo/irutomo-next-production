import { Suspense } from 'react';
import ReservationClientPage from './client-page';

export const metadata = {
  title: '予約 | IRUTOMO - 日本の飲食店予約サービス',
  description: 'IRUTOMOで簡単に飲食店を予約できます。予約内容を入力して、すぐに予約を確定させましょう。',
};

export default function ReservationPage() {
  return (
    <div className="py-8">
      <div className="container max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">ご予約</h1>
        
        <Suspense fallback={<div className="h-96 flex items-center justify-center">読み込み中...</div>}>
          <ReservationClientPage />
        </Suspense>
      </div>
    </div>
  );
} 