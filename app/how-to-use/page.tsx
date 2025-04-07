import type { Metadata } from 'next';
import HowToUseContent from './how-to-use-content';

export const metadata: Metadata = {
  title: '예약방법 - IRUTOMO',
  description: 'IRUTOMO 서비스 예약 방법을 자세히 설명합니다. 한국인을 위한 일본 여행 서비스, IRUTOMO의 사용법을 봐 주세요!',
};

export default function HowToUsePage() {
  return <HowToUseContent />;
} 