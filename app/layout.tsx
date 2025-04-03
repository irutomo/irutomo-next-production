import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ClerkProvider } from '@clerk/nextjs';
import { jaJP } from '@clerk/localizations';

export const metadata: Metadata = {
  title: 'IRUTOMO - 日本の飲食店予約サービス',
  description: '日本の電話番号がなくても、簡単に飲食店の予約ができるサービスです。',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Clerkの公開キーを環境変数から取得
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY;
  
  return (
    <ClerkProvider publishableKey={publishableKey} localization={jaJP}>
      <html lang="ja">
        <head>
          <link
            href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Noto+Sans+KR:wght@400;500;700&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
} 