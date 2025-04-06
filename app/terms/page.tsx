import type { Metadata } from 'next';
import TermsContent from './terms-content';

export const metadata: Metadata = {
  title: '特定商取引法に基づく表記 - IRUTOMO',
  description: 'IRUTOMOの特定商取引法に基づく表記です。販売業者情報、支払方法、引き渡し時期などの重要な情報を掲載しています。',
};

export default function TermsPage() {
  return <TermsContent />;
} 