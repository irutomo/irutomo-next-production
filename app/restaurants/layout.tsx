import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '맛집 목록 | 이루토모 - 한국인을 위한 일본 식당 예약 서비스',
  description: '이루토모에 등록된 식당 목록입니다. 다양한 장르의 레스토랑 중에서 선택할 수 있습니다.',
};

export default function RestaurantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 