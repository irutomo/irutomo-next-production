'use client';

import Link from 'next/link';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { JapanInfo } from '@/types/japan-info';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { CtaBanner } from '@/components/cta-banner';
// JapanInfoCardのインポートパスを修正しました
import JapanInfoCard from './japan-info-card';

// 多言語対応のテキスト
const translations = {
  ko: {
    title: '일본 여행 정보',
    pageTitle: '일본 여행 정보',
    backToHome: '홈으로 돌아가기',
    popular: '인기',
    notFound: '정보를 찾을 수 없습니다.',
    readMore: '자세히 보기',
    // Tag Filters
    all: '전부',
    summary: '정리',
    gourmet: '맛집',
    experience: '체험',
    accommodation: '숙박',
    transport: '교통',
    course: '추천 코스',
  },
  ja: {
    title: '日本観光情報',
    pageTitle: '日本観光情報',
    backToHome: 'ホームに戻る',
    popular: '人気',
    notFound: '情報が見つかりませんでした。',
    readMore: '詳細を見る',
    // Tag Filters
    all: '全て',
    summary: 'まとめ',
    gourmet: 'グルメ',
    experience: '体験',
    accommodation: '宿泊',
    transport: '交通',
    course: 'おすすめコース',
  }
};

// タグフィルターの定義
const tagFilters = [
  { key: 'all', labelKey: 'all' },
  { key: '정리', labelKey: 'summary' },
  { key: '맛집', labelKey: 'gourmet' },
  { key: '체험', labelKey: 'experience' },
  { key: '숙박', labelKey: 'accommodation' },
  { key: '교통', labelKey: 'transport' },
  { key: '추천 코스', labelKey: 'course' },
];

