import Link from 'next/link';
import Image from 'next/image';
import { JapanInfo } from '@/types/japan-info';
import { useLanguage } from '@/contexts/language-context';
import { MapPinIcon, EyeIcon } from 'lucide-react';

interface JapanInfoCardProps {
  japanInfo: JapanInfo;
  translations: {
    popular: string;
    readMore: string;
  };
}

export default function JapanInfoCard({ japanInfo, translations }: JapanInfoCardProps) {
  const { language } = useLanguage();

  return (
    <Link href={`/japan-info/${japanInfo.id}`} className="block group">
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 flex flex-col">
        <div className="relative w-full aspect-video">
          <Image
            src={japanInfo.image_url}
            alt={language === 'ko' ? japanInfo.korean_title || japanInfo.title : japanInfo.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {japanInfo.is_popular && (
            <div className="absolute top-2 left-2 bg-[#FFA500] px-2 py-0.5 rounded-full text-xs text-white font-bold">
              {translations.popular}
            </div>
          )}
        </div>

        <div className="p-3">
          <h3 className="font-bold text-base mb-1 text-gray-900 line-clamp-2">
            {language === 'ko' ? japanInfo.korean_title || japanInfo.title : japanInfo.title}
          </h3>
          
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            {japanInfo.views !== undefined && (
              <div className="flex items-center">
                <EyeIcon className="w-3 h-3 mr-1" />
                <span>{japanInfo.views} {language === 'ko' ? '조회' : '閲覧'}</span>
              </div>
            )}
            
            {japanInfo.location && (
              <div className="flex items-center">
                <MapPinIcon className="w-3 h-3 mr-1" />
                <span className="truncate">
                  {japanInfo.location}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
} 