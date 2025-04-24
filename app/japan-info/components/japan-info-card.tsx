import Link from 'next/link';
import Image from 'next/image';
import { JapanInfo } from '@/types/japan-info';
import { useLanguage } from '@/contexts/language-context';

// SVGアイコン
const MapPinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

interface JapanInfoCardProps {
  japanInfo: JapanInfo;
  translations: {
    popular: string;
    readMore: string;
  };
}

export default function JapanInfoCard({ japanInfo }: JapanInfoCardProps) {
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
        </div>

        <div className="p-3">
          <h3 className="font-bold text-base mb-1 text-gray-900 line-clamp-2">
            {language === 'ko' ? japanInfo.korean_title || japanInfo.title : japanInfo.title}
          </h3>
          
          {japanInfo.location && (
            <div className="flex items-center text-xs text-gray-500">
              <MapPinIcon className="w-3 h-3 mr-1" />
              <span className="truncate">
                {japanInfo.location}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
} 