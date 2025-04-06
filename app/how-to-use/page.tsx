import type { Metadata } from 'next';
import HowToUseContent from './how-to-use-content';

export const metadata: Metadata = {
  title: '予約方法 - IRUTOMO',
  description: 'IRUTOMOサービスの予約方法を詳しく説明します。韓国人のための日本旅行サービス、IRUTOMOの使い方をご覧ください。',
};

export default function HowToUsePage() {
  return <HowToUseContent />;
} 