import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '예약 방법 - 이루토모',
  description: '이루토모 서비스 예약 방법을 자세히 설명합니다. 한국인을 위한 일본 여행 서비스, 이루토모의 사용법을 확인해 보세요!',
};

export default function HowToUseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 