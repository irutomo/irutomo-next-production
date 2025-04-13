import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: '서비스 안내 | 이루토모',
  description: '이루토모 서비스 안내 페이지입니다. 회원 가입 없이도 이용하실 수 있습니다.',
};

export default async function SignUpPage() {
  // 認証が不要になったので、メインページにリダイレクト
  redirect('/');
} 