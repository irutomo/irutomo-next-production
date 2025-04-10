import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'サービス案内 | IRUTOMO',
  description: 'IRUTOMOサービスのご案内ページです。会員登録不要でお楽しみいただけます。',
};

export default async function SignUpPage() {
  // 認証が不要になったので、メインページにリダイレクト
  redirect('/');
} 