// クライアントコンポーネント
export default function JapanInfoClient({ japanInfoList }: { japanInfoList: JapanInfo[] }) {
  const { language } = useLanguage();
  const t = translations[language];
  
  const [activeTagFilterKey, setActiveTagFilterKey] = useState<string>('all');

  // Ref for scrollable containers
  const tagScrollRef = useRef<HTMLDivElement>(null);
  const popularScrollRef = useRef<HTMLDivElement>(null);

  // State for scroll button visibility
  const [showTagScrollLeft, setShowTagScrollLeft] = useState(false);
  const [showTagScrollRight, setShowTagScrollRight] = useState(true);
  const [showPopularScrollLeft, setShowPopularScrollLeft] = useState(false);
  const [showPopularScrollRight, setShowPopularScrollRight] = useState(true);

  // Scroll check function
  const checkScroll = (ref: React.RefObject<HTMLDivElement>, setLeft: (show: boolean) => void, setRight: (show: boolean) => void) => {
    const element = ref.current;
    if (element) {
      const { scrollLeft, scrollWidth, clientWidth } = element;
      setLeft(scrollLeft > 10); // 少し余裕を持たせる
      setRight(scrollWidth > clientWidth && scrollLeft < scrollWidth - clientWidth - 10); // 少し余裕を持たせる
    }
  };

  // Handle scroll events
  useEffect(() => {
    const tagElement = tagScrollRef.current;
    const popularElement = popularScrollRef.current;

    const handleTagScroll = () => checkScroll(tagScrollRef, setShowTagScrollLeft, setShowTagScrollRight);
    const handlePopularScroll = () => checkScroll(popularScrollRef, setShowPopularScrollLeft, setShowPopularScrollRight);

    if (tagElement) {
      tagElement.addEventListener('scroll', handleTagScroll);
      checkScroll(tagScrollRef, setShowTagScrollLeft, setShowTagScrollRight); // Initial check
    }
    if (popularElement) {
      popularElement.addEventListener('scroll', handlePopularScroll);
      checkScroll(popularScrollRef, setShowPopularScrollLeft, setShowPopularScrollRight); // Initial check
    }

    // Resize observer for dynamic content changes
    const observerCallback = () => {
      if (tagElement) checkScroll(tagScrollRef, setShowTagScrollLeft, setShowTagScrollRight);
      if (popularElement) checkScroll(popularScrollRef, setShowPopularScrollLeft, setShowPopularScrollRight);
    };
    const resizeObserver = new ResizeObserver(observerCallback);
    if (tagElement) resizeObserver.observe(tagElement);
    if (popularElement) resizeObserver.observe(popularElement);


    return () => {
      if (tagElement) tagElement.removeEventListener('scroll', handleTagScroll);
      if (popularElement) popularElement.removeEventListener('scroll', handlePopularScroll);
      resizeObserver.disconnect();
    };
  }, [japanInfoList]); // japanInfoListの変更でもチェック

  // Scroll handler function
  const handleScroll = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    const element = ref.current;
    if (element) {
      const scrollAmount = element.clientWidth * 0.8; // スクロール量を調整
      element.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };
  
  // 人気記事の取得
  const popularJapanInfo = useMemo(() => {
    return japanInfoList.filter(info => info.is_popular).slice(0, 5);
  }, [japanInfoList]);
  
  // タグでフィルタリングされた日本情報
  const filteredJapanInfo = useMemo(() => {
    if (activeTagFilterKey === 'all') {
      return japanInfoList;
    }
    return japanInfoList.filter(info => 
      info.tags?.some(tag => tag.toLowerCase() === activeTagFilterKey.toLowerCase())
    );
  }, [japanInfoList, activeTagFilterKey]);
  
  return (
    <main className="max-w-7xl mx-auto bg-[#F8F8F8] min-h-screen pb-20">
      {/* シンプルなヘッダー */}
      <header className="flex items-center p-4 bg-white sticky top-0 z-50 shadow-custom">
        <Link href="/" className="mr-4">
          <ArrowLeft className="h-6 w-6 text-gray-600" />
        </Link>
        <h1 className="text-xl font-bold text-[#FFA500]">{t.pageTitle}</h1>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* タグフィルター */}
        <div className="relative group">
          {showTagScrollLeft && (
            <button 
              onClick={() => handleScroll(tagScrollRef, 'left')} 
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/70 hover:bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
          )}
          <div ref={tagScrollRef} className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide px-8">
            {tagFilters.map((filter) => (
              <button 
                key={filter.key}
                className={`px-4 py-2 rounded-full text-sm ${
                  activeTagFilterKey === filter.key 
                    ? 'bg-gray-800 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } font-medium whitespace-nowrap transition-colors flex-shrink-0`}
                onClick={() => setActiveTagFilterKey(filter.key)}
              >
                # {t[filter.labelKey as keyof typeof t]}
              </button>
            ))}
          </div>
          {showTagScrollRight && (
             <button 
              onClick={() => handleScroll(tagScrollRef, 'right')} 
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/70 hover:bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          )}
        </div>

        {/* 週間人気記事セクション */}
        {popularJapanInfo.length > 0 && (
          <div className="mb-6 relative group">
            <h2 className="text-lg font-bold mb-4 text-gray-800">
              {language === 'ko' ? '주간 인기 콘텐츠🥇' : '週間人気コンテンツ🥇'}
            </h2>
            {showPopularScrollLeft && (
              <button 
                onClick={() => handleScroll(popularScrollRef, 'left')}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/70 hover:bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity mt-4"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
            )}
            <div ref={popularScrollRef} className="overflow-x-auto pb-4 scrollbar-hide">
              <div className="flex space-x-4 min-w-max">
                {popularJapanInfo.map((info) => (
                  <Link 
                    key={info.id} 
                    href={`/japan-info/${info.id}`} 
                    className="block w-64 flex-shrink-0"
                  >
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
                      <div className="relative h-40 w-full">
                        <img
                          src={info.image_url}
                          alt={language === 'ko' ? info.korean_title || info.title : info.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-[#FFA500] px-2 py-0.5 rounded-full text-xs text-white font-bold">
                          {t.popular}
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-sm line-clamp-2 mb-1">
                          {language === 'ko' ? info.korean_title || info.title : info.title}
                        </h3>
                        <div className="flex items-center text-xs text-gray-500">
                          <span>{info.published_at}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            {showPopularScrollRight && (
              <button 
                onClick={() => handleScroll(popularScrollRef, 'right')}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/70 hover:bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity mt-4"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            )}
          </div>
        )}
        
        {/* 日本情報カード一覧 */}
        <div className="space-y-6">
          {filteredJapanInfo.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJapanInfo.map((info) => (
                <JapanInfoCard
                  key={info.id}
                  japanInfo={info}
                  translations={{
                    popular: t.popular,
                    readMore: t.readMore
                  }}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">{t.notFound}</p>
          )}
        </div>
      </div>
    </main>
  );
}

// Helper CSS class to hide scrollbar (optional)
/*
Add this to your global CSS file (e.g., globals.css):

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;  
  scrollbar-width: none;  
}
*/ 