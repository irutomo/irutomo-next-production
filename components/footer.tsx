import Link from 'next/link';

export function Footer() {
  return (
    <footer className="py-10 bg-white border-t">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <Link href="/" className="flex items-center">
              <span className="font-bold text-2xl">
                <span className="text-primary-500">IRU</span>
                <span className="text-black">tomo</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 mt-2">© 2025 IRUTOMO. All rights reserved.</p>
          </div>
          
          <div className="flex gap-8">
            <Link href="/privacy" className="text-sm text-gray-600 hover:text-primary-500">
              プライバシーポリシー
            </Link>
            <Link href="/terms" className="text-sm text-gray-600 hover:text-primary-500">
              特定商取引法に基づく表記
            </Link>
            <Link href="/contact" className="text-sm text-gray-600 hover:text-primary-500">
              お問い合わせ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 