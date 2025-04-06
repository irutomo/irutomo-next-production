import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="bg-white pt-8 pb-20 md:py-12 px-4 md:px-6 lg:px-8">
      <div className="md:flex md:justify-between md:items-start md:max-w-6xl md:mx-auto">
        <div className="md:max-w-sm">
          <div className="flex items-center mb-6">
            <Image src="/_img_IRUTOMO.svg" alt="IRUTOMO" width={100} height={24} className="h-6 md:h-7 w-auto" />
          </div>
          <p className="text-sm text-gray-500 mb-6">
            日本のリアルをもっと楽しく体験！<br />
            日本旅行はIRUTOMO!
          </p>
        </div>
        
        <div className="md:flex md:space-x-12 lg:space-x-24">
          <div className="mb-6 md:mb-0">
            <h3 className="font-medium text-sm mb-3 md:mb-4 hidden md:block">サービス</h3>
            <ul className="md:space-y-2">
              <li>
                <Link href="/restaurants" className="text-xs md:text-sm text-gray-500 hover:text-primary-500">
                  レストラン一覧
                </Link>
              </li>
              <li>
                <Link href="/how-to-use" className="text-xs md:text-sm text-gray-500 hover:text-primary-500">
                  使い方ガイド
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-sm mb-3 md:mb-4 hidden md:block">会社情報</h3>
            <ul className="md:space-y-2">
              <li>
                <Link href="/privacy-policy" className="text-xs md:text-sm text-gray-500 hover:text-primary-500">
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link href="/legal" className="text-xs md:text-sm text-gray-500 hover:text-primary-500">
                  特定商取引法に基づく表記
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="md:max-w-6xl md:mx-auto md:mt-12 md:pt-6 md:border-t md:border-gray-100">
        <div className="text-xs text-gray-400">
          © 2025 IRUTOMO. All rights reserved.
        </div>
      </div>
    </footer>
  );
} 