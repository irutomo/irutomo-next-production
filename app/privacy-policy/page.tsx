import type { Metadata } from 'next';
import PrivacyPolicyContent from './privacy-policy-content';

export const metadata: Metadata = {
  title: 'プライバシーポリシー - IRUTOMO',
  description: 'IRUTOMOのプライバシーポリシーです。お客様の個人情報の取り扱いについて説明しています。',
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyContent />;
} 