import type { Metadata } from 'next';
import FaqContent from './faq-content';

export const metadata: Metadata = {
  title: 'よくある質問 - IRUTOMO',
  description: 'IRUTOMOサービスに関するよくある質問と回答をご紹介します。予約方法、キャンセルポリシーなど、お客様からのご質問にお答えします。',
};

export default function FaqPage() {
  return <FaqContent />;
} 