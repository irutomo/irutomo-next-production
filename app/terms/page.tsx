import type { Metadata } from 'next';
import TermsContent from './terms-content';

export const metadata: Metadata = {
  title: '특정상거래법에 기초한 표기 - 이루토모',
  description: '이루토모의 특정상거래법에 기초한 표기입니다. 판매업자 정보, 지불 방법, 인도 시기 등의 중요한 정보를 게재하고 있습니다.',
};

export default function TermsPage() {
  return <TermsContent />;
} 