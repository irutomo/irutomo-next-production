import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'サービス案内 | IRUTOMO',
  description: 'IRUTOMOサービスのご案内ページです。認証不要でサービスをご利用いただけます。',
};

export default async function SignInPage() {
  // 認証が不要になったので、メインページにリダイレクト
  redirect('/');
} 