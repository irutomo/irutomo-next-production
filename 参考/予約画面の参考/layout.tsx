import './globals.css';
import type { Metadata } from 'next';
import { LanguageProvider } from '@/contexts/LanguageContext';
import {
  ClerkProvider,
  SignedIn,
  UserButton,
} from '@clerk/nextjs';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '韓国グルメ予約サービス',
  description: '일본 현지인들로부터 인기 있는 식당 예약 서비스',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="ko">
        <head>
          <link
            href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap"
            rel="stylesheet"
          />
        </head>
        <body 
          style={{ 
            fontFamily: "'Noto Sans KR', sans-serif",
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          <header className="flex justify-end items-center p-4 gap-4 h-16">
            <SignedIn>
              <Link href="/mypage" className="flex items-center justify-center mr-2 text-gray-700 hover:text-gray-900">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </header>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}