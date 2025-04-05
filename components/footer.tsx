import Link from 'next/link';

export function Footer() {
  return (
    <footer className="py-4 bg-white border-t md:py-8">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-sm text-gray-500">© 2024 韓国グルメ予約</p>
          </div>
          
          <div className="hidden md:flex space-x-6">
            <Link href="/privacy-policy" className="text-sm text-gray-500 hover:text-[#FFA500]">
              プライバシーポリシー
            </Link>
            <Link href="/terms" className="text-sm text-gray-500 hover:text-[#FFA500]">
              利用規約
            </Link>
            <Link href="/contact" className="text-sm text-gray-500 hover:text-[#FFA500]">
              お問い合わせ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 