import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '자주 묻는 질문 - 이루토모',
  description: '이루토모 서비스에 관한 자주 묻는 질문과 답변을 소개합니다. 예약 방법, 취소 정책 등 고객님의 질문에 답변해 드립니다.',
};

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 