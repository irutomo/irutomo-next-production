import type { Metadata } from 'next';
import RequestContent from './request-content';

export const metadata: Metadata = {
  title: '요청 양식 - 이루토모',
  description: '게재되지 않은 식당의 요청이 가능합니다. 이루토모에서는 한식당의 예약 요청을 받고 있습니다.',
};

export default function RequestPage() {
  return <RequestContent />;
} 