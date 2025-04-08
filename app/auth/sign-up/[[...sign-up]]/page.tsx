import { SignUp } from '@clerk/nextjs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '新規登録 | IRUTOMO',
  description: 'IRUTOMOに新規登録して、レストラン体験を共有しましょう。',
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            IRUTOMOに登録
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            すでにアカウントをお持ちの方は{' '}
            <a href="/auth/sign-in" className="font-medium text-indigo-600 hover:text-indigo-500">
              こちらからログイン
            </a>
          </p>
        </div>

        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-orange-500 hover:bg-orange-600',
              card: 'rounded-lg shadow-md',
            },
          }}
          signInUrl="/auth/sign-in"
          redirectUrl="/dashboard" 
        />
      </div>
    </div>
  );
} 