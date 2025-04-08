import { SignIn } from '@clerk/nextjs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ログイン | IRUTOMO',
  description: 'IRUTOMOにログインして、レストラン体験を共有しましょう。',
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            IRUTOMOにログイン
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            アカウントをお持ちでない方は{' '}
            <a href="/auth/sign-up" className="font-medium text-indigo-600 hover:text-indigo-500">
              こちらから登録
            </a>
          </p>
        </div>

        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-orange-500 hover:bg-orange-600',
              card: 'rounded-lg shadow-md',
            },
          }}
          signUpUrl="/auth/sign-up"
          redirectUrl="/dashboard" 
        />
      </div>
    </div>
  );
} 