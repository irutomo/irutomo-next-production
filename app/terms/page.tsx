import type { Metadata } from 'next';
import TermsContent from './terms-content';

export const metadata: Metadata = {
  title: '특정 상거래법에 근거한 표기 - 이루토모',
  description: '이루토모의 특정 상거래법에 근거한 표기입니다. 판매업자 정보, 결제 방법, 배송 시기 등의 중요한 정보를 게재하고 있습니다.',
};

export default function TermsPage() {
  return <TermsContent />;
} 