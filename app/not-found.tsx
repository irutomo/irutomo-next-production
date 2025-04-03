import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ページが見つかりません | IRUTOMO',
  description: 'お探しのページは見つかりませんでした。',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-16">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-primary-500 mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-4">ページが見つかりません</h2>
        <p className="text-gray-600 mb-8">お探しのページは存在しないか、移動した可能性があります。</p>
        
        <Link 
          href="/" 
          className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-md transition-colors inline-block font-medium"
        >
          ホームに戻る
        </Link>
      </div>
    </div>
  );
} 