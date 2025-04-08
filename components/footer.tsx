'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/contexts/language-context';

// 多言語対応のテキスト
const translations = {
  ko: {
    tagline: '일본의 리얼함을 더 즐겁게 체험!\n일본 여행은 IRUTOMO!',
    companyInfo: '회사 정보',
    privacyPolicy: '개인정보 처리방침',
    commercialTransactionLaw: '특정상거래법에 기초한 표기',
    allRightsReserved: '모든 권리 보유'
  },
  ja: {
    tagline: '日本のリアルをもっと楽しく体験！\n日本旅行はIRUTOMO!',
    companyInfo: '会社情報',
    privacyPolicy: 'プライバシーポリシー',
    commercialTransactionLaw: '特定商取引法に基づく表記',
    allRightsReserved: 'All rights reserved.'
  }
};

export function Footer() {
  const { language } = useLanguage();
  const t = translations[language];
  
  return (
    <footer className="bg-white pt-8 pb-20 md:py-12 px-4 md:px-6 lg:px-8">
      <div className="md:flex md:justify-between md:items-start md:max-w-6xl md:mx-auto">
        <div className="md:max-w-sm">
          <div className="flex items-center mb-6">
            <Image src="/irulogo-hidariue.svg" alt="IRUTOMO" width={100} height={24} className="h-6 md:h-7 w-auto" />
          </div>
          <p className="text-sm text-gray-500 mb-6 whitespace-pre-line">
            {t.tagline}
          </p>
        </div>
        
        <div>
          <h3 className="font-medium text-sm mb-3 md:mb-4 hidden md:block">{t.companyInfo}</h3>
          <ul className="md:space-y-2">
            <li>
              <Link href="/privacy-policy" className="text-xs md:text-sm text-gray-500 hover:text-primary-500">
                {t.privacyPolicy}
              </Link>
            </li>
            <li>
              <Link href="/legal" className="text-xs md:text-sm text-gray-500 hover:text-primary-500">
                {t.commercialTransactionLaw}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="md:max-w-6xl md:mx-auto md:mt-12 md:pt-6 md:border-t md:border-gray-100">
        <div className="text-xs text-gray-400">
          &copy; 2025 IRUTOMO. {t.allRightsReserved}
        </div>
      </div>
    </footer>
  );
} 