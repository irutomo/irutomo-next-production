import type { Metadata } from 'next';
import './globals.css';
import { GlobalHeader } from '@/components/ui/header';
import { Footer } from '@/components/footer';
import { ClerkProvider, ClerkLoaded, ClerkLoading } from '@clerk/nextjs';
import { jaJP } from '@clerk/localizations';
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from '@/contexts/language-context';
import { koKR } from '@clerk/localizations';

export const metadata: Metadata = {
  title: {
    default: 'イルトモ - 韓国グルメ予約サービス',
    template: '%s | イルトモ',
  },
  description: '韓国料理の美味しいお店を予約できるサービス。言葉の壁を超えて本場の韓国グルメを楽しもう！',
  keywords: ['韓国料理', '予約', 'グルメ', 'レストラン'],
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
  // Clerkの公開キーを環境変数から取得
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
        <ClerkProvider publishableKey={publishableKey} localization={koKR}>
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