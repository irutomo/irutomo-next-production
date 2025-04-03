import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="py-10 bg-white border-t">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <Link href="/" className="flex items-center justify-center md:justify-start">
              <Image 
                src="/irulogo-hidariue.svg" 
                alt="IRUTOMO" 
                width={120} 
                height={30} 
                className="h-auto"
              />
            </Link>
            <p className="text-sm text-gray-500 mt-2 text-center md:text-left">© 2025 IRUTOMO. All rights reserved.</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 md:gap-8">
            <Link href="/privacy" className="text-sm text-gray-600 hover:text-primary-500 text-center md:text-left">
              プライバシーポリシー
            </Link>
            <Link href="/terms" className="text-sm text-gray-600 hover:text-primary-500 text-center md:text-left">
              特定商取引法に基づく表記
            </Link>
            <Link href="/contact" className="text-sm text-gray-600 hover:text-primary-500 text-center md:text-left">
              お問い合わせ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 