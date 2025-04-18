import type { Metadata } from 'next';
import './globals.css';
import { GlobalHeader } from '@/components/ui/header';
import { Footer } from '@/components/footer';
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from '@/contexts/language-context';
import { ChannelTalk } from '@/components/channel-talk';
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  title: {
    default: '이루토모 - 한국인을 위한 일본 식당 예약 서비스',
    template: '%s | 이루토모',
  },
  description: '한국인을 위한 일본 식당 예약 서비스. 일본 현지인이 추천하는 맛집을 쉽게 예약하세요!',
  keywords: ['일본 식당', '예약', '맛집', '레스토랑', '일본 여행'],
  icons: {
    icon: '/favicons/favicon.png',
    shortcut: '/favicons/favicon.png',
    apple: '/favicons/favicon.png',
  },
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
  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Noto+Sans+KR:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex flex-col min-h-screen bg-gray-50">
        <LanguageProvider>
          <div className="flex flex-col min-h-screen max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto">
            <GlobalHeader />
            <main className="flex-grow">{children}</main>
            <Footer />
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
          <ChannelTalk 
            pluginKey="abaa78b2-9774-4cc7-9f35-e2d2b3327b0a" 
            accessSecret="914749c0acece8ec4d9854b70f1df609" 
          />
          <Analytics />
        </LanguageProvider>
      </body>
    </html>
  );
}