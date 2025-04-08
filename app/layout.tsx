import type { Metadata } from 'next';
import './globals.css';
import { GlobalHeader } from '@/components/ui/header';
import { Footer } from '@/components/footer';
import { ClerkProvider, ClerkLoaded, ClerkLoading } from '@clerk/nextjs';
import { jaJP } from '@clerk/localizations';
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from '@/contexts/language-context';

export const metadata: Metadata = {
  title: {
    default: '이루토모 - 한국인을 위한 일본 식당 예약 서비스',
    template: '%s | 이루토모',
  },
  description: '한국인을 위한 일본 식당 예약 서비스. 일본 현지인이 추천하는 맛집을 쉽게 예약하세요!',
  keywords: ['일본 식당', '예약', '맛집', '레스토랑', '일본 여행'],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Clerk의 공개 키를 환경 변수에서 가져오기
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY;
  
  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Noto+Sans+KR:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex flex-col min-h-screen bg-gray-50">
        <ClerkProvider 
          publishableKey={publishableKey} 
          localization={jaJP}
          appearance={{
            elements: {
              formButtonPrimary: 'bg-orange-500 hover:bg-orange-600',
              card: 'rounded-lg shadow-md',
              rootBox: 'w-full mx-auto'
            }
          }}
        >
          <LanguageProvider>
            <div className="flex flex-col min-h-screen max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto">
              <ClerkLoading>
                <div className="fixed inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 border-t-4 border-b-4 border-orange-500 rounded-full animate-spin"></div>
                </div>
              </ClerkLoading>
              <ClerkLoaded>
                <GlobalHeader />
                <main className="flex-grow">{children}</main>
                <Footer />
              </ClerkLoaded>
            </div>
            <Toaster 
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  style: {
                    background: 'green',
                    color: 'white',
                  },
                },
              }}
            />
          </LanguageProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}