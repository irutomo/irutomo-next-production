import Link from 'next/link';
import Image from 'next/image';
import { Button } from './ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b">
      <div className="container max-w-6xl mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center">
            <span className="font-bold text-2xl">
              <span className="text-primary-500">IRU</span>
              <span className="text-black">tomo</span>
            </span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center">
          <nav className="flex items-center rounded-full border border-gray-200 overflow-hidden">
            <Link href="/" className="bg-primary-500 text-white px-6 py-2 text-sm font-medium">
              ホーム
            </Link>
            <Link href="/service" className="px-6 py-2 text-sm font-medium text-gray-700">
              サービス紹介
            </Link>
            <Link href="/restaurants" className="px-6 py-2 text-sm font-medium text-gray-700">
              店舗情報
            </Link>
            <Link href="/reviews" className="px-6 py-2 text-sm font-medium text-gray-700">
              レビュー
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 text-sm font-medium text-gray-700">
            <svg width="16" height="16" viewBox="0 0 16 16" className="text-gray-400" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
              <path d="M10.5 8C10.5 9.38 9.38 10.5 8 10.5 6.62 10.5 5.5 9.38 5.5 8 5.5 6.62 6.62 5.5 8 5.5 9.38 5.5 10.5 6.62 10.5 8zM8 3.5C5.51 3.5 3.5 5.51 3.5 8 3.5 10.49 5.51 12.5 8 12.5 10.49 12.5 12.5 10.49 12.5 8 12.5 5.51 10.49 3.5 8 3.5z"/>
            </svg>
            teller
          </button>
          <button className="text-gray-700">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <line x1="4" y1="18" x2="20" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}