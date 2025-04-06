import type { Metadata } from 'next';
import RequestContent from './request-content';

export const metadata: Metadata = {
  title: 'リクエストフォーム - IRUTOMO',
  description: '掲載店舗以外のリクエストができます。IRUTOMOでは韓国料理店の予約リクエストを受け付けています。',
};

export default function RequestPage() {
  return <RequestContent />;
} 