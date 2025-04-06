import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="bg-white pt-8 pb-20 px-4">
      <div className="flex items-center mb-6">
        <Image src="/_img_IRUTOMO.svg" alt="IRUTOMO" width={100} height={24} className="h-6 w-auto" />
      </div>
      <p className="text-sm text-gray-500 mb-6">
        日本のリアルをもっと楽しく体験！<br />
        日本旅行はIRUTOMO!
      </p>
      <div className="mb-4 flex flex-wrap gap-x-4 text-xs text-gray-500">
        <Link href="/privacy-policy" className="hover:text-teal-400">
          プライバシーポリシー
        </Link>
        <Link href="/legal" className="hover:text-teal-400">
          特定商取引法に基づく表記
        </Link>
      </div>
      <div className="text-xs text-gray-400">
        © 2025 IRUTOMO. All rights reserved.
      </div>
    </footer>
  );
} 