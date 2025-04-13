import type { Metadata } from 'next';
import PrivacyPolicyContent from './privacy-policy-content';

export const metadata: Metadata = {
  title: '개인정보 처리방침 - 이루토모',
  description: '이루토모의 개인정보 처리방침입니다. 고객님의 개인정보 취급에 대해 설명하고 있습니다.',
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyContent />;
} 